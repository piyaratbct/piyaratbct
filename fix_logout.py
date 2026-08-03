import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_logout = """  const handleLogout = async () => {
    try {
      await signOut(auth);"""

new_logout = """  const handleLogout = async () => {
    try {
      if (currentTeacher) {
        try { sessionStorage.removeItem('daily_popup_' + currentTeacher.id); } catch(e) {}
      }
      await signOut(auth);"""

content = content.replace(old_logout, new_logout)

with open('src/App.tsx', 'w') as f:
    f.write(content)
