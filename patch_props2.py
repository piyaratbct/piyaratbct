import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """interface ClassroomModuleProps {
  currentTeacher: Teacher | null;
  systemAcademicYear?: string;
  systemSemester?: string;
}"""
replacement1 = """interface ClassroomModuleProps {
  currentTeacher: Teacher | null;
  systemAcademicYear?: string;
  systemSemester?: string;
  teachers?: Teacher[];
}"""
content = content.replace(target1, replacement1)

target2 = """export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "ภาคเรียนที่ 1/2567",
}) => {"""
replacement2 = """export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "ภาคเรียนที่ 1/2567",
  teachers = [],
}) => {"""
content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

target_app = """          <ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
          />"""
replacement_app = """          <ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
            teachers={teachers}
          />"""
app_content = app_content.replace(target_app, replacement_app)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
