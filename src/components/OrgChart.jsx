import { useState } from 'react';
import { Settings2, X, Plus, Check } from 'lucide-react';
import { useMembers } from '../context/MembersContext';
import { ROLE_CONFIG } from '../data/sampleData';

const ROLE_BORDER = {
  PM:            'border-purple-300 bg-purple-50',
  'Leader Team': 'border-blue-300 bg-blue-50',
  Specialist:    'border-orange-300 bg-orange-50',
  Staff:         'border-teal-300 bg-teal-50',
  'Special Lead':'border-cyan-300 bg-cyan-50',
  'IM เสริม':   'border-pink-300 bg-pink-50',
  'อื่น ๆ':     'border-slate-300 bg-slate-50',
};

function Avatar({ member, size = 'md' }) {
  const dim = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (member.photo) {
    return (
      <img src={member.photo} alt={member.nickname}
        className={`${dim} rounded-full object-cover border-2 border-white shadow mx-auto mb-1`} />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-1`}>
      {member.nickname.charAt(0)}
    </div>
  );
}

function MemberCard({ member, size = 'md', onRemove }) {
  const border = ROLE_BORDER[member.role] || 'border-slate-200 bg-white';
  const cfg = ROLE_CONFIG[member.role];
  const isLg = size === 'lg';
  return (
    <div className={`relative border-2 ${border} rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow ${isLg ? 'w-40' : 'w-28'}`}>
      {onRemove && (
        <button
          onClick={() => onRemove(member)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow z-10"
          title="ย้ายออกจากทีม"
        >
          <X size={11} />
        </button>
      )}
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

// Dropdown เพิ่มสมาชิกเข้าทีม
function AddMemberDropdown({ unassigned, onAdd }) {
  const [open, setOpen] = useState(false);
  if (unassigned.length === 0) return (
    <div className="mt-3 text-xs text-slate-300 italic">ไม่มีสมาชิกที่ยังไม่ได้กำหนดทีม</div>
  );
  return (
    <div className="relative mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Plus size={13} /> เพิ่มสมาชิก
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg min-w-48 max-h-64 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 sticky top-0 bg-white">
            เลือกสมาชิกเข้าทีม
          </div>
          {unassigned.map(m => {
            const cfg = ROLE_CONFIG[m.role];
            return (
              <button
                key={m.id}
                onClick={() => { onAdd(m); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-left transition-colors"
              >
                {m.photo ? (
                  <img src={m.photo} alt={m.nickname} className="w-6 h-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {m.nickname.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-800 truncate">{m.nickname}</div>
                  <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${cfg?.color || 'bg-slate-100 text-slate-600'}`}>
                    {cfg?.icon} {cfg?.label || m.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { members, updateMember } = useMembers();
  const [editMode, setEditMode] = useState(false);

  const active = members.filter(m => (m.employmentStatus || 'active') !== 'resigned');
  const pmList     = active.filter(m => m.role === 'PM');
  const leaderList = active.filter(m => m.role === 'Leader Team');

  const teams = leaderList.map(leader => ({
    leader,
    members: active.filter(m => m.teamId === leader.code),
  }));

  // สมาชิกที่ยังไม่ได้กำหนดทีม (ไม่ใช่ PM และไม่ใช่ Leader)
  const unassigned = active.filter(m =>
    m.role !== 'PM' &&
    m.role !== 'Leader Team' &&
    !m.teamId
  );

  // Group unassigned by role (สำหรับแสดงใต้ Org chart)
  const unassignedGroups = [];
  unassigned.forEach(m => {
    const existing = unassignedGroups.find(g => g.role === m.role);
    if (existing) existing.members.push(m);
    else unassignedGroups.push({ role: m.role, members: [m] });
  });

  const hasHierarchy = leaderList.length > 0;
  const teamCount = leaderList.length || 1;

  const assignToTeam = (member, leaderCode) => {
    updateMember(member.id, { teamId: leaderCode });
  };

  const removeFromTeam = (member) => {
    updateMember(member.id, { teamId: '' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Organization Chart</h1>
          <p className="text-slate-500 text-sm">Paperless Team — IPD Paperless ({active.length} คน)</p>
        </div>
        <button
          onClick={() => setEditMode(e => !e)}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-colors ${
            editMode
              ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {editMode ? <><Check size={15} /> เสร็จสิ้น</> : <><Settings2 size={15} /> จัดทีม</>}
        </button>
      </div>

      {editMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <Settings2 size={15} />
          <span>โหมดจัดทีม — คลิก <strong>เพิ่มสมาชิก</strong> ใต้หัวหน้าทีม หรือคลิก <strong>✕</strong> บนการ์ดเพื่อย้ายออกจากทีม</span>
        </div>
      )}

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
          <div className="relative flex justify-center">
            <div
              className="absolute top-0 h-0.5 bg-slate-200"
              style={{
                left: `calc(${100 / (teamCount * 2)}%)`,
                right: `calc(${100 / (teamCount * 2)}%)`,
              }}
            />
            <div className="flex w-full justify-around">
              {teams.map(team => {
                // Group team members by role
                const roleGroups = [];
                team.members.forEach(m => {
                  const existing = roleGroups.find(g => g.role === m.role);
                  if (existing) existing.members.push(m);
                  else roleGroups.push({ role: m.role, members: [m] });
                });

                return (
                  <div key={team.leader.id} className="flex flex-col items-center px-2" style={{ flex: 1 }}>
                    <VLine h="h-6" />

                    {/* Leader card */}
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${ROLE_CONFIG['Leader Team']?.color || 'bg-blue-100 text-blue-700'}`}>
                      {ROLE_CONFIG['Leader Team']?.icon} หัวหน้าทีม
                    </div>
                    <MemberCard member={team.leader} size="md" />

                    {/* Members grouped by role */}
                    {roleGroups.map(grp => (
                      <div key={grp.role} className="flex flex-col items-center w-full">
                        <VLine h="h-4" />
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${ROLE_CONFIG[grp.role]?.color || 'bg-slate-100 text-slate-600'}`}>
                          {ROLE_CONFIG[grp.role]?.icon} {ROLE_CONFIG[grp.role]?.label || grp.role} ({grp.members.length})
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                          {grp.members.map(s => (
                            <MemberCard
                              key={s.id}
                              member={s}
                              size="md"
                              onRemove={editMode ? removeFromTeam : null}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* ปุ่มเพิ่มสมาชิก (โหมดจัดทีม) */}
                    {editMode && (
                      <AddMemberDropdown
                        unassigned={unassigned}
                        onAdd={(m) => assignToTeam(m, team.leader.code)}
                      />
                    )}

                    {!editMode && team.members.length === 0 && (
                      <div className="mt-3 text-xs text-slate-300 italic">ยังไม่มีสมาชิก</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ยังไม่ได้กำหนดทีม ── */}
        {unassignedGroups.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">ยังไม่ได้กำหนดทีม</div>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{unassigned.length} คน</span>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              {unassignedGroups.map(g => {
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
            {editMode && (
              <p className="text-center text-xs text-slate-400 mt-4">
                กด <strong>เพิ่มสมาชิก</strong> ใต้หัวหน้าทีมด้านบน เพื่อย้ายสมาชิกเข้าทีม
              </p>
            )}
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
