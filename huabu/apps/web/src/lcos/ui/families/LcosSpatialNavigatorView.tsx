// Figma 5386:274 fixes the 52×48 collapsed camera control. The expanded
// composition follows T2 C2-3B and only arranges mechanics supplied by Huabu.
import { GitBranch } from 'lucide-react';

import { FigmaShellGlyph } from '../FigmaShellGlyph';
import { LcosIconButton } from '../primitives/LcosIconButton';

import type { CSSProperties, ReactNode } from 'react';

export interface LcosSpatialNavigatorViewProps {
  readonly style?: CSSProperties;
  readonly expanded: boolean;
  readonly zoom: number;
  readonly minimapEnabled: boolean;
  readonly gridEnabled: boolean;
  readonly edgesVisible: boolean;
  readonly interactivityLocked: boolean;
  readonly miniMap: ReactNode;
  readonly onToggleExpanded: () => void;
  readonly onZoomOut: () => void;
  readonly onResetZoom: () => void;
  readonly onZoomIn: () => void;
  readonly onFit: () => void;
  readonly onToggleInteractivity: () => void;
  readonly onToggleMinimap: () => void;
  readonly onToggleGrid: () => void;
  readonly onToggleEdges: () => void;
  readonly zoomOutIcon: ReactNode;
  readonly zoomInIcon: ReactNode;
  readonly fitIcon: ReactNode;
  readonly lockIcon: ReactNode;
  readonly minimapIcon: ReactNode;
  readonly gridIcon: ReactNode;
}

export function LcosSpatialNavigatorView({
  style, expanded,
  zoom,
  minimapEnabled,
  gridEnabled,
  edgesVisible,
  interactivityLocked,
  miniMap,
  onToggleExpanded,
  onZoomOut,
  onResetZoom,
  onZoomIn,
  onFit,
  onToggleInteractivity,
  onToggleMinimap,
  onToggleGrid,
  onToggleEdges,
  zoomOutIcon,
  zoomInIcon,
  fitIcon,
  lockIcon,
  minimapIcon,
  gridIcon,
}: LcosSpatialNavigatorViewProps): React.JSX.Element {
  return (
    <section
      style={style}
      data-lcos-spatial-navigator
      data-lcos-camera-controls
      data-lcos-family="spatial-navigator"
      data-lcos-expanded={expanded ? 'true' : 'false'}
      aria-label="空间导航"
    >
      {!expanded ? (
        <LcosIconButton
          aria-label="打开空间导航"
          aria-expanded={false}
          onClick={onToggleExpanded}
        >
          <FigmaShellGlyph name="grid" size={17} />
        </LcosIconButton>
      ) : (
        <>
          <div data-lcos-spatial-navigator-map>
            {minimapEnabled ? miniMap : (
              <button
                type="button"
                data-lcos-spatial-navigator-empty-map
                onClick={onToggleMinimap}
              >
                {minimapIcon}
                <span>显示当前画布小地图</span>
              </button>
            )}
          </div>
          <div data-lcos-spatial-navigator-controls>
            <LcosIconButton aria-label="缩小" title="缩小" onClick={onZoomOut}>
              {zoomOutIcon}
            </LcosIconButton>
            <button
              type="button"
              data-lcos-spatial-navigator-zoom
              aria-label={`恢复 100%，当前 ${Math.round(zoom * 100)}%`}
              title="恢复 100%"
              onClick={onResetZoom}
            >
              {Math.round(zoom * 100)}%
            </button>
            <LcosIconButton aria-label="放大" title="放大" onClick={onZoomIn}>
              {zoomInIcon}
            </LcosIconButton>
            <LcosIconButton aria-label="适合画面" title="适合画面" onClick={onFit}>
              {fitIcon}
            </LcosIconButton>
            <LcosIconButton
              aria-label={interactivityLocked ? '解锁画布' : '锁定画布'}
              title={interactivityLocked ? '解锁画布' : '锁定画布'}
              aria-pressed={interactivityLocked}
              onClick={onToggleInteractivity}
            >
              {lockIcon}
            </LcosIconButton>
            <LcosIconButton
              aria-label={gridEnabled ? '隐藏网格' : '显示网格'}
              title={gridEnabled ? '隐藏网格' : '显示网格'}
              aria-pressed={gridEnabled}
              onClick={onToggleGrid}
            >
              {gridIcon}
            </LcosIconButton>
            <LcosIconButton
              aria-label={edgesVisible ? '隐藏连线' : '显示连线'}
              title={edgesVisible ? '隐藏连线' : '显示连线'}
              aria-pressed={edgesVisible}
              onClick={onToggleEdges}
            >
              <GitBranch aria-hidden size={17} />
            </LcosIconButton>
            <LcosIconButton
              aria-label={minimapEnabled ? '隐藏小地图' : '显示小地图'}
              title={minimapEnabled ? '隐藏小地图' : '显示小地图'}
              aria-pressed={minimapEnabled}
              onClick={onToggleMinimap}
            >
              {minimapIcon}
            </LcosIconButton>
            <LcosIconButton
              aria-label="收起空间导航"
              aria-expanded
              onClick={onToggleExpanded}
            >
              <FigmaShellGlyph name="grid" size={17} />
            </LcosIconButton>
          </div>
        </>
      )}
    </section>
  );
}
