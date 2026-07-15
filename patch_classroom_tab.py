import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """<span className="whitespace-nowrap truncate text-sm">พัฒนาการร่างกาย</span>"""
replacement = """<span className="whitespace-nowrap">พัฒนาการร่างกาย</span>"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
