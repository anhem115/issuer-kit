import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-accpted-connection',
  templateUrl: './accpted-connection.component.html',
  styleUrls: ['./accpted-connection.component.sass'],
})
export class AccptedConnectionComponent implements OnInit {
  apiService: APIService;
  constructor(public test$: Observable<any>) {
    // this.test$ = this.dataService.empty$().pipe(
    //   map((m: Array<ConnectionTest>) =>
    //     m.filter(
    //       (x: ConnectionTest) =>
    //         x.connection_id == this.connection_id && x.state == 'response'
    //     )
    //   ),
    //   tap((m) => console.log(m))
    // );
  }

  ngOnInit(): void {
    this.apiService.createProofRequest('123').subscribe((data: any) => {
      // this.connection_id = data.connection_id;
      // this.invitation = JSON.stringify(data.invitation);
      // this.encoded_invitation = btoa(this.invitation);
      // console.log(`logggggggg: ${this.connection_id}`);
    }); //Create Invitation
  }
}
