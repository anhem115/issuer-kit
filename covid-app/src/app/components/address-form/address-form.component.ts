import { Component, OnInit } from '@angular/core';
import { SharingService } from '../../services/shared.service';
import { BenefitUser } from 'src/app/success/success.component';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.sass']
})
export class AddressFormComponent implements OnInit {
  public current_user: BenefitUser

  constructor(private user_info: SharingService) {
    this.current_user = this.user_info.getData();
  }

  ngOnInit(): void {

  }

}
