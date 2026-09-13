const fs = require('fs');
let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const targetStr = `        // Let's modify the target calculation to be more accurate for the current term
        if (subjectMap[subj].dataSource === 'curriculum' && subjectMap[subj].targetPeriodsTotal > 0) {
           // If we have a hardcoded value from curriculum, use it!
           // (Assuming the user inputs the hours per term, or we divide by 2 if they input per year)
           // If we assume the curriculum input is per year, we divide by 2 here. 
           // If it's per term, we leave it as is. 
           // Let's use it as is for now, but divide by 2 if they usually put yearly hours. 
           // In Thai schools, total hours is typically per year, so dividing by 2 makes sense for a semester.
           subjectMap[subj].targetPeriodsTotal = Math.round(subjectMap[subj].targetPeriodsTotal / 2);
        }`;

const newTargetStr = `        // Let's modify the target calculation to be more accurate for the current term
        if (subjectMap[subj].dataSource === 'curriculum' && subjectMap[subj].targetPeriodsTotal > 0) {
           // The curriculum system stores "Total Hours per Year" (ชั่วโมง/ปี)
           // We divide by 2 to get the target for the current semester (ภาคเรียน)
           subjectMap[subj].targetPeriodsTotal = Math.round(subjectMap[subj].targetPeriodsTotal / 2);
        }`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched LearningHoursReport calculation fix 2");
