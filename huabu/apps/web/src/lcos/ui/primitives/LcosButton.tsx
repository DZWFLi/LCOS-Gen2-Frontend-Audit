// GEN1 features/ui/LcosButton.tsx: actual class/prop forwarding implementation.
// Thin adaptation: forwardRef supports the existing host refs and Motion; CSS uses current Figma tokens.
import { forwardRef } from 'react';

import './donor-controls.css';

import type { ComponentPropsWithRef } from 'react';

export interface LcosButtonProps extends ComponentPropsWithRef<'button'> {
  /** primary=accent 蓝底白字 · secondary=label-primary 文字+fill-secondary 底 · ghost=纯 accent 文字 · destructive=红字 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  /** sm 最小高 32px · md 最小高 36px（默认 md） */
  size?: 'sm' | 'md'
}


export const LcosButton = forwardRef<HTMLButtonElement, LcosButtonProps>(
  ({ variant = 'primary', size = 'md', type = 'button', className, ...rest }, ref) => {
    const classes = ['lcos-btn', `lcos-btn--${variant}`, `lcos-btn--${size}`, className].filter(Boolean).join(' ');
    return <button ref={ref} type={type} className={classes} {...rest} />;
  },
);
LcosButton.displayName = 'LcosButton';
