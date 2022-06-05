import { EnvVars } from './bindings';

const PRESHARED_AUTH_HEADER_KEY = 'X-Custom-PSK';

const buildResponse = (data: any) => {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
};


const exportHandler: ExportedHandler<EnvVars> = {
  async fetch(request, env) {
    const psk = request.headers.get(PRESHARED_AUTH_HEADER_KEY);

    if (env.PSK !== psk) {
      return new Response('invalid key.', {
        status: 403,
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '0');

    if (!limit || limit > 500) {
      return new Response('invalid limit query param', { status: 400 });
    }

    const cachedRandomItems = await env.LISBETH_HAMLIN.get<number[]>(
      'randomItems',
      'json',
    );
    if (limit === cachedRandomItems?.length) {
      return buildResponse({ items: cachedRandomItems });
    }

    const expirationTtl = await env.LISBETH_HAMLIN.get<number>('expirationTtl', 'json');
    if (!expirationTtl) {
      console.error('invalid expirationTtl');
      return new Response(null, { status: 500 });
    }

    const { default: shuffle } = await import('lodash-es/shuffle');

    const array = shuffle([...Array(limit).keys()]);

    await env.LISBETH_HAMLIN.put('randomItems', JSON.stringify(array), {
      expirationTtl,
    });

    return buildResponse({ items: array });
  }
};

export default exportHandler;
