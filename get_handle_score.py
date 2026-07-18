import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

start_str = "const handleActivityScoreChange = (studentId: string, category:"
start_idx = content.find(start_str)

if start_idx != -1:
    count = 1
    i = start_idx + len(start_str)
    while count > 0 and i < len(content):
        if content[i] == '{':
            count += 1
        elif content[i] == '}':
            count -= 1
        i += 1
    
    print(content[start_idx:i])

