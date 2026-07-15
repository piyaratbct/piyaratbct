import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

# Change sheet_to_json
content = content.replace(
    "const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });",
    "const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });"
)

# Replace dob parsing
target = "const dob = String(row['วันเกิด'] || row['dob'] || '').trim();"

replacement = """        let parsedDob = String(row['วันเกิด'] || row['dob'] || '').trim();
        
        // Handle DD/MM/YYYY or DD-MM-YYYY (Buddhist Era) to YYYY-MM-DD (Christian Era)
        if (parsedDob) {
          const sep = parsedDob.includes('/') ? '/' : (parsedDob.includes('-') ? '-' : null);
          if (sep) {
            const parts = parsedDob.split(sep);
            // If it's DD/MM/YYYY
            if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              let year = parseInt(parts[2], 10);
              
              if (year > 2400) {
                year -= 543;
              }
              parsedDob = `${year}-${month}-${day}`;
            }
          }
        }
        const dob = parsedDob;"""

content = content.replace(target, replacement)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)
