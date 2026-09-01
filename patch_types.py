import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()
        
    old_code = """  importedDesirable?: string[];
  studentDesirableScores?: Record<string, Record<string, number>>;"""
  
    new_code = """  importedDesirable?: string[];
  studentDesirableScores?: Record<string, Record<string, number>>;
  importedIndicators?: string[];
  studentIndicatorScores?: Record<string, Record<string, number>>;
  importedCompetencies?: string[];
  studentCompetencyScores?: Record<string, Record<string, number>>;"""
  
    if old_code in code:
        code = code.replace(old_code, new_code)
        with open(filename, 'w') as f:
            f.write(code)

fix('src/types.ts')
