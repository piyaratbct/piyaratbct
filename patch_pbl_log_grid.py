import re

with open('src/components/PBLLessonLogForm.tsx', 'r') as f:
    code = f.read()

target = """        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา"""

replacement = """        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วิชาหลัก (Main Subject)
            </label>
            <input
              type="text"
              placeholder="ระบุวิชาหลัก..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา"""

code = code.replace(target, replacement)

with open('src/components/PBLLessonLogForm.tsx', 'w') as f:
    f.write(code)

print("Updated PBLLessonLogForm Grid")
