import re

with open('src/components/Student360.tsx', 'r') as f:
    code = f.read()

# 1. Imports
if 'AvatarUpload' not in code:
    code = code.replace("import { PrintTemplate } from './PrintTemplate';", "import { PrintTemplate } from './PrintTemplate';\nimport { AvatarUpload } from './AvatarUpload';")

# 2. Add to UI
ui_target = """                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center shadow-sm">
                    <User className="w-10 h-10 text-indigo-400" />
                  </div>
                </div>"""

ui_replacement = """                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white flex items-center justify-center shadow-sm relative overflow-hidden">
                    <AvatarUpload
                      url={student.photoURL}
                      name={student.firstName || '?'}
                      size="xl"
                      editable={false}
                      onUpload={async () => {}}
                    />
                  </div>
                </div>"""

code = code.replace(ui_target, ui_replacement)

with open('src/components/Student360.tsx', 'w') as f:
    f.write(code)

print("Student360 patched!")
