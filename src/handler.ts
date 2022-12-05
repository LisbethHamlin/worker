import type { EnvVars } from './bindings';

const PRESHARED_AUTH_HEADER_KEY = 'X-Custom-PSK';

const buildJsonResponse = (data: number[] | ReadableStream | string) => {
  if (Array.isArray(data)) {
    data = JSON.stringify(data);
  }
  return new Response(data, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
};

const exportHandler: ExportedHandler<EnvVars> = {
  async fetch(request, env) {
    const psk = request.headers.get(PRESHARED_AUTH_HEADER_KEY);

    if (env.PSK !== psk) {
      return new Response(null, {
        status: 403,
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit'));

    if (!limit || limit > 500) {
      return new Response('invalid limit query param', { status: 400 });
    }
    const storeKey = `randomItems-${limit}`;
    const cachedRandomItems = await env.LISBETH_HAMLIN.get(
      storeKey,
      'stream',
    );
    if (cachedRandomItems) {
      return buildJsonResponse(cachedRandomItems);
    }

    const expirationTtl = await env.LISBETH_HAMLIN.get<number>('expirationTtl', 'json');
    if (!expirationTtl) {
      console.error('invalid expirationTtl');
      return new Response(null, { status: 500 });
    }

    const { default: shuffle } = await import('lodash-es/shuffle');

    const array = shuffle([...Array(limit).keys()]);

    await env.LISBETH_HAMLIN.put(storeKey, JSON.stringify(array), {
      expirationTtl,
    });

    return buildJsonResponse(array);
  }
};

export default exportHandler;
