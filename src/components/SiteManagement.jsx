import { useState } from 'react';
import { Search, Download, Printer, ExternalLink, MapPin, Building2, AlertCircle } from 'lucide-react';
import { HOSPITALS, TEAM_MEMBERS, ISSUES, TASKS, SITE_STATUS_CONFIG, GOOGLE_SHEET_LINKS } from '../data/sampleData';
import { exportToExcel } from '../utils/exportUtils';
import { useInstallations } from '../context/InstallationsContext';

const MODULE_LABELS = { opd: 'OPD', ipd: 'IPD', lab: 'LAB', xray: 'X-Ray', billing: 'Billing', pharmacy: 'Pharmacy' };
const MODULE_COLORS = { done: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', pending: 'bg-slate-100 text-slate-400' };

export default function SiteManagement() {
  const { installations } = useInstallations();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = HOSPITALS.filter(h =>
    h.name.includes(search) || h.shortName.includes(search) || h.location.includes(search)
  );

  const handleExport = () => {
    const data = filtered.map(h => ({
      'รหัส Site': h.id,
      'ชื่อโรงพยาบาล': h.name,
      'จังหวัด': h.location,
      'ประเภท': h.type,
      'จำนวนเตียง': h.beds,
      'วัน Go-Live': h.goLiveDate,
      'สถานะ': SITE_STATUS_CONFIG[h.status]?.label,
      'ความคืบหน้า': h.progress + '%',
    }));
    exportToExcel(data, 'Site_Management');
  };

  const selectedSiteIssues = selected ? ISSUES.filter(i => i.siteId === selected.id) : [];
  const selectedSiteTasks = selected ? TASKS.filter(t => t.siteId === selected.id) : [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Site Management</h1>
          <p className="text-slate-500 text-sm">โรงพยาบาลทั้งหมด {HOSPITALS.length} แห่ง</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาโรงพยาบาล..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(h => {
          const team = TEAM_MEMBERS.filter(m => h.assignedTeam.includes(m.code));
          const openIssues = ISSUES.filter(i => i.siteId === h.id && i.status === 'open').length;
          return (
            <div
              key={h.id}
              onClick={() => setSelected(h)}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{h.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <MapPin size={10} /> {h.location}
                    <span className="mx-1">·</span>
                    <Building2 size={10} /> {h.type}
                    <span className="mx-1">·</span>
                    {h.beds} เตียง
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-2 ${SITE_STATUS_CONFIG[h.status]?.color}`}>
                  {SITE_STATUS_CONFIG[h.status]?.label}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">ความคืบหน้า</span>
                  <span className="font-medium text-slate-700">{h.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${h.progress >= 80 ? 'bg-green-500' : h.progress >= 40 ? 'bg-blue-500' : 'bg-yellow-400'}`}
                    style={{ width: `${h.progress}%` }} />
                </div>
              </div>

              {/* Modules */}
              <div className="flex flex-wrap gap-1 mb-3">
                {Object.entries(h.modules).map(([mod, stat]) => (
                  <span key={mod} className={`text-xs px-1.5 py-0.5 rounded ${MODULE_COLORS[stat]}`}>
                    {MODULE_LABELS[mod]}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-50">
                <div>Go-Live: <span className="font-medium text-slate-700">{h.goLiveDate}</span></div>
                <div className="flex items-center gap-2">
                  {openIssues > 0 && (
                    <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle size={10} /> {openIssues}
                    </span>
                  )}
                  <span>{team.length} คน</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Site Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selected.name}</h2>
                  <p className="text-slate-500 text-sm">{selected.location} · {selected.type} · {selected.beds} เตียง</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {GOOGLE_SHEET_LINKS[selected.id] && (
                    <a href={GOOGLE_SHEET_LINKS[selected.id]} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink size={12} /> Google Sheet
                    </a>
                  )}
                  {(() => {
                    const inst = installations.find(i => i.hospital === selected.name);
                    if (!inst) return null;
                    return [1, 2, 3].map(n => {
                      const label = inst[`sheetLabel${n}`];
                      const link  = inst[`sheetLink${n}`];
                      if (!link) return null;
                      return (
                        <a key={n} href={link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
                          onClick={e => e.stopPropagation()}>
                          <ExternalLink size={12} /> {label || `Sheet ${n}`}
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">ความคืบหน้าโดยรวม</span>
                  <span className="font-bold text-blue-600">{selected.progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selected.progress}%` }} />
                </div>
              </div>

              {/* Module Status */}
              <div>
                <h3 className="font-semibold text-slate-700 text-sm mb-3">สถานะ Module</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selected.modules).map(([mod, stat]) => (
                    <div key={mod} className={`text-center py-3 px-2 rounded-lg ${MODULE_COLORS[stat]}`}>
                      <div className="font-medium text-sm">{MODULE_LABELS[mod]}</div>
                      <div className="text-xs mt-0.5">{stat === 'done' ? '✅ เสร็จ' : stat === 'in_progress' ? '🔄 กำลังทำ' : '⏳ รอ'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team */}
              <div>
                <h3 className="font-semibold text-slate-700 text-sm mb-3">ทีมงานที่รับผิดชอบ</h3>
                <div className="flex flex-wrap gap-2">
                  {TEAM_MEMBERS.filter(m => selected.assignedTeam.includes(m.code)).map(m => (
                    <div key={m.code} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {m.name} <span className="text-slate-400">({m.role})</span>
                    </div>
                  ))}
                  {selected.assignedTeam.length === 0 && <span className="text-slate-400 text-sm">ยังไม่มีการมอบหมายทีม</span>}
                </div>
              </div>

              {/* Tasks */}
              {selectedSiteTasks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-700 text-sm mb-3">Tasks</h3>
                  <div className="space-y-2">
                    {selectedSiteTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'done' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                        <span className="flex-1 text-slate-700">{task.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority === 'critical' ? 'bg-red-100 text-red-600' : task.priority === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-slate-400">{task.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {selectedSiteIssues.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-700 text-sm mb-3">Issues ({selectedSiteIssues.filter(i=>i.status==='open').length} เปิดอยู่)</h3>
                  <div className="space-y-2">
                    {selectedSiteIssues.map(issue => (
                      <div key={issue.id} className={`p-3 rounded-lg text-sm ${issue.severity === 'critical' ? 'bg-red-50 border border-red-100' : issue.severity === 'high' ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${issue.severity === 'critical' ? 'bg-red-500 text-white' : issue.severity === 'high' ? 'bg-orange-500 text-white' : 'bg-slate-400 text-white'}`}>
                            {issue.severity}
                          </span>
                          <span className="font-medium text-slate-700">{issue.title}</span>
                          <span className={`ml-auto text-xs ${issue.status === 'resolved' ? 'text-green-600' : 'text-red-600'}`}>
                            {issue.status === 'resolved' ? '✅ แก้ไขแล้ว' : '🔴 เปิดอยู่'}
                          </span>
                        </div>
                        {issue.remark && <p className="text-xs text-slate-500 mt-1">{issue.remark}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setSelected(null)} className="w-full py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
