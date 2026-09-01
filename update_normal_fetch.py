import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """        const activeSubject = subject === 'อื่นๆ' ? customSubject : subject;
        fetchedCurriculums = fetchedCurriculums.filter(c => {
          let cName = c.subjectName || '';
          if (!activeSubject) return false;
          
          cName = cName.replace(/[ฯ(\-]/g, '').replace(/\s+/g, '').toLowerCase();
          const aSub = activeSubject.replace(/[ฯ(\-]/g, '').replace(/\s+/g, '').toLowerCase();
          
          if (cName === aSub || cName.includes(aSub) || aSub.includes(cName)) return true;
          
          // Extra fallbacks for common subjects
          if (aSub.includes('สังคม') && cName.includes('สังคม')) return true;
          if (aSub.includes('วิทยาศาสตร์') && cName.includes('วิทยา')) return true;
          if (aSub.includes('การงาน') && cName.includes('การงาน')) return true;
          if (aSub.includes('ประวัติ') && cName.includes('ประวัติ')) return true;
          if (aSub.includes('ศิลปะ') && (cName.includes('ศิลป์') || cName.includes('ศิลปะ'))) return true;
          if (aSub.includes('คอมพิวเตอร์') && cName.includes('คำนวณ')) return true;
          
          return false;
        });"""
        
    new_logic = """        const activeSubject = subject === 'อื่นๆ' ? customSubject : subject;
        let subjectsArray = [activeSubject];
        if (isIntegrated && integratedSubjects) {
           subjectsArray = [...subjectsArray, ...integratedSubjects.split(',').map(s => s.trim()).filter(Boolean)];
        }
        
        fetchedCurriculums = fetchedCurriculums.filter(c => {
          let cName = c.subjectName || '';
          if (!activeSubject) return false;
          
          cName = cName.replace(/[ฯ(\-]/g, '').replace(/\s+/g, '').toLowerCase();
          
          return subjectsArray.some(s => {
            const aSub = s.replace(/[ฯ(\-]/g, '').replace(/\s+/g, '').toLowerCase();
            if (cName === aSub || cName.includes(aSub) || aSub.includes(cName)) return true;
            if (aSub.includes('สังคม') && cName.includes('สังคม')) return true;
            if (aSub.includes('วิทยาศาสตร์') && cName.includes('วิทยา')) return true;
            if (aSub.includes('การงาน') && cName.includes('การงาน')) return true;
            if (aSub.includes('ประวัติ') && cName.includes('ประวัติ')) return true;
            if (aSub.includes('ศิลปะ') && (cName.includes('ศิลป์') || cName.includes('ศิลปะ'))) return true;
            if (aSub.includes('คอมพิวเตอร์') && cName.includes('คำนวณ')) return true;
            return false;
          });
        });"""
        
    code = code.replace(old_logic, new_logic)
    
    # Update dependencies
    old_deps = "  }, [subject, customSubject, selectedGrades, semester, teacherId, initialPlan]);"
    new_deps = "  }, [subject, customSubject, isIntegrated, integratedSubjects, selectedGrades, semester, teacherId, initialPlan]);"
    code = code.replace(old_deps, new_deps)
    
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonPlanForm.tsx')
