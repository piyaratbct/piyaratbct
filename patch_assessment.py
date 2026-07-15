import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

# 1. Update interface
content = content.replace("  onSave: (assessment: StudentAssessment) => void;", "  onSave: (assessment: StudentAssessment, weight?: number, height?: number) => void;")

# 2. Add state
state_target = "  const [formData, setFormData] =\n    useState<StudentAssessment>(existingAssessment);"
state_replacement = """  const [formData, setFormData] =
    useState<StudentAssessment>(existingAssessment);
  const [weight, setWeight] = useState<number | ''>(student.weight || '');
  const [height, setHeight] = useState<number | ''>(student.height || '');"""
content = content.replace(state_target, state_replacement)

# 3. Update onSave call
save_target = "onClick={() => onSave(formData)}"
save_replacement = "onClick={() => onSave(formData, weight === '' ? undefined : Number(weight), height === '' ? undefined : Number(height))}"
content = content.replace(save_target, save_replacement)

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
