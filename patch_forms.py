import re
import os

files = [
    'src/components/LessonPlanForm.tsx',
    'src/components/LessonLogForm.tsx',
    'src/components/PBLLessonPlanForm.tsx',
    'src/components/PBLLessonLogForm.tsx'
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        code = f.read()

    # Replace condition for showing customSubject input
    code = code.replace("{subject === 'อื่นๆ' && (", "{(subject === 'อื่นๆ' || subject === 'บูรณาการ (PBL)') && (")
    # Also PBLLessonPlanForm might have {subject === 'อื่นๆ' && (
    
    # Replace placeholder
    code = code.replace('placeholder="ระบุวิชาอื่นๆ..."', 'placeholder={subject === "บูรณาการ (PBL)" ? "ระบุวิชาหลัก..." : "ระบุวิชาอื่นๆ..."}')
    
    # Replace setting customSubject in save payload
    code = code.replace("customSubject: (subject === 'อื่นๆ') ? customSubject : undefined", "customSubject: (subject === 'อื่นๆ' || subject === 'บูรณาการ (PBL)') ? customSubject : undefined")
    code = code.replace("customSubject: subject === 'อื่นๆ' ? customSubject : undefined", "customSubject: (subject === 'อื่นๆ' || subject === 'บูรณาการ (PBL)') ? customSubject : undefined")
    
    # Replace initial loading
    code = code.replace("initialPlan.subject === 'อื่นๆ'", "(initialPlan.subject === 'อื่นๆ' || initialPlan.subject === 'บูรณาการ (PBL)')")
    code = code.replace("initialRecord.subject === 'อื่นๆ'", "(initialRecord.subject === 'อื่นๆ' || initialRecord.subject === 'บูรณาการ (PBL)')")

    # Replace activeSubject for curriculum
    code = code.replace("subject === 'อื่นๆ' ? customSubject : subject", "(subject === 'อื่นๆ' || subject === 'บูรณาการ (PBL)') ? customSubject : subject")
    
    with open(file, 'w') as f:
        f.write(code)

print("Updated forms!")
