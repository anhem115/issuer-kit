import { Component, OnInit, Input } from '@angular/core';



@Component({
  selector: 'app-tier-level',
  templateUrl: './tier-level.component.html',
  styleUrls: ['./tier-level.component.sass']
})
export class TierLevelComponent implements OnInit {
  @Input() tier: number;

  public tierLevel: number;

  public tier_one_fields: Array<any> = [
    'First name',
    'Middle name',
    'Family name',
    'Other names',
    'Phone number',
    'Email',
    'Home address',
    'Suit/Apt/Unit number',
    'City',
    'Province',
    'Postal code',
  ]
  public tier_two_fields: Array<any> = [
    'Birthday',
    'Birth city',
    'Birth country',
    'Sex',
    'Driver license',
    'DD',
    'Class',
    'Heigh',
    'Eye color',
  ]
  public tier_three_fields: Array<any> = [
    'SIN - Social Insurance Number',
    'Manitoba Health number',
    'Manitoba Health name',
    'Manitoba Health data',
    'Bank institution number',
    'Bank transit number',
    'Bank account number',
  ]

  constructor() {
    
  }
  
  ngOnInit(): void {
    this.tierLevel = this.tier;    
  }

}
