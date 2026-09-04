const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-frontend/src/app/services/maintenance.service.ts";
let content = fs.readFileSync(filePath, "utf8");

const newMethods = `

  /* =======================================================
     UPDATE MAINTENANCE RECORD
  ======================================================= */
  updateMaintenanceRecord(
    vehicleId: number,
    recordId: number,
    payload: AddMaintenancePayload
  ): Observable<AddMaintenanceResponse> {
    return this.http.put<AddMaintenanceResponse>(
      \`\${this.baseUrl}/\${vehicleId}/maintenance/\${recordId}\`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  /* =======================================================
     DELETE MAINTENANCE RECORD
  ======================================================= */
  deleteMaintenanceRecord(
    vehicleId: number,
    recordId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      \`\${this.baseUrl}/\${vehicleId}/maintenance/\${recordId}\`,
      { headers: this.getAuthHeaders() }
    );
  }

  /* =======================================================
     STATUS CALCULATION
  ======================================================= */
  
  computeMaintenanceStatus(
    record: MaintenanceRecord,
    latestOdometerKm: number,
    allRecords: MaintenanceRecord[]
  ): { status: 'UPCOMING' | 'DUE SOON' | 'DUE' | 'OVERDUE' | 'COMPLETED'; text: string; urgent: boolean } {
    
    // 1. Is there a newer completed record of the same type?
    const hasNewer = allRecords.some(r => 
      r.maintenanceType === record.maintenanceType && 
      new Date(r.serviceDate) > new Date(record.serviceDate)
    );
    if (hasNewer) {
      return { status: 'COMPLETED', text: 'Completed', urgent: false };
    }

    // 2. Is there even a next service reminder?
    if (!record.nextServiceDate && !record.nextServiceOdometerKm) {
      return { status: 'UPCOMING', text: 'No reminder set', urgent: false };
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    
    let isDue = false;
    let isDueSoon = false;
    let isOverdue = false;
    
    let daysDiff = Infinity;
    if (record.nextServiceDate) {
      const nextDate = new Date(record.nextServiceDate);
      nextDate.setHours(0,0,0,0);
      const msDiff = nextDate.getTime() - today.getTime();
      daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) isOverdue = true;
      else if (daysDiff <= 0) isDue = true;
      else if (daysDiff <= 30) isDueSoon = true;
    }
    
    let kmDiff = Infinity;
    if (record.nextServiceOdometerKm) {
      kmDiff = record.nextServiceOdometerKm - latestOdometerKm;
      
      if (kmDiff < 0) isOverdue = true;
      else if (kmDiff <= 0) isDue = true;
      else if (kmDiff <= 1000) isDueSoon = true;
    }
    
    if (isOverdue) {
      return { status: 'OVERDUE', text: 'Service Overdue', urgent: true };
    }
    
    if (isDue) {
      return { status: 'DUE', text: 'Service Due', urgent: true };
    }
    
    if (isDueSoon) {
      const msg = kmDiff <= 1000 && kmDiff < (daysDiff * 33) // approx check to see which is closer
        ? \`\${kmDiff} km remaining\`
        : \`\${daysDiff} days remaining\`;
      return { status: 'DUE SOON', text: msg, urgent: true };
    }

    return { status: 'UPCOMING', text: 'Upcoming', urgent: false };
  }
`;

if (!content.includes("updateMaintenanceRecord")) {
    content = content.replace(/}\s*$/, newMethods + '\n}\n');
    fs.writeFileSync(filePath, content, "utf8");
}
console.log("Patched maintenance service (Angular)");
