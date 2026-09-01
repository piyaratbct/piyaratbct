const fs = require('fs');

function cleanDupes(file) {
  let code = fs.readFileSync(file, 'utf8');
  let lines = code.split('\n');
  
  // Find lines starting with const [importedDesirable
  let firstIdx = -1;
  let linesToDrop = [];
  for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('const [importedDesirable')) {
      if(firstIdx === -1) {
        firstIdx = i;
      } else {
        // Drop the whole injected block: 26 lines
        for(let j=i; j<i+26; j++) {
          linesToDrop.push(j);
        }
      }
    }
  }
  let newLines = lines.filter((_, idx) => !linesToDrop.includes(idx));
  fs.writeFileSync(file, newLines.join('\n'));
  console.log("Fixed dupes in " + file);
}

cleanDupes('src/components/PBLLessonLogForm.tsx');
