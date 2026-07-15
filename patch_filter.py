import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. Update displayedStudents filter
target_filter = """  const displayedStudents = students.filter((student) => {
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
  });"""

replacement_filter = """  const displayedStudents = students.filter((student) => {
    // If searching, ignore grade level filter
    if (searchQuery !== "") {
      const matchesGender = genderFilter === "all" || student.gender === genderFilter;
      const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.nickname && student.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGender && matchesSearch;
    }
    
    // If not searching, filter by grade and gender
    let matchGrade = false;
    if (selectedGrade === 'ภาพรวม') {
      matchGrade = true;
    } else if (selectedGrade === 'ระดับอนุบาล') {
      matchGrade = (student.gradeLevel || '').startsWith('อนุบาล');
    } else if (selectedGrade === 'ระดับประถมศึกษา') {
      matchGrade = (student.gradeLevel || '').startsWith('ประถม');
    } else {
      matchGrade = student.gradeLevel === selectedGrade;
    }
    
    if (!matchGrade) return false;
    if (genderFilter !== "all" && student.gender !== genderFilter) return false;
    
    return true;
  });"""

content = content.replace(target_filter, replacement_filter)

# 2. Update studentsInGrade
target_in_grade = """  // Calculate counts based on displayed students (or just grade level students if not searching)
  const studentsInGrade = students.filter(s => s.gradeLevel === selectedGrade);"""

replacement_in_grade = """  // Calculate counts based on displayed students (or just grade level students if not searching)
  const studentsInGrade = students.filter(s => {
    if (selectedGrade === 'ภาพรวม') return true;
    if (selectedGrade === 'ระดับอนุบาล') return (s.gradeLevel || '').startsWith('อนุบาล');
    if (selectedGrade === 'ระดับประถมศึกษา') return (s.gradeLevel || '').startsWith('ประถม');
    return s.gradeLevel === selectedGrade;
  });"""

content = content.replace(target_in_grade, replacement_in_grade)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
