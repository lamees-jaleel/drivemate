import { __decorate } from "tslib";
import { Injectable, signal } from '@angular/core';
let ToastService = class ToastService {
    toastSignal = signal(null);
    timeoutId;
    show(message, type = 'info') {
        this.toastSignal.set({ message, type });
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            this.toastSignal.set(null);
        }, 4000);
    }
};
ToastService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ToastService);
export { ToastService };
