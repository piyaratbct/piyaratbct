const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

// Replace buttons
const oldButton = `<button
              onClick={() => setActiveTab("health")}
              className={\`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === "health"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <HeartPulse className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">สุขภาพ & พัฒนาการ</span>
            </button>`;

const newButtons = `<button
              onClick={() => setActiveTab("special-care")}
              className={\`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === "special-care"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <HeartPulse className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">ข้อมูลสุขภาพ</span>
            </button>
            <button
              onClick={() => setActiveTab("health-report")}
              className={\`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === "health-report"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">พัฒนาการร่างกาย</span>
            </button>`;

content = content.replace(oldButton, newButtons);

const oldOpacity = `activeTab === 'assessments' || activeTab === 'health'`;
const newOpacity = `activeTab === 'assessments' || activeTab === 'health-report'`;
content = content.replace(oldOpacity, newOpacity);

const oldCondition = `selectedMonth && activeTab === 'health'`;
const newCondition = `selectedMonth && activeTab === 'health-report'`;
content = content.replace(oldCondition, newCondition);

// change the content conditions
content = content.replace('{activeTab === "health" && (() => {', '{activeTab === "special-care" && (() => {');

// Fix Health Report Part
const healthReportStart = `    </div>\n  );\n\n  {/* Health Report Part */}`;
const healthReportStartReplace = `    </div>\n  );\n})()}\n\n{activeTab === "health-report" && (() => {`;
content = content.replace(healthReportStart, healthReportStartReplace);

// Fix end of IIFE
const healthReportEnd = `      </div>\n    </div>\n  );\n      </div>\n\n      {/* Assessment Modal/Form Overlay */}`;
const healthReportEndReplace = `      </div>\n    </div>\n  );\n})()}\n      </div>\n\n      {/* Assessment Modal/Form Overlay */}`;

content = content.replace(healthReportEnd, healthReportEndReplace);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Split tabs');
