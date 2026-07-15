import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { formatThaiDateTime } from '../lib/dateUtils';", "import { formatThaiDateTime, formatThaiMonthYear } from '../lib/dateUtils';")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
