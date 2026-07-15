import re

with open('src/data.ts', 'r') as f:
    content = f.read()

content = content.replace("medicalInfo: 'ปกติ',", "medicalInfo: 'ปกติ',\n    weight: 22.5,\n    height: 120.0,")
content = content.replace("congenitalDisease: 'หอบหืด',", "congenitalDisease: 'หอบหืด',\n    weight: 35.5,\n    height: 130.5,")
content = content.replace("allergicFood: 'อาหารทะเล',", "allergicFood: 'อาหารทะเล',\n    weight: 45.0,\n    height: 140.0,")

with open('src/data.ts', 'w') as f:
    f.write(content)
