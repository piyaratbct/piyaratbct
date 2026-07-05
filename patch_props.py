import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Replace students={students} with students={studentsInGrade} where appropriate
target1 = '''              ) : (
                <AttendanceTracking 
                  students={students}
                  gradeLevel={selectedGrade}'''
replacement1 = '''              ) : (
                <AttendanceTracking 
                  students={studentsInGrade}
                  gradeLevel={selectedGrade}'''
content = content.replace(target1, replacement1)

target2 = '''        {showBatchPromotion && (
          <BatchPromotionModal
            students={students}
            currentGrade={selectedGrade}'''
replacement2 = '''        {showBatchPromotion && (
          <BatchPromotionModal
            students={studentsInGrade}
            currentGrade={selectedGrade}'''
content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
