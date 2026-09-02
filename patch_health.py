import re

with open('src/components/Student360.tsx', 'r') as f:
    code = f.read()

target = """        behavior: {
          score: 100,
          merits: 0,
          demerits: 0
        }
      };"""

replacement = """        behavior: {
          score: 100,
          merits: 0,
          demerits: 0
        },
        health: {
          height: initialStudent.height ? parseFloat(initialStudent.height.toString()) : 0,
          weight: initialStudent.weight ? parseFloat(initialStudent.weight.toString()) : 0,
          bmi: 0,
          vision: initialStudent.vision || "ไม่ระบุ",
          dental: initialStudent.dental || "ไม่ระบุ"
        }
      };"""

code = code.replace(target, replacement)

with open('src/components/Student360.tsx', 'w') as f:
    f.write(code)

print("Health object added")
