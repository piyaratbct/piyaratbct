import re

files = [
    'src/components/LessonLogForm.tsx',
    'src/components/PBLLessonLogForm.tsx'
]

for file in files:
    with open(file, 'r') as f:
        code = f.read()

    target = "{plan.date ? formatThaiDate(plan.date) : ''}"
    replacement = "{plan.date ? (plan.date.includes('ครั้ง') || plan.date.includes('คาบ') ? plan.date : (plan.date.includes('-') || plan.date.includes('/') ? formatThaiDate(plan.date) : `ครั้งที่ ${plan.date}`)) : ''}"

    code = code.replace(target, replacement)

    with open(file, 'w') as f:
        f.write(code)

print("Updated dates in modals")
