import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

# 1. Update viewMode state
target_view_mode = "const [viewMode, setViewMode] = useState<'today' | 'manage'>('manage');"
replacement_view_mode = "const [viewMode, setViewMode] = useState<'manage' | 'overview'>('manage');"
content = content.replace(target_view_mode, replacement_view_mode)

# 2. Add fetching all schedules
target_fetch_schedules = """  const fetchSchedules = async (teacherId: string) => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schedules'));
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      
      // Filter by teacherId in memory
      const filteredSchedules = scheduleList.filter(s => 
        s.teacherId === teacherId &&
        String(s.semester) === String(systemSemester) &&
        String(s.academicYear) === String(systemAcademicYear)
      );
      setSchedules(filteredSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };"""

replacement_fetch_schedules = """  const fetchAllSchedules = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'schedules'),
        where('semester', '==', systemSemester),
        where('academicYear', '==', systemAcademicYear)
      );
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      setSchedules(scheduleList);
    } catch (error) {
      console.error("Error fetching all schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedules = async (teacherId: string) => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schedules'));
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      
      // Filter by teacherId in memory
      const filteredSchedules = scheduleList.filter(s => 
        s.teacherId === teacherId &&
        String(s.semester) === String(systemSemester) &&
        String(s.academicYear) === String(systemAcademicYear)
      );
      setSchedules(filteredSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };"""

content = content.replace(target_fetch_schedules, replacement_fetch_schedules)


target_effect = """  useEffect(() => {
    if (selectedTeacherId && viewMode === 'manage') {
      fetchSchedules(selectedTeacherId);
    } else {
      setSchedules([]);
    }
  }, [selectedTeacherId, systemSemester, systemAcademicYear, viewMode]);"""

replacement_effect = """  useEffect(() => {
    if (viewMode === 'manage') {
      if (selectedTeacherId) {
        fetchSchedules(selectedTeacherId);
      } else {
        setSchedules([]);
      }
    } else if (viewMode === 'overview') {
      fetchAllSchedules();
    }
  }, [selectedTeacherId, systemSemester, systemAcademicYear, viewMode]);"""

content = content.replace(target_effect, replacement_effect)


# 3. Add tabs and overview UI
target_ui = """  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" /> จัดการตารางสอน
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">เลือกคุณครู</label>"""


replacement_ui = """  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" /> จัดการตารางสอน
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('manage')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'manage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              จัดตารางสอนรายบุคคล
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ภาพรวมตารางสอน
            </button>
          </div>
        </div>
        
        {viewMode === 'manage' && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">เลือกคุณครู</label>"""

content = content.replace(target_ui, replacement_ui)


target_ui_end = """              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}"""

replacement_ui_end = """              </div>
            ))}
          </div>
        )}
          </>
        )}
        
        {viewMode === 'overview' && (
          <div className="space-y-8">
            <p className="text-slate-500 mb-4">ภาพรวมตารางสอนของครูทั้งหมดในระบบ สำหรับภาคเรียนที่ {systemSemester}/{systemAcademicYear}</p>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="p-3 text-left font-bold text-slate-700 text-sm border-r border-slate-200 w-32">วัน / คาบ</th>
                      {periods.map(period => (
                        <th key={period} className="p-3 text-center font-bold text-slate-700 text-sm border-r border-slate-200 min-w-[120px]">{period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(day => (
                      <tr key={day} className="border-b border-slate-200">
                        <td className="p-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50">
                          วัน{daysOfWeek[day]}
                        </td>
                        {periods.map(period => {
                          const schedulesInPeriod = schedules.filter(s => s.dayOfWeek === day && s.period === period);
                          return (
                            <td key={period} className="p-2 border-r border-slate-200 align-top">
                              {schedulesInPeriod.length > 0 ? (
                                <div className="space-y-2">
                                  {schedulesInPeriod.map(s => (
                                    <div key={s.id} className="bg-indigo-50 border border-indigo-100 rounded p-1.5 text-xs">
                                      <div className="font-bold text-indigo-900 truncate" title={s.teacherName}>{s.teacherName}</div>
                                      <div className="text-indigo-700 flex justify-between">
                                        <span className="truncate max-w-[60%]">{s.subject}</span>
                                        <span>{s.gradeLevel}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-slate-300 text-center text-xs py-2">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}"""

content = content.replace(target_ui_end, replacement_ui_end)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

