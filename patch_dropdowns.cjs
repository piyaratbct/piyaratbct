const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

// Patch IndicatorSelector dropdown
const selectorDropdownTarget = `{curriculums.length > 1 && (
            <div className="mb-3 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">`;
const selectorDropdownReplacement = `<div className="mb-3 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">`;
code = code.replace(selectorDropdownTarget, selectorDropdownReplacement);

const selectorDropdownEndTarget = `              </select>
            </div>
          )}`;
const selectorDropdownEndReplacement = `              </select>
            </div>`;
code = code.replace(selectorDropdownEndTarget, selectorDropdownEndReplacement);


// Patch Remaining Table dropdown
const tableDropdownTarget = `{curriculums.length > 1 && (
                  <select 
                    value={tableGradeFilter}`;
const tableDropdownReplacement = `<select 
                    value={tableGradeFilter}`;
code = code.replace(tableDropdownTarget, tableDropdownReplacement);

const tableDropdownEndTarget = `                  </select>
                )}`;
const tableDropdownEndReplacement = `                  </select>`;
code = code.replace(tableDropdownEndTarget, tableDropdownEndReplacement);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
