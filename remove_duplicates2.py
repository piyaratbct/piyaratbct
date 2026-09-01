import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    duplicate_block = """    setImportedDesirable(plan.desirableCharacteristics || []);
    
    const indicators = [];
    if (plan.coreIndicators) indicators.push(...plan.coreIndicators.split('\\n').filter(s => s.trim()));
    if (plan.targetIndicators) indicators.push(...plan.targetIndicators.split('\\n').filter(s => s.trim()));
    setImportedIndicators(indicators);
    
    const comps = [];
    if (plan.competencies) comps.push(...plan.competencies.split('\\n').filter(s => s.trim()));
    setImportedCompetencies(comps);"""
    
    double_block = duplicate_block + "\n    " + duplicate_block
    if double_block in code:
        code = code.replace(double_block, duplicate_block)
        
    double_block2 = duplicate_block + "\n" + duplicate_block
    if double_block2 in code:
        code = code.replace(double_block2, duplicate_block)
        
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonLogForm.tsx')
fix('src/components/PBLLessonLogForm.tsx')
