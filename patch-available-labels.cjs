const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAvailableSubjects.ts', 'utf8');

const targetSingle = `        standaloneSubjects.forEach(s => {
          // Find the original doc to get its type
          const originalDoc = allDocs.find(d => d.subjectName === s);
          dropDownData.push({ type: 'single', name: s, subjectType: originalDoc?.subjectType || 'academic' });
        });`;

const newTargetSingle = `        standaloneSubjects.forEach(s => {
          // Find the original doc to get its type
          const originalDoc = allDocs.find(d => d.subjectName === s);
          const cat = originalDoc?.subjectType === 'activity' ? 'กิจกรรมพัฒนาผู้เรียน' :
                      originalDoc?.academicCategory === 'additional' ? 'วิชาเพิ่มเติม' : 'วิชาพื้นฐาน';
          dropDownData.push({ type: 'single', name: s, label: \`\${s} (\${cat})\`, subjectType: originalDoc?.subjectType || 'academic' });
        });`;

content = content.replace(targetSingle, newTargetSingle);

const targetGroup = `        parentNames.forEach(pName => {
          const children = childMap.get(pName) || [];
          if (children.length > 0) {
            dropDownData.push({ type: 'group', groupName: pName, subjects: children });
          }
        });`;

const newTargetGroup = `        parentNames.forEach(pName => {
          const children = childMap.get(pName) || [];
          if (children.length > 0) {
            const originalDoc = allDocs.find(d => d.subjectName === pName);
            const cat = originalDoc?.subjectType === 'activity' ? 'กิจกรรมพัฒนาผู้เรียน' :
                        originalDoc?.academicCategory === 'additional' ? 'วิชาเพิ่มเติม' : 'วิชาพื้นฐาน';
            dropDownData.push({ type: 'group', groupName: \`\${pName} (\${cat})\`, subjects: children });
          }
        });`;

content = content.replace(targetGroup, newTargetGroup);

fs.writeFileSync('src/hooks/useAvailableSubjects.ts', content);
console.log("Patched useAvailableSubjects.ts with labels");
