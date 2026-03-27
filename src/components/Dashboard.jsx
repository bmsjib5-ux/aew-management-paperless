import { Bell, Users, Building2, HeartPulse, AlertTriangle, TrendingUp, CheckCircle2, Clock, GitBranch, Banknote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TEAM_MEMBERS, HOSPITALS, LEAVES, HEALTH_CHECKS, ISSUES, NOTIFICATIONS } from '../data/sampleData';
import { INSTALLATIONS } from '../data/installationData';

const TEAM_COLORS = { 'ทีม 1': '#16a34a', 'ทีม 2': '#ca8a04', 'ทีม 3': '#0284c7', 'ทีม 4': '#db2777' };

function buildYearSummary() {
  const years = [...new Set(INSTALLATIONS.map(i => i.year))].sort((a, b) => b - a);
  const teams = [...new Set(INSTALLATIONS.map(i => i.team))].sort();
  return years.map(year => {
    const byYear = INSTALLATIONS.filter(i => i.year === year);
    const totalContract = byYear.reduce((s, i) => s + (Number(i.contractPrice) || 0), 0);
    const totalCollected = byYear.reduce((s, i) => s + (Number(i.collectedAmount) || 0), 0);
    const totalSell = byYear.reduce((s, i) => s + (Number(i.sellPrice) || 0), 0);
    const completed = byYear.filter(i => i.status === 'completed').length;
    const teamBreakdown = teams.map(team => {
      const t = byYear.filter(i => i.team === team);
      return {
        team,
        count: t.length,
        completed: t.filter(i => i.status === 'completed').length,
        collected: t.reduce((s, i) => s + (Number(i.collectedAmount) || 0), 0),
        contract: t.reduce((s, i) => s + (Number(i.contractPrice) || 0), 0),
      };
    }).filter(t => t.count > 0);
    return { year, total: byYear.length, completed, totalContract, totalCollected, totalSell, teamBreakdown };
  });
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, bgColor }) => (
  <div className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4`}>
    <div className={`${bgColor} p-3 rounded-xl`}>
      <Icon size={24} className={color} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500">{title}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </div>
  </div>
);

const SITE_STATUS_COLORS = {
  planning: '#94a3b8',
  installing: '#3b82f6',
  training: '#f59e0b',
  go_live: '#10b981',
  support: '#8b5cf6',
};

const siteProgressData = HOSPITALS.map(h => ({
  name: h.shortName,
  progress: h.progress,
  status: h.status,
}));

const teamRoleData = [
  { name: 'PM', value: TEAM_MEMBERS.filter(t => t.role === 'PM').length, color: '#8b5cf6' },
  { name: 'Dev', value: TEAM_MEMBERS.filter(t => t.role === 'Dev').length, color: '#3b82f6' },
  { name: 'Trainer', value: TEAM_MEMBERS.filter(t => t.role === 'Trainer').length, color: '#f59e0b' },
  { name: 'Support', value: TEAM_MEMBERS.filter(t => t.role === 'Support').length, color: '#10b981' },
];

export default function Dashboard({ onMenuChange }) {
  const yearSummary = buildYearSummary();
  const pendingLeaves = LEAVES.filter(l => l.status === 'pending').length;
  const openIssues = ISSUES.filter(i => i.status === 'open').length;
  const criticalIssues = ISSUES.filter(i => i.status === 'open' && i.severity === 'critical').length;
  const healthNotDone = HEALTH_CHECKS.filter(h => h.status !== 'completed').length;
  const unreadNotifications = NOTIFICATIONS.filter(n => !n.read).length;
  const installCompleted = INSTALLATIONS.filter(i => i.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Paperless Team — BMS HOSxP IPD Paperless NPP3</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
        </div>
      </div>

      {/* Alerts */}
      {(criticalIssues > 0 || pendingLeaves > 0) && (
        <div className="space-y-2">
          {criticalIssues > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 text-sm text-red-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span>มี <strong>{criticalIssues}</strong> Critical Issue ที่ต้องแก้ไขด่วน</span>
            </div>
          )}
          {pendingLeaves > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3 text-sm text-yellow-700">
              <Clock size={16} className="shrink-0" />
              <span>มี <strong>{pendingLeaves}</strong> รายการลาที่รอการอนุมัติ</span>
              <button onClick={() => onMenuChange('leave')} className="ml-auto text-yellow-600 underline hover:text-yellow-800">ดูเพิ่มเติม</button>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="ทีมงานทั้งหมด" value={TEAM_MEMBERS.length} subtitle="สมาชิกทีม Paperless NPP3" icon={Users} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Site ทั้งหมด" value={HOSPITALS.length} subtitle={`Go-Live แล้ว ${HOSPITALS.filter(h=>h.status==='go_live').length}`} icon={Building2} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="ติดตั้งปี 2567" value={`${installCompleted}/${INSTALLATIONS.length}`} subtitle="โรงพยาบาลที่เสร็จสิ้น" icon={CheckCircle2} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard title="รอรับทราบ" value={unreadNotifications} subtitle={`Issue เปิดอยู่ ${openIssues} รายการ`} icon={Bell} color="text-orange-600" bgColor="bg-orange-50" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Availability */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> รายชื่อทีมงาน
          </h3>
          <div className="space-y-3">
            {TEAM_MEMBERS.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{member.nickname} <span className="text-slate-400 font-normal">({member.role})</span></div>
                  {member.currentSite && (
                    <div className="text-xs text-slate-400 truncate">
                      {HOSPITALS.find(h => h.id === member.currentSite)?.shortName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" /> ความคืบหน้า Site
          </h3>
          <div className="space-y-3">
            {HOSPITALS.map(h => (
              <div key={h.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 truncate flex-1">{h.shortName}</span>
                  <span className="text-xs font-medium text-slate-700 ml-2">{h.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${h.progress}%`,
                      backgroundColor: SITE_STATUS_COLORS[h.status] || '#94a3b8'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(SITE_STATUS_COLORS).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }}></div>
                <span className="capitalize">{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Role Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <GitBranch size={16} className="text-purple-500" /> สัดส่วนทีมงาน
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={teamRoleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {teamRoleData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v + ' คน', n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {teamRoleData.map(r => (
              <div key={r.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: r.color }}></div>
                <span className="text-slate-600">{r.name}: <strong>{r.value}</strong> คน</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yearly Team Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Banknote size={16} className="text-green-500" /> สรุปยอดรวมทีม — รายปี
        </h3>
        <div className="space-y-5">
          {yearSummary.map(ys => {
            const collectedPct = ys.totalSell > 0 ? Math.round((ys.totalCollected / ys.totalSell) * 100) : 0;
            const completedPct = ys.total > 0 ? Math.round((ys.completed / ys.total) * 100) : 0;
            return (
              <div key={ys.year} className="border border-slate-100 rounded-xl p-4">
                {/* Year header */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-800">ปี {ys.year}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{ys.total} โรงพยาบาล</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">เสร็จ {ys.completed} ({completedPct}%)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">มูลค่ารวม</div>
                    <div className="font-bold text-slate-700">{ys.totalContract.toLocaleString('th-TH')} บาท</div>
                  </div>
                </div>

                {/* Financial bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>อัตราการเก็บเงิน {collectedPct}%</span>
                    <span className="text-green-600 font-medium">เก็บแล้ว {ys.totalCollected.toLocaleString('th-TH')} / {ys.totalSell.toLocaleString('th-TH')} บาท</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${collectedPct}%` }} />
                  </div>
                  {ys.totalSell - ys.totalCollected > 0 && (
                    <div className="text-xs text-red-500 mt-0.5 text-right">
                      ค้างรับ {(ys.totalSell - ys.totalCollected).toLocaleString('th-TH')} บาท
                    </div>
                  )}
                </div>

                {/* Team breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ys.teamBreakdown.map(t => (
                    <div key={t.team} className="rounded-lg p-2.5 text-xs" style={{ backgroundColor: TEAM_COLORS[t.team] + '18', border: `1px solid ${TEAM_COLORS[t.team]}30` }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TEAM_COLORS[t.team] }}></div>
                        <span className="font-semibold text-slate-700">{t.team}</span>
                      </div>
                      <div className="space-y-0.5 text-slate-600">
                        <div className="flex justify-between">
                          <span>โรงพยาบาล</span>
                          <span className="font-medium">{t.count} แห่ง</span>
                        </div>
                        <div className="flex justify-between">
                          <span>เสร็จสิ้น</span>
                          <span className="font-medium text-green-700">{t.completed} แห่ง</span>
                        </div>
                        {t.contract > 0 && (
                          <div className="flex justify-between">
                            <span>มูลค่า</span>
                            <span className="font-medium">{(t.contract / 1000).toFixed(0)}K</span>
                          </div>
                        )}
                        {t.collected > 0 && (
                          <div className="flex justify-between">
                            <span>เก็บแล้ว</span>
                            <span className="font-medium text-green-700">{(t.collected / 1000).toFixed(0)}K</span>
                          </div>
                        )}
                      </div>
                      {/* Completion mini-bar */}
                      <div className="mt-1.5 h-1 bg-white/60 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.count > 0 ? (t.completed / t.count) * 100 : 0}%`, backgroundColor: TEAM_COLORS[t.team] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {yearSummary.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm">ยังไม่มีข้อมูลโครงการ</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Bell size={16} className="text-orange-500" /> การแจ้งเตือนล่าสุด
          </h3>
          <div className="space-y-3">
            {NOTIFICATIONS.slice(0, 5).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-2 rounded-lg ${n.read ? '' : 'bg-blue-50'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  n.type === 'issue_critical' ? 'bg-red-500' :
                  n.type === 'go_live_alert' ? 'bg-green-500' :
                  n.type === 'health_check' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700">{n.message}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{n.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Check Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <HeartPulse size={16} className="text-red-500" /> สุขภาพประจำปี 2025
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{HEALTH_CHECKS.filter(h=>h.status==='completed').length}</div>
              <div className="text-xs text-slate-500">ตรวจแล้ว</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{HEALTH_CHECKS.filter(h=>h.status==='pending').length}</div>
              <div className="text-xs text-slate-500">รอตรวจ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{HEALTH_CHECKS.filter(h=>h.status==='not_done').length}</div>
              <div className="text-xs text-slate-500">ยังไม่ตรวจ</div>
            </div>
          </div>
          <div className="space-y-2">
            {HEALTH_CHECKS.filter(h => h.status !== 'completed').map(h => {
              const member = TEAM_MEMBERS.find(t => t.code === h.staffId);
              return (
                <div key={h.staffId} className="flex items-center gap-3 text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${h.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {h.status === 'pending' ? 'รอตรวจ' : 'ยังไม่ตรวจ'}
                  </span>
                  <span className="text-slate-600">{member?.nickname} ({member?.role})</span>
                  {h.remark && <span className="text-xs text-slate-400 truncate">{h.remark}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
