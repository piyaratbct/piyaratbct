import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

# Update initial selectedGrade state
old_state = "const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);"
new_state = "const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS.find(g => g.includes('ประถม')) || GRADE_LEVELS[0]);"
content = content.replace(old_state, new_state)

# Filter the select options
old_select = """                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}"""
new_select = """                    {GRADE_LEVELS.filter(g => g.includes('ประถม')).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}"""
content = content.replace(old_select, new_select)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)

