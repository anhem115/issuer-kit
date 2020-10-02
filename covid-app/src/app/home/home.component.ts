import { Component, OnInit } from '@angular/core';
import { fader } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  animations: [fader]
})
export class HomeComponent implements OnInit {
  public image_alt: string;
  public main_title: string;

  constructor() {
    this.main_title = 'Apply now for the COVID19 relief benefit'
    this.image_alt = "Apply to the covid 19 relief benefit.";
  }

  ngOnInit(): void {
  }

}
