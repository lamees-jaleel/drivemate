const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/expert-dashboard/expert-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const newStatsGrid = `
    <!-- ===================================================
         STATS
    ==================================================== -->

    <section class="stats-grid">

      <article class="stat-card">
        <div class="stat-card-top">
          <span class="stat-icon">?</span>
          <span class="stat-label">REQUESTS</span>
        </div>
        <div class="stat-value">
          {{ pendingRequests }}
        </div>
        <p>New diagnostic requests waiting for expert review.</p>
      </article>

      <article class="stat-card">
        <div class="stat-card-top">
          <span class="stat-icon">?</span>
          <span class="stat-label">ACCEPTED</span>
        </div>
        <div class="stat-value">
          {{ acceptedCases }}
        </div>
        <p>Bookings accepted and scheduled for evaluation.</p>
      </article>

      <article class="stat-card">
        <div class="stat-card-top">
          <span class="stat-icon">?</span>
          <span class="stat-label">ACTIVE</span>
        </div>
        <div class="stat-value">
          {{ activeCases }}
        </div>
        <p>Currently in progress and undergoing diagnosis.</p>
      </article>

      <article class="stat-card">
        <div class="stat-card-top">
          <span class="stat-icon">?</span>
          <span class="stat-label">REPORTS</span>
        </div>
        <div class="stat-value">
          {{ completedReports }}
        </div>
        <p>Completed diagnostics with final recommendations.</p>
      </article>

    </section>
`;

html = html.replace(/<!-- ===================================================\s*STATS\s*==================================================== -->\s*<section class="stats-grid">[\s\S]*?<\/section>/, newStatsGrid);
fs.writeFileSync(htmlPath, html, 'utf8');
