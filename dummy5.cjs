// What if they use Co-Teaching, but one teacher is assigned to 2/2 and another is assigned to 2/2?
// Wait, the gradeLevel of the schedule document!
// If Teacher A schedule is for gradeLevel: '2/1, 2/2'
// And Teacher B schedule is for gradeLevel: '2/2'
// `curr.gradeLevel` is a string like '2/1, 2/2'.
// The code loops over `gradeSchedules`, which filtered by `s.gradeLevel.startsWith(baseGrade)`.
// `const room = curr.gradeLevel;` -> room becomes '2/1, 2/2' for Teacher A, and '2/2' for Teacher B.
// So they are treated as TWO DIFFERENT ROOMS!
// Ahhhhh!!! That's it!
