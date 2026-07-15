import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = """  address?: string;
  medicalInfo?: string;"""

replacement = """  address?: string;
  medicalInfo?: string;
  weight?: number;
  height?: number;"""

content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)
