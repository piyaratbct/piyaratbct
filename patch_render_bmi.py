import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """            const allSpecialCareStudents = students.filter(
              s => s.allergicFood || s.congenitalDisease || s.allergicMedicine || s.medicalInfo || s.weight || s.height
            ).sort((a, b) => {"""

replacement = """            const allSpecialCareStudents = students.filter(
              s => {
                const { weight, height } = getStudentHealthData(s);
                return s.allergicFood || s.congenitalDisease || s.allergicMedicine || s.medicalInfo || weight || height;
              }
            ).sort((a, b) => {"""

content = content.replace(target, replacement)

target2 = """                                <td className="px-4 py-3 text-center whitespace-nowrap text-xs">
                                  {student.weight && student.height ? (() => {
                                    const h = student.height / 100;
                                    const bmi = student.weight / (h * h);"""

replacement2 = """                                <td className="px-4 py-3 text-center whitespace-nowrap text-xs">
                                  {(() => {
                                    const { weight, height } = getStudentHealthData(student);
                                    if (weight && height) {
                                      const h = height / 100;
                                      const bmi = weight / (h * h);"""

target3 = """                                    else { label = 'อ้วน'; color = 'text-red-600 bg-red-50 border-red-100'; }
                                    return (
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="text-slate-500">{student.weight} กก. / {student.height} ซม.</div>
                                        <span className={`px-2 py-0.5 rounded-md font-bold border ${color}`}>
                                          BMI: {bmi.toFixed(1)} {label}
                                        </span>
                                      </div>
                                    );
                                  })() : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>"""

replacement3 = """                                    else { label = 'อ้วน'; color = 'text-red-600 bg-red-50 border-red-100'; }
                                    return (
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="text-slate-500">{weight} กก. / {height} ซม.</div>
                                        <span className={`px-2 py-0.5 rounded-md font-bold border ${color}`}>
                                          BMI: {bmi.toFixed(1)} {label}
                                        </span>
                                      </div>
                                    );
                                    } else {
                                      return <span className="text-slate-300">-</span>;
                                    }
                                  })()}
                                </td>"""

content = content.replace(target2, replacement2).replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
