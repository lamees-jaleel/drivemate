import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
let AdminDashboard = class AdminDashboard {
    router = inject(Router);
    authService = inject(AuthService);
    adminService = inject(AdminService);
    currentUser = null;
    firstName = 'Admin';
    professionals = [];
    selectedProfessional = null;
    currentFilter = 'PENDING';
    pendingCount = 0;
    approvedCount = 0;
    rejectedCount = 0;
    loading = true;
    detailsLoading = false;
    reviewing = false;
    errorMessage = '';
    successMessage = '';
    reviewNote = '';
    rejectionMode = false;
    mobileSidebarOpen = false;
    currentTab = 'VERIFICATIONS'; // VERIFICATIONS, USER_MANAGEMENT, SYSTEM_REPORTS
    /* =======================================================
       USER MANAGEMENT & REPORTS STATE
       ======================================================= */
    users = [];
    selectedUser = null;
    loadingUsers = false;
    userFilter = 'ALL';
    updatingUserStatus = false;
    reports = null;
    loadingReports = false;
    /* =======================================================
       INITIALIZE
    ======================================================= */
    ngOnInit() {
        this.loadCurrentUser();
        this.loadProfessionals('PENDING');
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
                'ADMIN') {
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
       LOAD PROFESSIONALS
    ======================================================= */
    loadProfessionals(filter) {
        this.loading =
            true;
        this.errorMessage =
            '';
        this.successMessage =
            '';
        this.currentFilter =
            filter;
        this.selectedProfessional =
            null;
        this.rejectionMode =
            false;
        this.reviewNote =
            '';
        const status = filter === 'ALL'
            ? undefined
            : filter;
        this.adminService
            .getProfessionals(status)
            .subscribe({
            next: response => {
                this.professionals =
                    response.professionals;
                this.pendingCount =
                    response.summary.pending;
                this.approvedCount =
                    response.summary.approved;
                this.rejectedCount =
                    response.summary.rejected;
                this.loading =
                    false;
            },
            error: (error) => {
                this.loading =
                    false;
                console.error('Unable to load professional applications:', error);
                if (error.status ===
                    401) {
                    this.authService
                        .clearSession();
                    this.router.navigate([
                        '/login'
                    ]);
                    return;
                }
                if (error.status ===
                    403) {
                    this.router.navigate([
                        '/'
                    ]);
                    return;
                }
                this.errorMessage =
                    error.error?.message ||
                        'Unable to load professional applications.';
            }
        });
    }
    /* =======================================================
       SELECT PROFESSIONAL
    ======================================================= */
    selectProfessional(profile) {
        this.detailsLoading =
            true;
        this.errorMessage =
            '';
        this.successMessage =
            '';
        this.rejectionMode =
            false;
        this.reviewNote =
            '';
        this.adminService
            .getProfessionalById(profile.id)
            .subscribe({
            next: response => {
                this.selectedProfessional =
                    response.professional;
                this.detailsLoading =
                    false;
            },
            error: (error) => {
                this.detailsLoading =
                    false;
                console.error('Unable to load professional details:', error);
                this.errorMessage =
                    error.error?.message ||
                        'Unable to load application details.';
            }
        });
    }
    /* =======================================================
       CLOSE DETAILS
    ======================================================= */
    closeDetails() {
        this.selectedProfessional =
            null;
        this.reviewNote =
            '';
        this.rejectionMode =
            false;
        this.errorMessage =
            '';
        this.successMessage =
            '';
    }
    /* =======================================================
       APPROVE
    ======================================================= */
    approveSelected() {
        if (!this.selectedProfessional ||
            this.reviewing) {
            return;
        }
        if (this.selectedProfessional
            .verificationStatus !==
            'PENDING') {
            return;
        }
        this.reviewing =
            true;
        this.errorMessage =
            '';
        this.successMessage =
            '';
        this.adminService
            .approveProfessional(this.selectedProfessional.id, this.reviewNote.trim())
            .subscribe({
            next: response => {
                this.reviewing =
                    false;
                this.successMessage =
                    response.message;
                this.selectedProfessional =
                    null;
                this.reviewNote =
                    '';
                this.rejectionMode =
                    false;
                this.refreshCurrentFilter();
            },
            error: (error) => {
                this.reviewing =
                    false;
                console.error('Approve professional failed:', error);
                this.errorMessage =
                    error.error?.message ||
                        'Unable to approve professional account.';
            }
        });
    }
    /* =======================================================
       REJECTION MODE
    ======================================================= */
    startReject() {
        this.rejectionMode =
            true;
        this.reviewNote =
            '';
        this.errorMessage =
            '';
        this.successMessage =
            '';
    }
    cancelReject() {
        this.rejectionMode =
            false;
        this.reviewNote =
            '';
        this.errorMessage =
            '';
    }
    /* =======================================================
       REJECT
    ======================================================= */
    rejectSelected() {
        if (!this.selectedProfessional ||
            this.reviewing) {
            return;
        }
        const note = this.reviewNote
            .trim();
        if (!note) {
            this.errorMessage =
                'Please enter a reason for rejection.';
            return;
        }
        if (note.length >
            500) {
            this.errorMessage =
                'Rejection reason must not exceed 500 characters.';
            return;
        }
        this.reviewing =
            true;
        this.errorMessage =
            '';
        this.successMessage =
            '';
        this.adminService
            .rejectProfessional(this.selectedProfessional.id, note)
            .subscribe({
            next: response => {
                this.reviewing =
                    false;
                this.successMessage =
                    response.message;
                this.selectedProfessional =
                    null;
                this.reviewNote =
                    '';
                this.rejectionMode =
                    false;
                this.refreshCurrentFilter();
            },
            error: (error) => {
                this.reviewing =
                    false;
                console.error('Reject professional failed:', error);
                this.errorMessage =
                    error.error?.message ||
                        'Unable to reject professional account.';
            }
        });
    }
    /* =======================================================
       REFRESH
    ======================================================= */
    refreshCurrentFilter() {
        const filter = this.currentFilter;
        this.adminService
            .getProfessionals(filter === 'ALL'
            ? undefined
            : filter)
            .subscribe({
            next: response => {
                this.professionals =
                    response.professionals;
                this.pendingCount =
                    response.summary.pending;
                this.approvedCount =
                    response.summary.approved;
                this.rejectedCount =
                    response.summary.rejected;
                this.loading =
                    false;
            },
            error: error => {
                console.error('Unable to refresh admin dashboard:', error);
            }
        });
    }
    /* =======================================================
       LABELS
    ======================================================= */
    getRoleLabel(role) {
        switch (role) {
            case 'DIAGNOSTIC_EXPERT':
                return 'Automotive Diagnostic Expert';
            case 'COMPLIANCE_ADVISOR':
                return 'Insurance & Compliance Advisor';
            case 'ROADSIDE_RESPONDER':
                return 'Roadside Assistance Responder';
            default:
                return role;
        }
    }
    getStatusLabel(status) {
        switch (status) {
            case 'APPROVED':
                return 'Approved';
            case 'REJECTED':
                return 'Rejected';
            default:
                return 'Pending Review';
        }
    }
    getStatusClass(status) {
        switch (status) {
            case 'APPROVED':
                return 'status-approved';
            case 'REJECTED':
                return 'status-rejected';
            default:
                return 'status-pending';
        }
    }
    /* =======================================================
       DATE
    ======================================================= */
    formatDate(value) {
        if (!value) {
            return 'Not available';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return 'Not available';
        }
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    /* =======================================================
       FIRST NAME
    ======================================================= */
    extractFirstName(fullName) {
        const cleanName = fullName.trim();
        if (!cleanName) {
            return 'Admin';
        }
        return (cleanName
            .split(/\s+/)[0] ??
            'Admin');
    }
    /* =======================================================
       MOBILE SIDEBAR
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
       TAB WORKSPACE SWITCHER
       ======================================================= */
    switchTab(tab) {
        this.currentTab = tab;
        this.closeDetails();
        this.mobileSidebarOpen = false;
        if (tab === 'VERIFICATIONS') {
            this.loadProfessionals('PENDING');
        }
        else if (tab === 'USER_MANAGEMENT') {
            this.loadUsers();
        }
        else if (tab === 'SYSTEM_REPORTS') {
            this.loadReports();
        }
    }
    /* =======================================================
       USER MANAGEMENT METHODS
       ======================================================= */
    loadUsers(role) {
        this.loadingUsers = true;
        this.errorMessage = '';
        this.successMessage = '';
        if (role) {
            this.userFilter = role;
        }
        const roleArg = this.userFilter === 'ALL' ? undefined : this.userFilter;
        this.adminService.getUsers(roleArg).subscribe({
            next: (res) => {
                this.users = res.users || [];
                this.loadingUsers = false;
            },
            error: (err) => {
                console.error('Error loading users:', err);
                this.errorMessage = err.error?.message || 'Unable to fetch users.';
                this.loadingUsers = false;
            }
        });
    }
    toggleUserStatus(user) {
        const newStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        if (!confirm(`Are you sure you want to change this user's account status to ${newStatus.toLowerCase()}?`)) {
            return;
        }
        this.updatingUserStatus = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.adminService.updateUserStatus(user.id, newStatus).subscribe({
            next: (res) => {
                this.updatingUserStatus = false;
                this.successMessage = res.message || 'User status updated successfully!';
                this.loadUsers();
            },
            error: (err) => {
                console.error('Error updating user status:', err);
                this.errorMessage = err.error?.message || 'Unable to update status.';
                this.updatingUserStatus = false;
            }
        });
    }
    /* =======================================================
       SYSTEM REPORTS METHODS
       ======================================================= */
    loadReports() {
        this.loadingReports = true;
        this.errorMessage = '';
        this.adminService.getSystemReports().subscribe({
            next: (res) => {
                this.reports = res.summary;
                this.loadingReports = false;
            },
            error: (err) => {
                console.error('Error fetching reports:', err);
                this.errorMessage = err.error?.message || 'Unable to fetch reports.';
                this.loadingReports = false;
            }
        });
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
AdminDashboard = __decorate([
    Component({
        selector: 'app-admin-dashboard',
        standalone: true,
        imports: [
            FormsModule,
            RouterLink,
            CommonModule
        ],
        templateUrl: './admin-dashboard.html',
        styleUrl: './admin-dashboard.css'
    })
], AdminDashboard);
export { AdminDashboard };
