import re

with open('src/components/SchoolEventCalendar.tsx', 'r') as f:
    content = f.read()

# Update event card
old_card = """                  <div className="flex gap-4 items-start">
                    <div className={`flex flex-col items-center justify-center ${isPast ? 'bg-slate-100/80 text-slate-500' : 'bg-white/80'} rounded-xl p-3 min-w-[4rem] backdrop-blur-sm shadow-sm`}>
"""

new_card = """                  {currentTeacher && !isPast && event.responsibleTeachers?.includes(currentTeacher.id) && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm animate-pulse">
                      <Bell className="h-3 w-3" /> ของคุณ
                    </div>
                  )}
                  <div className="flex gap-4 items-start">
                    <div className={`flex flex-col items-center justify-center ${isPast ? 'bg-slate-100/80 text-slate-500' : 'bg-white/80'} rounded-xl p-3 min-w-[4rem] backdrop-blur-sm shadow-sm`}>
"""

content = content.replace(old_card, new_card)

with open('src/components/SchoolEventCalendar.tsx', 'w') as f:
    f.write(content)

