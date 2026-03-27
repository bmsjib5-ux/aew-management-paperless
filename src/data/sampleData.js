// ==============================
// SAMPLE DATA - Management PPL
// ==============================

export const TEAM_MEMBERS = [
  { id: 1, code: 'T001', name: 'นายสมชาย ใจดี', nickname: 'ชาย', role: 'PM', position: 'Project Manager', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'somchai@aew.co.th', supervisor: '', phone: '081-000-0001', startDate: '2022-01-10', status: 'available', workload: 65, skills: ['Project Management', 'Hospital Implementation', 'Training'], currentSite: null, healthCheck: 'completed', healthCheckDate: '2025-09-01' },
  { id: 2, code: 'T002', name: 'นางสาวสมหญิง รักงาน', nickname: 'หญิง', role: 'Dev', position: 'Senior Developer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'somying@aew.co.th', supervisor: 'T001', phone: '081-000-0002', startDate: '2022-03-01', status: 'on_site', workload: 90, skills: ['React', 'Node.js', 'PostgreSQL', 'NestJS'], currentSite: 'H001', healthCheck: 'completed', healthCheckDate: '2025-08-15' },
  { id: 3, code: 'T003', name: 'นายวิชัย พัฒนา', nickname: 'วิ', role: 'Dev', position: 'Developer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'wichai@aew.co.th', supervisor: 'T001', phone: '081-000-0003', startDate: '2022-06-15', status: 'on_site', workload: 85, skills: ['Java', 'Spring Boot', 'MySQL'], currentSite: 'H002', healthCheck: 'pending', healthCheckDate: null },
  { id: 4, code: 'T004', name: 'นางสาวมาลี สุขใจ', nickname: 'มาลี', role: 'Trainer', position: 'Application Trainer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'malee@aew.co.th', supervisor: 'T001', phone: '081-000-0004', startDate: '2023-01-05', status: 'on_leave', workload: 0, skills: ['OPD Training', 'IPD Training', 'User Support'], currentSite: null, healthCheck: 'completed', healthCheckDate: '2025-07-20' },
  { id: 5, code: 'T005', name: 'นายปิยะ ตั้งใจ', nickname: 'ปิ', role: 'Support', position: 'Support Engineer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'piya@aew.co.th', supervisor: 'T001', phone: '081-000-0005', startDate: '2023-04-01', status: 'available', workload: 45, skills: ['Helpdesk', 'Network', 'Windows Server'], currentSite: null, healthCheck: 'not_done', healthCheckDate: null },
  { id: 6, code: 'T006', name: 'นางสาวกานดา ศรีสวย', nickname: 'แก้ว', role: 'Trainer', position: 'Application Trainer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'kanda@aew.co.th', supervisor: 'T001', phone: '081-000-0006', startDate: '2023-06-01', status: 'on_site', workload: 80, skills: ['LAB Training', 'X-ray Training', 'Billing'], currentSite: 'H003', healthCheck: 'completed', healthCheckDate: '2025-09-10' },
  { id: 7, code: 'T007', name: 'นายธนา รุ่งเรือง', nickname: 'ธน', role: 'Dev', position: 'Junior Developer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'thana@aew.co.th', supervisor: 'T001', phone: '081-000-0007', startDate: '2024-01-15', status: 'available', workload: 55, skills: ['React', 'Vue.js', 'CSS'], currentSite: null, healthCheck: 'completed', healthCheckDate: '2025-10-01' },
  { id: 8, code: 'T008', name: 'นางสาวพิมพ์ สวยงาม', nickname: 'พิมพ์', role: 'Support', position: 'Support Engineer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'pim@aew.co.th', supervisor: 'T001', phone: '081-000-0008', startDate: '2024-03-01', status: 'on_site', workload: 75, skills: ['Customer Service', 'Database', 'Report'], currentSite: 'H001', healthCheck: 'pending', healthCheckDate: null },
  { id: 9, code: 'T009', name: 'นายอนุชา เก่งมาก', nickname: 'ชา', role: 'Dev', position: 'Developer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'anucha@aew.co.th', supervisor: 'T001', phone: '081-000-0009', startDate: '2024-05-01', status: 'available', workload: 30, skills: ['Python', 'Data Analysis', 'ETL'], currentSite: null, healthCheck: 'completed', healthCheckDate: '2025-08-20' },
  { id: 10, code: 'T010', name: 'นางสาวรัตนา ดีใจ', nickname: 'ตน', role: 'Trainer', position: 'Application Trainer', dept: 'NPP3', hospital: 'Smart Hospital (HIS Paperless)', email: 'rattana@aew.co.th', supervisor: 'T001', phone: '081-000-0010', startDate: '2024-07-01', status: 'on_site', workload: 88, skills: ['OPD Training', 'Pharmacy Training'], currentSite: 'H004', healthCheck: 'not_done', healthCheckDate: null },
];

export const HOSPITALS = [
  { id: 'H001', name: 'โรงพยาบาลพระนครศรีอยุธยา', shortName: 'รพ.อยุธยา', location: 'พระนครศรีอยุธยา', type: 'Government', beds: 500, goLiveDate: '2026-03-31', status: 'installing', progress: 65, modules: { opd: 'done', ipd: 'in_progress', lab: 'in_progress', xray: 'pending', billing: 'pending', pharmacy: 'done' }, assignedTeam: ['T002', 'T008'], pm: 'T001' },
  { id: 'H002', name: 'โรงพยาบาลสมุทรปราการ', shortName: 'รพ.สมุทรปราการ', location: 'สมุทรปราการ', type: 'Government', beds: 350, goLiveDate: '2026-04-30', status: 'training', progress: 45, modules: { opd: 'done', ipd: 'done', lab: 'pending', xray: 'pending', billing: 'in_progress', pharmacy: 'in_progress' }, assignedTeam: ['T003'], pm: 'T001' },
  { id: 'H003', name: 'โรงพยาบาลเอกชนกรุงเทพ', shortName: 'รพ.เอกชน BKK', location: 'กรุงเทพมหานคร', type: 'Private', beds: 200, goLiveDate: '2026-05-31', status: 'planning', progress: 20, modules: { opd: 'in_progress', ipd: 'pending', lab: 'pending', xray: 'pending', billing: 'pending', pharmacy: 'pending' }, assignedTeam: ['T006'], pm: 'T001' },
  { id: 'H004', name: 'โรงพยาบาลนนทบุรี', shortName: 'รพ.นนทบุรี', location: 'นนทบุรี', type: 'Government', beds: 420, goLiveDate: '2026-06-30', status: 'go_live', progress: 95, modules: { opd: 'done', ipd: 'done', lab: 'done', xray: 'done', billing: 'done', pharmacy: 'in_progress' }, assignedTeam: ['T010'], pm: 'T001' },
  { id: 'H005', name: 'โรงพยาบาลปทุมธานี', shortName: 'รพ.ปทุมธานี', location: 'ปทุมธานี', type: 'Government', beds: 280, goLiveDate: '2026-08-31', status: 'planning', progress: 10, modules: { opd: 'pending', ipd: 'pending', lab: 'pending', xray: 'pending', billing: 'pending', pharmacy: 'pending' }, assignedTeam: [], pm: 'T001' },
];

export const LEAVES = [
  { id: 'L001', staffId: 'T004', staffName: 'นางสาวมาลี สุขใจ', startDate: '2026-03-25', endDate: '2026-03-28', days: 4, category: 'sick', type: 'ลาป่วย', details: 'ไข้หวัด', status: 'approved', approvedBy: 'T001', remark: '' },
  { id: 'L002', staffId: 'T002', staffName: 'นางสาวสมหญิง รักงาน', startDate: '2026-04-07', endDate: '2026-04-09', days: 3, category: 'vacation', type: 'ลาพักร้อน', details: 'ท่องเที่ยวต่างจังหวัด', status: 'pending', approvedBy: '', remark: '' },
  { id: 'L003', staffId: 'T007', staffName: 'นายธนา รุ่งเรือง', startDate: '2026-03-30', endDate: '2026-03-30', days: 1, category: 'personal', type: 'ลากิจ', details: 'ธุระส่วนตัว', status: 'approved', approvedBy: 'T001', remark: '' },
  { id: 'L004', staffId: 'T003', staffName: 'นายวิชัย พัฒนา', startDate: '2026-04-14', endDate: '2026-04-16', days: 3, category: 'vacation', type: 'ลาพักร้อน', details: 'สงกรานต์', status: 'pending', approvedBy: '', remark: '' },
  { id: 'L005', staffId: 'T009', staffName: 'นายอนุชา เก่งมาก', startDate: '2026-04-21', endDate: '2026-04-21', days: 1, category: 'sick', type: 'ลาป่วย', details: 'หมอนัด', status: 'approved', approvedBy: 'T001', remark: '' },
  { id: 'L006', staffId: 'T006', staffName: 'นางสาวกานดา ศรีสวย', startDate: '2026-05-01', endDate: '2026-05-02', days: 2, category: 'personal', type: 'ลากิจ', details: 'งานครอบครัว', status: 'pending', approvedBy: '', remark: '' },
  { id: 'L007', staffId: 'T010', staffName: 'นางสาวรัตนา ดีใจ', startDate: '2026-03-18', endDate: '2026-03-20', days: 3, category: 'sick', type: 'ลาป่วย', details: 'ไข้', status: 'approved', approvedBy: 'T001', remark: '' },
  { id: 'L008', staffId: 'T005', staffName: 'นายปิยะ ตั้งใจ', startDate: '2026-04-28', endDate: '2026-04-29', days: 2, category: 'vacation', type: 'ลาพักร้อน', details: '', status: 'rejected', approvedBy: 'T001', remark: 'ติดงาน deploy' },
];

export const HEALTH_CHECKS = [
  { staffId: 'T001', year: 2025, status: 'completed', date: '2025-09-01', doc: 'health_T001_2025.pdf', remark: '' },
  { staffId: 'T002', year: 2025, status: 'completed', date: '2025-08-15', doc: 'health_T002_2025.pdf', remark: '' },
  { staffId: 'T003', year: 2025, status: 'pending', date: null, doc: null, remark: 'นัดตรวจ 2026-04-10' },
  { staffId: 'T004', year: 2025, status: 'completed', date: '2025-07-20', doc: 'health_T004_2025.pdf', remark: '' },
  { staffId: 'T005', year: 2025, status: 'not_done', date: null, doc: null, remark: 'ยังไม่ได้ตรวจ' },
  { staffId: 'T006', year: 2025, status: 'completed', date: '2025-09-10', doc: 'health_T006_2025.pdf', remark: '' },
  { staffId: 'T007', year: 2025, status: 'completed', date: '2025-10-01', doc: 'health_T007_2025.pdf', remark: '' },
  { staffId: 'T008', year: 2025, status: 'pending', date: null, doc: null, remark: 'นัดตรวจ 2026-04-05' },
  { staffId: 'T009', year: 2025, status: 'completed', date: '2025-08-20', doc: 'health_T009_2025.pdf', remark: '' },
  { staffId: 'T010', year: 2025, status: 'not_done', date: null, doc: null, remark: 'ยังไม่ได้ตรวจ' },
];

export const TASKS = [
  { id: 'TK001', siteId: 'H001', title: 'ติดตั้ง Server & Network', assignee: 'T002', startDate: '2025-12-01', dueDate: '2025-12-31', status: 'done', priority: 'high' },
  { id: 'TK002', siteId: 'H001', title: 'Install & Config HIS OPD', assignee: 'T002', startDate: '2026-01-01', dueDate: '2026-01-31', status: 'done', priority: 'high' },
  { id: 'TK003', siteId: 'H001', title: 'Install & Config HIS IPD', assignee: 'T002', startDate: '2026-02-01', dueDate: '2026-02-28', status: 'in_progress', priority: 'high' },
  { id: 'TK004', siteId: 'H001', title: 'อบรมผู้ใช้งาน OPD', assignee: 'T004', startDate: '2026-02-15', dueDate: '2026-03-15', status: 'done', priority: 'medium' },
  { id: 'TK005', siteId: 'H001', title: 'อบรมผู้ใช้งาน IPD', assignee: 'T004', startDate: '2026-03-15', dueDate: '2026-04-15', status: 'in_progress', priority: 'medium' },
  { id: 'TK006', siteId: 'H002', title: 'ติดตั้ง Server & Network', assignee: 'T003', startDate: '2026-01-15', dueDate: '2026-02-15', status: 'done', priority: 'high' },
  { id: 'TK007', siteId: 'H002', title: 'Install & Config HIS', assignee: 'T003', startDate: '2026-02-15', dueDate: '2026-03-31', status: 'in_progress', priority: 'high' },
  { id: 'TK008', siteId: 'H004', title: 'Go-Live Support', assignee: 'T010', startDate: '2026-03-20', dueDate: '2026-04-20', status: 'in_progress', priority: 'critical' },
];

export const ISSUES = [
  { id: 'I001', siteId: 'H001', title: 'ระบบ LAB ช้า', severity: 'medium', status: 'open', reportDate: '2026-03-20', assignee: 'T002', remark: 'ตรวจสอบ query' },
  { id: 'I002', siteId: 'H002', title: 'Print ใบสั่งยาไม่ออก', severity: 'high', status: 'resolved', reportDate: '2026-03-15', assignee: 'T003', remark: 'แก้ไขแล้ว driver' },
  { id: 'I003', siteId: 'H004', title: 'User login ผิดพลาด batch', severity: 'critical', status: 'open', reportDate: '2026-03-25', assignee: 'T010', remark: 'รอ patch จาก dev' },
  { id: 'I004', siteId: 'H003', title: 'Network ไม่เสถียร', severity: 'high', status: 'open', reportDate: '2026-03-22', assignee: 'T006', remark: 'ประสานงาน IT รพ.' },
];

export const NOTIFICATIONS = [
  { id: 'N001', type: 'leave_request', message: 'นางสาวสมหญิง รักงาน ขอลาพักร้อน 7-9 เมษายน', date: '2026-03-25', read: false },
  { id: 'N002', type: 'go_live_alert', message: 'รพ.นนทบุรี ใกล้ Go-Live! เหลือ 3 วัน', date: '2026-03-27', read: false },
  { id: 'N003', type: 'issue_critical', message: 'Critical Issue ที่ รพ.นนทบุรี: User login ผิดพลาด', date: '2026-03-25', read: true },
  { id: 'N004', type: 'health_check', message: 'นายปิยะ ตั้งใจ ยังไม่ตรวจสุขภาพประจำปี 2025', date: '2026-03-20', read: true },
  { id: 'N005', type: 'leave_request', message: 'นายวิชัย พัฒนา ขอลาพักร้อน 14-16 เมษายน', date: '2026-03-26', read: false },
];

export const STATUS_CONFIG = {
  available: { label: 'ว่างงาน', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  on_site: { label: 'ประจำ Site', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  on_leave: { label: 'ลา', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
};

export const ROLE_CONFIG = {
  PM: { label: 'Project Manager', color: 'bg-purple-100 text-purple-700', icon: '👑' },
  Dev: { label: 'Developer', color: 'bg-blue-100 text-blue-700', icon: '💻' },
  Trainer: { label: 'Trainer', color: 'bg-orange-100 text-orange-700', icon: '🎓' },
  Support: { label: 'Support', color: 'bg-teal-100 text-teal-700', icon: '🛠️' },
};

export const SITE_STATUS_CONFIG = {
  planning: { label: 'วางแผน', color: 'bg-gray-100 text-gray-600' },
  installing: { label: 'ติดตั้ง', color: 'bg-blue-100 text-blue-700' },
  training: { label: 'อบรม', color: 'bg-yellow-100 text-yellow-700' },
  go_live: { label: 'Go-Live', color: 'bg-green-100 text-green-700' },
  support: { label: 'Support', color: 'bg-teal-100 text-teal-700' },
};

export const LEAVE_CATEGORY_CONFIG = {
  sick:       { label: 'ลาป่วย',            color: 'bg-red-100 text-red-700' },
  vacation:   { label: 'ลาพักร้อน',         color: 'bg-blue-100 text-blue-700' },
  personal:   { label: 'ลากิจ',             color: 'bg-orange-100 text-orange-700' },
  maternity:  { label: 'ลาคลอด',            color: 'bg-pink-100 text-pink-700' },
  ordination: { label: 'ลาบวช',             color: 'bg-yellow-100 text-yellow-700' },
  military:   { label: 'เกณฑ์ทหาร',         color: 'bg-slate-200 text-slate-700' },
  unpaid:     { label: 'ลาไม่รับค่าจ้าง',   color: 'bg-gray-100 text-gray-600' },
  study:      { label: 'ลาศึกษาต่อ/อบรม',  color: 'bg-purple-100 text-purple-700' },
  holiday:    { label: 'วันหยุดนักขัตฤกษ์', color: 'bg-teal-100 text-teal-700' },
  other:      { label: 'อื่น ๆ',            color: 'bg-slate-100 text-slate-600' },
};

export const THAI_PUBLIC_HOLIDAYS = [
  { date: '2026-01-01', name: 'วันขึ้นปีใหม่' },
  { date: '2026-01-02', name: 'ชดเชยวันขึ้นปีใหม่' },
  { date: '2026-02-28', name: 'วันมาฆบูชา' },
  { date: '2026-04-06', name: 'วันจักรี' },
  { date: '2026-04-13', name: 'วันสงกรานต์' },
  { date: '2026-04-14', name: 'วันสงกรานต์' },
  { date: '2026-04-15', name: 'วันสงกรานต์' },
  { date: '2026-05-01', name: 'วันแรงงานแห่งชาติ' },
  { date: '2026-05-04', name: 'วันฉัตรมงคล' },
  { date: '2026-05-22', name: 'วันวิสาขบูชา' },
  { date: '2026-06-01', name: 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี' },
  { date: '2026-07-28', name: 'วันเฉลิมพระชนมพรรษา ร.10' },
  { date: '2026-08-12', name: 'วันแม่แห่งชาติ' },
  { date: '2026-10-13', name: 'วันคล้ายวันสวรรคต ร.9' },
  { date: '2026-10-23', name: 'วันปิยมหาราช' },
  { date: '2026-12-05', name: 'วันพ่อแห่งชาติ / วันชาติ' },
  { date: '2026-12-10', name: 'วันรัฐธรรมนูญ' },
  { date: '2026-12-31', name: 'วันสิ้นปี' },
];

export const HEALTH_STATUS_CONFIG = {
  completed: { label: 'ตรวจแล้ว', color: 'bg-green-100 text-green-700', icon: '✅' },
  pending: { label: 'รอตรวจ', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  not_done: { label: 'ยังไม่ตรวจ', color: 'bg-red-100 text-red-700', icon: '❌' },
};

export const GOOGLE_SHEET_LINKS = {
  H001: 'https://docs.google.com/spreadsheets/d/example_H001',
  H002: 'https://docs.google.com/spreadsheets/d/example_H002',
  H003: 'https://docs.google.com/spreadsheets/d/example_H003',
  H004: 'https://docs.google.com/spreadsheets/d/example_H004',
  H005: 'https://docs.google.com/spreadsheets/d/example_H005',
};
