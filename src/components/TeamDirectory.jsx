import { useState, useRef } from 'react';
import { Search, Download, Printer, Plus, Eye, Phone, Mail, Camera, MessageCircle, Send, X, Copy, Check, Pencil, Trash2 } from 'lucide-react';
import { ROLE_CONFIG, HEALTH_STATUS_CONFIG } from '../data/sampleData';
import { exportToExcel, printTable } from '../utils/exportUtils';
import { useMembers } from '../context/MembersContext';
import { useSettings } from '../context/SettingsContext';

const ROLES = ['ทั้งหมด', 'PM', 'Special Lead', 'Leader Team', 'Specialist', 'Support', 'IM เสริม', 'อื่น ๆ'];

const ROLE_OPTIONS = ['PM', 'Special Lead', 'Leader Team', 'Specialist', 'Support', 'IM เสริม', 'อื่น ๆ'];

// ลำดับตำแหน่งจากสูงไปต่ำ (ใช้เรียงในตาราง)
const POSITION_ORDER = [
  'ผู้จัดการโครงการ Smart Hospital (IPD Paperless)',
  'หัวหน้าทีมอาวุโส Smart Hospital (IPD Paperless)',
  'หัวหน้าทีม Smart Hospital (IPD Paperless)',
  'เจ้าหน้าที่ชำนาญการพิเศษ Smart Hospital (IPD Paperless)',
  'เจ้าหน้าที่ชำนาญการ Smart Hospital (IPD Paperless)',
  'เจ้าหน้าที่ปฏิบัติการติดตั้ง Smart Hospital (IPD Paperless)',
  'อื่น ๆ',
];

const POSITION_OPTIONS = [...POSITION_ORDER];

const EMPTY_MEMBER_FORM = {
  name: '', nickname: '', role: 'Specialist', position: '',
  dept: 'NPP3', email: '', emailCompany: '', phone: '', startDate: '',
  status: 'available', workload: 0,
  skills: '', currentSite: '', healthCheck: 'pending',
  gender: '', canDrive: '', religion: '', photo: '',
  lineId: '', lineNotifyToken: '',
  employmentStatus: 'active',
  teamId: '',
};

const GENDER_ICON = {
  'ชาย':    { symbol: '♂', color: 'text-blue-500' },
  'หญิง':   { symbol: '♀', color: 'text-pink-500' },
  'ไม่ระบุ': { symbol: '—', color: 'text-slate-400' },
};

const DRIVE_ICON = {
  'ขับรถได้ (มีใบขับขี่)':    { symbol: '🚗', title: 'ขับรถได้ (มีใบขับขี่)' },
  'ขับรถได้ (ไม่มีใบขับขี่)': { symbol: '🚙', title: 'ขับรถได้ (ไม่มีใบขับขี่)' },
  'ขับรถไม่ได้':               { symbol: '🚫', title: 'ขับรถไม่ได้' },
};

const EMPLOYMENT_STATUS_CONFIG = {
  active:      { label: 'ยังปฏิบัติงานอยู่', color: 'bg-green-100 text-green-700' },
  resigned:    { label: 'ลาออก',              color: 'bg-red-100 text-red-600' },
  transferred: { label: 'ย้ายไปแผนกอื่น',     color: 'bg-orange-100 text-orange-700' },
  other:       { label: 'อื่น ๆ',             color: 'bg-slate-100 text-slate-600' },
};

