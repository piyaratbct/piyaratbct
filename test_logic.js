const expandGradeRange = (g) => {
  if (!g) return [];
  let str = g.split('/')[0].trim();
  
  const match = str.match(/^(ป\.|ม\.|อ\.|ประถมศึกษาปีที่\s*|มัธยมศึกษาปีที่\s*|อนุบาล\s*)(\d+)\s*(?:-|ถึง)\s*(\d+)$/);
  if (match) {
     const pre = match[1].trim();
     const prefix = pre === 'ป.' || pre === 'ประถมศึกษาปีที่' ? 'ประถมศึกษาปีที่ ' : (pre === 'ม.' || pre === 'มัธยมศึกษาปีที่' ? 'มัธยมศึกษาปีที่ ' : 'อนุบาล ');
     const start = parseInt(match[2]);
     const end = parseInt(match[3]);
     const res = [];
     for(let i=start; i<=end; i++) {
        res.push(`${prefix}${i}`);
     }
     return res;
  }
  str = str.replace(/^ป\.\s*/, 'ประถมศึกษาปีที่ ');
  str = str.replace(/^ม\.\s*/, 'มัธยมศึกษาปีที่ ');
  str = str.replace(/^อ\.\s*/, 'อนุบาล ');
  return [str.trim()];
};

console.log("ป.1-3", expandGradeRange("ป.1-3"));
console.log("ป.1", expandGradeRange("ป.1"));
console.log("ประถมศึกษาปีที่ 1", expandGradeRange("ประถมศึกษาปีที่ 1"));
console.log("ประถมศึกษาปีที่ 1-3", expandGradeRange("ประถมศึกษาปีที่ 1-3"));
console.log("ประถมศึกษาปีที่ 1/2", expandGradeRange("ประถมศึกษาปีที่ 1/2"));

const selectedGrades = ["ประถมศึกษาปีที่ 1"];
const normalizedSelectedGrades = selectedGrades.flatMap(expandGradeRange);
console.log("normalizedSelectedGrades", normalizedSelectedGrades);

const cGrades1 = "ป.1".split(/[,]/).flatMap(g => expandGradeRange(g.trim()));
console.log("cGrades1", cGrades1);

const match1 = normalizedSelectedGrades.some(nsg => {
    return cGrades1.some(cg => cg === nsg || cg.includes(nsg) || nsg.includes(cg));
});
console.log("match1", match1);

const activeSubject = "ภาษาไทย";
const cName = "ภาษาไทย (ท11101)".replace(/[ฯ(\-]/g, '').replace(/\s+/g, '').toLowerCase();
const aSub = activeSubject.replace(/[ฯ(\-]/g, '').replace(/\s+/g, '').toLowerCase();
console.log("cName:", cName, "aSub:", aSub, "match:", cName === aSub || cName.includes(aSub) || aSub.includes(cName));

