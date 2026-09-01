import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('ยืนยันการลบคาบสอนนี้?')) return;
    try {
      await deleteDoc(doc(db, 'schedules', id));
      setAllSchedules(allSchedules.filter(s => s.id !== id));
    } catch (error) {
      console.error(error);
    }
  };"""

    new_logic = """  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      await deleteDoc(doc(db, 'schedules', scheduleToDelete));
      setAllSchedules(allSchedules.filter(s => s.id !== scheduleToDelete));
    } catch (error) {
      console.error(error);
    } finally {
      setScheduleToDelete(null);
    }
  };"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        
        # Now find where to put the modal
        # We can put it right before the last closing </div>
        # But wait, let's find the closing of the main component
        
        with open(filename, 'w') as f:
            f.write(code)
        print("Success patching ScheduleManager delete logic")
    else:
        print("Pattern not found in ScheduleManager delete logic")

fix('src/components/ScheduleManager.tsx')
