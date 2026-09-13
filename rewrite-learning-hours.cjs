const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

// Find the start of LearningHoursReport function
const reportDataStart = content.indexOf('const reportData = useMemo(() => {');
const reportDataEnd = content.indexOf('  if (isLoading) {', reportDataStart);

if (reportDataStart === -1 || reportDataEnd === -1) {
    console.error("Could not find reportData block");
    process.exit(1);
}

// We also need to add the curriculums state and effect right before reportData
const stateInjection = `  const [curriculums, setCurriculums] = useState<any[]>([]);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const q = query(collection(db, 'curriculums'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCurriculums(data);
      } catch (error) {
        console.error("Error fetching curriculums:", error);
      }
    };
    fetchCurriculums();
  }, []);

  `;

const newReportData = `const reportData = useMemo(() => {
    const gradeSchedules = schedules.filter(s => s.gradeLevel === selectedGrade);
    const gradeSessions = sessions.filter(s => s.gradeLevel === selectedGrade);

    // Group by subject
    const subjectMap: Record<string, {
      subject: string;
      teacherName: string;
      periodsPerWeek: number;
      targetPeriodsTotal: number;
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
      if (!curr.subjectName || curr.isParent) return; // Skip parent subjects, track specific children
      
      const totalHours = curr.totalHours || 0;
      
      subjectMap[curr.subjectName] = {
        subject: curr.subjectName,
        teacherName: '-',
        periodsPerWeek: 0,
        targetPeriodsTotal: totalHours,
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
          targetPeriodsTotal: 0, // Explicitly 0 if not in curriculum
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

    // 3. Overlay with taught sessions
    gradeSessions.forEach(sess => {
      if (!sess.subject) return;
      const subjectName = sess.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sess.teacherName || '-',
          periodsPerWeek: 0,
          targetPeriodsTotal: 0, // Explicitly 0 if not in curriculum
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
  }, [schedules, sessions, selectedGrade, curriculums]);

  const hasMissingHours = reportData.some(item => item.targetPeriodsTotal === 0 && (item.periodsPerWeek > 0 || item.taughtPeriods > 0));

`;

const firstHalf = content.substring(0, reportDataStart);
const secondHalf = content.substring(reportDataEnd);

const newContent = firstHalf + stateInjection + newReportData + secondHalf;
fs.writeFileSync('src/components/LearningHoursReport.tsx', newContent);

// Add the warning UI
let finalContent = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const titleTarget = `<p className="text-sm text-slate-500">ตรวจสอบความคืบหน้าการจัดการเรียนการสอนเทียบกับโครงสร้างหลักสูตร (อิงตามจำนวนวันเรียน {totalLearningDays} วัน)</p>
        </div>
      </div>`;

const newTitleTarget = `<p className="text-sm text-slate-500">ตรวจสอบความคืบหน้าการจัดการเรียนการสอนโดยอ้างอิงเป้าหมายเวลาเรียนจากระบบจัดการหลักสูตรเป็นหลัก</p>
        </div>
      </div>
      
      {hasMissingHours && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">พบรายวิชาที่ไม่ได้กำหนดชั่วโมงเรียนในโครงสร้างหลักสูตร</h4>
            <p className="text-sm text-amber-700 mt-1">
              มีบางรายวิชาที่มีตารางสอนหรือมีการบันทึกการสอนแล้ว แต่ยังไม่ได้กำหนดเวลาเรียนรวม (ชั่วโมง/ปี) ไว้ในระบบหลักสูตร ทำให้ไม่สามารถคำนวณความคืบหน้า (%) ได้ กรุณาไปที่เมนู <strong>จัดการหลักสูตรและรายวิชา</strong> เพื่อตั้งค่าเวลาเรียน
            </p>
          </div>
        </div>
      )}`;

finalContent = finalContent.replace(titleTarget, newTitleTarget);
fs.writeFileSync('src/components/LearningHoursReport.tsx', finalContent);

console.log("Successfully replaced reportData logic and added warning.");

