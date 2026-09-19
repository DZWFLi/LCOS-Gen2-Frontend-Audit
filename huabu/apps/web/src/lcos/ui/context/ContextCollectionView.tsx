import { Layers3 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { PreviewMedia } from '../spatial/PreviewMedia';
import { useDescendantFocus } from '../spatial/useDescendantFocus';
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
  readonly disabledReason?: string;
  readonly active?: boolean;
  readonly action?: ReactNode;
}

function OrganizationGlyph({ organization }: { readonly organization: ContextCollectionOrganization }): React.JSX.Element {
  if (organization === '事情') return <img src={thingIcon} alt="" draggable={false} />;
  if (organization === '时间') return <img src={timeIcon} alt="" draggable={false} />;
  return <Layers3 aria-hidden size={21} strokeWidth={1.7} />;
}

export function ContextCollectionView({
  title,
  organization,
  rendition = '总览',
  previewUrl,
  secondaryPreviewUrl,
  disabled = false,
  disabledReason,
  active = false,
  action,
}: ContextCollectionViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const focus = useDescendantFocus();
  const label = organization === '未指定' ? '组织未标注' : `按${organization}组织`;
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
        data-lcos-context-collection
        data-organization={organization}
        data-rendition={rendition}
        className="lcos-context-collection"
        initial={reducedMotion ? false : { opacity: 0, y: 36, scale: 0.96 }}
        animate={{ opacity: 1, y: !reducedMotion && !disabled && focus.focused ? -8 : 0, scale: !reducedMotion && !disabled && focus.focused ? 1.025 : 1 }}
        whileHover={reducedMotion || disabled ? undefined : { y: -8, scale: 1.025 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="lcos-context-collection-back" aria-hidden />
        <div className="lcos-context-collection-tab" aria-hidden />
        <div className="lcos-context-collection-cover cover-a">
          <PreviewMedia src={previewUrl} label={`${title} 封面`} />
        </div>
        <div className="lcos-context-collection-cover cover-b">
          <PreviewMedia src={secondaryPreviewUrl} label={`${title} 第二份材料预览`} />
        </div>
        <div className="lcos-context-collection-pocket" aria-hidden />
        <div className="lcos-context-collection-copy">
          <span className="lcos-context-collection-icon" aria-hidden><OrganizationGlyph organization={organization} /></span>
          <div><strong title={title}>{title}</strong><span title={disabled ? disabledReason : label}>{disabled ? disabledReason ?? '目标当前不可用' : label}</span></div>
        </div>
        <div className="lcos-context-collection-action">{!disabled ? action : null}</div>
        {rendition === '总览' ? <div className="lcos-context-collection-depth" aria-hidden /> : null}
      </motion.div>
    </div>
  );
}
