import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """            </div>
          )}
        </div>

        {/* Assessment Modal/Form Overlay */}"""

replacement = """            </div>
          )}

          {activeTab === "special-care" && (() => {
            const allergicMedStudents = countSource.filter((s) => s.allergicMedicine);
            const otherMedicalStudents = countSource.filter((s) => s.medicalInfo);
            const specialCareData = [
              { name: 'แพ้อาหาร', value: allergicFoodStudents.length, fill: '#f97316' },
              { name: 'โรคประจำตัว', value: congenitalDiseaseStudents.length, fill: '#a855f7' },
              { name: 'แพ้ยา', value: allergicMedStudents.length, fill: '#e11d48' },
              { name: 'อื่นๆ', value: otherMedicalStudents.length, fill: '#d97706' },
            ].filter(item => item.value > 0);

            const allSpecialCareStudents = countSource.filter(
              s => s.allergicFood || s.congenitalDisease || s.allergicMedicine || s.medicalInfo
            );

            return (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                    ข้อมูลนักเรียนที่ต้องดูแลเป็นพิเศษ
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    นักเรียนที่มีข้อมูลสุขภาพ แพ้อาหาร แพ้ยา หรือโรคประจำตัว
                  </p>
                </div>
              </div>

              {allSpecialCareStudents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">ไม่มีนักเรียนที่ต้องดูแลเป็นพิเศษในชั้นเรียนนี้</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart Section */}
                  <div className="lg:col-span-1 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">สถิติข้อมูลสุขภาพ</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={specialCareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {specialCareData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value) => [`${value} คน`, 'จำนวน']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* List Section */}
                  <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <tr>
                              <th className="px-4 py-3 text-center w-16">เลขที่</th>
                              <th className="px-4 py-3">ชื่อ-สกุล</th>
                              <th className="px-4 py-3">ข้อมูลสุขภาพที่ต้องระวัง</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allSpecialCareStudents.map((student) => (
                              <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                <td className="px-4 py-3 text-center font-medium text-slate-500">{student.number}</td>
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                  <div className="text-xs text-slate-500">{student.studentId}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-2">
                                    {student.allergicFood && (
                                      <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-bold border border-orange-100">
                                        แพ้อาหาร: {student.allergicFood}
                                      </span>
                                    )}
                                    {student.congenitalDisease && (
                                      <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-100">
                                        โรคประจำตัว: {student.congenitalDisease}
                                      </span>
                                    )}
                                    {student.allergicMedicine && (
                                      <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-100">
                                        แพ้ยา: {student.allergicMedicine}
                                      </span>
                                    )}
                                    {student.medicalInfo && (
                                      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-100">
                                        อื่นๆ: {student.medicalInfo}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })()}
        </div>

        {/* Assessment Modal/Form Overlay */}"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
