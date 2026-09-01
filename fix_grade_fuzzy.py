import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    bad_str = """        const normalizeGrade = (g) => {
          let str = g.split('/')[0].trim();
          str = str.replace(/^ป\.\s*/, 'ประถมศึกษาปีที่ ');
          str = str.replace(/^ม\.\s*/, 'มัธยมศึกษาปีที่ ');
          str = str.replace(/^อ\.\s*/, 'อนุบาล ');
          return str.trim();
        };
        const normalizedSelectedGrades = selectedGrades.map(normalizeGrade);
        const matchedCurriculums = fetchedCurriculums.filter(c => {
           const normC = normalizeGrade(c.gradeLevel);
           return normalizedSelectedGrades.includes(normC);
        });"""

    good_str = """        const normalizeGrade = (g) => {
          if (!g) return '';
          let str = g.split('/')[0].trim();
          str = str.replace(/^ป\.\s*/, 'ประถมศึกษาปีที่ ');
          str = str.replace(/^ม\.\s*/, 'มัธยมศึกษาปีที่ ');
          str = str.replace(/^อ\.\s*/, 'อนุบาล ');
          return str.trim();
        };
        const normalizedSelectedGrades = selectedGrades.map(normalizeGrade);
        const matchedCurriculums = fetchedCurriculums.filter(c => {
           if (!c.gradeLevel) return false;
           // handle comma-separated or dash-separated grade levels in curriculum
           const cGrades = c.gradeLevel.split(/[,]/).map(g => normalizeGrade(g.trim()));
           return normalizedSelectedGrades.some(nsg => {
             return cGrades.some(cg => cg === nsg || cg.includes(nsg) || nsg.includes(cg));
           });
        });"""
        
    code = code.replace(bad_str, good_str)
    
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonPlanForm.tsx')
fix('src/components/PBLLessonPlanForm.tsx')
