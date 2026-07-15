import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('flex-1 min-w-[120px]', 'flex-1 min-w-[90px]')

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
