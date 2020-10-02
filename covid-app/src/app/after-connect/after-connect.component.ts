import { Component, OnInit } from '@angular/core';
import { APIService } from '../services/api.service';
import { SharingService } from '../services/shared.service';
import { Observable } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

interface ProofData {
  _id: number;
  connection_id: string;
  state: string;
  verified: boolean;
}

@Component({
  selector: 'app-after-connect',
  templateUrl: './after-connect.component.html',
  styleUrls: ['./after-connect.component.sass'],
})
export class AfterConnectComponent implements OnInit {
  public connection_id: string;
  proof$: Observable<any>;

  public proof_verified: boolean = false;

  constructor(
    private apiService: APIService,
    private sharingService: SharingService,
    private dataService: DataService,
    private _route: Router
  ) {
    this.connection_id = sharingService.getData();
    this.proof$ = this.dataService.proof$().pipe(
      map((m: Array<ProofData>) =>
        m.filter(
          (x: ProofData) =>
            x.connection_id == this.connection_id && x.state == 'verified'
        ),
        tap((m) => {
          console.log(m);
          this.proof_verified = true;
        }
        )
      )
    )
  }

  ngOnInit(): void {
    console.log(`Current connection id: ${this.connection_id}`);
    this.apiService
      .createProofRequest(this.connection_id)
      .toPromise()
      .then((data) => {
        console.log(`Front end data: ${JSON.stringify(data)}`);
      });
  }
  navigateToPage(proofObject: any) {
    this.sharingService.setData(proofObject);
    setTimeout(() =>
      this._route.navigate(['/success']), 2500
    );
  }
}
