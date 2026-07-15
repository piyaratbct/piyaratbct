import re
with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Remove the imported formatThaiDate
content = content.replace("import { formatThaiMonthYear, formatThaiDate } from '../lib/dateUtils';", "import { formatThaiMonthYear } from '../lib/dateUtils';")

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
print("FIXED")
