import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """            if (currentChartMonth) {
              students.forEach(s => {
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);"""

replacement = """            if (currentChartMonth) {
              displayedStudents.forEach(s => {
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
