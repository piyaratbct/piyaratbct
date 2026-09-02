import re

with open('src/components/Student360.tsx', 'r') as f:
    code = f.read()

target = """    if (initialStudent && !list.find(s => s.id === initialStudent.id || s.studentId === initialStudent.studentId)) {
      list.push({
        id: initialStudent.id,
        studentId: initialStudent.studentId,
        firstName: initialStudent.firstName,
        lastName: initialStudent.lastName,
        nickname: initialStudent.nickname || '',
        grade: initialStudent.gradeLevel,
        dob: initialStudent.dob || "ไม่ระบุ",
        bloodType: initialStudent.bloodGroup || "ไม่ระบุ",
        allergies: [initialStudent.allergicFood, initialStudent.allergicMedicine].filter(Boolean).join(', ') || "ไม่มี",
        allergicFood: initialStudent.allergicFood || "ไม่มี",
        allergicMedicine: initialStudent.allergicMedicine || "ไม่มี",
        congenitalDisease: initialStudent.congenitalDisease || "ไม่มี",
        medicalInfo: initialStudent.medicalInfo || "ไม่มี",
        fatherName: initialStudent.fatherName || [initialStudent.fatherFirstName, initialStudent.fatherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        motherName: initialStudent.motherName || [initialStudent.motherFirstName, initialStudent.motherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        fatherPhone: initialStudent.fatherPhone || "ไม่ระบุ",
        motherPhone: initialStudent.motherPhone || "ไม่ระบุ",
        parentPhone: initialStudent.parentPhone || "ไม่ระบุ",
        academic: {
          gpa: 0,
          attendance: 100,
          participation: 0,
          assignments: 0
        },
        behavior: {
          score: 100,
          merits: 0,
          demerits: 0
        }
      });
    }
    return list;"""

replacement = """    if (initialStudent) {
      const mapped = {
        id: initialStudent.id,
        studentId: initialStudent.studentId,
        firstName: initialStudent.firstName,
        lastName: initialStudent.lastName,
        nickname: initialStudent.nickname || '',
        photoURL: initialStudent.photoURL || '',
        grade: initialStudent.gradeLevel,
        dob: initialStudent.dob || "ไม่ระบุ",
        bloodType: initialStudent.bloodGroup || "ไม่ระบุ",
        allergies: [initialStudent.allergicFood, initialStudent.allergicMedicine].filter(Boolean).join(', ') || "ไม่มี",
        allergicFood: initialStudent.allergicFood || "ไม่มี",
        allergicMedicine: initialStudent.allergicMedicine || "ไม่มี",
        congenitalDisease: initialStudent.congenitalDisease || "ไม่มี",
        medicalInfo: initialStudent.medicalInfo || "ไม่มี",
        fatherName: initialStudent.fatherName || [initialStudent.fatherFirstName, initialStudent.fatherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        motherName: initialStudent.motherName || [initialStudent.motherFirstName, initialStudent.motherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        fatherPhone: initialStudent.fatherPhone || "ไม่ระบุ",
        motherPhone: initialStudent.motherPhone || "ไม่ระบุ",
        parentPhone: initialStudent.parentPhone || "ไม่ระบุ",
        academic: {
          gpa: 0,
          attendance: 100,
          participation: 0,
          assignments: 0
        },
        behavior: {
          score: 100,
          merits: 0,
          demerits: 0
        }
      };
      
      const existingIdx = list.findIndex(s => s.id === initialStudent.id || s.studentId === initialStudent.studentId);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...mapped };
      } else {
        list.push(mapped as any);
      }
    }
    return list;"""

code = code.replace(target, replacement)

with open('src/components/Student360.tsx', 'w') as f:
    f.write(code)

print("Patched!")
