import re

with open('src/components/HealthPrintTemplate.tsx', 'r') as f:
    content = f.read()

# Add import
if "formatThaiMonthYear" not in content:
    content = content.replace(
        'import { Student, StudentAssessment, Teacher } from "../types";',
        'import { Student, StudentAssessment, Teacher } from "../types";\nimport { formatThaiMonthYear } from "../lib/dateUtils";'
    )

content = content.replace(
    '<td className="border-b border-r border-gray-800 p-2 text-center font-bold">{m}</td>',
    '<td className="border-b border-r border-gray-800 p-2 text-center font-bold">{formatThaiMonthYear(m)}</td>'
)

with open('src/components/HealthPrintTemplate.tsx', 'w') as f:
    f.write(content)
