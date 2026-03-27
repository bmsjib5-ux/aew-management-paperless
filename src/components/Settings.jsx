import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Settings2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const SECTIONS = [
  { key: 'teams',            label: 'ทีม',        desc: 'รายชื่อทีมที่ใช้ในระบบ' },
  { key: 'hospitalHmainMap', label: 'โรงพยาบาล', desc: 'รายชื่อโรงพยาบาล + รหัส Hmain (เติมอัตโนมัติเมื่อเลือก รพ. ในฟอร์ม)' },
  { key: 'positions',        label: 'ตำแหน่ง',   desc: 'ตัวเลือกตำแหน่งงาน เรียงจากสูงไปต่ำ' },
  { key: 'workTypes',       label: 'ประเภทงาน',              desc: 'เช่น Onsite, Online, Hybrid' },
  { key: 'bedTypes',        label: 'ประเภทเตียง',            desc: 'เช่น รวม, IPD, OPD' },
  { key: 'lineGroups',      label: 'ไลน์กลุ่ม',             desc: 'สถานะไลน์กลุ่มประสานงาน' },
];

// ─── Editor for simple string lists ───────────────────────────────────────────
function ListEditor({ sectionKey, label }) {
  const { settings, addItem, removeItem, editItem } = useSettings();
  const list = settings[sectionKey] || [];
  const [input, setInput] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!input.trim()) { setError('กรุณาระบุข้อมูล'); return; }
    const ok = addItem(sectionKey, input);
    if (!ok) { setError(`"${input.trim()}" มีอยู่แล้ว`); return; }
    setInput('');
    setError('');
  };

  const handleEdit = (idx) => {
    const ok = editItem(sectionKey, list[idx], editVal);
    if (!ok) { setError('ชื่อซ้ำหรือไม่มีการเปลี่ยนแปลง'); return; }
    setEditingIdx(null);
    setError('');
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`เพิ่ม${label}ใหม่...`}
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          <Plus size={15} /> เพิ่ม
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {list.length === 0 && <p className="text-sm text-slate-400 text-center py-4">ยังไม่มีข้อมูล</p>}
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 group">
            {editingIdx === idx ? (
              <>
                <input value={editVal} onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEdit(idx); if (e.key === 'Escape') setEditingIdx(null); }}
                  autoFocus
                  className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button onClick={() => handleEdit(idx)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                <button onClick={() => setEditingIdx(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={14} /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-slate-700">{item}</span>
                <button onClick={() => { setEditingIdx(idx); setEditVal(item); setError(''); }}
                  className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={13} /></button>
                <button onClick={() => removeItem(sectionKey, item)}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13} /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Editor for hospitalHmainMap [{name, hmain}] ──────────────────────────────
function HmainEditor() {
  const { settings, updateList } = useSettings();
  const list = settings.hospitalHmainMap || [];

  const [nameInput, setNameInput] = useState('');
  const [hmainInput, setHmainInput] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editHmain, setEditHmain] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!nameInput.trim()) { setError('กรุณาระบุชื่อโรงพยาบาล'); return; }
    if (!hmainInput.trim()) { setError('กรุณาระบุรหัส Hmain'); return; }
    if (list.some(h => h.name === nameInput.trim())) { setError('โรงพยาบาลนี้มีอยู่แล้ว'); return; }
    updateList('hospitalHmainMap', [...list, { name: nameInput.trim(), hmain: hmainInput.trim() }]);
    setNameInput(''); setHmainInput(''); setError('');
  };

  const handleDelete = (idx) => {
    updateList('hospitalHmainMap', list.filter((_, i) => i !== idx));
  };

  const handleEditSave = (idx) => {
    if (!editName.trim() || !editHmain.trim()) { setError('กรุณากรอกข้อมูลให้ครบ'); return; }
    const updated = list.map((h, i) => i === idx ? { name: editName.trim(), hmain: editHmain.trim() } : h);
    updateList('hospitalHmainMap', updated);
    setEditingIdx(null); setError('');
  };

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3">ระบุรหัส Hmain สำหรับแต่ละโรงพยาบาล เพื่อเติมอัตโนมัติเมื่อเลือกชื่อโรงพยาบาลในฟอร์ม</p>
      <div className="flex gap-2 mb-3">
        <input value={nameInput} onChange={e => { setNameInput(e.target.value); setError(''); }}
          placeholder="ชื่อโรงพยาบาล (ต้องตรงกับรายการในแถบ โรงพยาบาล)"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input value={hmainInput} onChange={e => { setHmainInput(e.target.value); setError(''); }}
          placeholder="รหัส Hmain"
          className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap">
          <Plus size={15} /> เพิ่ม
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {list.length === 0 && <p className="text-sm text-slate-400 text-center py-4">ยังไม่มีข้อมูล</p>}
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 group">
            {editingIdx === idx ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none" autoFocus />
                <input value={editHmain} onChange={e => setEditHmain(e.target.value)}
                  className="w-28 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none" />
                <button onClick={() => handleEditSave(idx)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                <button onClick={() => setEditingIdx(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={14} /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{item.hmain}</span>
                <button onClick={() => { setEditingIdx(idx); setEditName(item.name); setEditHmain(item.hmain); setError(''); }}
                  className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(idx)}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13} /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('teams');
  const current = SECTIONS.find(s => s.key === activeSection);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings2 size={24} className="text-slate-600" /> การตั้งค่า
        </h1>
        <p className="text-slate-500 text-sm mt-1">จัดการตัวเลือกที่แสดงในฟอร์มต่าง ๆ ของระบบ</p>
      </div>

      <div className="flex gap-6">
        <div className="w-52 shrink-0 space-y-1">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                activeSection === s.key ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-800">{current?.label}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{current?.desc}</p>
          </div>
          {current?.key === 'hospitalHmainMap' ? (
            <HmainEditor />
          ) : (
            current && <ListEditor sectionKey={current.key} label={current.label} />
          )}
        </div>
      </div>
    </div>
  );
}
