with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { formatThaiDateTime } from '../lib/dateUtils';",
    "import { formatThaiDateTime, formatThaiMonthYear } from '../lib/dateUtils';"
)

target = """              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  การประเมินประจำเดือน
                </label>
                <input
                  type="month"
                  value={formData.month || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, month: e.target.value }))
                  }
                  className="w-full max-w-xs border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                />
              </div>"""

replacement = """              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  การประเมินประจำเดือน
                </label>
                <div className="relative w-full max-w-xs">
                  <input
                    type="month"
                    value={formData.month || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, month: e.target.value }))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500 bg-white pointer-events-none">
                    {formData.month ? formatThaiMonthYear(formData.month) : "เลือกเดือน"}
                  </div>
                </div>
              </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
