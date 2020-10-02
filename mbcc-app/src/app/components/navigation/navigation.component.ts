import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharingService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.sass']
})
export class NavigationComponent implements OnInit {
  public first_name: string;
  private model: any;
  constructor(private _router: Router, private login_model: SharingService) {

  }

  ngOnInit(): void {
    // this.model = this.login_model.getData();
    // this.first_name = this.model.first_name;
  }

}
