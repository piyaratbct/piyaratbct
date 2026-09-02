import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    code = f.read()

target = """    if (plan.customSubject) {
      setCustomSubject(plan.customSubject);
    }"""
replacement = """    if (plan.customSubject) {
      setCustomSubject(plan.customSubject);
    } else {
      setCustomSubject('');
    }"""

code = code.replace(target, replacement)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(code)

print("Updated customSubject clear in LessonLogForm")
