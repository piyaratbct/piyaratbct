const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

// Inject importKindergarten68Standards
const importK68Code = `  const importKindergarten68Standards = async (subjectId: string) => {
    if (!selectedCurriculum) return;
    setIsSaving(true);
    try {
      const kgStandards: CurriculumStandard[] = [
        {
          id: 'kg68_1_' + Date.now(),
          title: '1. ด้านสุขภาวะทางกาย (Physical)',
          indicators: [
            { id: Date.now().toString() + '1', code: 'กาย.1', description: 'รักษาสุขภาพอนามัยส่วนตน', type: 'core' },
            { id: Date.now().toString() + '2', code: 'กาย.2', description: 'เคลื่อนไหวร่างกายอย่างคล่องแคล่วและทรงตัวได้ดี', type: 'core' }
          ]
        },
        {
          id: 'kg68_2_' + Date.now(),
          title: '2. ด้านอารมณ์ จิตใจ และสังคม (Emotional & Social)',
          indicators: [
            { id: Date.now().toString() + '3', code: 'อารมณ์.1', description: 'แสดงออกทางอารมณ์ได้อย่างเหมาะสม', type: 'core' },
            { id: Date.now().toString() + '4', code: 'อารมณ์.2', description: 'เล่นและทำงานร่วมกับผู้อื่นได้', type: 'core' }
          ]
        },
        {
          id: 'kg68_3_' + Date.now(),
          title: '3. ด้านความเป็นพลเมืองและความเป็นไทย (Citizenship & Thainess)',
          indicators: [
            { id: Date.now().toString() + '5', code: 'พม.1', description: 'มีส่วนร่วมสร้างข้อตกลงและปฏิบัติตามกฎของห้องเรียน', type: 'core' },
            { id: Date.now().toString() + '6', code: 'พม.2', description: 'ภูมิใจในความเป็นไทยและท้องถิ่น', type: 'core' }
          ]
        },
        {
          id: 'kg68_4_' + Date.now(),
          title: '4. ด้านสติปัญญา (Intellectual)',
          indicators: [
            { id: Date.now().toString() + '7', code: 'ปญ.1', description: 'สื่อสารความคิดและความรู้สึกได้', type: 'core' },
            { id: Date.now().toString() + '8', code: 'ปญ.2', description: 'มีทักษะการคิดพื้นฐานและการแก้ปัญหา', type: 'core' }
          ]
        }
      ];
      
      const newSubject = { ...selectedCurriculum };
      newSubject.standards = [...(newSubject.standards || []), ...kgStandards];
      newSubject.updatedAt = new Date().toISOString();
      await setDoc(doc(db, 'curriculums', newSubject.id), newSubject);
      setCurriculums(prev => prev.map(c => c.id === newSubject.id ? newSubject : c));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

`;

code = code.replace(
  'const importOBECCharacteristics = async',
  importK68Code + '  const importOBECCharacteristics = async'
);

// Add button for Kindergarten
const kgButtonCode = `
              {canEdit && selectedCurriculum?.gradeLevel.includes('อนุบาล') && (
                <div className="flex gap-2 mb-6">
                  <button 
                    onClick={() => importKindergarten68Standards(selectedCurriculum.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-700 rounded-lg font-bold shadow-sm hover:bg-pink-100 transition-colors text-xs"
                  >
                    <CheckCircle className="h-4 w-4" /> นำเข้าแม่แบบหลักสูตรปฐมวัย พ.ศ. 2568 (สมรรถนะ 4 ด้าน)
                  </button>
                </div>
              )}
`;

code = code.replace(
  '{canEdit && selectedCurriculum?.subjectType === \'activity\' && (',
  kgButtonCode + '              {canEdit && selectedCurriculum?.subjectType === \'activity\' && ('
);

fs.writeFileSync('src/components/CurriculumManager.tsx', code);
console.log('Patched CurriculumManager.tsx successfully');
