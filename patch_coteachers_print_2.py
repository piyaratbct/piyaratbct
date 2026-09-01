import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """            {plan.coTeacherNames && plan.coTeacherNames.length > 0 && (
              <p className={`text-slate-600 mt-1 leading-snug ${isCompact ? "text-[10px]" : "text-xs"}`}>
                <span className="font-bold text-pink-700">ร่วมสอน:</span> {plan.coTeacherNames.join(", ")}
              </p>
            )}"""

    new_logic = """            {((plan.coTeacherNames && plan.coTeacherNames.length > 0) || (plan.coTeachers && plan.coTeachers.length > 0)) && (
              <p className={`text-slate-600 mt-1 leading-snug ${isCompact ? "text-[10px]" : "text-xs"}`}>
                <span className="font-bold text-pink-700">ร่วมสอน:</span> {
                  (plan.coTeacherNames && plan.coTeacherNames.length > 0) 
                    ? plan.coTeacherNames.join(", ")
                    : plan.coTeachers?.map(id => {
                        const t = allTeachers.find(t => t.id === id);
                        return t ? (t.thaiName || t.displayName) : id;
                      }).join(", ")
                }
              </p>
            )}"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching print template 2")
    else:
        print("Pattern not found in print template 2")

fix('src/components/LessonPlanPrintTemplate.tsx')
