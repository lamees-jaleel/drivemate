import { __decorate } from "tslib";
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/toast/toast';
let App = class App {
    title = signal('drivemate-frontend');
};
App = __decorate([
    Component({
        selector: 'app-root',
        imports: [RouterOutlet, Toast],
        templateUrl: './app.html',
        styleUrl: './app.css'
    })
], App);
export { App };
