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
    return new Response('invalid limit query param', { status: 400 });
  }

  const expirationTtl = await LISBETH_HAMLIN.get<number>('expirationTtl', 'json');
  if (!expirationTtl) {
    console.error('invalid expirationTtl');
    return new Response(null, { status: 500 });
  }

  const cachedRandomItems = await LISBETH_HAMLIN.get<number[]>(
    'randomItems',
    'json',
  );
  if (limit === cachedRandomItems?.length) {
    return buildResponse({ items: cachedRandomItems });
  }

  const array = shuffle([...Array(limit).keys()]);

  await LISBETH_HAMLIN.put('randomItems', JSON.stringify(array), {
    expirationTtl,
  });

  return buildResponse({ items: array });
}
