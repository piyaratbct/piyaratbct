import fs from 'fs';

const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('<table className="w-full text-left text-sm">');
const endIndexStr = '</table>\n              </div>';
const endIndex = content.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacementContent = `<div className="flex flex-col">
                  {allSpecialCareStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูลสุขภาพที่ต้องระวัง
                    </div>
                  ) : (
                    allSpecialCareStudents.map((student) => {
                      const { weight, height } = getStudentHealthData(student);
                      let bmiLabel = '';
                      let bmiColor = '';
                      let bmiText = '-';
                      if (weight && height) {
                        const h = height / 100;
                        const bmi = weight / (h * h);
                        let ageYears = 7;
                        if (student.dob) {
                          const birthDate = new Date(student.dob);
                          const now = new Date();
                          ageYears = now.getFullYear() - birthDate.getFullYear();
                        }
                        const baseNormal = 14 + (ageYears - 6) * 0.3;
                        const baseObese1 = 20 + (ageYears - 6) * 0.6;
                        if (bmi < baseNormal) { bmiLabel = 'ผอม'; bmiColor = 'text-blue-600 bg-blue-50 border-blue-200'; }
                        else if (bmi >= baseObese1) { bmiLabel = 'เริ่มอ้วน/อ้วน'; bmiColor = 'text-red-600 bg-red-50 border-red-200'; }
                        else { bmiLabel = 'สมส่วน'; bmiColor = 'text-green-600 bg-green-50 border-green-200'; }
                        bmiText = \`\${weight} กก. / \${height} ซม. (BMI \${bmi.toFixed(1)})\`;
                      }

                      return (
                        <div key={student.id} className="p-3 sm:px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center font-bold text-pink-600 text-sm shrink-0 mt-0.5">
                              {student.number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-700 text-sm truncate whitespace-normal leading-tight flex items-center gap-2 flex-wrap">
                                <span>
                                  {student.firstName} {student.lastName}
                                  {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                                </span>
                                <span className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">{student.gradeLevel || '-'}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                รหัส: {student.studentId}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {bmiLabel && (
                                  <div className={\`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border \${bmiColor}\`}>
                                    {bmiText} - {bmiLabel}
                                  </div>
                                )}
                                {student.congenitalDisease && student.congenitalDisease !== 'ไม่มี' && student.congenitalDisease !== '-' && (
                                  <div className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-rose-100">โรค: {student.congenitalDisease}</div>
                                )}
                                {student.allergicFood && student.allergicFood !== 'ไม่มี' && student.allergicFood !== '-' && (
                                  <div className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-orange-100">แพ้อาหาร: {student.allergicFood}</div>
                                )}
                                {student.allergicMedicine && student.allergicMedicine !== 'ไม่มี' && student.allergicMedicine !== '-' && (
                                  <div className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-purple-100">แพ้ยา: {student.allergicMedicine}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>`;

  const newContent = content.substring(0, startIndex) + replacementContent + content.substring(endIndex + endIndexStr.length);
  fs.writeFileSync(file, newContent);
  console.log("Successfully replaced table 1!");
} else {
  console.error("Target block not found. startIndex:", startIndex, "endIndex:", endIndex);
}
