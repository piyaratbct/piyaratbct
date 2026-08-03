import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
if 'import { OnlineUsersIndicator }' not in content:
    content = content.replace(
        "import { DailyNotificationPopup } from \"./components/DailyNotificationPopup\";",
        "import { DailyNotificationPopup } from \"./components/DailyNotificationPopup\";\nimport { OnlineUsersIndicator } from \"./components/OnlineUsersIndicator\";"
    )

# Add periodic online status check
old_use_effect = """  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "config"),"""

new_use_effect = """  useEffect(() => {
    if (!currentTeacher || !db) return;

    const updateActiveStatus = () => {
      const now = new Date().toISOString();
      const lastActive = currentTeacher.lastActiveAt;
      if (!lastActive || (new Date().getTime() - new Date(lastActive).getTime() > 2 * 60 * 1000)) {
         updateDoc(doc(db, "teachers", currentTeacher.id), {
            lastActiveAt: now
         }).catch(() => {});
      }
    };
    
    updateActiveStatus();
    const interval = setInterval(updateActiveStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentTeacher?.id, currentTeacher?.lastActiveAt, db]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "config"),"""

if 'updateActiveStatus' not in content:
    content = content.replace(old_use_effect, new_use_effect)

# Render OnlineUsersIndicator
old_header_right = """            {/* Profile Dropdown / Actions */}
            <div className="flex items-center space-x-3">
              {/* User badge */}"""

new_header_right = """            {/* Profile Dropdown / Actions */}
            <div className="flex items-center space-x-3 gap-2">
              <OnlineUsersIndicator currentTeacher={currentTeacher} teachers={teachers} />
              {/* User badge */}"""

if '<OnlineUsersIndicator' not in content:
    content = content.replace(old_header_right, new_header_right)

with open('src/App.tsx', 'w') as f:
    f.write(content)

