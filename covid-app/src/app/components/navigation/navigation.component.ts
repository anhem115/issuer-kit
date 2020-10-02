import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.sass']
})
export class NavigationComponent implements OnInit {
  public app_name: string;
  constructor() { 
    this.app_name = 'Covid-19 Relief'
  }

  ngOnInit(): void {
  }

}
