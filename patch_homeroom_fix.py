import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  const maleCount = countSource.filter((s) => s.gender === "male").length;
  const femaleCount = countSource.filter((s) => s.gender === "female").length;"""

replacement = """  const maleCount = countSource.filter((s) => s.gender === "male").length;
  const femaleCount = countSource.filter((s) => s.gender === "female").length;

  const homeroomTeachers = teachers.filter(
    (t) => t.homeroomClass === selectedGrade || t.coHomeroomClass === selectedGrade
  );"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
