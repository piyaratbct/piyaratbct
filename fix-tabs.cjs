const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// 1. Fix the top-level bypass so only 'อ่าน-เขียน' bypasses tabs.
const oldBypass = `{!(selectedSubject && (selectedSubject.includes('ลูกเสือ') || selectedSubject.includes('อ่าน-เขียน'))) ? ( <>`;
const newBypass = `{!(selectedSubject && selectedSubject.includes('อ่าน-เขียน')) ? ( <>`;

if (content.includes(oldBypass)) {
  content = content.replace(oldBypass, newBypass);
  console.log("Patched top-level bypass");
} else {
  console.log("Could not find top-level bypass");
}

// 2. Extract the scout table.
// The scout table is in the else block: `              ) : (\n                <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl max-w-full mt-6">\n                  <table className="w-full text-sm text-left">` ... down to `                  </table>\n                </div>\n              )}`

const scoutTableStart = content.indexOf(') : (\n                <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl max-w-full mt-6">\n                  <table className="w-full text-sm text-left">\n                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">');
if (scoutTableStart === -1) {
  console.log("Could not find scout table start");
} else {
  // Find the end of this block
  const searchStr = `                  </table>\n                </div>\n              )}`
  const scoutTableEnd = content.indexOf(searchStr, scoutTableStart);
  if (scoutTableEnd !== -1) {
    console.log("Found scout table end");
    
    // Extract JUST the table
    const tableStart = content.indexOf('<table', scoutTableStart);
    const tableEnd = content.indexOf('</table>', tableStart) + 8;
    const scoutTable = content.substring(tableStart, tableEnd);
    
    // Delete the scout table block from the bottom
    content = content.substring(0, scoutTableStart) + `\n              )}` + content.substring(scoutTableEnd + searchStr.length);
    
    // 3. Inject the scout table into `gradesSubTab === 'part2'`
    const part2Start = content.indexOf(`gradesSubTab === 'part2' ? (`);
    if (part2Start !== -1) {
      const newPart2 = `gradesSubTab === 'part2' ? (
                  selectedSubjectType === 'activity' ? (
                    ${scoutTable}
                  ) : (`;
      content = content.replace(`gradesSubTab === 'part2' ? (`, newPart2);
      
      // Need to close the new ternary inside part2!
      // The old part2 is closed around line 1090.
      // `                      </tbody>\n                    </table>\n                  ) : (` 
      // We need to add `)` before ` : (`
      const part2End = content.indexOf(`                    </table>\n                  ) : (\n                    <div className="p-8 text-center text-slate-500">กำลังโหลดการตั้งค่า...</div>`, part2Start);
      
      if (part2End !== -1) {
         const oldPart2EndStr = `                    </table>\n                  ) : (\n                    <div className="p-8 text-center text-slate-500">กำลังโหลดการตั้งค่า...</div>`;
         const newPart2EndStr = `                    </table>\n                  )) : (\n                    <div className="p-8 text-center text-slate-500">กำลังโหลดการตั้งค่า...</div>`;
         content = content.replace(oldPart2EndStr, newPart2EndStr);
         console.log("Patched part2");
      } else {
         console.log("Could not find part2 end");
      }
      
    } else {
      console.log("Could not find part2 start");
    }
    
  } else {
    console.log("Could not find scout table end");
  }
}

fs.writeFileSync('src/components/EvaluationModule.tsx', content);

