import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add Trash2 to imports if not there
if 'Trash2' not in code:
    code = code.replace('import { motion', 'import { Trash2 } from "lucide-react";\nimport { motion')

# Locate the info div next to AvatarUpload
old_div = """                  <div className="flex-1 text-xs text-slate-500">
                    คลิกที่รูปภาพกลมๆ ทางซ้ายเพื่อเปลี่ยนรูปโปรไฟล์ของคุณ<br/>
                    <span className="text-indigo-600 font-semibold mt-1 inline-block">(ระบบจะปรับขนาด บีบอัดรูปภาพ และอัปโหลดขึ้นคลาวด์อัตโนมัติ)</span>
                  </div>"""

new_div = """                  <div className="flex-1 text-xs text-slate-500">
                    คลิกที่รูปภาพกลมๆ ทางซ้ายเพื่อเปลี่ยนรูปโปรไฟล์ของคุณ<br/>
                    <span className="text-indigo-600 font-semibold mt-1 inline-block">(ระบบจะปรับขนาด บีบอัดรูปภาพ และอัปโหลดขึ้นคลาวด์อัตโนมัติ)</span>
                    
                    {currentTeacher.photoURL && (
                      <div className="mt-3">
                        <button
                          onClick={async () => {
                            if (window.confirm('คุณต้องการลบรูปโปรไฟล์ใช่หรือไม่?')) {
                              try {
                                if (currentTeacher.photoURL.includes('firebasestorage') && storage) {
                                  const fileRef = ref(storage, currentTeacher.photoURL);
                                  await deleteObject(fileRef).catch(e => console.warn("Could not delete from storage:", e));
                                }
                                const updatedTeacher = { ...currentTeacher, photoURL: "" };
                                await updateDoc(doc(db, "teachers", currentTeacher.id), { photoURL: "" });
                                setCurrentTeacher(updatedTeacher);
                                window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ลบรูปโปรไฟล์สำเร็จ', type: 'success' } }));
                              } catch (err) {
                                console.error("Error removing avatar:", err);
                                window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการลบรูปโปรไฟล์', type: 'error' } }));
                              }
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบรูปโปรไฟล์
                        </button>
                      </div>
                    )}
                  </div>"""

if old_div in code:
    code = code.replace(old_div, new_div)
    with open('src/App.tsx', 'w') as f:
        f.write(code)
    print("Added delete button successfully!")
else:
    print("Could not find the target div")

