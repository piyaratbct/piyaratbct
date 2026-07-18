with open('src/components/SubjectSettingsModal.tsx', 'r') as f:
    content = f.read()

# Remove the validations
content = content.replace(
"""    if (sumBMK > 20) return setError("ความรู้ก่อนกลางภาค รวมคะแนนเต็มต้องไม่เกิน 20");
    if (sumBMS > 10) return setError("จิตพิสัยก่อนกลางภาค รวมคะแนนเต็มต้องไม่เกิน 10");
    if (sumAMK > 20) return setError("ความรู้หลังกลางภาค รวมคะแนนเต็มต้องไม่เกิน 20");
    if (sumAMS > 10) return setError("จิตพิสัยหลังกลางภาค รวมคะแนนเต็มต้องไม่เกิน 10");""",
""
)

# Update the display logic
content = content.replace(
"""          <div className={`text-sm font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-600'}`}>
            รวม: {currentSum} / {maxTotal}
          </div>""",
"""          <div className={`text-sm font-bold text-slate-600 text-right`}>
            ดิบรวม: {currentSum}
            <div className="text-xs font-normal text-slate-400">ระบบจะแปลงสัดส่วนให้เป็น {maxTotal}</div>
          </div>"""
)

# Remove isExceeded condition from the border
content = content.replace(
"""<div className={`p-4 rounded-xl border ${isExceeded ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}>""",
"""<div className={`p-4 rounded-xl border border-slate-200 bg-white`}>"""
)

with open('src/components/SubjectSettingsModal.tsx', 'w') as f:
    f.write(content)

