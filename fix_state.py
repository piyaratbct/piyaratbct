import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Add state for showHistoryCompare
if "const [showHistoryCompare, setShowHistoryCompare] = useState(false);" not in content:
    content = content.replace(
        '  const [allAssessments, setAllAssessments] = useState<StudentAssessment[]>([]);',
        '  const [allAssessments, setAllAssessments] = useState<StudentAssessment[]>([]);\n  const [showHistoryCompare, setShowHistoryCompare] = useState(false);'
    )

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
