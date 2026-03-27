// ข้อมูลประสานงานติดตั้งประจำปี (จากไฟล์ ประสานงานติดตั้งประจำปี.xlsx)
// Sheet: "11.ประสานงาน And GW"

export const INSTALLATIONS = [
  // ปี 2567
  { id: 1, seq: 1, pTaiga: 'T-134', hmain: '10001', hospital: 'รพ.ขุขันธ์ จ.ศรีสะเกษ', team: 'ทีม 1', wards: 52, bedType: 'รวม', staffCount: 1, teamLead: 'เนย', teamMembers: 'เนย, อิ๋ว, ต้อม, แดน, เหม', workType: 'Onsite', called: 'วาสนา นาเจริญ', callDate: '2024-01-05', remark: 'PPL Support ในระยะเวลารับประกัน 1 ปี', status: 'completed',
    startDate: '2024-01-08', endDate: '2024-02-16', warrantyEnd: '2025-02-16', lineGroup: 'มี',
    contractPrice: 850000, sellPrice: 850000, paymentStatus: 'collected', collectedAmount: 850000, collectedDate: '2024-03-15', paymentRemark: 'เก็บครบแล้ว',
    travelCost: 15000, perDiem: 8000, adv: 20000,
    advStatus: 'done', advDate: '2023-12-11', clearAdvStatus: 'done', clearAdvDate: '2024-02-23',
    licenseImportPDF: true, licenseTools: true, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },

  { id: 2, seq: 2, pTaiga: 'T-141', hmain: '10002', hospital: 'รพ.คูเมือง จ.บุรีรัมย์', team: 'ทีม 2', wards: 61, bedType: 'รวม', staffCount: 1, teamLead: 'จักรพงษ์ บุญน้อย', teamMembers: 'จักรพงษ์ บุญน้อย', workType: 'Onsite', called: 'วาสนา นาเจริญ', callDate: '2024-01-05', remark: '', status: 'completed',
    startDate: '2024-01-08', endDate: '2024-02-02', warrantyEnd: '2025-02-02', lineGroup: 'มี',
    contractPrice: 920000, sellPrice: 920000, paymentStatus: 'partial', collectedAmount: 460000, collectedDate: '2024-02-20', paymentRemark: 'เก็บงวดแรก 50%',
    travelCost: 12000, perDiem: 6000, adv: 15000,
    advStatus: 'done', advDate: '2023-12-11', clearAdvStatus: 'not_done', clearAdvDate: '',
    licenseImportPDF: true, licenseTools: false, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },

  { id: 3, seq: 3, pTaiga: 'T-145', hmain: '10003', hospital: 'รพ.ชุมพรเขตรอุดมศักดิ์', team: 'ทีม 1', wards: 65, bedType: 'รวม', staffCount: 1, teamLead: 'เนย', teamMembers: 'เนย, อิ๋ว, ต้อม, แดน, เหม', workType: 'Onsite', called: 'วาสนา นาเจริญ', callDate: '2024-02-15', remark: '', status: 'in_progress',
    startDate: '2024-02-19', endDate: '2024-03-29', warrantyEnd: '2025-03-29', lineGroup: 'มี',
    contractPrice: 750000, sellPrice: 750000, paymentStatus: 'not_collected', collectedAmount: 0, collectedDate: '', paymentRemark: '',
    travelCost: 18000, perDiem: 9000, adv: 25000,
    advStatus: 'done', advDate: '2024-01-22', clearAdvStatus: 'not_done', clearAdvDate: '',
    licenseImportPDF: false, licenseTools: false, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },

  { id: 4, seq: 4, pTaiga: 'T-149', hmain: '10004', hospital: 'รพ.บางสะพานน้อย', team: 'ทีม 1', wards: 52, bedType: 'รวม', staffCount: 1, teamLead: 'ต้อม', teamMembers: 'ต้อม, แฮ่ม, แดน', workType: 'Onsite', called: 'วาสนา นาเจริญ', callDate: '2024-03-28', remark: '', status: 'completed',
    startDate: '2024-04-01', endDate: '2024-04-05', warrantyEnd: '2025-04-05', lineGroup: 'มี',
    contractPrice: 680000, sellPrice: 680000, paymentStatus: 'collected', collectedAmount: 680000, collectedDate: '2024-05-10', paymentRemark: 'เก็บครบแล้ว',
    travelCost: 8000, perDiem: 4000, adv: 10000,
    advStatus: 'done', advDate: '2024-03-05', clearAdvStatus: 'done', clearAdvDate: '2024-04-12',
    licenseImportPDF: true, licenseTools: false, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },

  { id: 5, seq: 5, pTaiga: 'T-154', hmain: '10005', hospital: 'รพ.ปาย จ.แม่ฮ่องสอน', team: 'ทีม 2', wards: 52, bedType: 'รวม', staffCount: 1, teamLead: 'แฮ่ม', teamMembers: 'ต้อม, แฮ่ม, แดน', workType: 'Onsite', called: 'วาสนา นาเจริญ', callDate: '', remark: 'ติดต่อแล้ว รอตอบกลับ', status: 'pending',
    startDate: '2024-05-06', endDate: '2024-05-17', warrantyEnd: '2025-05-17', lineGroup: 'มี',
    contractPrice: 520000, sellPrice: 520000, paymentStatus: 'not_collected', collectedAmount: 0, collectedDate: '', paymentRemark: 'รอเริ่มงาน',
    travelCost: 22000, perDiem: 10000, adv: 0,
    advStatus: 'not_done', advDate: '', clearAdvStatus: 'not_done', clearAdvDate: '',
    licenseImportPDF: false, licenseTools: false, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },

  { id: 6, seq: 6, pTaiga: 'T-158', hmain: '10006', hospital: 'รพ.มุกดาหาร จ.มุกดาหาร', team: 'ทีม 1', wards: 52, bedType: 'รวม', staffCount: 1, teamLead: 'เนย', teamMembers: 'เนย, ต้อม, แฮ่ม', workType: 'Onsite', called: 'วาสนา นาเจริญ', callDate: '', remark: '', status: 'in_progress',
    startDate: '2024-05-20', endDate: '2024-06-07', warrantyEnd: '2025-06-07', lineGroup: 'มี',
    contractPrice: 640000, sellPrice: 640000, paymentStatus: 'partial', collectedAmount: 320000, collectedDate: '2024-06-01', paymentRemark: 'รอเก็บงวดสุดท้าย',
    travelCost: 20000, perDiem: 9000, adv: 18000,
    advStatus: 'done', advDate: '2024-04-22', clearAdvStatus: 'not_done', clearAdvDate: '',
    licenseImportPDF: false, licenseTools: false, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },

  { id: 7, seq: 7, pTaiga: 'T-161', hmain: '10007', hospital: 'รพ.คลองหอยโข่ง', team: 'ทีม 1', wards: 52, bedType: 'รวม', staffCount: 1, teamLead: 'เนย', teamMembers: 'เนย, ต้อม, แฮ่ม', workType: 'Onsite', called: 'วาสนา นาเจริญ', callDate: '', remark: 'หมดระยะเวลารับประกัน ยังไม่ทำเรื่องส่งการตลาด', status: 'warranty_expired',
    startDate: '2024-05-20', endDate: '2024-06-07', warrantyEnd: '2025-06-07', lineGroup: 'มี',
    contractPrice: 560000, sellPrice: 560000, paymentStatus: 'collected', collectedAmount: 560000, collectedDate: '2024-07-05', paymentRemark: 'เก็บครบแล้ว',
    travelCost: 11000, perDiem: 5500, adv: 12000,
    advStatus: 'done', advDate: '2024-04-22', clearAdvStatus: 'done', clearAdvDate: '2024-06-14',
    licenseImportPDF: true, licenseTools: false, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },

  { id: 8, seq: 8, pTaiga: 'T-165', hmain: '10008', hospital: 'รพ.สงขลา', team: 'ทีม 2', wards: 170, bedType: 'รวม', staffCount: 1, teamLead: 'รัตนาพร สีทน', teamMembers: 'รัตนาพร สีทน', workType: 'Onsite', called: 'รัตนาพร สีทน', callDate: '', remark: '20 Ward', status: 'in_progress',
    startDate: '2024-07-08', endDate: '2024-09-12', warrantyEnd: '2025-09-12', lineGroup: 'มี',
    contractPrice: 1850000, sellPrice: 1850000, paymentStatus: 'partial', collectedAmount: 925000, collectedDate: '2024-08-01', paymentRemark: 'เก็บงวดแรก 50% รอเก็บงวดสุดท้ายหลัง Go-Live',
    travelCost: 45000, perDiem: 22000, adv: 50000,
    advStatus: 'done', advDate: '2024-06-10', clearAdvStatus: 'not_done', clearAdvDate: '',
    licenseImportPDF: false, licenseTools: false, year: 2567,
    marketingName: '', sheetLabel1: '', sheetLink1: '', sheetLabel2: '', sheetLink2: '', sheetLabel3: '', sheetLink3: '' },
];

export const INSTALL_STATUS_CONFIG = {
  completed:        { label: 'เสร็จสิ้น',         color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  in_progress:      { label: 'กำลังดำเนินการ',    color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  pending:          { label: 'รอดำเนินการ',        color: 'bg-yellow-100 text-yellow-700',dot: 'bg-yellow-500' },
  warranty_expired: { label: 'หมดประกัน',          color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
  cancelled:        { label: 'ยกเลิก',             color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
};

export const CHECKLIST_ITEMS = [
  { key: 'licenseImportPDF', label: 'License Import PDF' },
  { key: 'licenseTools',     label: 'License Tools Migration' },
];
