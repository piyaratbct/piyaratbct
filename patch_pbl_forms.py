import re
import os

files = [
    'src/components/PBLLessonPlanForm.tsx',
    'src/components/PBLLessonLogForm.tsx'
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        code = f.read()

    # Replace placeholder
    code = code.replace('placeholder="ระบุชื่อวิชา"', 'placeholder={subject === "บูรณาการ (PBL)" ? "ระบุวิชาหลัก..." : "ระบุวิชาอื่นๆ..."}')
    
    with open(file, 'w') as f:
        f.write(code)

print("Updated PBL forms!")
