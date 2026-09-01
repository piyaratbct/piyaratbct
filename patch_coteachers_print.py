import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """            <p
              className={`font-medium text-slate-900 ${isCompact ? "text-sm" : "text-base"}`}
            >
              {teacher.thaiName || teacher.displayName}
            </p>
          </div>"""

    new_logic = """            <p
              className={`font-medium text-slate-900 ${isCompact ? "text-sm" : "text-base"}`}
            >
              {teacher.thaiName || teacher.displayName}
            </p>
            {plan.coTeacherNames && plan.coTeacherNames.length > 0 && (
              <p className={`text-slate-600 mt-1 leading-snug ${isCompact ? "text-[10px]" : "text-xs"}`}>
                <span className="font-bold text-pink-700">ร่วมสอน:</span> {plan.coTeacherNames.join(", ")}
              </p>
            )}
          </div>"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching print template")
    else:
        print("Pattern not found in print template")

fix('src/components/LessonPlanPrintTemplate.tsx')
