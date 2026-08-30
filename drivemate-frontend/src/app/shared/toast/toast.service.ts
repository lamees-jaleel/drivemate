import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type?: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toastSignal = signal<ToastMessage | null>(null);
  private timeoutId: any;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastSignal.set({ message, type });
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.toastSignal.set(null);
    }, 4000);
  }
}
