const fs = require('fs');

['src/components/LessonLogForm.tsx', 'src/components/LessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the import from "../types" or '../types'
  const regex = /import\s+\{([^}]+)\}\s+from\s+["']\.\.\/types["'];/;
  const match = content.match(regex);
  if (match) {
    let imports = match[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
    // Add SEMESTERS and PERIOD_OPTIONS if not there
    if (!imports.includes('SEMESTERS')) imports.push('SEMESTERS');
    if (!imports.includes('PERIOD_OPTIONS')) imports.push('PERIOD_OPTIONS');
    
    // Deduplicate
    imports = [...new Set(imports)];
    
    content = content.replace(regex, `import { ${imports.join(', ')} } from "../types";`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
