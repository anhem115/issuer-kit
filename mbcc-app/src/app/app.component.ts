import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Animations } from './animations/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  animations: [
    Animations.fader
  ]

})


export class AppComponent {
  title = 'Manitoba Central Citizen';
  // public route: string;
  constructor(public router: Router) {
    // log
  }

  //Control to hide components from certain pages.
  hasRoute(route: string) {
    return this.router.url.includes(route);
  }

  //Scroll to top.
  onActivate(event) {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 20); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
