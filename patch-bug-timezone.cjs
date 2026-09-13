const fs = require('fs');

const file1 = 'src/components/AcademicSettings.tsx';
let content1 = fs.readFileSync(file1, 'utf8');

// Fix timezone bug in AcademicSettings by parsing date strings properly as UTC
const newLogic1 = `  const calculateLearningDays = () => {
    if (!termStartDate || !termEndDate) {
      alert("กรุณาระบุวันเปิดและวันปิดภาคเรียนให้ครบถ้วนก่อนคำนวณ");
      return;
    }
    
    // Create dates explicitly in local time by parsing YYYY-MM-DD
    const [startYear, startMonth, startDay] = termStartDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = termEndDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    if (start > end) {
      alert("วันเปิดภาคเรียนต้องอยู่ก่อนวันปิดภาคเรียน");
      return;
    }

    let count = 0;
    let cur = new Date(start);

    while (cur <= end) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const dateString = \`\${year}-\${month}-\${day}\`;
      
      const isHoliday = holidays.find(h => h.date === dateString);
      const shouldSkip = isHoliday && (isHoliday.type === 'holiday' || isHoliday.type === 'activity_no_class');
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !shouldSkip) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    setTotalLearningDays(count);
    setMessage({ type: 'success', text: 'คำนวณจำนวนวันเรียนอัตโนมัติเรียบร้อยแล้ว (ไม่รวมเสาร์-อาทิตย์ และวันหยุดพิเศษ)' });
    setTimeout(() => setMessage(null), 4000);
  };`;

content1 = content1.replace(/const calculateLearningDays = \(\) => \{[\s\S]*?setTimeout\(\(\) => setMessage\(null\), 4000\);\n  \};/, newLogic1);
fs.writeFileSync(file1, content1);
console.log('Fixed AcademicSettings timezone bug');


const file2 = 'src/components/ScheduleManager.tsx';
let content2 = fs.readFileSync(file2, 'utf8');

const newLogic2 = `  const getTeachingDays = () => {
    if (!termStart || !termEnd) return null;
    
    const [startYear, startMonth, startDay] = termStart.split('-').map(Number);
    const [endYear, endMonth, endDay] = termEnd.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const daysCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const datesToSkip = new Set<string>();
    holidays.forEach(h => {
      // Treat items without type as legacy 'holiday'
      const type = h.type || 'holiday';
      if (type === 'holiday' || type === 'activity_no_class') {
         datesToSkip.add(h.date);
      }
    });

    let cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const dateStr = \`\${yyyy}-\${mm}-\${dd}\`;

      if (dayOfWeek >= 1 && dayOfWeek <= 5 && !datesToSkip.has(dateStr)) {
        daysCount[dayOfWeek]++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return daysCount;
  };`;

content2 = content2.replace(/const getTeachingDays = \(\) => \{[\s\S]*?return daysCount;\n  \};/, newLogic2);
fs.writeFileSync(file2, content2);
console.log('Fixed ScheduleManager timezone bug');

