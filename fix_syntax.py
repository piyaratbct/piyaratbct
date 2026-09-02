import re

with open("src/App.tsx", "r") as f:
    code = f.read()

pattern = r'\{\/\* Profile Avatar Upload \(Auto Compress to Base64\) \*\/.*?\{\/\* Profile Avatar Upload \(Firebase Storage\) \*\/.*?\n\s*\}\)\}\n\s*<\/div>\n\s*<\/div>'

# Wait, let me just replace everything between {/* Custom Screen Name */} div and <div className="grid grid-cols-2 gap-4">

start_marker = "placeholder=\"เช่น ครูวิมล แสนสุข, ครูแอร์ บันเทิงศิลป์\"\n                />\n              </div>"
end_marker = "<div className=\"grid grid-cols-2 gap-4\">"

start_idx = code.find(start_marker)
end_idx = code.find(end_marker)

if start_idx != -1 and end_idx != -1:
    before = code[:start_idx + len(start_marker)]
    after = code[end_idx:]
    
    new_avatar_block = """

              {/* Profile Avatar Upload (Auto Compress to Base64) */}
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
                    คลิกที่รูปภาพกลมๆ ทางซ้ายเพื่อเปลี่ยนรูปโปรไฟล์ของคุณ<br/>
                    <span className="text-indigo-600 font-semibold mt-1 inline-block">(ระบบจะปรับขนาดและบีบอัดรูปภาพให้อัตโนมัติ)</span>
                  </div>
                </div>
              </div>

              """
              
    code = before + new_avatar_block + after
    with open("src/App.tsx", "w") as f:
        f.write(code)
    print("Fixed syntax error")
else:
    print("Markers not found", start_idx, end_idx)
