import { Injectable } from '@angular/core';
import { Feathers } from './feathers.service';
import { map } from 'rxjs/operators';

/**
 *  Abstraction layer for data management
 *  Technically this isn't needed for feathers-chat,
 *  but you will need it for more complex tasks.
 */
@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private feathers: Feathers) {}

  createInvitation() {
    return this.feathers.service('present-proof').watch().find();
  }

  response$(connection_id: string) {
    //   // just returning the observable will query the backend on every subscription
    //   // using some caching mechanism would be wise in more complex applications

    // console.log(this.feathers.service('connection').watch().find());

    return (
      this.feathers // todo: remove 'any' assertion when feathers-reactive typings are up-to-date with buzzard
        // .service('/webhooks/topic/:topic'))
        .service('connection')
        .watch()
        .get(connection_id)
    );
  }
  empty$() {
    //   // just returning the observable will query the backend on every subscription
    //   // using some caching mechanism would be wise in more complex applications

    return (
      this.feathers // todo: remove 'any' assertion when feathers-reactive typings are up-to-date with buzzard
        // .service('/webhooks/topic/:topic'))
        .service('connection-record')
        // .watch({ listStrategy: 'smart' })
        .watch()
        .find()
    );
  }
  proof$() {
    //   // just returning the observable will query the backend on every subscription
    //   // using some caching mechanism would be wise in more complex applications

    return (
      this.feathers // todo: remove 'any' assertion when feathers-reactive typings are up-to-date with buzzard
        // .service('/webhooks/topic/:topic'))
        .service('proof')
        // .watch({ listStrategy: 'smart' })
        .watch()
        .find()
    );
  }

  user$() {
    return this.feathers.service('user').watch().find();
  }
}
