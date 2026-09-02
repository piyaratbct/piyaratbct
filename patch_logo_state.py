import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Add isUploadingLogo state
    old_state = """  const [customLogo, setCustomLogo] = useState<string | null>(null);"""
    new_state = """  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);"""
    code = code.replace(old_state, new_state)

    # Change handleLogoFileUpload
    old_upload = """  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64String = event.target.result as string;
        setCustomLogo(base64String);
        safeLocalStorage.setItem("lessonlog_custom_logo", base64String);
        setDoc(
          doc(db, "config", "school"),
          { customLogo: base64String },
          { merge: true },
        ).catch((err) => {
          console.error("Failed to persist uploaded logo in Firestore:", err);
        });
      }
    };
    reader.readAsDataURL(file);
  };"""

    new_upload = """  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `school_assets/logo_${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      
      setCustomLogo(downloadUrl);
      safeLocalStorage.setItem("lessonlog_custom_logo", downloadUrl);
      
      await setDoc(
        doc(db, "config", "school"),
        { customLogo: downloadUrl },
        { merge: true },
      );
      
    } catch (err) {
      console.error("Failed to upload logo:", err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploadingLogo(false);
    }
  };"""
  
    code = code.replace(old_upload, new_upload)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
