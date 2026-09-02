import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    if "AvatarUpload" not in code:
        code = code.replace("import { Teacher, ", "import { AvatarUpload } from './AvatarUpload';\nimport { Teacher, ")

    old_row = """                          <div className="h-4 w-4 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-[9px]">{ht.thaiName.charAt(0)}</span>
                          </div>"""
                          
    new_row = """                          <div className="shrink-0 scale-75 origin-left">
                            <AvatarUpload url={ht.photoURL} name={ht.thaiName || ht.displayName} size="sm" editable={false} onUpload={async () => {}} />
                          </div>"""
                          
    if old_row in code:
        code = code.replace(old_row, new_row)
        with open(filename, 'w') as f:
            f.write(code)
        print("Updated ClassroomModule")
    else:
        print("ClassroomModule row not found")

fix('src/components/ClassroomModule.tsx')
