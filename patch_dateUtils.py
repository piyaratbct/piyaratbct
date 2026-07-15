import re

with open('src/lib/dateUtils.ts', 'r') as f:
    content = f.read()

content = content.replace("const year = d.getFullYear() + 543;", "const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();")

with open('src/lib/dateUtils.ts', 'w') as f:
    f.write(content)
