import type { ReactNode } from 'react';

import '../context/context-spatial.css';

export type PortalPreviewVisualState = '可预览' | '加载中' | '旧缓存' | '部分预览' | '预览失败' | '目标缺失';

export interface PortalPreviewViewProps {
  readonly state: PortalPreviewVisualState;
  readonly title: string;
  readonly detail?: string;
  readonly onOpen?: () => void;
  readonly onRetry?: () => void;
  readonly children?: ReactNode;
}

export function PortalPreviewView({ state, title, detail, onOpen, onRetry, children }: PortalPreviewViewProps): React.JSX.Element {
  const retryable = state === '旧缓存' || state === '部分预览' || state === '预览失败';
  return (
    <section
      data-lcos-portal-preview-view
      data-state={state}
      data-lcos-family="portal-preview"
      data-lcos-variant={state}
      className="lcos-portal-preview-view"
    >
      <header><strong>{title}</strong>{onOpen ? <button type="button" onClick={onOpen}>打开现场</button> : null}</header>
      <div className="lcos-portal-preview-stage" data-lcos-portal-stage>
        {children ?? <span className="lcos-portal-preview-placeholder">{state === '加载中' ? '正在读取目标…' : state === '目标缺失' ? '没有可预览的目标现场' : detail ?? state}</span>}
      </div>
      <footer><span>{detail ?? (state === '可预览' ? '只读预览' : state)}</span>{retryable && onRetry ? <button type="button" onClick={onRetry}>重试</button> : null}</footer>
    </section>
  );
}
