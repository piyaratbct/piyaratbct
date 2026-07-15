import re

with open('src/components/LessonLogList.tsx', 'r') as f:
    content = f.read()

# Replace the whole function
pattern = r"  const thaiFormatDateTime = \([^)]*\) => {.*?  };\n"
content = re.sub(pattern, "", content, flags=re.DOTALL)

with open('src/components/LessonLogList.tsx', 'w') as f:
    f.write(content)
