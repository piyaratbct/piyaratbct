import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Import the new modal
    if "StudentEvaluationModal" not in code:
        import_str = 'import { DailyNotificationPopup } from "./components/DailyNotificationPopup";'
        import_replace = 'import { DailyNotificationPopup } from "./components/DailyNotificationPopup";\nimport { StudentEvaluationModal } from "./components/StudentEvaluationModal";'
        code = code.replace(import_str, import_replace)
        
    # Add state for modal
    if "evaluatingModalRecord" not in code:
        state_str = '  const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);'
        state_replace = '  const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);\n  const [evaluatingModalRecord, setEvaluatingModalRecord] = useState<LessonRecord | null>(null);'
        code = code.replace(state_str, state_replace)

    # Change how onEvaluate is handled in LessonLogList
    list_search = """                  onEvaluate={(r) => {
                    setEditingRecord(r);
                    setActiveTab("pbl-log-form");
                    setPreloadedPlanForLog(r.lessonPlanId ? plans.find(p => p.id === r.lessonPlanId) || null : null);
                  }}"""
    list_replace = """                  onEvaluate={(r) => {
                    setEvaluatingModalRecord(r);
                  }}"""
    if "setEvaluatingModalRecord(r)" not in code:
        code = code.replace(list_search, list_replace)

    # Insert Modal near the end
    modal_str = """      {/* Daily Notification Popup */}
      <DailyNotificationPopup />"""
    modal_replace = """      {/* Student Evaluation Modal */}
      <StudentEvaluationModal
        isOpen={!!evaluatingModalRecord}
        onClose={() => setEvaluatingModalRecord(null)}
        record={evaluatingModalRecord}
        plans={plans}
        onSuccess={() => {
          fetchRecords();
          setEvaluatingModalRecord(null);
        }}
      />
      
      {/* Daily Notification Popup */}
      <DailyNotificationPopup />"""
    if "StudentEvaluationModal" not in code[code.rfind("DailyNotificationPopup"):]:
        code = code.replace(modal_str, modal_replace)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
