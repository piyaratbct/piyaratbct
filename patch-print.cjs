const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf8');

// 1. Insert gradeDistribution memo
const importInsertion = `  const gradeDistribution = React.useMemo(() => {
    const dist = {};
    let totalAssessed = 0;
    
    const isActivity = subject.includes('กิจกรรม') || subject.includes('ลูกเสือ') || subject.includes('แนะแนว') || subject.includes('ชุมนุม');
    const isPrimary12 = gradeLevel === 'ประถมศึกษาปีที่ 1' || gradeLevel === 'ประถมศึกษาปีที่ 2';
    
    if (isActivity) {
      dist['ผ'] = 0;
      dist['มผ'] = 0;
    } else if (isPrimary12) {
      dist['ดีเยี่ยม'] = 0;
      dist['ดี'] = 0;
      dist['ผ่าน'] = 0;
      dist['ไม่ผ่าน'] = 0;
    } else {
      ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส'].forEach(g => dist[g] = 0);
    }

    students.forEach(st => {
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
        if (dist[g] === undefined) dist[g] = 0;
        dist[g]++;
        totalAssessed++;
      }
    });

    return { dist, totalAssessed };
  }, [students, scores, academicYear, semester, subject, attendanceStats, gradeLevel]);

  return (`;

code = code.replace("  return (", importInsertion);

// 2. Insert Section 4
const section4 = `          {/* SECTION 4: สรุปสถิติผลการเรียน */}
          <PrintPageContainer layout="portrait" className="flex flex-col">
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
              
              <div className="max-w-2xl mx-auto">
                <table className="w-full text-sm border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-4 py-2 text-center w-1/2">ระดับผลการเรียน / ผลการประเมิน</th>
                      <th className="border border-slate-900 px-4 py-2 text-center w-1/4">จำนวน (คน)</th>
                      <th className="border border-slate-900 px-4 py-2 text-center w-1/4">ร้อยละ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradeDistribution.dist).map(([grade, count]) => (
                      <tr key={grade}>
                        <td className="border border-slate-900 px-4 py-2 text-center font-bold">{grade}</td>
                        <td className="border border-slate-900 px-4 py-2 text-center">{count}</td>
                        <td className="border border-slate-900 px-4 py-2 text-center">
                          {gradeDistribution.totalAssessed > 0 ? ((Number(count) / gradeDistribution.totalAssessed) * 100).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold">
                      <td className="border border-slate-900 px-4 py-2 text-right">รวมนักเรียนที่ได้รับการประเมินทั้งหมด</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">{gradeDistribution.totalAssessed}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">100.00</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-600">
                      <td className="border border-slate-900 px-4 py-2 text-right">นักเรียนทั้งหมดในห้อง</td>
                      <td colSpan={2} className="border border-slate-900 px-4 py-2 text-center">{students.length}</td>
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
  );
};`;

code = code.replace(`        </>
      )}
    </PDFPrintHelper>
  );
};`, section4);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code);
