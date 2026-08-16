import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicNavbar } from '../../shared/public-navbar/public-navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-landing',
  imports: [
    RouterLink,
    PublicNavbar,
    Footer
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {}