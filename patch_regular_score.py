import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

old_func = """      updated.totalScore = 
        (updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0);
      updated.grade = calculateGrade(updated.totalScore);"""

new_func = """      updated.totalScore = 
        Math.round((updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0));
      updated.grade = calculateGrade(updated.totalScore);"""

content = content.replace(old_func, new_func)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)

