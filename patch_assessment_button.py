import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                      <div className="mt-auto pt-2 flex gap-2">
                        <button
                          onClick={() => setEvaluatingStudent(student)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors ${
                            hasAssessed
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          }`}
                        >
                          {hasAssessed ? "แก้ไขการประเมิน" : "ประเมินพฤติกรรม"}
                        </button>
                      </div>"""

replacement = """                      {GRADE_LEVELS.includes(selectedGrade) && (
                        <div className="mt-auto pt-2 flex gap-2">
                          <button
                            onClick={() => setEvaluatingStudent(student)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors ${
                              hasAssessed
                                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                            }`}
                          >
                            {hasAssessed ? "แก้ไขการประเมิน" : "ประเมินพฤติกรรม"}
                          </button>
                        </div>
                      )}"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
