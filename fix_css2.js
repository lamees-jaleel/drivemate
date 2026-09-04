const fs = require('fs');

const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.css';
let content = fs.readFileSync(path, 'utf8');

const additional_css = `
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.info-label {
  color: #a5a9b2;
}
.info-value {
  color: #e8eaed;
}
.info-row.full-width {
  flex-direction: column;
  gap: 0.25rem;
}
.active-tab {
  border-bottom: 2px solid #ef3038 !important;
  opacity: 1 !important;
}
`;

if (!content.includes('.info-row {')) {
    content += additional_css;
    fs.writeFileSync(path, content, 'utf8');
}
