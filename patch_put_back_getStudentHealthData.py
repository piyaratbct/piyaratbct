import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """            const allSpecialCareStudents = students.filter(
              s => {"""

replacement = """            const getStudentHealthData = (s: Student) => {
              let weight = s.weight;
              let height = s.height;
              
              if (selectedMonth) {
                const assessmentForMonth = assessments[s.id];
                if (assessmentForMonth && assessmentForMonth.weight !== undefined && assessmentForMonth.height !== undefined) {
                  weight = assessmentForMonth.weight;
                  height = assessmentForMonth.height;
                } else {
                  weight = undefined;
                  height = undefined;
                }
              }
              
              return { weight, height };
            };

            const allSpecialCareStudents = students.filter(
              s => {"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
