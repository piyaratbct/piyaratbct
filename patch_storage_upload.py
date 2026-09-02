import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Locate the onUpload handler for AvatarUpload in the Settings Modal
old_upload = """                    onUpload={async (base64) => {
                      try {
                        const updatedTeacher = { ...currentTeacher, photoURL: base64 };
                        await updateDoc(doc(db, "teachers", currentTeacher.id), { photoURL: base64 });
                        setCurrentTeacher(updatedTeacher);
                        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'อัปเดตรูปโปรไฟล์สำเร็จ', type: 'success' } }));
                      } catch (err) {
                        console.error("Error uploading avatar:", err);
                        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์', type: 'error' } }));
                      }
                    }}"""

new_upload = """                    onUpload={async (base64) => {
                      try {
                        if (!storage) {
                            window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ระบบจัดเก็บไฟล์ยังไม่พร้อมใช้งาน', type: 'error' } }));
                            return;
                        }

                        // Convert base64 to Blob
                        const arr = base64.split(',');
                        const mimeMatch = arr[0].match(/:(.*?);/);
                        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        const blob = new Blob([u8arr], { type: mime });

                        const ext = mime.split('/')[1] || 'jpg';
                        const fileName = `avatars/${currentTeacher.id}_${Date.now()}.${ext}`;
                        const storageRef = ref(storage, fileName);

                        await uploadBytes(storageRef, blob);
                        const downloadURL = await getDownloadURL(storageRef);

                        const updatedTeacher = { ...currentTeacher, photoURL: downloadURL };
                        await updateDoc(doc(db, "teachers", currentTeacher.id), { photoURL: downloadURL });
                        setCurrentTeacher(updatedTeacher);
                        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'อัปเดตรูปโปรไฟล์สำเร็จ', type: 'success' } }));
                      } catch (err) {
                        console.error("Error uploading avatar to Storage:", err);
                        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์', type: 'error' } }));
                      }
                    }}"""

if old_upload in code:
    code = code.replace(old_upload, new_upload)
    with open('src/App.tsx', 'w') as f:
        f.write(code)
    print("Replaced successfully!")
else:
    print("Could not find the block to replace")
