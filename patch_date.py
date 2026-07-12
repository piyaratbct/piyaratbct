import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { format } from 'date-fns';", "")
content = content.replace("format(new Date(), 'yyyy-MM-dd')", "new Date().toISOString().split('T')[0]")

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
print("Removed date-fns dependency")
