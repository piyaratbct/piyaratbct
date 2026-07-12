import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = "  illnessDetail?: string;"
replacement = "  illnessDetail?: string;\n  fightDetail?: string;"

content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)
