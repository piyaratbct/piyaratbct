import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = '''                  <h3 className="text-lg font-black text-slate-800">
                    รายชื่อนักเรียน {selectedGrade}
                  </h3>'''
replacement = '''                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    {searchQuery ? (
                      <>ผลการค้นหา: <span className="text-pink-600">"{searchQuery}"</span></>
                    ) : (
                      <>รายชื่อนักเรียน {selectedGrade}</>
                    )}
                  </h3>'''
content = content.replace(target, replacement)

target2 = '''                  <h3 className="text-lg font-black text-slate-800">
                    ประเมินพัฒนาการนักเรียน
                  </h3>'''
replacement2 = '''                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    ประเมินพัฒนาการนักเรียน
                    {searchQuery && (
                       <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full ml-2">
                         ค้นหา: "{searchQuery}"
                       </span>
                    )}
                  </h3>'''
content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
