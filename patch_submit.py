import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()
        
    old_code = """      evaluations,
      attachments,"""
      
    new_code = """      evaluations,
      attachments,
      importedDesirable,
      studentDesirableScores,"""
      
    if old_code in code:
        code = code.replace(old_code, new_code)
        with open(filename, 'w') as f:
            f.write(code)

fix('src/components/LessonLogForm.tsx')
fix('src/components/PBLLessonLogForm.tsx')
