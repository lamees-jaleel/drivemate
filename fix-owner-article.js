const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Fix the bad </button> replacement for roadside-card
html = html.replace(/Request Assistance \u2192\s*<\/button>\s*<\/button>\s*<\/section>/, 'Request Assistance \u2192\n          </button>\n        </article>\n      </section>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed roadside article tag");
