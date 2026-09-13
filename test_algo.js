// Algorithm mockup for Phase 2 calculation
const termStartDate = "2026-05-16";
const termEndDate = "2026-10-10";
const holidays = [
  { date: "2026-06-03", type: "holiday" }, // วันเฉลิมฯ (งดเรียน)
  { date: "2026-07-28", type: "holiday" }, // วันเฉลิมฯ (งดเรียน)
  { date: "2026-08-12", type: "holiday" }, // วันแม่ (งดเรียน)
  { date: "2026-09-01", type: "activity_integrated", integratedSubjects: ["ท11101 ภาษาไทย"] } // วันสุนทรภู่ (ได้ชั่วโมง)
];

const getTeachingDays = (startDate, endDate, holidays) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const daysCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  // Create a map of dates to skip
  const datesToSkip = new Set();
  holidays.forEach(h => {
    // Only skip if it's a real holiday or activity that cancels class completely
    if (h.type === 'holiday' || h.type === 'activity_no_class') {
       datesToSkip.add(h.date);
    }
  });

  let cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    // YYYY-MM-DD format for timezone safe comparison
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (dayOfWeek >= 1 && dayOfWeek <= 5 && !datesToSkip.has(dateStr)) {
      daysCount[dayOfWeek]++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return daysCount;
};

console.log(getTeachingDays(termStartDate, termEndDate, holidays));
