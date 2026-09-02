import re

with open('src/components/DashboardStats.tsx', 'r') as f:
    code = f.read()

target1 = "const subj = r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject;"
rep1 = "const subj = (r.subject === 'อื่นๆ' || r.subject === 'บูรณาการ (PBL)') && r.customSubject ? r.customSubject : r.subject;"

target2 = "((p.subject === 'อื่นๆ' && p.customSubject === subj) || p.subject === subj)"
rep2 = "(((p.subject === 'อื่นๆ' || p.subject === 'บูรณาการ (PBL)') && p.customSubject === subj) || p.subject === subj)"

code = code.replace(target1, rep1)
code = code.replace(target2, rep2)

with open('src/components/DashboardStats.tsx', 'w') as f:
    f.write(code)

print("Updated DashboardStats.tsx")
