const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Metric 3.1
const oldMetric31 = `{/* Metric 3.1 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-slate-700">จำนวนแผนการสอน (ครบถ้วน)</span>
                  <span className="font-black text-amber-600">{totalLessonPlans} <span className="text-sm font-bold text-slate-500">แผน</span></span>
                </div>
              </div>`;
const newMetric31 = `{/* Metric 3.1 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-slate-700">{educationLevelFilter === 'kindergarten' ? 'จำนวนแผนการจัดประสบการณ์ (ครบถ้วน)' : 'จำนวนแผนการสอน (ครบถ้วน)'}</span>
                  <span className="font-black text-amber-600">{totalLessonPlans} <span className="text-sm font-bold text-slate-500">แผน</span></span>
                </div>
              </div>`;
content = content.replace(oldMetric31, newMetric31);

// Metric 3.2
const oldMetric32 = `{/* Metric 3.2 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-slate-700">การเรียนรู้เชิงรุก (Active Learning)</span>
                  <span className="font-black text-amber-600">{activeLearningRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: \`\${activeLearningRate}%\` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{activeLearningPlans} จาก {totalLessonPlans} แผน มีกระบวนการเรียนรู้เชิงรุก</p>
              </div>`;
const newMetric32 = `{/* Metric 3.2 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-slate-700">{educationLevelFilter === 'kindergarten' ? 'กิจกรรมหลัก 6 กิจกรรม / เรียนรู้ผ่านการเล่น' : 'การเรียนรู้เชิงรุก (Active Learning)'}</span>
                  <span className="font-black text-amber-600">{activeLearningRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: \`\${activeLearningRate}%\` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{activeLearningPlans} จาก {totalLessonPlans} แผน {educationLevelFilter === 'kindergarten' ? 'สอดคล้องกับหลักการจัดประสบการณ์' : 'มีกระบวนการเรียนรู้เชิงรุก'}</p>
              </div>`;
content = content.replace(oldMetric32, newMetric32);

// Std 1 Details:
const oldStd1Details = `<h3 className="text-lg font-bold text-slate-700">อยู่ระหว่างการพัฒนา</h3>
                <p className="text-slate-500 mt-2">ส่วนนี้เตรียมไว้สำหรับแสดงตารางเจาะลึกข้อมูลรายบุคคล เช่น ผลการเรียนเฉลี่ย และบันทึกพฤติกรรม</p>`;
const newStd1Details = `<h3 className="text-lg font-bold text-slate-700">อยู่ระหว่างการพัฒนา</h3>
                <p className="text-slate-500 mt-2">ส่วนนี้เตรียมไว้สำหรับแสดงตารางเจาะลึกข้อมูลรายบุคคล เช่น {educationLevelFilter === 'kindergarten' ? 'พัฒนาการ 4 ด้าน' : 'ผลการเรียนเฉลี่ย และบันทึกพฤติกรรม'}</p>`;
content = content.replace(oldStd1Details, newStd1Details);

// Std 3 Details:
const oldStd3Details = `<h3 className="text-lg font-bold text-slate-700">อยู่ระหว่างการพัฒนา</h3>
                <p className="text-slate-500 mt-2">ส่วนนี้เตรียมไว้สำหรับแสดงตารางสรุปการส่งแผนการสอนและงานวิจัยแยกตามหมวดวิชา</p>`;
const newStd3Details = `<h3 className="text-lg font-bold text-slate-700">อยู่ระหว่างการพัฒนา</h3>
                <p className="text-slate-500 mt-2">ส่วนนี้เตรียมไว้สำหรับแสดงตารางสรุปการส่งแผน{educationLevelFilter === 'kindergarten' ? 'การจัดประสบการณ์' : 'การสอน'}และงานวิจัยแยกตามหมวดวิชา</p>`;
content = content.replace(oldStd3Details, newStd3Details);

fs.writeFileSync(file, content);
