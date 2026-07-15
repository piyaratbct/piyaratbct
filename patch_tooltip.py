with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                                  return (
                                      <td key={`${student.id}-${m}`} className="px-2 py-2 text-center border-r border-slate-200 bg-slate-50/30">
                                        <div className={`text-sm font-bold ${d.bmiColor}`}>{d.bmi?.toFixed(1)}</div>
                                        <div className={`text-[10px] ${d.bmiColor} opacity-80`}>{d.bmiLabel}</div>
                                      </td>
                                  );"""

replacement = """                                  return (
                                      <td key={`${student.id}-${m}`} className="px-2 py-2 text-center border-r border-slate-200 bg-slate-50/30">
                                        <div className={`text-sm font-bold ${d.bmiColor}`}>{d.bmi?.toFixed(1)}</div>
                                        {d.bmiLabel === 'ไม่มีวันเกิด' ? (
                                          <div className={`text-[10px] text-red-500 font-bold opacity-100 flex items-center justify-center gap-1`} title="ไม่สามารถแปลผล BMI ได้เนื่องจากไม่มีข้อมูลวันเกิด กรุณาเพิ่มวันเกิดในประวัตินักเรียน">
                                            <AlertCircle className="h-3 w-3" />
                                            ขาดวันเกิด
                                          </div>
                                        ) : (
                                          <div className={`text-[10px] ${d.bmiColor} opacity-80`}>{d.bmiLabel}</div>
                                        )}
                                      </td>
                                  );"""

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
