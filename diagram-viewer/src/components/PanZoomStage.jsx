import { useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';

function ResetHook({ onReady }) {
  const { resetTransform } = useControls();
  useEffect(() => {
    if (onReady) onReady(resetTransform);
  }, [onReady, resetTransform]);
  return null;
}

export default function PanZoomStage({ children, onReady }) {
  const [panning, setPanning] = useState(false);

  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.2}
      maxScale={8}
      limitToBounds={false}
      centerOnInit={true}
      wheel={{ step: 0.15, activationKeys: ['Control'] }}
      panning={{ velocityDisabled: true }}
      doubleClick={{ mode: 'reset' }}
      onPanningStart={() => setPanning(true)}
      onPanningStop={() => setPanning(false)}
    >
      <ResetHook onReady={onReady} />
      <TransformComponent
        wrapperStyle={{
          width: '100%',
          height: '100%',
          cursor: panning ? 'grabbing' : 'grab',
        }}
        contentStyle={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </TransformComponent>
    </TransformWrapper>
  );
}
