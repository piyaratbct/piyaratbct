import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const comment = '{/* BMI Report appended to special-care */}';
const idx = content.indexOf(comment);
if (idx !== -1) {
  const startToReplace = content.lastIndexOf(')}', idx);
  console.log("Found )}", startToReplace);
  let substr = content.substring(startToReplace, idx);
  console.log("Substr to replace:", JSON.stringify(substr));
  
  const replaceWith = ')}\n    </div>\n  );\n})()}';
  content = content.substring(0, startToReplace) + replaceWith + content.substring(idx);
  fs.writeFileSync(file, content);
  console.log("Replaced!");
}
