import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("useState<number | ''>(student.weight || '');", "useState<number | ''>(existingAssessment.weight !== undefined ? existingAssessment.weight : (student.weight || ''));")
content = content.replace("useState<number | ''>(student.height || '');", "useState<number | ''>(existingAssessment.height !== undefined ? existingAssessment.height : (student.height || ''));")

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
