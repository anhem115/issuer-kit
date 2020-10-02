import { Component, OnInit } from '@angular/core';
import { SharingService } from '../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sent-benefit',
  templateUrl: './sent-benefit.component.html',
  styleUrls: ['./sent-benefit.component.sass']
})
export class SentBenefitComponent implements OnInit {
  private current_user: any;
  public first_name: string;


  constructor(private sharingService: SharingService, private _route: Router) {
    this.current_user = this.sharingService.getData();

    console.log(this.current_user);
    

    if (this.current_user != undefined && this.current_user != null) {
      this.first_name = this.current_user.first_name;
    } else {
      this._route.navigate(['/']);
    }

  }

  ngOnInit(): void {
  }

}
