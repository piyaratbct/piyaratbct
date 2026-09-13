const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

// Add OBEC standard import functions
const importFuncs = `  const importOBECCharacteristics = async (subjectId: string) => {
    if (!selectedCurriculum) return;
    setIsSaving(true);
    try {
      const OBEC_CHARACTERISTICS: CurriculumStandard = {
        id: 'obec_char_' + Date.now(),
        title: 'คุณลักษณะอันพึงประสงค์ 8 ประการ',
        indicators: [
          { code: 'ข้อ 1', description: 'รักชาติ ศาสน์ กษัตริย์', type: 'core' },
          { code: 'ข้อ 2', description: 'ซื่อสัตย์สุจริต', type: 'core' },
          { code: 'ข้อ 3', description: 'มีวินัย', type: 'core' },
          { code: 'ข้อ 4', description: 'ใฝ่เรียนรู้', type: 'core' },
          { code: 'ข้อ 5', description: 'อยู่อย่างพอเพียง', type: 'core' },
          { code: 'ข้อ 6', description: 'มุ่งมั่นในการทำงาน', type: 'core' },
          { code: 'ข้อ 7', description: 'รักความเป็นไทย', type: 'core' },
          { code: 'ข้อ 8', description: 'มีจิตสาธารณะ', type: 'core' }
        ]
      };
      
      const newSubject = { ...selectedCurriculum };
      newSubject.standards = [...(newSubject.standards || []), OBEC_CHARACTERISTICS];
      
      await setDoc(doc(db, 'curriculums', subjectId), newSubject);
      await fetchCurriculums();
      setAlertModal({ isOpen: true, title: 'นำเข้าสำเร็จ', message: 'นำเข้าคุณลักษณะอันพึงประสงค์ 8 ประการ เรียบร้อยแล้ว', type: 'success' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const importOBECCompetencies = async (subjectId: string) => {
    if (!selectedCurriculum) return;
    setIsSaving(true);
    try {
      const OBEC_COMPETENCIES: CurriculumStandard = {
        id: 'obec_comp_' + Date.now(),
        title: 'สมรรถนะสำคัญของผู้เรียน 5 ประการ',
        indicators: [
          { code: 'ข้อ 1', description: 'ความสามารถในการสื่อสาร', type: 'core' },
          { code: 'ข้อ 2', description: 'ความสามารถในการคิด', type: 'core' },
          { code: 'ข้อ 3', description: 'ความสามารถในการแก้ปัญหา', type: 'core' },
          { code: 'ข้อ 4', description: 'ความสามารถในการใช้ทักษะชีวิต', type: 'core' },
          { code: 'ข้อ 5', description: 'ความสามารถในการใช้เทคโนโลยี', type: 'core' }
        ]
      };
      
      const newSubject = { ...selectedCurriculum };
      newSubject.standards = [...(newSubject.standards || []), OBEC_COMPETENCIES];
      
      await setDoc(doc(db, 'curriculums', subjectId), newSubject);
      await fetchCurriculums();
      setAlertModal({ isOpen: true, title: 'นำเข้าสำเร็จ', message: 'นำเข้าสมรรถนะสำคัญของผู้เรียน 5 ประการ เรียบร้อยแล้ว', type: 'success' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const saveStandard = async () => {`;

content = content.replace("  const saveStandard = async () => {", importFuncs);

// Patch tab rendering based on subject type
const tabRenderStr = `              <button 
                onClick={() => setInnerTab('indicators')}
                className={\`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap \${innerTab === 'indicators' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
              >
                1. คลังตัวชี้วัด (Indicator Bank)
              </button>`;

const newTabRenderStr = `              <button 
                onClick={() => setInnerTab('indicators')}
                className={\`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap \${innerTab === 'indicators' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
              >
                {selectedCurriculum?.subjectType === 'activity' ? '1. จุดประสงค์ / เกณฑ์ประเมิน' : '1. คลังตัวชี้วัด (Indicator Bank)'}
              </button>`;
              
content = content.replace(tabRenderStr, newTabRenderStr);

// Change the buttons for activities
const buttonsStr = `                  <button 
                    onClick={() => {
                      setEditingStandard({ title: '' });
                      setShowStandardForm(true);
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> เพิ่มมาตรฐาน
                  </button>
                </div>
                )}
              </div>

              <div className="space-y-6">
                {selectedCurriculum.standards && selectedCurriculum.standards.length > 0 ? (`;

const newButtonsStr = `                  <button 
                    onClick={() => {
                      setEditingStandard({ title: '' });
                      setShowStandardForm(true);
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> {selectedCurriculum?.subjectType === 'activity' ? 'เพิ่มเกณฑ์การประเมิน' : 'เพิ่มมาตรฐาน'}
                  </button>
                </div>
                )}
              </div>
              
              {canEdit && selectedCurriculum?.subjectType === 'activity' && (
                <div className="flex gap-2 mb-6">
                  <button 
                    onClick={() => importOBECCharacteristics(selectedCurriculum.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg font-bold shadow-sm hover:bg-emerald-100 transition-colors text-xs"
                  >
                    <CheckCircle className="h-4 w-4" /> นำเข้าคุณลักษณะอันพึงประสงค์ 8 ประการ (สพฐ.)
                  </button>
                  <button 
                    onClick={() => importOBECCompetencies(selectedCurriculum.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg font-bold shadow-sm hover:bg-blue-100 transition-colors text-xs"
                  >
                    <Award className="h-4 w-4" /> นำเข้าสมรรถนะสำคัญของผู้เรียน 5 ประการ (สพฐ.)
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {selectedCurriculum.standards && selectedCurriculum.standards.length > 0 ? (`;
                
content = content.replace(buttonsStr, newButtonsStr);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched CurriculumManager with OBEC");
