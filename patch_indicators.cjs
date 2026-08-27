const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

const startMarker = '<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">';
const endMarkerTextarea = 'ตัวชี้วัดควรรู้ (ปลายทาง) ที่เลือกไว้';

let startIndex = code.indexOf(startMarker);
if (startIndex !== -1) {
  // we want to find the end of the div that contains "ตัวชี้วัดควรรู้ (ปลายทาง) ที่เลือกไว้"
  let endIndexSearch = code.indexOf(endMarkerTextarea, startIndex);
  if (endIndexSearch !== -1) {
     let endIndex = code.indexOf('</div>', endIndexSearch);
     if (endIndex !== -1) {
       endIndex += 6; // length of '</div>'
       
       let targetBlock = code.substring(startIndex, endIndex);
       let replacement = '{!isKindergarten && (\\n            <>\\n              ' + targetBlock.replace(/\\n/g, '\\n              ') + '\\n            </>\\n          )}';
       
       code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
       fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', code);
       console.log('Successfully wrapped indicators in !isKindergarten');
     } else {
       console.log('endIndex not found');
     }
  } else {
    console.log('endMarkerTextarea not found');
  }
} else {
  console.log('startMarker not found');
}
