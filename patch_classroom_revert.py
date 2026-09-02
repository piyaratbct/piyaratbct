import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    code = f.read()

ui_target = """                        <div className="flex items-start gap-2.5 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-0.5 relative">
                            <span className="absolute -left-2 -top-2 opacity-0">{student.number}</span>
                            <div className="scale-75 origin-top-left -ml-1 -mt-1">
                              <AvatarUpload
                                url={student.photoURL}
                                name={student.firstName || '?'}
                                size="sm"
                                editable={false}
                                onUpload={async () => {}}
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold text-slate-700 shadow-sm border border-slate-100">{student.number}</div>
                          </div>"""

ui_replacement = """                        <div className="flex items-start gap-2.5 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-0.5">
                            {student.number}
                          </div>"""

code = code.replace(ui_target, ui_replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(code)

print("ClassroomModule reverted!")
