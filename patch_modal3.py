with open("src/App.tsx", "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{/* Profile Avatar Upload (Firebase Storage) */}" in line:
        start_idx = i
    if start_idx != -1 and i > start_idx + 10 and 'hover:file:bg-indigo-200"' in line:
        # found the input, end of div is about 4 lines after this
        end_idx = i + 4
        break

if start_idx != -1 and end_idx != -1:
    new_modal = """              {/* Profile Avatar Upload (Auto Compress to Base64) */}
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
              </div>\n"""
    
    # replace the slice
    lines[start_idx:end_idx+1] = [new_modal]
    
    with open("src/App.tsx", "w") as f:
        f.writelines(lines)
    print("Replaced by lines")
else:
    print("Could not find bounds", start_idx, end_idx)
