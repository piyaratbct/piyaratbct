import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """              let autoCols = 0;
              for (const ev of autoEvals) { 
                 if (!ev.name || ev.name.trim() === '') continue;"""

    new_logic = """              let autoCols = 0;
              for (const ev of autoEvals) { 
                 if (!ev.name || ev.name.trim() === '') continue;
                 
                 // Check if this evaluation belongs to the current subject being processed
                 const targetSubj = ev.targetSubject || plan.subject;
                 if (targetSubj !== subject) continue;"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching App.tsx")
    else:
        print("Pattern not found in App.tsx")

fix('src/App.tsx')
