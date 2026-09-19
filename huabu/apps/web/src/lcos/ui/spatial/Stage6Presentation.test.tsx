// @vitest-environment happy-dom
import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PreviewMedia } from './PreviewMedia';
import { TemporalRailView } from '../context/TemporalRailView';
import { PortalPreviewView } from '../professional/PortalPreviewView';
import { WorkflowTaskCardView } from '../workflow/WorkflowTaskCardView';

import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
async function render(node: ReactNode): Promise<void> {
  await act(async () => root.render(node));
}
function button(selector: string): HTMLButtonElement {
  const node = host.querySelector(selector);
  if (!(node instanceof HTMLButtonElement)) throw new Error(`Expected button: ${selector}`);
  return node;
}

describe('Stage6 real React presentation', () => {
  it('has no invented Portal actions when no callbacks or scene are supplied', async () => {
    await render(<PortalPreviewView state="可预览" title="目标" />);
    expect(host.querySelector('button')).toBeNull();
    expect(host.textContent).toContain('预览内容尚未就绪');
  });

  it('retains the supplied scene across stale/recovery presentations', async () => {
    const retry = vi.fn();
    const scene = <div data-lcos-real-portal-preview><button type="button">原生预览动作</button></div>;
    await render(<PortalPreviewView state="旧缓存" title="目标" onRetry={retry}>{scene}</PortalPreviewView>);
    const before = host.querySelector('[data-lcos-real-portal-preview]');
    await act(async () => button('.lcos-portal-retry').click());
    expect(retry).toHaveBeenCalledTimes(1);
    await render(<PortalPreviewView state="部分预览" title="目标" onRetry={retry}>{scene}</PortalPreviewView>);
    expect(host.querySelector('[data-lcos-real-portal-preview]')).toBe(before);
    expect(host.querySelector('.lcos-portal-retry')).toBeNull();
  });

  it('keeps an unavailable target labelled and never calls open', async () => {
    const open = vi.fn();
    await render(<PortalPreviewView state="目标缺失" title="目标" detail="工作现场不可用" onOpen={open} />);
    expect(button('.lcos-portal-open').disabled).toBe(true);
    await act(async () => button('.lcos-portal-open').click());
    expect(open).not.toHaveBeenCalled();
    expect(host.textContent).toContain('工作现场不可用');
  });

  it('keeps task draft entry separate from Run and from image retry', async () => {
    const use = vi.fn();
    await render(<WorkflowTaskCardView title="任务" state="悬停" onUse={use} />);
    await act(async () => button('[data-lcos-card-take]').click());
    expect(use).toHaveBeenCalledTimes(1);
    await render(<WorkflowTaskCardView title="任务" state="草稿中" onUse={use} />);
    expect(host.querySelector('[data-lcos-card-take]')).toBeNull();
    expect(host.textContent).toContain('已加入草稿 · 未发送');
  });

  it('resets image failure by source and preserves the donor retry path', async () => {
    await render(<PreviewMedia src="/fixture/one.png" label="材料" />);
    const img = host.querySelector('img');
    if (!img) throw new Error('Expected initial image');
    await act(async () => { img.dispatchEvent(new Event('error')); });
    expect(host.textContent).toContain('预览读取失败');
    await act(async () => button('button').click());
    expect(host.querySelector('[data-image-phase="loading"]')).not.toBeNull();
    await render(<PreviewMedia src="/fixture/two.png" label="材料" />);
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/fixture/two.png');
  });

  it('moves DOM focus, skips unavailable entries and cleans the preview on scope change', async () => {
    const preview = vi.fn();
    const items = [{ id: 'a', label: '第一组', ratio: .1 }, { id: 'b', label: '不可用', ratio: .5, disabled: true }, { id: 'c', label: '第三组', ratio: .9 }];
    await render(<TemporalRailView items={items} onPreviewChange={preview} scopeKey="one" />);
    await act(async () => button('[data-temporal-item="a"]').focus());
    await act(async () => { button('[data-temporal-item="a"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })); });
    expect(document.activeElement).toBe(button('[data-temporal-item="c"]'));
    await render(<TemporalRailView items={items} onPreviewChange={preview} scopeKey="two" />);
    expect(preview).toHaveBeenLastCalledWith(null);
  });

  it('isolates wheel with React StrictMode and leaves empty data truly empty', async () => {
    const shift = vi.fn();
    const outer = vi.fn();
    await render(<StrictMode><div onWheel={outer}><TemporalRailView items={[]} onWindowShift={shift} /></div></StrictMode>);
    const rail = host.querySelector('aside');
    if (!rail) throw new Error('Expected rail');
    await act(async () => { rail.dispatchEvent(new WheelEvent('wheel', { deltaY: 50, bubbles: true, cancelable: true })); });
    expect(shift).toHaveBeenCalledExactlyOnceWith(1);
    expect(outer).not.toHaveBeenCalled();
    expect(host.querySelector('.lcos-temporal-ticks')).toBeNull();
  });
});
