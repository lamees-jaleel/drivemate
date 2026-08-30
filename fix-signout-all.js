const fs = require('fs');
const dashboards = ['owner', 'expert', 'compliance', 'admin'];

dashboards.forEach(dash => {
    const p = `c:/Drivemate/drivemate-frontend/src/app/pages/${dash}-dashboard/${dash}-dashboard.html`;
    if (fs.existsSync(p)) {
        let h = fs.readFileSync(p, 'utf8');
        h = h.replace(/(<button class="logout-button"[^>]*>)[\s\S]*?Sign Out\s*(<\/button>)/g, '$1\u2197 Sign Out$2');
        fs.writeFileSync(p, h, 'utf8');
    }
});
console.log("Fixed Sign Out again");
