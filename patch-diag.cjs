const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

content = content.replace(
  `// หาจากชื่อวิชาและระดับชั้นก่อน
                            let curriculumMatch = curriculums.find(c => c.subjectName === sub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                            
                            // ถ้าหาไม่เจอ ลองหาจากชื่อวิชาอย่างเดียว (fallback สำหรับกิจกรรมที่อาจตั้งค่าระดับชั้นหลวมๆ)
                            if (!curriculumMatch) {
                               curriculumMatch = curriculums.find(c => c.subjectName === sub);
                            }
                            const requiredHoursYear = curriculumMatch?.totalHours || curriculumMatch?.requiredHoursPerTerm || 0;
                            const requiredHours = Math.round(requiredHoursYear / 2);`,
  `// Normalize strings for safer matching
                            const safeSub = (sub || '').trim();
                            // หาจากชื่อวิชาและระดับชั้นก่อน
                            let curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                            
                            // ถ้าหาไม่เจอ ลองหาจากชื่อวิชาอย่างเดียว (fallback)
                            if (!curriculumMatch) {
                               curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub);
                            }
                            // ถ้ายังไม่เจอ ลองหาแบบ Substring
                            if (!curriculumMatch) {
                               curriculumMatch = curriculums.find(c => ((c.subjectName || '').includes(safeSub) || safeSub.includes(c.subjectName || 'XXX')) && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                            }
                            
                            const requiredHoursYear = curriculumMatch?.totalHours || curriculumMatch?.requiredHoursPerTerm || 0;
                            const requiredHours = Math.round(requiredHoursYear / 2);
                            
                            let diagnosticMsg = '';
                            if (!curriculumMatch) diagnosticMsg = 'ไม่พบชื่อวิชานี้ในโครงสร้างหลักสูตร';
                            else if (requiredHoursYear === 0) diagnosticMsg = 'พบวิชาในหลักสูตรแต่กำหนดชั่วโมงเป็น 0';
                            `
);

content = content.replace(
  `<td className="py-4 px-6 text-slate-600 align-top">
                                  {requiredHoursYear > 0 ? (`,
  `<td className="py-4 px-6 text-slate-600 align-top">
                                  {requiredHoursYear > 0 ? (`
);

content = content.replace(
  `                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}`,
  `                                  ) : (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-slate-400">-</span>
                                      <span className="text-[10px] text-rose-400">{diagnosticMsg}</span>
                                    </div>
                                  )}`
);

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Patched diagnostics");
