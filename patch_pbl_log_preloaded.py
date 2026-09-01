import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Add props
    props_search = """interface PBLLessonLogFormProps {
  initialRecord: LessonRecord | null;
  teacherId: string;
  onSave: (record: LessonRecord) => void;
  onCancel?: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  systemAcademicYear?: string;
  systemSemester?: string;
}"""
    props_replace = """interface PBLLessonLogFormProps {
  initialRecord: LessonRecord | null;
  teacherId: string;
  onSave: (record: LessonRecord) => void;
  onCancel?: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  systemAcademicYear?: string;
  systemSemester?: string;
  preloadedPlan?: LessonPlan | null;
  onClearPreloadedPlan?: () => void;
}"""
    code = code.replace(props_search, props_replace)
    
    # Destructure props
    destruct_search = """  systemAcademicYear,
  systemSemester
}: PBLLessonLogFormProps) {"""
    destruct_replace = """  systemAcademicYear,
  systemSemester,
  preloadedPlan,
  onClearPreloadedPlan
}: PBLLessonLogFormProps) {"""
    code = code.replace(destruct_search, destruct_replace)
    
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
    code = code.replace(target_search, target_replace)
    
    # Add ID to evaluation section header
    id_search = """<label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            7. แบบประเมินการจัดการเรียนรู้"""
    id_replace = """<label id="evaluation-section-header" className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            7. แบบประเมินการจัดการเรียนรู้"""
    code = code.replace(id_search, id_replace)
    
    # Same ID for lesson_log_form
    if filename == 'src/components/PBLLessonLogForm.tsx':
        pass
        
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/PBLLessonLogForm.tsx')
