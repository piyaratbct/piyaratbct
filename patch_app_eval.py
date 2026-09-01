import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    state_search = "const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);"
    state_replace = """const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);
  const [preloadedPlanForLog, setPreloadedPlanForLog] = useState<LessonPlan | null>(null);"""
    if "preloadedPlanForLog" not in code:
        code = code.replace(state_search, state_replace)
    
    props_search = """                <PBLLessonLogForm
                  teacherId={currentTeacher.id}
                  onSave={handleSaveRecord}
                  initialRecord={editingRecord}
                  onCancel={
                    editingRecord ? () => setEditingRecord(null) : undefined
                  }
                  currentUserRole={currentTeacher.role}
                  currentUserName={currentTeacher.name}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                />"""
    props_replace = """                <PBLLessonLogForm
                  teacherId={currentTeacher.id}
                  onSave={handleSaveRecord}
                  initialRecord={editingRecord}
                  onCancel={
                    editingRecord ? () => setEditingRecord(null) : undefined
                  }
                  currentUserRole={currentTeacher.role}
                  currentUserName={currentTeacher.name}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                  preloadedPlan={preloadedPlanForLog}
                  onClearPreloadedPlan={() => setPreloadedPlanForLog(null)}
                />"""
    if "preloadedPlanForLog" not in props_search and "preloadedPlan={preloadedPlanForLog}" not in code:
        code = code.replace(props_search, props_replace)
        
    evaluate_search = """                  onDelete={handleDeletePlan}
                  onPrintPreview={(p) => setActivePlanPrintPreview(p)}
                />"""
    evaluate_replace = """                  onDelete={handleDeletePlan}
                  onPrintPreview={(p) => setActivePlanPrintPreview(p)}
                  onEvaluate={(p) => {
                    setEditingRecord(null); // start fresh
                    setPreloadedPlanForLog(p); // preload the plan
                    setActiveTab("pbl-log-form"); // switch to log form tab
                  }}
                />"""
    if "onEvaluate" not in code:
        code = code.replace(evaluate_search, evaluate_replace)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
