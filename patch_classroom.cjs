const fs = require('fs');
let code = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf-8');

const oldBtn = `<button
                          onClick={() => setEvaluatingStudent(student)}
                          className={\`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors \${
                            hasAssessed
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          }\`}
                        >
                          {hasAssessed ? "แก้ไขประเมิน" : "เริ่มประเมิน"}
                        </button>`;

const newBtn = `<button
                          onClick={() => setEvaluatingStudent(student)}
                          disabled={student.status !== "active"}
                          className={\`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors \${
                            student.status !== "active"
                              ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-70"
                              : hasAssessed
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          }\`}
                          title={student.status !== "active" ? "ไม่สามารถประเมินนักเรียนที่ย้าย/ออกแล้วได้" : ""}
                        >
                          {hasAssessed ? "แก้ไขประเมิน" : "เริ่มประเมิน"}
                        </button>`;

code = code.replace(oldBtn, newBtn);
fs.writeFileSync('src/components/ClassroomModule.tsx', code, 'utf-8');
console.log("Patched assess button");
