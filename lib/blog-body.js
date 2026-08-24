export function splitBody(html, fraction = 0.3) {
  const body = String(html || '');
  const target = body.length * fraction;
  const blocks = /^(p|h[1-6]|ul|ol|li|blockquote|figure|figcaption|table|thead|tbody|tr|td|th|div|section|pre)$/;
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*?(\/?)>/g;
  let depth = 0;
  let match;
  while ((match = tagRe.exec(body))) {
    const [, closing, name, selfClosing] = match;
    if (selfClosing || !blocks.test(name.toLowerCase())) continue;
    depth += closing ? -1 : 1;
    if (closing && depth <= 0 && tagRe.lastIndex >= target) {
      const rest = body.slice(tagRe.lastIndex);
      if (!rest.trim()) break;
      return [body.slice(0, tagRe.lastIndex), rest];
    }
  }
  return [body, ''];
}
