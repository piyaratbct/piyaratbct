const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const tabMatch = `<UserPlus className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">Student 360°</span>`;
const tabReplace = `<span className="text-[14px] font-black leading-none shrink-0 tracking-tighter">360&deg;</span>
              <span className="whitespace-nowrap">Student 360°</span>`;
              
if (content.includes(tabMatch)) {
  content = content.replace(tabMatch, tabReplace);
  fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
  console.log('Tab icon updated');
} else {
  console.log('Tab icon not found');
}
