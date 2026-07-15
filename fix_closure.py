with open('src/components/ClassroomModule.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '{activeTab === "health-report" && (() => {' in line:
        # replace the lines before
        lines[i-2] = '          })()}\n'
        lines[i-3] = '            );\n'
        break

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.writelines(lines)
print("FIXED")
