import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const match = content.match(/}\)\(\)\}\s*\{\/\* BMI Report appended to special-care \*\/\}/);
if (match) {
  const endIndex = match.index;
  const startIndexStr = 'activeTab === "special-care" && (() => {';
  const startIndex = content.lastIndexOf(startIndexStr, endIndex);
  if (startIndex !== -1) {
    let block = content.substring(startIndex, endIndex);
    const opens = block.match(/<div/g)?.length || 0;
    const closes = block.match(/<\/div>/g)?.length || 0;
    console.log("Opens:", opens, "Closes:", closes);
    
    if (opens > closes) {
      const diff = opens - closes;
      let newEnding = '';
      for (let i = 0; i < diff; i++) {
        newEnding += '</div>\n';
      }
      // Insert right before the end of the IIFE JSX tree, which is `    </div>\n  );\n` probably?
      // Actually let's just replace the block.
      const returnIndex = block.lastIndexOf(')');
      // Wait, if it's missing divs, it's better to just remove one or two `</div>` if we have too many.
    } else if (closes > opens) {
      console.log("Too many closing divs!");
      const diff = closes - opens;
      for (let i = 0; i < diff; i++) {
        const lastDiv = block.lastIndexOf('</div>');
        block = block.substring(0, lastDiv) + block.substring(lastDiv + 6);
      }
      content = content.substring(0, startIndex) + block + content.substring(endIndex);
      fs.writeFileSync(file, content);
      console.log("Fixed! Removed", diff, "closing divs");
    } else {
      console.log("Perfectly balanced.");
    }
  } else {
    console.log("start index not found");
  }
} else {
  console.log("end index not found");
}
