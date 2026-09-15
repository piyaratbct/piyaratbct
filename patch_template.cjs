const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

const surveyCode = `
              {/* Part 5: Survey & Expectations */}
              {(record.surveySource?.length > 0 || record.surveyReasons?.length > 0 || record.surveyExpectations?.length > 0 || record.surveyPlan || record.additionalNotes) && (
                <div className="mt-4">
                  <h2 className="text-base font-black text-slate-800 mb-3 bg-slate-100 p-2 border-l-4 border-indigo-600 flex items-center">
                    <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">5</span> ข้อมูลเพิ่มเติมและแบบสำรวจ
                  </h2>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm px-4">
                    {record.surveySource && record.surveySource.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">ทราบข่าวการรับสมัครจาก: </span>
                        <span className="font-medium text-slate-900">
                          {record.surveySource.map(s => s === 'อื่นๆ' && record.surveySourceOther ? \`อื่นๆ (\${record.surveySourceOther})\` : s).join(', ')}
                        </span>
                      </div>
                    )}
                    {record.surveyReasons && record.surveyReasons.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">เหตุผลที่สนใจ: </span>
                        <span className="font-medium text-slate-900">{record.surveyReasons.join(', ')}</span>
                      </div>
                    )}
                    {record.surveyExpectations && record.surveyExpectations.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">ความคาดหวัง: </span>
                        <span className="font-medium text-slate-900">{record.surveyExpectations.join(', ')}</span>
                      </div>
                    )}
                    {record.surveyPlan && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">แผนการศึกษาต่อ: </span>
                        <span className="font-medium text-slate-900">{record.surveyPlan}</span>
                      </div>
                    )}
                    {record.additionalNotes && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">หมายเหตุเพิ่มเติม: </span>
                        <span className="font-medium text-slate-900">{record.additionalNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
`;

code = code.replace(/<div className="mt-20">/, surveyCode + '\n              <div className="mt-8">');

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched');
