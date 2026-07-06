import re

with open('src/components/StudentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="grid grid-cols-2 gap-4"', 'className="grid grid-cols-1 sm:grid-cols-2 gap-4"')

with open('src/components/StudentModal.tsx', 'w') as f:
    f.write(content)
