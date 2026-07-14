import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

# 1. Add state variable
target_state = """  const [limitations, setLimitations] = useState('');
  const [suggestions, setSuggestions] = useState('');"""
replacement_state = """  const [limitations, setLimitations] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [strengths, setStrengths] = useState('');"""
content = content.replace(target_state, replacement_state)

# 2. Add to useEffect initialRecord loading
target_effect = """      setLimitations(initialRecord.limitations);
      setSuggestions(initialRecord.suggestions);"""
replacement_effect = """      setLimitations(initialRecord.limitations);
      setSuggestions(initialRecord.suggestions);
      setStrengths(initialRecord.strengths || '');"""
content = content.replace(target_effect, replacement_effect)

# 3. Add to resetForm
target_reset = """    setLimitations('');
    setSuggestions('');"""
replacement_reset = """    setLimitations('');
    setSuggestions('');
    setStrengths('');"""
content = content.replace(target_reset, replacement_reset)

# 4. Add to validation in handleSubmit
target_validation = """    if (!content.trim() || !activities.trim() || !limitations.trim() || !suggestions.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลในหัวข้อ เนื้อหา/สาระ, กิจกรรม, ข้อจำกัด และข้อเสนอแนะและแนวทางการพัฒนา ให้ครบถ้วนสมบูรณ์');
      return;
    }"""
replacement_validation = """    if (!content.trim() || !activities.trim() || !limitations.trim() || !suggestions.trim() || !strengths.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วนทุกหัวข้อ');
      return;
    }"""
content = content.replace(target_validation, replacement_validation)

# 5. Add to payload
target_payload = """      limitations: limitations.trim(),
      suggestions: suggestions.trim(),"""
replacement_payload = """      limitations: limitations.trim(),
      suggestions: suggestions.trim(),
      strengths: strengths.trim(),"""
content = content.replace(target_payload, replacement_payload)

# 6. Add UI field
target_ui = """        {/* ข้อเสนอแนะ/ความคิดเห็นของผู้สอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MessageSquareCode className="h-4 w-4 text-emerald-500" />
            4. ข้อเสนอแนะและแนวทางการพัฒนา
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุแนวทางการพัฒนาหรือการปรับใช้เพื่อแก้ไขในคาบถัดไป</p>
          <textarea
            rows={3}
            placeholder="ระบุข้อเสนอแนะหรือแนวทางการพัฒนาปรับปรุงเพิ่มเติม..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>"""

replacement_ui = """        {/* ข้อเสนอแนะ/ความคิดเห็นของผู้สอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MessageSquareCode className="h-4 w-4 text-emerald-500" />
            4. ข้อเสนอแนะและแนวทางการพัฒนา
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุแนวทางการพัฒนาหรือการปรับใช้เพื่อแก้ไขในคาบถัดไป</p>
          <textarea
            rows={3}
            placeholder="ระบุข้อเสนอแนะหรือแนวทางการพัฒนาปรับปรุงเพิ่มเติม..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* จุดเด่นในการสอนครั้งนี้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-500" />
            5. จุดเด่นในการสอนครั้งนี้
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุจุดเด่นหรือความสำเร็จที่เกิดขึ้นในการสอนคาบนี้</p>
          <textarea
            rows={3}
            placeholder="ระบุจุดเด่นในการสอนครั้งนี้..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>"""
content = content.replace(target_ui, replacement_ui)

# 7. Update numberings
content = content.replace("5. แบบประเมินการจัดการเรียนรู้", "6. แบบประเมินการจัดการเรียนรู้")
content = content.replace("6. แนบไฟล์และลิงก์เว็บไซต์ประกอบ", "7. แนบไฟล์และลิงก์เว็บไซต์ประกอบ")

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)

