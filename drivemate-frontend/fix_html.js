const fs = require('fs');
let html = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', 'utf8');

// I will just find all nav-icons and replace their contents
let count = 0;
html = html.replace(/<span class="nav-icon">[\s\S]*?<\/span>/g, (match) => {
  count++;
  if (count === 1) return '<span class="nav-icon"> ? </span>';
  if (count === 2) return '<span class="nav-icon"> ? </span>';
  if (count === 3) return '<span class="nav-icon"> ? </span>';
  if (count === 4) return '<span class="nav-icon"> ? </span>';
  if (count === 5) return '<span class="nav-icon"> ? </span>';
  return match;
});

// There are other places that might be broken:
// The logout button
html = html.replace(/<button class="logout-button"[\s\S]*?<\/button>/, '<button class="logout-button" type="button" (click)="logout()"><span> ? </span>Logout</button>');

// Active actions and complete service buttons
html = html.replace(/Accept Case [\s\S]*?<\/button>/, 'Accept Case ?</button>');
html = html.replace(/Mark Completed[\s\S]*?<\/button>/, '? Mark Completed</button>');

// Topbar Mobile Menu
html = html.replace(/<button class="menu-button" type="button" aria-label="Open navigation" \(click\)="toggleSidebar\(\)">[\s\S]*?<\/button>/, '<button class="menu-button" type="button" aria-label="Open navigation" (click)="toggleSidebar()">?</button>');

// Close button in Modal
html = html.replace(/<button class="close-btn" type="button" \(click\)="showReportModal = false">.*?<\/button>/, '<button class="close-btn" type="button" (click)="showReportModal = false">×</button>');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', html, 'utf8');
