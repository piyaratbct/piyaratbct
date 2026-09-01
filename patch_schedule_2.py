import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """  useEffect(() => {
    if (isReadOnly && currentTeacher?.id) {
      setSelectedTeacherId(currentTeacher.id);
    }
  }, [isReadOnly, currentTeacher]);"""

    new_logic = """  useEffect(() => {
    if (currentTeacher?.id && !selectedTeacherId) {
      setSelectedTeacherId(currentTeacher.id);
    }
  }, [currentTeacher]);"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching ScheduleManager 2")
    else:
        print("Pattern not found in ScheduleManager 2")

fix('src/components/ScheduleManager.tsx')
