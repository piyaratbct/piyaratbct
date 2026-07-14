import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = "label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}"
replacement = "label={({ name, percent }) => percent < 0.1 ? '' : `${name} ${(percent * 100).toFixed(0)}%`}"

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
