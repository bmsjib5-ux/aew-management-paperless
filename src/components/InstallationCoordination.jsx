import { useState } from 'react';
import { Search, Download, Printer, Plus, ChevronDown, ChevronUp, AlertCircle, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { INSTALL_STATUS_CONFIG, CHECKLIST_ITEMS } from '../data/installationData';
import { exportToExcel, printTable } from '../utils/exportUtils';
import { useSettings } from '../context/SettingsContext';
import { useMembers } from '../context/MembersContext';
import { useInstallations } from '../context/InstallationsContext';

const YEAR_START = 2565;
const YEAR_END   = 2572;
const YEAR_RANGE = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_START + i).reverse();
const YEARS = ['ทั้งหมด', ...YEAR_RANGE.map(String)];
const STATUSES = ['ทั้งหมด', 'completed', 'in_progress', 'pending', 'warranty_expired'];

const EMPTY_FORM = {
  hospital: '', pTaiga: '', hmain: '',
  team: 'ทีม 1', teamLead: '', teamMembers: '', workType: 'Onsite',
  startDate: '', endDate: '', warrantyEnd: '',
  wards: '', bedType: 'รวม', staffCount: 1,
  lineGroup: 'มี', called: '', callDate: '', marketingName: '', remark: '',
  status: 'pending', year: 2567,
  contractPrice: '', sellPrice: '', paymentStatus: 'not_collected',
  collectedAmount: '', collectedDate: '', paymentRemark: '',
  travelCost: '', perDiem: '', adv: '',
  advStatus: 'not_done', advDate: '',
  clearAdvStatus: 'not_done', clearAdvDate: '',
  licenseImportPDF: false, licenseTools: false,
  sheetLabel1: '', sheetLink1: '',
  sheetLabel2: '', sheetLink2: '',
  sheetLabel3: '', sheetLink3: '',
};

// คำนวณวันที่ทำ Adv: 4 สัปดาห์ก่อนเริ่มงาน ย้อนไปหาวันอังคาร
function calcAdvDate(startDate) {
  if (!startDate) return '';
  const d = new Date(startDate);
  d.setDate(d.getDate() - 28);
  const day = d.getDay(); // 0=อา,1=จ,2=อ,...
  const daysBack = (day - 2 + 7) % 7;
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split('T')[0];
}

