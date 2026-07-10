import { useEffect, useState } from 'react';
import DiagramCard from './components/DiagramCard.jsx';

export default function App() {
  const [diagrams, setDiagrams] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/diagram-viewer/api/diagrams')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDiagrams(data);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Diagram Viewer</h1>
        <p className="app-subtitle">
          Mermaid diagrams from <code>docs/</code>
          {status === 'ready' && ` — ${diagrams.length} loaded`}
        </p>
      </header>

      <main className="app-main">
        {status === 'loading' && <p className="hint">Loading diagrams…</p>}
        {status === 'error' && (
          <p className="hint error">Failed to load diagrams: {error}</p>
        )}
        {status === 'ready' && diagrams.length === 0 && (
          <p className="hint">No mermaid diagrams found in <code>docs/</code>.</p>
        )}
        {status === 'ready' &&
          diagrams.map((d) => (
            <DiagramCard key={d.id} title={d.title} filename={d.filename} code={d.code} />
          ))}
      </main>

      <footer className="app-footer">
        <span className="hint">
          Tip: hold <kbd>Ctrl</kbd> + scroll to zoom · drag to pan · click fullscreen to focus
        </span>
      </footer>
    </div>
  );
}
