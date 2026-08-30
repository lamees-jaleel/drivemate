const fs = require('fs');

const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace summary-grid with stats-grid
html = html.replace(/<section class="summary-grid">/g, '<section class="stats-grid">');
html = html.replace(/<div class="summary-grid"/g, '<div class="stats-grid"');

// 2. Replace the 4 application stat cards
const newAppStats = `
      <section class="stats-grid">

        <button
          class="stat-card"
          type="button"
          [class.selected]="currentFilter === 'PENDING'"
          (click)="loadProfessionals('PENDING')">
          <div class="stat-card-top">
            <span class="stat-icon">??</span>
            <span class="stat-label">PENDING</span>
          </div>
          <div class="stat-value">{{ pendingCount }}</div>
          <p>Awaiting administrator review</p>
        </button>

        <button
          class="stat-card"
          type="button"
          [class.selected]="currentFilter === 'APPROVED'"
          (click)="loadProfessionals('APPROVED')">
          <div class="stat-card-top">
            <span class="stat-icon">?</span>
            <span class="stat-label">APPROVED</span>
          </div>
          <div class="stat-value">{{ approvedCount }}</div>
          <p>Verified professional accounts</p>
        </button>

        <button
          class="stat-card"
          type="button"
          [class.selected]="currentFilter === 'REJECTED'"
          (click)="loadProfessionals('REJECTED')">
          <div class="stat-card-top">
            <span class="stat-icon">?</span>
            <span class="stat-label">REJECTED</span>
          </div>
          <div class="stat-value">{{ rejectedCount }}</div>
          <p>Applications not approved</p>
        </button>

        <button
          class="stat-card"
          type="button"
          [class.selected]="currentFilter === 'ALL'"
          (click)="loadProfessionals('ALL')">
          <div class="stat-card-top">
            <span class="stat-icon">??</span>
            <span class="stat-label">ALL</span>
          </div>
          <div class="stat-value">
            {{ pendingCount + approvedCount + rejectedCount }}
          </div>
          <p>Complete professional registry</p>
        </button>

      </section>
`;

html = html.replace(/<section class="stats-grid">[\s\S]*?<\/section>/, newAppStats);

// 3. Replace the 4 reports stat cards
const newReportStats = `
          <div class="stats-grid" style="margin-bottom: 24px;">
            <div class="stat-card">
              <div class="stat-card-top">
                <span class="stat-icon">??</span>
                <span class="stat-label">TOTAL VEHICLES</span>
              </div>
              <div class="stat-value">{{ reports.totalVehicles }}</div>
              <p>Vehicles registered on platform</p>
            </div>
            <div class="stat-card">
              <div class="stat-card-top">
                <span class="stat-icon">??</span>
                <span class="stat-label">MAINTENANCE</span>
              </div>
              <div class="stat-value">{{ reports.totalMaintenance }}</div>
              <p>Service logs completed by owners</p>
            </div>
            <div class="stat-card">
              <div class="stat-card-top">
                <span class="stat-icon">??</span>
                <span class="stat-label">EXPENSES</span>
              </div>
              <div class="stat-value">{{ reports.expenses.count }}</div>
              <p>Expense records filed by owners</p>
            </div>
            <div class="stat-card">
              <div class="stat-card-top">
                <span class="stat-icon">??</span>
                <span class="stat-label">EXPENSES SUM</span>
              </div>
              <div class="stat-value expense">${'$'}{{ reports.expenses.sum | number }}</div>
              <p>Aggregate of owner expenditures</p>
            </div>
          </div>
`;

html = html.replace(/<div class="stats-grid" style="margin-bottom: 24px;">[\s\S]*?<\/div>\s*<\/div>\s*<div style="display: grid;/, newReportStats + '\n            <div style="display: grid;');

// 4. Update review/approve buttons
html = html.replace(/class="review-button"/g, 'class="primary-button compact"');
html = html.replace(/class="approve-button"/g, 'class="primary-button"');

fs.writeFileSync(htmlPath, html, 'utf8');

console.log("Done HTML");
