import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """        const relevantSchedules = sSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as TeacherSchedule))
          .filter(s => s.semester === systemSemester && s.academicYear === systemAcademicYear);"""

    new_logic = """        const relevantSchedules = sSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as TeacherSchedule))
          .filter(s => {
            // ถ้าระเบียนเก่าไม่มีข้อมูลเทอม ให้แสดงไปก่อน หรือตรงกับเทอมปัจจุบัน
            if (!s.semester || !s.academicYear) return true;
            return s.semester === systemSemester && s.academicYear === systemAcademicYear;
          });"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching ScheduleManager")
    else:
        print("Pattern not found in ScheduleManager")

fix('src/components/ScheduleManager.tsx')
