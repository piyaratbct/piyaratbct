const fs = require('fs');
['src/components/LessonLogForm.tsx', 'src/components/LessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('PERIOD_OPTIONS')) {
    // This shouldn't happen, the JSX has PERIOD_OPTIONS now.
  }
  
  if (content.includes('PERIOD_OPTIONS') && !content.match(/import.*PERIOD_OPTIONS.*from '\.\.\/types'/)) {
    // Need to add PERIOD_OPTIONS to imports from '../types'
    content = content.replace(/import \{([^}]+)\} from '\.\.\/types';/, (match, p1) => {
      if (p1.includes('PERIOD_OPTIONS')) return match;
      return `import { ${p1.trim()}, PERIOD_OPTIONS } from '../types';`;
    });
    
    // Check if SEMESTERS needs to be imported
    if (content.includes('SEMESTERS') && !content.match(/import.*SEMESTERS.*from '\.\.\/types'/)) {
        content = content.replace(/import \{([^}]+)\} from '\.\.\/types';/, (match, p1) => {
          if (p1.includes('SEMESTERS')) return match;
          return `import { ${p1.trim()}, SEMESTERS } from '../types';`;
        });
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
