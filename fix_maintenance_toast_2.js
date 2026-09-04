const fs = require('fs');
const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.ts";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
    /private readonly diagnosticService =\s*inject\(DiagnosticService\);/,
    `private readonly diagnosticService =\n    inject(DiagnosticService);\n\n  private readonly toast =\n    inject(ToastService);`
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed maintenance toast property");
