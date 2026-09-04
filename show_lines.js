const fs = require('fs');
const lines = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html', 'utf8').split('\n');
for (let i = 370; i < 400; i++) {
  console.log((i+1) + ": " + lines[i]);
}
