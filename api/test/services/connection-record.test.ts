import assert from 'assert';
import app from '../../src/app';

describe('\'connection-record\' service', () => {
  it('registered the service', () => {
    const service = app.service('connection-record');

    assert.ok(service, 'Registered the service');
  });
});
