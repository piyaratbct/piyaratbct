import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Remove the AvatarUpload import
    code = code.replace('import { AvatarUpload } from "./AvatarUpload";\n', '')

    # Remove the avatar upload block in ClassroomModule
    pattern = r'<div className="shrink-0 flex items-center">\s*<AvatarUpload[^>]+/>\s*</div>'
    
    code = re.sub(pattern, '', code)
    
    with open(filename, 'w') as f:
        f.write(code)
    print("Updated ClassroomModule")

fix('src/components/ClassroomModule.tsx')
