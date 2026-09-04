const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add properties
const props = `
  /* =======================================================
     EDIT / DELETE STATE
  ======================================================= */
  activeActionMenu: number | null = null;
  isEditing = false;
  editingRecordId: number | null = null;
`;
content = content.replace(/maintenanceRecords:\s*MaintenanceRecord\[\]\s*=\s*\[\];/, "maintenanceRecords: MaintenanceRecord[] = [];" + props);

// Add methods
const methods = `
  /* =======================================================
     EDIT / DELETE METHODS
  ======================================================= */
  toggleActionMenu(id: number) {
    if (this.activeActionMenu === id) {
      this.activeActionMenu = null;
    } else {
      this.activeActionMenu = id;
    }
  }

  editRecord(record: MaintenanceRecord) {
    this.activeActionMenu = null;
    this.isEditing = true;
    this.editingRecordId = record.id;
    
    // Fill form
    this.maintenanceForm.patchValue({
      maintenanceType: record.maintenanceType,
      title: record.title,
      serviceDate: record.serviceDate ? record.serviceDate.substring(0, 10) : '',
      odometerKm: record.odometerKm,
      serviceCenter: record.serviceCenter || '',
      description: record.description || '',
      cost: record.cost,
      nextServiceDate: record.nextServiceDate ? record.nextServiceDate.substring(0, 10) : '',
      nextServiceOdometerKm: record.nextServiceOdometerKm || null
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingRecordId = null;
    this.maintenanceForm.reset();
  }

  deleteRecord(record: MaintenanceRecord) {
    this.activeActionMenu = null;
    if (!this.vehicle) return;
    
    const confirmDelete = confirm(\`Delete service record?\\n\\nThis will remove "\${record.title}" from this vehicle's maintenance history.\`);
    
    if (confirmDelete) {
      this.maintenanceService.deleteMaintenanceRecord(this.vehicle.id, record.id).subscribe({
        next: () => {
          this.maintenanceRecords = this.maintenanceRecords.filter(r => r.id !== record.id);
          this.recordCount = this.maintenanceRecords.length;
          // Just simple reload to recalculate everything properly including max odometer
          this.loadMaintenanceHistory(this.vehicle!.id);
          alert('Service record deleted successfully.');
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete record.');
        }
      });
    }
  }

  getRecordStatus(record: MaintenanceRecord) {
    if (!this.vehicle) return null;
    return this.maintenanceService.computeMaintenanceStatus(record, this.vehicle.odometerKm, this.maintenanceRecords);
  }

`;
// Insert methods before ngOnInit
content = content.replace(/ngOnInit\(\):\s*void\s*\{/, methods + "\n  ngOnInit(): void {");


// Intercept submit
const submitReplacement = `
  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      this.formValidation.markFormGroupTouched(this.maintenanceForm);
      this.formValidation.scrollToFirstInvalidControl(this.maintenanceForm);
      return;
    }

    if (!this.vehicle) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: AddMaintenancePayload = {
      maintenanceType: this.maintenanceForm.value.maintenanceType,
      title: this.maintenanceForm.value.title,
      serviceDate: this.maintenanceForm.value.serviceDate,
      odometerKm: Number(this.maintenanceForm.value.odometerKm),
      serviceCenter: this.maintenanceForm.value.serviceCenter || undefined,
      description: this.maintenanceForm.value.description || undefined,
      cost: Number(this.maintenanceForm.value.cost),
      nextServiceDate: this.maintenanceForm.value.nextServiceDate || undefined,
      nextServiceOdometerKm: this.maintenanceForm.value.nextServiceOdometerKm 
        ? Number(this.maintenanceForm.value.nextServiceOdometerKm) 
        : null
    };

    if (this.isEditing && this.editingRecordId) {
        // UPDATE
        this.maintenanceService.updateMaintenanceRecord(this.vehicle.id, this.editingRecordId, payload).subscribe({
            next: (response) => {
                this.submitting = false;
                this.successMessage = 'Service record updated successfully.';
                this.cancelEdit();
                this.loadMaintenanceHistory(this.vehicle!.id);
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            },
            error: (error: HttpErrorResponse) => {
                this.submitting = false;
                this.errorMessage = error.error?.message || 'Unable to update record.';
            }
        });
    } else {
        // CREATE
        this.maintenanceService.addMaintenanceRecord(this.vehicle.id, payload).subscribe({
`;
content = content.replace(
  /onSubmit\(\):\s*void\s*\{\s*if\s*\(this\.maintenanceForm\.invalid\)\s*\{\s*this\.formValidation\.markFormGroupTouched\(this\.maintenanceForm\);\s*this\.formValidation\.scrollToFirstInvalidControl\(this\.maintenanceForm\);\s*return;\s*\}\s*if\s*\(!this\.vehicle\)\s*\{\s*return;\s*\}\s*this\.submitting\s*=\s*true;\s*this\.errorMessage\s*=\s*'';\s*this\.successMessage\s*=\s*'';\s*const payload: AddMaintenancePayload = \{\s*maintenanceType: this\.maintenanceForm\.value\.maintenanceType,\s*title: this\.maintenanceForm\.value\.title,\s*serviceDate: this\.maintenanceForm\.value\.serviceDate,\s*odometerKm: Number\(this\.maintenanceForm\.value\.odometerKm\),\s*serviceCenter: this\.maintenanceForm\.value\.serviceCenter \|\| undefined,\s*description: this\.maintenanceForm\.value\.description \|\| undefined,\s*cost: Number\(this\.maintenanceForm\.value\.cost\),\s*nextServiceDate: this\.maintenanceForm\.value\.nextServiceDate \|\| undefined,\s*nextServiceOdometerKm: this\.maintenanceForm\.value\.nextServiceOdometerKm\s*\?\s*Number\(this\.maintenanceForm\.value\.nextServiceOdometerKm\)\s*:\s*null\s*\};\s*this\.maintenanceService\.addMaintenanceRecord\(this\.vehicle\.id,\s*payload\)\s*\.subscribe\(\{/,
  submitReplacement
);

// We need to match the extra bracket for else
content = content.replace(
    /this\.successMessage = '';\s*\}, 3000\);\s*\},\s*error: \(error: HttpErrorResponse\) => \{\s*this\.submitting = false;\s*console\.error\('Add maintenance error:', error\);\s*this\.errorMessage = error\.error\?.message \|\| 'Unable to add service record. Please try again.';\s*\}\s*\}\);\s*\}/,
    `this.successMessage = '';
            }, 3000);
          },
          error: (error: HttpErrorResponse) => {
            this.submitting = false;
            console.error('Add maintenance error:', error);
            this.errorMessage = error.error?.message || 'Unable to add service record. Please try again.';
          }
        });
    } // closes the else block
  }`
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched maintenance ts (Angular)");
