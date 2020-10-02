import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { Paginated } from '@feathersjs/feathers';
import { toArray, filter, flatMap } from 'rxjs/operators';
import { AgentService } from 'src/app/services/agent.service';
import { map, repeat, retry, timeout, every, delay, tap } from 'rxjs/operators';
import { iif, Observable, of } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { SharingService } from 'src/app/services/shared.service';

interface ConnectionTest {
  _id: number;
  connection_id: string;
  state: string;
}

@Component({
  selector: 'app-credential',
  templateUrl: './credential.component.html',
  styleUrls: ['./credential.component.sass'],
})
export class CredentialComponent implements OnInit {
  public invitation: string;
  public encoded_invitation: string;
  public state: string;
  private connection_id: string;

  test$: Observable<any>;
  dataTest: Array<any>;

  constructor(
    private apiService: APIService,
    private dataService: DataService,
    private sharingService: SharingService,
    private _router: Router
  ) {
    this.test$ = this.dataService.empty$().pipe(
      map((m: Array<ConnectionTest>) =>
        m.filter(
          (x: ConnectionTest) =>
            x.connection_id == this.connection_id && x.state == 'response'
        )
      ),
      tap((m) => console.log(m))
    );
    // this.connection_id = 'bf63cc70-7352-4f30-9ded-9ad5ee83bb6b';
    // .subscribe(
    //   (data) => console.log(data)
    // )
  }

  ngOnInit(): void {}

  // checkData(connection_id: string) {
  //   this.dataService.response$(connection_id)
  //     .pipe(
  //       map((data) => console.log(data))
  //     ).subscribe(
  //       map((data: any) => this.test$)
  //     )
  // }

  navigateToFirst() {
    this.sharingService.setData(this.connection_id);
    this._router.navigate(['connected']);

    // console.log(`Current connection id: ${this.connection_id}`);
    // this.apiService
    //   .createProofRequest(this.connection_id)
    //   .toPromise()
    //   .then((data) => {
    //     console.log(`Front end data: ${JSON.stringify(data)}`);
    //   });
  }
  issueCredential() {}
  onCreateInvitation() {
    this.apiService.createInvitation().subscribe((data: any) => {
      this.connection_id = data.connection_id;
      this.invitation = JSON.stringify(data.invitation);
      this.encoded_invitation = btoa(this.invitation);
      console.log(`logggggggg: ${this.connection_id}`);
    }); //Create Invitation
  }
}
