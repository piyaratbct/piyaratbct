import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. Update tab button text
content = content.replace(
    '<span className="whitespace-nowrap">นักเรียนที่ต้องดูแลพิเศษ</span>',
    '<span className="whitespace-nowrap">ข้อมูลสุขภาพ (ดูแลพิเศษ)</span>'
)

# 2. Update PieChart to BarChart
target_chart = """                        <PieChart>
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
                        </PieChart>"""

replacement_chart = """                        <BarChart
                          data={specialCareData}
                          margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                          <YAxis 
                            tickFormatter={(val) => `${((val / (students.length || 1)) * 100).toFixed(0)}%`} 
                            tick={{ fontSize: 12, fill: '#64748b' }} 
                            axisLine={false} 
                            tickLine={false} 
                            domain={[0, 'dataMax']}
                          />
                          <RechartsTooltip 
                            formatter={(value) => [`${value} คน (${((int(value) / (students.length || 1)) * 100).toFixed(1)}%)`, 'จำนวน']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f1f5f9' }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {specialCareData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>"""
replacement_chart = replacement_chart.replace("int(value)", "Number(value)")
content = content.replace(target_chart, replacement_chart)

# 3. Update table
target_table = """                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <tr>
                              <th className="px-4 py-3 text-center w-24">ระดับชั้น</th>
                              <th className="px-4 py-3 text-center w-16">เลขที่</th>
                              <th className="px-4 py-3">ชื่อ-สกุล</th>
                              <th className="px-4 py-3 text-center w-24">ชื่อเล่น</th>
                              <th className="px-4 py-3">ข้อมูลสุขภาพที่ต้องระวัง</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allSpecialCareStudents.map((student) => (
                              <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                <td className="px-4 py-3 text-center font-bold text-pink-600">
                                  <span className="bg-pink-50 px-2 py-1 rounded-md">{student.gradeLevel || '-'}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-medium text-slate-500">{student.number}</td>
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                  <div className="text-xs text-slate-500">{student.studentId}</div>
                                </td>"""

replacement_table = """                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <tr>
                              <th className="px-4 py-3 text-center w-24 whitespace-nowrap">ระดับชั้น</th>
                              <th className="px-4 py-3 text-center w-16 whitespace-nowrap">เลขที่</th>
                              <th className="px-4 py-3 whitespace-nowrap">ชื่อ-สกุล</th>
                              <th className="px-4 py-3 text-center w-24 whitespace-nowrap">ชื่อเล่น</th>
                              <th className="px-4 py-3 whitespace-nowrap">ข้อมูลสุขภาพที่ต้องระวัง</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allSpecialCareStudents.map((student) => (
                              <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                <td className="px-4 py-3 text-center font-bold text-pink-600 whitespace-nowrap">
                                  <span className="bg-pink-50 px-2 py-1 rounded-md">{student.gradeLevel || '-'}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-medium text-slate-500 whitespace-nowrap">{student.number}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                  <div className="text-xs text-slate-500">{student.studentId}</div>
                                </td>"""

content = content.replace(target_table, replacement_table)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
