import { Component, OnInit } from '@angular/core';
import { SharingService } from '../services/shared.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.sass'],
})
export class SuccessComponent implements OnInit {
  public tier: string;
  private credential: any;
  constructor(private sharingService: SharingService) {
    this.credential = this.sharingService.getData();
    this.tier = this.credential.tier;

    this.sharingService.setData = null;
  }

  ngOnInit(): void {}
}
