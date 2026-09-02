import re
import os

with open('src/components/LessonLogForm.tsx', 'r') as f:
    code = f.read()

target = "setSubject((initialRecord.subject === 'อื่นๆ' || initialRecord.subject === 'บูรณาการ (PBL)') && initialRecord.customSubject ? initialRecord.customSubject : (initialRecord.subject as string));"
replacement = """setSubject((initialRecord.subject as string) as any);
      if (initialRecord.customSubject) {
        setCustomSubject(initialRecord.customSubject);
      }"""

code = code.replace(target, replacement)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(code)

print("Updated init logic in LessonLogForm")
