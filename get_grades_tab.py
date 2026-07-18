import re
with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

start_idx = content.find("{activeTab === 'grades' && (")
if start_idx != -1:
    # Find matching closing bracket
    count = 1
    i = start_idx + len("{activeTab === 'grades' && (")
    while count > 0 and i < len(content):
        if content[i:i+2] == ')}':
            count -= 1
        elif content[i] == '(':
            count += 1
        elif content[i] == ')':
            count -= 1
        i += 1
    
    with open('grades_tab.txt', 'w') as f2:
        f2.write(content[start_idx:i])
