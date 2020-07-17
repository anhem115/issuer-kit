import assert from 'assert';
import app from '../../src/app';

describe('\'revocation-registry\' service', () => {
  it('registered the service', () => {
    const service = app.service('revocation-registry');

    assert.ok(service, 'Registered the service');
  });
});
