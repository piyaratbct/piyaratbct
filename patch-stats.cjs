const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf8');

// 1. Remove gradeDistribution from its current place
const gradeDistRegex = /  const gradeDistribution = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[students, scores, academicYear, semester, subject, attendanceStats, gradeLevel\]\);\n\n/m;
code = code.replace(gradeDistRegex, '');

// 2. Insert it after displayedStudents
const displayedStudentsRegex = /  const displayedStudents = students\n    \.filter\(\(s\) => s\.gradeLevel === gradeLevel\)\n    \.sort\(\(a, b\) => Number\(a\.number \|\| "0"\) - Number\(b\.number \|\| "0"\)\);\n/m;

const newGradeDistStr = `  const gradeDistribution = React.useMemo(() => {
    const dist: Record<string, { male: number; female: number; total: number }> = {};
    let totalAssessed = 0;
    let maleCount = 0;
    let femaleCount = 0;
    
    const isActivity = subject.includes('กิจกรรม') || subject.includes('ลูกเสือ') || subject.includes('แนะแนว') || subject.includes('ชุมนุม');
    const isPrimary12 = gradeLevel === 'ประถมศึกษาปีที่ 1' || gradeLevel === 'ประถมศึกษาปีที่ 2';
    const isReading = subject === 'กิจกรรมอ่าน-เขียน';
    
    const initDist = () => ({ male: 0, female: 0, total: 0 });

    if (isReading) {
      dist['3 (ดีเยี่ยม)'] = initDist();
      dist['2 (ดี)'] = initDist();
      dist['1 (ผ่าน)'] = initDist();
      dist['0 (ไม่ผ่าน)'] = initDist();
    } else if (isActivity) {
      dist['ผ'] = initDist();
      dist['มผ'] = initDist();
    } else if (isPrimary12) {
      dist['ดีเยี่ยม'] = initDist();
      dist['ดี'] = initDist();
      dist['ผ่าน'] = initDist();
      dist['ไม่ผ่าน'] = initDist();
    } else {
      ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส'].forEach(g => dist[g] = initDist());
    }

    displayedStudents.forEach(st => {
      const key = \`\${st.id}_\${academicYear}_\${semester}_\${subject}\`;
      const score = scores[key] || { totalScore: 0, activities: [] };
      
      let attScore = undefined;
      if (attendanceStats?.studentStats?.[st.id]) {
        const stats = attendanceStats.studentStats[st.id];
        const totalAttended = stats.present + stats.late;
        const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
        const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
        attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
      }
      
      const g = calculateGrade(score.totalScore || 0, subject, score.activities, undefined, attScore);
      if (g && g !== '-') {
        if (dist[g] === undefined) dist[g] = initDist();
        dist[g].total++;
        if (st.gender === 'male' || (st.firstName && st.firstName.startsWith('เด็กชาย')) || (st.firstName && st.firstName.startsWith('นาย'))) {
          dist[g].male++;
          maleCount++;
        } else {
          dist[g].female++;
          femaleCount++;
        }
        totalAssessed++;
      }
    });

    return { dist, totalAssessed, maleCount, femaleCount };
  }, [displayedStudents, scores, academicYear, semester, subject, attendanceStats, gradeLevel]);
`;

code = code.replace(displayedStudentsRegex, "  const displayedStudents = students\n    .filter((s) => s.gradeLevel === gradeLevel)\n    .sort((a, b) => Number(a.number || \"0\") - Number(b.number || \"0\"));\n\n" + newGradeDistStr);

// 3. Update SECTION 4 rendering
const section4Regex = /\{\/\* SECTION 4: สรุปสถิติผลการเรียน \*\/\}[\s\S]*?<\/PDFPrintHelper>/m;

const newSection4 = `{/* SECTION 4: สรุปสถิติผลการเรียน */}
          <PrintPageContainer layout="landscape" className="flex flex-col">
            <PrintHeader
              title="แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน(ปพ.5)"
              subtitle={
                <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                  <p><strong>รายวิชา:</strong> {subject}</p>
                  <p><strong>ระดับชั้น:</strong> {gradeLevel}</p>
                  <p><strong>ภาคเรียนที่:</strong> {semester}</p>
                  <p><strong>ปีการศึกษา:</strong> {academicYear}</p>
                </div>
              }
            />
            
            <div className="mt-8 flex-grow">
              <h3 className="font-bold text-center text-lg mb-6">สรุปสถิติผลการประเมิน</h3>
              
              <div className="max-w-4xl mx-auto">
                <table className="w-full text-sm border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-4 py-2 text-center" rowSpan={2}>ระดับผลการเรียน / ผลการประเมิน</th>
                      <th className="border border-slate-900 px-4 py-2 text-center" colSpan={3}>จำนวน (คน)</th>
                      <th className="border border-slate-900 px-4 py-2 text-center" rowSpan={2}>ร้อยละของนักเรียนทั้งหมด</th>
                    </tr>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-4 py-2 text-center">ชาย</th>
                      <th className="border border-slate-900 px-4 py-2 text-center">หญิง</th>
                      <th className="border border-slate-900 px-4 py-2 text-center">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradeDistribution.dist).map(([grade, counts]) => (
                      <tr key={grade}>
                        <td className="border border-slate-900 px-4 py-2 text-center font-bold">{grade}</td>
                        <td className="border border-slate-900 px-4 py-2 text-center">{counts.male}</td>
                        <td className="border border-slate-900 px-4 py-2 text-center">{counts.female}</td>
                        <td className="border border-slate-900 px-4 py-2 text-center font-bold">{counts.total}</td>
                        <td className="border border-slate-900 px-4 py-2 text-center">
                          {gradeDistribution.totalAssessed > 0 ? ((Number(counts.total) / gradeDistribution.totalAssessed) * 100).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold">
                      <td className="border border-slate-900 px-4 py-2 text-right">รวมนักเรียนที่ได้รับการประเมินทั้งหมด</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">{gradeDistribution.maleCount}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">{gradeDistribution.femaleCount}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center text-lg">{gradeDistribution.totalAssessed}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center text-lg">100.00</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-600">
                      <td className="border border-slate-900 px-4 py-2 text-right">นักเรียนทั้งหมดในห้อง</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">{displayedStudents.filter(s => s.gender === 'male' || (s.firstName && (s.firstName.startsWith('เด็กชาย') || s.firstName.startsWith('นาย')))).length}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">{displayedStudents.filter(s => s.gender === 'female' || (s.firstName && (s.firstName.startsWith('เด็กหญิง') || s.firstName.startsWith('นางสาว') || s.firstName.startsWith('นาง')))).length}</td>
                      <td colSpan={2} className="border border-slate-900 px-4 py-2 text-center text-lg text-indigo-600">{displayedStudents.length}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-slate-200 shrink-0">
              <PrintSignatureBox role="ผู้สอน" name={teacherName} />
              <PrintSignatureBox role="หัวหน้าฝ่ายวิชาการ/ผู้ตรวจ" />
            </div>
          </PrintPageContainer>
        </>
      )}
    </PDFPrintHelper>
`;

code = code.replace(section4Regex, newSection4);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code);
