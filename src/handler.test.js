import handler from './index';
import { describe, test, jest } from '@jest/globals';
import makeServiceWorkerEnv from 'service-worker-mock';

describe('handle', () => {
  test('handle GET', async () => {
    Object.assign(
      global,
      makeServiceWorkerEnv(),
    );
    const request = {
      headers: {
        get: jest.fn(),
      },
      url: 'http://localhost:8080'
    };
    await handler.fetch(request, {}, {});
  });
});
