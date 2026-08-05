const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

// I also need to add a filter to the remaining indicators table.
const tableTarget = `            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-800">มีตัวชี้วัดที่ยังไม่ได้ถูกใช้งาน (คงเหลือ)</p>
                  <p className="text-[11px] text-rose-600 mt-1">คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน {totalRemaining} ตัวชี้วัด กรุณาตรวจสอบและเลือกใช้ให้ครบถ้วนในภาคเรียนนี้</p>
                </div>
              </div>
              <div className="mt-2 bg-white rounded-lg border border-rose-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar max-h-60">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-rose-50/50 text-rose-700 font-bold border-b border-rose-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-24">รหัสตัวชี้วัด</th>
                        <th className="px-3 py-2 min-w-[250px]">คำอธิบาย</th>
                        <th className="px-3 py-2 w-28 text-center">ประเภท</th>
                        <th className="px-3 py-2 w-32">มาตรฐาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {curriculums.map(curr => 
                        curr.standards.map((std: any) => 
                          std.indicators.map((ind: any) => {`;

const tableReplacement = `            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-rose-800">มีตัวชี้วัดที่ยังไม่ได้ถูกใช้งาน (คงเหลือ)</p>
                    <p className="text-[11px] text-rose-600 mt-1">คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน {totalRemaining} ตัวชี้วัด กรุณาตรวจสอบและเลือกใช้ให้ครบถ้วนในภาคเรียนนี้</p>
                  </div>
                </div>
                {curriculums.length > 1 && (
                  <select 
                    value={tableGradeFilter}
                    onChange={(e) => setTableGradeFilter(e.target.value)}
                    className="text-xs p-1.5 rounded-lg border border-rose-200 text-rose-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 min-w-[120px]"
                  >
                    <option value="all">ทุกระดับชั้น</option>
                    {curriculums.map(c => (
                      <option key={c.gradeLevel} value={c.gradeLevel}>{c.gradeLevel}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mt-2 bg-white rounded-lg border border-rose-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar max-h-60">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-rose-50/50 text-rose-700 font-bold border-b border-rose-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-24">รหัสตัวชี้วัด</th>
                        <th className="px-3 py-2 min-w-[250px]">คำอธิบาย</th>
                        <th className="px-3 py-2 w-28 text-center">ประเภท</th>
                        <th className="px-3 py-2 w-32">มาตรฐาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {curriculums
                        .filter(c => tableGradeFilter === 'all' || c.gradeLevel === tableGradeFilter)
                        .map(curr => 
                        curr.standards.map((std: any) => 
                          std.indicators.map((ind: any) => {`;

code = code.replace(tableTarget, tableReplacement);

// We also need to add state for tableGradeFilter
const calcTarget = `  // Calculate remaining indicators`;
const calcReplacement = `  const [tableGradeFilter, setTableGradeFilter] = useState<string>('all');
  
  // Calculate remaining indicators`;
code = code.replace(calcTarget, calcReplacement);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
