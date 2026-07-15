with open('src/components/AssessmentPrintTemplate.tsx', 'r') as f:
    content = f.read()

content = content.replace("import {\nimport { formatThaiMonthYear } from '../lib/dateUtils';", "import { formatThaiMonthYear } from '../lib/dateUtils';\nimport {")
with open('src/components/AssessmentPrintTemplate.tsx', 'w') as f:
    f.write(content)

with open('src/components/LessonLogList.tsx', 'r') as f:
    content = f.read()

content = content.replace("import {\nimport { formatThaiDateTime } from '../lib/dateUtils';", "import { formatThaiDateTime } from '../lib/dateUtils';\nimport {")
with open('src/components/LessonLogList.tsx', 'w') as f:
    f.write(content)

