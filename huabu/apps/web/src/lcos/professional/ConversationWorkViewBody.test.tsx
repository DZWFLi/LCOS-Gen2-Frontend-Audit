import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const projection = {
  schemaVersion: 1,
  projectId: 'p-1',
  conversationId: 'c-1',
  identity: { title: 'Test conversation' },
  userState: 'ready',
  relation: { targetRefs: [], boundContext: [{ entityRef: { type: 'artifact', id: 'brief', viewId: 'brief-view' }, title: '品牌材料' }] },
  activity: {},
  capabilities: {
    canSend: false,
    canDelegate: false,
    canResume: true,
    canFork: false,
    canSelectedContext: true,
    canBlankNew: true,
    canHandoff: false,
    canAnswerInput: false,
    canApprove: false,
    canCancel: false,
    canRecover: false,
    canOpenDiagnostics: true,
  },
  capabilityReasons: {
    canFork: 'native full-history fork 未接通',
    canSend: 'send transport 未接通',
  },
  recentReturns: [],
} as const;

const openComposer = vi.fn();
const resume = vi.fn();
const newSession = vi.fn();
const fork = vi.fn();
const readDiagnostics = vi.fn(async (..._args: unknown[]): Promise<{ operations: Record<string, unknown>[] }> => ({ operations: [] }));
const refresh = vi.fn(async () => undefined);
const getIdentity = vi.fn(async () => undefined);
const listSessions = vi.fn(async () => [] as { id: string; title: string; status: string }[]);
const linkSession = vi.fn(async () => ({ conversationSession: { id: 's-1', title: '会议纪要' } }));
const importManual = vi.fn(async () => ({ session: { id: 'manual-1', title: '现场记录', status: 'ready' } }));
const getWorkspaces = vi.fn(async () => [{ id: 'workspace-1', scopeId: 'scope-1' }]);

vi.mock('@local-creative-os/web-gen2', () => ({
  CoreCollaborationClient: class {
    resume = resume;
    newSession = newSession;
    fork = fork;
    readDiagnostics = readDiagnostics;
  },
  CoreConversationClient: class {
    getIdentity = getIdentity;
    listSessions = listSessions;
    linkSession = linkSession;
    importManual = importManual;
  },
}));

vi.mock('../app/lcosCoreClient', () => ({
  createLcosCoreSession: () => ({ http: {}, projects: { getWorkspaces } }),
}));

vi.mock('../collaboration/useCollaborationSession', () => ({
  useCollaborationSession: () => ({ status: 'ready', projection, timeline: [] }),
}));

vi.mock('../collaboration/collaborationSessionStore', () => ({
  useCollaborationSessionStore: Object.assign(() => undefined, { getState: () => ({ refresh }) }),
}));

vi.mock('../lcosReferenceState', () => ({
  useLcosReferenceStore: (selector: (state: { draft: { orderedEntityRefs: readonly { entityType: string; entityId: string }[] } }) => unknown) => selector({ draft: { orderedEntityRefs: [{ entityType: 'artifact', entityId: 'a-1' }] } }),
}));

vi.mock('../shell/lcosShellStore', () => ({
  useLcosShellStore: (selector: (state: Record<string, unknown>) => unknown) => selector({
    composerOpen: false,
    composerTarget: null,
    activeWorkspaceId: 'workspace-1',
    openComposer,
    closeComposer: vi.fn(),
    openAssembly: vi.fn(),
  }),
}));

vi.mock('../composer/LcosComposerHost', () => ({ LcosComposerHost: () => null }));
vi.mock('./ArtifactReturnSection', () => ({ ArtifactReturnSection: () => null }));
vi.mock('./RecoverySection', () => ({ RecoverySection: ({ operations }: { operations: { operationId: string }[] }) => <div data-recovery-operations>{operations.map((operation) => operation.operationId).join(',')}</div> }));
vi.mock('./WaitingInputSection', () => ({ WaitingInputSection: () => null }));
vi.mock('../ui/professional/ConversationEventView', () => ({ ConversationEventView: () => null }));
vi.mock('../ui/professional/ConversationIdentityView', () => ({ ConversationIdentityView: ({ children, actions }: { children?: React.ReactNode; actions?: React.ReactNode }) => <div>{actions}{children}</div> }));
vi.mock('../ui/LcosSurfaceFeedback', () => ({ LcosSurfaceFeedback: () => null }));

import { ConversationWorkViewBody } from './ConversationWorkViewBody';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let roots: Root[] = [];
let containers: HTMLElement[] = [];

afterEach(() => {
  for (const root of roots) act(() => root.unmount());
  for (const container of containers) container.remove();
  roots = [];
  containers = [];
  openComposer.mockClear();
  resume.mockReset();
  newSession.mockReset();
  fork.mockReset();
  readDiagnostics.mockClear();
  refresh.mockClear();
  getIdentity.mockReset().mockResolvedValue(undefined);
  listSessions.mockReset().mockResolvedValue([]);
  linkSession.mockReset().mockResolvedValue({ conversationSession: { id: 's-1', title: '会议纪要' } } as never);
  importManual.mockReset().mockResolvedValue({ session: { id: 'manual-1', title: '现场记录', status: 'ready' } } as never);
  getWorkspaces.mockReset().mockResolvedValue([{ id: 'workspace-1', scopeId: 'scope-1' }] as never);
  document.body.replaceChildren();
});

