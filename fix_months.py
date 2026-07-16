import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Array.from(new Set(allAssessments.filter(a => a.month).map(a => a.month))).sort().reverse().slice(0, 4)',
    'Array.from(new Set(allAssessments.filter(a => a.month).map(a => a.month as string))).sort().reverse().slice(0, 4)'
)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
