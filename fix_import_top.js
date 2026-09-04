const fs = require('fs');
const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes(' FormsModule,')) {
    content = content.replace("ReactiveFormsModule,", "ReactiveFormsModule,\n  FormsModule,");
    fs.writeFileSync(path, content, 'utf8');
}
