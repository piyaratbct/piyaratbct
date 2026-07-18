with open('src/components/DashboardStats.tsx', 'r') as f:
    content = f.read()

import re

# Find subjectDistribution block
old_block = """  const subjectDistribution = SUBJECTS.map(subj => {
    const logs = records.filter(p => p.subject === subj);
    return {
      name: subj,
      count: logs.length,
      percentage: totalLogs > 0 ? (logs.length / totalLogs) * 100 : 0
    };
  }).filter(item => item.count > 0 || item.name === 'ภาษาไทย' || item.name === 'คณิตศาสตร์' || item.name === 'วิทยาศาสตร์และเทคโนโลยี');"""

new_block = """  const WEEKS_PER_SEMESTER = 20; // จำนวนสัปดาห์ใน 1 ภาคเรียน (โดยประมาณ)
  const allSubjects = new Set([
    ...records.map(r => r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject),
    ...schedules.map(s => s.subject)
  ]);

  const subjectDistribution = Array.from(allSubjects).map(subj => {
    const logs = records.filter(p => (p.subject === 'อื่นๆ' && p.customSubject === subj) || p.subject === subj);
    const scheduledPeriodsPerWeek = schedules.filter(s => s.subject === subj).length;
    const expectedTotalPeriods = scheduledPeriodsPerWeek * WEEKS_PER_SEMESTER;
    
    const hasSchedule = expectedTotalPeriods > 0;
    const percentage = hasSchedule 
      ? Math.min((logs.length / expectedTotalPeriods) * 100, 100) 
      : (totalLogs > 0 ? (logs.length / totalLogs) * 100 : 0);

    return {
      name: subj,
      count: logs.length,
      expected: expectedTotalPeriods,
      percentage: percentage,
      hasSchedule: hasSchedule
    };
  }).sort((a, b) => b.percentage - a.percentage); // เรียงตามเปอร์เซ็นต์ความคืบหน้า"""

content = content.replace(old_block, new_block)

# Find UI block
old_ui_block = """                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="text-slate-900 font-bold">{item.count} ครั้ง ({Math.round(item.percentage)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${item.percentage || 1}%` }}
                      ></div>
                    </div>
                  </div>"""

new_ui_block = """                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600">{item.name} {item.hasSchedule && <span className="text-xs text-slate-400 font-normal ml-1">(ตามตารางสอน)</span>}</span>
                      <span className="text-slate-900 font-bold">
                        {item.count} {item.hasSchedule ? `/ ${item.expected}` : ''} ครั้ง ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${item.percentage || 1}%` }}
                      ></div>
                    </div>
                  </div>"""

content = content.replace(old_ui_block, new_ui_block)

with open('src/components/DashboardStats.tsx', 'w') as f:
    f.write(content)
