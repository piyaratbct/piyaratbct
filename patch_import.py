import re
import os

files = [
    'src/components/LessonLogForm.tsx',
    'src/components/PBLLessonLogForm.tsx'
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        code = f.read()

    target = "setSelectedGrades([plan.gradeLevel]);"
    replacement = """if (plan.gradeLevel) {
      const levels = plan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean);
      setSelectedGrades(levels.length > 0 ? levels : [GRADE_LEVELS[0]]);
    }
    if (plan.date) setDate(plan.date);"""

    code = code.replace(target, replacement)

    with open(file, 'w') as f:
        f.write(code)

print("Updated imports!")
