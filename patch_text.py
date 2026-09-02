import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

old_text = "(ระบบจะปรับขนาดและบีบอัดรูปภาพให้อัตโนมัติ)"
new_text = "(ระบบจะปรับขนาด บีบอัดรูปภาพ และอัปโหลดขึ้นคลาวด์อัตโนมัติ)"

if old_text in code:
    code = code.replace(old_text, new_text)
    with open('src/App.tsx', 'w') as f:
        f.write(code)
    print("Replaced text successfully!")
else:
    print("Could not find the text to replace")
