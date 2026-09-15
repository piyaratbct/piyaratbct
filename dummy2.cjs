const sched = [
    { id: 1, teacherId: 'A', room: '2/2', dayOfWeek: 'monday', period: 1 },
    { id: 2, teacherId: 'B', room: '2/2', dayOfWeek: 'monday', period: 1 }
];

// So if two teachers teach the same room on the same day/period,
// the seenPeriods logic will only count it ONCE (periods += 1, days.push).
// BUT then when calculating actualHours:
// actualHours += teachingDaysCount[d] || 0
// If it's a Monday (20 days), actualHours = 20.
// BUT the image says "2/2 (ครูปอย, ครูเดียร์) จัดได้: 40 ชม. (2 คาบ) เกินมา 20 ชม."
// Wait, if it says 40 ชม. and 2 คาบ, that means periods = 2!
// Why would periods = 2? 
// Because the period signature didn't match? Or because they were assigned to different periods?
// Ah! "2 คาบ" means there are 2 periods in the database. 
// Maybe teacher A was assigned to period 1, and teacher B was assigned to period 2?
