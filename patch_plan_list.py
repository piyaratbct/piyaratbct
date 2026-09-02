import re

with open('src/components/LessonPlanList.tsx', 'r') as f:
    code = f.read()

target = """                        {plan.subject === "อื่น ๆ"
                          ? plan.customSubject
                          : plan.subject}"""

replacement = """                        {(plan.subject === "อื่น ๆ" || plan.subject === "อื่นๆ" || plan.subject === "บูรณาการ (PBL)") && plan.customSubject
                          ? plan.customSubject
                          : plan.subject}"""

code = code.replace(target, replacement)

with open('src/components/LessonPlanList.tsx', 'w') as f:
    f.write(code)

print("Updated LessonPlanList.tsx")
