import re

with open('src/components/PBLLessonLogForm.tsx', 'r') as f:
    code = f.read()

target = 'if (plan.customSubject) setCustomSubject(plan.customSubject);'
replacement = """if (plan.customSubject) {
      setCustomSubject(plan.customSubject);
    } else if (plan.subject && plan.subject !== "บูรณาการ (PBL)" && plan.subject !== "อื่นๆ") {
      setCustomSubject(plan.subject);
    }"""

code = code.replace(target, replacement)

with open('src/components/PBLLessonLogForm.tsx', 'w') as f:
    f.write(code)

print("Updated import logic in PBLLessonLogForm")
