// Figma 5386:256。selected/busy/disabled 均由现有 container 提供。
// 本组件不拥有 Surface identity、导航、相机或 safeRect。
import { FigmaShellGlyph } from '../FigmaShellGlyph';

import type { FigmaShellGlyphName } from '../FigmaShellGlyph';
import type { CSSProperties, ReactNode } from 'react';

export interface LcosSurfaceDockViewItem<Key extends string> {
  readonly key: Key;
  readonly label: string;
  readonly title?: string;
  readonly glyph: FigmaShellGlyphName;
  readonly selected: boolean;
  readonly busy: boolean;
  readonly disabled: boolean;
}
export interface LcosSurfaceDockViewProps<Key extends string> {
  readonly items: readonly LcosSurfaceDockViewItem<Key>[];
  readonly onSelect: (key: Key) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly feedback?: ReactNode;
}
export function LcosSurfaceDockView<Key extends string>({ items, onSelect,
  className, style, feedback }: LcosSurfaceDockViewProps<Key>): React.JSX.Element {
  return <div data-lcos-surface-dock data-lcos-family="surface-dock" className={className} style={style}>
    <div data-lcos-dock-items>
      {items.map((item) => <button key={item.key} type="button" disabled={item.disabled}
        data-lcos-surface={item.key} data-lcos-surface-active={item.selected ? 'true' : 'false'}
        aria-label={item.label} title={item.title ?? item.label} aria-pressed={item.selected}
        aria-busy={item.busy} onClick={() => onSelect(item.key)}>
        <span data-lcos-dock-tile>
          <FigmaShellGlyph name={item.busy ? 'loading' : item.glyph} size={21} />
        </span>
      </button>)}
    </div>
    {feedback}
  </div>;
}
