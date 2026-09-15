const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const search = `    if (currSubj) {
      if (currSubj.requiredHoursPerTerm && currSubj.requiredHoursPerTerm > 0) {
        totalTargetPeriods = currSubj.requiredHoursPerTerm;
      } else if (currSubj.totalHours && currSubj.totalHours > 0) {
        // If totalHours is available (usually per year), divide by 2 as fallback?
        // Or assume it's already per term? Let's use requiredHoursPerTerm as primary.
        // If requiredHoursPerTerm is not set, we'll assume totalHours might be per year.
        totalTargetPeriods = Math.round(currSubj.totalHours / 2);
      }
    }`;

const replace = `    if (currSubj) {
      // Both totalHours and requiredHoursPerTerm hold the YEARLY hours (due to the UI label in CurriculumManager)
      const yearlyHours = currSubj.totalHours || currSubj.requiredHoursPerTerm || 0;
      if (yearlyHours > 0) {
        totalTargetPeriods = Math.round(yearlyHours / 2); // Term Target
      }
    }`;

code = code.replace(search, replace);

fs.writeFileSync('src/components/EvaluationModule.tsx', code);
