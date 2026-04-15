import { Component, AfterViewInit } from '@angular/core';
import { Auth } from './services/auth';

declare const google: any;

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div id="google-btn"></div>`
})
export class AppComponent implements AfterViewInit {
  constructor(private readonly authService: Auth) { }
  ngAfterViewInit() {
    google.accounts.id.initialize({
      client_id: "871787423840-dbr7qhmkre6hkd2785djudo8tec1k89b.apps.googleusercontent.com",
      callback: async (response: any) => {
        console.log('response:', response);
        console.log('ID TOKEN:', response.credential);
        await this.authService.googleLogin(response.credential)
        // send token to backend
      }
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large' }
    );
  }
}
