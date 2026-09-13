const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const targetStr = `    // 2. Overlay with schedules to get teachers and periods per week
    gradeSchedules.forEach(sch => {
      const subjectName = sch.subject === 'อื่นๆ' ? (sch.customSubject || 'อื่นๆ') : sch.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sch.teacherName || '-',
          periodsPerWeek: 0,
          targetPeriodsTotal: 0, // Explicitly 0 if not in curriculum
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'schedule'
        };
      } else {
        if (subjectMap[subjectName].teacherName === '-') {
          subjectMap[subjectName].teacherName = sch.teacherName || '-';
        } else if (sch.teacherName && !subjectMap[subjectName].teacherName.includes(sch.teacherName)) {
           subjectMap[subjectName].teacherName += \`, \${sch.teacherName}\`;
        }
      }
      
      subjectMap[subjectName].periodsPerWeek += 1;
    });`;

const newTargetStr = `    // 2. Overlay with schedules to get teachers and periods per week
    gradeSchedules.forEach(sch => {
      const subjectName = sch.subject === 'อื่นๆ' ? (sch.customSubject || 'อื่นๆ') : sch.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sch.teacherName || '-',
          periodsPerWeek: 0,
          targetPeriodsTotal: 0, // Will calculate below if missing
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'schedule'
        };
      } else {
        if (subjectMap[subjectName].teacherName === '-') {
          subjectMap[subjectName].teacherName = sch.teacherName || '-';
        } else if (sch.teacherName && !subjectMap[subjectName].teacherName.includes(sch.teacherName)) {
           subjectMap[subjectName].teacherName += \`, \${sch.teacherName}\`;
        }
      }
      
      subjectMap[subjectName].periodsPerWeek += 1;
    });
    
    // Now, calculate the target periods based on schedule if curriculum data is missing/zero, 
    // BUT we still want to show the warning if it's purely from schedule.
    // Also, we need to convert yearly hours to term hours.
    // Assuming standard 20 weeks per term, or calculating from totalLearningDays.
    const learningWeeks = Math.max(1, Math.round(totalLearningDays / 5));
    
    Object.keys(subjectMap).forEach(subj => {
        // If curriculum defined it, we use it directly. 
        // Note: curriculum totalHours is usually per YEAR. We might need to halve it for per-term, 
        // but let's assume the user enters what they expect for the term for now, OR they enter for the year.
        // Actually, if we look at the image, standard is 80 or 40. 
        // Let's divide by 2 to get per-semester target, OR if it's from schedule, periodsPerWeek * 20.
        
        // Let's modify the target calculation to be more accurate for the current term
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
        }
    });`;

const hasMissingHoursTarget = `  const hasMissingHours = reportData.some(item => item.targetPeriodsTotal === 0 && (item.periodsPerWeek > 0 || item.taughtPeriods > 0));`;

const newHasMissingHoursTarget = `  const hasMissingHours = reportData.some(item => item.dataSource === 'schedule_fallback');`;

content = content.replace(targetStr, newTargetStr);
content = content.replace(hasMissingHoursTarget, newHasMissingHoursTarget);

fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched LearningHoursReport calculation");
