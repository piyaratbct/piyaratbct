
export interface AppNotification {
  id: string;
  userId: string;
  type: 'co_teacher_invite' | 'plan_approved' | 'plan_rejected' | 'system' | string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Teacher {
  id: string;
  email: string;
  thaiName: string;
  englishName: string;
  employeeId: string;
  phoneNumber: string;
  affiliation: string;
  displayName: string;
  photoURL?: string; // profile picture from Firebase Storage
  password?: string;
  role?: 'teacher' | 'academic' | 'deputy' | 'admin' | 'discipline' | 'staff';
  hasSeeded?: boolean;
  lastActiveAt?: string;
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
  isIntegrated?: boolean;
  integratedSubjects?: string;
  isPBL?: boolean;
  isKindergarten?: boolean;
  
  // อนุบาล: 6 กิจกรรมหลัก
  kgMovementActivity?: string;
  kgCircleActivity?: string;
  kgArtActivity?: string;
  kgFreePlayActivity?: string;
  kgOutdoorActivity?: string;
  kgEducationalGame?: string;
  
  // อนุบาล: การประเมินพัฒนาการ 4 ด้าน
  kgPhysicalDev?: boolean;
  kgEmotionalDev?: boolean;
  kgSocialDev?: boolean;
  kgCognitiveDev?: boolean;
  pblDrivingQuestion?: string;
  pblInvestigationSteps?: string;
  pblPresentation?: string;
  gradeLevel: string;
  academicYear?: string;
  lessonPlanId?: string;
  date: string;
  content: string;      // สาระการจัดการเรียนรู้
  activities: string;   // กิจกรรมการเรียนการสอน
  limitations: string;  // ข้อจำกัดในการจัดการเรียนการสอน
  suggestions: string;  // ข้อเสนอแนะ/ความคิดเห็นของผู้สอน
  strengths?: string;   // จุดเด่นในการสอนครั้งนี้
  sarTags?: string[];   // แท็กมาตรฐาน SAR
  students?: { id: string; desirableScores?: Record<string, number>; }[];
  importedDesirable?: string[];
  studentDesirableScores?: Record<string, Record<string, number>>;
  importedIndicators?: string[];
  studentIndicatorScores?: Record<string, Record<string, number>>;
  importedCompetencies?: string[];
  studentCompetencyScores?: Record<string, Record<string, number>>;
  attachments?: Attachment[];
  semester?: string;
  evaluations?: {
    planning: Record<string, number>;
    time: Record<string, number>;
    media: Record<string, number>;
    teacher: Record<string, number>;
    learner: Record<string, number>;
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

export interface StructuredEvaluation {
  id: string;
  name: string;
  method: string;
  maxScore: number;
  kpa: string[]; // K, P, A
  autoGenerateColumn?: boolean;
  scorePeriod?: "before_mid" | "after_mid";
  targetSubject?: string;
  indicator?: string;
  indicators?: string[];
  generatedColumnId?: string; // Track if created in SubjectSettings
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  coTeachers?: string[];
  coTeacherNames?: string[];
  subject: string;
  customSubject?: string;
  isIntegrated?: boolean;
  integratedSubjects?: string;
  isPBL?: boolean;
  isKindergarten?: boolean;
  
  // อนุบาล: 6 กิจกรรมหลัก
  kgMovementActivity?: string;
  kgCircleActivity?: string;
  kgArtActivity?: string;
  kgFreePlayActivity?: string;
  kgOutdoorActivity?: string;
  kgEducationalGame?: string;
  
  // อนุบาล: การประเมินพัฒนาการ 4 ด้าน
  kgPhysicalDev?: boolean;
  kgEmotionalDev?: boolean;
  kgSocialDev?: boolean;
  kgCognitiveDev?: boolean;
  pblDrivingQuestion?: string;
  pblInvestigationSteps?: string;
  pblPresentation?: string;
  gradeLevel: string;
  title: string;          // ชื่อหน่วยการเรียนรู้ / เรื่อง
  coreIndicators?: string;  // ตัวชี้วัดต้องรู้ (ต้นทาง)
  targetIndicators?: string; // ตัวชี้วัดควรรู้ (ปลายทาง)
  competencies?: string;
  objectives: string;     // จุดประสงค์การเรียนรู้
  activities: string;     // กิจกรรมการเรียนรู้
  materials: string;      // สื่อการเรียนรู้ / แหล่งเรียนรู้
  evaluation: string;     // การวัดและประเมินผล
  desirableCharacteristics?: string[]; // คุณลักษณะอันพึงประสงค์ 8 ประการ
  structuredEvaluations?: StructuredEvaluation[];
  date: string;           // วันที่สอน (หรือ คาบที่)
  semester?: string;
  academicYear?: string;
  sarTags?: string[];
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


export interface HistoricalRecord {
  academicYear: string;
  gradeLevel: string;
  promotedAt?: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  photoURL?: string;
  gradeLevel: string;
  academicYear?: string;
  gender: 'male' | 'female';
  nationalId?: string;
  number: number;
  status: 'active' | 'graduated' | 'inactive';
  dob?: string;
  noSchoolMilk?: boolean;
  parentName?: string;
  parentPhone?: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  motherPrefix?: string;
  motherFirstName?: string;
  motherLastName?: string;
  guardianFirstName?: string;
  guardianLastName?: string;
  additionalNotes?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  fatherWorkplace?: string;
  fatherWorkplaceProvince?: string;
  fatherPhone?: string;
  fatherDob?: string;
  motherName?: string;
  motherOccupation?: string;
  motherIncome?: string;
  motherWorkplace?: string;
  motherWorkplaceProvince?: string;
  motherPhone?: string;
  motherDob?: string;
  guardianOccupation?: string;
  guardianIncome?: string;
  guardianWorkplace?: string;
  guardianWorkplaceProvince?: string;
  guardianRelation?: string;
  familyStatus?: string;
  address?: string;
  medicalInfo?: string;
  weight?: number;
  height?: number;
  bloodGroup?: string;
  ethnicity?: string;
  nationality?: string;
  religion?: string;
  previousSchool?: string;
  previousSchoolProvince?: string;
  allergicMedicine?: string;
  allergicFood?: string;
  congenitalDisease?: string;
  vision?: string;
  dental?: string;
  historicalRecords?: HistoricalRecord[];
  destinationSchool?: string;
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
  weight?: number;
  height?: number;
  gradeLevel: string;
  semester: string;
  academicYear: string;
  teacherId: string;
  
  // การประเมินพัฒนาการ 4 ด้าน ตามมาตรฐานคุณลักษณะที่พึงประสงค์ 12 ประการ (3=ดี, 2=พอใช้, 1=ควรส่งเสริม)
  // ร่างกาย: มาตรฐาน 1-2
  // อารมณ์ จิตใจ: มาตรฐาน 3-5
  // สังคม: มาตรฐาน 6-8
  // สติปัญญา: มาตรฐาน 9-12
  physicalDev: string;
  emotionalDev: string;
  citizenshipDev: string;
  intellectualDev: string;
  
  month?: string;
  teacherNotes?: string;
  publishNotesToStudent360?: boolean;
  hasAchievement?: boolean;
  achievementContent?: string;
  hasPastoralCare?: boolean;
  pastoralCareContent?: string;
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
  
  // การประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ (0-3)
  characterScores?: Record<string, number>;
  characterResult?: string; // "3", "2", "1", "0"

  // การประเมินอ่าน คิดวิเคราะห์ เขียน (0-3)
  readingScores?: Record<string, number>;
  readingResult?: string; // "3", "2", "1", "0"

  // การประเมินสมรรถนะสำคัญของผู้เรียน (0-3)
  competencyScores?: Record<string, number>;
  competencyResult?: string; // "3", "2", "1", "0"
  
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
  publishContentToStudent360?: boolean;
  publishActivitiesToStudent360?: boolean;
  hasAchievement?: boolean;
  achievementContent?: string;
  hasPastoralCare?: boolean;
  pastoralCareContent?: string;
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
  customSubject?: string;
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
  'การศึกษาปฐมวัย',
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'คอมพิวเตอร์',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'ประวัติศาสตร์',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'ภาษาอังกฤษ',
  'ภาษาอังกฤษเพื่อการสื่อสาร',
  'ภาษาจีน',
  'จินตคณิต',
  'ว่ายน้ำ',
  'นาฏศิลป์',
  'ดนตรีไทย',
  'ดนตรีสากล',
  'กิจกรรมลูกเสือ',
  'กิจกรรมอ่าน-เขียน',
  'บูรณาการ (PBL)',
  'อื่นๆ'
];

export const SAR_TAGS = [
  { id: 'active-learning', label: 'การเรียนรู้เชิงรุก (Active Learning)' },
  { id: 'critical-thinking', label: 'กระบวนการคิดวิเคราะห์ (Critical Thinking)' },
  { id: 'tech-integration', label: 'การบูรณาการเทคโนโลยี (Tech Integration)' },
  { id: 'moral-ethics', label: 'คุณธรรมจริยธรรม (Moral & Ethics)' },
  { id: 'local-wisdom', label: 'บูรณาการภูมิปัญญาท้องถิ่น (Local Wisdom)' },
  { id: 'differentiated', label: 'ตอบสนองความแตกต่างผู้เรียน (Differentiated)' },
  { id: 'authentic-assessment', label: 'การประเมินตามสภาพจริง (Authentic Assessment)' },
  { id: 'innovation-creation', label: 'สร้างนวัตกรรม/ชิ้นงาน (Innovation & Creation)' }
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
  studentIds: string[]; // Legacy or all involved
  studentNames: string[]; // Legacy or all involved
  offenderIds?: string[]; // New: explicitly offenders
  offenderNames?: string[]; 
  victimIds?: string[]; // New: victims or involved
  victimNames?: string[];
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

export interface Address {
  houseNumber: string;
  moo: string;
  village: string;
  soi: string;
  road: string;
  subDistrict: string;
  district: string;
  province: string;
  zipCode: string;
}

export interface AdmissionRecord {
  id: string;
  academicYear: string;
  applyForGrade: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  gender: 'male' | 'female';
  nationalId?: string;
  birthDate?: string;
  birthHospital?: string;
  birthProvince?: string;
  religion?: string;
  ethnicity?: string;
  nationality?: string;
  underlyingDisease?: string;
  familyStatus?: string;
  livingWith?: string;

  fatherEthnicity?: string;
  fatherNationality?: string;
  fatherReligion?: string;
  fatherBirthDate?: string;

  motherEthnicity?: string;
  motherNationality?: string;
  motherReligion?: string;
  motherBirthDate?: string;

  guardianEthnicity?: string;
  guardianNationality?: string;
  guardianReligion?: string;
  guardianBirthDate?: string;
  address?: string; // legacy flat string
  addressObj?: Address;
  weight?: number;
  height?: number;
  bloodGroup?: string;
  allergies?: string;
  drugAllergy?: string;
  foodAllergy?: string;
  
  siblingCount?: number;
  siblingOrder?: number;
  
  previousSchool?: string;
  previousSchoolProvince?: string;
  
  fatherFirstName?: string;
  fatherLastName?: string;
  motherPrefix?: string;
  motherFirstName?: string;
  motherLastName?: string;
  guardianFirstName?: string;
  guardianLastName?: string;
  additionalNotes?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  fatherWorkplace?: string;
  fatherWorkplaceProvince?: string;
  fatherPhone?: string;
  fatherLineId?: string;
  fatherAddressObj?: Address;
  
  motherName?: string;
  motherOccupation?: string;
  motherIncome?: string;
  motherWorkplace?: string;
  motherWorkplaceProvince?: string;
  motherPhone?: string;
  motherLineId?: string;
  motherAddressObj?: Address;
  
  guardianName?: string;
  guardianRelation?: string;
  guardianOccupation?: string;
  guardianIncome?: string;
  guardianWorkplace?: string;
  guardianWorkplaceProvince?: string;
  guardianPhone?: string;
  guardianLineId?: string;
  guardianAddressObj?: Address;
  
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  
  surveySource?: string[];
  surveySourceOther?: string;
  surveyReasons?: string[];
  surveyExpectations?: string[];
  surveyPlan?: string;
  
  status: 'pending' | 'approved' | 'rejected' | 'enrolled';
  appliedAt: string;
}


export interface CurriculumIndicator {
  id: string;
  code: string;
  description: string;
  type: 'core' | 'terminal';
}

export interface CurriculumStandard {
  id: string;
  title: string;
  indicators: CurriculumIndicator[];
}

export interface CurriculumSubject {
  id: string;
  subjectName: string;
  gradeLevel: string;
  standards: CurriculumStandard[];
  createdAt: string;
  updatedAt: string;
}

export const PERIOD_OPTIONS = Array.from({length: 60}, (_, i) => `ครั้งที่ ${i + 1}`);

export interface SchoolHoliday {
  id: string;
  date: string;
  description: string;
}

export type PDRecordType = 'training' | 'plc' | 'award' | 'research' | 'sar_overview';

export interface PDRecord {
  id: string;
  teacherId: string;
  type: PDRecordType;
  title: string;
  date: string; // YYYY-MM-DD format
  academicYear?: string;
  semester?: string;
  hours?: number; // For training, PLC
  organizer?: string; // For training, award
  level?: string; // For awards e.g., โรงเรียน, เขต, ประเทศ
  description?: string; // Problem/result for research, or general details
  evidenceUrl?: string; // Link to image or document
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface BasicEduStandard1Evaluation {
  id?: string;
  academicYear: string;
  c1_1_1: number;
  c1_1_2: number;
  c1_1_3: number;
  c1_1_4: number;
  c1_1_5: number;
  c1_1_6: number;
  c1_2_1: number;
  c1_2_2: number;
  c1_2_3: number;
  c1_2_4: number;
  updatedAt?: any;
}

export interface CharacterAssessment {
  id?: string;
  studentId: string;
  academicYear: string;
  semester: string;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  t5: number;
  t6: number;
  t7: number;
  t8: number;
  updatedAt?: string;
}

export interface StudentBadge {
  id?: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  badgeType: 'honesty' | 'public_mind' | 'discipline' | 'learning' | 'sufficient';
  description?: string;
  date: string;
  academicYear: string;
  semester: string;
  createdAt: string;
}

export interface ClassroomConfig {
  id: string;
  name: string;
  baseLevel: string;
  homeroomTeacherId?: string;
  coHomeroomTeacherId?: string;
}
