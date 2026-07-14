import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target2 = """export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "1",
}) => {"""
replacement2 = """export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "1",
  teachers = [],
}) => {"""
content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
