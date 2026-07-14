import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

target_format = """const formatShortGrade = (grade: string) => {"""
replacement_format = """const formatPeriodHeader = (period: string) => {
  const match = period.match(/(.*?)\s*\((.*?)\)/);
  if (match) {
    return (
      <div className="flex flex-col items-center leading-tight">
        <span>{match[1].replace('กิจกรรม', '')}</span>
        <span className="text-[10px] text-slate-500 font-normal mt-0.5">{match[2].replace(' น.', '')}</span>
      </div>
    );
  }
  return period;
};

const formatShortGrade = (grade: string) => {"""
content = content.replace(target_format, replacement_format)

target_th = """                      {periods.map(period => (
                        <th key={period} className="p-3 text-center font-bold text-slate-700 text-sm border-r border-slate-200 min-w-[120px]">{period}</th>
                      ))}"""

replacement_th = """                      {periods.map(period => (
                        <th key={period} className="p-2 text-center font-bold text-slate-700 text-sm border-r border-slate-200 min-w-[100px]">
                          {formatPeriodHeader(period)}
                        </th>
                      ))}"""
content = content.replace(target_th, replacement_th)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

