import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                          let ageYears = 7;
                          if (student.dob) {
                            const birthDate = new Date(student.dob);
                            const ageDifMs = Date.now() - birthDate.getTime();
                            const ageDate = new Date(ageDifMs);
                            ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
                          }"""

replacement = """                          let ageYears = 7;
                          let ageMonths = 0;
                          if (student.dob) {
                            const birthDate = new Date(student.dob);
                            const now = new Date();
                            
                            let years = now.getFullYear() - birthDate.getFullYear();
                            let months = now.getMonth() - birthDate.getMonth();
                            
                            if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                              years--;
                              months += (months < 0 ? 12 : 11);
                            }
                            
                            ageYears = years;
                            ageMonths = months;
                          }"""

content = content.replace(target, replacement)

target2 = """                              <td className="px-4 py-2 text-center text-sm font-medium text-slate-600 border-r border-slate-200">
                                {student.dob ? ageYears : '-'}
                              </td>"""

replacement2 = """                              <td className="px-4 py-2 text-center text-sm font-medium text-slate-600 border-r border-slate-200">
                                {student.dob ? `${ageYears} ปี ${ageMonths} ด.` : '-'}
                              </td>"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
