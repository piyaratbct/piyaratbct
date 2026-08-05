const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf8');

const interfaceTarget = `interface AttendanceTrackingProps {
  students: Student[];
  gradeLevel: string;
  teacherId: string;
  teacherName?: string;
  semester: string;
  academicYear: string;
}`;
const interfaceReplace = `interface AttendanceTrackingProps {
  students: Student[];
  gradeLevel: string;
  teacherId: string;
  teacherName?: string;
  semester: string;
  academicYear: string;
  initialDate?: string;
  initialPeriod?: string;
  onClose?: () => void;
}`;
code = code.replace(interfaceTarget, interfaceReplace);

const fnTarget = `export function AttendanceTracking({ students, gradeLevel, teacherId, teacherName, semester, academicYear }: AttendanceTrackingProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<string>(PERIODS[1]);`;
const fnReplace = `export function AttendanceTracking({ students, gradeLevel, teacherId, teacherName, semester, academicYear, initialDate, initialPeriod, onClose }: AttendanceTrackingProps) {
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<string>(initialPeriod || PERIODS[1]);`;
code = code.replace(fnTarget, fnReplace);

const cancelTarget = `      {/* Header Controls */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">`;
const cancelReplace = `      {/* Header Controls */}
      {onClose && (
        <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b border-slate-200">
          <span className="font-bold text-slate-700">แก้ไขการเช็กชื่อนักเรียน</span>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-1 rounded-full"><XCircle className="h-5 w-5" /></button>
        </div>
      )}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">`;
code = code.replace(cancelTarget, cancelReplace);

const afterSaveTarget = `      setTimeout(() => setSaveStatus(null), 3000);`;
const afterSaveReplace = `      setTimeout(() => {
        setSaveStatus(null);
        if (onClose) onClose();
      }, 1500);`;
code = code.replace(afterSaveTarget, afterSaveReplace);

fs.writeFileSync('src/components/AttendanceTracking.tsx', code, 'utf8');
