const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherSubjectsDashboard.tsx', 'utf8');

const oldBtnGroup = `                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => onAction && onAction('plans', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors border border-indigo-100"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    แผนการสอน
                  </button>
                  <button 
                    onClick={() => onAction && onAction('logs', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    บันทึกหลังสอน
                  </button>
                </div>`;

const newBtnGroup = `                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => onAction && onAction('attendance', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-100"
                  >
                    <Users className="h-3.5 w-3.5" />
                    เช็คชื่อ
                  </button>
                  <button 
                    onClick={() => onAction && onAction('plans', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors border border-indigo-100"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    แผน
                  </button>
                  <button 
                    onClick={() => onAction && onAction('logs', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    บันทึกสอน
                  </button>
                </div>`;

content = content.replace(oldBtnGroup, newBtnGroup);

const oldProps = `onAction?: (action: 'gradebook' | 'plans' | 'logs', subjectName: string, gradeLevel: string) => void;`;
const newProps = `onAction?: (action: 'gradebook' | 'plans' | 'logs' | 'attendance', subjectName: string, gradeLevel: string) => void;`;
content = content.replace(oldProps, newProps);

fs.writeFileSync('src/components/TeacherSubjectsDashboard.tsx', content);
console.log("Patched TeacherSubjectsDashboard");
