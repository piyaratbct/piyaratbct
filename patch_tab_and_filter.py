import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Fix the button text
content = content.replace('<span className="whitespace-nowrap">พัฒนาการทางร่างกาย</span>', '<span className="whitespace-nowrap truncate text-sm">พัฒนาการร่างกาย</span>')

# Fix the month filter visibility condition
content = content.replace("activeTab === 'assessments' || activeTab === 'special-care'", "activeTab === 'assessments' || activeTab === 'health-report'")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
