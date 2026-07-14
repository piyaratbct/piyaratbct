import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """          {activeTab === "special-care" && (() => {
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
            );"""

replacement = """          {activeTab === "special-care" && (() => {
            const allergicMedStudents = students.filter((s) => s.allergicMedicine);
            const otherMedicalStudents = students.filter((s) => s.medicalInfo);
            const allAllergicFoodStudents = students.filter((s) => s.allergicFood);
            const allCongenitalDiseaseStudents = students.filter((s) => s.congenitalDisease);
            
            const specialCareData = [
              { name: 'แพ้อาหาร', value: allAllergicFoodStudents.length, fill: '#f97316' },
              { name: 'โรคประจำตัว', value: allCongenitalDiseaseStudents.length, fill: '#a855f7' },
              { name: 'แพ้ยา', value: allergicMedStudents.length, fill: '#e11d48' },
              { name: 'อื่นๆ', value: otherMedicalStudents.length, fill: '#d97706' },
            ].filter(item => item.value > 0);

            const allSpecialCareStudents = students.filter(
              s => s.allergicFood || s.congenitalDisease || s.allergicMedicine || s.medicalInfo
            ).sort((a, b) => {
              if (a.gradeLevel !== b.gradeLevel) {
                return (a.gradeLevel || '').localeCompare(b.gradeLevel || '', 'th');
              }
              return (a.number || 0) - (b.number || 0);
            });"""

content = content.replace(target, replacement)

target2 = """                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
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
                                <td className="px-4 py-3">"""

replacement2 = """                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
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
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {student.nickname ? (
                                    <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-xs font-bold border border-sky-100">
                                      {student.nickname}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
