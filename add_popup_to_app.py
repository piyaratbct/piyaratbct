import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add import
import_statement = "import { DailyNotificationPopup } from './components/DailyNotificationPopup';"
if import_statement not in content:
    content = content.replace(
        "import { AcademicModule } from \"./components/AcademicModule\";",
        "import { AcademicModule } from \"./components/AcademicModule\";\nimport { DailyNotificationPopup } from \"./components/DailyNotificationPopup\";"
    )

# 2. Add component rendering inside AuthWrapper or just above the <main> block
old_main = '<main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 mt-16">'
new_main = """<main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 mt-16">
        <DailyNotificationPopup 
          currentTeacher={currentTeacher} 
          systemAcademicYear={systemAcademicYear} 
          systemSemester={systemSemester} 
          onNavigateToSchedule={() => setActiveModule("academic")}
          onNavigateToCalendar={() => setActiveModule("academic")}
        />"""

if '<DailyNotificationPopup' not in content:
    content = content.replace(old_main, new_main)

with open('src/App.tsx', 'w') as f:
    f.write(content)
