const fs = require('fs');
let content = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.ts', 'utf8');

if (!content.includes('FormsModule,')) {
    content = content.replace("ReactiveFormsModule,", "ReactiveFormsModule,\n  FormsModule,");
    fs.writeFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.ts', content, 'utf8');
}

let expertContent = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.ts', 'utf8');
if (!expertContent.includes('FormsModule')) {
    expertContent = expertContent.replace("import { CommonModule } from '@angular/common';", "import { CommonModule } from '@angular/common';\nimport { FormsModule } from '@angular/forms';");
    expertContent = expertContent.replace("imports: [", "imports: [\n    FormsModule,");
    fs.writeFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.ts', expertContent, 'utf8');
}
