import re

# 1. Update PrintTemplate.tsx
with open('src/components/PrintTemplate.tsx', 'r') as f:
    code = f.read()

target1 = """            <div className="flex items-baseline gap-1.5 font-sans">
              <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">วิชาที่สอน:</span>
              <span className={`font-bold text-indigo-950 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>
                {record.subject === 'อื่นๆ' && record.customSubject ? record.customSubject : record.subject}
              </span>
            </div>"""

replacement1 = """            <div className="flex items-baseline gap-1.5 font-sans">
              <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">วิชาที่สอน:</span>
              <span className={`font-bold text-indigo-950 flex flex-wrap gap-1 items-center ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>
                <span>{(record.subject === 'อื่นๆ' || record.subject === 'บูรณาการ (PBL)' || record.subject === 'อื่น ๆ') && record.customSubject ? record.customSubject : record.subject}</span>
                {record.isIntegrated && record.integratedSubjects && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 leading-none">
                    บูรณาการ: {record.integratedSubjects}
                  </span>
                )}
              </span>
            </div>"""

code = code.replace(target1, replacement1)
with open('src/components/PrintTemplate.tsx', 'w') as f:
    f.write(code)

# 2. Update LessonPlanPrintTemplate.tsx
with open('src/components/LessonPlanPrintTemplate.tsx', 'r') as f:
    code = f.read()

target2 = """                {plan.subject === "อื่นๆ" || plan.subject === "อื่น ๆ" ? plan.customSubject : plan.subject}{" "}
                ระดับชั้น {plan.gradeLevel.replace(/\s*\(.*?\)/g, "")}
              </p>
              {plan.isIntegrated && plan.integratedSubjects && (
                <p className={`${isCompact ? "text-xs" : "text-sm"} text-emerald-700 bg-emerald-50 inline-block px-4 py-1 rounded-full border border-emerald-100`}>
                  บูรณาการรายวิชา: {plan.integratedSubjects}
                </p>
              )}"""

replacement2 = """                {(plan.subject === "อื่นๆ" || plan.subject === "อื่น ๆ" || plan.subject === "บูรณาการ (PBL)") && plan.customSubject ? plan.customSubject : plan.subject}{" "}
                ระดับชั้น {plan.gradeLevel.replace(/\s*\(.*?\)/g, "")}
              </p>
              {plan.isIntegrated && plan.integratedSubjects && (
                <p className={`${isCompact ? "text-xs" : "text-sm"} text-emerald-700 bg-emerald-50 inline-block px-4 py-1 rounded-full border border-emerald-100`}>
                  บูรณาการรายวิชา: {plan.integratedSubjects}
                </p>
              )}"""

code = code.replace(target2, replacement2)
with open('src/components/LessonPlanPrintTemplate.tsx', 'w') as f:
    f.write(code)

print("Updated print templates!")
