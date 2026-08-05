const fs = require('fs');
let code = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

const newContent = `
      {activeTab === "curriculum" && (
        <CurriculumManager />
      )}

      {activeTab === "grading" && (
        <GradingManager />
      )}

      {activeTab === "lesson_plan" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="h-20 w-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">ระบบแผนการสอน (ส่วนกลาง)</h3>
          <p className="text-slate-500 max-w-md">
            ตรวจสอบและจัดการแผนการสอนของบุคลากรในโรงเรียน 
            (การสร้างและจัดการแผนการสอนส่วนบุคคลสามารถเข้าถึงได้จากเมนู "1. การจัดการผู้สอน")
          </p>
          <p className="text-indigo-600 mt-4 text-sm font-bold bg-indigo-50 px-4 py-2 rounded-lg">
            ระบบกำลังอยู่ระหว่างการพัฒนา
          </p>
        </div>
      )}
`;

if (!code.includes('<CurriculumManager />')) {
  code = code.replace(
    '    </div>\n  );\n};',
    newContent + '    </div>\n  );\n};'
  );
}

fs.writeFileSync('src/components/AcademicModule.tsx', code, 'utf8');
