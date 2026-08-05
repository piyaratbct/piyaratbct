const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const targetUI = `          <div className="flex justify-end gap-3">
            {onCancel && (`;

const replacementUI = `          {/* Approval Section for Academic Head / Admin */}
          {(currentUserRole === "academic" || currentUserRole === "admin" || currentUserRole === "deputy") && initialPlan && (
            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="text-sm font-black text-indigo-700 flex items-center gap-2 mb-4">
                <Check className="h-4 w-4" />
                การตรวจประเมินและอนุมัติ (สำหรับหัวหน้าวิชาการ)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">สถานะการอนุมัติ</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus("draft")}
                      className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all border \${status === "draft" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}\`}
                    >
                      รอการพิจารณา (Draft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("submitted")}
                      className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all border \${status === "submitted" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}\`}
                    >
                      ขอรับการประเมิน (Submitted)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("approved")}
                      className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all border \${status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}\`}
                    >
                      อนุมัติ / ผ่าน (Approved)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("rejected")}
                      className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all border \${status === "rejected" ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}\`}
                    >
                      ส่งกลับแก้ไข (Rejected)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">ข้อเสนอแนะ / ความคิดเห็นเพิ่มเติม (ถ้ามี)</label>
                  <textarea
                    value={approverComment}
                    onChange={(e) => setApproverComment(e.target.value)}
                    placeholder="พิมพ์ความคิดเห็น หรือสิ่งที่ต้องแก้ไขเพิ่มเติม..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-h-[100px] resize-y text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {onCancel && (`

code = code.replace(targetUI, replacementUI);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
