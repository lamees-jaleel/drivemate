import { provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
export const appConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({
            eventCoalescing: true
        }),
        provideRouter(routes, withInMemoryScrolling({
            scrollPositionRestoration: 'top'
        })),
        provideHttpClient()
    ]
};
