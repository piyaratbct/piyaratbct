const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf8');

if (!code.includes('initialSubject?: string;')) {
  code = code.replace(
    'initialPeriod?: string;',
    'initialPeriod?: string;\n  initialSubject?: string;'
  );
  code = code.replace(
    'initialPeriod, onClose }: AttendanceTrackingProps)',
    'initialPeriod, initialSubject, onClose }: AttendanceTrackingProps)'
  );
  
  const setSchedulesLine = '        setSchedules(filteredSchedules);';
  const autoSelectPeriodCode = `
        setSchedules(filteredSchedules);
        
        // Auto-select period if initialSubject is provided and we haven't selected one manually
        if (initialSubject) {
          const selectedDayOfWeek = date ? new Date(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2])).getDay() : -1;
          const matchingSchedule = filteredSchedules.find(s => 
            s.dayOfWeek === selectedDayOfWeek && 
            (s.subject === initialSubject || s.customSubject === initialSubject)
          );
          if (matchingSchedule) {
            setPeriod(matchingSchedule.period);
          }
        }
`;
  code = code.replace(setSchedulesLine, autoSelectPeriodCode);
  
  fs.writeFileSync('src/components/AttendanceTracking.tsx', code);
  console.log('Patched AttendanceTracking.tsx');
}
