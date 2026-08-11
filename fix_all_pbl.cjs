const fs = require('fs');

function fixPlan(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove setIsPBL calls
  code = code.replace(/setIsPBL\(.*?;\n\s*/g, '');
  
  // Remove isPBL from conditions
  code = code.replace(/\|\| \(isPBL && \(!pblDrivingQuestion\.trim\(\) \|\| !pblInvestigationSteps\.trim\(\) \|\| !pblPresentation\.trim\(\)\)\)/g, '|| (!pblDrivingQuestion.trim() || !pblInvestigationSteps.trim() || !pblPresentation.trim())');
  
  fs.writeFileSync(file, code, 'utf8');
}

function fixLog(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove the useState
  code = code.replace(/const \[isPBL, setIsPBL\] = useState\(initialRecord\?\.isPBL \|\| false\);\n\s*/, '');
  
  // Remove setIsPBL calls
  code = code.replace(/setIsPBL\(.*?;\n\s*/g, '');
  
  // Remove isPBL from conditions
  code = code.replace(/\|\| \(isPBL && \(!pblDrivingQuestion\.trim\(\) \|\| !pblInvestigationSteps\.trim\(\) \|\| !pblPresentation\.trim\(\)\)\)/g, '|| (!pblDrivingQuestion.trim() || !pblInvestigationSteps.trim() || !pblPresentation.trim())');
  
  // Set isPBL: true in payload
  code = code.replace(/      isPBL,/, '      isPBL: true,');
  
  fs.writeFileSync(file, code, 'utf8');
}

fixPlan('src/components/PBLLessonPlanForm.tsx');
fixLog('src/components/PBLLessonLogForm.tsx');
