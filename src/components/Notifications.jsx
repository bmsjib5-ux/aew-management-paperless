import { useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { NOTIFICATIONS } from '../data/sampleData';

const TYPE_CONFIG = {
  leave_request: { label: 'การลา', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', icon: '📅' },
  go_live_alert: { label: 'Go-Live', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', icon: '🚀' },
  issue_critical: { label: 'Critical Issue', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: '🔴' },
  health_check: { label: 'สุขภาพ', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: '🏥' },
};

export default function Notifications() {
  const [notes, setNotes] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotes(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const remove = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const unread = notes.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">การแจ้งเตือน</h1>
          {unread > 0 && <p className="text-slate-500 text-sm">ยังไม่อ่าน <span className="text-blue-600 font-medium">{unread}</span> รายการ</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <CheckCheck size={16} /> อ่านทั้งหมด
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notes.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p>ไม่มีการแจ้งเตือน</p>
          </div>
        )}
        {notes.map(n => {
          const cfg = TYPE_CONFIG[n.type] || {};
          return (
            <div
              key={n.id}
              className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 transition-all ${n.read ? 'border-slate-100 opacity-70' : 'border-blue-100 shadow-blue-50/50'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${n.read ? 'bg-slate-100' : cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                </div>
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{n.date}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.read && (
                  <button onClick={() => markRead(n.id)}
                    className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors" title="อ่านแล้ว">
                    <CheckCheck size={14} />
                  </button>
                )}
                <button onClick={() => remove(n.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="ลบ">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
