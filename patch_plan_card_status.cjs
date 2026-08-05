const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

const targetStatus = `                      <span
                        className={\`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border \${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isRejected
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }\`}
                      >
                        {isApproved
                          ? "อนุมัติแล้ว"
                          : isRejected
                            ? "ตีกลับให้แก้"
                            : "ฉบับร่าง"}
                      </span>`;

const replacementStatus = `                      <span
                        className={\`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border \${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isRejected
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : plan.status === 'submitted'
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }\`}
                      >
                        {isApproved
                          ? "อนุมัติแล้ว"
                          : isRejected
                            ? "ตีกลับให้แก้"
                            : plan.status === 'submitted'
                              ? "รอประเมิน"
                              : "ฉบับร่าง"}
                      </span>`;

code = code.replace(targetStatus, replacementStatus);
fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
