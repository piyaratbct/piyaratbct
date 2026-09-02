import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

target1 = "r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject"
rep1 = "(r.subject === 'อื่นๆ' || r.subject === 'บูรณาการ (PBL)') && r.customSubject ? r.customSubject : r.subject"

target2 = "p.subject === 'อื่นๆ' && p.customSubject ? p.customSubject : p.subject"
rep2 = "(p.subject === 'อื่นๆ' || p.subject === 'บูรณาการ (PBL)') && p.customSubject ? p.customSubject : p.subject"

code = code.replace(target1, rep1)
code = code.replace(target2, rep2)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Updated App.tsx")
