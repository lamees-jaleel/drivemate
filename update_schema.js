const fs = require('fs');
const schemaPath = 'c:\\Drivemate\\drivemate-backend\\prisma\\schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace('DRIVEMATE_EXPERT\n}', 'DRIVEMATE_EXPERT\n  INSURANCE_PROVIDER\n  GOVERNMENT_PORTAL\n}');
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log("Added INSURANCE_PROVIDER and GOVERNMENT_PORTAL to ServiceProviderType");
