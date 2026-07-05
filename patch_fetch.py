import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = '''        const fetchedStudents = snapshot.docs
          .map((doc) => {
            const data = doc.data() as Student;
            if (data.gradeLevel) {
              data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
            }
            return { id: doc.id, ...data };
          })
          .filter(student => student.gradeLevel === selectedGrade);

        // Sort by number
        fetchedStudents.sort((a, b) => a.number - b.number);

        setStudents(fetchedStudents);'''

replacement = '''        const fetchedStudents = snapshot.docs
          .map((doc) => {
            const data = doc.data() as Student;
            if (data.gradeLevel) {
              data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
            }
            return { id: doc.id, ...data };
          });

        // Sort by number
        fetchedStudents.sort((a, b) => a.number - b.number);

        setStudents(fetchedStudents);'''

content = content.replace(target, replacement)

target2 = '''  const filteredStudents = students.filter((student) => {
    const matchesGender = genderFilter === "all" || student.gender === genderFilter;
    const matchesSearch = searchQuery === "" || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nickname && student.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGender && matchesSearch;
  });

  const totalCount = students.length;
  const maleCount = students.filter((s) => s.gender === "male").length;
  const femaleCount = students.filter((s) => s.gender === "female").length;'''

replacement2 = '''  const displayedStudents = students.filter((student) => {
    // If searching, ignore grade level filter
    if (searchQuery !== "") {
      const matchesGender = genderFilter === "all" || student.gender === genderFilter;
      const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.nickname && student.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGender && matchesSearch;
    }
    
    // If not searching, filter by grade and gender
    if (student.gradeLevel !== selectedGrade) return false;
    if (genderFilter !== "all" && student.gender !== genderFilter) return false;
    
    return true;
  });

  // Calculate counts based on displayed students (or just grade level students if not searching)
  const studentsInGrade = students.filter(s => s.gradeLevel === selectedGrade);
  const countSource = searchQuery !== "" ? displayedStudents : studentsInGrade;
  
  const totalCount = countSource.length;
  const maleCount = countSource.filter((s) => s.gender === "male").length;
  const femaleCount = countSource.filter((s) => s.gender === "female").length;'''

content = content.replace(target2, replacement2)

content = content.replace('filteredStudents.map((student) => {', 'displayedStudents.map((student) => {')

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
