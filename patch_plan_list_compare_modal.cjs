const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

const targetModal = `      )}
    </div>
  );
}`;

const replacementModal = `      )}

      {/* Compare Modal */}
      {comparingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Columns className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">เปรียบเทียบ: แผนการสอน vs บันทึกหลังสอน</h3>
                  <p className="text-xs text-slate-500 font-medium">เรื่อง: {comparingPlan.title}</p>
                </div>
              </div>
              <button
                onClick={() => setComparingPlan(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <Trash2 className="h-0 w-0 hidden" /> {/* To load icon if not used else */}
                <span className="font-bold">ปิดหน้าต่าง</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              {(() => {
                const associatedRecords = getAssociatedRecords(comparingPlan.id);
                if (associatedRecords.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <MessageSquareDashed className="h-10 w-10 text-slate-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-700">ไม่พบบันทึกหลังสอนที่เกี่ยวข้อง</h4>
                      <p className="text-sm text-slate-500 max-w-sm mt-2">
                        แผนการสอนนี้ยังไม่ถูกนำไปใช้อ้างอิงในการเขียนบันทึกหลังสอน
                      </p>
                    </div>
                  );
                }
                
                // Show side by side for each record (usually 1)
                return (
                  <div className="space-y-8">
                    {associatedRecords.map((record, idx) => (
                      <div key={record.id} className="flex flex-col lg:flex-row gap-6">
                        {/* Left Side: Lesson Plan */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                          <h4 className="text-sm font-black text-indigo-600 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <FileText className="w-4 h-4" /> แผนการสอน
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">จุดประสงค์การเรียนรู้</p>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {comparingPlan.objectives || '-'}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">กิจกรรมการเรียนรู้</p>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {comparingPlan.activities || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Side: Lesson Record */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                          <h4 className="text-sm font-black text-emerald-600 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <MessageSquareDashed className="w-4 h-4" /> บันทึกหลังสอน {associatedRecords.length > 1 ? \`(ครั้งที่ \${idx + 1})\` : ''}
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ผลการจัดกิจกรรม / สาระ</p>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {record.content || '-'}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ปัญหา / อุปสรรค</p>
                              <div className="text-sm text-rose-700 whitespace-pre-wrap leading-relaxed bg-rose-50 p-3 rounded-lg border border-rose-100">
                                {record.limitations || '-'}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ข้อเสนอแนะ / แนวทางแก้ไข</p>
                              <div className="text-sm text-amber-700 whitespace-pre-wrap leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
                                {record.suggestions || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(targetModal, replacementModal);
fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
