const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const importTarget = "import { SignaturePadModal } from \"./PrintTemplate\";";
const importReplacement = `import { SignaturePadModal } from "./PrintTemplate";
import { ChevronDown, ChevronUp, Check } from "lucide-react";`;
code = code.replace(importTarget, importReplacement);

// Let's add the selector component code inside the file but before LessonPlanForm function
const selectorCode = `
const IndicatorSelector = ({ 
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
  
  if (!curriculums || curriculums.length === 0) return null;

  const toggleIndicator = (code: string, desc: string) => {
    const itemStr = \`\${code} \${desc}\`;
    let currentLines = selectedText.split('\\n').map(l => l.trim()).filter(Boolean);
    
    // Check if already in list by code
    const existingIndex = currentLines.findIndex(l => l.startsWith(code));
    if (existingIndex >= 0) {
      currentLines.splice(existingIndex, 1);
    } else {
      currentLines.push(itemStr);
    }
    
    onSelectChange(currentLines.join('\\n'));
  };

  const isSelected = (code: string) => {
    return selectedText.split('\\n').some(l => l.trim().startsWith(code));
  };

  let totalIndicators = 0;
  let remainingIndicators = 0;

  return (
    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          เลือกจากหลักสูตร ({type === 'core' ? 'ต้นทาง' : 'ปลายทาง'})
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar space-y-4 bg-white">
          {curriculums.map((curr, cIdx) => (
            <div key={cIdx}>
              {curr.standards.map((std: any, sIdx: number) => {
                const indicators = std.indicators.filter((i: any) => i.type === type);
                if (indicators.length === 0) return null;
                
                return (
                  <div key={sIdx} className="mb-3">
                    <div className="font-bold text-slate-700 text-[11px] mb-2 bg-slate-100 px-2 py-1 rounded">
                      {std.title}
                    </div>
                    <div className="space-y-1.5 pl-2">
                      {indicators.map((ind: any, iIdx: number) => {
                        totalIndicators++;
                        const used = usedIndicators.has(ind.code);
                        if (!used) remainingIndicators++;
                        const selected = isSelected(ind.code);
                        
                        return (
                          <label 
                            key={iIdx} 
                            className={\`flex items-start gap-2 p-2 rounded-lg border sm:cursor-pointer transition-colors \${selected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-300'}\`}
                          >
                            <div className="mt-0.5">
                              <input 
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleIndicator(ind.code, ind.description)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 h-3.5 w-3.5"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-[11px] font-bold text-slate-800">
                                {ind.code}
                                {used ? (
                                  <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                                    <Check className="h-3 w-3" /> ถูกใช้แล้ว
                                  </span>
                                ) : (
                                  <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                                    <AlertCircle className="h-3 w-3" /> ยังไม่ถูกใช้ (คงเหลือ)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">
                                {ind.description}
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
`;

const interfaceTarget = "interface LessonPlanFormProps {";
code = code.replace(interfaceTarget, selectorCode + "\n" + interfaceTarget);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
