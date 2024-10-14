import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.page.html',
  styleUrls: ['./notfound.page.scss'],
})
export class NotFoundPage {

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/tabs/home']);
  }
}
