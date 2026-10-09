import hljs from 'highlight.js/lib/common';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function CodeView({ content, language }: { content: string; language: string }) {
  let html: string;
  if (language !== 'plaintext' && hljs.getLanguage(language)) {
    html = hljs.highlight(content, { language, ignoreIllegals: true }).value;
  } else {
    html = esc(content);
  }
  const count = content.split('\n').length;
  const nums = Array.from({ length: count }, (_, i) => i + 1).join('\n');
  return (
    <div className="code">
      <pre className="gutter" aria-hidden="true">
        {nums}
      </pre>
      <pre className="src">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
