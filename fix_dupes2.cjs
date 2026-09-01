const fs = require('fs');

function fixEval(file) {
  let code = fs.readFileSync(file, 'utf8');
  let idx = code.indexOf('importedDesirable,');
  if(idx > 0 && idx < code.indexOf('const [importedDesirable')) {
    // This is the wrongly injected handleSave payload!
    console.log("Found wrongly injected at top of " + file);
    // Actually, I should just checkout the files from git and do the replacements correctly.
  }
}
fixEval('src/components/PBLLessonLogForm.tsx');
