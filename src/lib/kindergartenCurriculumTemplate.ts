import { CurriculumStandard, SubjectUnit, CurriculumSubject } from '../types';

export interface KindergartenCompetencyData {
  standards: CurriculumStandard[];
  units: SubjectUnit[];
}

export const KINDERGARTEN_2568_STANDARDS: CurriculumStandard[] = [
  {
    id: 'kg68_std_1',
    title: 'สมรรถนะที่ 1: ด้านสุขภาวะทางกาย (Physical Well-being & Motor Skills)',
    indicators: [
      {
        id: 'kg68_ind_1_1',
        code: 'ก.1.1',
        description: 'ร่างกายเจริญเติบโตตามวัย น้ำหนักและส่วนสูงตามเกณฑ์มาตรฐาน มีสุขนิสัยที่ดีในการรับประทานอาหารและการพักผ่อน',
        type: 'core'
      },
      {
        id: 'kg68_ind_1_2',
        code: 'ก.1.2',
        description: 'ใช้กล้ามเนื้อมัดใหญ่ได้อย่างคล่องแคล่ว แข็งแรง และทรงตัวได้ดี (การเดิน วิ่ง กระโดด โยน รับลูกบอล และทรงตัว)',
        type: 'core'
      },
      {
        id: 'kg68_ind_1_3',
        code: 'ก.1.3',
        description: 'ใช้กล้ามเนื้อมัดเล็กและการประสานสัมพันธ์ระหว่างมือกับสายตาได้คล่องแคล่ว (การหยิบ จับ ตัด ปั้น ร้อย พับ วาด และเขียนตามรอย)',
        type: 'core'
      },
      {
        id: 'kg68_ind_1_4',
        code: 'ก.1.4',
        description: 'ปฏิบัติตนตามสุขอนามัย รักษาสุขภาพอนามัยส่วนตน และปฏิบัติตนให้ปลอดภัยจากอันตรายในชีวิตประจำวัน',
        type: 'core'
      }
    ]
  },
  {
    id: 'kg68_std_2',
    title: 'สมรรถนะที่ 2: ด้านอารมณ์ จิตใจ และสังคม (Emotional & Social Well-being)',
    indicators: [
      {
        id: 'kg68_ind_2_1',
        code: 'อ.2.1',
        description: 'ร่าเริง แจ่มใส แสดงออกทางอารมณ์และความรู้สึกได้อย่างเหมาะสมกับวัยและสถานการณ์',
        type: 'core'
      },
      {
        id: 'kg68_ind_2_2',
        code: 'อ.2.2',
        description: 'มีความรู้สึกที่ดีต่อตนเอง มั่นใจ กล้าพูด กล้าซักถาม และกล้าแสดงออกอย่างสร้างสรรค์',
        type: 'core'
      },
      {
        id: 'kg68_ind_2_3',
        code: 'อ.2.3',
        description: 'ช่วยเหลือตนเองในการปฏิบัติกิจวัตรประจำวัน มีวินัยและความรับผิดชอบต่องานหรือกิจกรรมที่ได้รับมอบหมาย',
        type: 'core'
      },
      {
        id: 'kg68_ind_2_4',
        code: 'อ.2.4',
        description: 'มีน้ำใจ รู้จักแบ่งปัน เอื้อเฟื้อเผื่อแผ่ ปฏิบัติตนเป็นสมาชิกที่ดี และร่วมเล่น/ทำงานกับเพื่อนได้อย่างมีความสุข',
        type: 'core'
      }
    ]
  },
  {
    id: 'kg68_std_3',
    title: 'สมรรถนะที่ 3: ด้านความเป็นพลเมืองและความเป็นไทย (Citizenship & Thainess)',
    indicators: [
      {
        id: 'kg68_ind_3_1',
        code: 'พ.3.1',
        description: 'มีวินัยในตนเอง มีความซื่อสัตย์ และปฏิบัติตามข้อตกลง กติกา กฎระเบียบของห้องเรียนและสังคม',
        type: 'core'
      },
      {
        id: 'kg68_ind_3_2',
        code: 'พ.3.2',
        description: 'มีมารยาทตามวัฒนธรรมไทย ไหว้สวย พูดจาสุภาพ กล่าวคำขอบคุณ-ขอโทษ และมีสัมมาคารวะต่อผู้ใหญ่',
        type: 'core'
      },
      {
        id: 'kg68_ind_3_3',
        code: 'พ.3.3',
        description: 'มีความรัก ชื่นชม และภาคภูมิใจในความเป็นไทย ร่วมกิจกรรมส่งเสริมประเพณี วัฒนธรรม และภูมิปัญญาท้องถิ่น',
        type: 'core'
      },
      {
        id: 'kg68_ind_3_4',
        code: 'พ.3.4',
        description: 'รู้คุณค่าและมีส่วนร่วมในการดูแลรักษาสิ่งแวดล้อม อนุรักษ์ทรัพยากรธรรมชาติ และใช้สิ่งของอย่างประหยัดคุ้มค่า',
        type: 'core'
      }
    ]
  },
  {
    id: 'kg68_std_4',
    title: 'สมรรถนะที่ 4: ด้านสติปัญญาและการเรียนรู้ (Intellectual & Cognitive Skills)',
    indicators: [
      {
        id: 'kg68_ind_4_1',
        code: 'ป.4.1',
        description: 'สื่อสารภาษา (ฟัง พูด ถ่ายทอดความรู้สึก นึกคิด และจินตนาการ) ได้อย่างเหมาะสม ชัดเจน และเข้าใจความหมาย',
        type: 'core'
      },
      {
        id: 'kg68_ind_4_2',
        code: 'ป.4.2',
        description: 'มีความสนใจใฝ่รู้ ช่างสังเกต สำรวจ ทดลอง ค้นหาคำตอบ และเชื่อมโยงความสัมพันธ์ของสิ่งต่างๆ รอบตัวอย่างมีเหตุผล',
        type: 'core'
      },
      {
        id: 'kg68_ind_4_3',
        code: 'ป.4.3',
        description: 'มีจินตนาการและความคิดริเริ่มสร้างสรรค์ สามารถถ่ายทอดผ่านงานศิลปะ ดนตรี การเคลื่อนไหว และการเล่น',
        type: 'core'
      },
      {
        id: 'kg68_ind_4_4',
        code: 'ป.4.4',
        description: 'มีทักษะพื้นฐานทางคณิตศาสตร์และวิทยาศาสตร์ (การนับ การจำแนก เปรียบเทียบ มิติสัมพันธ์ และการแก้ปัญหาตามวัย)',
        type: 'core'
      }
    ]
  }
];

