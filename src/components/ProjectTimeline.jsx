import { useState, useMemo, useEffect } from 'react';
import { Download, Printer, ChevronLeft, ChevronRight, CalendarDays, Table2 } from 'lucide-react';
import { exportToExcel, printTable } from '../utils/exportUtils';
import { useInstallations } from '../context/InstallationsContext';
import { useSettings } from '../context/SettingsContext';
import { useMembers } from '../context/MembersContext';

const YEAR_START = 2565;
const YEAR_END   = 2572;
const YEAR_OPTIONS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_START + i).reverse();

// สีหมุนเวียน รองรับทีมจำนวนเท่าไหร่ก็ได้
const PALETTE_BG     = ['#dcfce7','#fef9c3','#e0f2fe','#fce7f3','#f3e8ff','#ffedd5','#ecfeff','#fef2f2'];
const PALETTE_HEADER = ['#16a34a','#ca8a04','#0284c7','#db2777','#7c3aed','#ea580c','#0891b2','#dc2626'];
const OFFICE_BG = '#fff7ed';

function teamBg(team, teams)     { return PALETTE_BG[teams.indexOf(team) % PALETTE_BG.length] || '#f1f5f9'; }
function teamHeader(team, teams) { return PALETTE_HEADER[teams.indexOf(team) % PALETTE_HEADER.length] || '#475569'; }

