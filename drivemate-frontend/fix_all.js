const fs = require('fs');
let css = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', 'utf8');

// Fix Welcome Clamp
css = css.replace(/clamp\(\s*38px,\s*5vw,\s*59px\s*\)/, 'clamp(34px, 4vw, 56px)');

// Fix Nav Item specifically
css = css.replace(/\.nav-item \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*11px;/, 'font-size: 14px;');
});
css = css.replace(/\.nav-icon \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*14px;/, 'font-size: 24px; display: flex; align-items: center;');
});
css = css.replace(/\.nav-item small \{[\s\S]*?\}/, (match) => {
  return match.replace(/font-size:\s*6px;/, 'font-size: 10px;');
});

// For all other font-sizes, if they are <= 13px, just strip them so they inherit normally like owner-dashboard
css = css.replace(/font-size:\s*(\d+)px;/g, (match, size) => {
  let s = parseInt(size, 10);
  if (s <= 13) {
    return '/* ' + match + ' removed to inherit */';
  }
  return match;
});

// Also remove tiny line-heights that might squish text now that fonts are bigger
css = css.replace(/line-height:\s*1\.\d+;/g, (match) => {
  if (match.includes('1.1') || match.includes('1.2')) return match; // keep hero titles
  return '/* ' + match + ' removed */';
});

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', css, 'utf8');
console.log('Done');
