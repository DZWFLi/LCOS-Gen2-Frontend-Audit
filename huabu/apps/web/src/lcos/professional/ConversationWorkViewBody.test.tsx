import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const projection = {
  schemaVersion: 1,
  projectId: 'p-1',
  conversationId: 'c-1',
  identity: { title: 'Test conversation' },
  userState: 'ready',
  relation: { targetRefs: [] },
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

const resume = vi.fn();
const newSession = vi.fn();
const fork = vi.fn();
const readDiagnostics = vi.fn(async () => ({ operations: [] }));
const refresh = vi.fn(async () => undefined);

vi.mock('@local-creative-os/web-gen2', () => ({
  CoreCollaborationClient: class {
    resume = resume;
    newSession = newSession;
    fork = fork;
    readDiagnostics = readDiagnostics;
  },
}));

vi.mock('../app/lcosCoreClient', () => ({
  createLcosCoreSession: () => ({ http: {} }),
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
    activeWorkspaceId: null,
    openComposer: vi.fn(),
    closeComposer: vi.fn(),
    openAssembly: vi.fn(),
  }),
}));

vi.mock('../composer/LcosComposerHost', () => ({ LcosComposerHost: () => null }));
vi.mock('./ArtifactReturnSection', () => ({ ArtifactReturnSection: () => null }));
vi.mock('./RecoverySection', () => ({ RecoverySection: () => null }));
vi.mock('./WaitingInputSection', () => ({ WaitingInputSection: () => null }));
vi.mock('../ui/professional/ConversationEventView', () => ({ ConversationEventView: () => null }));
vi.mock('../ui/professional/ConversationIdentityView', () => ({ ConversationIdentityView: ({ children }: { children?: React.ReactNode }) => <div>{children}</div> }));
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
  resume.mockReset();
  newSession.mockReset();
  fork.mockReset();
  readDiagnostics.mockClear();
  refresh.mockClear();
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

describe('ConversationWorkViewBody continuation caller', () => {
  it('renders four projection-gated actions and keeps native fork disabled with its real reason', async () => {
    const container = await render();
    expect(container.querySelectorAll('[data-lcos-continuation-action]')).toHaveLength(4);
    const forkButton = container.querySelector<HTMLButtonElement>('[data-lcos-continuation-action="native_full_fork"]');
    expect(forkButton?.disabled).toBe(true);
    expect(forkButton?.title).toContain('native full-history fork');
  });

  it('reuses one operation id after an uncertain submit and rotates only after success', async () => {
    resume.mockResolvedValueOnce({ ok: false, error: { userMessage: '结果未知' } });
    resume.mockResolvedValueOnce({ ok: true, receipt: { command: 'resume', continuationOperationId: 'ignored' } });
    const container = await render();
    const button = container.querySelector<HTMLButtonElement>('[data-lcos-continuation-action="continue_existing"]');
    await act(async () => button?.click());
    expect(resume).toHaveBeenCalledTimes(1);
    await act(async () => button?.click());
    expect(resume).toHaveBeenCalledTimes(2);
    const first = resume.mock.calls[0]?.[1] as { operationId: string };
    const second = resume.mock.calls[1]?.[1] as { operationId: string };
    expect(first.operationId).toBeTruthy();
    expect(second.operationId).toBe(first.operationId);
    expect(container.querySelector('[data-lcos-continuation-receipt]')?.textContent).toContain('继续现有会话已提交');
  });

  it('keeps each uncertain action identity when the user switches modes and comes back', async () => {
    resume.mockResolvedValue({ ok: false, error: { userMessage: '结果未知' } });
    newSession.mockResolvedValue({ ok: false, error: { userMessage: '结果未知' } });
    const container = await render();
    const resumeButton = container.querySelector<HTMLButtonElement>('[data-lcos-continuation-action="continue_existing"]');
    const blankButton = container.querySelector<HTMLButtonElement>('[data-lcos-continuation-action="blank_new"]');

    await act(async () => resumeButton?.click());
    await act(async () => blankButton?.click());
    await act(async () => resumeButton?.click());

    const firstResume = resume.mock.calls[0]?.[1] as { operationId: string };
    const secondResume = resume.mock.calls[1]?.[1] as { operationId: string };
    const blank = newSession.mock.calls[0]?.[2] as { operationId: string };
    expect(secondResume.operationId).toBe(firstResume.operationId);
    expect(blank.operationId).not.toBe(firstResume.operationId);
  });
});
