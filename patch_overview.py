import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

target1 = "export function ScheduleManager({ systemSemester, systemAcademicYear, currentTeacher }: ScheduleManagerProps) {"
replacement1 = """const formatShortGrade = (grade: string) => {
  if (!grade) return '';
  return grade
    .replace('อนุบาลปีที่ ', 'อ.')
    .replace('ประถมศึกษาปีที่ ', 'ป.')
    .replace('มัธยมศึกษาปีที่ ', 'ม.');
};

export function ScheduleManager({ systemSemester, systemAcademicYear, currentTeacher }: ScheduleManagerProps) {"""
content = content.replace(target1, replacement1)

target2 = """                                  {schedulesInPeriod.map(s => (
                                    <div key={s.id} className="bg-indigo-50 border border-indigo-100 rounded p-1.5 text-xs">
                                      <div className="font-bold text-indigo-900 truncate" title={s.teacherName}>{s.teacherName}</div>
                                      <div className="text-indigo-700 flex justify-between">
                                        <span className="truncate max-w-[60%]">{s.subject}</span>
                                        <span>{s.gradeLevel}</span>
                                      </div>
                                    </div>
                                  ))}"""

replacement2 = """                                  {schedulesInPeriod.map(s => {
                                    const teacher = teachers.find(t => t.id === s.teacherId);
                                    const displayName = teacher?.displayName || s.teacherName;
                                    return (
                                      <div key={s.id} className="bg-indigo-50 border border-indigo-100 rounded p-1.5 text-xs">
                                        <div className="font-bold text-indigo-900 truncate" title={s.teacherName}>{displayName}</div>
                                        <div className="text-indigo-700 flex justify-between gap-1 mt-0.5">
                                          <span className="truncate flex-1">{s.subject}</span>
                                          <span className="font-medium whitespace-nowrap">{formatShortGrade(s.gradeLevel)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}"""
content = content.replace(target2, replacement2)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

