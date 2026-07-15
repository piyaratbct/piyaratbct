import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

target = """        let parsedDob = String(row['วันเกิด'] || row['dob'] || '').trim();
        
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

replacement = """        let parsedDob = String(row['วันเกิด'] || row['dob'] || '').trim();
        
        // Handle Date parsing (Buddhist Era to Christian Era YYYY-MM-DD)
        if (parsedDob) {
          const sep = parsedDob.includes('/') ? '/' : (parsedDob.includes('-') ? '-' : null);
          if (sep) {
            const parts = parsedDob.split(sep);
            if (parts.length === 3) {
              let day, month, year;
              
              if (parts[0].length <= 2 && parts[2].length === 4) {
                // DD/MM/YYYY
                day = parts[0].padStart(2, '0');
                month = parts[1].padStart(2, '0');
                year = parseInt(parts[2], 10);
              } else if (parts[0].length === 4 && parts[2].length <= 2) {
                // YYYY/MM/DD
                year = parseInt(parts[0], 10);
                month = parts[1].padStart(2, '0');
                day = parts[2].padStart(2, '0');
              }
              
              if (year !== undefined) {
                if (year > 2400) year -= 543;
                parsedDob = `${year}-${month}-${day}`;
              }
            }
          }
        }
        const dob = parsedDob;"""

content = content.replace(target, replacement)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)
