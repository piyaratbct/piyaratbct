import re

with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("  gender: 'male' | 'female';\n  number: number;", "  gender: 'male' | 'female';\n  nationalId?: string;\n  number: number;")

with open('src/types.ts', 'w') as f:
    f.write(content)
