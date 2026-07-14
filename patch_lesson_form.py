import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

content = content.replace('3. ข้อจำกัดและปัญหาที่พบ', '3. ข้อจำกัดและอุปสรรคที่พบ')
content = content.replace('4. ความคิดเห็นของครูผู้สอน', '4. ข้อเสนอแนะและแนวทางการพัฒนา')
content = content.replace('และความคิดเห็นของครูผู้สอน', 'และข้อเสนอแนะและแนวทางการพัฒนา')

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)
