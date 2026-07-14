import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """interface ClassroomModuleProps {
  currentTeacher: Teacher | null;
  systemAcademicYear?: string;
  systemSemester?: string;
}

export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "ภาคเรียนที่ 1/2567",
}) => {"""

replacement = """interface ClassroomModuleProps {
  currentTeacher: Teacher | null;
  systemAcademicYear?: string;
  systemSemester?: string;
  teachers?: Teacher[];
}

export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "ภาคเรียนที่ 1/2567",
  teachers = [],
}) => {"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

target_app = """        ) : activeModule === "classroom" ? (
          <ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
          />"""

replacement_app = """        ) : activeModule === "classroom" ? (
          <ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
            teachers={teachers}
          />"""

app_content = app_content.replace(target_app, replacement_app)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
