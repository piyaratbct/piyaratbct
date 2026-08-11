const fs = require('fs');
let content = fs.readFileSync('src/components/Student360.tsx', 'utf8');

// 1. Add import for Student type if not exists
if (!content.includes('import { Student } from "../types"')) {
  content = content.replace(
    "import { \n  Search,", 
    "import { Student } from \"../types\";\nimport { \n  Search,"
  );
}

// 2. Change signature and state initialization
const oldFunc = 'export function Student360() {\n  const [searchTerm, setSearchTerm] = useState("");\n  const [selectedStudentId, setSelectedStudentId] = useState<string | null>("S-001");';

const newFunc = `export function Student360({ initialStudent }: { initialStudent?: Student | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Extend MOCK_STUDENTS with initialStudent if it exists and is not in MOCK_STUDENTS
  const extendedStudents = React.useMemo(() => {
    const list = [...MOCK_STUDENTS];
    if (initialStudent && !list.find(s => s.id === initialStudent.id || s.studentId === initialStudent.studentId)) {
      list.push({
        id: initialStudent.id,
        studentId: initialStudent.studentId,
        firstName: initialStudent.firstName,
        lastName: initialStudent.lastName,
        nickname: initialStudent.nickname || '',
        grade: initialStudent.gradeLevel,
        avatar: \`https://i.pravatar.cc/150?u=\${initialStudent.studentId}\`,
        dob: initialStudent.dob || "ไม่ระบุ",
        bloodType: "ไม่ระบุ",
        allergies: [initialStudent.allergicFood, initialStudent.allergicMedicine].filter(Boolean).join(', ') || "ไม่มี",
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
      });
    }
    return list;
  }, [initialStudent]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudent ? initialStudent.id : "S-001");`;

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc);
  
  // Also replace MOCK_STUDENTS references inside the component with extendedStudents
  content = content.replace(/MOCK_STUDENTS\.filter/g, 'extendedStudents.filter');
  content = content.replace(/MOCK_STUDENTS\.find/g, 'extendedStudents.find');
  
  fs.writeFileSync('src/components/Student360.tsx', content, 'utf8');
  console.log('Student360 patched');
} else {
  console.log('Student360 oldFunc not found');
}
