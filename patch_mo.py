import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

target1 = " - ม.${s.gradeLevel}`)"
replacement1 = " - ${s.gradeLevel}`)"

target2 = ">ม.{student.gradeLevel}</span>"
replacement2 = ">{student.gradeLevel}</span>"

if target1 in content:
    content = content.replace(target1, replacement1)
    print("Replaced target 1")
if target2 in content:
    content = content.replace(target2, replacement2)
    print("Replaced target 2")

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
