const fs = require('fs');
const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.ts";
let content = fs.readFileSync(filePath, "utf8");

// Import ToastService if not already imported
if (!content.includes('ToastService')) {
    content = content.replace(
        /import\s*\{\s*DiagnosticService[^\}]*\}\s*from\s*'..\/..\/services\/diagnostic\.service';/,
        `import { DiagnosticService, DiagnosticRequest, DiagnosticConcernType, DiagnosticUrgency } from '../../services/diagnostic.service';\nimport { ToastService } from '../../shared/toast/toast.service';`
    );
}

// Inject ToastService
if (!content.includes('toast = inject(ToastService)')) {
    content = content.replace(
        /private readonly diagnosticService = inject\(DiagnosticService\);/,
        `private readonly diagnosticService = inject(DiagnosticService);\n  private readonly toast = inject(ToastService);`
    );
}

// Replace alerts with toast
content = content.replace(
    /alert\('Service record deleted successfully\.'\);/g,
    "this.toast.show('Service record deleted successfully.', 'success');"
);

content = content.replace(
    /alert\('Failed to delete record\.'\);/g,
    "this.toast.show('Unable to delete service record. Please try again.', 'error');"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed maintenance toast");
