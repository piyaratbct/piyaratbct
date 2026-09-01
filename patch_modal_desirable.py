import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Import DESIRABLE_CHARACTERISTICS
    if "DESIRABLE_CHARACTERISTICS" not in code:
        import_str = "import { LessonRecord, LessonPlan } from '../types';"
        import_replace = "import { LessonRecord, LessonPlan } from '../types';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';"
        code = code.replace(import_str, import_replace)

    # Add helper function inside the component or outside
    helper_code = """
const getDesirableFullText = (id: string) => {
  for (const char of DESIRABLE_CHARACTERISTICS) {
    const indicator = char.indicators.find(ind => ind.id === id);
    if (indicator) {
      return `${indicator.id} ${indicator.text}`;
    }
  }
  return id;
};
"""
    if "getDesirableFullText" not in code:
        code = code.replace("export function StudentEvaluationModal({", helper_code + "\nexport function StudentEvaluationModal({")

    # Change the table header for importedDesirable
    search_th = """                          {importedDesirable.map((char, idx) => (
                            <th key={idx} className="px-4 py-3 text-center font-bold text-slate-700 min-w-[120px] max-w-[200px] whitespace-normal">
                              {char}
                            </th>
                          ))}"""
    
    replace_th = """                          {importedDesirable.map((char, idx) => (
                            <th key={idx} className="px-4 py-3 text-center font-bold text-slate-700 min-w-[120px] max-w-[200px] whitespace-normal">
                              {getDesirableFullText(char)}
                            </th>
                          ))}"""
    
    if "getDesirableFullText(char)" not in code:
        code = code.replace(search_th, replace_th)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/StudentEvaluationModal.tsx')
