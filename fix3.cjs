const fs = require('fs');
let content = fs.readFileSync('src/components/SubjectChildManager.tsx', 'utf8');

const originalHeaderStart = `<div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">`;
const originalHeaderEnd = `      </div>\n\n      {isLoading ? (`;

const startIndex = content.indexOf(originalHeaderStart);
const endIndex = content.indexOf(`{isLoading ? (`, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find header chunk");
    process.exit(1);
}

const originalHeaderChunk = content.substring(startIndex, endIndex);

const newHeader = `<div className="flex flex-col mb-6 gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800">จัดการวิชาย่อย (Parent-Child)</h3>
            <p className="text-slate-500 text-sm mt-1">แตกวิชา {parentSubject.subjectName} เป็นวิชาย่อยเพื่อแยกสัดส่วนการสอนและคะแนน</p>
          </div>
          {canEdit && activeTab === 'structure' && (
            <div className="flex gap-2">
              <button 
                onClick={fetchAvailableMergeSubjects}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4 text-indigo-500" /> ดึงวิชาอื่นมารวม (Merge)
              </button>
              <button 
                onClick={() => {
                  setEditingChild({
                    subjectCode: parentSubject.subjectCode ? \`\${parentSubject.subjectCode}-\` : '',
                    weightPercentage: 0,
                    totalHours: 0
                  });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> เพิ่มวิชาย่อย
              </button>
            </div>
          )}
        </div>
        
        {/* Tabs for Structure / Aggregation */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('structure')}
            className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors \${activeTab === 'structure' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            <Layers className="h-4 w-4 inline-block mr-2" /> โครงสร้างและสัดส่วน
          </button>
          <button 
            onClick={() => setActiveTab('aggregation')}
            className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors \${activeTab === 'aggregation' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            <Calculator className="h-4 w-4 inline-block mr-2" /> ประมวลผลคะแนนรวม
          </button>
        </div>
      </div>

      {activeTab === 'structure' && (
        <div className="space-y-6 animate-in fade-in duration-300">
      `;

content = content.replace(originalHeaderChunk, newHeader);

// Now, replace the end of the isLoading block
const endOfIsLoadingStr = `      )}\n\n{showForm && (`;
const newEndOfIsLoadingStr = `      )}
        </div>
      )}

      {activeTab === 'aggregation' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                ปีการศึกษา {systemAcademicYear}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                เทอม {systemSemester}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                {parentSubject.gradeLevel}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchScores}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> ดึงข้อมูลใหม่
              </button>
              <button 
                onClick={handleSaveAggregation}
                disabled={isSaving || children.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} 
                บันทึกผลการเรียนวิชาหลัก
              </button>
            </div>
          </div>
          
          {toastMessage && (
            <div className={\`p-4 rounded-xl flex items-center gap-3 \${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}\`}>
              {toastMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p className="font-bold">{toastMessage.text}</p>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <span className="font-bold text-slate-700">สัดส่วนคะแนนย่อย:</span>
              {children.length > 0 ? children.map(c => (
                <span key={c.id} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 shadow-sm">
                  {c.subjectName} ({c.weightPercentage || 0}%)
                </span>
              )) : <span className="text-sm text-rose-500 font-medium">ยังไม่มีการตั้งค่าวีชาย่อยในโครงสร้าง</span>}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-16 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">เลขที่</th>
                    <th className="px-4 py-3 w-48 sticky left-16 bg-slate-50 z-10 border-r border-slate-200">ชื่อ-นามสกุล</th>
                    {children.map(child => (
                      <th key={child.id} className="px-4 py-3 text-center border-r border-slate-200 min-w-[120px]">
                        คะแนน {child.subjectName} <br/>
                        <span className="text-xs text-indigo-500 font-normal">(ปรับเป็น {child.weightPercentage || 0}%)</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center bg-indigo-50 text-indigo-700 border-r border-indigo-100 w-24">คะแนนรวม</th>
                    <th className="px-4 py-3 text-center bg-indigo-50 text-indigo-700 w-24">ผลการเรียน</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetchingScores ? (
                    <tr>
                      <td colSpan={5 + children.length} className="px-4 py-8 text-center text-slate-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        กำลังดึงข้อมูลคะแนน...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={5 + children.length} className="px-4 py-8 text-center text-slate-500">ไม่มีข้อมูลนักเรียน</td>
                    </tr>
                  ) : (
                    students.map(student => {
                      let finalTotal = 0;
                      
                      return (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 text-center sticky left-0 bg-white border-r border-slate-200">{student.number}</td>
                          <td className="px-4 py-2 whitespace-nowrap sticky left-16 bg-white border-r border-slate-200">{student.firstName} {student.lastName}</td>
                          
                          {children.map(child => {
                            const weight = child.weightPercentage || 0;
                            const rawScore = childScores[child.id]?.[student.id];
                            const hasScore = rawScore !== undefined;
                            const weightedScore = hasScore ? (rawScore * weight) / 100 : 0;
                            finalTotal += weightedScore;
                            
                            return (
                              <td key={child.id} className="px-4 py-2 text-center border-r border-slate-100">
                                {hasScore ? (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700">{weightedScore.toFixed(1)}</span>
                                    <span className="text-[10px] text-slate-400">ดิบ: {rawScore}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}
                          
                          <td className="px-4 py-2 text-center font-black text-indigo-600 bg-indigo-50/30 border-r border-indigo-100">
                            {Math.round(finalTotal)}
                          </td>
                          <td className="px-4 py-2 text-center font-black text-emerald-600 bg-indigo-50/30">
                            {calculateGrade(Math.round(finalTotal))}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

{showForm && (`;

content = content.replace(endOfIsLoadingStr, newEndOfIsLoadingStr);
fs.writeFileSync('src/components/SubjectChildManager.tsx', content);
console.log("Successfully applied fix3");
