import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. Add Import
if "import { HealthPrintTemplate }" not in content:
    content = content.replace(
        'import { AssessmentPrintTemplate } from "./AssessmentPrintTemplate";',
        'import { AssessmentPrintTemplate } from "./AssessmentPrintTemplate";\nimport { HealthPrintTemplate } from "./HealthPrintTemplate";'
    )

# 2. Add state
if "const [printHealthStudents, setPrintHealthStudents] = useState<Student[] | null>(null);" not in content:
    content = content.replace(
        'const [printStudents, setPrintStudents] = useState<Student[] | null>(null);',
        'const [printStudents, setPrintStudents] = useState<Student[] | null>(null);\n  const [printHealthStudents, setPrintHealthStudents] = useState<Student[] | null>(null);'
    )

# 3. Add print function
if "const printBatchHealthReport = () => {" not in content:
    content = content.replace(
        'const printBatchReport = () => {',
        """const printBatchHealthReport = () => {
    setPrintHealthStudents(students);
  };

  const printSingleHealthReport = (student: Student) => {
    setPrintHealthStudents([student]);
  };

  const printBatchReport = () => {"""
    )

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
