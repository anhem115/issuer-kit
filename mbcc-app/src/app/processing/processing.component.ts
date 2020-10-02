import { Component, OnInit } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { SharingService } from '../services/shared.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

interface ConnectionTest {
  _id: number;
  connection_id: string;
  state: string;
}

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.sass'],
})
export class ProcessingComponent implements OnInit {
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

  public credential: any;

  public connection_id: string;
  public tierLevel: any;

  public header: boolean;

  constructor(
    private apiService: APIService,
    private dataService: DataService,
    private sharingService: SharingService,
    private _router: Router
  ) {
    //Create Invitation
    this.credential = this.sharingService.getData();
    console.log(this.credential);

    if (this.credential != null && this.credential != undefined) {
      this.tierLevel = this.credential.tier;
    } else {
      this._router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.connection_id = this.sharingService.getConnectionId();
    if (this.connection_id == null) {
      this.header = false;
      this.apiService.createInvitation().subscribe((data: any) => {
        console.log(JSON.stringify(data));
        this.connection_id = data.connection_id;
        this.sharingService.setConnectionId(this.connection_id);
        this.invitation_url = data.invitation_url;
        this.invitation = JSON.stringify(data.invitation);
        console.log(`invitation: ${this.invitation}`);
        this.encoded_invitation = btoa(this.invitation);
        this.test$ = this.dataService
          .empty$()
          .pipe(
            map((m: Array<ConnectionTest>) =>
              m.filter(
                (x: ConnectionTest) => x.connection_id == this.connection_id
              )
            )
          );
      });
    } else {
      this.header = true;
      this.test$ = this.dataService
        .empty$()
        .pipe(
          map((m: Array<ConnectionTest>) =>
            m.filter(
              (x: ConnectionTest) => x.connection_id == this.connection_id
            )
          )
        );
    }
  }

  // ngAfterViewInit(){

  // }
  updateHeader(test: boolean) {
    setTimeout(
      () =>
        function () {
          if (test) {
            this.header = !this.header;
          }
        },
      2500
    );
  }

  navigateToPage() {
    this.sharingService.setConnectionId(this.connection_id);

    setTimeout(() => this._router.navigate(['issue-credential']), 2500);
  }
}
