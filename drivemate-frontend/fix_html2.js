const fs = require('fs');
let html = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', 'utf8');

// Fix broken em-dash
html = html.replace(/—/g, '�');

// Fix empty state icons
html = html.replace(/<div class="empty-state-icon">▤<\/div>/g, '<div class="empty-state-icon">?</div>');
html = html.replace(/<div class="empty-state-icon">◉<\/div>/g, '<div class="empty-state-icon">?</div>');
html = html.replace(/<div class="empty-state-icon">⚙<\/div>/g, '<div class="empty-state-icon">?</div>');

// Fix broken symbols
html = html.replace(/Estimated Cost \(\?\)/g, 'Estimated Cost (?)');

// The button has a broken cross 
html = html.replace(/<button class="close-btn" type="button" \(click\)="showReportModal = false"><\/button>/g, '<button class="close-btn" type="button" (click)="showReportModal = false">�</button>');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', html, 'utf8');
