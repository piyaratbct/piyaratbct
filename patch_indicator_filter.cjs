const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const selectorTarget = `const IndicatorSelector = ({ 
  curriculums, 
  usedIndicators, 
  selectedText, 
  onSelectChange,
  type
}: { 
  curriculums: any[], 
  usedIndicators: Set<string>, 
  selectedText: string, 
  onSelectChange: (newText: string) => void,
  type: 'core' | 'terminal' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!curriculums || curriculums.length === 0) return null;`;

const selectorReplacement = `const IndicatorSelector = ({ 
  curriculums, 
  usedIndicators, 
  selectedText, 
  onSelectChange,
  type
}: { 
  curriculums: any[], 
  usedIndicators: Set<string>, 
  selectedText: string, 
  onSelectChange: (newText: string) => void,
  type: 'core' | 'terminal' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  
  if (!curriculums || curriculums.length === 0) return null;`;

code = code.replace(selectorTarget, selectorReplacement);

const renderTarget = `      {isOpen && (
        <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar space-y-4 bg-white">
          {curriculums.map((curr, cIdx) => (
            <div key={cIdx}>
              {curr.standards.map((std: any, sIdx: number) => {`;

const renderReplacement = `      {isOpen && (
        <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar flex flex-col bg-white">
          {curriculums.length > 1 && (
            <div className="mb-3 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">กรองตามระดับชั้น:</label>
              <select 
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              >
                <option value="all">แสดงทั้งหมด</option>
                {curriculums.map(c => (
                  <option key={c.gradeLevel} value={c.gradeLevel}>{c.gradeLevel}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-4">
          {curriculums.filter(c => selectedGradeFilter === 'all' || c.gradeLevel === selectedGradeFilter).map((curr, cIdx) => (
            <div key={cIdx}>
              <div className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded mb-2 border border-indigo-100">{curr.gradeLevel}</div>
              {curr.standards.map((std: any, sIdx: number) => {`;

code = code.replace(renderTarget, renderReplacement);

// Fix the closing tags for the added div
const closingTarget = `              })}
            </div>
          ))}
        </div>
      )}
    </div>`;

const closingReplacement = `              })}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>`;

code = code.replace(closingTarget, closingReplacement);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
