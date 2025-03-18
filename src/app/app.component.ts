import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="main-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .main-container {
        min-height: 100vh;
        position: relative;
      }
    `,
  ],
})
export class AppComponent {
  title = 'gym-note-taker';
}
