const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

const targetJSX = `                    </div>

                    {showTeacherFilter && (`;

const replacementJSX = `                    </div>

                    {plan.approverComment && (
                      <div className={\`mt-auto mb-3 p-2.5 rounded-lg border text-xs \${isRejected ? 'bg-rose-50 border-rose-100 text-rose-700' : isApproved ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'}\`}>
                        <p className="font-bold flex items-center gap-1 mb-1">
                          <MessageSquareDashed className="w-3.5 h-3.5" /> 
                          ความคิดเห็นจาก {plan.approverName || "ฝ่ายวิชาการ"}:
                        </p>
                        <p className="leading-relaxed line-clamp-2" title={plan.approverComment}>{plan.approverComment}</p>
                      </div>
                    )}

                    {showTeacherFilter && (`;

code = code.replace(targetJSX, replacementJSX);
fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
