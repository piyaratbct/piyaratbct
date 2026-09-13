const fs = require('fs');
let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const targetStr = `        // Let's modify the target calculation to be more accurate for the current term
        if (subjectMap[subj].dataSource === 'curriculum' && subjectMap[subj].targetPeriodsTotal > 0) {
           // The curriculum system stores "Total Hours per Year" (ชั่วโมง/ปี)
           // We divide by 2 to get the target for the current semester (ภาคเรียน)
           subjectMap[subj].targetPeriodsTotal = Math.round(subjectMap[subj].targetPeriodsTotal / 2);
        }`;

const newTargetStr = `        // Let's modify the target calculation to be more accurate for the current term
        if (subjectMap[subj].dataSource === 'curriculum' && subjectMap[subj].targetPeriodsTotal > 0) {
           // The curriculum system stores "Total Hours per Term" (ชั่วโมง/เทอม) as per the UI
           // So we use it exactly as is, without dividing.
           subjectMap[subj].targetPeriodsTotal = subjectMap[subj].targetPeriodsTotal;
        }`;

content = content.replace(targetStr, newTargetStr);

// Also fix the warning message text just in case it says /ปี
content = content.replace("ยังไม่ได้กำหนดเวลาเรียนรวม (ชั่วโมง/ปี)", "ยังไม่ได้กำหนดโครงสร้างเวลาเรียน (ชั่วโมง/เทอม)");

fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched LearningHoursReport calculation - removed /2");
