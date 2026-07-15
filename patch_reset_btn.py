import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace("selectedMonth && activeTab === 'special-care'", "selectedMonth && activeTab === 'health-report'")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
