import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """        if (auth.currentUser) {
          try {
            await updatePassword(auth.currentUser, pPassword.trim());
          } catch (error: any) {"""

replacement = """        if (auth.currentUser) {
          try {
            await updatePassword(auth.currentUser, pPassword.trim());
            // Log successful password change
            const logId = `pwd-change-${auth.currentUser.uid}-${Date.now()}`;
            await setDoc(doc(db, "auditLogs", logId), {
              userId: auth.currentUser.uid,
              userEmail: currentTeacher.email,
              action: "PASSWORD_CHANGE",
              timestamp: new Date().toISOString()
            });
          } catch (error: any) {"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

