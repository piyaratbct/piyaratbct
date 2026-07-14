import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace("ไม่มีนักเรียนที่ต้องดูแลเป็นพิเศษในชั้นเรียนนี้", "ไม่มีข้อมูลนักเรียนที่ต้องดูแลเป็นพิเศษ")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
