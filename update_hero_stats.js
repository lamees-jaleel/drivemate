const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace Hero Section
const heroRegex = /<section class="welcome-section">.*?<\/section>/s;
const newHero = `<section class="welcome-section">
        <div>
          <p class="eyebrow">INSURANCE & COMPLIANCE</p>
          <h2>Welcome back, <span>{{ firstName }}.</span></h2>
          <p class="welcome-copy">
            Review vehicle compliance records, monitor document validity and provide guidance to vehicle owners regarding insurance and regulatory requirements.
          </p>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
          <button class="secondary-button" type="button" (click)="switchTab('REVIEWS')">Document Review</button>
          <button class="secondary-button" type="button" (click)="switchTab('EXPIRY')">Expiry Monitoring</button>
          <button class="secondary-button" type="button" (click)="switchTab('REPORTS')">Compliance Guidance</button>
        </div>
      </section>`;
html = html.replace(heroRegex, newHero);

// Replace Stats Grid
const statsRegex = /<section class="stats-grid">.*?<\/section>/s;
const newStats = `<section class="stats-grid">
        <button class="stat-card" type="button" (click)="switchTab('REVIEWS')">
          <div class="stat-card-top">
            <span class="stat-icon">◈</span>
            <span class="stat-label">REVIEWS</span>
          </div>
          <div class="stat-value">{{ pendingReviews }}</div>
          <p style="margin: 0;">Pending Reviews</p>
          <small style="display: block; margin-top: 6px; color: #666973; font-size: 11px;">Compliance cases waiting for professional review.</small>
        </button>

        <button class="stat-card" type="button" (click)="switchTab('EXPIRY')">
          <div class="stat-card-top">
            <span class="stat-icon">⚠</span>
            <span class="stat-label">EXPIRY</span>
          </div>
          <div class="stat-value">{{ expiringDocuments }}</div>
          <p style="margin: 0;">Expiring Documents</p>
          <small style="display: block; margin-top: 6px; color: #666973; font-size: 11px;">Insurance and regulatory records approaching expiry.</small>
        </button>

        <article class="stat-card">
          <div class="stat-card-top">
            <span class="stat-icon">◉</span>
            <span class="stat-label">ACTIVE</span>
          </div>
          <div class="stat-value">{{ activeCases }}</div>
          <p style="margin: 0;">Active Cases</p>
          <small style="display: block; margin-top: 6px; color: #666973; font-size: 11px;">Vehicle compliance assessments currently observed.</small>
        </article>

        <button class="stat-card" type="button" (click)="switchTab('REPORTS')">
          <div class="stat-card-top">
            <span class="stat-icon">✓</span>
            <span class="stat-label">REPORTS</span>
          </div>
          <div class="stat-value">{{ completedAdvisories }}</div>
          <p style="margin: 0;">Completed Advisories</p>
          <small style="display: block; margin-top: 6px; color: #666973; font-size: 11px;">Compliance recommendations already delivered.</small>
        </button>
      </section>`;
html = html.replace(statsRegex, newStats);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Updated hero and stats");
