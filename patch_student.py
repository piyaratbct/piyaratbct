import re

with open('src/components/StudentModal.tsx', 'r') as f:
    code = f.read()

# 1. Imports
if 'AvatarUpload' not in code:
    code = code.replace("import { X, Save } from 'lucide-react';", "import { X, Save, Camera } from 'lucide-react';\nimport { AvatarUpload } from './AvatarUpload';\nimport { storage } from '../lib/firebase';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';")

# 2. Add photoURL to state
if 'photoURL:' not in code:
    code = code.replace("studentId: '',", "photoURL: '',\n    studentId: '',")
    code = code.replace("studentId: student.studentId,", "photoURL: student.photoURL || '',\n        studentId: student.studentId,")

# 3. Add to UI
ui_target = """<form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">"""

ui_replacement = """<form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <label className="block text-xs font-bold text-slate-700 mb-2">รูปภาพโปรไฟล์นักเรียน</label>
              <AvatarUpload
                url={formData.photoURL}
                name={formData.firstName || formData.studentId || '?'}
                size="xl"
                editable={true}
                onUpload={async (base64) => {
                  try {
                    if (!storage) {
                      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ระบบจัดเก็บไฟล์ยังไม่พร้อมใช้งาน', type: 'error' } }));
                      return;
                    }
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
                    const fileName = `students/${formData.studentId || Date.now()}_${Date.now()}.${ext}`;
                    const storageRef = ref(storage, fileName);

                    await uploadBytes(storageRef, blob);
                    const downloadURL = await getDownloadURL(storageRef);

                    setFormData(prev => ({ ...prev, photoURL: downloadURL }));
                    window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'อัปโหลดรูปรอไว้แล้ว กดบันทึกข้อมูลเพื่อยืนยัน', type: 'success' } }));
                  } catch (error) {
                    console.error("Upload error:", error);
                    window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการอัปโหลดรูป', type: 'error' } }));
                  }
                }}
              />
              {formData.photoURL && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photoURL: '' }))}
                    className="text-[11px] text-red-500 hover:text-red-700 font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md"
                  >
                    นำรูปภาพออก
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">"""

code = code.replace(ui_target, ui_replacement)

with open('src/components/StudentModal.tsx', 'w') as f:
    f.write(code)

print("StudentModal patched!")
