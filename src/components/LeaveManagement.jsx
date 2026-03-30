import { useState } from 'react';
import { CheckCircle, XCircle, Download, Printer, Plus, HeartPulse, Pencil, Trash2 } from 'lucide-react';
import { LEAVES, LEAVE_CATEGORY_CONFIG, HEALTH_CHECKS, HEALTH_STATUS_CONFIG, THAI_PUBLIC_HOLIDAYS } from '../data/sampleData';
import { exportToExcel, printTable } from '../utils/exportUtils';
import { AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { useMembers } from '../context/MembersContext';

const STATUS_LABELS = { approved: '✅ อนุมัติ', pending: '⏳ รออนุมัติ', rejected: '❌ ไม่อนุมัติ' };
const STATUS_COLORS = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function LeaveManagement() {
  const { members } = useMembers();
  const activeMembers = members.filter(m => (m.employmentStatus || 'active') !== 'resigned');
  const [tab, setTab] = useState('leave');
  const [leaves, setLeaves] = useLocalStorage('paperless_leaves', LEAVES);
  const [filter, setFilter] = useState('all');
  const [leaveYear, setLeaveYear] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ staffId: '', startDate: '', endDate: '', days: 1, category: 'vacation', type: 'ลาพักร้อน', details: '', substitute: '' });
  // Health check state
  const [checks, setChecks] = useLocalStorage('paperless_health_checks', HEALTH_CHECKS);
  const [healthYear, setHealthYear] = useState(new Date().getFullYear());

  const handleHealthStatusChange = (staffId, year, status) => {
    setChecks(prev => prev.map(h => (h.staffId === staffId && h.year === year) ? { ...h, status } : h));
  };

  const handleHealthDateChange = (staffId, year, date) => {
    setChecks(prev => prev.map(h => (h.staffId === staffId && h.year === year) ? { ...h, date } : h));
  };

  const handleAddHealthYear = (year) => {
    const existing = new Set(checks.filter(h => h.year === year).map(h => h.staffId));
    const newRecords = activeMembers
      .filter(m => !existing.has(m.code))
      .map(m => ({ staffId: m.code, year, status: 'pending', date: null, doc: null, remark: '' }));
    if (newRecords.length > 0) setChecks(prev => [...prev, ...newRecords]);
  };

  const handleHealthExport = () => {
    const data = checks.map(h => {
      const member = members.find(t => t.code === h.staffId);
      return {
        'รหัส': h.staffId, 'ชื่อ': member?.name, 'ตำแหน่ง': member?.role,
        'ปี': h.year, 'สถานะ': HEALTH_STATUS_CONFIG[h.status]?.label,
        'วันที่ตรวจ': h.date || '—', 'หมายเหตุ': h.remark,
      };
    });
    exportToExcel(data, 'สุขภาพประจำปี_Paperless');
  };

  const leaveYears = ['all', ...[...new Set(leaves.map(l => l.startDate?.slice(0,4)).filter(Boolean))].sort((a,b) => b-a)];
  const filtered = leaves.filter(l => {
    const matchStatus = filter === 'all' || l.status === filter;
    const matchYear = leaveYear === 'all' || l.startDate?.startsWith(leaveYear);
    return matchStatus && matchYear;
  });

  const healthYears = [...new Set(checks.map(h => h.year))].sort((a,b) => a-b);
  const filteredChecks = checks.filter(h => h.year === healthYear);

  const EMPTY_FORM = { staffId: '', startDate: '', endDate: '', days: 1, category: 'vacation', type: 'ลาพักร้อน', details: '', substitute: '' };

  const openEditLeave = (leave) => {
    setForm({
      staffId: leave.staffId,
      startDate: leave.startDate,
      endDate: leave.endDate,
      days: leave.days,
      category: leave.category,
      type: leave.type,
      details: leave.details || '',
      substitute: leave.substitute || '',
      holidayName: leave.holidayName || '',
    });
    setEditMode(true);
    setEditingId(leave.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('ต้องการลบรายการลานี้ใช่ไหม?')) return;
    setLeaves(prev => prev.filter(l => l.id !== id));
  };

  const handleApprove = (id) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved', approvedBy: 'T001' } : l));
  };

  const handleReject = (id) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected', approvedBy: 'T001' } : l));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    const member = members.find(t => t.code === form.staffId);
    if (!member) return;
    if (editMode) {
      setLeaves(prev => prev.map(l => l.id === editingId
        ? { ...l, ...form, staffName: member.name }
        : l
      ));
    } else {
      setLeaves(prev => [...prev, {
        id: `L${Date.now()}`,
        ...form,
        staffName: member.name,
        status: 'pending',
        approvedBy: '',
        remark: '',
      }]);
    }
    closeForm();
  };

  const handleExport = () => {
    const data = filtered.map(l => ({
      'รหัสการลา': l.id,
      'ชื่อพนักงาน': l.staffName,
      'วันที่เริ่ม': l.startDate,
      'วันที่สิ้นสุด': l.endDate,
      'จำนวนวัน': l.days,
      'ประเภท': l.type,
      'รายละเอียด': l.details,
      'ผู้ปฏิบัติงานแทน': l.substitute || '—',
      'สถานะ': STATUS_LABELS[l.status],
      'อนุมัติโดย': l.approvedBy,
      'หมายเหตุ': l.remark,
    }));
    exportToExcel(data, 'การลา_Paperless');
  };

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  const hCompleted = filteredChecks.filter(h => h.status === 'completed').length;
  const hPending = filteredChecks.filter(h => h.status === 'pending').length;
  const hNotDone = filteredChecks.filter(h => h.status === 'not_done').length;
  const hPct = filteredChecks.length ? Math.round((hCompleted / filteredChecks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-5">
      {/* Page Header with Tab switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {tab === 'leave' ? 'การลา' : 'สุขภาพประจำปี'}
          </h1>
          <p className="text-slate-500 text-sm">
            {tab === 'leave'
              ? <>รออนุมัติ <span className="text-yellow-600 font-medium">{pendingCount}</span> รายการ</>
              : `ตรวจสุขภาพประจำปี ${healthYear} — ทีมงาน`}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Tab toggle */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setTab('leave')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${tab === 'leave' ? 'bg-white shadow-sm font-medium text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              การลา {pendingCount > 0 && <span className="ml-1 bg-yellow-400 text-white text-xs rounded-full px-1.5">{pendingCount}</span>}
            </button>
            <button onClick={() => setTab('health')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-md transition-colors ${tab === 'health' ? 'bg-white shadow-sm font-medium text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              <HeartPulse size={14} /> สุขภาพประจำปี {hNotDone > 0 && <span className="ml-1 bg-red-400 text-white text-xs rounded-full px-1.5">{hNotDone}</span>}
            </button>
          </div>
          {tab === 'leave' ? (
            <>
              <button onClick={() => printTable('leave-table')} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                <Printer size={16} /> พิมพ์
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                <Download size={16} /> Excel
              </button>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus size={16} /> ขอลา
              </button>
            </>
          ) : (
            <>
              <button onClick={() => printTable('health-table')} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                <Printer size={16} /> พิมพ์
              </button>
              <button onClick={handleHealthExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                <Download size={16} /> Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== HEALTH TAB ===== */}
      {tab === 'health' && (
        <div className="space-y-5">
          {/* Year switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setHealthYear(y => y - 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">‹</button>
            <span className="text-sm font-semibold text-slate-700 min-w-16 text-center">ปี {healthYear}</span>
            <button onClick={() => setHealthYear(y => y + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">›</button>
            <select value={healthYear} onChange={e => setHealthYear(Number(e.target.value))}
              className="ml-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
              {healthYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={() => handleAddHealthYear(healthYear)}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus size={14} /> เพิ่มรายชื่อปี {healthYear}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center">
              <div className="text-4xl font-bold text-blue-600">{hPct}%</div>
              <div className="text-sm text-slate-500 mt-1">ตรวจแล้ว</div>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${hPct}%` }} />
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-5 shadow-sm border border-green-100 text-center">
              <div className="text-3xl font-bold text-green-600">{hCompleted}</div>
              <div className="text-sm text-green-700 mt-1">✅ ตรวจแล้ว</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-5 shadow-sm border border-yellow-100 text-center">
              <div className="text-3xl font-bold text-yellow-600">{hPending}</div>
              <div className="text-sm text-yellow-700 mt-1">⏳ รอตรวจ</div>
            </div>
            <div className="bg-red-50 rounded-xl p-5 shadow-sm border border-red-100 text-center">
              <div className="text-3xl font-bold text-red-600">{hNotDone}</div>
              <div className="text-sm text-red-700 mt-1">❌ ยังไม่ตรวจ</div>
            </div>
          </div>
          {hNotDone > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 text-sm text-red-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span>มี <strong>{hNotDone}</strong> คนที่ยังไม่ตรวจสุขภาพประจำปี กรุณาติดตามด่วน</span>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table id="health-table" className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">พนักงาน</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">ตำแหน่ง</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">ปีที่ตรวจ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่ตรวจ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">หมายเหตุ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecks.map(h => {
                  const member = members.find(t => t.code === h.staffId);
                  return (
                    <tr key={`${h.staffId}-${h.year}`} className={`hover:bg-slate-50 transition-colors ${h.status === 'not_done' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{member?.name}</div>
                        <div className="text-xs text-slate-400">{member?.nickname}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{member?.role}</td>
                      <td className="px-4 py-3 text-slate-600">{h.year}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${HEALTH_STATUS_CONFIG[h.status]?.color}`}>
                          {HEALTH_STATUS_CONFIG[h.status]?.icon} {HEALTH_STATUS_CONFIG[h.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={h.date || ''}
                          onChange={e => handleHealthDateChange(h.staffId, h.year, e.target.value)}
                          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{h.remark || '—'}</td>
                      <td className="px-4 py-3">
                        <select value={h.status} onChange={e => handleHealthStatusChange(h.staffId, h.year, e.target.value)}
                          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="completed">ตรวจแล้ว</option>
                          <option value="pending">รอตรวจ</option>
                          <option value="not_done">ยังไม่ตรวจ</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== LEAVE TAB ===== */}
      {tab === 'leave' && <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {[['all', 'ทั้งหมด'], ['pending', 'รออนุมัติ'], ['approved', 'อนุมัติแล้ว'], ['rejected', 'ไม่อนุมัติ']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${filter === v ? 'bg-white shadow-sm font-medium text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              {l} {v === 'pending' && pendingCount > 0 && <span className="ml-1 bg-yellow-400 text-white text-xs rounded-full px-1.5">{pendingCount}</span>}
            </button>
          ))}
        </div>
        <select value={leaveYear} onChange={e => setLeaveYear(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
          {leaveYears.map(y => (
            <option key={y} value={y}>{y === 'all' ? 'ทุกปี' : `ปี ${y}`}</option>
          ))}
        </select>
      </div>

      {/* Leave Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['approved', 'pending', 'rejected'].map(s => (
          <div key={s} className={`rounded-xl p-4 ${STATUS_COLORS[s]}`}>
            <div className="text-2xl font-bold">{filtered.filter(l => l.status === s).length}</div>
            <div className="text-sm font-medium">{STATUS_LABELS[s]}</div>
          </div>
        ))}
        <div className="rounded-xl p-4 bg-blue-50 text-blue-700">
          <div className="text-2xl font-bold">{filtered.reduce((sum, l) => l.status !== 'rejected' ? sum + l.days : sum, 0)}</div>
          <div className="text-sm font-medium">วันลา{leaveYear === 'all' ? 'ทั้งหมด' : `ปี ${leaveYear}`}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table id="leave-table" className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">รหัส</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ประเภท</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่ลา</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">วัน</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">รายละเอียด</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ผู้ปฏิบัติงานแทน</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(leave => (
                <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{leave.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{leave.staffName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${LEAVE_CATEGORY_CONFIG[leave.category]?.color}`}>
                      {leave.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {leave.startDate} — {leave.endDate}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{leave.days}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-32 truncate">{leave.details}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{leave.substitute || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[leave.status]}`}>
                      {STATUS_LABELS[leave.status]}
                    </span>
                    {leave.remark && <div className="text-xs text-slate-400 mt-0.5">{leave.remark}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {leave.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(leave.id)}
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors" title="อนุมัติ">
                            <CheckCircle size={15} />
                          </button>
                          <button onClick={() => handleReject(leave.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="ไม่อนุมัติ">
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                      <button onClick={() => openEditLeave(leave)}
                        className="p-1.5 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors" title="แก้ไข">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(leave.id)}
                        className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="ลบ">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Calendar Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-700 mb-4">สรุปการลาต่อคน (ปี 2026)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {activeMembers.map(member => {
            const memberLeaves = leaves.filter(l => l.staffId === member.code && l.status !== 'rejected');
            const totalDays = memberLeaves.reduce((s, l) => s + l.days, 0);
            return (
              <div key={member.id} className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-700 text-sm">{member.nickname}</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{totalDays}</div>
                <div className="text-xs text-slate-400">วัน</div>
              </div>
            );
          })}
        </div>
      </div>

      </>}

      {/* Add/Edit Leave Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editMode ? 'แก้ไขการลา' : 'ขอลา'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">พนักงาน</label>
                <select value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">เลือกพนักงาน</option>
                  {activeMembers.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">วันที่เริ่ม</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">วันที่สิ้นสุด</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">ประเภทการลา</label>
                  <select value={form.category}
                    onChange={e => setForm({...form, category: e.target.value, type: LEAVE_CATEGORY_CONFIG[e.target.value]?.label || e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                    {Object.entries(LEAVE_CATEGORY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">จำนวนวัน</label>
                  <input type="number" min="1" value={form.days} onChange={e => setForm({...form, days: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                </div>
              </div>
              {form.category === 'holiday' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">วันหยุดนักขัตฤกษ์</label>
                  <select
                    value={form.holidayName || ''}
                    onChange={e => {
                      const h = THAI_PUBLIC_HOLIDAYS.find(x => x.name === e.target.value);
                      setForm({ ...form, holidayName: e.target.value, details: e.target.value,
                        startDate: h?.date || form.startDate, endDate: h?.date || form.endDate, days: 1 });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                    <option value="">— เลือกวันหยุด —</option>
                    {THAI_PUBLIC_HOLIDAYS.map(h => (
                      <option key={h.date} value={h.name}>{h.date} — {h.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">รายละเอียด</label>
                <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})}
                  rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">ผู้ปฏิบัติงานแทน</label>
                <select value={form.substitute} onChange={e => setForm({...form, substitute: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">— ไม่มีผู้ปฏิบัติงานแทน —</option>
                  {activeMembers.filter(m => m.code !== form.staffId).map(m => (
                    <option key={m.code} value={m.name}>{m.name} ({m.nickname})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={closeForm} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">ยกเลิก</button>
              <button onClick={handleSubmit} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                {editMode ? 'บันทึกการแก้ไข' : 'ส่งคำขอ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
