with open('src/components/DashboardStats.tsx', 'r') as f:
    content = f.read()

import re

old_block = """  const allSubjects = new Set([
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

new_block = """  const allSubjectGrades = new Set([
    ...records.map(r => {
      const subj = r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject;
      const grade = r.gradeLevel || 'ไม่ระบุชั้น';
      return `${subj}|${grade}`;
    }),
    ...schedules.map(s => {
      const subj = s.subject;
      const grade = s.gradeLevel || 'ไม่ระบุชั้น';
      return `${subj}|${grade}`;
    })
  ]);

  const subjectDistribution = Array.from(allSubjectGrades).map(key => {
    const [subj, grade] = key.split('|');
    const logs = records.filter(p => 
      ((p.subject === 'อื่นๆ' && p.customSubject === subj) || p.subject === subj) && 
      (p.gradeLevel === grade || (!p.gradeLevel && grade === 'ไม่ระบุชั้น'))
    );
    const scheduledPeriodsPerWeek = schedules.filter(s => s.subject === subj && (s.gradeLevel === grade || (!s.gradeLevel && grade === 'ไม่ระบุชั้น'))).length;
    const expectedTotalPeriods = scheduledPeriodsPerWeek * WEEKS_PER_SEMESTER;
    
    const hasSchedule = expectedTotalPeriods > 0;
    const percentage = hasSchedule 
      ? Math.min((logs.length / expectedTotalPeriods) * 100, 100) 
      : (totalLogs > 0 ? (logs.length / totalLogs) * 100 : 0);

    return {
      key: key,
      name: subj,
      grade: grade,
      count: logs.length,
      expected: expectedTotalPeriods,
      percentage: percentage,
      hasSchedule: hasSchedule
    };
  }).sort((a, b) => {
    if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
    return a.name.localeCompare(b.name);
  });"""

content = content.replace(old_block, new_block)

old_ui_block = """                  <div key={item.name} className="space-y-1">
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

new_ui_block = """                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600">
                        {item.name} <span className="text-indigo-600 font-bold ml-1">({item.grade})</span>
                        {item.hasSchedule && <span className="text-xs text-slate-400 font-normal ml-1">(ตามตารางสอน)</span>}
                      </span>
                      <span className="text-slate-900 font-bold">
                        {item.count} {item.hasSchedule ? `/ ${item.expected}` : ''} คาบ ({Math.round(item.percentage)}%)
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
