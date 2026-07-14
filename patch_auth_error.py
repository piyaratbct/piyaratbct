import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    try {
      if (pPassword.trim().length > 0) {
        if (pPassword.trim().length < 6) {
          alert("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
          return;
        }
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, pPassword.trim());
        }
      }"""

replacement = """    try {
      if (pPassword.trim().length > 0) {
        if (pPassword.trim().length < 6) {
          alert("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
          return;
        }
        if (auth.currentUser) {
          try {
            await updatePassword(auth.currentUser, pPassword.trim());
          } catch (error: any) {
            console.error("Password update error:", error);
            if (error.code === 'auth/requires-recent-login') {
              alert("ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้ง ก่อนทำการเปลี่ยนรหัสผ่าน");
            } else {
              alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: " + error.message);
            }
            return;
          }
        }
      }"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

