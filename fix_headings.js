const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace section-title with section-heading in dashboard cards
html = html.replace(/<div class="section-title">(\s*)<span class="section-number">01<\/span>(\s*)<div>(\s*)<p>ADVISOR WORKFLOW<\/p>(\s*)<h3>Compliance Review Process<\/h3>(\s*)<\/div>(\s*)<\/div>/g, 
  '<div class="section-heading">$1$2<div>$3<p class="section-kicker">ADVISOR WORKFLOW</p>$4<h3>Compliance Review Process</h3>$5</div>$6</div>');

html = html.replace(/<div class="section-title">(\s*)<span class="section-number">02<\/span>(\s*)<div>(\s*)<p>PROFESSIONAL ACCOUNT<\/p>(\s*)<h3>Advisor Profile<\/h3>(\s*)<\/div>(\s*)<\/div>/g, 
  '<div class="section-heading">$1$2<div>$3<p class="section-kicker">PROFESSIONAL ACCOUNT</p>$4<h3>Advisor Profile</h3>$5</div>$6</div>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Updated section-heading");
