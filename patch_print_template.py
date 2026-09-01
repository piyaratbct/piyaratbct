import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """          subtitle={
            <p
              className={`${isCompact ? "text-sm" : "text-base"} text-sky-800 bg-sky-50 inline-block px-4 py-1 rounded-full border border-sky-100`}
            >
              กลุ่มสาระการเรียนรู้{" "}
              {plan.subject === "อื่นๆ" || plan.subject === "อื่น ๆ" ? plan.customSubject : plan.subject}{" "}
              ระดับชั้น {plan.gradeLevel.replace(/\s*\(.*?\)/g, "")}
            </p>
          }"""

    new_logic = """          subtitle={
            <div className="flex flex-col items-center gap-1.5">
              <p className={`${isCompact ? "text-sm" : "text-base"} text-sky-800 bg-sky-50 inline-block px-4 py-1 rounded-full border border-sky-100`}>
                กลุ่มสาระการเรียนรู้{" "}
                {plan.subject === "อื่นๆ" || plan.subject === "อื่น ๆ" ? plan.customSubject : plan.subject}{" "}
                ระดับชั้น {plan.gradeLevel.replace(/\\s*\\(.*?\\)/g, "")}
              </p>
              {plan.isIntegrated && plan.integratedSubjects && (
                <p className={`${isCompact ? "text-xs" : "text-sm"} text-emerald-700 bg-emerald-50 inline-block px-4 py-1 rounded-full border border-emerald-100`}>
                  บูรณาการรายวิชา: {plan.integratedSubjects}
                </p>
              )}
            </div>
          }"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching print template")
    else:
        print("Pattern not found in print template")

fix('src/components/LessonPlanPrintTemplate.tsx')
