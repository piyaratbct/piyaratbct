import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

old_student_data = """        const studentData: Student = {
          id: docRef.id,
          studentId,
          firstName,
          lastName,
          nickname,
          gradeLevel: selectedGrade,
          gender,
          nationalId,
          number,
          status: 'active',
          dob,
          parentName,
          parentPhone,
          fatherName,
          fatherPhone,
          motherName,
          motherPhone,
          familyStatus,
          address,
          medicalInfo,
          allergicMedicine,
          allergicFood,
          congenitalDisease
        };

        batch.set(docRef, studentData, { merge: true });"""

new_student_data = """        // Build data object, omitting empty fields to avoid overwriting existing data with blanks
        const studentData: Partial<Student> = {
          id: docRef.id,
          studentId,
          gradeLevel: selectedGrade,
          status: 'active',
        };
        
        if (firstName) studentData.firstName = firstName;
        if (lastName) studentData.lastName = lastName;
        if (nickname) studentData.nickname = nickname;
        if (gender) studentData.gender = gender;
        if (nationalId) studentData.nationalId = nationalId;
        if (number) studentData.number = number;
        if (dob) studentData.dob = dob;
        if (parentName) studentData.parentName = parentName;
        if (parentPhone) studentData.parentPhone = parentPhone;
        if (fatherName) studentData.fatherName = fatherName;
        if (fatherPhone) studentData.fatherPhone = fatherPhone;
        if (motherName) studentData.motherName = motherName;
        if (motherPhone) studentData.motherPhone = motherPhone;
        if (familyStatus) studentData.familyStatus = familyStatus;
        if (address) studentData.address = address;
        if (medicalInfo) studentData.medicalInfo = medicalInfo;
        if (allergicMedicine) studentData.allergicMedicine = allergicMedicine;
        if (allergicFood) studentData.allergicFood = allergicFood;
        if (congenitalDisease) studentData.congenitalDisease = congenitalDisease;

        batch.set(docRef, studentData, { merge: true });"""

content = content.replace(old_student_data, new_student_data)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)
