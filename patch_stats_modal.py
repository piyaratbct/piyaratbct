import re

with open('src/components/StudentStatsModal.tsx', 'r') as f:
    content = f.read()

target = """  const chartData = useMemo(() => {
    return Object.keys(stats).sort(sortGrades).map(grade => ({
      name: grade,"""

replacement = """  const shortenGrade = (grade: string) => {
    return grade
      .replace('อนุบาล ', 'อ.')
      .replace('อนุบาล', 'อ.')
      .replace('ประถมศึกษาปีที่ ', 'ป.')
      .replace('ประถมศึกษาปีที่', 'ป.');
  };

  const chartData = useMemo(() => {
    return Object.keys(stats).sort(sortGrades).map(grade => ({
      name: shortenGrade(grade),"""

content = content.replace(target, replacement)

with open('src/components/StudentStatsModal.tsx', 'w') as f:
    f.write(content)
