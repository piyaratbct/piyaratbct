import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_capture = """  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Crop center to square
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/png");
        setCustomLogo(dataUrl);
        safeLocalStorage.setItem("lessonlog_custom_logo", dataUrl);
        setDoc(
          doc(db, "config", "school"),
          { customLogo: dataUrl },
          { merge: true },
        ).catch((err) => {
          console.error("Failed to persist custom logo in Firestore:", err);
        });
      }
      stopCamera();
    } catch (err) {
      console.error("Failed to capture image from camera:", err);
      setCameraError("ไม่สามารถจับภาพได้กรุณาทดลองบันทึกใหม่อีกครั้ง");
    }
  };"""
  
    new_capture = """  const capturePhoto = async () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        setIsUploadingLogo(true);
        // Crop center to square
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setIsUploadingLogo(false);
            return;
          }
          try {
            const storageRef = ref(storage, `school_assets/logo_${Date.now()}_camera.png`);
            const uploadResult = await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(uploadResult.ref);
            
            setCustomLogo(downloadUrl);
            safeLocalStorage.setItem("lessonlog_custom_logo", downloadUrl);
            
            await setDoc(
              doc(db, "config", "school"),
              { customLogo: downloadUrl },
              { merge: true },
            );
          } catch (err) {
             console.error("Failed to upload captured logo:", err);
             setCameraError("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
          } finally {
             setIsUploadingLogo(false);
             stopCamera();
          }
        }, "image/png");
      } else {
        stopCamera();
      }
    } catch (err) {
      console.error("Failed to capture image from camera:", err);
      setCameraError("ไม่สามารถจับภาพได้กรุณาทดลองบันทึกใหม่อีกครั้ง");
      setIsUploadingLogo(false);
    }
  };"""

    code = code.replace(old_capture, new_capture)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
