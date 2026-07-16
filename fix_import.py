import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

# Add allData state
content = content.replace(
    'const [dataPreview, setDataPreview] = useState<any[]>([]);',
    'const [allData, setAllData] = useState<any[]>([]);\n  const [dataPreview, setDataPreview] = useState<any[]>([]);'
)

# Update handleFileUpload
content = content.replace(
    'setDataPreview(jsonData.slice(0, 50)); // Preview up to 50 rows',
    'setAllData(jsonData);\n        setDataPreview(jsonData.slice(0, 50)); // Preview up to 50 rows'
)

# Fix handleImport
content = content.replace(
    'if (dataPreview.length === 0) return;',
    'if (allData.length === 0) return;'
)

content = content.replace(
    'for (const row of dataPreview) {',
    'for (const row of allData) {\n        // Helper to find key flexibly\n        const findKey = (keys: string[]) => {\n          const rowKey = Object.keys(row).find(k => keys.some(search => k.replace(/\\s+/g, \'\').toLowerCase().includes(search.toLowerCase())));\n          return rowKey ? String(row[rowKey] || \'\').trim() : \'\';\n        };'
)

# Replace field extraction
content = content.replace(
    "const studentId = String(row['รหัสนักเรียน'] || row['studentId'] || '').trim();",
    "const studentId = findKey(['รหัสนักเรียน', 'studentId', 'รหัส']);"
)
content = content.replace(
    "const firstName = String(row['ชื่อ'] || row['firstName'] || '').trim();",
    "const firstName = findKey(['ชื่อ', 'firstName']);"
)
content = content.replace(
    "const lastName = String(row['นามสกุล'] || row['lastName'] || '').trim();",
    "const lastName = findKey(['นามสกุล', 'lastName', 'สกุล']);"
)
content = content.replace(
    "const nickname = String(row['ชื่อเล่น'] || row['nickname'] || '').trim();",
    "const nickname = findKey(['ชื่อเล่น', 'nickname']);"
)
content = content.replace(
    "const rawGender = String(row['เพศ'] || row['gender'] || '').trim().toLowerCase();",
    "const rawGender = findKey(['เพศ', 'gender']).toLowerCase();"
)
content = content.replace(
    "const nationalId = String(row['เลขประจำตัวประชาชน'] || row['nationalId'] || '').trim();",
    "const nationalId = findKey(['เลขประจำตัวประชาชน', 'เลขบัตรประชาชน', 'บัตรประชาชน', 'nationalId', 'เลขบัตร']);"
)
content = content.replace(
    "const numberRaw = row['เลขที่'] || row['number'];",
    "const numberRaw = findKey(['เลขที่', 'number']);"
)
content = content.replace(
    "let parsedDob = String(row['วันเกิด'] || row['dob'] || '').trim();",
    "let parsedDob = findKey(['วันเกิด', 'dob']);"
)

# Also fix the button disabled state and clear button
content = content.replace(
    'disabled={!dataPreview.length || isProcessing}',
    'disabled={!allData.length || isProcessing}'
)
content = content.replace(
    'onClick={() => setDataPreview([])}',
    'onClick={() => { setAllData([]); setDataPreview([]); }}'
)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)

print("Replacement complete")
