import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicNavbar } from '../../shared/public-navbar/public-navbar';
import { Footer } from '../../shared/footer/footer';
let Landing = class Landing {
};
Landing = __decorate([
    Component({
        selector: 'app-landing',
        imports: [
            RouterLink,
            PublicNavbar,
            Footer
        ],
        templateUrl: './landing.html',
        styleUrl: './landing.css'
    })
], Landing);
export { Landing };
