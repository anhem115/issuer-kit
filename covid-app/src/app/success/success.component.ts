import { Component, OnInit } from '@angular/core';
import { SharingService } from '../services/shared.service';
import { Router } from '@angular/router';

export interface BenefitUser {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  unit: string;
  postal_code: string;
  city: string;
  province: string;
  tier: string;
  bank_account_number: string;
  bank_transit_code: string;
  bank_institution_number: string;
}

export interface SuccessUser {
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.sass'],
})
export class SuccessComponent implements OnInit {
  // public first_name: string;
  // public middle_name: string;
  // public last_name: string;
  // public email: string;
  // public address: string;
  // public unit: string;
  // public postal_code: string;
  // public city: string;
  // public province: string;
  public proofObject: any;

  public current_user: BenefitUser;
  public success_user: SuccessUser;
  public bank: string;
  public bank_alt: string;

  constructor(private sharingService: SharingService, private _route: Router) {
    this.proofObject = this.sharingService.getData();

    //NEED TO ADD FUNCTION TO REDIRECT TO HOME IF THIS PROOFOBJECT IS EMPTY.
    if (this.proofObject != undefined && this.proofObject != null) {
      const attrs = this.proofObject.presentation.requested_proof.revealed_attrs;

      this.current_user = {
        first_name: attrs['first_name'].raw,
        last_name: attrs['last_name'].raw,
        email: attrs['email'].raw,
        address: attrs['home_address'].raw,
        unit: attrs['unit'].raw,
        city: attrs['city'].raw,
        province: attrs['province'].raw,
        postal_code: attrs['postal_code'].raw,
        tier: attrs['tier'].raw,
        bank_account_number: attrs['bank_account_number'].raw,
        bank_institution_number: attrs['bank_institution_number'].raw,
        bank_transit_code: attrs['bank_transit_code'].raw,
      };

      switch (this.current_user.bank_institution_number) {
        case '001':
          this.bank = '/assets/images/banks/bmo.png';
          this.bank_alt = 'Bank of manitoba logo';
          break;
        case '002':
          this.bank = '/assets/images/banks/scotiabank.png'
          this.bank_alt = 'Bank of Nova Scotia logo';
          break;
        case '003':
          this.bank = '/assets/images/banks/royal_bank.png'
          this.bank_alt = 'Royal Bank of Canada logo';
          break;
        case '006':
          this.bank = '/assets/images/banks/national_bank.png'
          this.bank_alt = 'National Bank of Canada logo';
          break;
        case '016':
          this.bank = '/assets/images/banks/hsbc.png'
          this.bank_alt = 'HSBC logo';
          break;

        default:
          break;
      }


      this.success_user = {
        first_name: this.current_user.first_name,
        last_name: this.current_user.last_name,
      }
      this.sharingService.setData(this.success_user);

      //TESTS
      // this.current_user = {
      //   first_name: 'Sheldon',
      //   last_name: 'Funk',
      //   email: 'sheldon.funk@gov.mb.ca',
      //   address: '215 Garry Street',
      //   unit: '1100',
      //   city: 'Winnipeg',
      //   province: 'MB',
      //   postal_code: 'R3C 1B4',
      // }
    } else {
      this._route.navigate(['/']);
    }
  }

  ngOnInit(): void { }

  editAddress() {
    // this.sharingService.setData(this.current_user)
  }
}
