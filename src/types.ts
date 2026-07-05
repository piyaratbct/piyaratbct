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
  role?: 'teacher' | 'academic' | 'deputy' | 'admin';
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
  attachments?: Attachment[];
  semester?: string;
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
  number: number;
  status: 'active' | 'inactive';
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
  'อื่นๆ'
];

export const GRADE_LEVELS = [
  'ประถมศึกษาปีที่ 1/1',
  'ประถมศึกษาปีที่ 1/2',
  'ประถมศึกษาปีที่ 2/1',
  'ประถมศึกษาปีที่ 2/2',
  'ประถมศึกษาปีที่ 3',
  'ประถมศึกษาปีที่ 4',
  'ประถมศึกษาปีที่ 5',
  'ประถมศึกษาปีที่ 6'
];
