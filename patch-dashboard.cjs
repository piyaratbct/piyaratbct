const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherSubjectsDashboard.tsx', 'utf8');

const propsOld = `  systemAcademicYear: string;
  onNavigateToSubject?: (subjectName: string, gradeLevel: string) => void;
}`;

const propsNew = `  systemAcademicYear: string;
  onNavigateToSubject?: (subjectName: string, gradeLevel: string) => void;
  onAction?: (action: 'gradebook' | 'plans' | 'logs', subjectName: string, gradeLevel: string) => void;
}`;

content = content.replace(propsOld, propsNew);

const componentDeclOld = `export const TeacherSubjectsDashboard: React.FC<TeacherSubjectsDashboardProps> = ({
  currentTeacher,
  systemSemester,
  systemAcademicYear,
  onNavigateToSubject
}) => {`;

const componentDeclNew = `export const TeacherSubjectsDashboard: React.FC<TeacherSubjectsDashboardProps> = ({
  currentTeacher,
  systemSemester,
  systemAcademicYear,
  onNavigateToSubject,
  onAction
}) => {`;

content = content.replace(componentDeclOld, componentDeclNew);

const cardOld = `          <div 
            key={idx}
            className="group relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
            onClick={() => onNavigateToSubject && onNavigateToSubject(card.subjectName, card.gradeLevel)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100 mb-3">
                {card.gradeLevel}
              </span>
              <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                {card.subjectName}
              </h3>
            </div>
            
            <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center text-xs font-medium text-slate-600">
                <Clock className="h-3.5 w-3.5 mr-2 text-slate-400" />
                สอน {card.periods} คาบ/สัปดาห์
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-600 shadow-sm z-20">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm z-10">
                    <Users className="h-3 w-3" />
                  </div>
                </div>
                <div className="text-xs font-bold text-indigo-600 flex items-center group-hover:translate-x-1 transition-transform">
                  เข้าจัดการ <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </div>
          </div>`;

const cardNew = `          <div 
            key={idx}
            className="group relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            
            <div className="mb-4 relative z-10">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100 mb-3">
                {card.gradeLevel}
              </span>
              <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                {card.subjectName}
              </h3>
              <div className="flex items-center text-xs font-medium text-slate-500 mt-2">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                สอน {card.periods} คาบ/สัปดาห์
              </div>
            </div>
            
            <div className="mt-auto space-y-2 pt-4 border-t border-slate-100 relative z-10">
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => onAction && onAction('gradebook', card.subjectName, card.gradeLevel)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 rounded-lg text-xs font-bold transition-colors border border-fuchsia-100"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  สมุดบันทึกคะแนน
                </button>
                <div className="grid grid-cols-2 gap-2">
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
                </div>
              </div>
            </div>
          </div>`;

content = content.replace(cardOld, cardNew);

// Make sure Calculator is imported
if (!content.includes('Calculator')) {
  content = content.replace("import { BookOpen", "import { Calculator, BookOpen");
}

fs.writeFileSync('src/components/TeacherSubjectsDashboard.tsx', content);
console.log("Patched TeacherSubjectsDashboard");
