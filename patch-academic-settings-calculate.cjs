const fs = require('fs');
let content = fs.readFileSync('src/components/AcademicSettings.tsx', 'utf8');

// Replace the old holiday skip logic which just skips EVERYTHING in the holidayDates set
// with one that respects the new holiday.type ('holiday', 'activity_no_class' vs 'activity_integrated')

const oldLogic = `      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateString)) {
        count++;
      }`;

const newLogic = `      const isHoliday = holidays.find(h => h.date === dateString);
      const shouldSkip = isHoliday && (isHoliday.type === 'holiday' || isHoliday.type === 'activity_no_class');
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !shouldSkip) {
        count++;
      }`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/AcademicSettings.tsx', content);
  console.log('Fixed calculateLearningDays logic in AcademicSettings.tsx');
} else {
  console.log('Could not find old logic to replace');
}
