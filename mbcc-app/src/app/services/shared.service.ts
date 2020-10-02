import { Injectable } from '@angular/core';

@Injectable()
export class SharingService {
  private data: any = undefined;
  private connectionId: any = undefined;

  constructor() {}

  setConnectionId(connectionId: string) {
    this.connectionId = connectionId;
  }

  getConnectionId() {
    return this.connectionId;
  }
  setData(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}
