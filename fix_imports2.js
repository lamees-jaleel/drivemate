const fs = require('fs');
const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /imports:\s*\[([^\]]+)\]/;
const match = content.match(regex);
if (match && !match[1].includes(' FormsModule')) {
    const newImports = match[1] + ',\n    FormsModule\n  ';
    content = content.replace(regex, `imports: [${newImports}]`);
    fs.writeFileSync(path, content, 'utf8');
}
