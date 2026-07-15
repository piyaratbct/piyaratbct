import re

with open('src/components/ImportStudentData.tsx', 'r') as f:
    content = f.read()

# Update imports
content = content.replace("import { collection, doc, writeBatch } from 'firebase/firestore';", "import { collection, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';")

# Update handleImport
target = """    try {
      // Process in batches of 500 (Firestore limit)
      const batch = writeBatch(db);
      let count = 0;
      
      const studentsCollection = collection(db, 'students');

      for (const row of dataPreview) {"""

replacement = """    try {
      const studentsCollection = collection(db, 'students');
      
      // Fetch existing students in this grade to match by studentId for upserting
      const q = query(studentsCollection, where('gradeLevel', '==', selectedGrade));
      const existingSnapshot = await getDocs(q);
      const existingMap: Record<string, string> = {};
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.studentId) {
          existingMap[data.studentId] = doc.id;
        }
      });

      // Process in batches of 500 (Firestore limit)
      const batch = writeBatch(db);
      let count = 0;

      for (const row of dataPreview) {"""

content = content.replace(target, replacement)

target2 = """        // Skip rows without minimum required data
        if (!studentId || !firstName) continue;

        const gender = (rawGender === 'ชาย' || rawGender === 'male' || rawGender === 'm') ? 'male' : 'female';
        
        const newDocRef = doc(studentsCollection);
        const studentData: Student = {
          id: newDocRef.id,"""

replacement2 = """        // Skip rows without minimum required data
        if (!studentId || !firstName) continue;

        const gender = (rawGender === 'ชาย' || rawGender === 'male' || rawGender === 'm') ? 'male' : 'female';
        
        const existingDocId = existingMap[studentId];
        const docRef = existingDocId ? doc(db, 'students', existingDocId) : doc(studentsCollection);
        
        const studentData: Student = {
          id: docRef.id,"""

content = content.replace(target2, replacement2)

target3 = """        };

        batch.set(newDocRef, studentData);"""

replacement3 = """        };

        batch.set(docRef, studentData, { merge: true });"""

content = content.replace(target3, replacement3)

with open('src/components/ImportStudentData.tsx', 'w') as f:
    f.write(content)
