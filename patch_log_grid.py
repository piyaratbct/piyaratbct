import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    code = f.read()

target = """        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className={`grid grid-cols-1 ${isIntegrated ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
          {!isIntegrated && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                กลุ่มสาระ / วิชาที่สอน
              </label>"""

replacement = """        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              กลุ่มสาระ / วิชาที่สอน
            </label>"""

code = code.replace(target, replacement)

target2 = """              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา"""

replacement2 = """              )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา"""

code = code.replace(target2, replacement2)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(code)

print("Updated LessonLogForm Grid")
