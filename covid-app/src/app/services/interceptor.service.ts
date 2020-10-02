import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  hostname: string;
  port: string;
  apiURL: string;

  constructor() {
    this.apiURL = 'http://localhost:5000';

    console.log('Intercept API http requests from: ' + this.apiURL);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'x-api-key': 'agent-api-key-dev',
      },
      url: this.apiURL + req.url,
    });
    return next.handle(req).pipe(
      tap((response: HttpEvent<any>) => {
        if (response instanceof HttpResponse) {
          console.log(response);
        }
      })
    );
  }
}
