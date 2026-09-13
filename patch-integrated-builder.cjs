const fs = require('fs');

let content = fs.readFileSync('src/components/IntegratedUnitBuilder.tsx', 'utf8');

// Fix imports
if (!content.includes('BASE_GRADE_LEVELS')) {
  content = content.replace(
    /import \{ CurriculumSubject, GRADE_LEVELS \} from '\.\.\/types';/,
    "import { CurriculumSubject, GRADE_LEVELS, BASE_GRADE_LEVELS } from '../types';"
  );
}

// Replace GRADE_LEVELS with BASE_GRADE_LEVELS
content = content.replace(
  /GRADE_LEVELS\.map\(g => <option key=\{g\} value=\{g\}>\{g\}<\/option>\)/g,
  "BASE_GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)"
);

content = content.replace(
  /useState<string>\(GRADE_LEVELS\[0\]\)/g,
  "useState<string>(BASE_GRADE_LEVELS[0])"
);

fs.writeFileSync('src/components/IntegratedUnitBuilder.tsx', content);
console.log("Patched IntegratedUnitBuilder.tsx");
