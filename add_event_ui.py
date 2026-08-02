import re

with open('src/components/SchoolEventCalendar.tsx', 'r') as f:
    content = f.read()

# Render responsible teachers
old_event_ui = """                    <div className="flex-1">
                      <h4 className={`font-bold text-base leading-tight mb-2 ${isPast ? 'text-slate-600 line-through' : ''}`}>{event.title}</h4>
                      <p className={`text-sm font-medium flex items-center gap-1.5 ${isPast ? 'text-slate-400' : 'opacity-80'}`}>
                        <Clock className="h-3.5 w-3.5" /> {event.timeRange} น.
                      </p>
                    </div>
                  </div>
                  {canManageEvents && ("""

new_event_ui = """                    <div className="flex-1">
                      <h4 className={`font-bold text-base leading-tight mb-2 ${isPast ? 'text-slate-600 line-through' : ''}`}>{event.title}</h4>
                      <p className={`text-sm font-medium flex items-center gap-1.5 ${isPast ? 'text-slate-400' : 'opacity-80'}`}>
                        <Clock className="h-3.5 w-3.5" /> {event.timeRange} น.
                      </p>
                      {event.responsibleTeachers && event.responsibleTeachers.length > 0 && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Users className="h-3.5 w-3.5 mt-0.5 opacity-70" />
                          <div className="flex flex-wrap gap-1">
                            {event.responsibleTeachers.map(tid => {
                              const t = teachers.find(t => t.id === tid);
                              if (!t) return null;
                              return <span key={tid} className={`text-[10px] px-1.5 py-0.5 rounded-md ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-black/5'}`}>{t.thaiName || t.displayName}</span>
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {canManageEvents && ("""

content = content.replace(old_event_ui, new_event_ui)

# Calculate upcoming events for current teacher
upcoming_logic = """  const getColorByType = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'exam': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-pink-50 text-pink-700 border-pink-200';
    }
  };

  const getUpcomingMyEvents = () => {
    if (!currentTeacher) return [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const inThreeDays = new Date(today);
    inThreeDays.setDate(today.getDate() + 3);
    
    return events.filter(e => {
      if (!e.responsibleTeachers || !e.responsibleTeachers.includes(currentTeacher.id)) return false;
      const d = new Date(e.date);
      return d >= today && d <= inThreeDays;
    });
  };
  
  const upcomingMyEvents = getUpcomingMyEvents();
"""

content = content.replace("  const getColorByType = (type: string) => {", upcoming_logic)

# Insert the notification banner
old_p6 = """      <div className="p-6">
        {isAdding && ("""
new_p6 = """      <div className="p-6">
        {upcomingMyEvents.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-amber-100 text-amber-600 rounded-lg">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800">แจ้งเตือนกิจกรรมที่ต้องรับผิดชอบ!</h4>
              <p className="text-sm text-amber-700 mt-1">คุณมีกิจกรรมที่ใกล้จะถึงในอีก 3 วัน ({upcomingMyEvents.length} รายการ)</p>
              <ul className="mt-2 space-y-1">
                {upcomingMyEvents.map(e => (
                  <li key={e.id} className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {new Date(e.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}: {e.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {isAdding && ("""

content = content.replace(old_p6, new_p6)

with open('src/components/SchoolEventCalendar.tsx', 'w') as f:
    f.write(content)
