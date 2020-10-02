import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { map } from 'rxjs/operators';

import { SharingService } from 'src/app/services/shared.service';
import { schemas } from '../../../schemas/schemas';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

interface ConnectionTest {
  _id: number;
  connection_id: string;
  state: string;
}
@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.sass'],
})
export class QrcodeComponent implements OnInit {
  public proofRequest: any;
  public invitation: string;
  public encoded_invitation: string;
  public invitation_url: string;
  public verifyingProof: boolean;
  test$: Observable<any>;

  private connection_id: string;
  constructor(
    private apiService: APIService,
    private dataService: DataService,
    private sharingService: SharingService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.createInvitation().subscribe((data: any) => {
      console.log(`INvitation info: ${JSON.stringify(data)}`);
      this.connection_id = data.connection_id;

      this.invitation_url = data.invitation_url;

      this.invitation = JSON.stringify(data.invitation);
      let encodeData = btoa(this.invitation);
      let c_iIndex = this.invitation_url.indexOf('c_i=');
      let endpoint = this.invitation_url.substr(0, c_iIndex);
      this.encoded_invitation = `${endpoint}c_i=${encodeData}`;
      // console.log(`New invitation data: ${this.encoded_invitation}`);
      this.test$ = this.dataService
        .empty$()
        .pipe(
          map((m: Array<ConnectionTest>) =>
            m.filter(
              (x: ConnectionTest) =>
                x.connection_id == this.connection_id &&
                (x.state == 'response' || x.state == 'active')
            )
          )
        );
    }); //Create Invitation
  }
  navigateToConnection() {
    this.sharingService.setData(this.connection_id);
    this._router.navigate(['connection']);
  }
}
