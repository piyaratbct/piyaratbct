import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """            const monthsWithData = Array.from(new Set(
              allAssessments
                .filter(a => a.weight !== undefined && a.height !== undefined)
                .map(a => a.month)
                .filter(Boolean) as string[]
            )).sort((a, b) => a.localeCompare(b));"""

replacement1 = """            const monthsWithData = Array.from(new Set([
              ...allAssessments
                .filter(a => a.weight !== undefined && a.height !== undefined)
                .map(a => a.month)
                .filter(Boolean) as string[],
              ...(selectedMonth && students.some(s => s.weight !== undefined && s.height !== undefined) ? [selectedMonth] : [])
            ])).sort((a, b) => a.localeCompare(b));"""

content = content.replace(target1, replacement1)


target2 = """                          displayMonths.forEach(m => {
                            const assessmentForMonth = allAssessments.find(a => a.studentId === student.id && a.month === m);
                            if (assessmentForMonth && assessmentForMonth.weight && assessmentForMonth.height) {
                              const h = assessmentForMonth.height / 100;
                              const bmi = assessmentForMonth.weight / (h * h);"""

replacement2 = """                          displayMonths.forEach(m => {
                            const assessmentForMonth = allAssessments.find(a => a.studentId === student.id && a.month === m);
                            const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (m === selectedMonth || !m ? student.weight : undefined);
                            const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (m === selectedMonth || !m ? student.height : undefined);
                            
                            if (weight && height) {
                              const h = height / 100;
                              const bmi = weight / (h * h);"""

content = content.replace(target2, replacement2)

target3 = """                              studentDataMap[m] = { weight: assessmentForMonth.weight, height: assessmentForMonth.height, bmi, bmiLabel: label, bmiColor: color };
                            }
                          });"""

replacement3 = """                              studentDataMap[m] = { weight, height, bmi, bmiLabel: label, bmiColor: color };
                            }
                          });"""

content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
