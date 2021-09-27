import shuffle from 'lodash-es/shuffle';

const PRESHARED_AUTH_HEADER_KEY = 'X-Custom-PSK';
const PRESHARED_AUTH_HEADER_VALUE = typeof PSK !== 'undefined' ? PSK : null;

const buildResponse = (data: any) => {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
};

export async function handleRequest(request: Request): Promise<Response> {
  const psk = request.headers.get(PRESHARED_AUTH_HEADER_KEY);

  if (!PRESHARED_AUTH_HEADER_VALUE || PRESHARED_AUTH_HEADER_VALUE !== psk) {
    return new Response('invalid key.', {
      status: 403,
    });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') ?? '0');

  if (!limit || limit > 500) {
    return new Response('invalid limit query param', {
      status: 400,
    });
  }

  const cachedRandomItems = await LISBETH_HAMLIN.get<number[]>(
    'randomItems',
    'json',
  );
  if (cachedRandomItems) {
    if (limit === cachedRandomItems.length) {
      return buildResponse({ items: cachedRandomItems });
    }
  }

  const expirationTtl =
    (await LISBETH_HAMLIN.get('expirationTtl')) ?? 2_628_000;

  const array = shuffle([...Array(limit).keys()]);

  await LISBETH_HAMLIN.put('randomItems', JSON.stringify(array), {
    expirationTtl,
  });

  return buildResponse({ items: array });
}
