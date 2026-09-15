const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

// 1. Add childSubjects to the subjectMap interface
code = code.replace(
    /dataSource: string;\s*\}> = \{\};/,
    `dataSource: string;
      childSubjects: Record<string, { periodsPerWeek: number, taughtPeriods: number, targetPeriodsTotal: number }>;
    }> = {};`
);

// 2. Fix the relevantCurriculums filter to check gradeLevels as well
const filterRegex = /const relevantCurriculums = curriculums\.filter\(c => \{\s*if \(c\.gradeLevel\) return getBaseGrade\(c\.gradeLevel\) === targetBaseGrade;\s*return false;\s*\}\);/;
const filterReplacement = `const relevantCurriculums = curriculums.filter(c => {
      if (c.gradeLevel && getBaseGrade(c.gradeLevel) === targetBaseGrade) return true;
      if (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === targetBaseGrade)) return true;
      return false;
    });`;
code = code.replace(filterRegex, filterReplacement);

// 3. Update subjectMap initialization
code = code.replace(
    /dataSource: 'curriculum'\s*\};/g,
    `dataSource: 'curriculum',
        childSubjects: {}
      };`
);
code = code.replace(
    /dataSource: 'schedule'\s*\};/g,
    `dataSource: 'schedule',
          childSubjects: {}
        };`
);
code = code.replace(
    /dataSource: 'session'\s*\};/g,
    `dataSource: 'session',
          childSubjects: {}
        };`
);

// 4. Update the UI rendering to show child subjects
const uiRegex = /<h4 className="font-bold text-slate-800 line-clamp-1" title=\{item\.subject\}>\{item\.subject\}<\/h4>/;
const uiReplacement = `<div className="flex flex-col">
                      <h4 className="font-bold text-slate-800 line-clamp-1" title={item.subject}>{item.subject}</h4>
                      {Object.keys(item.childSubjects || {}).length > 0 && (
                          <div className="mt-1 space-y-1">
                              {Object.keys(item.childSubjects).map(child => (
                                  <div key={child} className="text-[10px] text-slate-600 flex items-center justify-between gap-2 bg-slate-50 px-2 py-1 rounded">
                                      <div className="flex items-center gap-1 line-clamp-1">
                                          <span className="w-1 h-1 rounded-full bg-indigo-300 shrink-0"></span>
                                          {child}
                                      </div>
                                      <div className="shrink-0 font-medium whitespace-nowrap">
                                          {item.childSubjects[child].taughtPeriods} / {item.childSubjects[child].periodsPerWeek} คาบ
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                    </div>`;
code = code.replace(uiRegex, uiReplacement);

fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
console.log("Patched LearningHoursReport.tsx v2");
