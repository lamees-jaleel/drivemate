const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Drivemate/drivemate-frontend/src/app/pages';
const dashboards = ['expert', 'compliance', 'admin'];

for (const dash of dashboards) {
    const htmlPath = path.join(baseDir, dash + '-dashboard', dash + '-dashboard.html');
    if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace(/<button class="notification-button"[^>]*>.*?<\/button>/, '');
        fs.writeFileSync(htmlPath, html, 'utf8');
    }
}
console.log("Done");
