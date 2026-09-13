const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAvailableSubjects.ts', 'utf8');

content = content.replace(/'กิจกรรมพัฒนาผู้เรียน'/g, "'กิจกรรม'");
content = content.replace(/'วิชาเพิ่มเติม'/g, "'เพิ่มเติม'");
content = content.replace(/'วิชาพื้นฐาน'/g, "'พื้นฐาน'");

// change the format from "Subject (Category)" to "Subject [Category]" or just "Subject - Category" 
content = content.replace(/label: \\\`\\\${\s} \(\\\${cat}\)\\\`/g, "label: \`\${s} (\${cat})\`");
content = content.replace(/groupName: \\\`\\\${pName} \(\\\${cat}\)\\\`/g, "groupName: \`\${pName} (\${cat})\`");

fs.writeFileSync('src/hooks/useAvailableSubjects.ts', content);
console.log("Patched to use shorter labels");
