const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const coreConditionTarget = `{curriculums.length > 0 && (
              <IndicatorSelector 
                curriculums={curriculums} 
                usedIndicators={usedIndicators} 
                selectedText={coreIndicators} 
                onSelectChange={setCoreIndicators} 
                type="core" 
              />
            )}`;
const coreConditionReplacement = `<IndicatorSelector 
                curriculums={curriculums} 
                usedIndicators={usedIndicators} 
                selectedText={coreIndicators} 
                onSelectChange={setCoreIndicators} 
                type="core" 
              />`;
code = code.replace(coreConditionTarget, coreConditionReplacement);

const targetConditionTarget = `{curriculums.length > 0 && (
              <IndicatorSelector 
                curriculums={curriculums} 
                usedIndicators={usedIndicators} 
                selectedText={targetIndicators} 
                onSelectChange={setTargetIndicators} 
                type="terminal" 
              />
            )}`;
const targetConditionReplacement = `<IndicatorSelector 
                curriculums={curriculums} 
                usedIndicators={usedIndicators} 
                selectedText={targetIndicators} 
                onSelectChange={setTargetIndicators} 
                type="terminal" 
              />`;
code = code.replace(targetConditionTarget, targetConditionReplacement);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
