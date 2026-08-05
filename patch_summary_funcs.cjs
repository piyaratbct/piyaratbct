const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

const target = `  // Compute daily totals across all sessions for the selected grade and date`;
const replacement = `  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการเช็กชื่อของคาบเรียนนี้?')) return;
    try {
      await deleteDoc(doc(db, 'attendanceSessions', sessionId));
      setRefreshTrigger(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('app-custom-toast', {
        detail: {
          message: 'ลบข้อมูลการเช็กชื่อเรียบร้อยแล้ว',
          type: 'success',
          title: 'ลบสำเร็จ'
        }
      }));
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // Compute daily totals across all sessions for the selected grade and date`;
code = code.replace(target, replacement);
fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
