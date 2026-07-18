export interface Teacher {
  id: string;
  email: string;
  thaiName: string;
  englishName: string;
  employeeId: string;
  phoneNumber: string;
  affiliation: string;
  displayName: string;
  password?: string;
  role?: 'teacher' | 'academic' | 'deputy' | 'admin' | 'discipline';
  hasSeeded?: boolean;
  homeroomClass?: string;
  coHomeroomClass?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'pdf' | 'link';
  name: string;
  url: string; // Base64 data for files, or URL path for online sites
}

export interface LessonRecord {
  id: string;
  teacherId: string;
  subject: string;
  customSubject?: string;
  gradeLevel: string;
  academicYear?: string;
  date: string;
  content: string;      // สาระการจัดการเรียนรู้
  activities: string;   // กิจกรรมการเรียนการสอน
  limitations: string;  // ข้อจำกัดในการจัดการเรียนการสอน
  suggestions: string;  // ข้อเสนอแนะ/ความคิดเห็นของผู้สอน
  strengths?: string;   // จุดเด่นในการสอนครั้งนี้
  attachments?: Attachment[];
  semester?: string;
  evaluations?: {
    teacher: Record<string, number>;
    learner: Record<string, number>;
    media: Record<string, number>;
  };
  createdAt: string;
  updatedAt: string;
  
  // Approval and Electronic Signatures
  teacherSigned?: boolean;
  teacherSignature?: string; // Electronic signature drawn as Base64 image
  
  deptHeadApproved?: boolean;
  deptHeadName?: string;
  deptHeadSignature?: string; // Electronic signature drawn as Base64 image
  deptHeadDate?: string;
  
  deputyDirectorApproved?: boolean;
  deputyDirectorName?: string;
  deputyDirectorSignature?: string; // Electronic signature drawn as Base64 image
  deputyDirectorDate?: string;

  // Edit History Tracking
  lastEditedBy?: string;
  lastEditedAt?: string;
  editHistory?: {
    editedBy: string;
    editedAt: string;
  }[];
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  subject: string;
  customSubject?: string;
  gradeLevel: string;
  title: string;          // ชื่อหน่วยการเรียนรู้ / เรื่อง
  objectives: string;     // จุดประสงค์การเรียนรู้
  activities: string;     // กิจกรรมการเรียนรู้
  materials: string;      // สื่อการเรียนรู้ / แหล่งเรียนรู้
  evaluation: string;     // การวัดและประเมินผล
  date: string;           // วันที่สอน (หรือ สัปดาห์ที่สอน)
  semester?: string;
  attachments?: Attachment[];
  
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  // Teacher signature 
  teacherSigned?: boolean;
  teacherSignature?: string; 
  teacherSignedOn?: string;
  
  // Approver (Academic / Head)
  approverId?: string;
  approverName?: string;
  approverSignature?: string;
  approverDate?: string;
  approverComment?: string;
  
  createdAt: string;
  updatedAt: string;
}


export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  gradeLevel: string;
  academicYear?: string;
  gender: 'male' | 'female';
  nationalId?: string;
  number: number;
  status: 'active' | 'inactive';
  dob?: string;
  parentName?: string;
  parentPhone?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  familyStatus?: string;
  address?: string;
  medicalInfo?: string;
  weight?: number;
  height?: number;
  allergicMedicine?: string;
  allergicFood?: string;
  congenitalDisease?: string;
}

export interface AttendanceSession {
  id: string;
  gradeLevel: string;
  date: string;
  period: string;
  subject?: string;
  teacherId: string;
  teacherName?: string;
  semester: string;
  academicYear: string;
  attendanceData: Record<string, 'present' | 'leave' | 'sick' | 'absent' | 'late'>;
  createdAt: string;
  updatedAt: string;
}

export interface KindergartenAssessment {
  id: string;
  studentId: string;
  gradeLevel: string;
  semester: string;
  academicYear: string;
  teacherId: string;
  
  // การประเมินพัฒนาการ 4 ด้าน ตามมาตรฐานคุณลักษณะที่พึงประสงค์ 12 ประการ (3=ดี, 2=พอใช้, 1=ควรส่งเสริม)
  // ร่างกาย: มาตรฐาน 1-2
  // อารมณ์ จิตใจ: มาตรฐาน 3-5
  // สังคม: มาตรฐาน 6-8
  // สติปัญญา: มาตรฐาน 9-12
  standard1: number;
  standard2: number;
  standard3: number;
  standard4: number;
  standard5: number;
  standard6: number;
  standard7: number;
  standard8: number;
  standard9: number;
  standard10: number;
  standard11: number;
  standard12: number;
  
  teacherNotes?: string;
  updatedAt: string;
}

export interface SubjectScore {
  id: string;
  studentId: string;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  subject: string;
  teacherId: string;
  
  // Non-grade scores
  preTestScore?: number;
  postTestScore?: number;

  // Grade scores
  beforeMidKnowledgeScore: number; // 20
  beforeMidSoftSkillScore: number; // 10
  midtermScore: number; // 20
  afterMidKnowledgeScore: number; // 20
  afterMidSoftSkillScore: number; // 10
  finalScore: number; // 20
  
  // Dynamic activity scores (activityId -> score)
  activities?: Record<string, number>;
  
  totalScore: number; // /100
  grade: string; // "4", "3.5", "3", etc.
  
  updatedAt: string;
}

export interface ActivityColumn {
  id: string;
  name: string;
  maxScore: number;
}

