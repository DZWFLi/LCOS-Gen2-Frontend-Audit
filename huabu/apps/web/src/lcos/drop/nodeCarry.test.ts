import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDragActivationDistance } from '@/handler/canvasGestureSession';
import { PointerRouterCore } from '@/handler/pointerRouter';
import useCanvasStore from '@/store/canvasStore';

import { useLcosDropStore } from '../lcosDropState';
import { createLcosRecognizers } from '../lcosRecognizers';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { handleCarryContextMenu } from '../referenceClickSuppressor';

import type { CanvasPointerRouterContext } from '@/handler/canvasPointerRouterContext';

const hit = vi.hoisted(() => ({ id: 'node-one' as string | null }));
vi.mock('@/handler/canvasNodeAtPoint', () => ({ nodeIdAtScreenPoint: () => hit.id }));
const wrapper = {
  getBoundingClientRect: () => ({ left: 100, top: 60, width: 1000, height: 740, right: 1100, bottom: 800 }),
  setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn(),
} as unknown as HTMLDivElement;
const context = {
  wrapper, interactivityLocked: false, explicitToolActive: false, inputMode: 'mouse',
  instance: { screenToFlowPosition: ({ x, y }: { x: number; y: number }) => ({ x: x - 100, y: y - 60 }) },
} as CanvasPointerRouterContext;
function event(x = 150, y = 140, extra = {}): PointerEvent {
  return {
    pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 2,
    clientX: x, clientY: y, preventDefault: vi.fn(), stopPropagation: vi.fn(),
    ...extra,
  } as unknown as PointerEvent;
}
function menu(): Event {
  return { preventDefault: vi.fn(), stopPropagation: vi.fn(), stopImmediatePropagation: vi.fn() } as unknown as Event;
}
beforeEach(() => {
  hit.id = 'node-one';
  useLcosDropStore.getState().reset();
  useLcosReferenceStore.getState().reset();
  useLcosReferenceStore.getState().registerNodeEntity('node-one', { entityType: 'note', entityId: 'note-one' });
  useCanvasStore.setState({ nodes: [{ id: 'node-one', position: { x: 40, y: 80 }, data: {}, selected: true }] });
  handleCarryContextMenu(menu());
});
function registerGlyth(): void {
  useLcosDropStore.getState().registerTarget({
    targetId: 'glyth:two', kind: 'collaboration-reference', label: '设计会话',
    rect: { left: 300, top: 180, width: 100, height: 100 }, priority: 20, enabled: true,
    semantic: { kind: 'collaboration-reference', conversationId: 'conversation-two' },
  });
}
describe('T3 node right carry through the single pointer router', () => {
  it('keeps the ordinary right-click menu below the shared threshold', () => {
    const router = new PointerRouterCore(createLcosRecognizers(), () => context);
    router.handleDown(event());
    router.handleMove(event(150 + getDragActivationDistance('mouse') - 1));
    router.handleUp(event());
    expect(useLcosDropStore.getState().state.status).toBe('idle');
    expect(handleCarryContextMenu(menu())).toBe(false);
  });
  it('one move then release targets Glyth immediately and leaves source geometry and selection intact', () => {
    registerGlyth();
    const before = useCanvasStore.getState().nodes;
    const router = new PointerRouterCore(createLcosRecognizers(), () => context);
    router.handleDown(event());
    router.handleMove(event(330, 210));
    expect(useLcosDropStore.getState().state).toMatchObject({
      status: 'preview', destination: { targetId: 'glyth:two', previewPoint: { x: 230, y: 150 } },
    });
    router.handleUp(event(330, 210));
    expect(useLcosDropStore.getState().state).toMatchObject({
      status: 'committing', intent: { kind: 'assembly-apply' },
    });
    expect(useLcosDropStore.getState().resolution).toMatchObject({ status: 'ready', intent: { targetRef: { kind: 'conversation', id: 'conversation-two' }, sourceRefs: [{ kind: 'note', id: 'note-one' }] } });
    if (useLcosDropStore.getState().resolution?.status === 'ready') expect(useLcosDropStore.getState().resolution).not.toHaveProperty('intent.placementPoint');
    expect(useCanvasStore.getState().nodes).toBe(before);
    expect(handleCarryContextMenu(menu())).toBe(true);
    expect(handleCarryContextMenu(menu())).toBe(false);
  });
  it('re-hit-tests release so a disappeared receiver cannot accept the stale preview', () => {
    registerGlyth();
    const router = new PointerRouterCore(createLcosRecognizers(), () => context);
    router.handleDown(event());
    router.handleMove(event(330, 210));
    useLcosDropStore.getState().unregisterTarget('glyth:two');
    router.handleUp(event(330, 210));
    expect(useLcosDropStore.getState().state.status).toBe('idle');
  });
  it('Escape/blur cancellation releases capture and cannot commit later', () => {
    registerGlyth();
    const router = new PointerRouterCore(createLcosRecognizers(), () => context);
    router.handleDown(event());
    router.handleMove(event(330, 210));
    router.cancelAll();
    expect(router.ownerOf(1)).toBeNull();
    expect(useLcosDropStore.getState().state.status).toBe('idle');
    router.handleUp(event(330, 210));
    expect(useLcosDropStore.getState().state.status).toBe('idle');
  });
  it('does not invent a Core reference for an unbound node or replace left drag', () => {
    const router = new PointerRouterCore(createLcosRecognizers(), () => context);
    hit.id = 'unbound';
    router.handleDown(event());
    expect(router.ownerOf(1)).toBeNull();
    hit.id = 'node-one';
    router.handleDown(event(150, 140, { button: 0 }));
    expect(router.ownerOf(1)).toBeNull();
  });
  it('does not turn right carry over blank canvas into a move of the original', () => {
    useLcosDropStore.getState().registerTarget({
      targetId: 'canvas:main', kind: 'canvas', label: '画布', enabled: true, priority: 10,
      rect: { left: 100, top: 60, width: 1000, height: 740 },
      semantic: { kind: 'canvas', targetRef: { kind: 'main' } },
    });
    const router = new PointerRouterCore(createLcosRecognizers(), () => context);
    router.handleDown(event());
    router.handleMove(event(330, 210));
    expect(useLcosDropStore.getState().resolution?.status).toBe('ineligible');
    router.handleUp(event(330, 210));
    expect(useLcosDropStore.getState().state.status).toBe('idle');
  });
});
