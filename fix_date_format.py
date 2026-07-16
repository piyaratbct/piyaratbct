import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'ข้อมูลประจำเดือน {currentChartMonth}',
    'ข้อมูลประจำเดือน {formatThaiMonthYear(currentChartMonth)}'
)

content = content.replace(
    '<div className="font-bold text-pink-600">{m}</div>',
    '<div className="font-bold text-pink-600">{formatThaiMonthYear(m)}</div>'
)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
