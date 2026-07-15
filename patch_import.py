with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = "Wrench,"
replacement = "Wrench, AlertCircle,"

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
