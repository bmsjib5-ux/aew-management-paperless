// Script: แปลง lis_license_db.hospitals.csv → public/hospitals.json
// run: node scripts/buildHospitalData.cjs

const fs = require('fs');
const path = require('path');

const CSV_PATH = 'D:\\1. Project Test claude Rattanaporn\\4. Project PM 2569\\1. Project[AEW] Management Team Paperless\\lis_license_db.hospitals.csv';
const OUT_PATH = path.join(__dirname, '..', 'public', 'hospitals.json');

const raw = fs.readFileSync(CSV_PATH, 'utf8');
const lines = raw.split('\n');
const headers = lines[0].split(',');

const codeIdx     = headers.indexOf('code');
const nameIdx     = headers.indexOf('name');
const provinceIdx = headers.indexOf('province');

// ยกเว้นหน่วยงานที่ไม่ใช่โรงพยาบาลหลัก
const EXCLUDE = [
  'สสจ','สสอ','สอ.','ส่งเสริมสุขภาพ','สสช','ศสช',
  'ศูนย์บริการสาธารณสุข','ศูนย์แพทย์','สถานบริการสาธารณสุขชุมชน',
  'สถานีอนามัย','สสอ.','test',
];

const hospitals = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const cols = line.split(',');
  const code     = (cols[codeIdx]     || '').trim();
  const name     = (cols[nameIdx]     || '').trim();
  const province = (cols[provinceIdx] || '').trim();
  const status   = (cols[8]           || '').trim(); // status col

  if (!code || !name) continue;
  if (status === 'inactive') continue;
  if (EXCLUDE.some(kw => name.toLowerCase().includes(kw.toLowerCase()))) continue;

  hospitals.push({ c: code, n: name, p: province });
}

hospitals.sort((a, b) => a.c.localeCompare(b.c));

fs.writeFileSync(OUT_PATH, JSON.stringify(hospitals), 'utf8');

const kb = Math.round(fs.statSync(OUT_PATH).size / 1024);
console.log(`✅ Done: ${hospitals.length} hospitals → ${OUT_PATH} (${kb} KB)`);
console.log('\nตัวอย่าง 5 รายการแรก:');
hospitals.slice(0, 5).forEach(h => console.log(`  ${h.c}  ${h.n}`));
console.log('...');
console.log('ตัวอย่างรายการ 1000-1005:');
hospitals.slice(1000, 1006).forEach(h => console.log(`  ${h.c}  ${h.n}`));
