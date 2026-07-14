import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace("? ' (ประจำชั้น/ผู้ช่วย)'", "? ' (ประจำชั้น/คู่ชั้น)'")
content = content.replace(": ' (ผู้ช่วย)'}", ": ' (คู่ชั้น)'}")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
