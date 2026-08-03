import re

with open('src/components/OnlineUsersIndicator.tsx', 'r') as f:
    content = f.read()

old_photo_logic = """                    {false ? (
                        <img src={t.photoURL} alt={t.thaiName} className="h-full w-full object-cover" />
                    ) : (
                        t.thaiName ? t.thaiName.substring(0, 1) : t.displayName?.substring(0, 1) || '?'
                    )}"""

new_photo_logic = """                    {t.thaiName ? t.thaiName.substring(0, 1) : t.displayName?.substring(0, 1) || '?'}"""

content = content.replace(old_photo_logic, new_photo_logic)

with open('src/components/OnlineUsersIndicator.tsx', 'w') as f:
    f.write(content)