export default function TeamDirectory() {
  const { members, addMember, updateMember, removeMember } = useMembers();
  const { settings, hospitalNames } = useSettings();
  const positionOptions = (settings.positions && settings.positions.length > 0) ? settings.positions : POSITION_OPTIONS;
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ทั้งหมด');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_MEMBER_FORM);
  const [formError, setFormError] = useState('');
  const photoInputRef = useRef(null);
  const [lineModal, setLineModal] = useState(null); // member object
  const [lineMsg, setLineMsg] = useState('');
  const [lineSending, setLineSending] = useState(false);
  const [lineResult, setLineResult] = useState(null); // { ok, text }
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [employmentFilter, setEmploymentFilter] = useState('active_only'); // 'active_only' | 'all' | specific key

  const openLineChat = (lineId) => {
    if (!lineId) return;
    const id = lineId.startsWith('@') ? lineId : `~${lineId}`;
    window.open(`https://line.me/ti/p/${id}`, '_blank');
  };

  const sendLineNotify = async (token, message) => {
    if (!token || !message.trim()) return;
    setLineSending(true);
    setLineResult(null);
    try {
      const res = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `message=${encodeURIComponent(message)}`,
      });
      const data = await res.json();
      setLineResult({ ok: res.ok, text: res.ok ? 'ส่งข้อความสำเร็จ ✓' : (data.message || 'เกิดข้อผิดพลาด') });
    } catch {
      setLineResult({ ok: false, text: 'ไม่สามารถส่งได้โดยตรงจากเบราว์เซอร์ (CORS) — กรุณาใช้ Backend หรือ Proxy' });
    }
    setLineSending(false);
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEditForm = (member) => {
    const positionIsPreset = POSITION_OPTIONS.includes(member.position);
    setForm({
      name: member.name || '',
      nickname: member.nickname || '',
      role: member.role || 'Specialist',
      position: positionIsPreset ? member.position : 'อื่น ๆ',
      positionCustom: positionIsPreset ? '' : member.position,
      dept: member.dept || 'NPP3',
      email: member.email || '',
      emailCompany: member.emailCompany || '',
      phone: member.phone || '',
      startDate: member.startDate || '',
      status: member.status || 'available',
      workload: member.workload ?? 0,
      skills: Array.isArray(member.skills) ? member.skills.join(', ') : (member.skills || ''),
      currentSite: member.currentSite || '',
      healthCheck: member.healthCheck || 'pending',
      gender: member.gender || '',
      canDrive: member.canDrive || '',
      religion: member.religion || '',
      photo: member.photo || '',
      lineId: member.lineId || '',
      lineNotifyToken: member.lineNotifyToken || '',
      employmentStatus: member.employmentStatus || 'active',
      teamId: member.teamId || '',
    });
    setEditMode(true);
    setEditingId(member.id);
    setFormError('');
    setShowAddForm(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = () => {
    if (!form.name.trim()) { setFormError('กรุณาระบุชื่อ-นามสกุล'); return; }
    if (!form.nickname.trim()) { setFormError('กรุณาระบุชื่อเล่น'); return; }
    if (!form.email.trim()) { setFormError('กรุณาระบุอีเมล'); return; }
    setFormError('');
    const resolved = {
      ...form,
      position: form.position === 'อื่น ๆ' ? (form.positionCustom || 'อื่น ๆ') : form.position,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      workload: parseInt(form.workload) || 0,
    };
    if (editMode) {
      updateMember(editingId, resolved);
    } else {
      const newCode = `T${String(members.length + 1).padStart(3, '0')}`;
      addMember({ ...resolved, id: members.length + 1, code: newCode, healthCheckDate: null });
    }
    setForm(EMPTY_MEMBER_FORM);
    setShowAddForm(false);
    setEditMode(false);
    setEditingId(null);
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name.includes(search) || m.nickname.includes(search) || m.code.includes(search);
    const matchRole = roleFilter === 'ทั้งหมด' || m.role === roleFilter;
    const empStatus = m.employmentStatus || 'active';
    const matchEmployment =
      employmentFilter === 'all' ? true :
      employmentFilter === 'active_only' ? empStatus !== 'resigned' :
      empStatus === employmentFilter;
    return matchSearch && matchRole && matchEmployment;
  });

  // เรียงสมาชิกตาม POSITION_ORDER ภายในกลุ่ม
  const sortByPosition = (arr) => [...arr].sort((a, b) => {
    const ai = POSITION_ORDER.indexOf(a.position);
    const bi = POSITION_ORDER.indexOf(b.position);
    const aIdx = ai === -1 ? POSITION_ORDER.length : ai;
    const bIdx = bi === -1 ? POSITION_ORDER.length : bi;
    return aIdx - bIdx;
  });

  // จัดกลุ่มตามลำดับตำแหน่ง
  const groupedFiltered = ROLE_OPTIONS.reduce((acc, role) => {
    const group = sortByPosition(filtered.filter(m => m.role === role));
    if (group.length > 0) acc.push({ role, members: group });
    return acc;
  }, []);
  // บทบาทที่ไม่อยู่ใน ROLE_OPTIONS (legacy)
  const knownRoles = new Set(ROLE_OPTIONS);
  const otherRoles = [...new Set(filtered.filter(m => !knownRoles.has(m.role)).map(m => m.role))];
  otherRoles.forEach(role => {
    const group = sortByPosition(filtered.filter(m => m.role === role));
    if (group.length > 0) groupedFiltered.push({ role, members: group });
  });

  const handleExport = () => {
    const data = filtered.map(m => ({
      'รหัส': m.code,
      'ชื่อ-นามสกุล': m.name,
      'ชื่อเล่น': m.nickname,
      'เพศ': m.gender || '',
      'ศาสนา': m.religion || '',
      'การขับรถ': m.canDrive || '',
      'Role': m.role,
      'Position': m.position,
      'สังกัด': m.dept,
      'อีเมลส่วนตัว': m.email,
      'อีเมลบริษัท': m.emailCompany || '',
      'โทรศัพท์': m.phone,
      'วันที่เริ่มงาน': m.startDate,

      'Workload %': m.workload,
      'สุขภาพประจำปี': HEALTH_STATUS_CONFIG[m.healthCheck]?.label,
    }));
    exportToExcel(data, 'ทีมงาน_Paperless');
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ทีมงาน</h1>
          <p className="text-slate-500 text-sm">ทั้งหมด {members.length} คน</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => printTable('team-table')} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Printer size={16} /> พิมพ์
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={16} /> Excel
          </button>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={16} /> เพิ่มสมาชิก
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, ชื่อเล่น, รหัส..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={employmentFilter} onChange={e => setEmploymentFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
          <option value="active_only">ซ่อนผู้ลาออก</option>
          <option value="all">แสดงทั้งหมด</option>
          <option value="active">ยังปฏิบัติงานอยู่</option>
          <option value="resigned">ลาออก</option>
          <option value="transferred">ย้ายไปแผนกอื่น</option>
          <option value="other">อื่น ๆ</option>
        </select>
      </div>


      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table id="team-table" className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">รหัส</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ-นามสกุล</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ตำแหน่ง</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Site ปัจจุบัน</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Workload</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">สุขภาพ</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ติดต่อ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedFiltered.flatMap(({ role, members: grpMembers }) => [
                <tr key={`grp-${role}`}>
                  <td colSpan={8} className="px-4 py-2 bg-slate-50 border-y border-slate-200">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${ROLE_CONFIG[role]?.color || 'bg-slate-100 text-slate-600'}`}>
                      {ROLE_CONFIG[role]?.icon} {ROLE_CONFIG[role]?.label || role}
                      <span className="ml-1 opacity-70">({grpMembers.length} คน)</span>
                    </span>
                  </td>
                </tr>,
                ...grpMembers.map(member => {
                const site = member.currentSite || null;
                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{member.code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {member.photo ? (
                          <img src={member.photo} alt={member.nickname} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {member.nickname.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-800">{member.name}</div>
                          <div className="text-xs text-slate-400">{member.nickname}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {member.gender && (
                              <span className={`text-sm font-bold ${GENDER_ICON[member.gender]?.color || 'text-slate-400'}`}
                                title={member.gender}>
                                {GENDER_ICON[member.gender]?.symbol || member.gender}
                              </span>
                            )}
                            {member.canDrive && (
                              <span className="text-sm" title={member.canDrive}>
                                {DRIVE_ICON[member.canDrive]?.symbol}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${ROLE_CONFIG[member.role]?.color}`}>
                        {ROLE_CONFIG[member.role]?.icon} {member.role}
                      </span>
                      {(member.employmentStatus && member.employmentStatus !== 'active') && (
                        <div className={`mt-1 text-xs px-2 py-0.5 rounded-full inline-block ${EMPLOYMENT_STATUS_CONFIG[member.employmentStatus]?.color}`}>
                          {EMPLOYMENT_STATUS_CONFIG[member.employmentStatus]?.label}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{site || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full w-16">
                          <div
                            className={`h-full rounded-full ${member.workload >= 80 ? 'bg-red-400' : member.workload >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                            style={{ width: `${member.workload}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{member.workload}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${HEALTH_STATUS_CONFIG[member.healthCheck]?.color}`}>
                        {HEALTH_STATUS_CONFIG[member.healthCheck]?.icon} {HEALTH_STATUS_CONFIG[member.healthCheck]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <a href={`mailto:${member.email}`} className="hover:text-blue-500 transition-colors" title="ส่งอีเมล"><Mail size={14} /></a>
                        <a href={`tel:${member.phone}`} className="hover:text-green-500 transition-colors" title="โทรศัพท์"><Phone size={14} /></a>
                        {(member.lineId || member.lineNotifyToken) && (
                          <button onClick={() => { setLineModal(member); setLineMsg(''); setLineResult(null); }}
                            className="hover:text-green-500 transition-colors" title="ส่งข้อความ LINE">
                            <MessageCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditForm(member)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500 transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => { if (window.confirm(`ลบ "${member.name}" ออกจากระบบ?`)) removeMember(member.id); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }),
              ])}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                {selectedMember.photo ? (
                  <img src={selectedMember.photo} alt={selectedMember.nickname}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {selectedMember.nickname.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{selectedMember.name}</h2>
                      <p className="text-slate-500 text-sm">{selectedMember.position}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-3 py-1 rounded-full ${ROLE_CONFIG[selectedMember.role]?.color}`}>
                        {ROLE_CONFIG[selectedMember.role]?.icon} {selectedMember.role}
                      </span>
                      <button
                        onClick={() => { openEditForm(selectedMember); setSelectedMember(null); }}
                        className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500 transition-colors"
                        title="แก้ไขข้อมูล"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">รหัส:</span> <span className="font-medium">{selectedMember.code}</span></div>
                <div><span className="text-slate-400">ชื่อเล่น:</span> <span className="font-medium">{selectedMember.nickname}</span></div>
                <div className="col-span-2">
                  <span className="text-slate-400">สถานะการทำงาน:</span>{' '}
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${EMPLOYMENT_STATUS_CONFIG[selectedMember.employmentStatus || 'active']?.color}`}>
                    {EMPLOYMENT_STATUS_CONFIG[selectedMember.employmentStatus || 'active']?.label}
                  </span>
                </div>
                {selectedMember.gender && <div><span className="text-slate-400">เพศ:</span> <span className="font-medium">{selectedMember.gender}</span></div>}
                {selectedMember.religion && <div><span className="text-slate-400">ศาสนา:</span> <span className="font-medium">{selectedMember.religion}</span></div>}
                {selectedMember.canDrive && <div className="col-span-2"><span className="text-slate-400">การขับรถ:</span> <span className="font-medium">{selectedMember.canDrive}</span></div>}
                <div><span className="text-slate-400">อีเมล:</span> <span className="font-medium text-blue-600">{selectedMember.email}</span></div>
                {selectedMember.emailCompany && <div><span className="text-slate-400">อีเมลบริษัท:</span> <span className="font-medium text-blue-600">{selectedMember.emailCompany}</span></div>}
                <div><span className="text-slate-400">โทรศัพท์:</span> <span className="font-medium">{selectedMember.phone}</span></div>
                <div><span className="text-slate-400">เริ่มงาน:</span> <span className="font-medium">{selectedMember.startDate}</span></div>
                <div><span className="text-slate-400">Workload:</span> <span className="font-medium">{selectedMember.workload}%</span></div>
                <div>
                  <span className="text-slate-400">สุขภาพ:</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${HEALTH_STATUS_CONFIG[selectedMember.healthCheck]?.color}`}>
                    {HEALTH_STATUS_CONFIG[selectedMember.healthCheck]?.label}
                  </span>
                </div>
              </div>
              {selectedMember.skills?.length > 0 && (
                <div>
                  <span className="text-slate-400 text-sm">ทักษะ:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedMember.skills.map(s => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* LINE section in detail */}
            {(selectedMember.lineId || selectedMember.lineNotifyToken) && (
              <div className="px-6 pb-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                    <MessageCircle size={15} /> LINE
                  </div>
                  {selectedMember.lineId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20 shrink-0">LINE ID:</span>
                      <span className="text-sm font-medium text-slate-700 flex-1">{selectedMember.lineId}</span>
                      <button onClick={() => openLineChat(selectedMember.lineId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">
                        <MessageCircle size={12} /> เปิดแชท
                      </button>
                    </div>
                  )}
                  {selectedMember.lineNotifyToken && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20 shrink-0">Notify Token:</span>
                      <span className="text-xs font-mono text-slate-500 flex-1 truncate">
                        {selectedMember.lineNotifyToken.slice(0, 8)}{'•'.repeat(12)}
                      </span>
                      <button onClick={() => copyToken(selectedMember.lineNotifyToken)}
                        className="flex items-center gap-1 px-2 py-1.5 border border-green-200 text-green-700 text-xs rounded-lg hover:bg-green-100">
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                      </button>
                      <button onClick={() => { setLineModal(selectedMember); setLineMsg(''); setLineResult(null); setSelectedMember(null); }}
                        className="flex items-center gap-1 px-2 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">
                        <Send size={12} /> ส่ง
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="px-6 pb-6">
              <button onClick={() => setSelectedMember(null)} className="w-full py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* LINE Send Message Modal */}
      {lineModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setLineModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">ส่งข้อความ LINE</div>
                  <div className="text-xs text-slate-400">{lineModal.nickname} ({lineModal.name})</div>
                </div>
              </div>
              <button onClick={() => setLineModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* ช่องทาง */}
              <div className="grid grid-cols-2 gap-3">
                {lineModal.lineId && (
                  <button onClick={() => openLineChat(lineModal.lineId)}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors">
                    <MessageCircle size={20} className="text-green-500" />
                    <div className="text-xs font-medium text-green-700">เปิดแชท LINE</div>
                    <div className="text-xs text-slate-400 truncate w-full text-center">{lineModal.lineId}</div>
                  </button>
                )}
                {lineModal.lineNotifyToken && (
                  <div className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-xl">
                    <Send size={20} className="text-blue-500" />
                    <div className="text-xs font-medium text-blue-700">LINE Notify</div>
                    <div className="text-xs text-slate-400">ส่งข้อความอัตโนมัติ</div>
                  </div>
                )}
              </div>

              {/* LINE Notify send form */}
              {lineModal.lineNotifyToken && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">ข้อความที่จะส่ง</label>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 truncate max-w-28">
                        {lineModal.lineNotifyToken.slice(0, 8)}…
                      </span>
                      <button onClick={() => copyToken(lineModal.lineNotifyToken)}
                        className="flex items-center gap-1 hover:text-slate-600">
                        {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                        {copied ? 'คัดลอกแล้ว' : 'คัดลอก Token'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={lineMsg}
                    onChange={e => setLineMsg(e.target.value)}
                    rows={4}
                    placeholder={`สวัสดี ${lineModal.nickname},\nข้อความจาก Paperless Team...`}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                  {lineResult && (
                    <div className={`text-xs p-3 rounded-lg ${lineResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {lineResult.ok ? '✓ ' : '⚠️ '}{lineResult.text}
                      {!lineResult.ok && (
                        <div className="mt-2 text-slate-500">
                          วิธีแก้: ใช้ curl หรือ Postman ส่งจาก server แทน หรือติดตั้ง CORS proxy
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => sendLineNotify(lineModal.lineNotifyToken, lineMsg)}
                    disabled={lineSending || !lineMsg.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {lineSending ? (
                      <span className="animate-pulse">กำลังส่ง...</span>
                    ) : (
                      <><Send size={15} /> ส่งข้อความ LINE Notify</>
                    )}
                  </button>
                </div>
              )}

              {!lineModal.lineId && !lineModal.lineNotifyToken && (
                <p className="text-center text-slate-400 text-sm py-4">ยังไม่ได้ตั้งค่า LINE ID หรือ Notify Token</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddForm(false); setFormError(''); setEditMode(false); setEditingId(null); setForm(EMPTY_MEMBER_FORM); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800">{editMode ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{editMode ? 'แก้ไขข้อมูลสมาชิกทีม Paperless' : 'กรอกข้อมูลสมาชิกทีม Paperless'}</p>
            </div>

            <div className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  ⚠️ {formError}
                </div>
              )}

              {/* รูปภาพ */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center bg-slate-50 cursor-pointer hover:border-blue-400 transition-colors relative group"
                  onClick={() => photoInputRef.current?.click()}
                >
                  {form.photo ? (
                    <img src={form.photo} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <Camera size={24} />
                      <span className="text-xs">อัปโหลดรูป</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-slate-400">คลิกเพื่อเลือกรูปภาพ (JPG, PNG)</p>
                {form.photo && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, photo: '' }))}
                    className="text-xs text-red-400 hover:text-red-600">
                    ลบรูปภาพ
                  </button>
                )}
              </div>

              {/* ข้อมูลส่วนตัว */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">ข้อมูลส่วนตัว</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="เช่น นายสมชาย ใจดี"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ชื่อเล่น <span className="text-red-500">*</span></label>
                    <input value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})}
                      placeholder="เช่น ชาย"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">เพศ</label>
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="">-- เลือกเพศ --</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="ไม่ระบุ">ไม่ระบุ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ศาสนา</label>
                    <select value={form.religion} onChange={e => setForm({...form, religion: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="">-- เลือกศาสนา --</option>
                      <option value="พุทธ">พุทธ</option>
                      <option value="คริสต์">คริสต์</option>
                      <option value="อิสลาม">อิสลาม</option>
                      <option value="ฮินดู">ฮินดู</option>
                      <option value="ไม่มีศาสนา">ไม่มีศาสนา</option>
                      <option value="อื่น ๆ">อื่น ๆ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">การขับรถ</label>
                    <select value={form.canDrive} onChange={e => setForm({...form, canDrive: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="">-- เลือก --</option>
                      <option value="ขับรถได้ (มีใบขับขี่)">ขับรถได้ (มีใบขับขี่)</option>
                      <option value="ขับรถได้ (ไม่มีใบขับขี่)">ขับรถได้ (ไม่มีใบขับขี่)</option>
                      <option value="ขับรถไม่ได้">ขับรถไม่ได้</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ตำแหน่งงาน */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">ตำแหน่งงาน</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Role (ตำแหน่ง)</label>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">สังกัดทีม (หัวหน้าทีม)</label>
                    <select value={form.teamId} onChange={e => setForm({...form, teamId: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="">— ไม่ระบุทีม —</option>
                      {members.filter(m => m.role === 'Leader Team').map(l => (
                        <option key={l.code} value={l.code}>ทีม {l.nickname} ({l.name.split(' ')[0]})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">สังกัด (Dept)</label>
                    <input value={form.dept} onChange={e => setForm({...form, dept: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Position (ตำแหน่งเต็ม)</label>
                    <select value={form.position} onChange={e => setForm({...form, position: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="">-- เลือกตำแหน่ง --</option>
                      {positionOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {form.position === 'อื่น ๆ' && (
                      <input value={form.positionCustom || ''} onChange={e => setForm({...form, positionCustom: e.target.value})}
                        placeholder="ระบุตำแหน่งเต็ม"
                        className="w-full mt-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Workload (%)</label>
                    <input type="number" min="0" max="100" value={form.workload} onChange={e => setForm({...form, workload: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">วันที่เริ่มงาน</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">สถานะการทำงาน</label>
                    <select value={form.employmentStatus} onChange={e => setForm({...form, employmentStatus: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="active">ยังปฏิบัติงานอยู่</option>
                      <option value="resigned">ลาออก</option>
                      <option value="transferred">ย้ายไปแผนกอื่น</option>
                      <option value="other">อื่น ๆ</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Site ปัจจุบัน (โรงพยาบาลที่ปฏิบัติงาน)</label>
                    <select value={form.currentSite || ''} onChange={e => setForm({...form, currentSite: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="">— ไม่ได้อยู่ที่ไซต์ —</option>
                      {hospitalNames.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* ช่องทางติดต่อ */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">ช่องทางติดต่อ</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">อีเมลส่วนตัว <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="email@gmail.com"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">อีเมลบริษัท</label>
                    <input type="email" value={form.emailCompany} onChange={e => setForm({...form, emailCompany: e.target.value})}
                      placeholder="name@bms.co.th"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">โทรศัพท์</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="0xx-xxx-xxxx"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* LINE */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <span className="text-green-500">●</span> LINE
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">LINE ID</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                      <input value={form.lineId} onChange={e => setForm({...form, lineId: e.target.value})}
                        placeholder="line_id หรือ @handle"
                        className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">ใช้สำหรับเปิดแชท LINE ของสมาชิก</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">LINE Notify Token</label>
                    <input value={form.lineNotifyToken} onChange={e => setForm({...form, lineNotifyToken: e.target.value})}
                      placeholder="วาง Token จาก notify-bot.line.me"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-xs" />
                    <p className="text-xs text-slate-400 mt-1">
                      ขอ Token ได้ที่{' '}
                      <a href="https://notify-bot.line.me/my/" target="_blank" rel="noreferrer" className="text-green-600 hover:underline">
                        notify-bot.line.me/my
                      </a>
                      {' '}— ใช้ส่งข้อความแจ้งเตือนอัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>

              {/* ทักษะ */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">ทักษะ</h3>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">ทักษะ (คั่นด้วยจุลภาค)</label>
                  <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})}
                    placeholder="เช่น React, Node.js, PostgreSQL, HOSxP"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 pt-4">
              <button onClick={() => { setShowAddForm(false); setFormError(''); setForm(EMPTY_MEMBER_FORM); setEditMode(false); setEditingId(null); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                ยกเลิก
              </button>
              <button onClick={handleAddSubmit}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
                {editMode ? 'บันทึกการแก้ไข' : 'บันทึกสมาชิก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
