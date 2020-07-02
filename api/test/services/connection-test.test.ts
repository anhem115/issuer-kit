import assert from 'assert';
import app from '../../src/app';

describe('\'connection-test\' service', () => {
  it('registered the service', () => {
    const service = app.service('connection-test');

    assert.ok(service, 'Registered the service');
  });
});
