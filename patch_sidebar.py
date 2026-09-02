import re

with open('src/components/Student360.tsx', 'r') as f:
    code = f.read()

target = """                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>"""

replacement = """                        <div className="shrink-0 flex items-center justify-center">
                          <AvatarUpload url={s.photoURL} name={s.firstName || '?'} size="sm" />
                        </div>"""

code = code.replace(target, replacement)

with open('src/components/Student360.tsx', 'w') as f:
    f.write(code)

print("Successfully replaced sidebar avatar")
