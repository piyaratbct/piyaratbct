const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf-8');

// Insert holidays state
code = code.replace(
  "const [schoolInfo, setSchoolInfo] = useState({ name: '', subDistrict: '', district: '', province: '' });",
  `const [schoolInfo, setSchoolInfo] = useState({ name: '', subDistrict: '', district: '', province: '' });
  const [holidays, setHolidays] = useState<string[]>([]);`
);

// Insert fetch holidays useEffect
code = code.replace(
  "// Fetch term dates",
  `// Fetch holidays
  useEffect(() => {
    if (!academicYear || !semester) return;
    const calendarDocId = \`\${academicYear}_\${semester}\`;
    const unsub = onSnapshot(doc(db, "schoolCalendar", calendarDocId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.holidays) {
          setHolidays(data.holidays.map((h: any) => h.date));
        }
      }
    });
    return () => unsub();
  }, [academicYear, semester]);

  // Fetch term dates`
);

// Calculate isDateDisabled before return
code = code.replace(
  "const standardPeriods = PERIODS.filter",
  `const selectedDateObj = date ? new Date(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2])) : new Date();
  const isWeekend = selectedDateObj.getDay() === 0 || selectedDateObj.getDay() === 6;
  const isHoliday = holidays.includes(date);
  const isDateDisabled = isWeekend || isHoliday;

  const standardPeriods = PERIODS.filter`
);

// Add alert UI
code = code.replace(
  "{saveStatus && (",
  `{isDateDisabled && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <span className="font-bold">ไม่สามารถเช็คชื่อได้: </span> 
            {isWeekend ? 'วันนี้เป็นวันหยุดเสาร์-อาทิตย์' : 'วันนี้เป็นวันหยุดพิเศษตามปฏิทินโรงเรียน'}
          </div>
        </div>
      )}

      {saveStatus && (`
);

// Disable save button and Set All button
code = code.replace(
  "disabled={isSaving || isLoading}",
  "disabled={isSaving || isLoading || isDateDisabled}"
);
code = code.replace(
  "onClick={() => markAllAs('present')}",
  "onClick={() => markAllAs('present')} disabled={isDateDisabled}"
);
code = code.replace(
  "className=\"hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm\"",
  "className=\"hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed\""
);


fs.writeFileSync('src/components/AttendanceTracking.tsx', code, 'utf-8');
console.log("Patched AttendanceTracking");
