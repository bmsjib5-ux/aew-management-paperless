// ข้อมูลตั้งต้นสำหรับตัวเลือกต่าง ๆ ในระบบ
export const DEFAULT_SETTINGS = {
  teams: ['ทีม 1', 'ทีม 2', 'ทีม 3', 'ทีม 4'],
  members: [
    'เนย', 'อิ๋ว', 'ต้อม', 'แดน', 'เหม', 'แฮ่ม',
    'จักรพงษ์ บุญน้อย', 'รัตนาพร สีทน', 'วาสนา นาเจริญ',
  ],
  workTypes: ['Onsite', 'Online', 'Hybrid'],
  bedTypes: ['รวม', 'IPD', 'OPD', 'Mixed'],
  lineGroups: ['มี', 'ไม่มี'],
  hospitals: [
    'รพ.ขุขันธ์ จ.ศรีสะเกษ', 'รพ.คูเมือง จ.บุรีรัมย์',
    'รพ.ชุมพรเขตรอุดมศักดิ์', 'รพ.บางสะพานน้อย',
    'รพ.ปาย จ.แม่ฮ่องสอน', 'รพ.มุกดาหาร จ.มุกดาหาร',
    'รพ.คลองหอยโข่ง', 'รพ.สงขลา',
  ],
  paymentStatuses: [
    { value: 'not_collected', label: 'ยังไม่ได้เก็บ' },
    { value: 'partial', label: 'เก็บบางส่วน' },
    { value: 'collected', label: 'เก็บครบแล้ว' },
  ],
  // Hmain mapping: hospital name → hmain code
  hospitalHmainMap: [
    { name: 'รพ.ขุขันธ์ จ.ศรีสะเกษ',    hmain: '10001' },
    { name: 'รพ.คูเมือง จ.บุรีรัมย์',     hmain: '10002' },
    { name: 'รพ.ชุมพรเขตรอุดมศักดิ์',    hmain: '10003' },
    { name: 'รพ.บางสะพานน้อย',           hmain: '10004' },
    { name: 'รพ.ปาย จ.แม่ฮ่องสอน',      hmain: '10005' },
    { name: 'รพ.มุกดาหาร จ.มุกดาหาร',   hmain: '10006' },
    { name: 'รพ.คลองหอยโข่ง',            hmain: '10007' },
    { name: 'รพ.สงขลา',                  hmain: '10008' },
  ],
  // Position options (ordered from senior to junior)
  positions: [
    'ผู้จัดการโครงการ (Project Manager)',
    'หัวหน้าทีมอาวุโส (Senior Team Leader)',
    'หัวหน้าทีม Smart Hospital (IPD Paperless)',
    'เจ้าหน้าที่ชำนาญการพิเศษ (Special Lead)',
    'เจ้าหน้าที่ชำนาญการ (Specialist)',
    'เจ้าหน้าที่ (Support/Implementer)',
    'อื่น ๆ',
  ],
};
