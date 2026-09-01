import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Add props
    props_search = """  systemAcademicYear?: string;
  systemSemester?: string;
}"""
    props_replace = """  systemAcademicYear?: string;
  systemSemester?: string;
  preloadedPlan?: LessonPlan | null;
  onClearPreloadedPlan?: () => void;
}"""
    if "preloadedPlan?: LessonPlan" not in code:
        code = code.replace(props_search, props_replace)
    
    # Destructure props
    destruct_search = """export function LessonLogForm({ 
  initialRecord, 
  teacherId, 
  onSave, 
  onCancel, 
  currentUserRole,
  currentUserName,
  systemAcademicYear = '2567',
  systemSemester = '1'
}: LessonLogFormProps) {"""
    destruct_replace = """export function LessonLogForm({ 
  initialRecord, 
  teacherId, 
  onSave, 
  onCancel, 
  currentUserRole,
  currentUserName,
  systemAcademicYear = '2567',
  systemSemester = '1',
  preloadedPlan,
  onClearPreloadedPlan
}: LessonLogFormProps) {"""
    if "preloadedPlan," not in code:
        code = code.replace(destruct_search, destruct_replace)
        
    # Make sure we replace the single line destructuring if it's there
    destruct_search_single = "export function LessonLogForm({ initialRecord, teacherId, onSave, onCancel, systemAcademicYear = '2567', systemSemester = '1' }: LessonLogFormProps) {"
    destruct_replace_single = "export function LessonLogForm({ initialRecord, teacherId, onSave, onCancel, systemAcademicYear = '2567', systemSemester = '1', preloadedPlan, onClearPreloadedPlan }: LessonLogFormProps) {"
    code = code.replace(destruct_search_single, destruct_replace_single)
    
    # Add useEffect for preloadedPlan
    effect_code = """  // Auto-import from preloaded plan
  useEffect(() => {
    if (preloadedPlan) {
      handleImportPlan(preloadedPlan);
      
      // Delay scrolling to give time for UI to render tables
      setTimeout(() => {
        const evalHeader = document.getElementById("evaluation-section-header");
        if (evalHeader) {
          evalHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      
      if (onClearPreloadedPlan) {
        onClearPreloadedPlan();
      }
    }
  }, [preloadedPlan, onClearPreloadedPlan]);"""
    
    # Insert after `const handleImportPlan = ...` block
    target_search = """    }));
  };"""
    target_replace = """    }));
  };
  
""" + effect_code
    if "preloadedPlan" not in target_replace and "preloadedPlan" not in code[code.find(target_search):code.find(target_search)+500]:
        code = code.replace(target_search, target_replace, 1) # replace only first occurrence
    
    # Add ID to evaluation section header
    id_search = """<label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            7. แบบประเมินการจัดการเรียนรู้"""
    id_replace = """<label id="evaluation-section-header" className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            7. แบบประเมินการจัดการเรียนรู้"""
    code = code.replace(id_search, id_replace)
    
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonLogForm.tsx')
