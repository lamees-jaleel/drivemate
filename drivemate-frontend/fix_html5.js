const fs = require('fs');
let html = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', 'utf8');

html = html.replace(/<button class="close-btn" type="button" \(click\)="showReportModal = false"><\/button>/g, '<button class="close-btn" type="button" (click)="showReportModal = false">×</button>');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', html, 'utf8');
