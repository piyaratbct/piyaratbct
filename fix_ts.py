import re

with open('src/components/DisciplineSemesterReportPrintTemplate.tsx', 'r') as f:
    content = f.read()

# Fix Object.values reduce
content = content.replace(
    'Object.values(stats.byGrade).reduce((a, b) => a + b, 0)',
    'Object.values(stats.byGrade).reduce((a, b) => (a as number) + (b as number), 0)'
)

# Fix Object.entries sort
content = content.replace(
    'Object.entries(stats.byType).sort((a, b) => b[1] - a[1])',
    '(Object.entries(stats.byType) as [string, number][]).sort((a, b) => b[1] - a[1])'
)

content = content.replace(
    'Object.entries(stats.bySeverity).sort((a, b) => b[1] - a[1])',
    '(Object.entries(stats.bySeverity) as [string, number][]).sort((a, b) => b[1] - a[1])'
)

content = content.replace(
    'Object.entries(stats.byGrade).sort((a, b) => b[1] - a[1])',
    '(Object.entries(stats.byGrade) as [string, number][]).sort((a, b) => b[1] - a[1])'
)

with open('src/components/DisciplineSemesterReportPrintTemplate.tsx', 'w') as f:
    f.write(content)

print("Fixed TypeScript errors")
