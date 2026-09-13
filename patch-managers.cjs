const fs = require('fs');

const files = [
  'src/components/CurriculumManager.tsx',
  'src/components/UnifiedCurriculumManager.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix imports
  if (!content.includes('BASE_GRADE_LEVELS')) {
    content = content.replace(
      /GRADE_LEVELS,\s*/,
      "GRADE_LEVELS, BASE_GRADE_LEVELS, "
    );
  }

  // Use BASE_GRADE_LEVELS for the filter dropdown
  content = content.replace(
    /<select([^>]*)value=\{gradeFilter\}([\s\S]*?)>([\s\S]*?)<option value="all">ทุกระดับชั้น<\/option>[\s\S]*?\{GRADE_LEVELS\.map\(g => <option key=\{g\} value=\{g\}>\{g\}<\/option>\)\}([\s\S]*?)<\/select>/,
    `<select$1value={gradeFilter}$2>$3<option value="all">ทุกระดับชั้น</option>
                {BASE_GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}$4</select>`
  );

  // Use BASE_GRADE_LEVELS for the editingSubject grade level dropdown
  content = content.replace(
    /<select([^>]*)value=\{editingSubject\.gradeLevel \|\| ''\}([\s\S]*?)>([\s\S]*?)\{GRADE_LEVELS\.map\(g => \(([\s\S]*?)<option key=\{g\} value=\{g\}>\{g\}<\/option>([\s\S]*?)\)\)\}([\s\S]*?)<\/select>/,
    `<select$1value={editingSubject.gradeLevel || ''}$2>$3{BASE_GRADE_LEVELS.map(g => ($4<option key={g} value={g}>{g}</option>$5))}$6</select>`
  );
  
  // Set default initial grade using BASE_GRADE_LEVELS
  content = content.replace(
    /gradeLevel: GRADE_LEVELS\[0\]/g,
    "gradeLevel: BASE_GRADE_LEVELS[0]"
  );

  fs.writeFileSync(file, content);
  console.log("Patched " + file);
});
