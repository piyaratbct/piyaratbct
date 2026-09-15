const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

const regex = /\{child\}\s*<\/div>/g;
const replacement = `{child}
                                                  <span className="ml-auto text-indigo-600 font-medium">
                                                      {Object.keys(rooms).map(rm => 
                                                          rooms[rm].childSubjects && rooms[rm].childSubjects[child] ? 
                                                          rooms[rm].childSubjects[child].days.reduce((acc, d) => acc + (teachingDaysCount ? (teachingDaysCount[d] || 0) : 0), 0) : 0
                                                      ).reduce((a, b) => a + b, 0)} ชม.
                                                  </span>
                                              </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ScheduleManager.tsx', code);
console.log("Patched ScheduleManager.tsx child UI");
