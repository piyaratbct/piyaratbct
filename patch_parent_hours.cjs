const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectChildManager.tsx', 'utf8');

// 1. Add saving state for parent
code = code.replace(
    /const \[isMerging, setIsMerging\] = useState\(false\);/,
    `const [isMerging, setIsMerging] = useState(false);
  const [parentHours, setParentHours] = useState(parentSubject.totalHours || parentSubject.requiredHoursPerTerm || 0);
  const [isSavingParent, setIsSavingParent] = useState(false);

  useEffect(() => {
    setParentHours(parentSubject.totalHours || parentSubject.requiredHoursPerTerm || 0);
  }, [parentSubject]);

  const handleUpdateParentHours = async (val) => {
    setParentHours(val);
    if (!canEdit) return;
    setIsSavingParent(true);
    try {
      await setDoc(doc(db, 'curriculums', parentSubject.id), { 
          totalHours: val, 
          requiredHoursPerTerm: Math.round(val / 2) 
      }, { merge: true });
      onUpdate();
    } catch(e) {
      console.error("Error updating parent hours", e);
    } finally {
      setIsSavingParent(false);
    }
  };`
);

// 2. Modify the grid to be 3 columns instead of 2
const gridRegex = /<div className="grid grid-cols-2 gap-4">([\s\S]*?)<\/div>\s*<div className="space-y-3">/;

const newGrid = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={\`p-4 rounded-xl border \${totalWeight > 100 ? 'bg-rose-50 border-rose-200 text-rose-700' : totalWeight === 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'}\`}>
              <div className="text-xs font-bold mb-1 opacity-70">น้ำหนักคะแนนรวม (เป้าหมาย 100%)</div>
              <div className="text-2xl font-black">{totalWeight}%</div>
              {totalWeight > 100 && <div className="text-xs mt-1">คำเตือน: น้ำหนักเกิน 100%</div>}
            </div>
            
            <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-900">
              <div className="text-xs font-bold mb-1 opacity-70 flex items-center justify-between">
                <span>เวลาเรียนวิชาหลัก (เป้าหมาย)</span>
                {isSavingParent && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
              <div className="flex items-end gap-2 mt-1">
                <input 
                  type="number" 
                  disabled={!canEdit}
                  value={parentHours || ''}
                  onChange={(e) => setParentHours(Number(e.target.value))}
                  onBlur={(e) => handleUpdateParentHours(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xl font-black bg-white border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold mb-1">ชั่วโมง/ปี</span>
              </div>
            </div>

            <div className={\`p-4 rounded-xl border \${totalChildHours > parentHours ? 'bg-rose-50 border-rose-200 text-rose-700' : totalChildHours === parentHours ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'}\`}>
              <div className="text-xs font-bold mb-1 opacity-70">เวลาเรียนรวมของวิชาย่อย (แจกจ่าย)</div>
              <div className="text-2xl font-black">{totalChildHours} <span className="text-sm font-bold">ชั่วโมง</span></div>
              {totalChildHours > parentHours && parentHours > 0 && <div className="text-xs mt-1">คำเตือน: เวลาเกินเป้าหมายวิชาหลัก</div>}
              {totalChildHours < parentHours && parentHours > 0 && <div className="text-xs mt-1">ขาดอีก: {parentHours - totalChildHours} ชม.</div>}
            </div>
          </div>

          <div className="space-y-3">`;

code = code.replace(gridRegex, newGrid);

fs.writeFileSync('src/components/SubjectChildManager.tsx', code);
console.log("Patched SubjectChildManager.tsx");
