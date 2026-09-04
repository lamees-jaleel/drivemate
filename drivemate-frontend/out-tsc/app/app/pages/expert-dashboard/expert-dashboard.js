import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DiagnosticService } from '../../services/diagnostic.service';
import { ToastService } from '../../shared/toast/toast.service';
let ExpertDashboard = class ExpertDashboard {
    router = inject(Router);
    authService = inject(AuthService);
    toast = inject(ToastService);
    diagnosticService = inject(DiagnosticService);
    currentUser = null;
    firstName = 'Expert';
    mobileSidebarOpen = false;
    activeTab = 'dashboard';
    availableRequests = [];
    activeRequests = [];
    completedRequests = [];
    loading = false;
    pendingRequests = 0;
    acceptedCases = 0;
    activeCases = 0;
    completedReports = 0;
    showReportModal = false;
    currentReportId = null;
    reportFindings = '';
    reportSuspectedCause = '';
    reportSeverity = 'MEDIUM';
    reportSafeToDrive = true;
    reportRecommendedAction = '';
    reportEstimatedRepairCost = null;
    reportFollowUpRequired = false;
    reportFollowUpNotes = '';
    submittingReport = false;
    ngOnInit() {
        this.loadCurrentUser();
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
                'DIAGNOSTIC_EXPERT') {
            this.router.navigate([
                '/'
            ]);
            return;
        }
        this.currentUser =
            user;
        this.firstName =
            this.extractFirstName(user.fullName);
        this.loadRequests();
    }
    /* =======================================================
       FIRST NAME
    ======================================================= */
    extractFirstName(fullName) {
        const cleanName = fullName.trim();
        if (!cleanName) {
            return 'Expert';
        }
        return (cleanName
            .split(/\s+/)[0] ??
            'Expert');
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
    /* =======================================================
       DIAGNOSTIC WORKFLOW & REQUESTS LOADING
    ======================================================= */
    setTab(tab) {
        this.activeTab = tab;
        this.closeSidebar();
        this.loadRequests();
    }
    loadRequests() {
        this.loading = true;
        // AVAILABLE / PENDING REQUESTS
        this.diagnosticService
            .getExpertRequests('AVAILABLE')
            .subscribe({
            next: res => {
                this.availableRequests = res.requests;
                this.pendingRequests = this.availableRequests.length;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
        // ACTIVE CASES (ACCEPTED & IN PROGRESS)
        this.diagnosticService
            .getExpertRequests('ACTIVE')
            .subscribe({
            next: res => {
                this.activeRequests = res.requests;
                this.acceptedCases = this.activeRequests.filter(r => r.status === 'ACCEPTED').length;
                this.activeCases = this.activeRequests.length;
            }
        });
        // COMPLETED REPORTS
        this.diagnosticService
            .getExpertRequests('COMPLETED')
            .subscribe({
            next: res => {
                this.completedRequests = res.requests;
                this.completedReports = this.completedRequests.length;
            }
        });
    }
    acceptRequest(id) {
        this.diagnosticService
            .acceptRequest(id)
            .subscribe({
            next: () => {
                this.loadRequests();
                this.activeTab = 'active';
            },
            error: () => {
                this.toast.show('Failed to accept request. Please try again.', 'error');
            }
        });
    }
    startService(id) {
        this.diagnosticService
            .updateStatus(id, 'IN_PROGRESS')
            .subscribe({
            next: () => {
                this.loadRequests();
            },
            error: () => {
                this.toast.show('Failed to start service.', 'error');
            }
        });
    }
    openReportModal(id) {
        this.currentReportId = id;
        this.showReportModal = true;
        this.reportFindings = '';
        this.reportSuspectedCause = '';
        this.reportSeverity = 'MEDIUM';
        this.reportSafeToDrive = true;
        this.reportRecommendedAction = '';
        this.reportEstimatedRepairCost = null;
        this.reportFollowUpRequired = false;
        this.reportFollowUpNotes = '';
    }
    submitReport() {
        if (!this.currentReportId)
            return;
        if (!this.reportFindings || !this.reportRecommendedAction) {
            this.toast.show('Findings and recommended action are required.', 'error');
            return;
        }
        this.submittingReport = true;
        const payload = {
            findings: this.reportFindings,
            suspectedCause: this.reportSuspectedCause,
            severity: this.reportSeverity,
            safeToDrive: this.reportSafeToDrive,
            recommendedAction: this.reportRecommendedAction,
            estimatedRepairCost: this.reportEstimatedRepairCost ? Number(this.reportEstimatedRepairCost) : null,
            followUpRequired: this.reportFollowUpRequired,
            followUpNotes: this.reportFollowUpNotes
        };
        this.diagnosticService.submitReport(this.currentReportId, payload).subscribe({
            next: () => {
                this.submittingReport = false;
                this.showReportModal = false;
                this.loadRequests();
                this.activeTab = 'completed';
            },
            error: () => {
                this.submittingReport = false;
                this.toast.show('Failed to submit report.', 'error');
            }
        });
    }
    completeService(id) {
        this.diagnosticService
            .updateStatus(id, 'COMPLETED')
            .subscribe({
            next: () => {
                this.loadRequests();
                this.activeTab = 'completed';
            },
            error: () => {
                this.toast.show('Failed to mark service as completed.', 'error');
            }
        });
    }
    cancelService(id) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            this.diagnosticService
                .updateStatus(id, 'CANCELLED')
                .subscribe({
                next: () => {
                    this.loadRequests();
                },
                error: () => {
                    this.toast.show('Failed to cancel request.', 'error');
                }
            });
        }
    }
    formatDate(value) {
        if (!value)
            return '';
        const date = new Date(value);
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }
    getConcernLabel(type) {
        return type
            .replace(/_/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }
    getProviderTypeLabel(type) {
        switch (type) {
            case 'AUTHORIZED_DEALER':
                return '🏢 Authorised Dealer';
            case 'LOCAL_SHOP':
                return '🔧 Local Shop';
            case 'MOBILE_MECHANIC':
                return '🚐 Mobile Mechanic';
            case 'DRIVEMATE_EXPERT':
                return '⭐ DriveMate Expert';
            default:
                return type;
        }
    }
    getProviderTypeClass(type) {
        switch (type) {
            case 'AUTHORIZED_DEALER':
                return 'provider-authorized';
            case 'LOCAL_SHOP':
                return 'provider-local';
            case 'MOBILE_MECHANIC':
                return 'provider-mobile';
            case 'DRIVEMATE_EXPERT':
                return 'provider-drivemate';
            default:
                return '';
        }
    }
    getUrgencyClass(urgency) {
        switch (urgency) {
            case 'LOW':
                return 'urgency-low';
            case 'NORMAL':
                return 'urgency-normal';
            case 'HIGH':
                return 'urgency-high';
            case 'CRITICAL':
                return 'urgency-critical';
            default:
                return 'urgency-normal';
        }
    }
    getStatusClass(status) {
        switch (status) {
            case 'PENDING':
                return 'status-pending';
            case 'ACCEPTED':
                return 'status-accepted';
            case 'IN_PROGRESS':
                return 'status-inprogress';
            case 'COMPLETED':
                return 'status-completed';
            case 'CANCELLED':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    }
};
ExpertDashboard = __decorate([
    Component({
        selector: 'app-expert-dashboard',
        standalone: true,
        imports: [
            RouterLink,
            NgClass,
            FormsModule
        ],
        templateUrl: './expert-dashboard.html',
        styleUrl: './expert-dashboard.css'
    })
], ExpertDashboard);
export { ExpertDashboard };
