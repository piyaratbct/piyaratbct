import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const commentStr = '{/* BMI Report appended to special-care */}';
const startIndex = content.indexOf(commentStr);

if (startIndex !== -1) {
  // Find the end of the IIFE
  const endIndexStr = '})()}';
  const endIndex = content.indexOf(endIndexStr, startIndex + commentStr.length);
  if (endIndex !== -1) {
    let block = content.substring(startIndex, endIndex);
    const opens = block.match(/<div/g)?.length || 0;
    const closes = block.match(/<\/div>/g)?.length || 0;
    console.log("Opens:", opens, "Closes:", closes);
    
    if (closes > opens) {
      console.log("Too many closing divs!");
      const diff = closes - opens;
      for (let i = 0; i < diff; i++) {
        const lastDiv = block.lastIndexOf('</div>');
        block = block.substring(0, lastDiv) + block.substring(lastDiv + 6);
      }
      content = content.substring(0, startIndex) + block + content.substring(endIndex);
      fs.writeFileSync(file, content);
      console.log("Fixed! Removed", diff, "closing divs");
    } else if (opens > closes) {
      console.log("Too few closing divs!");
      const diff = opens - closes;
      let newEnding = '';
      for (let i = 0; i < diff; i++) {
        newEnding += '</div>\n';
      }
      // find the last div and insert after it
      const lastDiv = block.lastIndexOf('</div>');
      block = block.substring(0, lastDiv + 6) + '\\n' + newEnding + block.substring(lastDiv + 6);
      content = content.substring(0, startIndex) + block + content.substring(endIndex);
      fs.writeFileSync(file, content);
      console.log("Fixed! Added", diff, "closing divs");
    } else {
      console.log("Perfectly balanced.");
    }
  } else {
    console.log("end index not found");
  }
} else {
  console.log("start index not found");
}
