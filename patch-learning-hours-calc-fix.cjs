const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const targetStr = `        // Let's modify the target calculation to be more accurate for the current term
        if (subjectMap[subj].dataSource === 'curriculum' && subjectMap[subj].targetPeriodsTotal > 0) {
           // We have a hardcoded value from curriculum. Let's assume it's for the whole year.
           // Divide by 2 to get per semester target
           subjectMap[subj].targetPeriodsTotal = Math.round(subjectMap[subj].targetPeriodsTotal / 2);
        } else if (subjectMap[subj].periodsPerWeek > 0) {
           // If we don't have it in curriculum, calculate based on schedule
           // e.g., 2 periods/week * 20 weeks = 40 periods
           subjectMap[subj].targetPeriodsTotal = subjectMap[subj].periodsPerWeek * learningWeeks;
           
           // Mark it as missing from curriculum so the warning triggers
           subjectMap[subj].dataSource = 'schedule_fallback';
        }`;

const newTargetStr = `        // Let's modify the target calculation to be more accurate for the current term
        if (subjectMap[subj].dataSource === 'curriculum' && subjectMap[subj].targetPeriodsTotal > 0) {
           // If we have a hardcoded value from curriculum, use it!
           // (Assuming the user inputs the hours per term, or we divide by 2 if they input per year)
           // If we assume the curriculum input is per year, we divide by 2 here. 
           // If it's per term, we leave it as is. 
           // Let's use it as is for now, but divide by 2 if they usually put yearly hours. 
           // In Thai schools, total hours is typically per year, so dividing by 2 makes sense for a semester.
           subjectMap[subj].targetPeriodsTotal = Math.round(subjectMap[subj].targetPeriodsTotal / 2);
        }
        
        // If it's still 0 (or wasn't in curriculum), we fallback to schedule calculation
        if (subjectMap[subj].targetPeriodsTotal === 0 && subjectMap[subj].periodsPerWeek > 0) {
           // e.g., 2 periods/week * 20 weeks = 40 periods
           subjectMap[subj].targetPeriodsTotal = subjectMap[subj].periodsPerWeek * learningWeeks;
           
           // Mark it as missing from curriculum so the warning triggers
           subjectMap[subj].dataSource = 'schedule_fallback';
        }`;

content = content.replace(targetStr, newTargetStr);

fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched LearningHoursReport calculation fix");
