import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                  <div className="flex gap-3 mt-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600">
                      ทั้งหมด:{" "}
                      <span className="font-bold text-slate-900">
                        {totalCount}
                      </span>{" "}
                      คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>"""

replacement = """                  <div className="flex gap-3 mt-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600">
                      ทั้งหมด:{" "}
                      <span className="font-bold text-slate-900">
                        {totalCount}
                      </span>{" "}
                      คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
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
                  )}"""

# Replace all instances (one in students tab, one in assessments tab)
# Wait, let's just do a blanket replace, but we already patched the students tab. Let's unpatch students tab first by matching the patched version or just write a regex.
# Let's just do a fresh replace for the assessments tab.

