const fs = require('fs');
let css = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', 'utf8');

css = css.replace(/font-size:\s*(\d+)px;/g, (match, size) => {
  let s = parseInt(size, 10);
  if (s < 16) {
    s = Math.round(s * 1.6);
  } else if (s > 30) {
    s = Math.round(s * 0.7);
  }
  return 'font-size: ' + s + 'px;';
});

css = css.replace(/clamp\([^)]+\)/g, '36px');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', css);
console.log('Done');
