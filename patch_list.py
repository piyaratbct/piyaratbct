import re

with open('src/components/LessonLogList.tsx', 'r') as f:
    code = f.read()

target = """                  >
                    {record.subject === "อื่นๆ" && record.customSubject
                      ? record.customSubject
                      : record.subject}
                  </span>"""

replacement = """                  >
                    {(record.subject === "อื่นๆ" || record.subject === "บูรณาการ (PBL)") && record.customSubject
                      ? record.customSubject
                      : record.subject}
                  </span>"""

code = code.replace(target, replacement)

with open('src/components/LessonLogList.tsx', 'w') as f:
    f.write(code)

print("Updated LessonLogList.tsx")
