const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

// 1. Add state for preview data
const stateTarget = "const [isImporting, setIsImporting] = useState(false);";
const stateReplacement = `const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<Map<string, CurriculumSubject> | null>(null);`;
code = code.replace(stateTarget, stateReplacement);

// 2. Change handleFileUpload to setPreviewData instead of saving to firebase
const uploadTarget = `      // Save to firebase
      let successCount = 0;
      for (const [_, curr] of newCurriculums) {
        // Check if subject already exists
        const existing = curriculums.find(c => c.subjectName === curr.subjectName && c.gradeLevel === curr.gradeLevel);
        if (existing) {
          // Merge standards
          const merged = { ...existing };
          curr.standards.forEach(newStd => {
            const extStd = merged.standards.find(s => s.title === newStd.title);
            if (extStd) {
              // Merge indicators
              newStd.indicators.forEach(newInd => {
                const extInd = extStd.indicators.find(i => i.code === newInd.code);
                if (!extInd) {
                  extStd.indicators.push(newInd);
                }
              });
            } else {
              merged.standards.push(newStd);
            }
          });
          merged.updatedAt = new Date().toISOString();
          await setDoc(doc(db, 'curriculums', merged.id), merged);
        } else {
          await setDoc(doc(db, 'curriculums', curr.id), curr);
        }
        successCount++;
      }
      
      setAlertModal({ isOpen: true, title: 'นำเข้าข้อมูลสำเร็จ', message: \`นำเข้าข้อมูลตัวชี้วัดจำนวน \${successCount} รายวิชาเรียบร้อยแล้ว\`, type: 'success' });
      await fetchCurriculums();`;

const uploadReplacement = `      setPreviewData(newCurriculums);`;
code = code.replace(uploadTarget, uploadReplacement);

// 3. Add confirmImport function
const confirmImportCode = `
  const confirmImport = async () => {
    if (!previewData) return;
    setIsImporting(true);
    try {
      let successCount = 0;
      for (const [_, curr] of previewData) {
        const existing = curriculums.find(c => c.subjectName === curr.subjectName && c.gradeLevel === curr.gradeLevel);
        if (existing) {
          const merged = { ...existing };
          curr.standards.forEach(newStd => {
            const extStd = merged.standards.find(s => s.title === newStd.title);
            if (extStd) {
              newStd.indicators.forEach(newInd => {
                const extInd = extStd.indicators.find(i => i.code === newInd.code);
                if (!extInd) {
                  extStd.indicators.push(newInd);
                }
              });
            } else {
              merged.standards.push(newStd);
            }
          });
          merged.updatedAt = new Date().toISOString();
          await setDoc(doc(db, 'curriculums', merged.id), merged);
        } else {
          await setDoc(doc(db, 'curriculums', curr.id), curr);
        }
        successCount++;
      }
      
      setAlertModal({ isOpen: true, title: 'นำเข้าข้อมูลสำเร็จ', message: \`นำเข้าข้อมูลตัวชี้วัดจำนวน \${successCount} รายวิชาเรียบร้อยแล้ว\`, type: 'success' });
      setPreviewData(null);
      await fetchCurriculums();
    } catch (error) {
      console.error('Error saving imported data:', error);
      setAlertModal({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลตัวชี้วัด', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const clearIndicators = async (subjectId: string) => {
    setConfirmModal({ isOpen: true, title: 'ล้างข้อมูลตัวชี้วัด', message: 'ยืนยันการล้างข้อมูลตัวชี้วัดทั้งหมดในรายวิชานี้?', onConfirm: async () => {
      setConfirmModal(null);
      try {
        const curr = curriculums.find(c => c.id === subjectId);
        if (!curr) return;
        const updated = { ...curr, standards: [], updatedAt: new Date().toISOString() };
        await setDoc(doc(db, 'curriculums', subjectId), updated);
        await fetchCurriculums();
        if (selectedCurriculumId === subjectId) {
          const refreshed = curriculums.find(c => c.id === subjectId);
          if (refreshed) {
             refreshed.standards = [];
          }
        }
        setAlertModal({ isOpen: true, title: 'ล้างข้อมูลสำเร็จ', message: 'ล้างข้อมูลตัวชี้วัดเรียบร้อยแล้ว', type: 'success' });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'curriculums');
      }
    }});
  };
`;

const handleFileUploadEnd = `    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };`;

code = code.replace(handleFileUploadEnd, handleFileUploadEnd + "\n" + confirmImportCode);

// 4. Add the Preview Modal JSX
const previewModalJsx = `
      {/* Import Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800">ตัวอย่างข้อมูลก่อนนำเข้า</h3>
                <p className="text-sm text-slate-500 mt-1">ตรวจสอบความถูกต้องของข้อมูลตัวชี้วัดก่อนบันทึกลงระบบ</p>
              </div>
              <button onClick={() => setPreviewData(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-slate-50">
              {Array.from(previewData.values()).map((subject, idx) => (
                <div key={idx} className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                    <h4 className="font-bold text-indigo-900">{subject.subjectName} ({subject.gradeLevel})</h4>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {subject.standards.map((std, sIdx) => (
                      <div key={sIdx} className="space-y-3">
                        <div className="font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg inline-block">
                          {std.title}
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 w-32">รหัส</th>
                                <th className="px-4 py-3 min-w-[300px]">คำอธิบาย</th>
                                <th className="px-4 py-3 w-40 text-center">ประเภท</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {std.indicators.map((ind, iIdx) => (
                                <tr key={iIdx} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-medium text-slate-700">{ind.code}</td>
                                  <td className="px-4 py-3 text-slate-600 whitespace-pre-wrap">{ind.description}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${ind.type === 'core' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
                                      {ind.type === 'core' ? 'ตัวชี้วัดระหว่างทาง' : 'ตัวชี้วัดปลายทาง'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
              <button
                onClick={() => setPreviewData(null)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmImport}
                disabled={isImporting}
                className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                ยืนยันการนำเข้าข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}`;

const previewModalTarget = "{/* Alert Modal */}";
code = code.replace(previewModalTarget, previewModalJsx + "\n      {/* Alert Modal */}");

// 5. Add Clear Indicators Button next to edit/delete buttons for the selected subject
const clearIndicatorsTarget = `<button 
                    onClick={() => deleteSubject(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ลบ
                  </button>`;

const clearIndicatorsReplacement = `<button 
                    onClick={() => deleteSubject(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ลบรายวิชา
                  </button>
                  <button 
                    onClick={() => clearIndicators(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-amber-200 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ล้างตัวชี้วัดทั้งหมด
                  </button>`;

code = code.replace(clearIndicatorsTarget, clearIndicatorsReplacement);

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
