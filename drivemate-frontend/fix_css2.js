const fs = require('fs');
let css = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.css.bak', 'utf8');

css = css.replace(/font-size:\s*(\d+)px;/g, (match, size) => {
  let s = parseInt(size, 10);
  if (s <= 11) {
    s = s + 5;
  } else if (s === 12 || s === 13) {
    s = s + 2;
  } else if (s > 40) {
    s = Math.round(s * 0.7);
  }
  return 'font-size: ' + s + 'px;';
});

css = css.replace(/clamp\([^)]+\)/g, '36px');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', css);
console.log('Done');
