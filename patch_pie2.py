import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                                    let ageYears = 7; // ค่าเริ่มต้นประถมต้น
                                    if (student.dob) {
                                      const birthDate = new Date(student.dob);
                                      const ageDifMs = Date.now() - birthDate.getTime();
                                      const ageDate = new Date(ageDifMs);
                                      ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
                                    }"""

replacement = """                                    let ageYears = 7; // ค่าเริ่มต้นประถมต้น
                                    if (student.dob) {
                                      const birthDate = new Date(student.dob);
                                      const now = new Date();
                                      let years = now.getFullYear() - birthDate.getFullYear();
                                      let months = now.getMonth() - birthDate.getMonth();
                                      if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                                        years--;
                                      }
                                      ageYears = years;
                                    }"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
