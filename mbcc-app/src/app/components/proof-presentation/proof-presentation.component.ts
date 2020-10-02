import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { APIService } from 'src/app/services/api.service';
import { SharingService } from 'src/app/services/shared.service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';

interface ProofData {
  _id: number;
  connection_id: string;
  state: string;
  verified: boolean;
}

@Component({
  selector: 'app-proof-presentation',
  templateUrl: './proof-presentation.component.html',
  styleUrls: ['./proof-presentation.component.sass'],
})
export class ProofPresentationComponent implements OnInit {
  @Input() connection_id: string;

  public proof$: Observable<any>;

  public proof_verified: boolean = false;

  constructor(
    private apiService: APIService,
    private sharingService: SharingService,
    private dataService: DataService,
    private _route: Router
  ) {}

  ngOnInit(): void {
    console.log(`Current connection id: ${this.connection_id}`);
    this.sharingService.setConnectionId(this.connection_id);
    console.log(`Inside the constructor: ${this.connection_id}`);
    this.proof$ = this.dataService.proof$().pipe(
      map((m: Array<ProofData>) =>
        m.filter(
          (x: ProofData) =>
            x.connection_id == this.connection_id && x.state == 'verified'
        )
      ),
      tap((m) => {
        console.log(`a: ${JSON.stringify(m)}`);
      })
    );
    this.apiService
      .createProofRequest(this.connection_id)
      .toPromise()
      .then((data) => {});
  }

  navigateToPage(proofObject: any) {
    this.sharingService.setData(proofObject);
    console.log(`proofObject: ${JSON.stringify(proofObject)}`);
    setTimeout(() => this._route.navigate(['/form']), 2500);
  }
}