// คำนวณวันที่ Clear Adv: 1 สัปดาห์หลังวันสุดท้าย
function calcClearAdvDate(endDate) {
  if (!endDate) return '';
  const d = new Date(endDate);
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

const PAYMENT_STATUS_CONFIG = {
  collected:     { label: 'เก็บครบแล้ว',    color: 'bg-green-100 text-green-700' },
  partial:       { label: 'เก็บบางส่วน',    color: 'bg-yellow-100 text-yellow-700' },
  not_collected: { label: 'ยังไม่ได้เก็บ',  color: 'bg-red-100 text-red-700' },
};

function fmtMoney(val) {
  const n = Number(val);
  if (!val && val !== 0) return '—';
  return n.toLocaleString('th-TH') + ' บาท';
}

// Multi-select members dropdown component
function MembersSelect({ value, onChange, members }) {
  const [open, setOpen] = useState(false);
  const selected = value ? value.split(', ').filter(Boolean) : [];

  const toggle = (name) => {
    const next = selected.includes(name)
      ? selected.filter(s => s !== name)
      : [...selected, name];
    onChange(next.join(', '));
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left">
        <span className={selected.length ? 'text-slate-700' : 'text-slate-400'}>
          {selected.length ? selected.join(', ') : 'เลือกทีมงาน...'}
        </span>
        <ChevronDown size={14} className="shrink-0 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {members.map(name => (
            <label key={name} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
              <input type="checkbox" checked={selected.includes(name)} onChange={() => toggle(name)}
                className="accent-blue-600" />
              <span>{name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InstallationCoordination() {
  const { settings, hospitalList, getHmain } = useSettings();
  const { members: teamMembers } = useMembers();
  const { installations, setInstallations } = useInstallations();
  const memberNames = teamMembers
    .filter(m => (m.employmentStatus || 'active') !== 'resigned')
    .map(m => m.nickname);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [workTypeFilter, setWorkTypeFilter] = useState('ทั้งหมด');
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const openEditForm = (install) => {
    setForm({
      hospital:       install.hospital     || '',
      pTaiga:         install.pTaiga       || '',
      hmain:          install.hmain        || '',
      team:           install.team         || 'ทีม 1',
      teamLead:       install.teamLead     || '',
      teamMembers:    install.teamMembers  || '',
      workType:       install.workType     || 'Onsite',
      startDate:      install.startDate    || '',
      endDate:        install.endDate      || '',
      warrantyEnd:    install.warrantyEnd  || '',
      wards:          install.wards        || '',
      bedType:        install.bedType      || 'รวม',
      staffCount:     install.staffCount   || 1,
      lineGroup:      install.lineGroup    || 'มี',
      called:         install.called       || '',
      callDate:       install.callDate     || '',
      marketingName:  install.marketingName|| '',
      remark:         install.remark       || '',
      status:         install.status       || 'pending',
      year:           install.year         || 2567,
      contractPrice:  install.contractPrice|| '',
      sellPrice:      install.sellPrice    || '',
      paymentStatus:  install.paymentStatus|| 'not_collected',
      collectedAmount:install.collectedAmount|| '',
      collectedDate:  install.collectedDate|| '',
      paymentRemark:  install.paymentRemark|| '',
      travelCost:     install.travelCost   || '',
      perDiem:        install.perDiem      || '',
      adv:            install.adv          || '',
      advStatus:      install.advStatus    || 'not_done',
      advDate:        install.advDate      || '',
      clearAdvStatus: install.clearAdvStatus|| 'not_done',
      clearAdvDate:   install.clearAdvDate || '',
      licenseImportPDF: install.licenseImportPDF || false,
      licenseTools:     install.licenseTools    || false,
      sheetLabel1: install.sheetLabel1 || '', sheetLink1: install.sheetLink1 || '',
      sheetLabel2: install.sheetLabel2 || '', sheetLink2: install.sheetLink2 || '',
      sheetLabel3: install.sheetLabel3 || '', sheetLink3: install.sheetLink3 || '',
    });
    setEditingId(install.id);
    setEditMode(true);
    setShowAddForm(true);
    setFormError('');
  };

  const filtered = installations.filter(i => {
    const matchSearch = i.hospital.includes(search) || i.teamLead.includes(search) || i.teamMembers.includes(search);
    const matchYear = yearFilter === 'ทั้งหมด' || String(i.year) === yearFilter;
    const matchStatus = statusFilter === 'ทั้งหมด' || i.status === statusFilter;
    const matchWorkType = workTypeFilter === 'ทั้งหมด' || i.workType === workTypeFilter;
    return matchSearch && matchYear && matchStatus && matchWorkType;
  });

  const toggleChecklist = (id, key) => {
    setInstallations(prev => prev.map(i => i.id === id ? { ...i, [key]: !i[key] } : i));
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleAddSubmit = () => {
    if (!form.hospital.trim()) { setFormError('กรุณาระบุชื่อโรงพยาบาล'); return; }
    if (!form.startDate) { setFormError('กรุณาระบุวันที่เริ่มเข้าไซต์'); return; }
    setFormError('');
    if (editMode && editingId !== null) {
      setInstallations(prev => prev.map(i => i.id === editingId ? {
        ...i, ...form,
        wards: parseInt(form.wards) || 0,
        staffCount: parseInt(form.staffCount) || 1,
      } : i));
    } else {
      const newId = Math.max(...installations.map(i => i.id), 0) + 1;
      const newSeq = installations.filter(i => i.year === form.year).length + 1;
      setInstallations(prev => [...prev, {
        ...form,
        id: newId,
        seq: newSeq,
        wards: parseInt(form.wards) || 0,
        staffCount: parseInt(form.staffCount) || 1,
      }]);
      setYearFilter(String(form.year));
    }
    closeForm();
  };

  const handleExport = () => {
    const data = filtered.map(i => ({
      'ลำดับ': i.seq,
      'P-Taiga': i.pTaiga,
      'Hmain': i.hmain,
      'โรงพยาบาล': i.hospital,
      'ทีม': i.team,
      'หัวหน้าทีม': i.teamLead,
      'ทีมงาน': i.teamMembers,
      'ประเภทงาน': i.workType,
      'วันที่เริ่ม': i.startDate,
      'วันที่สิ้นสุด': i.endDate,
      'วันหมดประกัน': i.warrantyEnd,
      'จำนวน Ward': i.wards,
      'ราคาสัญญา': i.contractPrice || '',
      'ราคาขาย': i.sellPrice || '',
      'สถานะการเก็บเงิน': PAYMENT_STATUS_CONFIG[i.paymentStatus]?.label || '',
      'ยอดที่เก็บได้': i.collectedAmount || '',
      'วันที่เก็บเงิน': i.collectedDate || '',
      'ค่าเดินทาง': i.travelCost || '',
      'เบี้ยเลี้ยง': i.perDiem || '',
      'Adv': i.adv || '',
      'Clear Adv': i.clearAdv ? '✓' : '',
      'ไลน์กลุ่ม': i.lineGroup,
      'สถานะ': INSTALL_STATUS_CONFIG[i.status]?.label,
      'หมายเหตุ': i.remark,
      ...Object.fromEntries(CHECKLIST_ITEMS.map(c => [c.label, i[c.key] ? '✓' : ''])),
    }));
    exportToExcel(data, `ประสานงานติดตั้งปี${yearFilter === 'ทั้งหมด' ? 'ทั้งหมด' : yearFilter}`);
  };

  // Summary stats
  const stats = {
    total: installations.length,
    completed: installations.filter(i => i.status === 'completed').length,
    inProgress: installations.filter(i => i.status === 'in_progress').length,
    pending: installations.filter(i => i.status === 'pending').length,
    warrantyExpired: installations.filter(i => i.status === 'warranty_expired').length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ประสานงานติดตั้งประจำปี</h1>
          <p className="text-slate-500 text-sm">BMS HOSxP IPD Paperless — ติดตามการติดตั้งในโรงพยาบาลทั่วประเทศ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => printTable('install-table')} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Printer size={16} /> พิมพ์
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={16} /> Excel
          </button>
          <button onClick={() => { setEditMode(false); setEditingId(null); setForm(EMPTY_FORM); setShowAddForm(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={16} /> เพิ่ม รพ.
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'ทั้งหมด', value: stats.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'เสร็จสิ้น', value: stats.completed, color: 'bg-green-50 text-green-700' },
          { label: 'กำลังดำเนินการ', value: stats.inProgress, color: 'bg-blue-50 text-blue-700' },
          { label: 'รอดำเนินการ', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'หมดประกัน', value: stats.warrantyExpired, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาโรงพยาบาล, หัวหน้าทีม, ทีมงาน..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
          <option value="ทั้งหมด">สถานะทั้งหมด</option>
          {Object.entries(INSTALL_STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={workTypeFilter} onChange={e => setWorkTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
          <option value="ทั้งหมด">ประเภทงานทั้งหมด</option>
          {[...new Set(installations.map(i => i.workType).filter(Boolean))].map(wt => (
            <option key={wt} value={wt}>{wt}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table id="install-table" className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-center px-3 py-3 font-medium text-slate-600 w-10">#</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">โรงพยาบาล</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ทีม / หัวหน้า</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่ติดตั้ง</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">หมดประกัน</th>
                <th className="text-center px-3 py-3 font-medium text-slate-600">Ward</th>
                <th className="text-left px-3 py-3 font-medium text-slate-600">ประเภทงาน / เตียง</th>
                <th className="text-left px-3 py-3 font-medium text-slate-600">Adv / Clear Adv</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ไลน์กลุ่ม</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">สถานะ</th>
                <th className="text-center px-3 py-3 font-medium text-slate-600">Checklist</th>
                <th className="w-10 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(install => {
                const isExpanded = expandedRow === install.id;
                const checkDone = CHECKLIST_ITEMS.filter(c => install[c.key]).length;
                return (
                  <>
                    <tr key={install.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 text-center text-slate-400 text-xs">{install.seq}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{install.hospital}</div>
                        <div className="text-xs text-slate-400">{install.pTaiga} | Hmain: {install.hmain}</div>
                        {install.remark && (
                          <div className="text-xs text-orange-500 flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} /> {install.remark.slice(0, 50)}{install.remark.length > 50 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700 text-xs">{install.team}</div>
                        <div className="text-xs text-slate-500">{install.teamLead}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>{install.startDate}</div>
                        <div className="text-slate-400">ถึง {install.endDate}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{install.warrantyEnd}</td>
                      <td className="px-3 py-3 text-center text-xs font-medium">{install.wards}</td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-slate-700">{install.workType || '—'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{install.bedType || '—'}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`block text-xs px-1.5 py-0.5 rounded-full mb-0.5 w-fit ${
                          (install.advStatus || 'not_done') === 'done'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          Adv: {(install.advStatus || 'not_done') === 'done' ? '✓' : '—'}
                        </span>
                        <span className={`block text-xs px-1.5 py-0.5 rounded-full w-fit ${
                          (install.clearAdvStatus === 'done' || install.clearAdv)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          Clear: {(install.clearAdvStatus === 'done' || install.clearAdv) ? '✓' : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${install.lineGroup === 'มี' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {install.lineGroup || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${INSTALL_STATUS_CONFIG[install.status]?.color}`}>
                          {INSTALL_STATUS_CONFIG[install.status]?.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <div className="text-xs font-medium text-slate-600">{checkDone}/{CHECKLIST_ITEMS.length}</div>
                          <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(checkDone / CHECKLIST_ITEMS.length) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditForm(install)}
                            className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-600"
                            title="แก้ไข"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => { if (window.confirm(`ลบ "${install.hospital}" ออกจากระบบ?`)) setInstallations(prev => prev.filter(i => i.id !== install.id)); }}
                            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : install.id)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${install.id}-expanded`} className="bg-slate-50">
                        <td colSpan={10} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Details */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-slate-700 text-sm">รายละเอียด</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div><span className="text-slate-400">ประเภทงาน:</span> <span className="font-medium">{install.workType}</span></div>
                                <div><span className="text-slate-400">ประเภทเตียง:</span> <span className="font-medium">{install.bedType}</span></div>
                                <div><span className="text-slate-400">จำนวนคน:</span> <span className="font-medium">{install.staffCount} คน</span></div>
                                <div><span className="text-slate-400">ผู้ประสานงาน:</span> <span className="font-medium">{install.called}</span></div>
                                <div><span className="text-slate-400">วันที่โทร:</span> <span className="font-medium">{install.callDate || '—'}</span></div>
                                {install.marketingName && <div className="col-span-2"><span className="text-slate-400">การตลาดที่ดูแล:</span> <span className="font-medium text-purple-700">{install.marketingName}</span></div>}
                              </div>
                              <div className="text-xs">
                                <span className="text-slate-400">ทีมงาน:</span> <span className="font-medium">{install.teamMembers}</span>
                              </div>
                              {install.remark && (
                                <div className="text-xs bg-orange-50 border border-orange-100 rounded p-2 text-orange-700">
                                  📌 {install.remark}
                                </div>
                              )}
                            </div>

                            {/* Financial */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-slate-700 text-sm">💰 การเงิน</h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center bg-white rounded px-2 py-1.5 border border-slate-100">
                                  <span className="text-slate-400">ราคาสัญญา</span>
                                  <span className="font-semibold text-slate-700">{fmtMoney(install.contractPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white rounded px-2 py-1.5 border border-slate-100">
                                  <span className="text-slate-400">ราคาขาย</span>
                                  <span className="font-semibold text-slate-700">{fmtMoney(install.sellPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white rounded px-2 py-1.5 border border-slate-100">
                                  <span className="text-slate-400">สถานะเก็บเงิน</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_CONFIG[install.paymentStatus]?.color}`}>
                                    {PAYMENT_STATUS_CONFIG[install.paymentStatus]?.label || '—'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center bg-white rounded px-2 py-1.5 border border-slate-100">
                                  <span className="text-slate-400">ยอดที่เก็บได้</span>
                                  <span className="font-semibold text-green-700">{fmtMoney(install.collectedAmount)}</span>
                                </div>
                                {install.collectedDate && (
                                  <div className="flex justify-between items-center bg-white rounded px-2 py-1.5 border border-slate-100">
                                    <span className="text-slate-400">วันที่เก็บเงิน</span>
                                    <span className="font-medium">{install.collectedDate}</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-3 gap-1 pt-1">
                                  <div className="bg-slate-100 rounded p-1.5 text-center">
                                    <div className="text-slate-400 text-xs">ค่าเดินทาง</div>
                                    <div className="font-semibold text-slate-700">{install.travelCost ? Number(install.travelCost).toLocaleString() : '—'}</div>
                                  </div>
                                  <div className="bg-slate-100 rounded p-1.5 text-center">
                                    <div className="text-slate-400 text-xs">เบี้ยเลี้ยง</div>
                                    <div className="font-semibold text-slate-700">{install.perDiem ? Number(install.perDiem).toLocaleString() : '—'}</div>
                                  </div>
                                  <div className="bg-slate-100 rounded p-1.5 text-center">
                                    <div className="text-slate-400 text-xs">Adv (บาท)</div>
                                    <div className="font-semibold text-slate-700">{install.adv ? Number(install.adv).toLocaleString() : '—'}</div>
                                  </div>
                                </div>
                                {/* Adv status */}
                                <div className="bg-blue-50 border border-blue-100 rounded p-2 text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">สถานะ Adv</span>
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${(install.advStatus || 'not_done') === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {(install.advStatus || 'not_done') === 'done' ? 'ดำเนินการแล้ว' : 'ยังไม่ได้ทำ'}
                                    </span>
                                  </div>
                                  {install.advDate && <div className="flex justify-between"><span className="text-slate-400">วันที่ทำ Adv</span><span className="font-medium">{install.advDate}</span></div>}
                                </div>
                                {/* Clear Adv status */}
                                <div className="bg-teal-50 border border-teal-100 rounded p-2 text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">สถานะ Clear Adv</span>
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                                      (install.clearAdvStatus === 'done' || install.clearAdv) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {(install.clearAdvStatus === 'done' || install.clearAdv) ? 'Clear แล้ว' : 'ยังไม่ได้ Clear'}
                                    </span>
                                  </div>
                                  {install.clearAdvDate && <div className="flex justify-between"><span className="text-slate-400">วันที่ Clear Adv</span><span className="font-medium">{install.clearAdvDate}</span></div>}
                                </div>
                                {install.paymentRemark && (
                                  <div className="text-xs text-slate-500 bg-white border border-slate-100 rounded px-2 py-1.5">
                                    หมายเหตุ: {install.paymentRemark}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Checklist */}
                            <div>
                              <h4 className="font-semibold text-slate-700 text-sm mb-3">Checklist ติดตั้ง</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {CHECKLIST_ITEMS.map(item => (
                                  <label key={item.key} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded p-1 transition-colors">
                                    <button
                                      onClick={() => toggleChecklist(install.id, item.key)}
                                      className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${install[item.key] ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'}`}
                                    >
                                      {install[item.key] && <span className="text-white text-xs">✓</span>}
                                    </button>
                                    <span className={`text-xs ${install[item.key] ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                      {item.label}
                                    </span>
                                  </label>
                                ))}
                              </div>

                              {/* Google Sheet Links */}
                              {[1,2,3].some(n => install[`sheetLink${n}`]) && (
                                <div className="mt-4 pt-3 border-t border-slate-200">
                                  <h5 className="text-xs font-semibold text-slate-600 mb-2">🔗 Google Sheet Links</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {[1,2,3].map(n => {
                                      const link  = install[`sheetLink${n}`];
                                      const label = install[`sheetLabel${n}`];
                                      if (!link) return null;
                                      return (
                                        <a key={n} href={link} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">
                                          <ExternalLink size={11} /> {label || `Sheet ${n}`}
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p>ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Add Hospital Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800">{editMode ? 'แก้ไขข้อมูลโรงพยาบาล' : 'เพิ่มโรงพยาบาลใหม่'}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{editMode ? `แก้ไขข้อมูล: ${form.hospital}` : 'บันทึกข้อมูลการประสานงานติดตั้ง'}</p>
            </div>

            <div className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  ⚠️ {formError}
                </div>
              )}

              {/* ข้อมูลโรงพยาบาล */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">ข้อมูลโรงพยาบาล</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ชื่อโรงพยาบาล <span className="text-red-500">*</span></label>
                    <select value={form.hospital}
                      onChange={e => {
                        const name = e.target.value;
                        setForm(f => ({...f, hospital: name, hmain: getHmain(name) || f.hmain}));
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">-- เลือกโรงพยาบาล --</option>
                      {hospitalList.map(h => (
                        <option key={h.name} value={h.name}>{h.name}{h.hmain ? ` (${h.hmain})` : ''}</option>
                      ))}
                    </select>
                    <input value={form.hospital}
                      onChange={e => {
                        const name = e.target.value;
                        setForm(f => ({...f, hospital: name, hmain: getHmain(name) || f.hmain}));
                      }}
                      placeholder="หรือพิมพ์ชื่อโรงพยาบาล (ถ้าไม่มีในรายการ)"
                      className="w-full mt-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">P-Taiga</label>
                    <input value={form.pTaiga} onChange={e => setForm({...form, pTaiga: e.target.value})}
                      placeholder="T-xxx"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Hmain (รหัส รพ.)</label>
                    <input value={form.hmain} onChange={e => setForm({...form, hmain: e.target.value})}
                      placeholder="เติมอัตโนมัติเมื่อเลือก รพ."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ปี</label>
                    <select value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                      {YEAR_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* ข้อมูลการติดตั้ง */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">ข้อมูลการติดตั้ง</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">วันที่เริ่มเข้าไซต์ <span className="text-red-500">*</span></label>
                    <input type="date" value={form.startDate}
                      onChange={e => {
                        const d = e.target.value;
                        setForm(f => ({...f, startDate: d, advDate: f.advDate || calcAdvDate(d)}));
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">วันสุดท้าย</label>
                    <input type="date" value={form.endDate}
                      onChange={e => {
                        const d = e.target.value;
                        setForm(f => ({...f, endDate: d, clearAdvDate: f.clearAdvDate || calcClearAdvDate(d)}));
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">วันสิ้นสุดระยะเวลารับประกัน</label>
                    <input type="date" value={form.warrantyEnd} onChange={e => setForm({...form, warrantyEnd: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">จำนวน Ward</label>
                    <input type="number" min="0" value={form.wards} onChange={e => setForm({...form, wards: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">สถานะ</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                      {Object.entries(INSTALL_STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ประเภทงาน</label>
                    <select value={form.workType} onChange={e => setForm({...form, workType: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      {settings.workTypes.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ประเภทเตียง</label>
                    <select value={form.bedType} onChange={e => setForm({...form, bedType: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      {settings.bedTypes.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* ทีมงาน */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">ทีมงาน</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ทีม</label>
                    <select value={form.team} onChange={e => setForm({...form, team: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      {settings.teams.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">จำนวนคนทำงาน</label>
                    <input type="number" min="1" value={form.staffCount} onChange={e => setForm({...form, staffCount: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">หัวหน้าทีม</label>
                    <select value={form.teamLead} onChange={e => setForm({...form, teamLead: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="">-- เลือกหัวหน้าทีม --</option>
                      {memberNames.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ทีมงาน <span className="text-slate-400">(เลือกได้หลายคน)</span></label>
                    <MembersSelect
                      value={form.teamMembers}
                      onChange={val => setForm({...form, teamMembers: val})}
                      members={memberNames}
                    />
                  </div>
                </div>
              </div>

              {/* ประสานงาน */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">ประสานงาน</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ไลน์กลุ่ม</label>
                    <select value={form.lineGroup} onChange={e => setForm({...form, lineGroup: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      {settings.lineGroups.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ผู้ประสานงาน (โทร)</label>
                    <input value={form.called} onChange={e => setForm({...form, called: e.target.value})}
                      placeholder="ชื่อผู้โทรประสาน"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ชื่อการตลาดที่ดูแล</label>
                    <input value={form.marketingName} onChange={e => setForm({...form, marketingName: e.target.value})}
                      placeholder="ชื่อทีมการตลาด / เซลล์"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">หมายเหตุ</label>
                    <textarea value={form.remark} onChange={e => setForm({...form, remark: e.target.value})}
                      rows={2} placeholder="หมายเหตุเพิ่มเติม"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none resize-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* การเงิน */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">💰 การเงิน</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ราคาตามสัญญา (บาท)</label>
                    <input type="number" min="0" value={form.contractPrice} onChange={e => setForm({...form, contractPrice: e.target.value})}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ราคาขาย (บาท)</label>
                    <input type="number" min="0" value={form.sellPrice} onChange={e => setForm({...form, sellPrice: e.target.value})}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">สถานะการเก็บเงิน</label>
                    <select value={form.paymentStatus} onChange={e => setForm({...form, paymentStatus: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                      {Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ยอดที่เก็บได้แล้ว (บาท)</label>
                    <input type="number" min="0" value={form.collectedAmount} onChange={e => setForm({...form, collectedAmount: e.target.value})}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">วันที่เก็บเงิน</label>
                    <input type="date" value={form.collectedDate} onChange={e => setForm({...form, collectedDate: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">ค่าเดินทาง (บาท)</label>
                    <input type="number" min="0" value={form.travelCost} onChange={e => setForm({...form, travelCost: e.target.value})}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">เบี้ยเลี้ยง (บาท)</label>
                    <input type="number" min="0" value={form.perDiem} onChange={e => setForm({...form, perDiem: e.target.value})}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Adv (บาท)</label>
                    <input type="number" min="0" value={form.adv} onChange={e => setForm({...form, adv: e.target.value})}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">หมายเหตุการเงิน</label>
                    <input value={form.paymentRemark} onChange={e => setForm({...form, paymentRemark: e.target.value})}
                      placeholder="เช่น เก็บงวดแรก 50%"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Advance */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1 pb-1 border-b border-slate-100">💵 Advance เงิน</h3>
                <p className="text-xs text-slate-400 mb-3">เกณฑ์: ทำ Adv ล่วงหน้า 4 สัปดาห์ก่อนเริ่มไซต์ (ก่อนวันอังคาร)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">สถานะการ Adv</label>
                    <select value={form.advStatus || 'not_done'} onChange={e => setForm({...form, advStatus: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="not_done">ยังไม่ได้ทำ</option>
                      <option value="done">ดำเนินการแล้ว</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                      วันที่ทำ Adv
                      {form.startDate && <span className="text-blue-500 ml-1 font-normal">(แนะนำ: {calcAdvDate(form.startDate)})</span>}
                    </label>
                    <input type="date" value={form.advDate || ''} onChange={e => setForm({...form, advDate: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Clear Advance */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1 pb-1 border-b border-slate-100">🔄 Clear Advance เงิน</h3>
                <p className="text-xs text-slate-400 mb-3">เกณฑ์: Clear Adv หลังวันสุดท้ายที่ทำงาน 1 สัปดาห์</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">สถานะการ Clear Adv</label>
                    <select value={form.clearAdvStatus || 'not_done'} onChange={e => setForm({...form, clearAdvStatus: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                      <option value="not_done">ยังไม่ได้ Clear</option>
                      <option value="done">Clear แล้ว</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                      วันที่ทำ Clear Adv
                      {form.endDate && <span className="text-blue-500 ml-1 font-normal">(แนะนำ: {calcClearAdvDate(form.endDate)})</span>}
                    </label>
                    <input type="date" value={form.clearAdvDate || ''} onChange={e => setForm({...form, clearAdvDate: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">Checklist ติดตั้ง</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CHECKLIST_ITEMS.map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                      <button type="button"
                        onClick={() => setForm(f => ({...f, [item.key]: !f[item.key]}))}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${form[item.key] ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                        {form[item.key] && <span className="text-white text-xs leading-none">✓</span>}
                      </button>
                      <span className={`text-xs ${form[item.key] ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Google Sheet Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">🔗 Google Sheet Links</h3>
              <div className="space-y-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="grid grid-cols-3 gap-2 items-center">
                    <input
                      value={form[`sheetLabel${n}`]}
                      onChange={e => setForm(f => ({...f, [`sheetLabel${n}`]: e.target.value}))}
                      placeholder={`ชื่อ Link ${n} (เช่น DC Summary)`}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={form[`sheetLink${n}`]}
                      onChange={e => setForm(f => ({...f, [`sheetLink${n}`]: e.target.value}))}
                      placeholder="วาง URL Google Sheet..."
                      className="col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 pt-4">
              <button onClick={closeForm}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                ยกเลิก
              </button>
              <button onClick={handleAddSubmit}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
                {editMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
