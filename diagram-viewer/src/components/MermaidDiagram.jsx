import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';

let initialized = false;
function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default',
    flowchart: { htmlLabels: true, curve: 'basis' },
  });
  initialized = true;
}

export default function MermaidDiagram({ code }) {
  const rawId = useId();
  const safeId = 'm' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    ensureInit();
    let cancelled = false;

    (async () => {
      try {
        const { svg } = await mermaid.render(`${safeId}-svg`, code);
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        const svgEl = containerRef.current.querySelector('svg');
        if (svgEl) {
          svgEl.removeAttribute('width');
          svgEl.removeAttribute('height');
          svgEl.style.maxWidth = '100%';
          svgEl.style.height = 'auto';
          svgEl.style.display = 'block';
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('[mermaid] render error', err);
        setError(err?.message || String(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, safeId]);

  if (error) {
    return (
      <div className="mermaid-error">
        <strong>Failed to render diagram:</strong>
        <pre>{error}</pre>
      </div>
    );
  }

  return <div ref={containerRef} className="mermaid-container" />;
}
