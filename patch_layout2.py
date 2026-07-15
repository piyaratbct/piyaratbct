import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# For activeTab === 'students'
target1 = re.compile(r'<div>\s*<h3 className="text-lg font-black text-slate-800 flex items-center gap-2">\s*\{searchQuery \? \(\s*<>ผลการค้นหา: <span className="text-pink-600">"{searchQuery}"</span></>\s*\) : \(\s*<>รายชื่อนักเรียน \{selectedGrade\}</>\s*\)\}\s*</h3>\s*<div className="flex gap-3 mt-2 text-sm font-medium">\s*<span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600">\s*ทั้งหมด:\{" "\}\s*<span className="font-bold text-slate-900">\s*\{totalCount\}\s*</span>\{" "\}\s*คน\s*</span>\s*<span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700">\s*ชาย: <span className="font-bold">\{maleCount\}</span> คน\s*</span>\s*<span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">\s*หญิง: <span className="font-bold">\{femaleCount\}</span> คน\s*</span>\s*</div>\s*</div>', re.MULTILINE)

replacement1 = """                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 whitespace-nowrap">
                    {searchQuery ? (
                      <>ผลการค้นหา: <span className="text-pink-600">"{searchQuery}"</span></>
                    ) : (
                      <>รายชื่อนักเรียน {selectedGrade}</>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 whitespace-nowrap">
                      ทั้งหมด: <span className="font-bold text-slate-900">{totalCount}</span> คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700 whitespace-nowrap">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700 whitespace-nowrap">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                </div>"""

content = target1.sub(replacement1, content)

# For activeTab === 'assessments'
target2 = re.compile(r'<div>\s*<h3 className="text-lg font-black text-slate-800 flex items-center gap-2">\s*ประเมินพัฒนาการนักเรียน\s*\{searchQuery && \(\s*<span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0\.5 rounded-full ml-2">\s*ค้นหา: "\{searchQuery\}"\s*</span>\s*\)\}\s*</h3>\s*<div className="flex gap-3 mt-2 text-sm font-medium">\s*<span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600">\s*ทั้งหมด:\{" "\}\s*<span className="font-bold text-slate-900">\s*\{totalCount\}\s*</span>\{" "\}\s*คน\s*</span>\s*<span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700">\s*ชาย: <span className="font-bold">\{maleCount\}</span> คน\s*</span>\s*<span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">\s*หญิง: <span className="font-bold">\{femaleCount\}</span> คน\s*</span>\s*</div>\s*</div>', re.MULTILINE)

replacement2 = """                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 whitespace-nowrap">
                    ประเมินพัฒนาการนักเรียน
                    {searchQuery && (
                       <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full ml-2">
                         ค้นหา: "{searchQuery}"
                       </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 whitespace-nowrap">
                      ทั้งหมด: <span className="font-bold text-slate-900">{totalCount}</span> คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700 whitespace-nowrap">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700 whitespace-nowrap">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                </div>"""

content = target2.sub(replacement2, content)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
