import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
const content = fs.readFileSync(file, 'utf8');

const endStr = '})()}{/* BMI Report appended to special-care */}';
const endIndex = content.indexOf(endStr);
if (endIndex === -1) {
  console.log("End string not found!");
} else {
  // Find start of IIFE
  const startIndex = content.lastIndexOf('{(() => {', endIndex);
  if (startIndex === -1) {
    console.log("Start string not found!");
  } else {
    let str = content.substring(startIndex, endIndex);
    console.log("divs opened:", str.match(/<div/g)?.length);
    console.log("divs closed:", str.match(/<\/div/g)?.length);
  }
}
