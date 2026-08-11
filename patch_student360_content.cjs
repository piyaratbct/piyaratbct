const fs = require('fs');
let content = fs.readFileSync('src/components/Student360.tsx', 'utf8');

const mockMatch = /const MOCK_STUDENTS = \[[\s\S]*?\];/;
const newMock = `const MOCK_STUDENTS = [
  {
    id: "S-001",
    studentId: "65012",
    firstName: "ด.ช. พัฒนพงษ์",
    lastName: "เจริญดี",
    nickname: "นนท์",
    grade: "ป.3/1",
    dob: "2015-05-12",
    bloodType: "O",
    allergies: "แพ้นมวัว, อาหารทะเล",
    congenitalDisease: "หอบหืด",
    medicalInfo: "เคยผ่าตัดไส้ติ่ง",
    fatherName: "นาย สมชาย เจริญดี",
    motherName: "นาง สมหญิง เจริญดี",
    parentPhone: "081-234-5678",
    academic: {
      gpa: 3.85,
      attendanceRate: 98,
      subjects: [
        { name: "คณิตศาสตร์", score: 85, grade: "4" },
        { name: "ภาษาไทย", score: 90, grade: "4" },
        { name: "วิทยาศาสตร์", score: 92, grade: "4" },
        { name: "ภาษาอังกฤษ", score: 88, grade: "4" },
        { name: "สังคมศึกษา", score: 95, grade: "4" },
        { name: "สุขศึกษา", score: 98, grade: "4" },
      ]
    },
    health: {
      height: 135,
      weight: 32,
      bmi: 17.5,
      vision: "ปกติ",
      dental: "ฟันผุ 1 ซี่ (รักษากับทันตแพทย์แล้ว)"
    },
    behavior: {
      score: 95,
      notes: "เป็นเด็กที่มีความรับผิดชอบสูง ชอบช่วยเหลือเพื่อนในชั้นเรียน มีความเป็นผู้นำ",
      achievements: ["ชนะเลิศการประกวดวาดภาพระดับสายชั้น ป.3", "นักเรียนดีเด่นประจำเดือนสิงหาคม"]
    },
    pastoralCare: [
      { date: "15 ก.ค. 2026", type: "ให้คำปรึกษา", details: "นักเรียนมีความกังวลเรื่องการสอบ ได้พูดคุยและแนะนำวิธีการแบ่งเวลาอ่านหนังสือ" },
      { date: "10 พ.ค. 2026", type: "เยี่ยมบ้าน", details: "สภาพแวดล้อมทางบ้านอบอุ่น ผู้ปกครองเอาใจใส่ดูแลเรื่องการเรียนเป็นอย่างดี" }
    ]
  },
  {
    id: "S-002",
    studentId: "65088",
    firstName: "ด.ญ. รินรดา",
    lastName: "สุขใจ",
    nickname: "ริน",
    grade: "ป.3/1",
    dob: "2015-08-24",
    bloodType: "B",
    allergies: "ไม่มี",
    congenitalDisease: "ไม่มี",
    medicalInfo: "ไม่มี",
    fatherName: "นาย สมพล สุขใจ",
    motherName: "นาง รัตนา สุขใจ",
    parentPhone: "089-876-5432",
    academic: {
      gpa: 3.25,
      attendanceRate: 92,
      subjects: [
        { name: "คณิตศาสตร์", score: 65, grade: "2.5" },
        { name: "ภาษาไทย", score: 82, grade: "4" },
        { name: "วิทยาศาสตร์", score: 70, grade: "3" },
        { name: "ภาษาอังกฤษ", score: 94, grade: "4" },
        { name: "สังคมศึกษา", score: 85, grade: "4" },
        { name: "สุขศึกษา", score: 90, grade: "4" },
      ]
    },
    health: {
      height: 130,
      weight: 28,
      bmi: 16.5,
      vision: "สั้น 150 (สวมแว่นตา)",
      dental: "ปกติ"
    },
    behavior: {
      score: 85,
      notes: "เป็นเด็กร่าเริง ชอบวิชาภาษาอังกฤษและศิลปะ แต่สมาธิสั้นเล็กน้อยในวิชาคำนวณ",
      achievements: ["เข้าร่วมประกวดร้องเพลงประสานเสียงโรงเรียน"]
    },
    pastoralCare: [
      { date: "05 ส.ค. 2026", type: "ติดตามผล", details: "ประสานงานกับครูคณิตศาสตร์เพื่อจัดหาแบบฝึกหัดเสริมให้ฝึกทำเพิ่มเติม" },
      { date: "12 พ.ค. 2026", type: "เยี่ยมบ้าน", details: "อยู่กับคุณยายเป็นหลัก คุณแม่ทำงานต่างจังหวัด จะกลับมาช่วงวันหยุด" }
    ]
  }
];`;
content = content.replace(mockMatch, newMock);

