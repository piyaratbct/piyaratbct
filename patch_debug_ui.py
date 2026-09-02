import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Find the UI part to inject debug info
    old_ui = """                <div className="flex flex-col md:flex-row md:items-center gap-3">"""
  
    new_ui = """                <div className="w-full bg-red-100 p-2 mb-2 text-xs text-red-800 break-all">
                  DEBUG: allAssessments={allAssessments.length}, 
                  selectedMonth={selectedMonth}, 
                  systemYear={systemAcademicYear}, 
                  systemSemester={systemSemester},
                  sample={JSON.stringify(allAssessments.slice(0, 3).map(a => ({month: a.month, year: a.academicYear, sem: a.semester})))}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">"""

    if old_ui in code:
        code = code.replace(old_ui, new_ui)
        with open(filename, 'w') as f:
            f.write(code)
    else:
        print("Not found")

fix('src/components/ClassroomModule.tsx')
