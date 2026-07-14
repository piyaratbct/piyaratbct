import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace("AlertTriangle,", "AlertTriangle, HeartPulse,")
content = content.replace("<AlertTriangle className=\"h-4 w-4 shrink-0\" /> \n              <span className=\"whitespace-nowrap\">ข้อมูลสุขภาพ</span>", "<HeartPulse className=\"h-4 w-4 shrink-0\" /> \n              <span className=\"whitespace-nowrap\">ข้อมูลสุขภาพ</span>")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
