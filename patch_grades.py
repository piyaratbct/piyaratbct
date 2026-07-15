import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = """export const GRADE_LEVELS = [
  'ประถมศึกษาปีที่ 1/1',
  'ประถมศึกษาปีที่ 1/2',
  'ประถมศึกษาปีที่ 2/1',
  'ประถมศึกษาปีที่ 2/2',
  'ประถมศึกษาปีที่ 3',
  'ประถมศึกษาปีที่ 4',
  'ประถมศึกษาปีที่ 5',
  'ประถมศึกษาปีที่ 6'
];"""

replacement = """export const GRADE_LEVELS = [
  'อนุบาล 1',
  'อนุบาล 2',
  'อนุบาล 3',
  'ประถมศึกษาปีที่ 1/1',
  'ประถมศึกษาปีที่ 1/2',
  'ประถมศึกษาปีที่ 2/1',
  'ประถมศึกษาปีที่ 2/2',
  'ประถมศึกษาปีที่ 3',
  'ประถมศึกษาปีที่ 4',
  'ประถมศึกษาปีที่ 5',
  'ประถมศึกษาปีที่ 6'
];"""

content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)
