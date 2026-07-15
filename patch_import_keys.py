import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

target = """      for (const row of dataPreview) {
        // Map excel columns to Student object
        // Expected columns: รหัสนักเรียน, ชื่อ, นามสกุล, ชื่อเล่น, เพศ, เลขที่
        const studentId = String(row['รหัสนักเรียน'] || row['studentId'] || '').trim();
        const firstName = String(row['ชื่อ'] || row['firstName'] || '').trim();
        const lastName = String(row['นามสกุล'] || row['lastName'] || '').trim();
        const nickname = String(row['ชื่อเล่น'] || row['nickname'] || '').trim();
        const rawGender = String(row['เพศ'] || row['gender'] || '').trim().toLowerCase();
        const nationalId = String(row['เลขประจำตัวประชาชน'] || row['nationalId'] || '').trim();
        const numberRaw = row['เลขที่'] || row['number'];
        const number = parseInt(numberRaw, 10) || 0;
        
        let parsedDob = String(row['วันเกิด'] || row['dob'] || '').trim();"""

replacement = """      for (const rawRow of dataPreview) {
        // Normalize keys (trim whitespace)
        const row: Record<string, any> = {};
        for (const key in rawRow) {
          row[key.trim()] = rawRow[key];
        }
        
        // Map excel columns to Student object
        // Expected columns: รหัสนักเรียน, ชื่อ, นามสกุล, ชื่อเล่น, เพศ, เลขที่
        const studentId = String(row['รหัสนักเรียน'] || row['studentId'] || '').trim();
        const firstName = String(row['ชื่อ'] || row['firstName'] || '').trim();
        const lastName = String(row['นามสกุล'] || row['lastName'] || '').trim();
        const nickname = String(row['ชื่อเล่น'] || row['nickname'] || '').trim();
        const rawGender = String(row['เพศ'] || row['gender'] || '').trim().toLowerCase();
        const nationalId = String(row['เลขประจำตัวประชาชน'] || row['nationalId'] || '').trim();
        const numberRaw = row['เลขที่'] || row['number'];
        const number = parseInt(numberRaw, 10) || 0;
        
        let parsedDob = String(row['วันเกิด'] || row['dob'] || '').trim();"""

content = content.replace(target, replacement)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)
