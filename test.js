const firebase = require('firebase-admin');

// Just mock testing the logic if I can find out what gradeLevel is being passed
// gradeLevel is e.g. 'ประถมศึกษาปีที่ 1/1'
// But the subjects in curriculums or schoolSubjects might be registered with 'ประถมศึกษาปีที่ 1'

console.log('ประถมศึกษาปีที่ 1/1'.split('/')[0]);
