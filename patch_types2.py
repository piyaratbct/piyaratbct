import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = "type: 'fight' | 'conflict' | 'misunderstanding' | 'accident' | 'other';"
replacement = "type: 'fight' | 'bullying' | 'disruption' | 'accident' | 'illness' | 'vandalism' | 'other' | string;\n  otherTypeDetail?: string;"

if target in content:
    content = content.replace(target, replacement)
    print("Replaced type in types.ts")
else:
    print("Target type not found")

with open('src/types.ts', 'w') as f:
    f.write(content)
