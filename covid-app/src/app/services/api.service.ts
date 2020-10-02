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
export class APIService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': 'agent-api-key-dev',
    }),
  };

  proofRequest = (connection_id) => ({
    connection_id: `${connection_id}`,
    proof_request: {
      name: 'Proof of Manitoba Credential',
      version: '1.0',
      requested_attributes: {
        first_name: {
          name: 'first_name',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },

        last_name: {
          name: 'last_name',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        phone_number: {
          name: 'phone_number',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        home_address: {
          name: 'home_address',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        unit: {
          name: 'unit',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        postal_code: {
          name: 'postal_code',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        city: {
          name: 'city',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        province: {
          name: 'province',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        email: {
          name: 'email',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        date_of_birth: {
          name: 'date_of_birth',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        birth_city: {
          name: 'birth_city',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        birth_country: {
          name: 'birth_country',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        sex: {
          name: 'sex',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        license_number: {
          name: 'license_number',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        dd: {
          name: 'dd',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        class: {
          name: 'class',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        expiration_date: {
          name: 'expiration_date',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        eye_color: {
          name: 'eye_color',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        height: {
          name: 'height',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        sin: {
          name: 'sin',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        health_principal_name: {
          name: 'health_principal_name',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        health_card_number: {
          name: 'health_card_number',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        health_coverage_start_date: {
          name: 'health_coverage_start_date',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        bank_institution_number: {
          name: 'bank_institution_number',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        bank_transit_code: {
          name: 'bank_transit_code',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        bank_account_number: {
          name: 'bank_account_number',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        application_number: {
          name: 'application_number',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
        tier: {
          name: 'tier',
          restrictions: [
            {
              issuer_did: 'PEqa6MvEjAcAcwQc7D3F9g',
            },
          ],
        },
      },
      requested_predicates: {},
      non_revoked: {
        to: Math.ceil(new Date().getTime() / 1000),
      },
    },
    trace: false,
  });


  constructor(private http: HttpClient) { }

  createInvitation(): Observable<any> {
    return this.http.post<any>('/connection', null, this.httpOptions);
  }

  createProofRequest(connection_id: string): Observable<any> {
    const proofRequestData = this.proofRequest(connection_id);
    console.log(`Create proof request: ${JSON.stringify(proofRequestData)}`);
    return this.http.post<any>('/proof', proofRequestData, this.httpOptions);
  }
  /////////////////////////
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

  receiveInvitation(invitation: any): Observable<any> {
    return this.http
      .post<any>('/connections/receive-invitation', invitation)
      .pipe(switchMap((response: any) => of(response)));
  }

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
