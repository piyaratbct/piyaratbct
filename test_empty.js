const all = [];
const am = Array.from(new Set(all.map(a => a.month).filter(Boolean)));
console.log(am);
