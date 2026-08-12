// Tiny rich-text helper for variant copy: `*text*` renders italic (matching
// the site's serif-italic accent style) and `\n` renders a line break. This
// is the only markup variants may use — everything else is plain text, so
// LLM-generated content can never inject markup or scripts.

export function rich(text) {
  if (typeof text !== 'string' || !text) return text || null;
  const lines = text.split('\n');
  return lines.flatMap((line, lineIndex) => {
    const parts = line.split(/\*([^*]+)\*/g).map((segment, segmentIndex) => {
      if (!segment) return null;
      return segmentIndex % 2
        ? <i key={`i-${lineIndex}-${segmentIndex}`}>{segment}</i>
        : <span key={`t-${lineIndex}-${segmentIndex}`}>{segment}</span>;
    }).filter(Boolean);
    if (lineIndex < lines.length - 1) parts.push(<br key={`br-${lineIndex}`} />);
    return parts;
  });
}
