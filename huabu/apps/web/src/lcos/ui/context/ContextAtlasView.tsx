import { motion, useIsPresent, useReducedMotion } from 'motion/react';

import { ContextAtlasLayout } from './ContextAtlasLayout';
import { LightCurtainBackdrop, LightCurtainDismissPlane } from '../spatial/LightCurtainBackdrop';
import { PRESENTATION_EXIT } from '../spatial/presentationMotion';

import './context-spatial.css';
import type { ReactNode } from 'react';

export interface ContextAtlasViewProps {
  readonly header: ReactNode;
  readonly children: ReactNode;
  readonly onClose: () => void;
}

/** Kept alive by ContextWorksite's existing-state conditional inside AnimatePresence. */
export function ContextAtlasView({ header, children, onClose }: ContextAtlasViewProps): React.JSX.Element {
  const present = useIsPresent();
  const reduced = Boolean(useReducedMotion());
  return (
    <motion.div
      data-lcos-context-atlas
      data-presentation-present={present ? 'true' : 'false'}
      className="lcos-atlas-light-curtain"
      role="region"
      aria-label="集合总览"
      aria-hidden={!present || undefined}
      inert={!present || undefined}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : PRESENTATION_EXIT}
    >
      <LightCurtainBackdrop kind="atlas" />
      <LightCurtainDismissPlane disabled={!present} onClose={onClose} />
      <ContextAtlasLayout header={header}>{children}</ContextAtlasLayout>
    </motion.div>
  );
}
