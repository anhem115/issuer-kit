import assert from 'assert';
import app from '../../src/app';

describe('\'proof\' service', () => {
  it('registered the service', () => {
    const service = app.service('proof');

    assert.ok(service, 'Registered the service');
  });
});
