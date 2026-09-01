with open('src/components/LessonLogForm.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "const [evaluations," in line and "importedDesirable" not in line:
        # wait, the original was split:
        pass
        
    if "const [evaluations," in line:
        skip = True
        new_lines.append("  const [evaluations, setEvaluations] = useState<{ planning: Record<string, number>; time: Record<string, number>; media: Record<string, number>; teacher: Record<string, number>; learner: Record<string, number>; }>(DEFAULT_EVALUATIONS);\n")
        continue
    
    if skip:
        if "setEvaluations] = useState" in line:
            skip = False
        continue
        
    new_lines.append(line)
    
with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.writelines(new_lines)
