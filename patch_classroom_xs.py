import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_row = """                          <div className="shrink-0 scale-75 origin-left">
                            <AvatarUpload url={ht.photoURL} name={ht.thaiName || ht.displayName} size="sm" editable={false} onUpload={async () => {}} />
                          </div>"""
                          
    new_row = """                          <div className="shrink-0 flex items-center">
                            <AvatarUpload url={ht.photoURL} name={ht.thaiName || ht.displayName} size="xs" editable={false} onUpload={async () => {}} />
                          </div>"""
                          
    if old_row in code:
        code = code.replace(old_row, new_row)
        with open(filename, 'w') as f:
            f.write(code)
        print("Updated ClassroomModule to xs")
    else:
        print("ClassroomModule xs row not found")

fix('src/components/ClassroomModule.tsx')
