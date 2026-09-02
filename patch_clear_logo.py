import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_clear = """  const handleClearCustomLogo = () => {
    setCustomLogo(null);
    safeLocalStorage.removeItem("lessonlog_custom_logo");
    setDoc(
      doc(db, "config", "school"),
      { customLogo: null },
      { merge: true },
    ).catch((err) => {
      console.error("Failed to clear custom logo in Firestore:", err);
    });
  };"""
  
    new_clear = """  const handleClearCustomLogo = async () => {
    if (customLogo && customLogo.includes('firebasestorage.googleapis.com')) {
      try {
        const storageRef = ref(storage, customLogo);
        await deleteObject(storageRef);
      } catch (err) {
        console.warn("Failed to delete old logo from storage:", err);
      }
    }
    setCustomLogo(null);
    safeLocalStorage.removeItem("lessonlog_custom_logo");
    setDoc(
      doc(db, "config", "school"),
      { customLogo: null },
      { merge: true },
    ).catch((err) => {
      console.error("Failed to clear custom logo in Firestore:", err);
    });
  };"""

    code = code.replace(old_clear, new_clear)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