async function render(): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  containers.push(container);
  await act(async () => root.render(<ConversationWorkViewBody projectId="p-1" connectedConversationId="c-1" />));
  return container;
}

describe('ConversationWorkViewBody continuation entry', () => {
  it('keeps modes inside Composer and opens its options even when direct send is unavailable', async () => {
    const container = await render();
    expect(container.querySelectorAll('[data-lcos-continuation-action]')).toHaveLength(0);
    expect(container.querySelector<HTMLButtonElement>('[data-lcos-open-continue-composer]')?.disabled).toBe(true);
    const options = container.querySelector<HTMLButtonElement>('[data-lcos-open-conversation-options]');
    expect(options?.disabled).toBe(false);
    await act(async () => options?.click());
    expect(openComposer).toHaveBeenCalledWith(expect.objectContaining({
      intent: 'continue', receiverConversationId: 'c-1', receiverBlockedReason: 'send transport 未接通',
    }));
    expect(resume).not.toHaveBeenCalled();
    expect(newSession).not.toHaveBeenCalled();
    expect(fork).not.toHaveBeenCalled();
  });
});

it('keeps actionable recovery outside collapsed diagnostics and ignores a stale successful read', async () => {
  let finish!: (value: { operations: Record<string, unknown>[] }) => void;
  readDiagnostics.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
  readDiagnostics.mockResolvedValueOnce({ operations: [{ operationId: 'new-operation', allowedActions: [{ action: 'reconcile', requiresFreshRead: true }] }] });
  const container = await render();
  const root = roots.at(-1);
  if (root === undefined) throw new Error('missing root');
  await act(async () => root.render(<ConversationWorkViewBody projectId="p-1" connectedConversationId="c-2" />));
  expect((readDiagnostics.mock.calls.at(-2)?.[2] as AbortSignal).aborted).toBe(true);
  await act(async () => finish({ operations: [{ operationId: 'old-operation', allowedActions: [{ action: 'reconcile', requiresFreshRead: true }] }] }));
  expect(container.querySelector('[data-lcos-user-recovery]')?.textContent).toContain('new-operation');
  expect(container.textContent).not.toContain('old-operation');
  expect(container.querySelector('[data-lcos-diagnostics]')).toBeNull();
});


it('shows persisted context by title separately from one-message Composer references', async () => {
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(<ConversationWorkViewBody projectId="p-1" connectedConversationId="c-1" />));
  expect(host.querySelector('[data-lcos-conversation-bound-context]')?.textContent).toContain('品牌材料');
  expect(host.querySelector('[data-lcos-conversation-bound-context]')?.textContent).not.toContain('brief-view');
  await act(async () => root.unmount()); host.remove();
});

it('links only a user-selected existing project session and refreshes its conversation projection', async () => {
  listSessions.mockResolvedValueOnce([
    { id: 's-1', title: '会议纪要', status: 'ready' },
    { id: 's-2', title: '未完成导入', status: 'receiving' },
  ]);
  const host = await render();
  await act(async () => { await Promise.resolve(); });
  await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-link-imported-session]')?.click());
  await act(async () => { await Promise.resolve(); });
  const select = host.querySelector<HTMLSelectElement>('[data-lcos-session-link-select]');
  expect(select?.value).toBe('s-1');
  expect(select?.querySelector<HTMLOptionElement>('option[value="s-2"]')?.disabled).toBe(true);
  await act(async () => {
    host.querySelector<HTMLButtonElement>('[data-lcos-session-link-submit]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(linkSession).toHaveBeenCalledWith('p-1', 'c-1', 's-1', expect.any(AbortSignal));
  expect(refresh).toHaveBeenCalledWith('p-1', 'c-1');
  expect(host.querySelector('[data-lcos-session-link]')?.textContent).toContain('已关联「会议纪要」');
});

it('imports user-entered material into the active worksite before requiring a separate link confirmation', async () => {
  const host = await render();
  await act(async () => { await Promise.resolve(); });
  await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-link-imported-session]')?.click());
  await act(async () => { await Promise.resolve(); });
  const summary = host.querySelector<HTMLElement>('[data-lcos-manual-session-import] summary');
  await act(async () => summary?.click());
  const message = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="导入的用户消息"]');
  if (!message) throw new Error('missing manual import input');
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(message, '这是一段真实提供给导入器的用户材料。');
    message.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => {
    host.querySelector<HTMLButtonElement>('[data-lcos-manual-session-import-submit]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(importManual).toHaveBeenCalledWith('p-1', expect.objectContaining({
    scopeId: 'scope-1', workspaceId: 'workspace-1',
    entries: [{ role: 'user', contentText: '这是一段真实提供给导入器的用户材料。' }],
  }), expect.any(AbortSignal));
  expect(host.querySelector<HTMLSelectElement>('[data-lcos-session-link-select]')?.value).toBe('manual-1');
  expect(linkSession).not.toHaveBeenCalled();
  await act(async () => {
    host.querySelector<HTMLButtonElement>('[data-lcos-session-link-submit]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(linkSession).toHaveBeenCalledWith('p-1', 'c-1', 'manual-1', expect.any(AbortSignal));
});
