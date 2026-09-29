import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { LcosRailway } from './LcosRailway';
import { resolveDropIntent } from '../drop/dropIntentResolver';
import { useLcosDropStore } from '../lcosDropState';

import type * as WebGen2 from '@local-creative-os/web-gen2';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const m = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn(), graph: vi.fn(), watch: vi.fn(), stop: vi.fn(),
  list: vi.fn(), binding: vi.fn(), invalidate: undefined as (() => void) | undefined,
  session: undefined as undefined | { status: string; projection: { userState: string } } }));
vi.mock('@local-creative-os/web-gen2', async (original) => ({ ...await original<typeof WebGen2>(),
  CoreRailwayClient: class { read = m.read; write = m.write; }, CoreProjectClient: class { getProjectGraph = m.graph; },
  CoreConversationClient: class { listConnectedConversations = m.list; getReceiverBinding = m.binding; } }));
vi.mock('../app/lcosCoreClient', () => ({ createLcosCoreSession: () => ({ http: {} }) }));
vi.mock('../collaboration/collaborationSessionStore', () => ({ useCollaborationSessionStore: (select: (s: unknown) => unknown) => select({ watchProjectChanges: m.watch }) }));
vi.mock('../collaboration/useCollaborationSession', () => ({ useCollaborationSession: () => m.session }));
vi.mock('../composer/LcosReceiverIdentity', () => ({ LcosReceiverIdentity: ({ conversationId }: { conversationId: string }) => <span data-test-glyth-avatar={conversationId} /> }));
vi.mock('../navigation/RailwayPeek', () => ({ RailwayPeek: () => <div>真实预览测试替身</div> }));
const roots: ReturnType<typeof createRoot>[] = [];
beforeEach(() => {
  m.session = undefined; m.list.mockResolvedValue([]); m.binding.mockResolvedValue({ activeReceiverId: null });
  m.watch.mockImplementation((_project, listener) => { m.invalidate = listener; return m.stop; });
});
afterEach(() => { for (const root of roots.splice(0)) act(() => root.unmount()); document.body.replaceChildren(); useLcosDropStore.getState().reset(); vi.resetAllMocks(); });
function canonicalRead(count: number) {
  let order = { projectId: 'p', version: 7, orderedRefs: Array.from({ length: count }, (_, i) => ({ kind: 'scene', viewId: String(i) })) };
  m.read.mockImplementation(async () => order);
  m.write.mockImplementation(async (input) => { order = { ...order, orderedRefs: input.orderedRefs, version: order.version + 1 }; return order; });
  m.graph.mockResolvedValue({ workspaces: order.orderedRefs.map((ref) => ({ id: ref.viewId, name: `现场${ref.viewId}`, scopeId: `s${ref.viewId}`, canvasId: `c${ref.viewId}` })),
    scopes: order.orderedRefs.map((ref) => ({ id: `s${ref.viewId}`, kind: 'scene' })) });
  return order;
}
async function mount(count: number) {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  await act(async () => root.render(<LcosRailway projectId="p" surfaceByWorkspace={new Map(Array.from({ length: count }, (_, i) => [String(i), 'main']))} activateDestination={() => {}} />));
  return host;
}
it('More exposes item-local Up/Down and writes canonical order using its current version', async () => {
  const order = canonicalRead(2); const host = await mount(2);
  await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-railway-item="scene:0"]')!.focus());
  await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-railway-action="more"]')!.click());
  expect(host.querySelector<HTMLButtonElement>('[data-lcos-railway-more-action="up"]')!.disabled).toBe(true);
  await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-railway-more-action="down"]')!.click());
  expect(m.write).toHaveBeenCalledExactlyOnceWith({ projectId: 'p', orderedRefs: [order.orderedRefs[1], order.orderedRefs[0]], expectedVersion: 7 });
  expect([...host.querySelectorAll('[data-lcos-railway-item]')].map((el) => el.getAttribute('data-lcos-railway-item'))).toEqual(['scene:1', 'scene:0']);
});
it('+N management can move an overflow destination into the primary chain with the same CAS owner', async () => {
  const order = canonicalRead(5); const host = await mount(5);
  await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-railway-overflow-trigger]')!.click());
  await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-railway-overflow-manage="scene:4"]')!.click());
  const menu = host.querySelector('[data-lcos-railway-overflow-menu]')!;
  expect(menu.querySelector<HTMLButtonElement>('[data-lcos-railway-more-action="down"]')!.disabled).toBe(true);
  await act(async () => menu.querySelector<HTMLButtonElement>('[data-lcos-railway-more-action="up"]')!.click());
  expect(m.write).toHaveBeenCalledWith({ projectId: 'p', expectedVersion: 7, orderedRefs: [...order.orderedRefs.slice(0, 3), order.orderedRefs[4], order.orderedRefs[3]] });
  expect(host.querySelector('[data-lcos-railway-item="scene:4"]')).not.toBeNull();
  expect(document.activeElement).toBe(host.querySelector('[data-lcos-railway-item="scene:4"]'));
  expect(host.querySelector('[data-lcos-railway-overflow-open="scene:3"]')).not.toBeNull();
});
it('project invalidation rereads canonical destinations and receiver binding without remounting', async () => {
  canonicalRead(1); const host = await mount(1); m.read.mockClear(); m.binding.mockClear();
  await act(async () => m.invalidate!());
  expect(m.read).toHaveBeenCalledTimes(1); expect(m.binding).toHaveBeenCalledTimes(1);
  expect(m.watch).toHaveBeenCalledTimes(1); expect(host.querySelector('[data-lcos-railway-item="scene:0"]')).not.toBeNull();
});
it('active receiver uses the shared Glyth identity and real Chinese collaboration state', async () => {
  canonicalRead(0); m.binding.mockResolvedValue({ activeReceiverId: 'conversation' });
  m.list.mockResolvedValue([{ id: 'conversation', label: '创意伙伴', runtime: { isConnected: true }, availability: { isAvailable: true } }]);
  m.session = { status: 'ready', projection: { userState: 'needs_user' } };
  const host = await mount(0);
  expect(host.querySelector('[data-test-glyth-avatar="conversation"]')).not.toBeNull();
  expect(host.querySelector('[data-lcos-railway-receiver]')?.getAttribute('aria-label')).toContain('等你回应');
  expect(host.querySelector('[data-lcos-railway-receiver-status]')?.getAttribute('data-user-state')).toBe('needs_user');
  const receiverTarget = useLcosDropStore.getState().targets().find((target) => target.targetId === 'railway-receiver:p:conversation');
  expect(receiverTarget?.semantic.kind).toBe('drop-exclusion');
  expect(resolveDropIntent({ kind: 'object', entityType: 'note', entityId: 'note-1' }, receiverTarget!).status).toBe('ineligible');
});

it('removes previous-project destinations and Receiver before the new project response arrives', async () => {
  canonicalRead(1);m.binding.mockResolvedValue({activeReceiverId:'old-receiver'});
  m.list.mockResolvedValue([{id:'old-receiver',label:'上个项目伙伴',runtime:{isConnected:true},availability:{isAvailable:true}}]);
  const host=await mount(1);expect(host.querySelector('[data-lcos-railway-item]')).not.toBeNull();
  m.read.mockImplementation(()=>new Promise(()=>{}));m.graph.mockImplementation(()=>new Promise(()=>{}));
  m.list.mockImplementation(()=>new Promise(()=>{}));m.binding.mockImplementation(()=>new Promise(()=>{}));
  const root=roots.at(-1);if(!root)throw new Error('Missing mounted Rail');
  await act(async()=>root.render(<LcosRailway projectId="next" surfaceByWorkspace={new Map()} activateDestination={()=>{}}/>));
  expect(host.querySelector('[data-lcos-railway-item]')).toBeNull();
  expect(host.querySelector('[data-lcos-railway-receiver]')).toBeNull();
});
