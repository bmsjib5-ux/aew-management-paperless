import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Pencil, Check, X, Settings2, Search, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

// ── Hook: โหลด hospital master list จาก public/hospitals.json ──────────────
function useHospitalMaster() {
  const [master, setMaster] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch('/aew-management-paperless/hospitals.json')
      .then(r => r.json())
      .then(data => { setMaster(data); setLoading(false); })
      .catch(() => {
        // fallback: try root path (local dev)
        fetch('/hospitals.json')
          .then(r => r.json())
          .then(data => { setMaster(data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);
  return { master, loading };
}

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
  const { master, loading } = useHospitalMaster();
  const list = settings.hospitalHmainMap || [];

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hmainInput, setHmainInput] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editHmain, setEditHmain] = useState('');
  const [error, setError] = useState('');
  const wrapperRef = useRef(null);

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    setHmainInput('');
    setError('');
    if (!master || val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const q = val.trim().toLowerCase();
    const results = master
      .filter(h => h.n.toLowerCase().includes(q) || h.c.includes(q))
      .slice(0, 20);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const selectSuggestion = (h) => {
    setSearch(h.n);
    setHmainInput(h.c);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    const name = search.trim();
    const hmain = hmainInput.trim();
    if (!name) { setError('กรุณาระบุชื่อโรงพยาบาล'); return; }
    if (!hmain) { setError('กรุณาระบุรหัส Hmain'); return; }
    if (list.some(h => h.name === name)) { setError('โรงพยาบาลนี้มีอยู่แล้ว'); return; }
    updateList('hospitalHmainMap', [...list, { name, hmain }]);
    setSearch(''); setHmainInput(''); setError('');
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
      <p className="text-xs text-slate-400 mb-3">
        พิมพ์ชื่อหรือรหัส รพ. เพื่อค้นหาจากฐานข้อมูล {master ? `(${master.length.toLocaleString()} รายการ)` : ''}
      </p>

      {/* Add form */}
      <div className="flex gap-2 mb-1" ref={wrapperRef}>
        <div className="relative flex-1">
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
            {loading ? <Loader2 size={14} className="text-slate-400 animate-spin shrink-0" /> : <Search size={14} className="text-slate-400 shrink-0" />}
            <input
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="พิมพ์ชื่อหรือรหัส รพ. เพื่อค้นหา..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => { setSearch(''); setHmainInput(''); setSuggestions([]); setShowSuggestions(false); }}
                className="text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {suggestions.map((h, i) => (
                <button key={i} onClick={() => selectSuggestion(h)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 text-left border-b border-slate-50 last:border-0">
                  <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded shrink-0">{h.c}</span>
                  <span className="text-sm text-slate-700 truncate">{h.n}</span>
                  {h.p && <span className="text-xs text-slate-400 shrink-0">{h.p}</span>}
                </button>
              ))}
            </div>
          )}
          {showSuggestions && suggestions.length === 0 && search.length >= 2 && !loading && (
            <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400">
              ไม่พบโรงพยาบาลที่ตรงกัน
            </div>
          )}
        </div>

        <input value={hmainInput} onChange={e => { setHmainInput(e.target.value); setError(''); }}
          placeholder="Hmain"
          className="w-28 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
        <button onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap">
          <Plus size={15} /> เพิ่ม
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {/* List */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 mt-3">
        {list.length === 0 && <p className="text-sm text-slate-400 text-center py-4">ยังไม่มีข้อมูล — ค้นหาและเพิ่มโรงพยาบาลด้านบน</p>}
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 group">
            {editingIdx === idx ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none" autoFocus />
                <input value={editHmain} onChange={e => setEditHmain(e.target.value)}
                  className="w-28 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none font-mono" />
                <button onClick={() => handleEditSave(idx)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                <button onClick={() => setEditingIdx(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={14} /></button>
              </>
            ) : (
              <>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded shrink-0">{item.hmain}</span>
                <span className="flex-1 text-sm text-slate-700">{item.name}</span>
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
