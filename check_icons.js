const fs = require('fs');
const html = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\owner-dashboard\\owner-dashboard.html', 'utf8');
const matches = html.match(/<span class="nav-icon">.*?<\/span>/gs);
if (matches) {
  matches.slice(0, 3).forEach(m => console.log(m));
}
