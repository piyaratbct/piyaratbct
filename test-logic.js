const rData = { days: ['monday', 'monday'] }; // if two teachers have the same schedule? Wait, we deduped with seenPeriods
const teachingDaysCount = { monday: 20 };

let actualHours = 0;
rData.days.forEach(d => {
    actualHours += teachingDaysCount[d] || 0;
});
console.log(actualHours);
