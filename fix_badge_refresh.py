import re

with open('src/components/AcademicModule.tsx', 'r') as f:
    content = f.read()

old_effect = """    };
    fetchUpcomingEvents();
  }, [currentTeacher]);"""

new_effect = """    };
    fetchUpcomingEvents();
    
    // Listen for custom event to refresh when calendar changes
    window.addEventListener('app-custom-toast', fetchUpcomingEvents);
    return () => window.removeEventListener('app-custom-toast', fetchUpcomingEvents);
  }, [currentTeacher]);"""

content = content.replace(old_effect, new_effect)

with open('src/components/AcademicModule.tsx', 'w') as f:
    f.write(content)
