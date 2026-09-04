const fs = require('fs');

// --- UPDATE HTML ---
const htmlPath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.html";
let htmlContent = fs.readFileSync(htmlPath, "utf8");

// Add ID to bookings section
htmlContent = htmlContent.replace(
  /<section class="history-section">\s*<div class="history-heading">\s*<div>\s*<p class="eyebrow">SLOT STATUS TRACKER<\/p>/,
  '<section class="history-section" id="slot-tracker">\n            <div class="history-heading">\n              <div>\n                <p class="eyebrow">SLOT STATUS TRACKER</p>'
);

// Add ID to booking card
htmlContent = htmlContent.replace(
  /<article class="history-card">(\s*<div class="history-icon")/g,
  '<article class="history-card booking-card-item" id="booking-card-{{ b.id }}">$1'
);

// Add Validation error to odometer
const odoFieldStr = `<div class="form-field">
                  <label for="bookingOdometer">Odometer Reading (KM)</label>
                  <input id="bookingOdometer" type="number" formControlName="odometerKm" placeholder="e.g. 45000" />
                </div>`;
const odoFieldNew = `<div class="form-field">
                  <label for="bookingOdometer">Odometer Reading (KM)</label>
                  <input id="bookingOdometer" type="number" formControlName="odometerKm" placeholder="e.g. 45000" />
                  @if (bookingForm.get('odometerKm')?.touched && bookingForm.get('odometerKm')?.invalid) {
                    <span class="field-error">Odometer reading cannot be lower than the vehicle's current reading of {{ vehicle?.odometerKm }} km.</span>
                  }
                </div>`;
htmlContent = htmlContent.replace(odoFieldStr, odoFieldNew);

fs.writeFileSync(htmlPath, htmlContent, "utf8");

// --- UPDATE CSS ---
const cssPath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.css";
let cssContent = fs.readFileSync(cssPath, "utf8");

if (!cssContent.includes('.highlight-new')) {
  cssContent += `
/* Highlight for newly created bookings */
.booking-card-item {
  transition: box-shadow 0.5s ease, border-color 0.5s ease;
}
.highlight-new {
  box-shadow: 0 0 12px 2px rgba(245, 53, 67, 0.4);
  border-color: #f53543 !important;
}
`;
  fs.writeFileSync(cssPath, cssContent, "utf8");
}

// --- UPDATE TS ---
const tsPath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.ts";
let tsContent = fs.readFileSync(tsPath, "utf8");

// Prefill and validate
const loadVehicleOld = `this.f.odometerKm
              .setValue(
                response.vehicle
                  .odometerKm
              );`;
const loadVehicleNew = `this.f.odometerKm
              .setValue(
                response.vehicle
                  .odometerKm
              );
              
            // Prefill and validate booking form odometer
            this.bookingForm.patchValue({ odometerKm: response.vehicle.odometerKm });
            this.bookingForm.get('odometerKm')?.setValidators([
              Validators.required, 
              Validators.min(response.vehicle.odometerKm)
            ]);
            this.bookingForm.get('odometerKm')?.updateValueAndValidity();`;
tsContent = tsContent.replace(loadVehicleOld, loadVehicleNew);


// Handle success behavior
const submitOld = `next: response => {
  
            this.bookingSuccess = 'Your maintenance slot booking was successfully submitted! A provider will accept it shortly.';
  
            this.bookingForm.reset({
              urgency: 'NORMAL',
              providerType: 'DRIVEMATE_EXPERT'
            });
  
            this.loadBookings();
  
            this.bookingSubmitting = false;
  
          },`;
const submitNew = `next: response => {
            this.toast.show('Service slot booked successfully.', 'success');
            
            this.bookingForm.reset({
              urgency: 'NORMAL',
              providerType: 'DRIVEMATE_EXPERT',
              odometerKm: this.vehicle?.odometerKm
            });

            if (response.request) {
               this.bookings = [response.request, ...this.bookings];
            } else {
               this.loadBookings();
            }

            this.bookingSubmitting = false;
            
            setTimeout(() => {
                this.setTab('bookings'); // Switch tab to ensure it's visible if hidden
                setTimeout(() => {
                    const tracker = document.getElementById('slot-tracker');
                    if (tracker) {
                        tracker.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    if (response.request) {
                        const card = document.getElementById('booking-card-' + response.request.id);
                        if (card) {
                            card.classList.add('highlight-new');
                            setTimeout(() => card.classList.remove('highlight-new'), 3000);
                        }
                    }
                }, 50);
            }, 10);
          },`;
// Make sure to remove any leftover bookingSuccess strings
tsContent = tsContent.replace(/this\.bookingSuccess = '';/g, "");
tsContent = tsContent.replace(submitOld, submitNew);

fs.writeFileSync(tsPath, tsContent, "utf8");

console.log("Patched maintenance frontend");
