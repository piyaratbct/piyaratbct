import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

# Add to hints
content = content.replace("'เพศ', 'วันเกิด'", "'เพศ', 'เลขประจำตัวประชาชน', 'วันเกิด'")

# Add parsing
target1 = """        const rawGender = String(row['เพศ'] || row['gender'] || '').trim().toLowerCase();
        const numberRaw = row['เลขที่'] || row['number'];"""
replacement1 = """        const rawGender = String(row['เพศ'] || row['gender'] || '').trim().toLowerCase();
        const nationalId = String(row['เลขประจำตัวประชาชน'] || row['nationalId'] || '').trim();
        const numberRaw = row['เลขที่'] || row['number'];"""
content = content.replace(target1, replacement1)

# Add to StudentData object
target2 = """          nickname,
          gradeLevel: selectedGrade,
          gender,
          number,"""
replacement2 = """          nickname,
          gradeLevel: selectedGrade,
          gender,
          nationalId,
          number,"""
content = content.replace(target2, replacement2)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)
