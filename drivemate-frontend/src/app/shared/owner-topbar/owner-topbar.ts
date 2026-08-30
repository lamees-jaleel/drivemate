import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-owner-topbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './owner-topbar.html',
  styleUrl: './owner-topbar.css'
})
export class OwnerTopbar {}
