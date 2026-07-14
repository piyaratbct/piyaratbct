import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select"""

replacement = """                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                  {homeroomTeachers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-slate-400" />
                        ครูประจำชั้น:
                      </span>
                      {homeroomTeachers.map((ht, idx) => (
                        <div key={ht.id} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 shadow-sm flex items-center gap-1.5">
                          <div className="h-4 w-4 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-[9px]">{ht.thaiName.charAt(0)}</span>
                          </div>
                          <span>
                            {ht.thaiName} 
                            {ht.homeroomClass === selectedGrade && ht.coHomeroomClass === selectedGrade 
                              ? ' (ประจำชั้น/ผู้ช่วย)' 
                              : ht.homeroomClass === selectedGrade 
                                ? ' (ประจำชั้น)' 
                                : ' (ผู้ช่วย)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
