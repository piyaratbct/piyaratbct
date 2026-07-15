import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            students.forEach(s => {
              if (s.weight && s.height) {
                const heightM = s.height / 100;
                const bmi = s.weight / (heightM * heightM);"""

replacement = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            const getStudentHealthData = (s: Student) => {
              let weight = s.weight;
              let height = s.height;
              
              if (selectedMonth) {
                const assessmentForMonth = assessments.find(a => a.studentId === s.id && a.month === selectedMonth);
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

            students.forEach(s => {
              const { weight, height } = getStudentHealthData(s);
              if (weight && height) {
                const heightM = height / 100;
                const bmi = weight / (heightM * heightM);"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
