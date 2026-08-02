import re

# 1. Update src/types.ts
with open('src/types.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r'evaluations\?:\s*\{\s*teacher:\s*Record<string,\s*number>;\s*learner:\s*Record<string,\s*number>;\s*media:\s*Record<string,\s*number>;\s*\}',
    r'evaluations?: {\n    planning: Record<string, number>;\n    time: Record<string, number>;\n    media: Record<string, number>;\n    teacher: Record<string, number>;\n    learner: Record<string, number>;\n  }',
    content
)
with open('src/types.ts', 'w') as f:
    f.write(content)

print("Updated types.ts")
