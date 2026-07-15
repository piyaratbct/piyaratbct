import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. displayedStudents logic
target_displayed = """  const displayedStudents = students.filter((student) => {
    if (student.gradeLevel !== selectedGrade) return false;"""
replacement_displayed = """  const displayedStudents = students.filter((student) => {
    if (selectedGrade === 'ภาพรวม') {
      // pass
    } else if (selectedGrade === 'ระดับอนุบาล') {
      if (!student.gradeLevel.includes('อนุบาล')) return false;
    } else if (selectedGrade === 'ระดับประถมศึกษา') {
      if (!student.gradeLevel.includes('ประถม')) return false;
    } else {
      if (student.gradeLevel !== selectedGrade) return false;
    }"""
content = content.replace(target_displayed, replacement_displayed)

# 2. Select dropdown
target_select = """              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none bg-white text-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-sm font-bold focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-auto min-w-[120px] shadow-sm cursor-pointer"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>"""
replacement_select = """              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none bg-white text-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-sm font-bold focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-auto min-w-[120px] shadow-sm cursor-pointer"
              >
                <optgroup label="มุมมองพิเศษ">
                  <option value="ภาพรวม">ภาพรวม (ทั้งหมด)</option>
                  <option value="ระดับอนุบาล">ระดับอนุบาล (อนุบาล 1-3)</option>
                  <option value="ระดับประถมศึกษา">ระดับประถมศึกษา (ป.1-ป.6)</option>
                </optgroup>
                <optgroup label="รายชั้นเรียน">
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </optgroup>
              </select>"""
content = content.replace(target_select, replacement_select)

# 3. Add conditions to action buttons (only show if GRADE_LEVELS.includes(selectedGrade))
# Add Student
target_add = """                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setShowStudentModal(true);
                  }}"""
replacement_add = """                {GRADE_LEVELS.includes(selectedGrade) && (
                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setShowStudentModal(true);
                    }}"""
# Need to close it carefully, let's just do a regex replace on the Add button wrapper if needed.

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
