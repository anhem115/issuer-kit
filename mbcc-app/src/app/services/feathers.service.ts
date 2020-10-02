import { Injectable } from '@angular/core';

import * as feathersRx from 'feathers-reactive';
import * as io from 'socket.io-client';

import feathers from '@feathersjs/feathers';
import feathersSocketIOClient from '@feathersjs/socketio-client';

/**
 * Simple wrapper for feathers
 */
@Injectable({
  providedIn: 'root'
})
export class Feathers {
  private _feathers = feathers();                     // init socket.io
  private _socket = io('http://localhost:5000');      // init feathers

  constructor() {
    this._feathers
      .configure(feathersSocketIOClient(this._socket))  // add socket.io plugin
      .configure(feathersRx({                           // add feathers-reactive plugin
        idField: '_id'
      }))
  }

  // // expose services
  public service(name: string) {
    return this._feathers.service(name);
  }
}