export interface SubjectSettings {
  id: string;
  academicYear: string;
  semester: string;
  gradeLevel: string;
  subject: string;
  beforeMidKnowledge: ActivityColumn[];
  beforeMidSoftSkill: ActivityColumn[];
  afterMidKnowledge: ActivityColumn[];
  afterMidSoftSkill: ActivityColumn[];
}

export interface StudentAssessment {
  id: string;
  studentId: string;
  gradeLevel: string;
  semester: string;
  academicYear: string;
  teacherId: string;
  
  // 1. ผลการประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ (3=ดีเยี่ยม, 2=ดี, 1=ผ่าน, 0=ไม่ผ่าน)
  characterTraits: {
    trait1: number; // รักชาติ ศาสน์ กษัตริย์
    trait2: number; // ซื่อสัตย์สุจริต
    trait3: number; // มีวินัย
    trait4: number; // ใฝ่เรียนรู้
    trait5: number; // อยู่อย่างพอเพียง
    trait6: number; // มุ่งมั่นในการทำงาน
    trait7: number; // รักความเป็นไทย
    trait8: number; // มีจิตสาธารณะ
  };
  
  // 2. ผลการประเมินสมรรถนะสำคัญของผู้เรียน 5 ประการ
  competencies: {
    comp1: number; // ความสามารถในการสื่อสาร
    comp2: number; // ความสามารถในการคิด
    comp3: number; // ความสามารถในการแก้ปัญหา
    comp4: number; // ความสามารถในการใช้ทักษะชีวิต
    comp5: number; // ความสามารถในการใช้เทคโนโลยี
  };

  // 3. ผลการประเมินการอ่าน คิดวิเคราะห์ และเขียน
  readingWriting: number; 
  
  comments: string;

  // 4. บันทึกพัฒนาการ (ลักษณะเดียวกับบันทึกหลังสอน)
  month?: string;        // ระบุเพียงเดือนที่ได้ลงบันทึกประเมิน
  weight?: number;
  height?: number;
  recordDate?: string;   // ระบุวันที่บันทึกข้อมูล (kept for backward compatibility or backend use, but won't be in form)
  
  // Edit History Tracking
  lastEditedBy?: string;
  lastEditedAt?: string;
  editHistory?: {
    editedBy: string;
    editedAt: string;
  }[];
  content?: string;      // พฤติกรรม/พัฒนาการที่พบ
  activities?: string;   // วิธีการส่งเสริม/แก้ไขปัญหา
  limitations?: string;  // ปัญหาอุปสรรค
  suggestions?: string;  // ผลการพัฒนา/ข้อเสนอแนะ

  createdAt: string;
  updatedAt: string;
}

export interface TeacherSchedule {
  id: string;
  teacherId: string;
  teacherName?: string;
  dayOfWeek: number;
  period: string;
  subject: string;
  gradeLevel: string;
  semester: string;
  academicYear: string;
  createdAt?: string;
}

export type SubjectType = string;

export const SEMESTERS = [
  'ภาคเรียนที่ 1/2570',
  'ภาคเรียนที่ 2/2570',
  'ภาคเรียนที่ 1/2569',
  'ภาคเรียนที่ 2/2569',
  'ภาคเรียนที่ 1/2568',
  'ภาคเรียนที่ 2/2568',
  'ภาคเรียนที่ 1/2567',
  'ภาคเรียนที่ 2/2567',
];

export const SUBJECTS: string[] = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'คอมพิวเตอร์',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'ภาษาต่างประเทศ (ภาษาอังกฤษ)',
  'ภาษาอังกฤษเพื่อการสื่อสาร',
  'ภาษาจีน',
  'จินตคณิต',
  'ว่ายน้ำ',
  'นาฏศิลป์',
  'ดนตรีไทย',
  'ดนตรีสากล',
  'กิจกรรมลูกเสือ',
  'อื่นๆ'
];

export const GRADE_LEVELS = [
  'อนุบาล 1',
  'อนุบาล 2',
  'อนุบาล 3',
  'ประถมศึกษาปีที่ 1/1',
  'ประถมศึกษาปีที่ 1/2',
  'ประถมศึกษาปีที่ 2/1',
  'ประถมศึกษาปีที่ 2/2',
  'ประถมศึกษาปีที่ 3',
  'ประถมศึกษาปีที่ 4',
  'ประถมศึกษาปีที่ 5',
  'ประถมศึกษาปีที่ 6'
];

export const PERIODS = [
  'กิจกรรมโฮมรูม (08.20-08.40 น.)',
  'คาบ 1 (08.40-09.30 น.)',
  'คาบ 2 (09.30-10.20 น.)',
  'พักเบรก (10.20-10.40 น.)',
  'คาบ 3 (10.40-11.30 น.)',
  'พักกลางวัน (11.30-12.20 น.)',
  'คาบ 4 (12.20-13.10 น.)',
  'คาบ 5 (13.10-14.00 น.)',
  'คาบ 6 (14.00-14.50 น.)',
  'กิจกรรมหลังเลิกเรียน (14.50-15.00 น.)'
];

export interface DisciplineIncident {
  id: string;
  studentIds: string[];
  studentNames: string[]; // For easy display without joining
  description: string;
  type: 'fight' | 'assault' | 'feud' | 'bullying' | 'misunderstanding' | 'disruption' | 'accident' | 'illness' | 'vandalism' | 'other' | string;
  otherTypeDetail?: string;
  accidentDetail?: string;
  illnessDetail?: string;
  fightDetail?: string;
  time?: string;
  severity?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  actionTaken?: 'none' | 'first_aid' | 'hospital' | 'other' | string;
  actionTakenDetail?: string;
  teacherId: string;
  teacherName: string;
  date: string;
  semester: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}
