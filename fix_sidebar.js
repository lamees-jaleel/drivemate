const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

const fixCss = `
/* =========================================================
   SIDEBAR LAYOUT FIXES
   ========================================================= */
.sidebar-top {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  padding: 4px 8px;
  margin-bottom: 32px;
}

.role-badge {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.5px;
  color: #a0a2ad;
  margin-top: 6px;
  flex: 1;
  flex-wrap: wrap;
}

.role-badge .role-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f53543;
  box-shadow: 0 0 8px rgba(245, 53, 67, 0.6);
  flex-shrink: 0;
  margin-top: 3px;
}

.navigation {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
`;

css += '\n' + fixCss;
fs.writeFileSync(cssPath, css, 'utf8');
console.log("Appended sidebar fixes to compliance-dashboard.css");
