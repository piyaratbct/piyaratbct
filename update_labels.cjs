const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update labels and add the new metric in std2
// We will replace occurrences of static standard names with dynamic ones

// Standard 1 in Overview
const std1OverviewOld = `<p className="text-xs font-bold text-sky-600">คุณภาพของผู้เรียน</p>`;
const std1OverviewNew = `<p className="text-xs font-bold text-sky-600">{educationLevelFilter === 'kindergarten' ? 'คุณภาพของเด็ก' : 'คุณภาพของผู้เรียน'}</p>`;
content = content.replace(std1OverviewOld, std1OverviewNew);

// Standard 3 in Overview
const std3OverviewOld = `<p className="text-xs font-bold text-amber-600">การจัดการเรียนการสอนที่เน้นผู้เรียน</p>`;
const std3OverviewNew = `<p className="text-xs font-bold text-amber-600">{educationLevelFilter === 'kindergarten' ? 'การจัดประสบการณ์ที่เน้นเด็กเป็นสำคัญ' : 'การจัดการเรียนการสอนที่เน้นผู้เรียน'}</p>`;
content = content.replace(std3OverviewOld, std3OverviewNew);

// Add Metric 2.3 to Standard 2 overview
const metric22Old = `{/* Metric 2.2 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">ชุมชนการเรียนรู้ทางวิชาชีพ (PLC)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">ชั่วโมงการแลกเปลี่ยนเรียนรู้รวม</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-800">{totalPlcHours}</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">ชม.</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4">`;

const metric22New = `{/* Metric 2.2 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">ชุมชนการเรียนรู้ทางวิชาชีพ (PLC)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">ชั่วโมงการแลกเปลี่ยนเรียนรู้รวม</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-800">{totalPlcHours}</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">ชม.</span>
                </div>
              </div>

              {/* Metric 2.3 (Media & Tech) */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-700 text-sm leading-tight max-w-[200px]">ให้บริการสื่อเทคโนโลยีสารสนเทศและสื่อการเรียนรู้เพื่อสนับสนุนการจัดประสบการณ์</h4>
                  <span className="inline-flex bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">100%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">อ้างอิงจากแผนการสอนที่มีการใช้สื่อและเทคโนโลยี</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4">`;
content = content.replace(metric22Old, metric22New);

// Update detailed tabs
const tabStd1Old = `<h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 1: คุณภาพของผู้เรียน</h2>`;
const tabStd1New = `<h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 1: {educationLevelFilter === 'kindergarten' ? 'คุณภาพของเด็ก' : 'คุณภาพของผู้เรียน'}</h2>`;
content = content.replace(tabStd1Old, tabStd1New);

const tabStd3Old = `<h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 3: การจัดการเรียนการสอนที่เน้นผู้เรียน</h2>`;
const tabStd3New = `<h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 3: {educationLevelFilter === 'kindergarten' ? 'การจัดประสบการณ์ที่เน้นเด็กเป็นสำคัญ' : 'การจัดการเรียนการสอนที่เน้นผู้เรียน'}</h2>`;
content = content.replace(tabStd3Old, tabStd3New);

fs.writeFileSync(file, content);
console.log('Labels updated');
