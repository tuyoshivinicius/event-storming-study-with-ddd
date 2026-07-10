import { useCallback, useEffect, useRef, useState } from 'react';
import PanZoomStage from './PanZoomStage.jsx';
import MermaidDiagram from './MermaidDiagram.jsx';

export default function DiagramCard({ title, filename, code }) {
  const [expanded, setExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef(null);
  const resetTransformRef = useRef(null);

  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleFullscreen = useCallback(async () => {
    if (!cardRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await cardRef.current.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement === cardRef.current;
      setIsFullscreen(active);
      if (resetTransformRef.current) {
        setTimeout(() => resetTransformRef.current?.(), 100);
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <section
      ref={cardRef}
      className={`card${isFullscreen ? ' card--fullscreen' : ''}${expanded ? '' : ' card--collapsed'}`}
    >
      <header className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">{title}</h2>
          {filename && <span className="card-filename">{filename}</span>}
        </div>
        <div className="card-actions">
          <button
            type="button"
            className="card-btn"
            onClick={handleToggleExpand}
            title={expanded ? 'Recolher' : 'Expandir'}
          >
            {expanded ? '−' : '+'}
          </button>
          <button
            type="button"
            className="card-btn"
            onClick={handleFullscreen}
            title={isFullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? '⤢' : '⤡'}
          </button>
        </div>
      </header>

      {expanded && (
        <div className={`card-body${isFullscreen ? ' card-body--fullscreen' : ''}`}>
          <PanZoomStage onReady={(reset) => (resetTransformRef.current = reset)}>
            <MermaidDiagram code={code} />
          </PanZoomStage>
        </div>
      )}
    </section>
  );
}
