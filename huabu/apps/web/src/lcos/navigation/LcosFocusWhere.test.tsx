import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { LcosFocusWhere } from './LcosFocusWhere';
const mocks = vi.hoisted(() => ({ list: vi.fn(), workspaces: vi.fn(), requestLocate: vi.fn(), switchWorksite: vi.fn(), wait: vi.fn(),
  refs: new Map<string, { entityId: string; entityType: string }>(),
  canvas: { canvasId: 'current', nodes: [] as Array<{ id: string; selected?: boolean }> } }));
vi.mock('@local-creative-os/web-gen2', async (original) => ({ ...await original<typeof import('@local-creative-os/web-gen2')>(), SqliteBindingStore: class { list = mocks.list; } }));
vi.mock('./waitForProjectedEntity', () => ({ waitForProjectedEntity: mocks.wait }));
vi.mock('../app/lcosCoreClient', () => ({ createLcosCoreSession: () => ({ http: {}, projects: { getWorkspaces: mocks.workspaces } }) }));
vi.mock('../app/useLcosWorksiteNav', () => ({ useLcosWorksiteNav: () => ({ switchWorksite: mocks.switchWorksite }) }));
vi.mock('../lcosReferenceState', () => ({ useLcosReferenceStore: { getState: () => ({ nodeEntityRefs: mocks.refs }) } }));
vi.mock('@/store/canvasStore', () => ({ default: { getState: () => mocks.canvas } }));
vi.mock('../shell/lcosShellStore', () => ({ SURFACE_LABEL: { main: '主画布' }, useLcosShellStore: (select: (s: unknown) => unknown) => select({ activeSurface: 'main', windowEnvironment: null, requestLocate: mocks.requestLocate }) }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { for (const root of roots.splice(0)) act(() => root.unmount()); document.body.replaceChildren(); vi.resetAllMocks(); mocks.refs.clear(); mocks.canvas.nodes = []; mocks.canvas.canvasId = 'current'; });
async function render() {
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container); roots.push(root);
  mocks.refs.set('selected', { entityId: 'a', entityType: 'artifact' }); mocks.canvas.nodes.push({ id: 'selected', selected: true });
  await act(async () => root.render(<LcosFocusWhere projectId="p" canvasBySurface={{ context: 'root-context' }} surfaceByWorkspace={new Map()} ensureCanvas={async () => undefined} />));
  await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })));
  return container;
}
it.each([false, true])('keeps exact child workspace and projection, cancellation=%s', async (cancel) => {
  mocks.list.mockResolvedValue([{ projectId: 'p', entityId: 'a', entityType: 'artifact', spatialKind: 'node', spatialId: 'exact-second', canvasId: 'child-canvas' }]);
  mocks.workspaces.mockResolvedValue([{ id: 'child', canvasId: 'child-canvas', preferredSurface: 'context', name: '子现场' }]);
  mocks.switchWorksite.mockImplementation(async () => { mocks.canvas.canvasId = 'child-canvas'; return true; });
  let finish: (value: string) => void = () => {};
  mocks.wait.mockImplementation(() => new Promise<string>((resolve) => { finish = resolve; }));
  const container = await render();
  await act(async () => container.querySelector<HTMLButtonElement>('[data-lcos-occurrence="exact-second"]')!.click());
  expect(mocks.switchWorksite).toHaveBeenCalledExactlyOnceWith('context', { canvasId: 'child-canvas', workspaceId: 'child' });
  expect(mocks.wait).toHaveBeenCalledWith(expect.objectContaining({ canvasId: 'child-canvas', nodeId: 'exact-second' }));
  if (cancel) await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  await act(async () => finish('exact-second'));
  if (cancel) expect(mocks.requestLocate).not.toHaveBeenCalled();
  else expect(mocks.requestLocate).toHaveBeenCalledWith(expect.objectContaining({ canvasId: 'child-canvas', nodeId: 'exact-second', preserveSelection: true }));
});
it('does not substitute another projection of the same entity', async () => {
  mocks.list.mockResolvedValue([]); mocks.workspaces.mockResolvedValue([]); mocks.wait.mockResolvedValue('wrong-node');
  const container = await render();
  await act(async () => container.querySelector<HTMLButtonElement>('[data-lcos-occurrence="selected"]')!.click());
  expect(mocks.requestLocate).not.toHaveBeenCalled(); expect(container.textContent).toContain('所选投影尚未就绪');
});
it('does not reopen on late bindings after Escape', async () => {
  let finish: (value: never[]) => void = () => {};
  mocks.list.mockImplementation(() => new Promise((resolve) => { finish = resolve; })); mocks.workspaces.mockResolvedValue([]);
  const container = await render();
  await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  await act(async () => finish([]));
  expect(container.querySelector('[data-lcos-focus-where]')?.getAttribute('data-open')).toBe('false');
});
it('keeps all remote projections, without the five-location search-summary limit', async () => {
  mocks.list.mockResolvedValue(Array.from({ length: 9 }, (_, index) => ({ projectId: 'p', entityId: 'a', entityType: 'artifact', spatialKind: 'node', spatialId: `n${index}`, canvasId: 'child-canvas' })));
  mocks.workspaces.mockResolvedValue([{ id: 'child', canvasId: 'child-canvas', preferredSurface: 'context', name: '子现场' }]);
  const container = await render();
  expect(container.querySelectorAll('[data-lcos-occurrence]')).toHaveLength(10);
});

it('does not omit a same-canvas binding just because its exact projection is not live yet', async () => {
  mocks.list.mockResolvedValue([{ projectId: 'p', entityId: 'a', entityType: 'artifact', spatialKind: 'node', spatialId: 'waiting-local', canvasId: 'current' }]);
  mocks.workspaces.mockResolvedValue([]); mocks.wait.mockResolvedValue(undefined);
  const container = await render();
  const target = container.querySelector<HTMLButtonElement>('[data-lcos-occurrence="waiting-local"]');
  expect(target).not.toBeNull();
  await act(async () => target!.click());
  expect(mocks.switchWorksite).not.toHaveBeenCalled();
  expect(mocks.wait).toHaveBeenCalledWith(expect.objectContaining({ canvasId: 'current', nodeId: 'waiting-local' }));
  expect(mocks.requestLocate).not.toHaveBeenCalled();
  expect(container.textContent).toContain('尚未就绪');
});
