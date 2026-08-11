const fs = require('fs');
let content = fs.readFileSync('src/components/Student360.tsx', 'utf8');

// 1. Update list.push to correctly extract names, phones, and new fields
const pushRegex = /list\.push\(\{[\s\S]*?\}\);/;
const newPush = `list.push({
        id: initialStudent.id,
        studentId: initialStudent.studentId,
        firstName: initialStudent.firstName,
        lastName: initialStudent.lastName,
        nickname: initialStudent.nickname || '',
        grade: initialStudent.gradeLevel,
        dob: initialStudent.dob || "ไม่ระบุ",
        bloodType: initialStudent.bloodGroup || "ไม่ระบุ",
        allergies: [initialStudent.allergicFood, initialStudent.allergicMedicine].filter(Boolean).join(', ') || "ไม่มี",
        allergicFood: initialStudent.allergicFood || "ไม่มี",
        allergicMedicine: initialStudent.allergicMedicine || "ไม่มี",
        congenitalDisease: initialStudent.congenitalDisease || "ไม่มี",
        medicalInfo: initialStudent.medicalInfo || "ไม่มี",
        fatherName: initialStudent.fatherName || [initialStudent.fatherFirstName, initialStudent.fatherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        motherName: initialStudent.motherName || [initialStudent.motherFirstName, initialStudent.motherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        fatherPhone: initialStudent.fatherPhone || "ไม่ระบุ",
        motherPhone: initialStudent.motherPhone || "ไม่ระบุ",
        parentPhone: initialStudent.parentPhone || "ไม่ระบุ",
        academic: {
          gpa: 0,
          attendanceRate: 100,
          subjects: []
        },
        health: {
          height: initialStudent.height || 0,
          weight: initialStudent.weight || 0,
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
content = content.replace(pushRegex, newPush);

// Update MOCK_STUDENTS with the new fields
content = content.replace(/allergies: "แพ้นมวัว, อาหารทะเล",/g, 'allergies: "แพ้นมวัว, อาหารทะเล",\n    allergicFood: "นมวัว, อาหารทะเล",\n    allergicMedicine: "ไม่มี",');
content = content.replace(/allergies: "ไม่มี",/g, 'allergies: "ไม่มี",\n    allergicFood: "ไม่มี",\n    allergicMedicine: "ไม่มี",');
content = content.replace(/parentPhone: "081-234-5678",/g, 'parentPhone: "081-234-5678",\n    fatherPhone: "081-234-5678",\n    motherPhone: "089-111-2222",');
content = content.replace(/parentPhone: "089-876-5432",/g, 'parentPhone: "089-876-5432",\n    fatherPhone: "081-333-4444",\n    motherPhone: "089-876-5432",');


// Update the UI overview - allergies and phone numbers
const allergiesUiRegex = /<div className="flex items-center justify-between text-sm">\s*<span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" \/> การแพ้<\/span>\s*<span className={`font-bold \$\{student\.allergies === 'ไม่มี' \? 'text-slate-800' : 'text-amber-600'\}`}>\s*\{student\.allergies\}\s*<\/span>\s*<\/div>/;

const newAllergiesUi = `<div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /> โรคประจำตัว</span>
                    <span className={\`font-bold \${student.congenitalDisease === 'ไม่มี' ? 'text-slate-800' : 'text-rose-600'}\`}>
                      {student.congenitalDisease}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /> แพ้อาหาร</span>
                    <span className={\`font-bold \${student.allergicFood === 'ไม่มี' ? 'text-slate-800' : 'text-orange-600'}\`}>
                      {student.allergicFood}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-purple-500" /> แพ้ยา</span>
                    <span className={\`font-bold \${student.allergicMedicine === 'ไม่มี' ? 'text-slate-800' : 'text-purple-600'}\`}>
                      {student.allergicMedicine}
                    </span>
                  </div>`;
content = content.replace(allergiesUiRegex, newAllergiesUi);


const familyUiRegex = /<div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">\s*<span className="text-slate-500">บิดา<\/span>[\s\S]*?<span className="font-bold text-indigo-600">\{student\.parentPhone\}<\/span>\s*<\/div>/;

const newFamilyUi = `<div className="flex flex-col gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">บิดา</span>
                      <span className="font-bold text-slate-800">{student.fatherName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 text-xs">เบอร์โทรศัพท์</span>
                      <span className="font-bold text-indigo-600 text-xs">{student.fatherPhone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pb-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">มารดา</span>
                      <span className="font-bold text-slate-800">{student.motherName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 text-xs">เบอร์โทรศัพท์</span>
                      <span className="font-bold text-indigo-600 text-xs">{student.motherPhone}</span>
                    </div>
                  </div>`;
content = content.replace(familyUiRegex, newFamilyUi);

fs.writeFileSync('src/components/Student360.tsx', content, 'utf8');
console.log('Student360 update done.');
