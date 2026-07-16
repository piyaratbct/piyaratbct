import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Replace the fallback logic
content = content.replace(
    'const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (currentChartMonth === fallbackMonth ? s.weight : undefined);',
    'const weight = assessmentForMonth?.weight;'
)

content = content.replace(
    'const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (currentChartMonth === fallbackMonth ? s.height : undefined);',
    'const height = assessmentForMonth?.height;'
)

content = content.replace(
    'const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (m === fallbackMonth ? student.weight : undefined);',
    'const weight = assessmentForMonth?.weight;'
)

content = content.replace(
    'const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (m === fallbackMonth ? student.height : undefined);',
    'const height = assessmentForMonth?.height;'
)


with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
