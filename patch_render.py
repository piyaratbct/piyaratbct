import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """        ) : activeModule === "admin" ? (
          <UserManagementModule
            teachers={teachers}
            records={records}
            currentTeacher={currentTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onUpdateTeacher={handleUpdateTeacher}
          />
        ) : null}"""

replacement = """        ) : activeModule === "admin" ? (
          <UserManagementModule
            teachers={teachers}
            records={records}
            currentTeacher={currentTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onUpdateTeacher={handleUpdateTeacher}
          />
        ) : activeModule === "discipline" ? (
          <DisciplineModule
            currentTeacher={currentTeacher}
            systemSemester={systemSemester}
            systemAcademicYear={systemAcademicYear}
            students={students}
          />
        ) : null}"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced render successfully")
else:
    print("Target render not found")
    
with open('src/App.tsx', 'w') as f:
    f.write(content)
