import { handleRequest } from './handler';

addEventListener('fetch', async (event) => {
  event.respondWith(handleRequest(event.request));
});
