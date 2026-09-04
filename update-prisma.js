const fs = require('fs');
const schemaPath = 'c:/Drivemate/drivemate-backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('isDeleted Boolean')) {
  schema = schema.replace(
    /nextServiceOdometerKm\s+Int\?/,
    'nextServiceOdometerKm Int?\n\n  isDeleted Boolean @default(false)'
  );
  fs.writeFileSync(schemaPath, schema, 'utf8');
}
console.log("Prisma updated");
