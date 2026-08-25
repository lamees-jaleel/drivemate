const fs = require('fs');
let css = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', 'utf8');

// 1. Sidebar Nav
css = css.replace(/\.nav-item \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*11px;/, 'font-size: 14px;');
});
css = css.replace(/\.nav-icon \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*14px;/, 'font-size: 17px;').replace(/color:\s*#f53543;/, 'color: #f53543; width: 24px; display: inline-flex; justify-content: center;');
});
css = css.replace(/\.nav-item small \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*6px;/, 'font-size: 10px;');
});

// 2. Sidebar Role Badge
css = css.replace(/\.role-badge \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*7px;/, 'font-size: 11px;');
});

// 3. User Details
css = css.replace(/\.user-details strong \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*10px;/, 'font-size: 14px;');
});
css = css.replace(/\.user-details span \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*7px;/, 'font-size: 11px;');
});

// 4. Hero Welcome
css = css.replace(/\.hero-content h1 \{[\s\S]*?\}/, (match) => {
  return match.replace(/clamp\(38px, 6vw, 65px\)/, 'clamp(34px, 4vw, 56px)');
});
css = css.replace(/\.hero-content p \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*12px;/, 'font-size: 14px;');
});

// 5. Stat Cards
css = css.replace(/\.stat-card h3 \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*13px;/, 'font-size: 14px;');
});
css = css.replace(/\.stat-card \.value \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*29px;/, 'font-size: 32px;');
});
css = css.replace(/\.stat-card p \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*10px;/, 'font-size: 13px;');
});

// 6. Topbar
css = css.replace(/\.topbar-label \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*8px;/, 'font-size: 11px;');
});

// 7. Expert Request Card Metadata
css = css.replace(/\.vehicle-tag \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*7px;/, 'font-size: 12px;');
});
css = css.replace(/\.request-meta h3 \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*18px;/, 'font-size: 20px;');
});
css = css.replace(/\.symptoms-text \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*11px;/, 'font-size: 14px;');
});
css = css.replace(/\.provider-info-text \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*9px;/, 'font-size: 13px;');
});

// 8. Badges / Indicators
css = css.replace(/\.urgency-indicator \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*8px;/, 'font-size: 11px;');
});
css = css.replace(/\.odo-badge \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*8px;/, 'font-size: 11px;');
});
css = css.replace(/\.action-btn \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*9px;/, 'font-size: 12px;');
});

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', css, 'utf8');
console.log('Typography fixes applied safely.');
