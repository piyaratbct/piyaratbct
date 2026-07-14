import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

target = """        {/* แบบประเมินการจัดการเรียนรู้ */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-6">
          <label className="block text-xs font-bold text-slate-700 mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            3. แบบประเมินการจัดการเรียนรู้ (5 = ดีเยี่ยม, 1 = ปรับปรุง)
          </label>
          <div className="space-y-6">
            {/* ด้านผู้สอน */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">ด้านผู้สอน</h4>
              <div className="space-y-2">
                {EVALUATION_CRITERIA.teacher.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-600 flex-1">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setEvaluations(prev => ({ ...prev, teacher: { ...prev.teacher, [item.id]: score } }))}
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            evaluations.teacher[item.id] === score
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* ด้านผู้เรียน */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">ด้านผู้เรียน</h4>
              <div className="space-y-2">
                {EVALUATION_CRITERIA.learner.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-600 flex-1">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setEvaluations(prev => ({ ...prev, learner: { ...prev.learner, [item.id]: score } }))}
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            evaluations.learner[item.id] === score
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ด้านสื่อและแหล่งเรียนรู้ */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">ด้านสื่อและแหล่งเรียนรู้</h4>
              <div className="space-y-2">
                {EVALUATION_CRITERIA.media.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-600 flex-1">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setEvaluations(prev => ({ ...prev, media: { ...prev.media, [item.id]: score } }))}
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            evaluations.media[item.id] === score
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>"""

replacement = """"""

content = content.replace(target, replacement)

content = content.replace("4. ข้อจำกัดและอุปสรรคที่พบ", "3. ข้อจำกัดและอุปสรรคที่พบ")
content = content.replace("5. ข้อเสนอแนะและแนวทางการพัฒนา", "4. ข้อเสนอแนะและแนวทางการพัฒนา")

target2 = """        {/* ไฟล์แนบ */}\n"""

replacement2 = """        {/* แบบประเมินการจัดการเรียนรู้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            5. แบบประเมินการจัดการเรียนรู้
          </label>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-indigo-50/50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800">เกณฑ์การประเมิน</span>
              <div className="flex gap-3 text-[10px] font-bold text-indigo-600">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>5 = ดีเยี่ยม</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>4 = ดีมาก</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>3 = ดี</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>2 = พอใช้</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>1 = ปรับปรุง</span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {/* ด้านผู้สอน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                  ด้านผู้สอน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.teacher.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, teacher: { ...prev.teacher, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${
                              evaluations.teacher[item.id] === score
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านผู้เรียน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                  ด้านผู้เรียน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.learner.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, learner: { ...prev.learner, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${
                              evaluations.learner[item.id] === score
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ด้านสื่อและแหล่งเรียนรู้ */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  ด้านสื่อและแหล่งเรียนรู้
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.media.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, media: { ...prev.media, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${
                              evaluations.media[item.id] === score
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ไฟล์แนบ */}
"""

content = content.replace(target2, replacement2)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)
