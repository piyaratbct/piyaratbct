const fs = require('fs');
let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

if (!content.includes('const totalTeachingDays = Object.values(teachingDaysCount).reduce')) {
  // Add a display for total teaching days to the UI
  content = content.replace(
    /<h4 className="font-bold text-slate-800 mb-2">สถิติวันเรียนในภาคเรียนนี้ \(หลังหักวันหยุด\)<\/h4>/,
    `<div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-800">สถิติวันเรียนในภาคเรียนนี้ (หลังหักวันหยุด)</h4>
                {teachingDaysCount && (
                   <div className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                     รวมทั้งหมด: {Object.values(teachingDaysCount).reduce((a, b) => a + b, 0)} วัน
                   </div>
                )}
              </div>`
  );
  fs.writeFileSync('src/components/ScheduleManager.tsx', content);
  console.log('Added total teaching days to ScheduleManager summary');
}
