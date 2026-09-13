const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `  const saveSubject = async () => {
    if (!editingSubject.subjectName || !editingSubject.gradeLevel) return;
    setIsSaving(true);
    try {
      const isNew = !editingSubject.id;
      const id = isNew ? Date.now().toString() : editingSubject.id!;
      // Clean undefined values
      const cleanPayload = Object.entries(editingSubject).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      const payload: CurriculumSubject = {
        ...cleanPayload,
        id,
        subjectCode: editingSubject.subjectCode || '',
        subjectName: editingSubject.subjectName,
        gradeLevel: editingSubject.gradeLevel,
        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        standards: editingSubject.standards || [],
        createdAt: isNew ? new Date().toISOString() : (editingSubject.createdAt || new Date().toISOString()),
        updatedAt: new Date().toISOString()
      };
      
      if (payload.subjectType === 'academic') {
        payload.academicCategory = editingSubject.academicCategory || 'basic';
      } else {
        delete payload.academicCategory; // Ensure it's not present for activity
      }
      await setDoc(doc(db, 'curriculums', id), payload);
      await fetchCurriculums();
      setShowSubjectForm(false);
      setSelectedCurriculumId(id);
    } catch (error) {`;

const newTargetStr = `  const saveSubject = async () => {
    if (!editingSubject.subjectName || !editingSubject.gradeLevel) return;
    setIsSaving(true);
    try {
      const isNew = !editingSubject.id;
      
      // Get all selected grades, default to the single one if array is missing
      const selectedGrades = editingSubject.gradeLevels && editingSubject.gradeLevels.length > 0 
        ? editingSubject.gradeLevels 
        : [editingSubject.gradeLevel];

      // Clean undefined values
      const cleanPayload = Object.entries(editingSubject).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      // Create a separate document for EACH selected grade level
      const promises = selectedGrades.map((grade, index) => {
        // If editing an existing subject, use its ID for the FIRST grade selected.
        // For subsequent grades (meaning they added more grades during edit), create new IDs.
        // If it's a new subject altogether, generate a new ID for every grade.
        const docId = (!isNew && index === 0) ? editingSubject.id! : Date.now().toString() + index;
        
        const payload: CurriculumSubject = {
          ...cleanPayload,
          id: docId,
          subjectCode: editingSubject.subjectCode || '',
          subjectName: editingSubject.subjectName,
          gradeLevel: grade, // Set the specific grade
          subjectType: editingSubject.subjectType || 'academic',
          standards: editingSubject.standards || [],
          createdAt: isNew ? new Date().toISOString() : (editingSubject.createdAt || new Date().toISOString()),
          updatedAt: new Date().toISOString()
        };
        
        delete payload.gradeLevels; // Remove the array from the DB payload
        
        if (payload.subjectType === 'academic') {
          payload.academicCategory = editingSubject.academicCategory || 'basic';
        } else {
          delete payload.academicCategory; 
        }
        
        return setDoc(doc(db, 'curriculums', docId), payload);
      });

      await Promise.all(promises);
      
      await fetchCurriculums();
      setShowSubjectForm(false);
      
      // If we edited an existing one, keep it selected. 
      // If new, maybe just select the first one created, or none.
      if (!isNew) {
        setSelectedCurriculumId(editingSubject.id!);
      } else {
        setSelectedCurriculumId(null);
      }
    } catch (error) {`;

content = content.replace(targetStr, newTargetStr);

// Now fix the UI part where it shows multiple grades
const listTargetStr = `                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.isParent ? 'bg-indigo-100 text-indigo-700' : 
                          c.parentId ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-slate-100 text-slate-600'
                        }\`}>
                          {c.isParent ? 'วิชาหลัก' : c.parentId ? 'วิชาย่อย' : 'รายวิชา'}
                        </span>
                        
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.subjectType === 'activity' ? 'bg-purple-100 text-purple-700' :
                          c.academicCategory === 'additional' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }\`}>
                          {c.subjectType === 'activity' ? 'กิจกรรม' : 
                           (!c.subjectType || c.subjectType === 'academic') && c.academicCategory === 'additional' ? 'วิชาเพิ่มเติม' : 'วิชาพื้นฐาน'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate mb-0.5">{c.subjectName}</h4>
                      <div className="text-[10px] text-slate-400">
                        {c.gradeLevels && c.gradeLevels.length > 1 
                          ? \`\${c.gradeLevels[0]} - \${c.gradeLevels[c.gradeLevels.length - 1]}\`
                          : c.gradeLevel}
                      </div>`;

const newListTargetStr = `                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.isParent ? 'bg-indigo-100 text-indigo-700' : 
                          c.parentId ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-slate-100 text-slate-600'
                        }\`}>
                          {c.isParent ? 'วิชาหลัก' : c.parentId ? 'วิชาย่อย' : 'รายวิชา'}
                        </span>
                        
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.subjectType === 'activity' ? 'bg-purple-100 text-purple-700' :
                          c.academicCategory === 'additional' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }\`}>
                          {c.subjectType === 'activity' ? 'กิจกรรม' : 
                           (!c.subjectType || c.subjectType === 'academic') && c.academicCategory === 'additional' ? 'วิชาเพิ่มเติม' : 'วิชาพื้นฐาน'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate mb-0.5">{c.subjectName}</h4>
                      <div className="text-[10px] text-slate-400">
                        {c.gradeLevel}
                      </div>`;

content = content.replace(listTargetStr, newListTargetStr);

const logicStr = `    const matchesGrade = gradeFilter === 'all' || 
                         (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === getBaseGrade(gradeFilter))) ||
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);`;

const newLogicStr = `    const matchesGrade = gradeFilter === 'all' || 
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);`;

content = content.replace(logicStr, newLogicStr);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched curriculum manager to save as multiple docs");
