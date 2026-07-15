import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    {searchQuery ? (
                      <>ผลการค้นหา: <span className="text-pink-600">"{searchQuery}"</span></>
                    ) : (
                      <>รายชื่อนักเรียน {selectedGrade}</>
                    )}
                  </h3>
                  <div className="flex gap-3 mt-2 text-sm font-medium">
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

replacement = """                <div className="flex flex-col md:flex-row md:items-center gap-3">
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
                  </div>"""

content = content.replace(target, replacement)

target2 = """                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    ประเมินพัฒนาการนักเรียน
                    {searchQuery && (
                       <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full ml-2">
                         ค้นหา: "{searchQuery}"
                       </span>
                    )}
                  </h3>
                  <div className="flex gap-3 mt-2 text-sm font-medium">
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
                  </div>"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
