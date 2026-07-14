import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

target1 = "if (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic') {"
replacement1 = "if (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic' && currentTeacher.role !== 'discipline') {"
content = content.replace(target1, replacement1)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