export const KINDERGARTEN_2568_UNITS: SubjectUnit[] = [
  // สาระที่ 1: เรื่องราวเกี่ยวกับตัวเด็ก
  {
    id: 'kg68_u1_body',
    name: 'สาระที่ 1 (หน่วยที่ 1): อวัยวะและการดูแลรักษาร่างกายของฉัน',
    hours: 50,
    score: 10,
    indicators: ['ก.1.1', 'ก.1.2', 'ก.1.3']
  },
  {
    id: 'kg68_u2_hygiene',
    name: 'สาระที่ 1 (หน่วยที่ 2): สุขอนามัยที่ดีและความปลอดภัยในชีวิตประจำวัน',
    hours: 50,
    score: 10,
    indicators: ['ก.1.1', 'ก.1.4', 'อ.2.3']
  },
  {
    id: 'kg68_u3_feelings',
    name: 'สาระที่ 1 (หน่วยที่ 3): อารมณ์และความรู้สึกของหนู',
    hours: 40,
    score: 10,
    indicators: ['อ.2.1', 'อ.2.2', 'ป.4.1']
  },

  // สาระที่ 2: เรื่องราวเกี่ยวกับบุคคลและสถานที่แวดล้อมเด็ก
  {
    id: 'kg68_u4_family',
    name: 'สาระที่ 2 (หน่วยที่ 4): ครอบครัวสุขสันต์และบ้านแสนรัก',
    hours: 50,
    score: 10,
    indicators: ['อ.2.4', 'พ.3.2', 'ป.4.1']
  },
  {
    id: 'kg68_u5_school',
    name: 'สาระที่ 2 (หน่วยที่ 5): โรงเรียนแสนสุข เพื่อนรัก และคุณครูใจดี',
    hours: 60,
    score: 10,
    indicators: ['อ.2.3', 'อ.2.4', 'พ.3.1']
  },
  {
    id: 'kg68_u6_community',
    name: 'สาระที่ 2 (หน่วยที่ 6): ชุมชนน่าอยู่และสถานที่สำคัญรอบตัวเรา',
    hours: 50,
    score: 10,
    indicators: ['พ.3.1', 'พ.3.3', 'ป.4.2']
  },
  {
    id: 'kg68_u7_culture',
    name: 'สาระที่ 2 (หน่วยที่ 7): ประเพณี วัฒนธรรมไทย และเอกลักษณ์ท้องถิ่น',
    hours: 50,
    score: 10,
    indicators: ['พ.3.2', 'พ.3.3', 'ป.4.3']
  },

  // สาระที่ 3: ธรรมชาติรอบตัว
  {
    id: 'kg68_u8_plants',
    name: 'สาระที่ 3 (หน่วยที่ 8): ต้นไม้ใบหญ้าและดอกไม้แสนสวย',
    hours: 60,
    score: 10,
    indicators: ['ก.1.3', 'พ.3.4', 'ป.4.2']
  },
  {
    id: 'kg68_u9_animals',
    name: 'สาระที่ 3 (หน่วยที่ 9): สัตว์โลกน่ารักและสัตว์เลี้ยงแสนรัก',
    hours: 60,
    score: 10,
    indicators: ['พ.3.4', 'ป.4.2', 'ป.4.3']
  },
  {
    id: 'kg68_u10_weather',
    name: 'สาระที่ 3 (หน่วยที่ 10): ฤดูกาล ดิน น้ำ ลม และสภาพอากาศรอบตัว',
    hours: 50,
    score: 10,
    indicators: ['ป.4.2', 'ป.4.4', 'พ.3.4']
  },
  {
    id: 'kg68_u11_eco',
    name: 'สาระที่ 3 (หน่วยที่ 11): โลกสวยด้วยมือเราและการอนุรักษ์สิ่งแวดล้อม',
    hours: 50,
    score: 10,
    indicators: ['พ.3.4', 'อ.2.4', 'ป.4.2']
  },

  // สาระที่ 4: สิ่งต่างๆ รอบตัวเด็ก
  {
    id: 'kg68_u12_toys',
    name: 'สาระที่ 4 (หน่วยที่ 12): ของเล่นของใช้และการดูแลรักษาอย่างประหยัด',
    hours: 60,
    score: 10,
    indicators: ['ก.1.3', 'พ.3.1', 'พ.3.4']
  },
  {
    id: 'kg68_u13_transport',
    name: 'สาระที่ 4 (หน่วยที่ 13): ยานพาหนะ การคมนาคม และความปลอดภัยในการเดินทาง',
    hours: 60,
    score: 10,
    indicators: ['ก.1.4', 'ป.4.2', 'ป.4.4']
  },
  {
    id: 'kg68_u14_tech',
    name: 'สาระที่ 4 (หน่วยที่ 14): เทคโนโลยีและการสื่อสารในยุคดิจิทัล',
    hours: 50,
    score: 10,
    indicators: ['ป.4.1', 'ป.4.2', 'ป.4.4']
  },
  {
    id: 'kg68_u15_science',
    name: 'สาระที่ 4 (หน่วยที่ 15): นักวิทยาศาสตร์น้อยและการทดลองแสนสนุก',
    hours: 60,
    score: 10,
    indicators: ['ป.4.2', 'ป.4.3', 'ป.4.4']
  }
];

export const createKindergartenCurriculumPayload = (
  gradeLevel: string,
  existingSubject?: Partial<CurriculumSubject>
): CurriculumSubject => {
  const id = existingSubject?.id || `kg68_${gradeLevel.replace(/\s+/g, '_')}_${Date.now()}`;
  const payload: CurriculumSubject = {
    id,
    subjectCode: existingSubject?.subjectCode || 'ปฐมวัย',
    subjectName: existingSubject?.subjectName || 'การศึกษาปฐมวัย (บูรณาการ)',
    gradeLevel,
    gradeLevels: [gradeLevel],
    subjectType: 'activity',
    standards: KINDERGARTEN_2568_STANDARDS,
    units: KINDERGARTEN_2568_UNITS,
    totalHours: 1000,
    requiredHoursPerTerm: 500,
    createdAt: existingSubject?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existingSubject?.academicCategory) {
    payload.academicCategory = existingSubject.academicCategory;
  }

  return payload;
};
