const fs = require('fs');

function clean(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove useStates
  code = code.replace(/  const \[isPBL, setIsPBL\] = useState\(.*?\);\n/g, '');
  code = code.replace(/  const \[pblDrivingQuestion, setPblDrivingQuestion\] = useState\(.*?\);\n/g, '');
  code = code.replace(/  const \[pblInvestigationSteps, setPblInvestigationSteps\] = useState\(.*?\);\n/g, '');
  code = code.replace(/  const \[pblPresentation, setPblPresentation\] = useState\(.*?\);\n/g, '');
  
  // Remove from resets / initializations
  code = code.replace(/      setIsPBL\(.*?\);\n/g, '');
  code = code.replace(/      setPblDrivingQuestion\(.*?\);\n/g, '');
  code = code.replace(/      setPblInvestigationSteps\(.*?\);\n/g, '');
  code = code.replace(/      setPblPresentation\(.*?\);\n/g, '');

  code = code.replace(/    setIsPBL\(.*?\);\n/g, '');
  code = code.replace(/    setPblDrivingQuestion\(.*?\);\n/g, '');
  code = code.replace(/    setPblInvestigationSteps\(.*?\);\n/g, '');
  code = code.replace(/    setPblPresentation\(.*?\);\n/g, '');

  // Remove from conditions
  code = code.replace(/ \|\| \(isPBL && \(!pblDrivingQuestion\.trim\(\) \|\| !pblInvestigationSteps\.trim\(\) \|\| !pblPresentation\.trim\(\)\)\)/g, '');
  
  // Remove from payloads
  code = code.replace(/      isPBL,\n/g, '');
  code = code.replace(/      pblDrivingQuestion,\n/g, '');
  code = code.replace(/      pblInvestigationSteps,\n/g, '');
  code = code.replace(/      pblPresentation,\n/g, '');
  
  fs.writeFileSync(file, code, 'utf8');
}

clean('src/components/LessonPlanForm.tsx');
clean('src/components/LessonLogForm.tsx');
