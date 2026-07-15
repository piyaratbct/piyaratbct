with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = "colSpan={displayMonths.length * 3 + 3}"
replacement = "colSpan={availableMonths.slice(0, 4).length * 3 + 3}"

if target in content:
    content = content.replace(target, replacement)
    print("FIXED displayMonths")
else:
    print("NOT FOUND displayMonths")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
