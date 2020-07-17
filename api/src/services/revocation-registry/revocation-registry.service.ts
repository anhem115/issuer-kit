// Initializes the `revocation-registry` service on path `/revocation-registry`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { RevocationRegistry } from './revocation-registry.class';
import hooks from './revocation-registry.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'revocation-registry': RevocationRegistry & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/revocation-registry', new RevocationRegistry(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('revocation-registry');

  service.hooks(hooks);
}
