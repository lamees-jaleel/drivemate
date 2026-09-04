const fs = require('fs');
const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html';
const lines = fs.readFileSync(path, 'utf8').split('\n');
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('nav-icon')) {
    console.log(lines.slice(i, i+3).join('\n'));
  }
}
