const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const reportDataStart = content.indexOf('const reportData = useMemo(() => {');
const reportDataEnd = content.indexOf('  if (isLoading) {', reportDataStart);

const newReportData = `const reportData = useMemo(() => {
    const gradeSchedules = schedules.filter(s => s.gradeLevel === selectedGrade);
    const gradeSessions = sessions.filter(s => s.gradeLevel === selectedGrade);

    // Group by subject
    const subjectMap: Record<string, {
      subject: string;
      teacherName: string;
      periodsPerWeek: number;
      curriculumYearTarget: number; // From curriculum
      curriculumTermTarget: number; // curriculumYearTarget / 2
      scheduleTermTarget: number;   // periodsPerWeek * weeks
      targetPeriodsTotal: number;   // Final target used for progress (defaults to curriculumTermTarget)
      taughtPeriods: number;
      lastTaughtDate: string | null;
      dataSource: string;
    }> = {};

    // 1. Base targets from Curriculum Manager
    const getBaseGrade = (g: string) => g ? g.split('/')[0].trim() : '';
    const targetBaseGrade = getBaseGrade(selectedGrade);
    
    const relevantCurriculums = curriculums.filter(c => {
      if (c.gradeLevel) return getBaseGrade(c.gradeLevel) === targetBaseGrade;
      return false;
    });

    relevantCurriculums.forEach(curr => {
      if (!curr.subjectName || curr.isParent) return; // Skip parent subjects
      
      const totalHours = curr.totalHours || 0; // ชั่วโมง/ปีการศึกษา
      
      subjectMap[curr.subjectName] = {
        subject: curr.subjectName,
        teacherName: '-',
        periodsPerWeek: 0,
        curriculumYearTarget: totalHours,
        curriculumTermTarget: Math.round(totalHours / 2),
        scheduleTermTarget: 0,
        targetPeriodsTotal: Math.round(totalHours / 2),
        taughtPeriods: 0,
        lastTaughtDate: null,
        dataSource: 'curriculum'
      };
    });

    // 2. Overlay with schedules to get teachers and periods per week
    gradeSchedules.forEach(sch => {
      const subjectName = sch.subject === 'อื่นๆ' ? (sch.customSubject || 'อื่นๆ') : sch.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sch.teacherName || '-',
          periodsPerWeek: 0,
          curriculumYearTarget: 0,
          curriculumTermTarget: 0,
          scheduleTermTarget: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'schedule'
        };
      } else {
        if (subjectMap[subjectName].teacherName === '-') {
          subjectMap[subjectName].teacherName = sch.teacherName || '-';
        } else if (sch.teacherName && !subjectMap[subjectName].teacherName.includes(sch.teacherName)) {
           subjectMap[subjectName].teacherName += \`, \${sch.teacherName}\`;
        }
      }
      
      subjectMap[subjectName].periodsPerWeek += 1;
    });
    
    // Calculate expected schedule target
    const learningWeeks = Math.max(1, Math.round(totalLearningDays / 5));
    
    Object.keys(subjectMap).forEach(subj => {
        subjectMap[subj].scheduleTermTarget = subjectMap[subj].periodsPerWeek * learningWeeks;
        
        // If it's still 0 (or wasn't in curriculum), we fallback to schedule calculation
        if (subjectMap[subj].targetPeriodsTotal === 0 && subjectMap[subj].periodsPerWeek > 0) {
           subjectMap[subj].targetPeriodsTotal = subjectMap[subj].scheduleTermTarget;
           subjectMap[subj].dataSource = 'schedule_fallback';
        }
    });

    // 3. Overlay with taught sessions
    gradeSessions.forEach(sess => {
      if (!sess.subject) return;
      const subjectName = sess.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sess.teacherName || '-',
          periodsPerWeek: 0,
          curriculumYearTarget: 0,
          curriculumTermTarget: 0,
          scheduleTermTarget: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'session'
        };
      }
      subjectMap[subjectName].taughtPeriods += 1;
      
      if (!subjectMap[subjectName].lastTaughtDate || sess.date > subjectMap[subjectName].lastTaughtDate!) {
        subjectMap[subjectName].lastTaughtDate = sess.date;
      }
    });

    return Object.values(subjectMap).sort((a, b) => b.targetPeriodsTotal - a.targetPeriodsTotal);
  }, [schedules, sessions, selectedGrade, totalLearningDays, curriculums]);

  const hasMissingHours = reportData.some(item => item.dataSource === 'schedule_fallback');
  const hasMismatchHours = reportData.some(item => 
    item.dataSource === 'curriculum' && 
    item.periodsPerWeek > 0 && 
    item.curriculumTermTarget !== item.scheduleTermTarget
  );

`;

const firstHalf = content.substring(0, reportDataStart);
const secondHalf = content.substring(reportDataEnd);

