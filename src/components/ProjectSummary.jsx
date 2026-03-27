import { useState, useMemo } from 'react';
import { Download, Printer, ChevronLeft, ChevronRight, TrendingUp, Banknote, CheckCircle2, Clock } from 'lucide-react';
import { INSTALLATIONS, INSTALL_STATUS_CONFIG } from '../data/installationData';
import { exportToExcel, printTable } from '../utils/exportUtils';

const PAYMENT_STATUS_CONFIG = {
  collected:     { label: 'เก็บครบแล้ว',   color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  partial:       { label: 'เก็บบางส่วน',   color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  not_collected: { label: 'ยังไม่ได้เก็บ', color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

function fmtMoney(val) {
  const n = Number(val);
  if (!val && val !== 0) return '—';
  return n.toLocaleString('th-TH');
}

function fmtPct(num, denom) {
  if (!denom) return '0%';
  return Math.round((num / denom) * 100) + '%';
}

export default function ProjectSummary() {
  const [yearBE, setYearBE] = useState(2567);

  const projects = useMemo(() =>
    INSTALLATIONS
      .filter(i => i.year === yearBE)
      .slice()
      .sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate) - new Date(b.startDate);
      }),
    [yearBE]
  );

  // Financial totals
  const totals = useMemo(() => {
    const contractSum = projects.reduce((s, i) => s + (Number(i.contractPrice) || 0), 0);
    const sellSum = projects.reduce((s, i) => s + (Number(i.sellPrice) || 0), 0);
    const collectedSum = projects.reduce((s, i) => s + (Number(i.collectedAmount) || 0), 0);
    const outstanding = sellSum - collectedSum;
    return { contractSum, sellSum, collectedSum, outstanding };
  }, [projects]);

  const statusCount = useMemo(() => {
    const counts = {};
    projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [projects]);

  const handleExport = () => {
    const data = projects.map((i, idx) => ({
      'ลำดับ': idx + 1,
      'วันที่เริ่ม': i.startDate,
      'วันที่สิ้นสุด': i.endDate,
      'โรงพยาบาล': i.hospital,
      'P-Taiga': i.pTaiga,
      'ทีม': i.team,
      'หัวหน้าทีม': i.teamLead,
      'ประเภทงาน': i.workType,
      'Ward': i.wards,
      'สถานะโครงการ': INSTALL_STATUS_CONFIG[i.status]?.label || '',
      'ราคาสัญญา': i.contractPrice || 0,
      'ราคาขาย': i.sellPrice || 0,
      'สถานะเก็บเงิน': PAYMENT_STATUS_CONFIG[i.paymentStatus]?.label || '',
      'ยอดที่เก็บได้': i.collectedAmount || 0,
      'คงค้าง': (Number(i.sellPrice) || 0) - (Number(i.collectedAmount) || 0),
      'วันที่เก็บเงิน': i.collectedDate || '',
      'หมายเหตุการเงิน': i.paymentRemark || '',
    }));
    exportToExcel(data, `สรุปโครงการ_${yearBE}`);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สรุปโครงการทั้งหมดรายปี</h1>
          <p className="text-slate-500 text-sm">เรียงตามวันที่ติดตั้ง — ภาพรวมการเงินและสถานะทุกโครงการ</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setYearBE(y => y - 1)}
              className="px-2 py-2 hover:bg-slate-50 text-slate-500"><ChevronLeft size={16} /></button>
            <span className="px-3 py-1.5 text-sm font-semibold text-slate-700 min-w-16 text-center">ปี {yearBE}</span>
            <button onClick={() => setYearBE(y => y + 1)}
              className="px-2 py-2 hover:bg-slate-50 text-slate-500"><ChevronRight size={16} /></button>
          </div>
          <button onClick={() => printTable('summary-table')}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Printer size={16} /> พิมพ์
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Banknote size={16} className="text-blue-500" />
            <span className="text-xs font-medium text-blue-600">มูลค่าสัญญารวม</span>
          </div>
          <div className="text-xl font-bold text-blue-700">{fmtMoney(totals.contractSum)}</div>
          <div className="text-xs text-blue-400 mt-0.5">บาท</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs font-medium text-green-600">เก็บเงินแล้ว</span>
          </div>
          <div className="text-xl font-bold text-green-700">{fmtMoney(totals.collectedSum)}</div>
          <div className="text-xs text-green-400 mt-0.5">{fmtPct(totals.collectedSum, totals.sellSum)} ของราคาขาย</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-red-400" />
            <span className="text-xs font-medium text-red-500">ค้างรับ</span>
          </div>
          <div className="text-xl font-bold text-red-600">{fmtMoney(totals.outstanding)}</div>
          <div className="text-xs text-red-400 mt-0.5">บาท</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-slate-500" />
            <span className="text-xs font-medium text-slate-500">จำนวนโครงการ</span>
          </div>
          <div className="text-xl font-bold text-slate-700">{projects.length} แห่ง</div>
          <div className="text-xs text-slate-400 mt-0.5">
            เสร็จ {statusCount.completed || 0} / ดำเนินการ {statusCount.in_progress || 0} / รอ {statusCount.pending || 0}
          </div>
        </div>
      </div>

      {/* Collection Progress Bar */}
      {totals.sellSum > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>อัตราการเก็บเงิน</span>
            <span className="font-semibold text-slate-700">{fmtPct(totals.collectedSum, totals.sellSum)}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: fmtPct(totals.collectedSum, totals.sellSum) }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-green-600 font-medium">เก็บแล้ว {fmtMoney(totals.collectedSum)} บาท</span>
            <span className="text-red-500">ค้างรับ {fmtMoney(totals.outstanding)} บาท</span>
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table id="summary-table" className="w-full text-xs" style={{ minWidth: 1100 }}>
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="px-3 py-3 text-center font-semibold w-8">#</th>
                <th className="px-3 py-3 text-center font-semibold" style={{ minWidth: 90 }}>วันที่เริ่ม</th>
                <th className="px-3 py-3 text-center font-semibold" style={{ minWidth: 90 }}>วันที่สิ้นสุด</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ minWidth: 180 }}>โรงพยาบาล</th>
                <th className="px-3 py-3 text-center font-semibold" style={{ minWidth: 70 }}>ทีม</th>
                <th className="px-3 py-3 text-center font-semibold" style={{ minWidth: 50 }}>Ward</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ minWidth: 80 }}>สถานะ</th>
                <th className="px-3 py-3 text-right font-semibold" style={{ minWidth: 110 }}>ราคาสัญญา</th>
                <th className="px-3 py-3 text-right font-semibold" style={{ minWidth: 110 }}>ราคาขาย</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ minWidth: 110 }}>สถานะเงิน</th>
                <th className="px-3 py-3 text-right font-semibold" style={{ minWidth: 110 }}>ยอดเก็บได้</th>
                <th className="px-3 py-3 text-right font-semibold" style={{ minWidth: 110 }}>ค้างรับ</th>
                <th className="px-3 py-3 text-center font-semibold" style={{ minWidth: 90 }}>วันที่เก็บเงิน</th>
                <th className="px-3 py-3 text-left font-semibold" style={{ minWidth: 130 }}>หมายเหตุการเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    ไม่มีข้อมูลโครงการในปี {yearBE}
                  </td>
                </tr>
              ) : (
                projects.map((i, idx) => {
                  const outstanding = (Number(i.sellPrice) || 0) - (Number(i.collectedAmount) || 0);
                  const pmtCfg = PAYMENT_STATUS_CONFIG[i.paymentStatus];
                  const stsCfg = INSTALL_STATUS_CONFIG[i.status];
                  return (
                    <tr key={i.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                      <td className="px-3 py-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-3 text-center text-slate-600 whitespace-nowrap">{i.startDate || '—'}</td>
                      <td className="px-3 py-3 text-center text-slate-600 whitespace-nowrap">{i.endDate || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 leading-snug">{i.hospital}</div>
                        <div className="text-slate-400">{i.pTaiga} | {i.workType}</div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-medium text-slate-600">{i.team}</span>
                        <div className="text-slate-400">{i.teamLead}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-slate-700">{i.wards || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stsCfg?.color}`}>
                          {stsCfg?.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-slate-700">{fmtMoney(i.contractPrice)}</td>
                      <td className="px-3 py-3 text-right font-medium text-slate-700">{fmtMoney(i.sellPrice)}</td>
                      <td className="px-4 py-3">
                        {pmtCfg ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pmtCfg.color}`}>
                            {pmtCfg.label}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-green-700">{fmtMoney(i.collectedAmount)}</td>
                      <td className={`px-3 py-3 text-right font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {outstanding > 0 ? fmtMoney(outstanding) : '—'}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-500 whitespace-nowrap">{i.collectedDate || '—'}</td>
                      <td className="px-3 py-3 text-slate-500">{i.paymentRemark || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {projects.length > 0 && (
              <tfoot className="bg-slate-700 text-white">
                <tr>
                  <td colSpan={7} className="px-4 py-3 font-semibold text-right">รวมทั้งหมด ({projects.length} โครงการ)</td>
                  <td className="px-3 py-3 text-right font-bold">{fmtMoney(totals.contractSum)}</td>
                  <td className="px-3 py-3 text-right font-bold">{fmtMoney(totals.sellSum)}</td>
                  <td className="px-4 py-3 text-center text-sm">{fmtPct(totals.collectedSum, totals.sellSum)}</td>
                  <td className="px-3 py-3 text-right font-bold text-green-300">{fmtMoney(totals.collectedSum)}</td>
                  <td className="px-3 py-3 text-right font-bold text-red-300">{fmtMoney(totals.outstanding)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
