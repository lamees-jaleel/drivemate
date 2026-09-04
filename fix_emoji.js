const fs = require('fs');
const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/📄/g, '▤');

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed emojis");
