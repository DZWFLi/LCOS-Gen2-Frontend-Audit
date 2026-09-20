import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LcosSpatialNavigator } from './LcosSpatialNavigator';
import { useLcosShellStore } from '../shell/lcosShellStore';

import type { CanvasSpatialNavigatorControls } from '@/lcos-seam/types';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const callbacks = () => ({
  toggleInteractivity: vi.fn(),
  toggleMinimap: vi.fn(),
  toggleGrid: vi.fn(),
});

describe('LcosSpatialNavigator', () => {
  let root: Root | undefined;
  let host: HTMLDivElement | undefined;

  afterEach(async () => {
    if (root) await act(async () => root?.unmount());
    host?.remove();
    root = undefined;
    host = undefined;
    useLcosShellStore.setState({ cameraRequest: null });
  });

  async function render(
    overrides: Partial<CanvasSpatialNavigatorControls> = {},
  ): Promise<{ element: HTMLElement; controls: ReturnType<typeof callbacks> }> {
    const controls = callbacks();
    const props: CanvasSpatialNavigatorControls = {
      zoom: 0.72,
      minimapEnabled: true,
      gridEnabled: true,
      interactivityLocked: false,
      miniMap: <div data-test-minimap>map</div>,
      ...controls,
      ...overrides,
    };
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root?.render(<LcosSpatialNavigator {...props} />));
    const element = host.querySelector<HTMLElement>('[data-lcos-spatial-navigator]');
    if (!element) throw new Error('spatial navigator missing');
    return { element, controls };
  }

  it('uses the Figma collapsed state before revealing the current-canvas instruments', async () => {
    const { element } = await render();
    expect(element.dataset.lcosExpanded).toBe('false');
    expect(element.querySelector('[data-test-minimap]')).toBeNull();

    await act(async () => {
      element.querySelector<HTMLButtonElement>('[aria-label="打开空间导航"]')?.click();
    });

    expect(element.dataset.lcosExpanded).toBe('true');
    expect(element.querySelector('[data-test-minimap]')?.textContent).toBe('map');
    expect(element.querySelector('[data-lcos-spatial-navigator-zoom]')?.textContent).toBe('72%');
  });

  it('dispatches every Huabu-owned action once and reflects lock/grid/minimap state', async () => {
    const { element, controls } = await render({ interactivityLocked: true });
    await act(async () => {
      element.querySelector<HTMLButtonElement>('[aria-label="打开空间导航"]')?.click();
    });

    const cameraActions = [
      ['缩小', 'zoom-out'],
      ['放大', 'zoom-in'],
      ['适合画面', 'fit'],
    ] as const;
    for (const [label, kind] of cameraActions) {
      await act(async () => {
        element.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)?.click();
      });
      expect(useLcosShellStore.getState().cameraRequest?.kind).toBe(kind);
    }
    await act(async () => {
      element.querySelector<HTMLButtonElement>('[data-lcos-spatial-navigator-zoom]')?.click();
    });
    expect(useLcosShellStore.getState().cameraRequest?.kind).toBe('reset');

    for (const label of ['解锁画布', '隐藏网格', '隐藏小地图']) {
      await act(async () => {
        element.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)?.click();
      });
    }
    expect(controls.toggleInteractivity).toHaveBeenCalledTimes(1);
    expect(controls.toggleGrid).toHaveBeenCalledTimes(1);
    expect(controls.toggleMinimap).toHaveBeenCalledTimes(1);
  });

  it('offers the existing minimap preference when the map is hidden', async () => {
    const { element, controls } = await render({
      minimapEnabled: false,
      miniMap: null,
    });
    await act(async () => {
      element.querySelector<HTMLButtonElement>('[aria-label="打开空间导航"]')?.click();
    });
    expect(element.querySelector('[data-test-minimap]')).toBeNull();
    await act(async () => {
      element.querySelector<HTMLButtonElement>('[data-lcos-spatial-navigator-empty-map]')?.click();
    });
    expect(controls.toggleMinimap).toHaveBeenCalledTimes(1);
  });
});
