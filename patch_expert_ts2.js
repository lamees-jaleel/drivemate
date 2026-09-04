const fs = require('fs');

const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('this.renewalRequestsOpen = false;')) {
    content = content.replace("setTab(tab: 'dashboard' | 'requests' | 'active' | 'completed'): void {", "setTab(tab: 'dashboard' | 'requests' | 'active' | 'completed'): void {\n    this.renewalRequestsOpen = false;");
    fs.writeFileSync(path, content, 'utf8');
}
