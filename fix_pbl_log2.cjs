const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');

// Rename component
code = code.replace(/LessonLogForm/g, 'PBLLessonLogForm');

// Change Title
code = code.replace(
  /<h3 className="text-lg font-black text-slate-800 flex items-center gap-2">[\s\S]*?<\/h3>/,
  `<h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          {initialRecord ? "แก้ไขบันทึกหลังสอน (PBL)" : "บันทึกหลังสอนใหม่ (PBL)"}
        </h3>`
);

// 2. Remove isPBL checkbox and just render the content in a "Unit Box"
const newPblUI = `<div className="col-span-1 md:col-span-full bg-emerald-50/50 p-6 rounded-2xl border-2 border-emerald-500/20 shadow-sm mt-4">
            <div className="flex items-center gap-3 mb-4 border-b border-emerald-200/50 pb-3">
              <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">บันทึกผลตามกระบวนการ Problem-Based Learning</h4>
                <p className="text-xs text-emerald-600/80">ทบทวนปัญหาและกระบวนการสืบเสาะของนักเรียน</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-emerald-800 mb-1">ปัญหาหลักที่ใช้ (Driving Question) <span className="text-red-500">*</span></label>
                <textarea 
                  value={pblDrivingQuestion} 
                  onChange={(e) => setPblDrivingQuestion(e.target.value)} 
                  placeholder="บันทึกคำถามหลักที่ใช้กระตุ้นการเรียนรู้ในครั้งนี้..." 
                  className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-h-[80px]" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">กระบวนการสืบเสาะที่เกิดขึ้นจริง (Investigation Steps) <span className="text-red-500">*</span></label>
                  <textarea 
                    value={pblInvestigationSteps} 
                    onChange={(e) => setPblInvestigationSteps(e.target.value)} 
                    placeholder="บันทึกกระบวนการที่นักเรียนได้ลงมือปฏิบัติจริง ปัญหาที่พบระหว่างทาง..." 
                    className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-h-[100px]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">ผลลัพธ์และการนำเสนอ (Presentation) <span className="text-red-500">*</span></label>
                  <textarea 
                    value={pblPresentation} 
                    onChange={(e) => setPblPresentation(e.target.value)} 
                    placeholder="บันทึกผลลัพธ์ของนักเรียนและการนำเสนอชิ้นงาน/วิธีการแก้ปัญหา..." 
                    className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-h-[100px]" 
                  />
                </div>
              </div>
            </div>
          </div>`;

code = code.replace(
  /<div className="col-span-1 md:col-span-full bg-emerald-50\/50 p-4 rounded-xl border border-emerald-100 mt-2">[\s\S]*?<\/div>\n\n        \{\/\* 1\.5 Multi-grade level selection grid \*\/\}/g,
  `${newPblUI}\n\n        {/* 1.5 Multi-grade level selection grid */}`
);

// Make sure Target icon is imported
if (!code.includes('Target')) {
  code = code.replace(/import { (.*?) } from "lucide-react";/, 'import { $1, Target } from "lucide-react";');
}

// Ensure payload uses `isPBL: true`
code = code.replace(
  /isPBL,/,
  `isPBL: true,`
);

fs.writeFileSync('src/components/PBLLessonLogForm.tsx', code, 'utf8');
