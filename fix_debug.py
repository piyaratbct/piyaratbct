import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Regex to remove the debug div completely regardless of exact indentation
    pattern = r'\s*<div className="w-full bg-red-100 p-2 mb-2 text-xs text-red-800 break-all">\s*DEBUG: allAssessments=\{allAssessments\.length\},\s*selectedMonth=\{selectedMonth\},\s*systemYear=\{systemAcademicYear\},\s*systemSemester=\{systemSemester\},\s*sample=\{JSON\.stringify\(allAssessments\.slice\(0, 3\)\.map\(a => \(\{month: a\.month, year: a\.academicYear, sem: a\.semester\}\)\)\)\}\s*</div>'
    
    code = re.sub(pattern, '', code)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/ClassroomModule.tsx')
