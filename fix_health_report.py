import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Fix currentChartMonth logic
old_logic = """          {activeTab === "health-report" && (() => {
            const allAssessments = Object.values(assessments) as StudentAssessment[];
            const availableMonthsSet = new Set<string>();
            allAssessments.forEach(a => { if (a.month) availableMonthsSet.add(a.month); });
            const availableMonths = Array.from(availableMonthsSet).sort().reverse();
            
            const currentChartMonth = selectedMonth || availableMonths[0];"""

new_logic = """          {activeTab === "health-report" && (() => {
            const allAssessments = Object.values(assessments) as StudentAssessment[];
            const availableMonthsSet = new Set<string>();
            allAssessments.forEach(a => { if (a.month) availableMonthsSet.add(a.month); });
            const availableMonths = Array.from(availableMonthsSet).sort().reverse();
            
            const currentChartMonth = selectedMonth;"""

content = content.replace(old_logic, new_logic)

# Replace the Chart Titles and conditional rendering of the top section
old_top_section = """            return (
              <div className="p-6 relative animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      รายงานสรุปพัฒนาการทางร่างกาย (BMI)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      เปรียบเทียบข้อมูล BMI ของนักเรียน
                    </p>
                  </div>
                  {currentChartMonth && (
                    <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-bold text-sm">
                      ข้อมูลประจำเดือน {currentChartMonth}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">สัดส่วนนักเรียนแยกตามเกณฑ์ (ห้องนี้)</h4>
                    <div className="h-64 w-full">"""

new_top_section = """            return (
              <div className="p-6 relative animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      รายงานสรุปพัฒนาการทางร่างกาย (BMI)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      เปรียบเทียบข้อมูล BMI ของนักเรียน
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowHistoryCompare(!showHistoryCompare)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${showHistoryCompare ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {showHistoryCompare ? 'ซ่อนเปรียบเทียบย้อนหลัง' : 'เปรียบเทียบย้อนหลัง 4 เดือน'}
                    </button>
                    {currentChartMonth && (
                      <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-bold text-sm">
                        ข้อมูลประจำเดือน {currentChartMonth}
                      </div>
                    )}
                  </div>
                </div>
                
                {currentChartMonth && bmiData.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-700 mb-4 text-center">สัดส่วนนักเรียนแยกตามเกณฑ์ (ห้อง {selectedGrade})</h4>
                      <div className="h-64 w-full">"""

content = content.replace(old_top_section, new_top_section)

# Handle the closing of the top section and the start of the table
old_table_start = """                        <div className="h-full flex items-center justify-center text-slate-400">
                          ไม่มีข้อมูลระดับชั้น
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">"""

new_table_start = """                        <div className="h-full flex items-center justify-center text-slate-400">
                          ไม่มีข้อมูลระดับชั้น
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8 text-center text-slate-500 font-medium">
                    {currentChartMonth ? 'ไม่มีข้อมูลพัฒนาการร่างกายในเดือนนี้' : 'กรุณาเลือกประจำเดือนเพื่อดูสรุปข้อมูล'}
                  </div>
                )}

                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">"""

content = content.replace(old_table_start, new_table_start)

# Add name prop to Bars to fix English text in charts
content = content.replace('<Bar dataKey="underweight" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />', '<Bar dataKey="underweight" name="ผอม" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />')
content = content.replace('<Bar dataKey="normal" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />', '<Bar dataKey="normal" name="สมส่วน" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />')
content = content.replace('<Bar dataKey="overweight" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />', '<Bar dataKey="overweight" name="ท้วม" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />')
content = content.replace('<Bar dataKey="obese1" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />', '<Bar dataKey="obese1" name="เริ่มอ้วน" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />')
content = content.replace('<Bar dataKey="obese2" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />', '<Bar dataKey="obese2" name="อ้วน" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />')
content = content.replace('<Bar dataKey="unknown" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />', '<Bar dataKey="unknown" name="ขาดวันเกิด" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />')


with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
