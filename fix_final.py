with open('src/components/ClassroomModule.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '{activeTab === "health-report" && (() => {' in line:
        # Check lines before this
        # lines[i-1] is '          })()}\n'
        # lines[i-2] is '            );\n'
        if lines[i-2].strip() == ');':
            lines.insert(i-2, '            </div>\n')
            break

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.writelines(lines)
print("FIXED")
