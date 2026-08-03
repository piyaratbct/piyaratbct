import re

with open('src/components/DailyNotificationPopup.tsx', 'r') as f:
    content = f.read()

safe_storage = """const getSessionItem = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const setSessionItem = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {}
};"""

content = content.replace("export function DailyNotificationPopup", safe_storage + "\n\nexport function DailyNotificationPopup")

content = content.replace("sessionStorage.getItem", "getSessionItem")
content = content.replace("sessionStorage.setItem", "setSessionItem")

with open('src/components/DailyNotificationPopup.tsx', 'w') as f:
    f.write(content)
