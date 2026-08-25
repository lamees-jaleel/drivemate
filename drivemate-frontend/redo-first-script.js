const fs = require('fs');

const files = [
  'documents/documents.html',
  'expenses/expenses.html',
  'maintenance/maintenance.html',
  'vehicle-details/vehicle-details.html'
].map(f => 'src/app/pages/' + f);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  const backLinkRegex = /<a([^>]*)class="back-link"([^>]*)>([\s\S]*?)<\/a>/g;
  
  content = content.replace(backLinkRegex, (match, p1, p2, p3) => {
    let text = p3.replace('←', '').trim();
    return `<a${p1}class="back-link"${p2}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      <span>${text}</span>
    </a>`;
  });

  fs.writeFileSync(file, content, 'utf-8');
});
