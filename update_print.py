import re

with open('src/components/PrintTemplate.tsx', 'r') as f:
    content = f.read()

old_print_section = r'\{/\* Paragraph 6: แบบประเมิน \*/\}.*?</div\>\s*</div\>\s*\)\}'

new_print_section = """{/* Paragraph 6: แบบประเมิน */}
          {record.evaluations && (
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-indigo-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                6. แบบประเมินการจัดการเรียนรู้ :
              </h4>
              <div className={`bg-slate-50/50 print:bg-transparent rounded-lg border border-slate-200 print:border p-3 grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3`}>
                {record.evaluations.planning && (
                  <div>
                    <h5 className="text-[9px] font-bold text-slate-700 border-b border-slate-200 pb-0.5 mb-1 truncate">ด้านการวางแผนการสอน</h5>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-slate-600"><span>1. แผนตรงมาตรฐาน/ตัวชี้วัดฯ</span><span className="font-bold">{record.evaluations.planning.p1 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>2. จุดประสงค์ชัด วัดผลได้ฯ</span><span className="font-bold">{record.evaluations.planning.p2 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>3. กิจกรรมตามแผนฯ</span><span className="font-bold">{record.evaluations.planning.p3 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>4. ส่งเสริมปฏิบัติ/คิดวิเคราะห์ฯ</span><span className="font-bold">{record.evaluations.planning.p4 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>5. เครื่องมือวัดผลสอดคล้องฯ</span><span className="font-bold">{record.evaluations.planning.p5 || 0}/5</span></div>
                    </div>
                  </div>
                )}
                {record.evaluations.time && (
                  <div>
                    <h5 className="text-[9px] font-bold text-slate-700 border-b border-slate-200 pb-0.5 mb-1 truncate">ด้านบริหารเวลาฯ</h5>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-slate-600"><span>1. เวลาเหมาะสมกับเนื้อหาฯ</span><span className="font-bold">{record.evaluations.time.tm1 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>2. ทบทวน/แจ้งจุดประสงค์กระชับฯ</span><span className="font-bold">{record.evaluations.time.tm2 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>3. ปรับกิจกรรมสอดคล้องเวลาฯ</span><span className="font-bold">{record.evaluations.time.tm3 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>4. จัดการปัญหาล่าช้าได้ดีฯ</span><span className="font-bold">{record.evaluations.time.tm4 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>5. เตรียมสื่อ/อุปกรณ์พร้อมฯ</span><span className="font-bold">{record.evaluations.time.tm5 || 0}/5</span></div>
                    </div>
                  </div>
                )}
                {record.evaluations.media && (
                  <div>
                    <h5 className="text-[9px] font-bold text-slate-700 border-b border-slate-200 pb-0.5 mb-1 truncate">ด้านสื่อและแหล่งเรียนรู้</h5>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-slate-600"><span>1. เนื้อหาถูกต้องปลอดภัยฯ</span><span className="font-bold">{record.evaluations.media.m1 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>2. สื่อกระตุ้นความสนใจฯ</span><span className="font-bold">{record.evaluations.media.m2 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>3. ช่วยให้เข้าใจง่ายขึ้นฯ</span><span className="font-bold">{record.evaluations.media.m3 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>4. คล่องตัว ไม่ติดขัดฯ</span><span className="font-bold">{record.evaluations.media.m4 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>5. เข้าถึงได้อย่างทั่วถึงฯ</span><span className="font-bold">{record.evaluations.media.m5 || 0}/5</span></div>
                    </div>
                  </div>
                )}
                {record.evaluations.teacher && (
                  <div>
                    <h5 className="text-[9px] font-bold text-slate-700 border-b border-slate-200 pb-0.5 mb-1 truncate">ด้านผู้สอน</h5>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-slate-600"><span>1. เทคนิคสอนหลากหลายฯ</span><span className="font-bold">{record.evaluations.teacher.th1 || record.evaluations.teacher.t1 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>2. เชื่อมโยงเข้าสู่เนื้อหาฯ</span><span className="font-bold">{record.evaluations.teacher.th2 || record.evaluations.teacher.t2 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>3. ประเมินผลตรงสภาพจริงฯ</span><span className="font-bold">{record.evaluations.teacher.th3 || record.evaluations.teacher.t3 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>4. ซ่อมเสริม/พัฒนาผู้เรียนฯ</span><span className="font-bold">{record.evaluations.teacher.th4 || record.evaluations.teacher.t4 || 0}/5</span></div>
                    </div>
                  </div>
                )}
                {record.evaluations.learner && (
                  <div>
                    <h5 className="text-[9px] font-bold text-slate-700 border-b border-slate-200 pb-0.5 mb-1 truncate">ด้านผู้เรียน</h5>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-slate-600"><span>1. มีส่วนร่วมกระตือรือร้นฯ</span><span className="font-bold">{record.evaluations.learner.l1 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>2. เข้าใจ/ตอบคำถามได้ฯ</span><span className="font-bold">{record.evaluations.learner.l2 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>3. ทำงานร่วมกัน/ช่วยเหลือฯ</span><span className="font-bold">{record.evaluations.learner.l3 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>4. ปฏิบัติตามข้อตกลงฯ</span><span className="font-bold">{record.evaluations.learner.l4 || 0}/5</span></div>
                      <div className="flex justify-between text-[8px] text-slate-600"><span>5. สะท้อนความรู้ได้ฯ</span><span className="font-bold">{record.evaluations.learner.l5 || 0}/5</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}"""

content = re.sub(old_print_section, new_print_section, content, flags=re.DOTALL)

with open('src/components/PrintTemplate.tsx', 'w') as f:
    f.write(content)

print("Updated PrintTemplate.tsx")
