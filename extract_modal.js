const fs = require('fs');
const lines = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\owner-dashboard\\owner-dashboard.css', 'utf8').split('\n');
console.log(lines.slice(1265, 1378).join('\n'));
