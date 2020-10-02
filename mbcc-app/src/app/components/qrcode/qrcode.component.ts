import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { map, tap, takeUntil } from 'rxjs/operators';

import { SharingService } from 'src/app/services/shared.service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

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
  public newConnection: boolean = false;
  public connectionDone: boolean = false;
  test$: Observable<any>;
  proof$: Observable<any>;
  public proof_verified: boolean = false;

  public connection_id: string;

  constructor(
    private apiService: APIService,
    private dataService: DataService,
    private sharingService: SharingService,
    private _router: Router
  ) {
    //Create Invitation
  }

  ngOnInit(): void {
    this.apiService.createInvitation().subscribe((data: any) => {
      console.log(JSON.stringify(data));

      this.connection_id = data.connection_id;
      this.sharingService.setConnectionId(this.connection_id);
      this.invitation_url = data.invitation_url;
      this.invitation = JSON.stringify(data.invitation);
      let encodeData = btoa(this.invitation);
      // this.encoded_invitation = btoa(this.invitation);
      let c_iIndex = this.invitation_url.indexOf('c_i=');
      let endpoint = this.invitation_url.substr(0, c_iIndex);
      this.encoded_invitation = `${endpoint}c_i=${encodeData}`;
      this.test$ = this.dataService.empty$().pipe(
        tap((m: any) => console.log(m)),
        map((m: Array<ConnectionTest>) =>
          m.filter((x: ConnectionTest) => x.connection_id == this.connection_id)
        )
      );
    });
  }

  hideClose() {
    document.getElementById('closeqr').style.visibility = 'hidden';
  }
}
