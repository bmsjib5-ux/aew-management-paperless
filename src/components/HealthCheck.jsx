import { useState } from 'react';
import { Download, Printer, Upload, AlertTriangle } from 'lucide-react';
import { HEALTH_CHECKS, TEAM_MEMBERS, HEALTH_STATUS_CONFIG } from '../data/sampleData';
import { exportToExcel, printTable } from '../utils/exportUtils';

export default function HealthCheck() {
  const [checks, setChecks] = useState(HEALTH_CHECKS);
  const [year] = useState(2025);

  const handleStatusChange = (staffId, status) => {
    setChecks(prev => prev.map(h => h.staffId === staffId ? { ...h, status } : h));
  };

  const handleExport = () => {
    const data = checks.map(h => {
      const member = TEAM_MEMBERS.find(t => t.code === h.staffId);
      return {
        'รหัส': h.staffId,
        'ชื่อ': member?.name,
        'ตำแหน่ง': member?.role,
        'ปี': h.year,
        'สถานะ': HEALTH_STATUS_CONFIG[h.status]?.label,
        'วันที่ตรวจ': h.date || '—',
        'เอกสาร': h.doc || '—',
        'หมายเหตุ': h.remark,
      };
    });
    exportToExcel(data, 'สุขภาพประจำปี_Paperless');
  };

  const completed = checks.filter(h => h.status === 'completed').length;
  const pending = checks.filter(h => h.status === 'pending').length;
  const notDone = checks.filter(h => h.status === 'not_done').length;
  const pct = Math.round((completed / checks.length) * 100);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สุขภาพประจำปี {year}</h1>
          <p className="text-slate-500 text-sm">ติดตามการตรวจสุขภาพของทีมงาน</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => printTable('health-table')} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Printer size={16} /> พิมพ์
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 md:col-span-1">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{pct}%</div>
            <div className="text-sm text-slate-500 mt-1">ตรวจแล้ว</div>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 shadow-sm border border-green-100 text-center">
          <div className="text-3xl font-bold text-green-600">{completed}</div>
          <div className="text-sm text-green-700 mt-1">✅ ตรวจแล้ว</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-5 shadow-sm border border-yellow-100 text-center">
          <div className="text-3xl font-bold text-yellow-600">{pending}</div>
          <div className="text-sm text-yellow-700 mt-1">⏳ รอตรวจ</div>
        </div>
        <div className="bg-red-50 rounded-xl p-5 shadow-sm border border-red-100 text-center">
          <div className="text-3xl font-bold text-red-600">{notDone}</div>
          <div className="text-sm text-red-700 mt-1">❌ ยังไม่ตรวจ</div>
        </div>
      </div>

      {/* Alert */}
      {notDone > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          <span>มี <strong>{notDone}</strong> คนที่ยังไม่ตรวจสุขภาพประจำปี กรุณาติดตามด่วน</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table id="health-table" className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">พนักงาน</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">ตำแหน่ง</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">ปีที่ตรวจ</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">สถานะ</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่ตรวจ</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">เอกสาร</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">หมายเหตุ</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {checks.map(h => {
              const member = TEAM_MEMBERS.find(t => t.code === h.staffId);
              return (
                <tr key={h.staffId} className={`hover:bg-slate-50 transition-colors ${h.status === 'not_done' ? 'bg-red-50/30' : ''}`}>
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
                  <td className="px-4 py-3 text-slate-600 text-xs">{h.date || '—'}</td>
                  <td className="px-4 py-3">
                    {h.doc ? (
                      <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Upload size={12} /> {h.doc}
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 border border-dashed border-slate-200 px-2 py-1 rounded">
                        <Upload size={12} /> อัปโหลด
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{h.remark || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={h.status}
                      onChange={e => handleStatusChange(h.staffId, e.target.value)}
                      className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
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
  );
}
