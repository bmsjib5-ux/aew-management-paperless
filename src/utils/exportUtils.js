import * as XLSX from 'xlsx';

export function exportToExcel(data, filename = 'export') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Auto-fit columns width
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function printTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>พิมพ์ข้อมูล</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; font-size: 12px; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: 600; color: #475569; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        <h3 style="color:#1e40af;margin-bottom:12px;">Paperless Team — Management System</h3>
        ${table.outerHTML}
        <p style="margin-top:12px;color:#94a3b8;font-size:11px;">พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</p>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
