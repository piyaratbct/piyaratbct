import re

with open('src/components/PBLLessonLogForm.tsx', 'r') as f:
    code = f.read()

# 1. Update state
target1 = '  const subject = "บูรณาการ (PBL)";'
replacement1 = '  const [subject, setSubject] = useState<string>(initialRecord?.subject || "บูรณาการ (PBL)");'
code = code.replace(target1, replacement1)

# 2. Update handleImportPlan
target2 = """    if (plan.customSubject) {
      setCustomSubject(plan.customSubject);
    } else if (plan.subject && plan.subject !== "บูรณาการ (PBL)" && plan.subject !== "อื่นๆ") {
      setCustomSubject(plan.subject);
    }"""
replacement2 = """    if (plan.subject) {
      setSubject(plan.subject);
    }
    if (plan.customSubject) {
      setCustomSubject(plan.customSubject);
    } else {
      setCustomSubject('');
    }"""
code = code.replace(target2, replacement2)

# 3. Update payload
target3 = """      subject: "บูรณาการ (PBL)",
      customSubject,"""
replacement3 = """      subject: subject,
      customSubject: (subject === 'อื่นๆ' || subject === 'บูรณาการ (PBL)') ? customSubject : undefined,"""
code = code.replace(target3, replacement3)

# 4. Update JSX
target4 = """          <div>
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
          </div>"""
replacement4 = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วิชาหลัก (Main Subject)
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
            {(subject === 'อื่นๆ' || subject === 'บูรณาการ (PBL)') && (
              <input
                type="text"
                placeholder={subject === "บูรณาการ (PBL)" ? "ระบุวิชาหลัก..." : "ระบุวิชาอื่นๆ..."}
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            )}
          </div>"""
code = code.replace(target4, replacement4)

with open('src/components/PBLLessonLogForm.tsx', 'w') as f:
    f.write(code)

print("Patched PBLLessonLogForm.tsx")
