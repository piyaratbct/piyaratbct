const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

// 1. Add state for selectedStudent360
if (!content.includes('selectedStudent360')) {
  content = content.replace(
    'const [activeTab, setActiveTab] = useState<"students" | "student360" | "attendance" | "assessments" | "special-care" | "health-report">("students");',
    'const [activeTab, setActiveTab] = useState<"students" | "student360" | "attendance" | "assessments" | "special-care" | "health-report">("students");\n  const [selectedStudent360, setSelectedStudent360] = useState<Student | null>(null);'
  );
}

// 2. Add the button in the action column
const viewBtnStr = `<button
                                onClick={() => setViewingStudent(student)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="ดูข้อมูลนักเรียน"
                              >
                                <Search className="h-4 w-4" />
                              </button>`;

const shortcutBtnStr = `
                              <button
                                onClick={() => {
                                  setSelectedStudent360(student);
                                  setActiveTab("student360");
                                }}
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                title="ดูข้อมูล Student 360°"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>`;

if (content.includes(viewBtnStr) && !content.includes('setSelectedStudent360(student)')) {
  content = content.replace(viewBtnStr, viewBtnStr + shortcutBtnStr);
}

// 3. Update the render logic for <Student360 />
content = content.replace(
  '<Student360 />',
  '<Student360 initialStudent={selectedStudent360} />'
);

// 4. Update the Nav Tab for Student360 to clear the selectedStudent360 so it doesn't stay stuck if we just click the tab
const tabStr = `onClick={() => setActiveTab("student360")}`;
const tabReplace = `onClick={() => { setSelectedStudent360(null); setActiveTab("student360"); }}`;
content = content.replace(tabStr, tabReplace);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('ClassroomModule 360 patched');
