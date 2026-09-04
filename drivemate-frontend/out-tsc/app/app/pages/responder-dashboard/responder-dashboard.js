import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RoadsideService } from '../../services/roadside.service';
let ResponderDashboard = class ResponderDashboard {
    router = inject(Router);
    authService = inject(AuthService);
    roadsideService = inject(RoadsideService);
    currentUser = null;
    firstName = 'Responder';
    mobileSidebarOpen = false;
    currentTab = 'DASHBOARD'; // DASHBOARD, REQUESTS, NAVIGATION, ACTIVE, COMPLETED, PROFILE
    /* =======================================================
       RESPONDER METRICS
       ======================================================= */
    availableRequests = 0;
    activeAssistance = 0;
    completedRequests = 0;
    /* =======================================================
       WORKSPACE STATE
       ======================================================= */
    loading = false;
    requests = [];
    selectedRequest = null;
    successMessage = '';
    errorMessage = '';
    completingRequest = false;
    completionNote = '';
    ngOnInit() {
        this.loadCurrentUser();
        this.loadStats();
    }
    /* =======================================================
       CURRENT USER
       ======================================================= */
    loadCurrentUser() {
        if (!this.authService
            .isLoggedIn()) {
            this.router.navigate([
                '/login'
            ]);
            return;
        }
        const user = this.authService
            .getUser();
        if (!user ||
            user.role !==
                'ROADSIDE_RESPONDER') {
            this.router.navigate([
                '/'
            ]);
            return;
        }
        this.currentUser =
            user;
        this.firstName =
            this.extractFirstName(user.fullName);
    }
    /* =======================================================
       FIRST NAME
       ======================================================= */
    extractFirstName(fullName) {
        const cleanName = fullName.trim();
        if (!cleanName) {
            return 'Responder';
        }
        return (cleanName
            .split(/\s+/)[0] ??
            'Responder');
    }
    /* =======================================================
       LOAD METRICS / STATS
       ======================================================= */
    loadStats() {
        this.roadsideService.getAvailableRequests().subscribe({
            next: (res) => {
                this.availableRequests = res.requests?.length || 0;
            },
            error: (err) => console.error('Error available requests:', err)
        });
        this.roadsideService.getActiveAssistance().subscribe({
            next: (res) => {
                this.activeAssistance = res.requests?.length || 0;
            },
            error: (err) => console.error('Error active assistance:', err)
        });
        this.roadsideService.getCompletedRequests().subscribe({
            next: (res) => {
                this.completedRequests = res.requests?.length || 0;
            },
            error: (err) => console.error('Error completed requests:', err)
        });
    }
    /* =======================================================
       WORKSPACE TAB SWITCHER
       ======================================================= */
    switchTab(tab) {
        this.currentTab = tab;
        this.selectedRequest = null;
        this.mobileSidebarOpen = false;
        this.errorMessage = '';
        this.successMessage = '';
        if (tab === 'DASHBOARD') {
            this.loadStats();
        }
        else if (tab === 'REQUESTS') {
            this.loadRequests('AVAILABLE');
        }
        else if (tab === 'ACTIVE') {
            this.loadRequests('ACTIVE');
        }
        else if (tab === 'COMPLETED') {
            this.loadRequests('COMPLETED');
        }
        else if (tab === 'NAVIGATION') {
            // For live GPS navigation, fetch active requests to navigate to
            this.loadRequests('ACTIVE');
        }
    }
    /* =======================================================
       LOAD REQUESTS
       ======================================================= */
    loadRequests(type) {
        this.loading = true;
        this.errorMessage = '';
        let reqObservable;
        if (type === 'AVAILABLE') {
            reqObservable = this.roadsideService.getAvailableRequests();
        }
        else if (type === 'ACTIVE') {
            reqObservable = this.roadsideService.getActiveAssistance();
        }
        else {
            reqObservable = this.roadsideService.getCompletedRequests();
        }
        reqObservable.subscribe({
            next: (res) => {
                this.requests = res.requests || [];
                this.loading = false;
                this.loadStats();
            },
            error: (err) => {
                console.error('Error loading requests:', err);
                this.errorMessage = err.error?.message || 'Unable to fetch requests.';
                this.loading = false;
            }
        });
    }
    /* =======================================================
       ACCEPT REQUEST
       ======================================================= */
    acceptRequest(id) {
        this.errorMessage = '';
        this.successMessage = '';
        this.roadsideService.acceptRequest(id).subscribe({
            next: (res) => {
                this.successMessage = res.message || 'Emergency request accepted successfully!';
                this.loadStats();
                this.switchTab('ACTIVE');
            },
            error: (err) => {
                console.error('Error accepting request:', err);
                this.errorMessage = err.error?.message || 'Unable to accept request.';
            }
        });
    }
    /* =======================================================
       START ASSISTANCE (MARK IN_PROGRESS)
       ======================================================= */
    startAssistance(id) {
        this.errorMessage = '';
        this.successMessage = '';
        this.roadsideService.updateStatus(id, 'IN_PROGRESS').subscribe({
            next: (res) => {
                this.successMessage = 'Assistance started. Status is now In Progress.';
                this.loadRequests('ACTIVE');
            },
            error: (err) => {
                console.error('Error starting assistance:', err);
                this.errorMessage = err.error?.message || 'Unable to update status.';
            }
        });
    }
    /* =======================================================
       COMPLETE ASSISTANCE (MARK COMPLETED)
       ======================================================= */
    completeAssistance(id) {
        this.errorMessage = '';
        this.successMessage = '';
        this.roadsideService.updateStatus(id, 'COMPLETED').subscribe({
            next: (res) => {
                this.successMessage = 'Roadside assistance operation completed successfully!';
                this.loadStats();
                this.switchTab('COMPLETED');
            },
            error: (err) => {
                console.error('Error completing request:', err);
                this.errorMessage = err.error?.message || 'Unable to complete request.';
            }
        });
    }
    /* =======================================================
       SIDEBAR
       ======================================================= */
    toggleSidebar() {
        this.mobileSidebarOpen =
            !this.mobileSidebarOpen;
    }
    closeSidebar() {
        this.mobileSidebarOpen =
            false;
    }
    /* =======================================================
       LOGOUT
       ======================================================= */
    logout() {
        this.authService
            .clearSession();
        this.router.navigate([
            '/login'
        ]);
    }
};
ResponderDashboard = __decorate([
    Component({
        selector: 'app-responder-dashboard',
        standalone: true,
        imports: [
            FormsModule,
            CommonModule
        ],
        templateUrl: './responder-dashboard.html',
        styleUrl: './responder-dashboard.css'
    })
], ResponderDashboard);
export { ResponderDashboard };
