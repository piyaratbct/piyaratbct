import re

with open('src/components/DailyNotificationPopup.tsx', 'r') as f:
    content = f.read()

old_event_query = """        const eventQ = query(
          collection(db, 'schoolEvents'),
          where('responsibleTeachers', 'array-contains', currentTeacher.id)
        );"""

new_event_query = """        const eventQ = query(
          collection(db, 'schoolEvents')
        );"""

content = content.replace(old_event_query, new_event_query)

old_text = "กิจกรรมที่ต้องรับผิดชอบเร็วๆ นี้"
new_text = "กิจกรรมสำคัญของโรงเรียนใน 3 วันนี้"
content = content.replace(old_text, new_text)

old_no_event = "ไม่มีกิจกรรมที่ต้องรับผิดชอบใน 3 วันนี้"
new_no_event = "ไม่มีกิจกรรมสำคัญของโรงเรียนใน 3 วันนี้"
content = content.replace(old_no_event, new_no_event)


with open('src/components/DailyNotificationPopup.tsx', 'w') as f:
    f.write(content)
