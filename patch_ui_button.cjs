const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

const targetForm = `<form onSubmit={handleSubmit} className="p-6 space-y-5">`;
const replacementForm = `<form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleOpenPlanModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
          >
            <BookCheck className="w-4 h-4" />
            นำเข้าจากแผนการสอน
          </button>
        </div>`;

code = code.replace(targetForm, replacementForm);

const targetReturn = `      </form>
    </div>`;

const replacementReturn = `      </form>

      {/* Plan Import Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800">เลือกแผนการสอน</h3>
                <p className="text-xs text-slate-500 font-medium">นำเข้าข้อมูลแผนการสอนมาใช้ในบันทึกหลังสอน</p>
              </div>
              <button 
                onClick={() => setShowPlanModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto bg-slate-50">
              {isLoadingPlans ? (
                <div className="text-center py-10">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">กำลังโหลดข้อมูลแผนการสอน...</p>
                </div>
              ) : availablePlans.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookCheck className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">ไม่พบข้อมูลแผนการสอน</p>
                  <p className="text-xs text-slate-400 mt-1">คุณสามารถสร้างแผนการสอนได้ที่เมนู "การจัดการผู้สอน"</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {availablePlans.map(plan => (
                    <div 
                      key={plan.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-4"
                      onClick={() => handleImportPlan(plan)}
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 truncate text-sm">{plan.title || 'ไม่มีชื่อแผน'}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2">
                            {plan.date ? formatThaiDate(plan.date) : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md">
                            <BookCheck className="w-3 h-3" />
                            {plan.subject}
                          </span>
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">
                            <Globe className="w-3 h-3" />
                            {plan.gradeLevel}
                          </span>
                        </div>
                        {plan.objectives && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            <span className="font-semibold text-slate-600">จุดประสงค์:</span> {plan.objectives}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>`;

code = code.replace(targetReturn, replacementReturn);
fs.writeFileSync('src/components/LessonLogForm.tsx', code, 'utf8');
