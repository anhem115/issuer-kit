import { Component, OnInit } from '@angular/core';
import { Animations } from '../animations/animations';
import { Router } from '@angular/router';
import { SharingService } from '../services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  animations: [
    Animations.fadeQR,
    Animations.fadeBtns
  ]
})
export class HomeComponent implements OnInit {
  [x: string]: any;
  public title: string;
  public subtitle: string;
  public qrlogin: boolean = false;

  constructor(
    private sharingService: SharingService,
    private _router: Router
  ) {
    this.title = "CENTRAL CITIZEN";
    this.subtitle = "DIGITAL IDENTITY MANAGER";
  }

  ngOnInit(): void {
    document.getElementsByTagName('html')[0].classList.add('mb-overflow');
  }

  showHideQR() {
    this.qrlogin = !this.qrlogin;
  }

  redirectEmptyModel() {
    sessionStorage.clear();
    this._router.navigate(['form']);
  }
}

