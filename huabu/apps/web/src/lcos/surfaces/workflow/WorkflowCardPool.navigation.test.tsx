import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  enter: vi.fn(), onEntered: vi.fn(), skills: vi.fn(async () => Array.from({ length: 17 }, (_, i) => ({ id: `skill-${i}`, name: `Skill ${i}`, source: 'system' }))), browse: vi.fn(),
  items: [{ schemaVersion: 1, kind: 'workflow', title: '真实工作流', usageCount: 0, entityRef: { type: 'workflow', id: 'wf1' } }],
}));
vi.mock('@local-creative-os/web-gen2', () => ({ CoreAssemblyClient: class {} }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../../app/lcosCoreClient', () => ({ createLcosCoreSession: () => ({ http: {}, skills: { list: m.skills } }) }));
vi.mock('../../professional/useWarehouseBrowse', () => ({ useWarehouseBrowse: (...args: unknown[]) => { m.browse(...args); return { items: m.items, state: 'ready' }; } }));
vi.mock('../../navigation/childWorksiteNavigation', () => ({ beginChildWorksiteNavigation: m.enter }));
vi.mock('../../lcosReferenceState', () => ({
  useLcosReferenceStore: (selector: (state: object) => unknown) => selector({ draft: { orderedEntityRefs: [] } }),
}));
vi.mock('../../shell/lcosShellStore', () => ({
  useLcosShellStore: (selector: (state: object) => unknown) => selector({ activeWorkspaceId: 'source', openComposer: vi.fn(), openWindow: vi.fn() }),
}));
vi.mock('../../ui/workflow/WorkflowTaskCardView', () => ({
  WorkflowTaskCardView: ({ onEnter, onPreview, entryAvailable }: { onEnter: () => void; onPreview: () => void; entryAvailable: boolean }) => <div>
    <button data-preview onClick={onPreview}>预览</button><button data-enter disabled={!entryAvailable} onClick={onEnter}>进入</button>
  </div>,
}));

import { WorkflowCardPool } from './WorkflowCardPool';

import type { Workspace } from '@local-creative-os/domain';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: Root[] = [];
afterEach(() => { for (const root of roots.splice(0)) act(() => root.unmount()); document.body.replaceChildren(); vi.clearAllMocks(); });
async function mount(canvasId?: string) {
  const el = document.createElement('div'); document.body.append(el); const root = createRoot(el); roots.push(root);
  const target = { id: 'w1', scopeId: 'wf1', preferredSurface: 'workflow', ...(canvasId === undefined ? {} : { canvasId }) } as Workspace;
  await act(async () => root.render(<WorkflowCardPool projectId="p1" sourceSurface="workflow" sourceWasChild={false} workspaces={[target]} onEnterWorksite={m.onEntered} />));
  return el;
}
it('light preview does not close the hand; successful entry retracts it through its existing owner', async () => {
  m.enter.mockReturnValue(true); const el = await mount('child-canvas');
  await act(async () => el.querySelector<HTMLButtonElement>('[data-preview]')?.click());
  expect(m.onEntered).not.toHaveBeenCalled(); expect(m.enter).not.toHaveBeenCalled();
  await act(async () => el.querySelector<HTMLButtonElement>('[data-enter]')?.click());
  expect(m.enter).toHaveBeenCalledWith(expect.objectContaining({ targetWorkspace: expect.objectContaining({ id: 'w1', canvasId: 'child-canvas' }) }));
  expect(m.onEntered).toHaveBeenCalledTimes(1);
});
it('a navigation refusal keeps the hand and its failure feedback', async () => {
  m.enter.mockReturnValue(false); const el = await mount('child-canvas');
  await act(async () => el.querySelector<HTMLButtonElement>('[data-enter]')?.click());
  expect(m.onEntered).not.toHaveBeenCalled();
  expect(el.textContent).toContain('工作流现场暂时无法进入');
});
it('a missing real canvas never pretends to have entered or closes the hand', async () => {
  const el = await mount();
  expect(el.querySelector<HTMLButtonElement>('[data-enter]')?.disabled).toBe(true);
  await act(async () => el.querySelector<HTMLButtonElement>('[data-enter]')?.click());
  expect(m.enter).not.toHaveBeenCalled(); expect(m.onEntered).not.toHaveBeenCalled();
});

it('keeps the hand while a real entry promise is pending and on failed completion', async () => {
  let complete!: (value: boolean) => void;
  m.enter.mockImplementation(() => new Promise<boolean>(resolve => { complete = resolve; }));
  const el = await mount('child-canvas');
  await act(async () => el.querySelector<HTMLButtonElement>('[data-enter]')?.click());
  expect(m.onEntered).not.toHaveBeenCalled();
  await act(async () => complete(false));
  expect(m.onEntered).not.toHaveBeenCalled(); expect(el.textContent).toContain('工作流现场暂时无法进入');
});

it('does not request seventeen skills or let them turn one workflow into a large pool', async () => {
  const el = await mount('child-canvas');
  expect(m.skills).not.toHaveBeenCalled();
  expect(m.browse).toHaveBeenCalledWith(expect.anything(), 'p1', '', 'workflow');
  expect(el.querySelector('[data-card-layout]')?.getAttribute('data-card-layout')).toBe('hand');
  expect(el.querySelectorAll('[data-preview]')).toHaveLength(1);
  expect(el.querySelector('[data-lcos-card-lane="material"]')).toBeNull();
  expect(el.querySelector('[data-lcos-card-lane="receiver"]')).toBeNull();
});
