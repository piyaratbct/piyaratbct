cat << 'PATCH' > lastactive.patch
--- src/App.tsx
+++ src/App.tsx
@@ -232,6 +232,10 @@
               const profileSnap = await getDoc(profileRef);
               if (profileSnap.exists()) {
                 const t = profileSnap.data() as Teacher;
+                
+                // Update lastActiveAt on login/load
+                t.lastActiveAt = new Date().toISOString();
+                updateDoc(profileRef, { lastActiveAt: t.lastActiveAt }).catch(console.error);
+
                 setCurrentTeacher(t);
                 initProfileStates(t);
                 setAuthLoading(false);
@@ -705,6 +709,8 @@
 
   const handleLogin = (teacher: Teacher) => {
+    const updated = { ...teacher, lastActiveAt: new Date().toISOString() };
+    setCurrentTeacher(updated);
-    setCurrentTeacher(teacher);
-    initProfileStates(teacher);
+    initProfileStates(updated);
+    if (db) {
+      updateDoc(doc(db, "teachers", teacher.id), { lastActiveAt: updated.lastActiveAt }).catch(console.error);
+    }
   };
 
   const handleLogout = async () => {
@@ -737,6 +743,30 @@
     setNewSemValue(systemSemester);
   }, [showAcademicSettings]);
 
+  // Track user activity to update lastActiveAt periodically
+  useEffect(() => {
+    if (!currentTeacher || !db) return;
+    
+    let lastUpdated = Date.now();
+    
+    const handleActivity = () => {
+      const now = Date.now();
+      // Update at most once every 5 minutes
+      if (now - lastUpdated > 5 * 60 * 1000) {
+        lastUpdated = now;
+        updateDoc(doc(db, "teachers", currentTeacher.id), {
+          lastActiveAt: new Date().toISOString()
+        }).catch(console.error);
+      }
+    };
+
+    window.addEventListener('mousemove', handleActivity);
+    window.addEventListener('keydown', handleActivity);
+    
+    return () => {
+      window.removeEventListener('mousemove', handleActivity);
+      window.removeEventListener('keydown', handleActivity);
+    };
+  }, [currentTeacher]);
+
   if (authLoading) {
PATCH
patch src/App.tsx lastactive.patch
