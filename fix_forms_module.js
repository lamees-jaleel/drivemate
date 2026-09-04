const fs = require('fs');
const content = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.ts', 'utf8');

if (!content.includes('FormsModule')) {
    let newContent = content.replace("import { CommonModule } from '@angular/common';", "import { CommonModule } from '@angular/common';\nimport { FormsModule } from '@angular/forms';");
    newContent = newContent.replace("imports: [", "imports: [FormsModule, ");
    fs.writeFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.ts', newContent, 'utf8');
    console.log('Added FormsModule to documents.ts');
}

const expertContent = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.ts', 'utf8');
if (!expertContent.includes('FormsModule')) {
    let newExpertContent = expertContent.replace("import { CommonModule } from '@angular/common';", "import { CommonModule } from '@angular/common';\nimport { FormsModule } from '@angular/forms';");
    newExpertContent = newExpertContent.replace("imports: [", "imports: [FormsModule, ");
    fs.writeFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.ts', newExpertContent, 'utf8');
    console.log('Added FormsModule to expert-dashboard.ts');
}