const DAYS_TH   = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                   'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function parseDate(str) { return str ? new Date(str) : null; }
function isBetween(date, start, end) {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

function getWeeksOfYear(year) {
  const weeks = [];
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay();
  const firstMon = new Date(jan1);
  firstMon.setDate(jan1.getDate() - ((dayOfWeek + 6) % 7));
  let cur = new Date(firstMon);
  while (cur.getFullYear() <= year) {
    const fri = new Date(cur);
    fri.setDate(cur.getDate() + 4);
    weeks.push({ mon: new Date(cur), fri: new Date(fri) });
    cur.setDate(cur.getDate() + 7);
    if (cur.getFullYear() > year && cur.getMonth() > 0) break;
  }
  return weeks;
}

function formatShortTH(date) {
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const d = new Date(date);
  return `${d.getDate()} ${months[d.getMonth()]} ${(d.getFullYear()+543).toString().slice(2)}`;
}

// นับสัปดาห์ที่ของโครงการ (นับจากสัปดาห์แรกที่เริ่มงาน = สัปดาห์ที่ 1)
function getInstallWeekNumber(install, weekMon) {
  const start = parseDate(install.startDate);
  if (!start) return null;
  const startDay = start.getDay();
  const startWeekMon = new Date(start);
  startWeekMon.setDate(start.getDate() - ((startDay + 6) % 7));
  const diffMs = weekMon.getTime() - startWeekMon.getTime();
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function getInstallsForWeek(installations, weekMon, weekFri, team) {
  return installations.filter(i => {
    if (i.team !== team) return false;
    const start = parseDate(i.startDate);
    const end = parseDate(i.endDate);
    if (!start || !end) return false;
    return start <= weekFri && end >= weekMon;
  });
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ installations, members, yearBE, teams }) {
  const today = new Date();
  const initMonth = (yearBE - 543 === today.getFullYear()) ? today.getMonth() : 0;

  const [calYear, setCalYear] = useState(yearBE - 543);
  const [calMonth, setCalMonth] = useState(initMonth);
  const [selectedPerson, setSelectedPerson] = useState('ทั้งหมด');

  useEffect(() => {
    setCalYear(yearBE - 543);
    setCalMonth(yearBE - 543 === today.getFullYear() ? today.getMonth() : 0);
  }, [yearBE]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const filteredInstalls = installations.filter(i => {
    if (selectedPerson === 'ทั้งหมด') return true;
    return (i.teamLead || '').includes(selectedPerson) ||
           (i.teamMembers || '').includes(selectedPerson);
  });

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = new Date(calYear, calMonth, 1).getDay(); // 0=อา

  // cells array: null = empty leading cell, number = day
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const toDateStr = (day) =>
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getInstallsForDay = (day) => {
    if (!day) return [];
    const dateStr = toDateStr(day);
    return filteredInstalls.filter(i => i.startDate <= dateStr && i.endDate >= dateStr);
  };

  const isTodayFn = (day) =>
    day &&
    calYear === today.getFullYear() &&
    calMonth === today.getMonth() &&
    day === today.getDate();

  // แบ่ง cells เป็น rows ทีละ 7
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  if (rows[rows.length - 1]?.length < 7) {
    while (rows[rows.length - 1].length < 7) rows[rows.length - 1].push(null);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Month nav */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="font-bold text-slate-800 text-base min-w-44 text-center">
            {MONTHS_TH[calMonth]} {calYear + 543}
          </span>
          <button onClick={nextMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Person selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">แสดงของ:</span>
          <select value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="ทั้งหมด">ทุกคน</option>
            {members.map(m => (
              <option key={m.id} value={m.nickname}>{m.nickname} ({m.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {DAYS_TH.map((d, i) => (
            <div key={d}
              className={`py-2.5 text-center text-sm font-semibold ${
                i === 0 ? 'text-red-500 bg-red-50' :
                i === 6 ? 'text-blue-500 bg-blue-50' :
                'text-slate-600 bg-slate-50'
              }`}>
              {d}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0"
            style={{ minHeight: 100 }}>
            {row.map((day, ci) => {
              const installs = getInstallsForDay(day);
              const isToday  = isTodayFn(day);
              const isWeekend = ci === 0 || ci === 6;
              return (
                <div key={ci}
                  className={`p-1.5 border-r border-slate-100 last:border-r-0 ${
                    !day ? 'bg-slate-50/50' :
                    isWeekend ? 'bg-slate-50/70' : 'bg-white'
                  }`}>
                  {day && (
                    <>
                      {/* วันที่ */}
                      <div className="flex justify-end mb-1">
                        <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-orange-500 text-white'
                            : isWeekend ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {day}
                        </span>
                      </div>
                      {/* Events */}
                      <div className="space-y-0.5">
                        {installs.slice(0, 3).map(inst => (
                          <div key={inst.id}
                            className="text-xs px-1.5 py-0.5 rounded truncate font-medium leading-tight"
                            style={{
                              backgroundColor: teamBg(inst.team, teams),
                              color: teamHeader(inst.team, teams),
                              border: `1px solid ${teamHeader(inst.team, teams)}30`,
                            }}
                            title={`${inst.hospital} (${inst.team}) — ${inst.teamLead}`}>
                            {inst.hospital}
                          </div>
                        ))}
                        {installs.length > 3 && (
                          <div className="text-xs text-slate-400 text-center">+{installs.length - 3} อื่นๆ</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {teams.map(team => (
          <div key={team} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded"
              style={{ backgroundColor: teamHeader(team, teams) }} />
            <span className="text-slate-600">{team}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-slate-500">วันนี้</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectTimeline() {
  const { installations } = useInstallations();
  const { settings } = useSettings();
  const { members } = useMembers();

  const activeMembers = members.filter(m => (m.employmentStatus || 'active') !== 'resigned');

  // default = ปีที่มีข้อมูลมากสุด หรือปีปัจจุบัน BE
  const defaultYear = useMemo(() => {
    if (installations.length === 0) return new Date().getFullYear() + 543;
    const counts = {};
    installations.forEach(i => { counts[i.year] = (counts[i.year] || 0) + 1; });
    return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
  }, [installations]);

  const [yearBE, setYearBE] = useState(() => defaultYear);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'
  const yearAD = yearBE - 543;

  const allInstalls = installations.filter(i => i.year === yearBE);

  const TEAMS = useMemo(() => {
    const fromData = installations.map(i => i.team).filter(Boolean);
    const fromSettings = settings.teams || [];
    return [...new Set([...fromSettings, ...fromData])].sort();
  }, [installations, settings.teams]);

  const weeks = useMemo(() => getWeeksOfYear(yearAD), [yearAD]);
  const filteredWeeks = weeks.filter(w =>
    w.mon.getFullYear() === yearAD || w.fri.getFullYear() === yearAD
  );

  const handleExport = () => {
    const rows = filteredWeeks.map((w, idx) => {
      const row = {
        'ลำดับ': idx + 1,
        'สัปดาห์': `${formatShortTH(w.mon)} - ${formatShortTH(w.fri)}`,
      };
      TEAMS.forEach(team => {
        const installs = getInstallsForWeek(allInstalls, w.mon, w.fri, team);
        row[team] = installs.length > 0
          ? installs.map(i => `${i.hospital} (${i.workType})`).join(', ')
          : 'เตรียม/งาน office';
      });
      return row;
    });
    exportToExcel(rows, `ภาพรวมโครงการ_${yearBE}`);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ภาพรวมโครงการ</h1>
          <p className="text-slate-500 text-sm">ตารางการทำงานของแต่ละทีมตลอดทั้งปี</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Year selector */}
          <select value={yearBE} onChange={e => setYearBE(Number(e.target.value))}
            className="px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>ปี {y}</option>)}
          </select>

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <Table2 size={15} /> ตารางสัปดาห์
            </button>
            <button onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-l border-slate-200 ${
                viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <CalendarDays size={15} /> ปฏิทิน
            </button>
          </div>

          {viewMode === 'table' && (
            <>
              <button onClick={() => printTable('weekly-table')}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                <Printer size={16} /> พิมพ์
              </button>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                <Download size={16} /> Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarView
          installations={allInstalls}
          members={activeMembers}
          yearBE={yearBE}
          teams={TEAMS}
        />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            {TEAMS.map(team => (
              <div key={team} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: teamBg(team, TEAMS) }}></div>
                <div className="w-3 h-3 rounded" style={{ backgroundColor: teamHeader(team, TEAMS) }}></div>
                <span className="text-slate-600 font-medium">{team}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-slate-200" style={{ backgroundColor: OFFICE_BG }}></div>
              <span className="text-slate-500">เตรียม/งาน office</span>
            </div>
          </div>

          {/* Weekly Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table id="weekly-table" className="w-full border-collapse text-xs" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-700 bg-slate-100 w-8"
                      style={{ minWidth: 36 }}>ลำดับ</th>
                    <th className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-700 bg-slate-100"
                      style={{ minWidth: 150 }}>สัปดาห์ที่</th>
                    {TEAMS.map(team => (
                      <th key={team}
                        className="border border-slate-300 px-3 py-2 text-center font-bold text-white"
                        style={{ backgroundColor: teamHeader(team, TEAMS), minWidth: 200 }}>
                        {team}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWeeks.map((week, idx) => {
                    const weekNum = idx + 1;
                    const isNewMonth = idx === 0 || week.mon.getMonth() !== filteredWeeks[idx - 1].mon.getMonth();
                    const monthLabel = MONTHS_TH[week.mon.getMonth()];

                    return (
                      <>
                        {isNewMonth && (
                          <tr key={`month-${idx}`}>
                            <td colSpan={TEAMS.length + 2}
                              className="border border-slate-300 px-4 py-1.5 text-center font-bold text-white text-sm"
                              style={{ backgroundColor: '#1e40af' }}>
                              {monthLabel} {yearBE}
                            </td>
                          </tr>
                        )}
                        <tr key={idx} className="hover:brightness-95 transition-all">
                          <td className="border border-slate-300 px-2 py-2 text-center font-medium text-slate-500 bg-slate-50"
                            style={{ verticalAlign: 'top' }}>
                            {weekNum}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 bg-slate-50 font-medium text-slate-700"
                            style={{ verticalAlign: 'top', lineHeight: 1.5 }}>
                            <div className="whitespace-nowrap">{formatShortTH(week.mon)}</div>
                            <div className="text-slate-400 text-xs">ถึง</div>
                            <div className="whitespace-nowrap">{formatShortTH(week.fri)}</div>
                          </td>
                          {TEAMS.map(team => {
                            const installs = getInstallsForWeek(allInstalls, week.mon, week.fri, team);
                            const hasWork = installs.length > 0;
                            const cellBg = hasWork ? teamBg(team, TEAMS) : OFFICE_BG;
                            return (
                              <td key={team}
                                className="border border-slate-300 px-3 py-2"
                                style={{ backgroundColor: cellBg, verticalAlign: 'top', minHeight: 60 }}>
                                {hasWork ? (
                                  <div className="space-y-2">
                                    {installs.map(install => (
                                      <div key={install.id}>
                                        <div className="font-semibold text-slate-800 leading-snug">{install.hospital}</div>
                                        <div className="text-slate-600 mt-0.5">
                                          ติดตั้ง IPD Paperless แบบ
                                          <span className={`font-medium mx-1 ${install.workType === 'Online' ? 'text-blue-700' : 'text-green-700'}`}>
                                            ({install.workType})
                                          </span>
                                          {install.wards > 0 && `จำนวน ${install.wards} ward`}
                                        </div>
                                        {install.teamMembers && (
                                          <div className="text-slate-500 mt-0.5">ทีมงาน: {install.teamMembers}</div>
                                        )}
                                        {/* สัปดาห์ที่ N ของโครงการ */}
                                        {(() => {
                                          const wn = getInstallWeekNumber(install, week.mon);
                                          return wn > 0 ? (
                                            <div className="mt-1 inline-block border-2 border-red-500 text-red-600 font-bold text-xs px-2 py-0.5 rounded">
                                              สัปดาห์ที่ : {wn}
                                            </div>
                                          ) : null;
                                        })()}
                                        {install.remark && (
                                          <div className="mt-1 text-orange-700 bg-orange-50 rounded px-1.5 py-0.5 leading-snug border-l-2 border-orange-400">
                                            {install.remark}
                                          </div>
                                        )}
                                        <div className="mt-1">
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            install.status === 'completed' ? 'bg-green-200 text-green-800' :
                                            install.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
                                            'bg-yellow-200 text-yellow-800'
                                          }`}>
                                            {install.status === 'completed' ? '✓ เสร็จสิ้น' :
                                             install.status === 'in_progress' ? '● กำลังดำเนินการ' : '○ รอดำเนินการ'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-slate-400 italic text-center py-1">เตรียม/งาน office</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary footer */}
          <div className={`grid gap-4 grid-cols-2 ${TEAMS.length <= 4 ? 'md:grid-cols-' + TEAMS.length : 'md:grid-cols-4'}`}>
            {TEAMS.map(team => {
              const teamInstalls = allInstalls.filter(i => i.team === team);
              const completed = teamInstalls.filter(i => i.status === 'completed').length;
              return (
                <div key={team} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-8 rounded" style={{ backgroundColor: teamHeader(team, TEAMS) }}></div>
                    <div>
                      <div className="font-bold text-slate-800">{team}</div>
                      <div className="text-xs text-slate-400">{teamInstalls.length} โรงพยาบาล</div>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>เสร็จสิ้น</span>
                      <span className="font-medium text-green-700">{completed} แห่ง</span>
                    </div>
                    <div className="flex justify-between">
                      <span>คงเหลือ</span>
                      <span className="font-medium text-blue-700">{teamInstalls.length - completed} แห่ง</span>
                    </div>
                    {teamInstalls.length > 0 && (
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{
                            width: `${(completed / teamInstalls.length) * 100}%`,
                            backgroundColor: teamHeader(team, TEAMS),
                          }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
