import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = "  type: 'fight' | 'bullying' | 'disruption' | 'accident' | 'illness' | 'vandalism' | 'other' | string;"
replacement = "  type: 'fight' | 'assault' | 'feud' | 'bullying' | 'misunderstanding' | 'disruption' | 'accident' | 'illness' | 'vandalism' | 'other' | string;"
content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)

