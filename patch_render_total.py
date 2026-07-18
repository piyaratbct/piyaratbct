import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const part1Total = (Number(score.beforeMidKnowledgeScore) || 0) + (Number(score.beforeMidSoftSkillScore) || 0) + (Number(score.afterMidKnowledgeScore) || 0) + (Number(score.afterMidSoftSkillScore) || 0);",
    "const part1Total = Number(((Number(score.beforeMidKnowledgeScore) || 0) + (Number(score.beforeMidSoftSkillScore) || 0) + (Number(score.afterMidKnowledgeScore) || 0) + (Number(score.afterMidSoftSkillScore) || 0)).toFixed(2));"
)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)

