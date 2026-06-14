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
  date: string;
  content: string;      // สาระการจัดการเรียนรู้
  activities: string;   // กิจกรรมการเรียนการสอน
  limitations: string;  // ข้อจำกัดในการจัดการเรียนการสอน
  suggestions: string;  // ข้อเสนอแนะ/ความคิดเห็นของผู้สอน
  attachments?: Attachment[];
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

export type SubjectType = 
  | 'ภาษาไทย'
  | 'คณิตศาสตร์'
  | 'วิทยาศาสตร์และเทคโนโลยี'
  | 'สังคมศึกษา ศาสนา และวัฒนธรรม'
  | 'สุขศึกษาและพลศึกษา'
  | 'ศิลปะ'
  | 'การงานอาชีพ'
  | 'ภาษาต่างประเทศ (ภาษาอังกฤษ)'
  | 'ภาษาอังกฤษเพื่อการสื่อสาร'
  | 'ภาษาจีน'
  | 'จินตคณิต'
  | 'ว่ายน้ำ'
  | 'นาฏศิลป์'
  | 'ดนตรีไทย'
  | 'ดนตรีสากล'
  | 'อื่นๆ';

export const SUBJECTS: SubjectType[] = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
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
  'ประถมศึกษาปีที่ 1/1 (ป.1/1)',
  'ประถมศึกษาปีที่ 1/2 (ป.1/2)',
  'ประถมศึกษาปีที่ 2/1 (ป.2/1)',
  'ประถมศึกษาปีที่ 2/2 (ป.2/2)',
  'ประถมศึกษาปีที่ 3 (ป.3)',
  'ประถมศึกษาปีที่ 4 (ป.4)',
  'ประถมศึกษาปีที่ 5 (ป.5)',
  'ประถมศึกษาปีที่ 6 (ป.6)'
];
