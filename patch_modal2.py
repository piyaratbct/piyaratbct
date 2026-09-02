import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    pattern = r'\{\/\* Profile Avatar Upload \(Firebase Storage\).*?hover:file:bg-indigo-200"\s*\/>\s*<p.*?<\/p>\s*<\/div>\s*<\/div>\s*<\/div>'
    
    new_modal = """{/* Profile Avatar Upload (Auto Compress to Base64) */}
              <div className="bg-indigo-50 border border-indigo-200/65 p-3.5 rounded-xl">
                <label className="block text-xs font-black text-indigo-900 mb-1">
                  รูปภาพโปรไฟล์ส่วนตัว (Avatar)
                </label>
                <div className="flex items-center gap-4">
                  <AvatarUpload 
                    url={currentTeacher.photoURL} 
                    name={currentTeacher.thaiName || currentTeacher.displayName} 
                    size="lg" 
                    editable={true} 
                    onUpload={async (base64) => {
                      try {
                        const updatedTeacher = { ...currentTeacher, photoURL: base64 };
                        await updateDoc(doc(db, "teachers", currentTeacher.id), { photoURL: base64 });
                        setCurrentTeacher(updatedTeacher);
                        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'อัปเดตรูปโปรไฟล์สำเร็จ', type: 'success' } }));
                      } catch (err) {
                        console.error("Error uploading avatar:", err);
                        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์', type: 'error' } }));
                      }
                    }} 
                  />
                  <div className="flex-1 text-xs text-slate-500">
                    คลิกที่รูปภาพทางซ้ายเพื่อเปลี่ยนรูปโปรไฟล์ของคุณ<br/>
                    <span className="text-indigo-600 font-semibold">(ระบบจะปรับขนาดและบีบอัดรูปภาพให้อัตโนมัติ)</span>
                  </div>
                </div>
              </div>"""

    if re.search(pattern, code, re.DOTALL):
        code = re.sub(pattern, new_modal, code, flags=re.DOTALL)
        with open(filename, 'w') as f:
            f.write(code)
        print("Updated Profile modal avatar upload via regex")
    else:
        print("Regex not found")

fix('src/App.tsx')
