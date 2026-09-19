import { Layers3 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import thingIcon from './assets/context-thing.svg';
import timeIcon from './assets/context-time.svg';

import type { ReactNode } from 'react';
import './context-spatial.css';

export type ContextCollectionOrganization = '事情' | '时间' | '未指定';
export type ContextCollectionRendition = '总览' | '主画布' | '装配';

export interface ContextCollectionViewProps {
  readonly title: string;
  readonly organization: ContextCollectionOrganization;
  readonly rendition?: ContextCollectionRendition;
  readonly previewUrl?: string;
  readonly secondaryPreviewUrl?: string;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly action?: ReactNode;
  /** Transitional selector for the current production/e2e contract. */
  readonly legacyAtlasKind?: string;
}

function OrganizationGlyph({
  organization,
}: {
  readonly organization: ContextCollectionOrganization;
}): React.JSX.Element {
  if (organization === '事情') {
    return <img src={thingIcon} alt="" draggable={false} />;
  }
  if (organization === '时间') {
    return <img src={timeIcon} alt="" draggable={false} />;
  }
  return <Layers3 aria-hidden size={21} strokeWidth={1.7} />;
}

export function ContextCollectionView({
  title,
  organization,
  rendition = '总览',
  previewUrl,
  secondaryPreviewUrl,
  disabled = false,
  active = false,
  action,
  legacyAtlasKind,
}: ContextCollectionViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const label = organization === '未指定' ? '组织未标注' : '按' + organization + '组织';

  return (
    <div
      data-lcos-context-collection-slot
      data-active={active ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
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
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={reducedMotion || disabled ? undefined : { y: -8, scale: 1.025 }}
        whileFocus={reducedMotion || disabled ? undefined : { y: -8, scale: 1.025 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="lcos-context-collection-back" aria-hidden />
        <div className="lcos-context-collection-tab" aria-hidden />
        <div className="lcos-context-collection-cover cover-a" aria-hidden>
          {previewUrl ? <img src={previewUrl} alt="" draggable={false} /> : null}
        </div>
        <div className="lcos-context-collection-cover cover-b" aria-hidden>
          {secondaryPreviewUrl || previewUrl ? (
            <img src={secondaryPreviewUrl ?? previewUrl} alt="" draggable={false} />
          ) : null}
        </div>
        <div className="lcos-context-collection-pocket" aria-hidden />
        <div className="lcos-context-collection-copy">
          <span className="lcos-context-collection-icon" aria-hidden>
            <OrganizationGlyph organization={organization} />
          </span>
          <div>
            <strong>{title}</strong>
            <span>{label}</span>
          </div>
        </div>
        <div className="lcos-context-collection-action">{action ?? <span aria-hidden>↗</span>}</div>
        {rendition === '总览' ? <div className="lcos-context-collection-depth" aria-hidden /> : null}
      </motion.div>
    </div>
  );
}
