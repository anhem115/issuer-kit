import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from, iif } from 'rxjs';
import {
  catchError,
  switchMap,
  map,
  retry,
  distinctUntilChanged,
  timeout,
  every,
  debounce,
  debounceTime,
  tap,
  delay,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': 'agent-api-key-dev',
    }),
  };

  constructor(private http: HttpClient) {}

  checkStatus(): Observable<any> {
    return this.http.get<any>('/status', this.httpOptions);
  }

  getConnection(connection_id: string): Observable<any> {
    return this.http.get<any>(
      '/connections/' + connection_id,
      this.httpOptions
    );
  }

  reviewConnectionWallet(invitation_id: string): Observable<any> {
    return this.http
      .get<any>(
        '/connections?invitation_key=' + invitation_id,
        this.httpOptions
      )
      .pipe(switchMap((response: any) => of(response)));
  }

  acceptRequest(connection_id: string) {
    return this.http.get<any>(
      '/connections/' + connection_id,
      this.httpOptions
    );
  }

  createInvitation(): Observable<any> {
    return this.http.post<any>(
      '/connections/create-invitation?auto_accept=true',
      null,
      this.httpOptions
    );
  }

  // createInvitation(): Observable<any> {
  //   return this.http.post<any>('/connections/create-invitation', {})
  //     .pipe(
  //       switchMap((response: any) => of(response)),
  //       catchError(this.handleError<any>('createInvitation', null))
  //     );
  // }

  receiveInvitation(invitation: any): Observable<any> {
    return this.http
      .post<any>('/connections/receive-invitation', invitation)
      .pipe(switchMap((response: any) => of(response)));
  }

  // issueCred(): Observable<any> {
  //   let did = this.getConnections();
  //   console.log(did);
  //   return did;

  //   // return this.http.get<any>('/connections/create-invitation?alias=Daniel-Test')
  // }

  sendMessage(connection_id: string): Observable<any> {
    return this.http.post<any>(
      '/connections/' + connection_id + '/send-message',
      {},
      this.httpOptions
    );
  }

  getConnections(): Observable<any> {
    return this.http.get<any>('/connections', this.httpOptions);
  }

  //Get the public DID
  getDid(): Observable<any> {
    return this.http.get<any>('/wallet/did/public', this.httpOptions).pipe(
      map((data) => {
        return data.result.did;
      })
    );
  }

  //Get the public DID
  setCredentialDef(schema_id: string): Observable<any> {
    //Template to request the credential definition.

    console.log('Starting SET CRED_DEF');
    let cred_def = {
      tag: 'default',
      schema_id: schema_id,
      support_revocation: true,
    };

    console.log(JSON.stringify(cred_def));

    return this.http
      .post<any>(
        '/credential-definitions',
        JSON.stringify(cred_def),
        this.httpOptions
      )
      .pipe(
        map((data) => {
          console.log('DID THIS STAERT?');
          console.log(data.credential_definition_id);

          return data.credential_definition_id;
        })
      );
  }

  //Presetnt a proof without any previous proposal or connection
  presentProof(cred_definition: string): Observable<any> {
    let proof = {
      proof_request: {
        version: '1.0',
        requested_predicates: {
          name_field: {
            p_value: 0,
            p_type: '>=',
            name: 'index',
            restrictions: [
              {
                cred_def_id: cred_definition,
              },
            ],
          },
        },
        requested_attributes: {
          name_field: {
            restrictions: [
              {
                cred_def_id: cred_definition,
              },
            ],
            name: 'first_name',
          },
        },
        name: 'Proof request',
      },
      comment: 'Test 01',
      trace: false,
      auto_present: true,
    };

    // console.log(JSON.stringify(proof));

    return this.http
      .post<any>(
        '/present-proof/create-request',
        JSON.stringify(proof),
        this.httpOptions
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  //Get the credential definitions for a specific schema. If there are none, it'll call the setCredentialDef() to create a new one.
  getCredentialDef(schema_id: string): Observable<any> {
    return this.http
      .get<any>(
        '/credential-definitions/created?schema_id=' + schema_id,
        this.httpOptions
      )
      .pipe(
        map((data) => {
          if (data.credential_definition_ids.length > 0) {
            return data.credential_definition_ids;
          } else {
            this.setCredentialDef(schema_id).subscribe();
          }
        })
      );
  }

  //Gett the schema ID from the name of the schema.
  getSchemaId(schema_name: string): Observable<string> {
    // console.log('/schemas/created?schema_name='+schema_name);

    return this.http.get<any>('/schemas/' + schema_name, this.httpOptions).pipe(
      map((data) => {
        return data;
      })
    );
  }
}
