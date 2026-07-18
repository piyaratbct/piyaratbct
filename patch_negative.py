import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

# Update inputs to add min={0}
content = content.replace('type="number"', 'type="number" min={0}')

# Update handleScoreChange to prevent negative values
old_handle_score = "const numValue = value === '' ? 0 : Number(value);"
new_handle_score = """let numValue = value === '' ? 0 : Number(value);
    if (numValue < 0) numValue = 0;"""
content = content.replace(old_handle_score, new_handle_score)

# Update the inline event handlers where it's parsed
# e.g., if (val !== '' && Number(val) > act.maxScore) return;
old_check = "if (val !== '' && Number(val) > act.maxScore) return;"
new_check = "if (val !== '' && (Number(val) > act.maxScore || Number(val) < 0)) return;"
content = content.replace(old_check, new_check)

old_check_20 = "if (val !== '' && Number(val) > 20) return;"
new_check_20 = "if (val !== '' && (Number(val) > 20 || Number(val) < 0)) return;"
content = content.replace(old_check_20, new_check_20)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)
