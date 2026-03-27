import { useMembers } from '../context/MembersContext';
import { ROLE_CONFIG } from '../data/sampleData';

function Avatar({ member, size = 'md' }) {
  const dim = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={member.nickname}
        className={`${dim} rounded-full object-cover border-2 border-white shadow mx-auto mb-1`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-1`}>
      {member.nickname.charAt(0)}
    </div>
  );
}

const ROLE_BORDER = {
  PM:           'border-purple-300 bg-purple-50',
  'Leader Team':'border-blue-300 bg-blue-50',
  'Special Lead':'border-cyan-300 bg-cyan-50',
  Specialist:   'border-green-300 bg-green-50',
  Support:      'border-teal-300 bg-teal-50',
  Dev:          'border-orange-300 bg-orange-50',
  Trainer:      'border-yellow-300 bg-yellow-50',
  'IM เสริม':   'border-pink-300 bg-pink-50',
  'อื่น ๆ':     'border-slate-300 bg-slate-50',
};

function MemberCard({ member, size = 'md' }) {
  const border = ROLE_BORDER[member.role] || 'border-slate-200 bg-white';
  const cfg = ROLE_CONFIG[member.role];
  const isLg = size === 'lg';
  return (
    <div className={`border-2 ${border} rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow ${isLg ? 'w-40' : 'w-28'}`}>
      <Avatar member={member} size={isLg ? 'lg' : 'md'} />
      <div className={`font-semibold text-slate-800 truncate ${isLg ? 'text-sm' : 'text-xs'}`}>{member.nickname}</div>
      {isLg && <div className="text-slate-500 text-xs truncate mt-0.5">{member.name.split(' ')[0]}</div>}
      <div className={`mt-1 text-xs px-1.5 py-0.5 rounded-full inline-block ${cfg?.color || 'bg-slate-100 text-slate-600'}`}>
        {cfg?.icon} {cfg?.label || member.role}
      </div>
    </div>
  );
}

function VLine({ h = 'h-6' }) {
  return <div className={`w-0.5 ${h} bg-slate-200 mx-auto`}></div>;
}


export default function OrgChart() {
  const { members } = useMembers();
  const active = members.filter(m => (m.employmentStatus || 'active') !== 'resigned');

  const pmList      = active.filter(m => m.role === 'PM');
  const leaderList  = active.filter(m => m.role === 'Leader Team');
  const specList    = active.filter(m => m.role === 'Special Lead');
  const staffList   = active.filter(m => ['Specialist', 'Support'].includes(m.role));

  // Roles that appear in the "Others" bottom section
  const mainRoles = new Set(['PM', 'Leader Team', 'Special Lead', 'Specialist', 'Support']);
  const otherMembers = active.filter(m => !mainRoles.has(m.role));

  // Group other members by role for display
  const otherGroups = [];
  otherMembers.forEach(m => {
    const existing = otherGroups.find(g => g.role === m.role);
    if (existing) existing.members.push(m);
    else otherGroups.push({ role: m.role, members: [m] });
  });

  // Build team columns: each leader gets specLeads[i] and staff chunk of 3
  const teamCount = leaderList.length || 1;
  const teams = leaderList.map((leader, i) => ({
    leader,
    specLead: specList[i] || null,
    staff: staffList.slice(i * 3, i * 3 + 3),
  }));

  // If no leaders defined, just show a flat sub-level
  const hasHierarchy = leaderList.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Organization Chart</h1>
        <p className="text-slate-500 text-sm">Paperless Team — NPP3 ({active.length} คน)</p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {[...new Set(active.map(m => m.role))].map(role => {
          const cfg = ROLE_CONFIG[role];
          const count = active.filter(m => m.role === role).length;
          return (
            <div key={role} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${cfg?.color || 'bg-slate-100 text-slate-600'}`}>
              {cfg?.icon} {cfg?.label || role}: {count} คน
            </div>
          );
        })}
      </div>

      {/* Org Tree */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 overflow-x-auto min-w-0">

        {/* ── PM Level ── */}
        {pmList.length > 0 && (
          <div className="flex flex-col items-center mb-0">
            <div className={`text-xs font-semibold px-3 py-1 rounded-full mb-3 ${ROLE_CONFIG.PM?.color || 'bg-purple-100 text-purple-700'}`}>
              {ROLE_CONFIG.PM?.icon} {ROLE_CONFIG.PM?.label || 'ผู้จัดการโครงการ'} ({pmList.length})
            </div>
            <div className="flex gap-4 justify-center">
              {pmList.map(m => <MemberCard key={m.id} member={m} size="lg" />)}
            </div>
          </div>
        )}

        {/* ── PM → Leaders connector ── */}
        {pmList.length > 0 && hasHierarchy && (
          <div className="flex flex-col items-center">
            <VLine h="h-6" />
          </div>
        )}

        {/* ── Leader Team Level ── */}
        {hasHierarchy && (
          <>
            {/* horizontal bar spanning leaders */}
            <div className="relative flex justify-center">
              <div
                className="absolute top-0 h-0.5 bg-slate-200"
                style={{
                  left: `calc(${100 / (teamCount * 2)}%)`,
                  right: `calc(${100 / (teamCount * 2)}%)`,
                }}
              />
              {/* Leader cards with vertical drops */}
              <div className="flex w-full justify-around">
                {teams.map(team => (
                  <div key={team.leader.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                    <VLine h="h-6" />
                    <MemberCard member={team.leader} size="md" />

                    {/* ── Special Lead ── */}
                    {team.specLead && (
                      <>
                        <VLine h="h-4" />
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${ROLE_CONFIG['Special Lead']?.color || 'bg-cyan-100 text-cyan-700'}`}>
                          {ROLE_CONFIG['Special Lead']?.icon} Special Lead
                        </div>
                        <MemberCard member={team.specLead} size="md" />
                      </>
                    )}

                    {/* ── Staff ── */}
                    {team.staff.length > 0 && (
                      <>
                        <VLine h="h-4" />
                        <div className="text-xs font-semibold text-slate-400 mb-1">Staff ({team.staff.length})</div>
                        <div className="flex flex-col gap-2 items-center">
                          {team.staff.map(s => <MemberCard key={s.id} member={s} size="md" />)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── No leaders: flat display of spec/staff ── */}
        {!hasHierarchy && (specList.length > 0 || staffList.length > 0) && (
          <>
            {pmList.length > 0 && <VLine h="h-6" />}
            <div className="pt-4 border-t border-slate-100">
              {specList.length > 0 && (
                <div className="mb-4">
                  <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2 ${ROLE_CONFIG['Special Lead']?.color || 'bg-cyan-100 text-cyan-700'}`}>
                    {ROLE_CONFIG['Special Lead']?.icon} Special Lead ({specList.length})
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {specList.map(m => <MemberCard key={m.id} member={m} />)}
                  </div>
                </div>
              )}
              {staffList.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2 text-center">Staff ({staffList.length})</div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {staffList.map(m => <MemberCard key={m.id} member={m} />)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Others / IM เสริม / Remaining ── */}
        {otherGroups.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 mb-4 text-center uppercase tracking-wide">อื่น ๆ / IM เสริม</div>
            <div className="flex flex-wrap gap-6 justify-center">
              {otherGroups.map(g => {
                const cfg = ROLE_CONFIG[g.role];
                return (
                  <div key={g.role} className="flex flex-col items-center gap-2">
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg?.color || 'bg-slate-100 text-slate-600'}`}>
                      {cfg?.icon} {cfg?.label || g.role} ({g.members.length})
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {g.members.map(m => <MemberCard key={m.id} member={m} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Workload Bar Chart ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-700 mb-4 text-sm">สัดส่วน Workload ของทีม</h3>
        <div className="flex flex-wrap gap-4">
          {active.map(m => (
            <div key={m.id} className="flex flex-col items-center gap-1 w-16">
              {m.photo ? (
                <img src={m.photo} alt={m.nickname} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {m.nickname.charAt(0)}
                </div>
              )}
              <div className="text-xs text-slate-600 font-medium truncate w-full text-center">{m.nickname}</div>
              <div className="w-full h-16 bg-slate-100 rounded-lg relative overflow-hidden flex items-end">
                <div
                  className={`w-full rounded-lg transition-all ${(m.workload || 0) >= 80 ? 'bg-red-400' : (m.workload || 0) >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{ height: `${m.workload || 0}%` }}
                />
              </div>
              <div className="text-xs text-slate-500">{m.workload || 0}%</div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400"></div> น้อย (&lt;50%)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-400"></div> ปานกลาง (50-79%)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-400"></div> สูง (&gt;=80%)</div>
        </div>
      </div>
    </div>
  );
}
