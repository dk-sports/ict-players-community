// This gate protects every staging page and asset. Missing configuration denies access.
export default async function stagingAuth(request, context) {
  const username = Netlify.env.get('STAGING_USERNAME');
  const password = Netlify.env.get('STAGING_PASSWORD');
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
  if (!username || !password) {
    return new Response('Private preview is locked. The owner must configure staging credentials in Netlify.', { status: 503, headers });
  }
  let supplied = '';
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try { supplied = atob(auth.slice(6)); } catch { /* Invalid credentials are denied. */ }
  }
  if (supplied !== `${username}:${password}`) {
    return new Response('Private ICT design preview. Sign in using the credentials supplied by the owner.', {
      status: 401,
      headers: { ...headers, 'WWW-Authenticate': 'Basic realm="ICT private design preview", charset="UTF-8"' }
    });
  }
  const response = await context.next();
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
}
