import type { ReactNode } from 'react';

import './professional-assembly.css';

export interface AssemblyMasonryViewProps {
  readonly children: ReactNode;
  readonly label?: string;
}

/** Current CSS-columns mechanism retained. No reordering, layout store or measurement engine. */
export function AssemblyMasonryView({ children, label = '项目材料' }: AssemblyMasonryViewProps): React.JSX.Element {
  return (
    <div data-lcos-assembly-waterfall className="lcos-assembly-masonry" aria-label={label}>
      {children}
    </div>
  );
}
