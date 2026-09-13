const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAvailableSubjects.ts', 'utf8');

const targetStr = `        const dropDownData: any[] = [];
        
        const standaloneSubjects = new Set<string>();
        
        allDocs.forEach(data => {
          const isActuallyParent = parentIds.has(data.id) || data.isParent === true;
          if (data.subjectName && !isActuallyParent && !parentNames.has(data.subjectName) && !data.parentId) {
            standaloneSubjects.add(data.subjectName);
          }
        });
        
        standaloneSubjects.forEach(s => {
          // Find the original doc to get its type
          const originalDoc = allDocs.find(d => d.subjectName === s);
          const cat = originalDoc?.subjectType === 'activity' ? 'กิจกรรม' :
                      originalDoc?.academicCategory === 'additional' ? 'เพิ่มเติม' : 'พื้นฐาน';
          dropDownData.push({ type: 'single', name: s, label: \`\${s} (\${cat})\`, subjectType: originalDoc?.subjectType || 'academic' });
        });
        
        parentNames.forEach(pName => {
          const children = childMap.get(pName) || [];
          if (children.length > 0) {
            const originalDoc = allDocs.find(d => d.subjectName === pName);
            const cat = originalDoc?.subjectType === 'activity' ? 'กิจกรรม' :
                        originalDoc?.academicCategory === 'additional' ? 'เพิ่มเติม' : 'พื้นฐาน';
            dropDownData.push({ type: 'group', groupName: \`\${pName} (\${cat})\`, subjects: children });
          }
        });

        dropDownData.push({ type: 'single', name: 'อื่นๆ' });`;

const newTargetStr = `        const dropDownData: any[] = [];
        
        const standaloneSubjects = new Set<string>();
        allDocs.forEach(data => {
          const isActuallyParent = parentIds.has(data.id) || data.isParent === true;
          if (data.subjectName && !isActuallyParent && !parentNames.has(data.subjectName) && !data.parentId) {
            standaloneSubjects.add(data.subjectName);
          }
        });
        
        // Arrays to hold different categories
        const basicSubjects: any[] = [];
        const additionalSubjects: any[] = [];
        const activitySubjects: any[] = [];
        
        // Categorize standalone subjects
        standaloneSubjects.forEach(s => {
          const originalDoc = allDocs.find(d => d.subjectName === s);
          const type = originalDoc?.subjectType || 'academic';
          const cat = originalDoc?.academicCategory || 'basic';
          
          const item = { type: 'single', name: s, subjectType: type };
          
          if (type === 'activity') {
            activitySubjects.push(item);
          } else if (cat === 'additional') {
            additionalSubjects.push(item);
          } else {
            basicSubjects.push(item);
          }
        });
        
        // Categorize parent subjects (groups)
        parentNames.forEach(pName => {
          const children = childMap.get(pName) || [];
          if (children.length > 0) {
            const originalDoc = allDocs.find(d => d.subjectName === pName);
            const type = originalDoc?.subjectType || 'academic';
            const cat = originalDoc?.academicCategory || 'basic';
            
            const item = { type: 'group', groupName: pName, subjects: children };
            
            if (type === 'activity') {
              activitySubjects.push(item);
            } else if (cat === 'additional') {
              additionalSubjects.push(item);
            } else {
              basicSubjects.push(item);
            }
          }
        });
        
        // Helper to push items with section headers
        if (basicSubjects.length > 0) {
          dropDownData.push({ type: 'header', label: '--- วิชาพื้นฐาน ---' });
          dropDownData.push(...basicSubjects);
        }
        
        if (additionalSubjects.length > 0) {
          dropDownData.push({ type: 'header', label: '--- วิชาเพิ่มเติม ---' });
          dropDownData.push(...additionalSubjects);
        }
        
        if (activitySubjects.length > 0) {
          dropDownData.push({ type: 'header', label: '--- กิจกรรมพัฒนาผู้เรียน ---' });
          dropDownData.push(...activitySubjects);
        }

        dropDownData.push({ type: 'header', label: '--- อื่นๆ ---' });
        dropDownData.push({ type: 'single', name: 'อื่นๆ' });`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/hooks/useAvailableSubjects.ts', content);
console.log("Patched to group by category using headers");
