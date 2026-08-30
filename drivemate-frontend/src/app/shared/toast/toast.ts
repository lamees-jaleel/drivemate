import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (toastService.toastSignal()) {
      <div class="toast-container">
        <div class="toast-message" [class]="toastService.toastSignal()?.type">
          {{ toastService.toastSignal()?.message }}
        </div>
      </div>
    }
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    .toast-message {
      padding: 14px 28px;
      border-radius: 12px;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 16px 32px rgba(0,0,0,0.4);
      background: #111217;
      border: 1px solid #292a31;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .toast-message.success {
      border-color: rgba(85, 219, 146, 0.3);
      color: #55db92;
    }
    
    .toast-message.error {
      border-color: rgba(245, 53, 67, 0.3);
      color: #f53543;
    }
    
    @keyframes slideUp {
      from { transform: translate(-50%, 20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
  `]
})
export class Toast {
  toastService = inject(ToastService);
}
