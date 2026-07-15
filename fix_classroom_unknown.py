with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = "const allAssessments = Object.values(assessments);"
replacement = "const allAssessments = Object.values(assessments) as StudentAssessment[];"

if target in content:
    content = content.replace(target, replacement)
    print("FIXED unknown type")
else:
    print("NOT FOUND unknown type")

# Also fix the `availableMonthsSet.add(a.month)`
target2 = "allAssessments.forEach(a => availableMonthsSet.add(a.month));"
replacement2 = "allAssessments.forEach(a => { if (a.month) availableMonthsSet.add(a.month); });"

if target2 in content:
    content = content.replace(target2, replacement2)
    print("FIXED a.month")
else:
    print("NOT FOUND a.month")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
