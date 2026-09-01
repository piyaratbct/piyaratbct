const fs = require('fs');

let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf8');

// 1. Add useState
code = code.replace(
  "const [isSaving, setIsSaving] = useState(false);",
  "const [isSaving, setIsSaving] = useState(false);\n  const [applyToAllPeriods, setApplyToAllPeriods] = useState(false);"
);

// 2. Replace handleSave and handleSaveAllDay
const newHandleSave = `
  const handleSave = async () => {
    if (applyToAllPeriods && !window.confirm('คุณต้องการบันทึกข้อมูลการเข้าเรียนนี้ให้เหมือนกันใน "ทุกคาบ" ของวันนี้ใช่หรือไม่? (การดำเนินการนี้จะเขียนทับข้อมูลของคาบอื่นในวันนี้)')) {
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const now = new Date().toISOString();
      const selectedDayOfWeek = date ? new Date(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2])).getDay() : -1;

      if (applyToAllPeriods) {
        // Save to all periods
        const sessionsQuery = query(
          collection(db, 'attendanceSessions'),
          where('gradeLevel', '==', gradeLevel),
          where('date', '==', date),
          where('semester', '==', semester),
          where('academicYear', '==', academicYear)
        );
        
        const querySnapshot = await getDocs(sessionsQuery);
        const existingSessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        const targetPeriods = PERIODS.filter(p => !p.includes('พักเบรก') && !p.includes('พักกลางวัน'));

        for (const p of targetPeriods) {
          let matchingSchedule = schedules.find(s => s.dayOfWeek === selectedDayOfWeek && s.period === p);
          if (!matchingSchedule) {
            matchingSchedule = schedules.find(s => s.period === p);
          }
          
          const subject = matchingSchedule ? matchingSchedule.subject : undefined;
          const classTeacherName = (matchingSchedule && matchingSchedule.teacherName) ? matchingSchedule.teacherName : teacherName;

          const sessionData: any = {
            gradeLevel,
            date,
            period: p,
            teacherId,
            semester,
            academicYear,
            attendanceData,
            updatedAt: now
          };
          
          if (subject) sessionData.subject = subject;
          if (classTeacherName) sessionData.teacherName = classTeacherName;

          const existingSession = existingSessions.find((s: any) => s.period === p);
          
          if (existingSession) {
            await setDoc(doc(db, 'attendanceSessions', existingSession.id), sessionData, { merge: true });
          } else {
            await addDoc(collection(db, 'attendanceSessions'), {
              ...sessionData,
              createdAt: now
            });
          }
        }

        setSaveStatus({ type: 'success', message: 'บันทึกข้อมูลการเข้าเรียนสำหรับทุกคาบในวันนี้เรียบร้อยแล้ว' });
        window.dispatchEvent(new CustomEvent('app-custom-toast', {
          detail: {
            message: \`บันทึกการเช็กชื่อชั้น \${gradeLevel} สำหรับทุกคาบในวันที่ \${date} สำเร็จและจัดเก็บเข้าคลาวด์เรียบร้อยแล้ว ✅\`,
            type: 'success',
            title: 'บันทึกสำเร็จ'
          }
        }));
      } else {
        // Normal single period save
        let matchingSchedule = schedules.find(s => s.dayOfWeek === selectedDayOfWeek && s.period === period);
        if (!matchingSchedule) {
          matchingSchedule = schedules.find(s => s.period === period);
        }
        
        const subject = matchingSchedule ? matchingSchedule.subject : undefined;
        const classTeacherName = (matchingSchedule && matchingSchedule.teacherName) ? matchingSchedule.teacherName : teacherName;

        const sessionData: any = {
          gradeLevel,
          date,
          period,
          teacherId,
          semester,
          academicYear,
          attendanceData,
          updatedAt: now
        };
        
        if (subject) sessionData.subject = subject;
        if (classTeacherName) sessionData.teacherName = classTeacherName;

        if (currentSessionId) {
          await setDoc(doc(db, 'attendanceSessions', currentSessionId), sessionData, { merge: true });
        } else {
          const docRef = await addDoc(collection(db, 'attendanceSessions'), {
            ...sessionData,
            createdAt: now
          });
          setCurrentSessionId(docRef.id);
        }
        
        setSaveStatus({ type: 'success', message: 'บันทึกข้อมูลการเข้าเรียนเรียบร้อยแล้ว' });
        window.dispatchEvent(new CustomEvent('app-custom-toast', {
          detail: {
            message: \`บันทึกการเช็กชื่อชั้น \${gradeLevel} (คาบ \${period}) วันที่ \${date} สำเร็จและจัดเก็บเข้าคลาวด์เรียบร้อยแล้ว ✅\`,
            type: 'success',
            title: 'บันทึกการเข้าเรียนสำเร็จ'
          }
        }));
      }

      setTimeout(() => {
        setSaveStatus(null);
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaveStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setIsSaving(false);
    }
  };
`;

const regexReplaceFuncs = /  const handleSave = async \(\) => \{[\s\S]*?    \} finally \{\n      setIsSaving\(false\);\n    \}\n  \};\n/g;

code = code.replace(regexReplaceFuncs, newHandleSave);

// 3. Replace the buttons
const newButtons = `
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer bg-violet-50 px-3 py-2 rounded-lg border border-violet-200">
              <input
                type="checkbox"
                checked={applyToAllPeriods}
                onChange={(e) => setApplyToAllPeriods(e.target.checked)}
                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              ใช้ข้อมูลนี้เหมือนกันทุกคาบ
            </label>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors disabled:opacity-50  shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              บันทึก
            </button>
`;

const buttonsRegex = /            <button\n              onClick=\{handleSaveAllDay\}[\s\S]*?บันทึก\n            <\/button>/g;

code = code.replace(buttonsRegex, newButtons);

fs.writeFileSync('src/components/AttendanceTracking.tsx', code);
console.log('Checkbox patch applied!');
