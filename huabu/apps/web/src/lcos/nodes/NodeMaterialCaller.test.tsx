import { describeProjectedEntity } from '@local-creative-os/web-gen2';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { LcosNodePresentationProvider } from '@/lcos-seam/nodePresentation';

import { createLcosNodePresentationSeam } from './createLcosNodePresentationSeam';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore } from '../shell/lcosShellStore';

const mocks = vi.hoisted(() => ({ getWorkspaces: vi.fn(), enter: vi.fn(), state: { canvasId: 'main-canvas', nodes: [] } }));
vi.mock('@/store/canvasStore', () => ({ default: (select: (value: typeof mocks.state) => unknown) => select(mocks.state) }));
vi.mock('./useLcosDensity', () => ({ useLcosDensity: () => 'reading' }));
vi.mock('../app/lcosCoreClient', () => ({ createLcosCoreSession: () => ({ projects: { getWorkspaces: mocks.getWorkspaces } }) }));
vi.mock('../navigation/childWorksiteNavigation', () => ({ beginChildWorksiteNavigation: mocks.enter }));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  useLcosReferenceStore.getState().setProject('project-source');
  useLcosReferenceStore.getState().resetNodeEntities();
  useLcosShellStore.getState().clear();
  mocks.getWorkspaces.mockReset(); mocks.enter.mockClear();
  mocks.getWorkspaces.mockResolvedValue([]);
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
async function mount(kind: 'image' | 'workflow') {
  const entityType = kind === 'workflow' ? 'scope' : 'artifact';
  useLcosReferenceStore.getState().registerNodeEntity('node-real', {
    entityType, entityId: 'entity-real', descriptor: describeProjectedEntity({
      entityType, entityId: 'entity-real', title: '真实对象', artifactKind: kind,
      ...(kind === 'image' ? { managed: true, sourceRunId: 'run-real', currentRevisionId: 'revision-real' } : {}),
    }),
  });
  const input = { nodeId: 'node-real', nodeType: 'note', data: { title: '真实对象', presentationMediaSrc: '/real-image.png' } };
  const Body = createLcosNodePresentationSeam().resolve(input);
  if (!Body) throw new Error('Expected actual bound body');
  await act(async () => root.render(<MemoryRouter><LcosNodePresentationProvider value={{
    worldWidth: 248, worldHeight: 244, zoom: 1, screenWidth: 248, screenHeight: 244, dpr: 1, phase: 'rest',
  }}><Body {...input} /></LcosNodePresentationProvider></MemoryRouter>));
}
it('generated image uses the actual seam body; only double click opens its real Reader target', async () => {
  await mount('image');
  expect(host.querySelector('img')?.getAttribute('src')).toBe('/real-image.png');
  expect(host.textContent).not.toContain('待 Review');
  const body = host.querySelector('[data-lcos-species-body]')!;
  await act(async () => body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(useLcosShellStore.getState().windows).toHaveLength(0);
  await act(async () => body.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
  expect(useLcosShellStore.getState().windows).toHaveLength(1);
  expect(useLcosShellStore.getState().windows[0]).toMatchObject({ target: 'entity-real', bodyKey: 'reader' });
});
it('a workflow with several workspaces never silently enters the first one', async () => {
  mocks.getWorkspaces.mockResolvedValue([
    { id: 'a', name: '现场A', scopeId: 'entity-real', canvasId: 'canvas-a' },
    { id: 'b', name: '现场B', scopeId: 'entity-real', canvasId: 'canvas-b' },
  ]);
  await mount('workflow');
  await act(async () => host.querySelector('button')!.click());
  expect(mocks.enter).not.toHaveBeenCalled();
  const second = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find((item) => item.textContent?.includes('现场B'));
  expect(second).toBeDefined();
  await act(async () => second!.click());
  expect(mocks.enter).toHaveBeenCalledWith(expect.objectContaining({ targetWorkspace: expect.objectContaining({ id: 'b' }) }));
});
it('a known workflow target keeps the existing explicit child navigation', async () => {
  mocks.getWorkspaces.mockResolvedValue([{ id: 'a', scopeId: 'entity-real', canvasId: 'canvas-a' }]);
  await mount('workflow');
  expect(host.querySelector('.lcos-workflow-collection-front')).not.toBeNull();
  expect((host.querySelector('[data-lcos-species-body]') as HTMLElement).style.background).toBe('transparent');
  await act(async () => host.querySelector('button')!.click());
  expect(mocks.enter).toHaveBeenCalledWith(expect.objectContaining({
    sourceNodeId: 'node-real', targetSurface: 'workflow', targetWorkspace: expect.objectContaining({ id: 'a' }),
  }));
});

it('retry controls never double-open Reader while repairing a failed image', async () => {
  await mount('image');
  await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
  const retry = host.querySelector('button')!;
  expect(retry.textContent).toBe('重试');
  await act(async () => retry.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
  expect(useLcosShellStore.getState().windows).toHaveLength(0);
});

it('a workflow never enters a different scope or a workspace without a canvas', async () => {
  mocks.getWorkspaces.mockResolvedValue([
    { id: 'correct-missing-canvas', scopeId: 'entity-real', name: '真实但未就绪' },
    { id: 'unrelated-ready', scopeId: 'other-scope', canvasId: 'other-canvas', name: '别的集合' },
  ]);
  await mount('workflow');
  expect(mocks.getWorkspaces).toHaveBeenCalledWith('project-source');
  expect(host.querySelector('.lcos-workflow-collection-slot')?.getAttribute('aria-disabled')).toBe('true');
  expect(host.querySelector('button')).toBeNull();
  expect(host.textContent).toContain('现场尚未就绪');
  await act(async () => host.querySelector('[data-lcos-species-body]')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
  expect(mocks.enter).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain('别的集合');
});
