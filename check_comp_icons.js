const fs = require('fs');
const html = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html', 'utf8');
const matches = html.match(/<span class="nav-icon">.*?<\/span>/gs);
if (matches) {
  matches.forEach(m => console.log(m));
}
