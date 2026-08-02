import re

with open('src/components/SchoolEventCalendar.tsx', 'r') as f:
    content = f.read()

# Remove the broken part
broken_part = """  const upcomingMyEvents = getUpcomingMyEvents();

    switch (type) {
      case 'meeting': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'exam': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-pink-50 text-pink-700 border-pink-200';
    }
  };"""

fixed_part = """  const upcomingMyEvents = getUpcomingMyEvents();"""

content = content.replace(broken_part, fixed_part)

with open('src/components/SchoolEventCalendar.tsx', 'w') as f:
    f.write(content)

