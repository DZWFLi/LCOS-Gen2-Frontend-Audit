// LCOS Spatial Navigator is presentation only. Every action and state below
// is produced by the current Huabu Canvas / React Flow context.
import {
  Grid3X3,
  Lock,
  Map,
  Maximize2,
  Minus,
  Plus,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';

import { useLcosShellStore } from '../shell/lcosShellStore';
import { LcosSpatialNavigatorView } from '../ui/families/LcosSpatialNavigatorView';

import type { CanvasSpatialNavigatorControls } from '@/lcos-seam/types';

export function LcosSpatialNavigator(
  controls: CanvasSpatialNavigatorControls,
): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const requestCamera = useLcosShellStore((state) => state.requestCamera);

  return (
    <LcosSpatialNavigatorView
      zoom={controls.zoom}
      minimapEnabled={controls.minimapEnabled}
      gridEnabled={controls.gridEnabled}
      interactivityLocked={controls.interactivityLocked}
      miniMap={controls.miniMap}
      expanded={expanded}
      onToggleExpanded={() => setExpanded((value) => !value)}
      onZoomOut={() => requestCamera('zoom-out')}
      onResetZoom={() => requestCamera('reset')}
      onZoomIn={() => requestCamera('zoom-in')}
      onFit={() => requestCamera('fit')}
      onToggleInteractivity={controls.toggleInteractivity}
      onToggleMinimap={controls.toggleMinimap}
      onToggleGrid={controls.toggleGrid}
      zoomOutIcon={<Minus aria-hidden size={17} />}
      zoomInIcon={<Plus aria-hidden size={17} />}
      fitIcon={<Maximize2 aria-hidden size={17} />}
      lockIcon={controls.interactivityLocked
        ? <Lock aria-hidden size={17} />
        : <Unlock aria-hidden size={17} />}
      minimapIcon={<Map aria-hidden size={17} />}
      gridIcon={<Grid3X3 aria-hidden size={17} />}
    />
  );
}
