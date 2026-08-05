const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `              {activeTab === "plan-list" && (
                <LessonPlanList
                  plans={plans}
                  teachers={teachers}`;

const replacement = `              {activeTab === "plan-list" && (
                <LessonPlanList
                  plans={plans}
                  records={records}
                  teachers={teachers}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf8');
