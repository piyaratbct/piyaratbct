import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Remove the AvatarUpload import
    code = code.replace("import { AvatarUpload } from './AvatarUpload';\n", "")

    # Remove the avatar upload block in StaffManager
    pattern = r'<div className="shrink-0">\s*<AvatarUpload[^>]+/>\s*</div>'
    
    code = re.sub(pattern, '', code)
    
    with open(filename, 'w') as f:
        f.write(code)
    print("Updated StaffManager")

fix('src/components/StaffManager.tsx')
