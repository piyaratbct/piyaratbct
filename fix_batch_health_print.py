import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

old_logic = """  const printBatchHealthReport = () => {
    setPrintHealthStudents(students);
  };"""

new_logic = """  const printBatchHealthReport = () => {
    if (displayedStudents.length === 0) {
      alert("ไม่มีข้อมูลนักเรียนในระดับชั้นนี้");
      return;
    }
    setPrintHealthStudents(displayedStudents);
  };"""

content = content.replace(old_logic, new_logic)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
