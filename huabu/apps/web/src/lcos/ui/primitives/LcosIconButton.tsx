// GEN1 features/ui/LcosIconButton.tsx: actual class/prop forwarding implementation.
// Thin adaptation: forwardRef supports the existing host refs and Motion; CSS uses current Figma tokens.
import { forwardRef } from 'react';

import './donor-controls.css';

import type { ComponentPropsWithRef } from 'react';

export interface LcosIconButtonProps extends ComponentPropsWithRef<'button'> {
  /** 容器形状：circle=正圆（默认）· capsule=胶囊（图标+文字组合时用） */
  shape?: 'circle' | 'capsule'
  /** sm 视觉 32×32（点击区扩到 40×40）· md 40×40（默认） */
  size?: 'sm' | 'md'
}


export const LcosIconButton = forwardRef<HTMLButtonElement, LcosIconButtonProps>(
  ({ shape = 'circle', size = 'md', type = 'button', className, ...rest }, ref) => {
    const classes = ['lcos-icon-btn', `lcos-icon-btn--${shape}`, `lcos-icon-btn--${size}`, className].filter(Boolean).join(' ');
    return <button ref={ref} type={type} className={classes} {...rest} />;
  },
);
LcosIconButton.displayName = 'LcosIconButton';
