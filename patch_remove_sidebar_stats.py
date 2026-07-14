import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                    {(allergicFoodStudents.length > 0 || congenitalDiseaseStudents.length > 0) && (
                      <div className="flex gap-2 items-center">
                        <span className="text-slate-300">|</span>
                        {allergicFoodStudents.length > 0 && (
                          <span className="bg-orange-50 px-3 py-1 rounded-lg text-orange-700 flex items-center gap-1" title={allergicFoodStudents.map(s => `${s.firstName}: ${s.allergicFood}`).join(', ')}>
                            <AlertTriangle className="h-3 w-3" />
                            แพ้อาหาร: <span className="font-bold">{allergicFoodStudents.length}</span> คน
                          </span>
                        )}
                        {congenitalDiseaseStudents.length > 0 && (
                          <span className="bg-purple-50 px-3 py-1 rounded-lg text-purple-700 flex items-center gap-1" title={congenitalDiseaseStudents.map(s => `${s.firstName}: ${s.congenitalDisease}`).join(', ')}>
                            <AlertTriangle className="h-3 w-3" />
                            โรคประจำตัว: <span className="font-bold">{congenitalDiseaseStudents.length}</span> คน
                          </span>
                        )}
                      </div>
                    )}
                  </div>"""

replacement = """                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
