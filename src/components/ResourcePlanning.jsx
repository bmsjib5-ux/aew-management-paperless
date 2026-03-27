import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { LEAVES, STATUS_CONFIG, ROLE_CONFIG } from '../data/sampleData';
import { exportToExcel } from '../utils/exportUtils';
import { useMembers } from '../context/MembersContext';

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function isOnLeave(staffCode, dateStr, leaves) {
  return leaves.some(l =>
    l.staffId === staffCode &&
    l.status !== 'rejected' &&
    l.startDate <= dateStr &&
    l.endDate >= dateStr
  );
}

function isOnSite(member) {
  return member.status === 'on_site';
}

export default function ResourcePlanning() {
  const { members } = useMembers();
  const activeMembers = members.filter(m => (m.employmentStatus || 'active') !== 'resigned');

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [roleFilter, setRoleFilter] = useState('ทั้งหมด');

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const daysInMonth = getDaysInMonth(year, month);

  const roles = ['ทั้งหมด', ...new Set(activeMembers.map(m => m.role).filter(Boolean))];
  const filtered = roleFilter === 'ทั้งหมด' ? activeMembers : activeMembers.filter(m => m.role === roleFilter);

  const getDayStatus = (member, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (isOnLeave(member.code, dateStr, LEAVES)) return 'leave';
    if (isOnSite(member)) return 'on_site';
    return 'available';
  };

  const DAY_COLORS = {
    leave: 'bg-yellow-200 text-yellow-800',
    on_site: 'bg-blue-200 text-blue-800',
    available: 'bg-green-100 text-green-700',
  };

  const handleExport = () => {
    const rows = [];
    filtered.forEach(m => {
      const row = { 'ชื่อ': m.name, 'ตำแหน่ง': m.role };
      for (let d = 1; d <= daysInMonth; d++) {
        const status = getDayStatus(m, d);
        row[`วันที่ ${d}`] = status === 'leave' ? 'ลา' : status === 'on_site' ? 'ประจำ Site' : 'ว่าง';
      }
      rows.push(row);
    });
    exportToExcel(rows, `Resource_${MONTHS_TH[month]}_${year}`);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resource Planning</h1>
          <p className="text-slate-500 text-sm">ปฏิทินความพร้อมของทีมงาน</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
          <Download size={16} /> Excel
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={18} /></button>
          <span className="font-semibold text-slate-800 text-lg">{MONTHS_TH[month]} {year + 543}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={18} /></button>
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-green-100"></div> ว่างงาน</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-blue-200"></div> ประจำ Site</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-yellow-200"></div> ลา</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-slate-100"></div> วันหยุด</div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 font-medium text-slate-600 border-b border-r border-slate-200 sticky left-0 bg-slate-50 min-w-32">ชื่อ (ตำแหน่ง)</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                  const dow = new Date(year, month, d).getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  return (
                    <th key={d} className={`px-1 py-2 font-medium border-b border-slate-200 min-w-[36px] text-center ${isWeekend ? 'bg-slate-100 text-slate-400' : 'text-slate-600'}`}>
                      <div>{d}</div>
                      <div className="text-slate-400 font-normal">{DAYS[dow]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 border-r border-slate-200 sticky left-0 bg-white font-medium text-slate-700">
                    <div>{member.nickname}</div>
                    <div className={`text-xs mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${ROLE_CONFIG[member.role]?.color}`}>
                      {member.role}
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                    const dow = new Date(year, month, d).getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    if (isWeekend) {
                      return <td key={d} className="border-slate-100 border text-center bg-slate-50"></td>;
                    }
                    const status = getDayStatus(member, d);
                    return (
                      <td key={d} className="border border-slate-100 text-center p-0.5">
                        <div className={`rounded text-center py-1 ${DAY_COLORS[status]}`}>
                          {status === 'leave' ? 'ล' : status === 'on_site' ? 'S' : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-700 mb-4 text-sm">สรุปสถานะทีมงาน — {MONTHS_TH[month]} {year + 543}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {activeMembers.map(m => {
            const totalLeave = LEAVES.filter(l =>
              l.staffId === m.code && l.status !== 'rejected' &&
              (l.startDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) ||
               l.endDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
            ).reduce((sum, l) => sum + l.days, 0);
            return (
              <div key={m.id} className="p-3 border border-slate-100 rounded-lg">
                <div className="font-medium text-slate-700 text-sm">{m.nickname}</div>
                <div className={`text-xs mt-1 ${ROLE_CONFIG[m.role]?.color} px-1.5 py-0.5 rounded-full inline-block`}>{m.role}</div>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[m.status]?.dot}`}></div>
                    {STATUS_CONFIG[m.status]?.label}
                  </div>
                  {totalLeave > 0 && <div className="text-yellow-600">ลา {totalLeave} วัน</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
