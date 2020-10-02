import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { APIService } from '../services/api.service';
import { SharingService } from '../services/shared.service';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-issue-credential',
  templateUrl: './issue-credential.component.html',
  styleUrls: ['./issue-credential.component.sass'],
})
export class IssueCredentialComponent implements OnInit {
  connectionId: string;
  credentialData: any;
  credential$: Observable<any>;
  tierLevel: number;
  update_parent:boolean = true;

  @Output() onIssuing: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private sharingService: SharingService,
    private dataService: DataService,
    private apiService: APIService,
    private _router: Router
  ) {
    this.credentialData = this.sharingService.getData();
    this.connectionId = this.sharingService.getConnectionId();


    this.credential$ = this.dataService.user$().pipe(
      tap((m) => {
        console.log(m);
      }),
      map((m: Array<any>) => {
        console.log(`Current connection id: ${this.connectionId}`);
        //console.log(`Current m: ${JSON.stringify(m)}`);
        return m.filter((x: any) => x.connection_id == this.connectionId);
      })
    );
  }

  ngOnInit(): void {
    this.onIssuing.emit(this.update_parent);
    
    console.log(
      `Current credential Datal: ${JSON.stringify(this.credentialData)}`
    );
    this.tierLevel = this.credentialData.tier;
    this.apiService
      .createCredential(this.connectionId, this.credentialData)
      .toPromise()
      .then((data) => {
        console.log(`Front end data: ${JSON.stringify(data)}`);
      });
  }

  redirectSuccess(){
    setTimeout(() => this._router.navigate(['success']), 2500);
  }
}
