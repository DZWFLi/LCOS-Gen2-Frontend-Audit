import { Layers3 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { ContextCollectionFace } from './ContextCollectionFace';
import { PRESENTATION_EXIT, PRESENTATION_SPRING, presentationPose } from '../spatial/presentationMotion';
import { useDescendantFocus } from '../spatial/useDescendantFocus';

import type { ContextCollectionFaceProps } from './ContextCollectionFace';
import './context-spatial.css';

export type { ContextCollectionOrganization, ContextCollectionRendition } from './ContextCollectionFace';

export interface ContextCollectionViewProps extends ContextCollectionFaceProps {
  readonly active?: boolean;
  /** Transitional selector for the current production/e2e contract. */
  readonly legacyAtlasKind?: string;
}

export function ContextCollectionView({
  title,
  organization,
  rendition = '总览',
  previewUrl,
  secondaryPreviewUrl,
  previewFit,
  secondaryPreviewFit,
  disabled = false,
  disabledReason,
  active = false,
  action,
  legacyAtlasKind,
  onActivate,
  activationLabel,
}: ContextCollectionViewProps): React.JSX.Element {
  const reducedMotion = Boolean(useReducedMotion());
  const focus = useDescendantFocus();
  return (
    <div
      data-lcos-context-collection-slot
      data-active={active ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-focused={focus.focused ? 'true' : undefined}
      aria-disabled={disabled || undefined}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
      className="lcos-context-collection-slot"
    >
      <motion.div
        data-lcos-family="collection-surface"
        data-lcos-organize={organization}
        data-lcos-rendition={rendition}
        data-lcos-variant={active ? 'selected' : rendition}
        {...(legacyAtlasKind === undefined ? {} : { 'data-lcos-atlas-card': legacyAtlasKind })}
        data-lcos-context-collection
        data-organization={organization}
        data-active={active ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-rendition={rendition}
        className="lcos-context-collection"
        initial={reducedMotion ? false : { opacity: 0, y: 36, scale: 0.96 }}
        animate={presentationPose(reducedMotion, focus.focused, disabled)}
        exit={{ opacity: 0, y: reducedMotion ? 0 : 36, scale: reducedMotion ? 1 : 0.96, transition: reducedMotion ? { duration: 0 } : PRESENTATION_EXIT }}
        whileHover={reducedMotion || disabled ? undefined : { y: -8, scale: 1.025 }}
        transition={reducedMotion ? { duration: 0 } : PRESENTATION_SPRING}
      >
        <ContextCollectionFace title={title} organization={organization} rendition={rendition}
          {...(previewUrl === undefined ? {} : { previewUrl })}
          {...(secondaryPreviewUrl === undefined ? {} : { secondaryPreviewUrl })}
          {...(previewFit === undefined ? {} : { previewFit })}
          {...(secondaryPreviewFit === undefined ? {} : { secondaryPreviewFit })}
          disabled={disabled}
          {...(disabledReason === undefined ? {} : { disabledReason })}
          {...(action === undefined ? {} : { action })}
          {...(onActivate === undefined ? {} : { onActivate })}
          {...(activationLabel === undefined ? {} : { activationLabel })}
          unspecifiedGlyph={<Layers3 aria-hidden size={21} strokeWidth={1.7} />} />
      </motion.div>
    </div>
  );
}
