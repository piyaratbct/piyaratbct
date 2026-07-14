import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  const initProfileStates = (t: Teacher) => {
    setPThaiName(t.thaiName || "");
    setPEnglishName(t.englishName || "");
    setPEmployeeId(t.employeeId || "");
    setPPhoneNumber(t.phoneNumber || "");
    setPAffiliation(t.affiliation || "");
    setPDisplayName(t.displayName || "");
  };"""

replacement = """  const initProfileStates = (t: Teacher) => {
    setPThaiName(t.thaiName || "");
    setPEnglishName(t.englishName || "");
    setPEmployeeId(t.employeeId || "");
    setPPhoneNumber(t.phoneNumber || "");
    setPAffiliation(t.affiliation || "");
    setPDisplayName(t.displayName || "");
    setPPassword("");
  };"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

