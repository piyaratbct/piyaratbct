// User asks: "มีการคำนวณคาบเกินตามลงตารางใช่ไหม? ถ้าคาบนั้นมีครูผู้สอน 2 คน ก็จะนำมาคำนวณชั่วโมงเรียนเพิ่มใช่ไหม?"
// This implies they put 2 teachers into the SAME period, but it's showing up as "2 คาบ" (40 ชม.) instead of 1.
// Why would it show up as 2 คาบ?
// Let's check how periodSig is formed: `${curr.dayOfWeek}-${curr.period}`
// Is curr.period definitely the same?
// If they dragged the subject into the table for Teacher A on Monday P1.
// And they dragged the subject into the table for Teacher B on Monday P1.
// Both have dayOfWeek='monday', period=1, room='2/2', subject='กิจกรรมลูกเสือ - เนตรนารี'
// periodSig = 'monday-1'
// Since they are in the same room '2/2', seenPeriods for '2/2' should have 'monday-1'.
// The second teacher's record will have the SAME periodSig 'monday-1'.
// So `seenPeriods.has('monday-1')` would be TRUE.
// It should SKIP adding to periods and days.
// WAIT! 
// Let's look at the old code I replaced in patch-hours.cjs:
// const oldLogic = /const periodSig = \`\$\{curr\.dayOfWeek\}-\$\{curr\.period\}\`;\s*if \(\!subjectGroups\[subjectName\]\[room\]\.seenPeriods\.has\(periodSig\)\) \{\s*subjectGroups\[subjectName\]\[room\]\.seenPeriods\.add\(periodSig\);\s*subjectGroups\[subjectName\]\[room\]\.periods \+\= 1;\s*subjectGroups\[subjectName\]\[room\]\.days\.push\(curr\.dayOfWeek\);\s*\}/gm;
// Before I ran patch-hours.cjs, the code was:
/*
const periodSig = `${curr.dayOfWeek}-${curr.period}`;
if (!subjectGroups[subjectName][room].seenPeriods.has(periodSig)) {
    subjectGroups[subjectName][room].seenPeriods.add(periodSig);
    subjectGroups[subjectName][room].periods += 1;
    subjectGroups[subjectName][room].days.push(curr.dayOfWeek);
}
*/
