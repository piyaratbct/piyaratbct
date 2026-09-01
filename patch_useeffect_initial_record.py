import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()
        
    old_code = """      if (initialRecord.evaluations) {"""
    
    new_code = """      setImportedDesirable(initialRecord.importedDesirable || []);
      setStudentDesirableScores(initialRecord.studentDesirableScores || {});
      setImportedIndicators(initialRecord.importedIndicators || []);
      setStudentIndicatorScores(initialRecord.studentIndicatorScores || {});
      setImportedCompetencies(initialRecord.importedCompetencies || []);
      setStudentCompetencyScores(initialRecord.studentCompetencyScores || {});
      
      if (initialRecord.evaluations) {"""
      
    if old_code in code:
        code = code.replace(old_code, new_code)
        with open(filename, 'w') as f:
            f.write(code)

fix('src/components/LessonLogForm.tsx')
fix('src/components/PBLLessonLogForm.tsx')
