import { Component, OnInit } from '@angular/core';
import { APIService } from '../services/api.service';
import { SharingService } from '../services/shared.service';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface ProofData {
  _id: number;
  connection_id: string;
  state: string;
  verified: boolean;
}
@Component({
  selector: 'app-proof-request',
  templateUrl: './proof-request.component.html',
  styleUrls: ['./proof-request.component.sass'],
})
export class ProofRequestComponent implements OnInit {
  connection_id: string;
  proof$: Observable<any>;
  proof_verified: boolean;
  constructor(
    private apiService: APIService,
    private sharingService: SharingService,
    private dataService: DataService,
    private _route: Router
  ) {}

  ngOnInit(): void {
    this.connection_id = this.sharingService.getConnectionId();
    this.proof$ = this.dataService.proof$().pipe(
      map(
        (m: Array<ProofData>) =>
          m.filter(
            (x: ProofData) =>
              x.connection_id == this.connection_id && x.state == 'verified'
          ),
        tap((m) => {
          console.log(m);
          this.proof_verified = true;
        })
      )
    );
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
    console.log(`proofObject: ${JSON.stringify(proofObject)}`);
    setTimeout(() => this._route.navigate(['/form']), 2500);
  }
}