const helper = `
const formatThaiDateAndAge = (dobString: string) => {
  if (!dobString || dobString === "ไม่ระบุ") return "ไม่ระบุ";
  const date = new Date(dobString);
  if (isNaN(date.getTime())) return dobString;

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const d = date.getDate();
  const m = thaiMonths[date.getMonth()];
  const y = date.getFullYear() + 543;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const mDiff = today.getMonth() - date.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return \`\${d} \${m} \${y} (อายุ \${age} ปี)\`;
};
`;
content = content.replace('export function Student360', helper + '\nexport function Student360');

const extendedPushMatch = /list\.push\(\{[\s\S]*?\}\);/g;
const newExtendedPush = `list.push({
        id: initialStudent.id,
        studentId: initialStudent.studentId,
        firstName: initialStudent.firstName,
        lastName: initialStudent.lastName,
        nickname: initialStudent.nickname || '',
        grade: initialStudent.gradeLevel,
        dob: initialStudent.dob || "ไม่ระบุ",
        bloodType: "ไม่ระบุ",
        allergies: [initialStudent.allergicFood, initialStudent.allergicMedicine].filter(Boolean).join(', ') || "ไม่มี",
        congenitalDisease: initialStudent.congenitalDisease || "ไม่มี",
        medicalInfo: initialStudent.medicalInfo || "ไม่มี",
        fatherName: [initialStudent.fatherFirstName, initialStudent.fatherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        motherName: [initialStudent.motherFirstName, initialStudent.motherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        parentPhone: initialStudent.parentPhone || initialStudent.guardianPhone || "ไม่ระบุ",
        academic: {
          gpa: 0,
          attendanceRate: 100,
          subjects: []
        },
        health: {
          height: 0,
          weight: 0,
          bmi: 0,
          vision: "รอผลตรวจ",
          dental: "รอผลตรวจ"
        },
        behavior: {
          score: 100,
          notes: "ยังไม่มีบันทึกเพิ่มเติม",
          achievements: []
        },
        pastoralCare: []
      });`;
content = content.replace(extendedPushMatch, newExtendedPush);

const listAvatar = /<img src=\{s\.avatar\}.*?\/>/g;
const newListAvatar = `<div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>`;
content = content.replace(listAvatar, newListAvatar);

const detailAvatar = /<div className="absolute -bottom-10 left-6">\s*<img[\s\S]*?\/>\s*<\/div>/;
const newDetailAvatar = `<div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center shadow-sm">
                    <User className="w-10 h-10 text-indigo-400" />
                  </div>
                </div>`;
content = content.replace(detailAvatar, newDetailAvatar);

content = content.replace(
  /<span className="font-bold text-slate-800">\{student\.dob\}<\/span>/,
  '<span className="font-bold text-slate-800">{formatThaiDateAndAge(student.dob)}</span>'
);

const allergiesMatch = /<div className="flex items-center justify-between text-sm">\s*<span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" \/> การแพ้<\/span>[\s\S]*?<\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

if (content.match(allergiesMatch)) {
  const matchStr = content.match(allergiesMatch)[0];
  const replaceStr = matchStr.replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/, `</div>
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <h3 className="text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" /> ข้อมูลครอบครัว
                  </h3>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500">บิดา</span>
                    <span className="font-bold text-slate-800">{student.fatherName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500">มารดา</span>
                    <span className="font-bold text-slate-800">{student.motherName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">เบอร์โทรติดต่อ</span>
                    <span className="font-bold text-indigo-600">{student.parentPhone}</span>
                  </div>
                </div>
              </div>
            </div>`);
  content = content.replace(allergiesMatch, replaceStr);
}

const healthMatch = /<div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">/;
const newHealth = `<div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">โรคประจำตัว</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.congenitalDisease}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">ข้อมูลสุขภาพอื่นๆ</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.medicalInfo}</p>
                      </div>`;
content = content.replace(healthMatch, newHealth);

fs.writeFileSync('src/components/Student360.tsx', content, 'utf8');
console.log('done');
