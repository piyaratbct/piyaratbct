import re

with open('src/components/DailyNotificationPopup.tsx', 'r') as f:
    content = f.read()

content = content.replace("({ id: doc.id, ...doc.data() }))", "({ id: doc.id, ...doc.data() } as any))")

with open('src/components/DailyNotificationPopup.tsx', 'w') as f:
    f.write(content)
