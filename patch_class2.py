import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    code = f.read()

pattern = r'<div className="shrink-0 flex items-center">\s*<AvatarUpload[^>]+/>\s*</div>'
code = re.sub(pattern, '', code, flags=re.DOTALL)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(code)
print("Updated ClassroomModule again")

with open('src/components/StaffManager.tsx', 'r') as f:
    code = f.read()

pattern = r'<div className="shrink-0">\s*<AvatarUpload[^>]+/>\s*</div>'
code = re.sub(pattern, '', code, flags=re.DOTALL)

with open('src/components/StaffManager.tsx', 'w') as f:
    f.write(code)
print("Updated StaffManager again")
