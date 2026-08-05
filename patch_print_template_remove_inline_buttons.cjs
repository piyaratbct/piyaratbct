const fs = require('fs');
let code = fs.readFileSync('src/components/PrintTemplate.tsx', 'utf8');

const targetTeacherSig = `                    <img src={(record as any).teacherSignature} alt="Teacher Electronic Signature" className={\`\${isCompact ? 'max-h-12' : 'max-h-18'} object-contain\`} referrerPolicy="no-referrer" />
                    {currentUser?.id === record.teacherId && currentUser?.role === 'teacher' && !record.deptHeadApproved && (
                      <button 
                        type="button" 
                        onClick={() => handleResetSignature('teacher')}
                        className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-200 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md print:hidden transition"
                      >
                        ล้างลายเซ็น
                      </button>
                    )}
                  </div>
                ) : (
                  currentUser?.id === record.teacherId && currentUser?.role === 'teacher' ? (
                    <button 
                      type="button"
                      onClick={() => setSigningRole('teacher')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-300 shadow-xs cursor-pointer print:hidden transition"
                    >
                      ✍️ ลงชื่อครูอิเล็กทรอนิกส์
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100 print:hidden select-none">
                      ⏳ รอครูผู้สอนลงชื่อ
                    </div>
                  )
                )}`;

const replacementTeacherSig = `                    <img src={(record as any).teacherSignature} alt="Teacher Electronic Signature" className={\`\${isCompact ? 'max-h-12' : 'max-h-18'} object-contain\`} referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100 print:hidden select-none">
                    ⏳ รอครูผู้สอนลงชื่อ
                  </div>
                )}`;

const targetDeptSig = `                    <img src={record.deptHeadSignature} alt="Academic Supervisor Signature" className={\`\${isCompact ? 'max-h-12' : 'max-h-18'} object-contain\`} referrerPolicy="no-referrer" />
                    {allowAcademicSignature && (currentUser?.role === 'admin' || currentUser?.role === 'academic' || currentUser?.role === 'deputy') && (
                      <button 
                        type="button" 
                        onClick={() => handleResetSignature('deptHead')}
                        className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-200 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md print:hidden transition"
                      >
                        ล้างลายเซ็น
                      </button>
                    )}
                  </div>
                ) : (
                  allowAcademicSignature && (currentUser?.role === 'admin' || currentUser?.role === 'academic' || currentUser?.role === 'deputy') ? (
                    <button 
                      type="button"
                      onClick={() => setSigningRole('deptHead')}
                      className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-150 text-indigo-700 font-bold rounded-lg text-[10px] border border-indigo-200 shadow-xs cursor-pointer print:hidden transition animate-pulse"
                    >
                      ✍️ ลงชื่อตรรวจรับรองฝ่ายวิชาการ
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100 print:hidden select-none" title="ผู้มีสิทธิ์ตรวจรับรองสามารถตรวจสอบและอนุมัติรับรองได้ทันที">
                      ⏳ รอตรวจรับรองอนุมัติ
                    </div>
                  )
                )}`;

const replacementDeptSig = `                    <img src={record.deptHeadSignature} alt="Academic Supervisor Signature" className={\`\${isCompact ? 'max-h-12' : 'max-h-18'} object-contain\`} referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100 print:hidden select-none" title="ผู้มีสิทธิ์ตรวจรับรองสามารถตรวจสอบและอนุมัติรับรองได้ทันที">
                    ⏳ รอตรวจรับรองอนุมัติ
                  </div>
                )}`;

code = code.replace(targetTeacherSig, replacementTeacherSig);
code = code.replace(targetDeptSig, replacementDeptSig);
fs.writeFileSync('src/components/PrintTemplate.tsx', code, 'utf8');