let newContent = firstHalf + newReportData + secondHalf;
fs.writeFileSync('src/components/LearningHoursReport.tsx', newContent);

// Add the warning UI for mismatch
let finalContent = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const missingAlertTarget = `{hasMissingHours && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">พบรายวิชาที่ไม่ได้กำหนดโครงสร้างเวลาเรียน (ชั่วโมง/ปีการศึกษา)</h4>
            <p className="text-sm text-amber-700 mt-1">
              มีบางรายวิชาที่มีตารางสอนหรือมีการบันทึกการสอนแล้ว แต่ยังไม่ได้กำหนดเวลาเรียนรวม (ชั่วโมง/ปีการศึกษา) ไว้ในระบบหลักสูตร ทำให้ไม่สามารถคำนวณความคืบหน้า (%) ได้ กรุณาไปที่เมนู <strong>จัดการหลักสูตรและรายวิชา</strong> เพื่อตั้งค่าเวลาเรียน
            </p>
          </div>
        </div>
      )}`;

const bothAlerts = `{hasMissingHours && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">พบรายวิชาที่ไม่ได้กำหนดโครงสร้างเวลาเรียน (ชั่วโมง/ปีการศึกษา)</h4>
            <p className="text-sm text-amber-700 mt-1">
              มีบางรายวิชาที่มีตารางสอน แต่ยังไม่ได้กำหนดเวลาเรียน (ชั่วโมง/ปีการศึกษา) ไว้ในระบบหลักสูตร กรุณาไปที่เมนู <strong>จัดการหลักสูตรและรายวิชา</strong>
            </p>
          </div>
        </div>
      )}
      
      {hasMismatchHours && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-orange-800 text-sm">พบรายวิชาที่มี "ชั่วโมง/ปีการศึกษา" ไม่สอดคล้องกับ "ตารางสอน"</h4>
            <p className="text-sm text-orange-700 mt-1">
              โครงสร้างหลักสูตร (หาร 2 เป็นรายเทอม) ไม่ตรงกับจำนวนคาบสอนจริงในตารางสอน (คาบ/สัปดาห์ × จำนวนสัปดาห์เรียน) ระบบจะมีป้ายแจ้งเตือนสีส้มที่รายวิชาดังกล่าว
            </p>
          </div>
        </div>
      )}`;

finalContent = finalContent.replace(missingAlertTarget, bothAlerts);

// Add the display logic in the card
const cardContentTarget = `<div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-xs font-medium text-slate-500">คาบ/สัปดาห์</span>
                  <span className="block text-lg font-bold text-slate-800">{item.periodsPerWeek}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-xs font-medium text-slate-500">สอนไปแล้ว (คาบ)</span>
                  <span className="block text-lg font-bold text-emerald-600">{item.taughtPeriods} <span className="text-xs font-normal text-slate-400">/ {item.targetPeriodsTotal}</span></span>
                </div>
              </div>`;

const newCardContent = `<div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-[10px] font-medium text-slate-500 leading-tight">คาบ/สัปดาห์<br/>(จากตารางสอน)</span>
                  <span className="block text-lg font-bold text-slate-800 mt-1">{item.periodsPerWeek}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-[10px] font-medium text-slate-500 leading-tight">ความคืบหน้า<br/>สอนไปแล้ว (คาบ)</span>
                  <span className="block text-lg font-bold text-emerald-600 mt-1">{item.taughtPeriods} <span className="text-xs font-normal text-slate-400">/ {item.targetPeriodsTotal}</span></span>
                </div>
              </div>
              
              {item.dataSource === 'curriculum' && item.periodsPerWeek > 0 && (
                  <div className="mb-4">
                      {item.curriculumTermTarget === item.scheduleTermTarget ? (
                          <div className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-1.5 rounded flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" />
                              ตารางสอนสอดคล้องกับหลักสูตร ({item.scheduleTermTarget} คาบ/เทอม)
                          </div>
                      ) : (
                          <div className="text-[11px] bg-orange-50 text-orange-700 px-2 py-1.5 rounded flex items-start gap-1.5 border border-orange-100">
                              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <span className="font-semibold block mb-0.5">ตารางสอนไม่สอดคล้องกับหลักสูตร</span>
                                หลักสูตรระบุ {item.curriculumYearTarget} ชม./ปี ({item.curriculumTermTarget} คาบ/เทอม) <br/>
                                แต่ตารางสอนมี {item.periodsPerWeek} คาบ/สัปดาห์ (คาดการณ์ {item.scheduleTermTarget} คาบ/เทอม)
                              </div>
                          </div>
                      )}
                  </div>
              )}`;

finalContent = finalContent.replace(cardContentTarget, newCardContent);

fs.writeFileSync('src/components/LearningHoursReport.tsx', finalContent);
console.log("Patched LearningHoursReport visualization and warning logic.");
