import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """{isIntegrated && (
                            <div className="flex items-center gap-2">"""
    
    new_logic = """{true && (
                            <div className="flex items-center gap-2">"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching PBL form")
    else:
        print("Pattern not found in PBL form")

fix('src/components/PBLLessonPlanForm.tsx')
