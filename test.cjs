const fs = require('fs');
console.log(fs.readFileSync('src/types.ts', 'utf8').split('\n').slice(188, 205).join('\n'));
