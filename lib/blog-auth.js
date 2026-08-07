export function isBlogAdmin(request) {
  const configured = process.env.BLOG_ADMIN_TOKEN;
  if (!configured) return false;
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  return bearer === configured || request.headers.get('x-blog-admin-token') === configured;
}
