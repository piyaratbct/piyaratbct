import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Find where LessonLogList is used and add onEvaluate
    search = """                  onDelete={handleDeleteRecord}
                  onPrintPreview={(r) => setActivePrintPreview(r)}
                />"""
    replace = """                  onDelete={handleDeleteRecord}
                  onPrintPreview={(r) => setActivePrintPreview(r)}
                  onEvaluate={(r) => {
                    setEditingRecord(r);
                    setActiveTab("pbl-log-form");
                    setPreloadedPlanForLog(r.lessonPlanId ? plans.find(p => p.id === r.lessonPlanId) || null : null);
                  }}
                />"""
    if "onEvaluate={(r) => {" not in code[:code.find("onDelete={handleDeleteRecord}")+300]:
        code = code.replace(search, replace)
        
    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
