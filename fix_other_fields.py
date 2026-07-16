import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const parentName = String(row['ชื่อผู้ปกครอง'] || row['parentName'] || '').trim();",
    "const parentName = findKey(['ชื่อผู้ปกครอง', 'parentName', 'ผู้ปกครอง']);"
)
content = content.replace(
    "const parentPhone = String(row['เบอร์โทรผู้ปกครอง'] || row['parentPhone'] || '').trim();",
    "const parentPhone = findKey(['เบอร์โทรผู้ปกครอง', 'เบอร์ผู้ปกครอง', 'parentPhone', 'โทรผู้ปกครอง']);"
)
content = content.replace(
    "const fatherName = String(row['ชื่อบิดา'] || row['fatherName'] || '').trim();",
    "const fatherName = findKey(['ชื่อบิดา', 'fatherName', 'บิดา']);"
)
content = content.replace(
    "const fatherPhone = String(row['เบอร์โทรบิดา'] || row['fatherPhone'] || '').trim();",
    "const fatherPhone = findKey(['เบอร์โทรบิดา', 'เบอร์บิดา', 'fatherPhone']);"
)
content = content.replace(
    "const motherName = String(row['ชื่อมารดา'] || row['motherName'] || '').trim();",
    "const motherName = findKey(['ชื่อมารดา', 'motherName', 'มารดา']);"
)
content = content.replace(
    "const motherPhone = String(row['เบอร์โทรมารดา'] || row['motherPhone'] || '').trim();",
    "const motherPhone = findKey(['เบอร์โทรมารดา', 'เบอร์มารดา', 'motherPhone']);"
)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)

print("Replacement complete")
