const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

const target = `  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการเช็กชื่อของคาบเรียนนี้?')) return;
    try {
      await deleteDoc(doc(db, 'attendanceSessions', sessionId));`;

const replacement = `  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'attendanceSessions', sessionId));
      setRefreshTrigger(prev => prev + 1);
      setSessionToDelete(null);
      window.dispatchEvent(new CustomEvent('app-custom-toast', {
        detail: {
          message: 'ลบข้อมูลการเช็กชื่อเรียบร้อยแล้ว',
          type: 'success',
          title: 'ลบสำเร็จ'
        }
      }));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };`;

// we should also replace the original function completely
code = code.replace(
  `  const handleDeleteSession = async (sessionId: string) => {
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
  };`, 
  replacement
);

fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
