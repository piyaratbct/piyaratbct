const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

// 1. Add timeView state
content = content.replace(
  'const [totalLearningDays, setTotalLearningDays] = useState(100);',
  `const [totalLearningDays, setTotalLearningDays] = useState(100);\n  const [timeView, setTimeView] = useState<'term' | 'year'>('term');`
);

// 2. Fetch all for the academic year
content = content.replace(
  `        const sq = query(
          collection(db, 'schedules'),
          where('academicYear', '==', systemAcademicYear),
          where('semester', '==', systemSemester)
        );`,
  `        const sq = query(
          collection(db, 'schedules'),
          where('academicYear', '==', systemAcademicYear)
        );`
);

content = content.replace(
  `        const aq = query(
          collection(db, 'attendanceSessions'),
          where('academicYear', '==', systemAcademicYear),
          where('semester', '==', systemSemester)
        );`,
  `        const aq = query(
          collection(db, 'attendanceSessions'),
          where('academicYear', '==', systemAcademicYear)
        );`
);

// 3. Filter in useMemo based on timeView
content = content.replace(
  `const gradeSchedules = schedules.filter(s => s.gradeLevel === selectedGrade);
    const gradeSessions = sessions.filter(s => s.gradeLevel === selectedGrade);`,
  `const gradeSchedules = schedules.filter(s => s.gradeLevel === selectedGrade && (timeView === 'year' || s.semester === systemSemester));
    const gradeSessions = sessions.filter(s => s.gradeLevel === selectedGrade && (timeView === 'year' || s.semester === systemSemester));`
);

// 4. Update the target mapping
content = content.replace(
  `        curriculumTermTarget: Math.round(totalHours / 2),
        scheduleTermTarget: 0,
        targetPeriodsTotal: Math.round(totalHours / 2),`,
  `        curriculumTermTarget: Math.round(totalHours / 2),
        scheduleTermTarget: 0,
        targetPeriodsTotal: timeView === 'year' ? totalHours : Math.round(totalHours / 2),`
);

// Add timeView to dependency array
content = content.replace(
  `}, [schedules, sessions, selectedGrade, totalLearningDays, curriculums]);`,
  `}, [schedules, sessions, selectedGrade, totalLearningDays, curriculums, timeView, systemSemester]);`
);

content = content.replace(
  `targetPeriodsTotal: sch.periodsPerWeek * 20, // Fallback if no curriculum`,
  `targetPeriodsTotal: timeView === 'year' ? sch.periodsPerWeek * 40 : sch.periodsPerWeek * 20, // Fallback`
);

// 5. Add UI toggle
const headerStr = `        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            รายงานชั่วโมงเรียนและแผนการสอน (Progress)
          </h3>
          <p className="text-sm text-slate-500">ตรวจสอบความคืบหน้าการจัดการเรียนการสอนโดยอ้างอิงเป้าหมายเวลาเรียนจากระบบจัดการหลักสูตรเป็นหลัก</p>
        </div>`;

const newHeaderStr = `        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            รายงานชั่วโมงเรียนและแผนการสอน (Progress)
          </h3>
          <p className="text-sm text-slate-500">ตรวจสอบความคืบหน้าการจัดการเรียนการสอนโดยอ้างอิงเป้าหมายเวลาเรียนจากระบบจัดการหลักสูตรเป็นหลัก</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTimeView('term')}
            className={\`px-3 py-1.5 text-xs font-bold rounded-md transition-colors \${
              timeView === 'term' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }\`}
          >
            รายภาคเรียน ({systemSemester})
          </button>
          <button
            onClick={() => setTimeView('year')}
            className={\`px-3 py-1.5 text-xs font-bold rounded-md transition-colors \${
              timeView === 'year' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }\`}
          >
            รายปีการศึกษา ({systemAcademicYear})
          </button>
        </div>`;

content = content.replace(headerStr, newHeaderStr);

fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched LearningHoursReport");
