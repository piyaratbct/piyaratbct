import re

with open('src/components/SchoolEventCalendar.tsx', 'r') as f:
    content = f.read()

# 1. Interface
content = content.replace("  date: string;\n  title: string;", "  date: string;\n  endDate?: string;\n  title: string;")

# 2. State
content = content.replace(
    "const [newEvent, setNewEvent] = useState<{date: string, title: string, timeRange: string, type: string, responsibleTeachers: string[]}>({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });",
    "const [newEvent, setNewEvent] = useState<{date: string, endDate: string, title: string, timeRange: string, type: string, responsibleTeachers: string[]}>({ date: '', endDate: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });"
)

# 3. reset in handleAddEvent
content = content.replace(
    "setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });",
    "setNewEvent({ date: '', endDate: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });"
)

# 4. handleEdit
old_handle_edit = """    setNewEvent({
      date: event.date,
      title: event.title,
      timeRange: event.timeRange || '08:00 - 16:00',
      type: event.type || 'activity',
      responsibleTeachers: event.responsibleTeachers || []
    });"""
new_handle_edit = """    setNewEvent({
      date: event.date,
      endDate: event.endDate || '',
      title: event.title,
      timeRange: event.timeRange || '08:00 - 16:00',
      type: event.type || 'activity',
      responsibleTeachers: event.responsibleTeachers || []
    });"""
content = content.replace(old_handle_edit, new_handle_edit)

with open('src/components/SchoolEventCalendar.tsx', 'w') as f:
    f.write(content)
