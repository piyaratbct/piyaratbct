import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "    .replace('อนุบาลปีที่ ', 'อ.')",
    "    .replace('อนุบาลปีที่ ', 'อ.')\n    .replace('อนุบาล ', 'อ.')"
)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)
