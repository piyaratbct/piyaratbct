const fs = require('fs');

['src/components/LessonLogForm.tsx', 'src/components/LessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all imports from "../types" or '../types'
  const regex = /import\s+\{([^}]+)\}\s+from\s+["']\.\.\/types["'];/g;
  
  let match;
  let allImports = [];
  while ((match = regex.exec(content)) !== null) {
    const parts = match[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
    allImports = allImports.concat(parts);
  }
  
  if (allImports.length > 0) {
    allImports = [...new Set(allImports)];
    
    // Remove all old imports
    content = content.replace(regex, '');
    
    // Insert a new import after the first import React
    content = content.replace(/import React.*?;\n?/, `$&import { ${allImports.join(', ')} } from "../types";\n`);
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
