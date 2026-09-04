const fs = require('fs');
const tsPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.ts';
let ts = fs.readFileSync(tsPath, 'utf8');

if (!ts.includes('getDocumentTypeLabel(')) {
  const method = `
  getDocumentTypeLabel(type: string): string {
    if (!type) return 'Unknown';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
`;
  ts = ts.replace('getProviderTypeLabel(type: string): string {', method + '\n  getProviderTypeLabel(type: string): string {');
  fs.writeFileSync(tsPath, ts, 'utf8');
  console.log("Added getDocumentTypeLabel to expert-dashboard.ts");
}
