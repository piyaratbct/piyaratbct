import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    search = "export function PBLLessonLogForm({ initialRecord, teacherId, onSave, onCancel, systemAcademicYear = '2567', systemSemester = '1' }: PBLLessonLogFormProps) {"
    replace = "export function PBLLessonLogForm({ initialRecord, teacherId, onSave, onCancel, systemAcademicYear = '2567', systemSemester = '1', preloadedPlan, onClearPreloadedPlan }: PBLLessonLogFormProps) {"
    
    code = code.replace(search, replace)
        
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/PBLLessonLogForm.tsx')
