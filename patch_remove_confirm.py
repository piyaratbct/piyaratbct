import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

old_block = """                        <button
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
                        >"""

new_block = """                        <button
                          onClick={async () => {
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
                          }}
                          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                        >"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open('src/App.tsx', 'w') as f:
        f.write(code)
    print("Removed window.confirm successfully!")
else:
    print("Could not find block")

