import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Fix the availableMonths condition for table headers
old_table_header_logic = """                          {availableMonths.length === 0 ? (
                            <th className="px-4 py-3 text-center whitespace-nowrap">ไม่มีข้อมูลการประเมิน</th>
                          ) : (
                            availableMonths.slice(0, 4).map(m => (
                              <th key={m} className="px-2 py-3 text-center whitespace-nowrap border-r border-slate-200 text-xs">
                                <div className="font-bold text-pink-600">{m}</div>
                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">BMI / ผลประเมิน</div>
                              </th>
                            ))
                          )}
                          {availableMonths.length > 1 && (
                            <th className="px-4 py-3 text-center w-20 whitespace-nowrap">แนวโน้ม</th>
                          )}"""

new_table_header_logic = """                          {(() => {
                            const tableDisplayMonths = showHistoryCompare ? availableMonths.slice(0, 4) : (selectedMonth ? [selectedMonth] : []);
                            if (tableDisplayMonths.length === 0) {
                              return <th className="px-4 py-3 text-center whitespace-nowrap">ไม่มีข้อมูลการประเมิน</th>;
                            }
                            return (
                              <>
                                {tableDisplayMonths.map(m => (
                                  <th key={m} className="px-2 py-3 text-center whitespace-nowrap border-r border-slate-200 text-xs">
                                    <div className="font-bold text-pink-600">{m}</div>
                                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">BMI / ผลประเมิน</div>
                                  </th>
                                ))}
                                {tableDisplayMonths.length > 1 && (
                                  <th className="px-4 py-3 text-center w-20 whitespace-nowrap">แนวโน้ม</th>
                                )}
                              </>
                            );
                          })()}"""

content = content.replace(old_table_header_logic, new_table_header_logic)

# Fix the table body row iteration for displayMonths
old_row_logic = """                      <tbody>
                        {displayedStudents.map((student) => {
                          const displayMonths = availableMonths.slice(0, 4);
                          const studentDataMap: Record<string, { weight: number, height: number, bmi: number, bmiLabel: string, bmiColor: string }> = {};"""

new_row_logic = """                      <tbody>
                        {displayedStudents.map((student) => {
                          const displayMonths = showHistoryCompare ? availableMonths.slice(0, 4) : (selectedMonth ? [selectedMonth] : []);
                          const studentDataMap: Record<string, { weight: number, height: number, bmi: number, bmiLabel: string, bmiColor: string }> = {};"""

content = content.replace(old_row_logic, new_row_logic)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)

