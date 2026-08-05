const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf8');

const target = `  // Automatically select a matching period if one exists for the current date's day of week
  useEffect(() => {
    if (schedules.length > 0 && date) {
      const parts = date.split('-');
      const dayOfWeek = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getDay();
      const matchingSchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
      if (matchingSchedule) {
        setPeriod(matchingSchedule.period);
      }
    }
  }, [schedules, date]);`;

const replacement = `  // Automatically select a matching period if one exists for the current date's day of week
  useEffect(() => {
    if (initialPeriod) return; // Do not auto-select if editing an existing session
    if (schedules.length > 0 && date) {
      const parts = date.split('-');
      const dayOfWeek = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getDay();
      const matchingSchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
      if (matchingSchedule) {
        setPeriod(matchingSchedule.period);
      }
    }
  }, [schedules, date, initialPeriod]);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AttendanceTracking.tsx', code, 'utf8');
