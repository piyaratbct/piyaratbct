const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

if (!content.includes('export const BASE_GRADE_LEVELS')) {
  content = content.replace(
    /export const GRADE_LEVELS = \[[\s\S]*?\];/,
    "$&" + "\n\nexport const BASE_GRADE_LEVELS = Array.from(new Set(GRADE_LEVELS.map(g => g.split('/')[0].trim())));"
  );
  fs.writeFileSync('src/types.ts', content);
  console.log("Added BASE_GRADE_LEVELS to types.ts");
}
