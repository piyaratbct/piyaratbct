const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

content = content.replace(
  `let curriculumMatch = curriculums.find(c => c.subjectName === sub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));`,
  `// หาจากชื่อวิชาและระดับชั้นก่อน
                            let curriculumMatch = curriculums.find(c => c.subjectName === sub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                            
                            // ถ้าหาไม่เจอ ลองหาจากชื่อวิชาอย่างเดียว (fallback สำหรับกิจกรรมที่อาจตั้งค่าระดับชั้นหลวมๆ)
                            if (!curriculumMatch) {
                               curriculumMatch = curriculums.find(c => c.subjectName === sub);
                            }`
);

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Patched fallback match.");
