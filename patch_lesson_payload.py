import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    code = f.read()

target = """      subject: isIntegrated ? 'บูรณาการ' : subject,
      customSubject: (!isIntegrated && subject === 'อื่นๆ') ? customSubject : '',"""

replacement = """      subject: subject,
      customSubject: (subject === 'อื่นๆ' || subject === 'บูรณาการ (PBL)') ? customSubject : '',"""

code = code.replace(target, replacement)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(code)

print("Updated LessonLogForm payload")
