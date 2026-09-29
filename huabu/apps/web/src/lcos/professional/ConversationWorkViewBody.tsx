// ConversationWorkViewBody — Conversation Work View（Gate 4 conversation-first 结构）。
//
// 信息架构（收敛方案 V1 §13 + Batch B）：
//   Header（projection 身份 + 6 用户态 + capability）
//   → Timeline / Work Events（真实投影）
//   → inline WaitingInput / Review（needs_user 时才出现；B2 全部走产品 read）
//   → Composer（B3：Delegate 语义明确，send≠delegate；canSend=false 如实提示）
//   → Context View（relation 只读预览）
//   → Diagnostics（collapsed；identity/reach/operations 经 readDiagnostics seam，
//     不再由 controller / raw domain 各自拼）
//
// 状态唯一来源：Collaboration read projection（readSession/readTimeline + SSE invalidation）。
// B1：本组件不再访问 collaboration.conversations / .runs / .continuations。

import { CoreCollaborationClient, CoreConversationClient } from '@local-creative-os/web-gen2';
import { Boxes, CheckCheck, ChevronDown, ChevronRight, CircleHelp, GitFork, Info, Loader, Play, User, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArtifactReturnSection } from './ArtifactReturnSection';
import { RecoverySection } from './RecoverySection';
import { WaitingInputSection } from './WaitingInputSection';
import { createLcosCoreSession } from '../app/lcosCoreClient';
import { useCollaborationSessionStore } from '../collaboration/collaborationSessionStore';
import { useCollaborationSession } from '../collaboration/useCollaborationSession';
import { selectConfirmedSendOperation } from '../composer/confirmedConversationOperation';
import { LcosComposerHost } from '../composer/LcosComposerHost';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { LcosSurfaceFeedback } from '../ui/LcosSurfaceFeedback';
import { lcosTokens } from '../ui/lcosTokens';
import { ConversationEventView } from '../ui/professional/ConversationEventView';
import { ConversationIdentityView } from '../ui/professional/ConversationIdentityView';

import type { LcosComposerTarget } from '../shell/lcosShellStore';
import type { CollaborationDiagnosticsV1, CollaborationTimelineItemV1, CollaborationUserStateV1, ConversationIdentityChainV1, ConversationSessionV1 } from '@local-creative-os/contracts';

/**
 * Conversation owns only its own composer intents. An Assembly-originated
 * intent remains mounted by Assembly even when its receiver is this session.
 */
export function conversationComposerOwnsTarget(
  composerOpen: boolean,
  composerTarget: Pick<LcosComposerTarget, 'nodeId' | 'receiverConversationId'> | null,
  connectedConversationId: string | undefined,
): boolean {
  return composerOpen
    && composerTarget?.receiverConversationId === connectedConversationId
    && composerTarget?.nodeId.startsWith('assembly:') !== true;
}

export interface ConversationWorkViewBodyProps {
  readonly projectId: string;
  readonly connectedConversationId?: string;
}

const USER_STATE_LABEL: Readonly<Record<CollaborationUserStateV1, string>> = {
  ready: '可继续',
  thinking: '正在理解',
  working: '正在执行',
  needs_user: '等你回应',
  done: '本轮完成',
  unavailable: '暂时不可用',
};

const TIMELINE_KIND_META: Readonly<Record<CollaborationTimelineItemV1['kind'], { label: string; Icon: typeof Play }>> = {
  user_message: { label: '你', Icon: User },
  agent_message: { label: '协作者', Icon: User },
  work_started: { label: '开始执行', Icon: Play },
  progress: { label: '进行中', Icon: Loader },
  input_required: { label: '等你回答', Icon: CircleHelp },
  approval_required: { label: '需要审批', Icon: CircleHelp },
  result_returned: { label: '产出待复核', Icon: Info },
  result_adopted: { label: '产出已采纳', Icon: CheckCheck },
  error: { label: '执行失败', Icon: XCircle },
  recovered: { label: '已恢复', Icon: CheckCheck },
  system_note: { label: '系统提示', Icon: Info },
};

export function ConversationWorkViewBody({
  projectId,
  connectedConversationId,
}: ConversationWorkViewBodyProps): React.JSX.Element {
  const session = useMemo(() => createLcosCoreSession(), []);
  const collaboration = useMemo(() => new CoreCollaborationClient(session.http), [session]);
  const conversations = useMemo(() => new CoreConversationClient(session.http), [session]);
  const [diagnostics, setDiagnostics] = useState<CollaborationDiagnosticsV1 | undefined>(undefined);
  const [diagnosticsState, setDiagnosticsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [sessionLinkOpen, setSessionLinkOpen] = useState(false);
  const [sessionLinkState, setSessionLinkState] = useState<'idle' | 'loading' | 'ready' | 'error' | 'saving'>('idle');
  const [identityChain, setIdentityChain] = useState<ConversationIdentityChainV1 | undefined>();
  const [availableSessions, setAvailableSessions] = useState<ConversationSessionV1[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionLinkNotice, setSessionLinkNotice] = useState<string>();
  const [sessionLinkReadRevision, setSessionLinkReadRevision] = useState(0);
  const [manualImportOpen, setManualImportOpen] = useState(false);
  const [manualImportTitle, setManualImportTitle] = useState('');
  const [manualUserText, setManualUserText] = useState('');
  const [manualAssistantText, setManualAssistantText] = useState('');
  const [manualImportTarget, setManualImportTarget] = useState<{ workspaceId: string; scopeId: string }>();
  const diagnosticsRequest = useRef<AbortController | null>(null);
  const sessionLinkWriteRequest = useRef<AbortController | null>(null);
  const composerOpen = useLcosShellStore((s) => s.composerOpen);
  const composerTarget = useLcosShellStore((s) => s.composerTarget);
  const activeWorkspaceId = useLcosShellStore((s) => s.activeWorkspaceId);
  const openComposer = useLcosShellStore((s) => s.openComposer);
  const closeComposer = useLcosShellStore((s) => s.closeComposer);
  const openAssembly = useLcosShellStore((s) => s.openAssembly);

  // Gate 4：产品状态唯一来源 = Collaboration projection（SSE 驱动刷新）。
  const entry = useCollaborationSession(projectId, connectedConversationId ?? null);
  const projection = entry?.status === 'ready' ? entry.projection : undefined;
  const timeline = entry?.status === 'ready' ? entry.timeline ?? [] : [];
  // B2：工程细节（Diagnostics）只经 readDiagnostics seam 读取，不再由 controller 拼装。
  const loadDiagnostics = useCallback((): void => {
    diagnosticsRequest.current?.abort();
    if (!connectedConversationId) return;
    const controller = new AbortController();
    diagnosticsRequest.current = controller;
    setDiagnosticsState('loading');
    void collaboration
      .readDiagnostics(projectId, connectedConversationId, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setDiagnostics(value);
        setDiagnosticsState('ready');
      })
      .catch(() => { if (!controller.signal.aborted) setDiagnosticsState('error'); });
  }, [collaboration, projectId, connectedConversationId]);

  useEffect(() => {
    if (!sessionLinkOpen || !connectedConversationId) return;
    const controller = new AbortController();
    let cancelled = false;
    setSessionLinkState('loading');
    setSessionLinkNotice(undefined);
    setIdentityChain(undefined);
    setAvailableSessions([]);
    setSelectedSessionId('');
    void Promise.all([
      conversations.getIdentity(projectId, connectedConversationId, controller.signal),
      conversations.listSessions(projectId, controller.signal),
      session.projects.getWorkspaces(projectId, controller.signal),
    ]).then(([identity, sessions, workspaces]) => {
      if (cancelled) return;
      setIdentityChain(identity);
      setAvailableSessions(sessions);
      setSelectedSessionId(sessions.find((item) => item.status === 'ready')?.id ?? '');
      const workspace = activeWorkspaceId === null
        ? undefined
        : workspaces.find((item) => String(item.id) === activeWorkspaceId);
      setManualImportTarget(workspace === undefined ? undefined : {
        workspaceId: String(workspace.id),
        scopeId: String(workspace.scopeId),
      });
      setSessionLinkState('ready');
    }).catch((error: unknown) => {
      if (cancelled || controller.signal.aborted) return;
      setSessionLinkState('error');
      setSessionLinkNotice(error instanceof Error ? error.message : '资料会话读取失败');
    });
    return () => { cancelled = true; controller.abort(); };
  }, [sessionLinkOpen, conversations, session, projectId, connectedConversationId, activeWorkspaceId, sessionLinkReadRevision]);

  const linkSelectedSession = useCallback(async (): Promise<void> => {
    if (!connectedConversationId || !selectedSessionId || sessionLinkState !== 'ready') return;
    sessionLinkWriteRequest.current?.abort();
    const controller = new AbortController();
    sessionLinkWriteRequest.current = controller;
    setSessionLinkState('saving');
    setSessionLinkNotice(undefined);
    try {
      const identity = await conversations.linkSession(projectId, connectedConversationId, selectedSessionId, controller.signal);
      if (controller.signal.aborted) return;
      setIdentityChain(identity);
      setSessionLinkState('ready');
      setSessionLinkNotice(`已关联「${identity.conversationSession?.title ?? selectedSessionId}」`);
      void useCollaborationSessionStore.getState().refresh(projectId, connectedConversationId);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setSessionLinkState('ready');
      setSessionLinkNotice(error instanceof Error ? error.message : '关联失败，可重试');
    } finally {
      if (sessionLinkWriteRequest.current === controller) sessionLinkWriteRequest.current = null;
    }
  }, [conversations, projectId, connectedConversationId, selectedSessionId, sessionLinkState]);

  const importManualSession = useCallback(async (): Promise<void> => {
    if (!manualImportTarget || sessionLinkState !== 'ready') return;
    const entries = [
      ...(manualUserText.trim() ? [{ role: 'user' as const, contentText: manualUserText.trim() }] : []),
      ...(manualAssistantText.trim() ? [{ role: 'assistant' as const, contentText: manualAssistantText.trim() }] : []),
    ];
    if (entries.length === 0) {
      setSessionLinkNotice('至少填入一条真实消息，才能创建资料会话。');
      return;
    }
    sessionLinkWriteRequest.current?.abort();
    const controller = new AbortController();
    sessionLinkWriteRequest.current = controller;
    setSessionLinkState('saving');
    setSessionLinkNotice(undefined);
    try {
      const result = await conversations.importManual(projectId, {
        ...(manualImportTitle.trim() ? { title: manualImportTitle.trim() } : {}),
        scopeId: manualImportTarget.scopeId,
        workspaceId: manualImportTarget.workspaceId,
        entries,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setAvailableSessions((current) => [result.session, ...current.filter((item) => item.id !== result.session.id)]);
      setSelectedSessionId(result.session.id);
      setManualImportOpen(false);
      setSessionLinkState('ready');
      setSessionLinkNotice(`资料会话「${result.session.title}」已创建；确认后才会关联到当前 Glyth。`);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setSessionLinkState('ready');
      setSessionLinkNotice(error instanceof Error ? error.message : '资料会话创建失败，可重试');
    } finally {
      if (sessionLinkWriteRequest.current === controller) sessionLinkWriteRequest.current = null;
    }
  }, [conversations, projectId, manualImportTarget, manualImportTitle, manualUserText, manualAssistantText, sessionLinkState]);

  useEffect(() => () => sessionLinkWriteRequest.current?.abort(), [projectId, connectedConversationId]);

  useEffect(() => {
    setDiagnostics(undefined);
    setDiagnosticsOpen(false);
    loadDiagnostics();
    return () => diagnosticsRequest.current?.abort();
  }, [loadDiagnostics]);

  if (!connectedConversationId) {
    return (
      <div className="flex min-h-[220px] items-center justify-center p-6">
        <LcosSurfaceFeedback presentation="empty" message="该 Glyth 尚未绑定 Core 会话（无 binding 不打开会话窗口）" />
      </div>
    );
  }

  const userRecoveryOperations = diagnostics?.operations.filter((operation) =>
    operation.allowedActions.some(({ action }) => action !== 'cancel_request'),
  ) ?? [];

  const workComposerOpen = conversationComposerOwnsTarget(
    composerOpen,
    composerTarget,
    connectedConversationId,
  );

  const userState = projection?.userState;
  const hasPendingInput = projection?.activity.pendingInputId !== undefined;
  const hasPendingReview = projection?.recentReturns.some((row) => row.status === 'pending_review') ?? false;
  // B3：send 与 delegate 心智必须分开。send 只有在 projection capability
  // 与已确认 continuation operation 同时存在时才开放；否则只显示真实原因。
  const canSend = projection?.capabilities.canSend === true;
  const sendReason = projection?.capabilityReasons?.canSend;
  /**
   * A send button is only meaningful when the read projection can identify the
   * existing provider operation. `canSend` alone is a capability probe; it is
   * not a license to invent an operation id or silently create a Run.
   */
  const continuationOperation = selectConfirmedSendOperation(diagnostics, connectedConversationId);
  const canContinueCurrentConversation = canSend && continuationOperation !== undefined;
  const continueComposerReason = !canSend
    ? (sendReason ?? '当前协作方式暂不支持直接追加消息')
    : continuationOperation === undefined
      ? '当前会话还没有可续聊的已确认 continuation operation'
      : undefined;

  const callerOwnedMessageId = (): string => {
    const randomUuid = globalThis.crypto?.randomUUID;
    return randomUuid !== undefined
      ? randomUuid.call(globalThis.crypto)
      : `message-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  return (
    <div data-lcos-conversation-work-view className="lcos-conversation-body">
      {/* Header：projection 身份 + 用户态 + capability 驱动动作 */}
      <ConversationIdentityView
        title={projection?.identity.title ?? connectedConversationId}
        {...(projection?.identity.subtitle === undefined ? {} : { subtitle: projection.identity.subtitle })}
        stateLabel={userState === undefined ? '状态读取中…' : USER_STATE_LABEL[userState]}
        identity={<User className="h-3.5 w-3.5" />}
        actions={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-lcos-conversation-open-assembly
              aria-label="打开 Assembly"
              title="打开 Assembly（投放到当前会话）"
              onClick={() => openAssembly({ kind: 'conversation', id: connectedConversationId }, 'Assembly · 当前会话')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
            >
              <Boxes className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              type="button"
              data-lcos-link-imported-session
              aria-expanded={sessionLinkOpen}
              onClick={() => setSessionLinkOpen((open) => !open)}
              className="rounded-full px-2.5 py-1 text-[10px]"
              style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
            >
              {identityChain?.conversationSession ? '更换资料会话' : '关联资料会话'}
            </button>
          </div>
        }
      >
        {projection?.recovery !== undefined && projection.recovery.state !== 'none' && (
          <div className="text-[11px]" style={{ color: lcosTokens.color.pinAmber }}>
            {projection.recovery.userMessage ?? '需要恢复'}
          </div>
        )}
        {projection !== undefined && !canSend && (
          <div data-lcos-send-unavailable className="text-[10px]" style={{ color: lcosTokens.color.muted }}>
            {sendReason ?? '当前协作方式暂不支持直接追加消息'}
          </div>
        )}
      </ConversationIdentityView>

      {sessionLinkOpen && (
        <section data-lcos-session-link className="flex flex-col gap-2 rounded-xl p-3" style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}>
          <div className="text-xs" style={{ color: lcosTokens.color.text }}>
            {identityChain?.conversationSession
              ? <>当前关联：<strong>{identityChain.conversationSession.title}</strong></>
              : '当前 Glyth 尚未关联资料会话。选择项目中已有的导入会话；此操作会建立持久关联。'}
          </div>
          {sessionLinkState === 'loading' ? (
            <span className="text-[11px]" style={{ color: lcosTokens.color.muted }}>正在读取项目会话…</span>
          ) : sessionLinkState === 'error' ? (
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span style={{ color: lcosTokens.color.danger }}>{sessionLinkNotice ?? '会话读取失败'}</span>
              <button type="button" onClick={() => setSessionLinkReadRevision((revision) => revision + 1)} className="rounded-full px-2 py-1" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}>重试读取</button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="选择要关联的项目资料会话"
                data-lcos-session-link-select
                value={selectedSessionId}
                disabled={sessionLinkState === 'saving'}
                onChange={(event) => setSelectedSessionId(event.currentTarget.value)}
                className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-xs"
                style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
              >
                <option value="">选择已有资料会话…</option>
                {availableSessions.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.status !== 'ready'}>
                    {item.title}{item.status !== 'ready' ? ` · ${item.status}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                data-lcos-session-link-submit
                disabled={!selectedSessionId || sessionLinkState === 'saving' || identityChain?.conversationSession?.id === selectedSessionId}
                onClick={() => void linkSelectedSession()}
                className="rounded-full px-3 py-1.5 text-xs disabled:opacity-40"
                style={{ background: lcosTokens.color.pinViolet, color: lcosTokens.color.textOnInverse }}
              >{sessionLinkState === 'saving' ? '正在关联…' : '确认关联'}</button>
              {sessionLinkNotice && <span role="status" className="text-[11px]" style={{ color: lcosTokens.color.muted }}>{sessionLinkNotice}</span>}
              {sessionLinkState !== 'saving' && availableSessions.length === 0 && <span className="text-[11px]" style={{ color: lcosTokens.color.muted }}>项目中还没有可关联的资料会话。</span>}
            </div>
          )}
          <details open={manualImportOpen} onToggle={(event) => setManualImportOpen(event.currentTarget.open)} data-lcos-manual-session-import>
            <summary className="cursor-pointer text-[11px]" style={{ color: lcosTokens.color.muted }}>没有资料会话？手动导入一段对话</summary>
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-[10px]" style={{ color: lcosTokens.color.muted }}>
                内容保存到当前工作现场；创建后仍需单独确认关联。{manualImportTarget ? '' : '请先进入一个有效工作现场。'}
              </p>
              <input aria-label="资料会话标题" placeholder="标题（可选）" value={manualImportTitle} onChange={(event) => setManualImportTitle(event.currentTarget.value)} className="rounded-lg px-2 py-1.5 text-xs" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }} />
              <textarea aria-label="导入的用户消息" placeholder="用户消息（可留空）" value={manualUserText} onChange={(event) => setManualUserText(event.currentTarget.value)} rows={2} className="rounded-lg px-2 py-1.5 text-xs" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }} />
              <textarea aria-label="导入的协作者回复" placeholder="协作者回复（可留空）" value={manualAssistantText} onChange={(event) => setManualAssistantText(event.currentTarget.value)} rows={2} className="rounded-lg px-2 py-1.5 text-xs" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }} />
              <button type="button" data-lcos-manual-session-import-submit disabled={!manualImportTarget || sessionLinkState === 'saving'} onClick={() => void importManualSession()} className="self-start rounded-full px-3 py-1.5 text-xs disabled:opacity-40" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}>
                {sessionLinkState === 'saving' ? '正在创建…' : '创建资料会话'}
              </button>
            </div>
          </details>
        </section>
      )}

      {userRecoveryOperations.length > 0 && <section data-lcos-user-recovery aria-label="需要处理的恢复操作">
        <RecoverySection collaboration={collaboration} projectId={projectId} operations={userRecoveryOperations}
          onRefreshed={() => loadDiagnostics()} />
      </section>}

      {/* Timeline / Work Events */}
      <section className="flex flex-col gap-2" data-lcos-conversation-timeline>
        {entry === undefined || entry.status === 'loading' ? (
          <LcosSurfaceFeedback presentation="loading" message="读取会话进展…" />
        ) : timeline.length === 0 ? (
          <div className="rounded-xl px-3 py-2 text-xs" style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}`, color: lcosTokens.color.muted }}>
            还没有工作记录——委托一个新任务开始
          </div>
        ) : (
          timeline.map((item) => {
            const meta = TIMELINE_KIND_META[item.kind];
            return (
              <ConversationEventView
                key={item.itemId}
                kind={item.kind}
                title={item.title}
                {...(item.body === undefined ? {} : { body: item.body })}
                label={meta.label}
                presentation={item.kind === 'user_message' || item.kind === 'agent_message' ? 'message' : 'activity'}
                tone={item.kind === 'error' ? 'danger' : item.kind === 'input_required' ? 'attention' : 'neutral'}
                icon={
                  <meta.Icon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: item.kind === 'error' ? lcosTokens.color.danger : item.kind === 'input_required' ? lcosTokens.color.pinAmber : lcosTokens.color.muted }}
                    aria-hidden
                  />
                }
              />
            );
          })
        )}
      </section>

      {/* inline WaitingInput：needs_user / pendingInput 存在时才出现 */}
      {hasPendingInput && (
        <WaitingInputSection collaboration={collaboration} projectId={projectId} conversationId={connectedConversationId} />
      )}

      {/* inline Review：有待复核产出时才出现 */}
      {hasPendingReview && (
        <ArtifactReturnSection collaboration={collaboration} projectId={projectId} conversationId={connectedConversationId} />
      )}

      {/* Composer：同一只 Composer 承担两种明确 intent。
          delegate 创建 canonical Run；continue 只发回当前 continuation operation。 */}
      <section
        data-lcos-conversation-composer
        className="flex flex-col gap-2 rounded-xl p-3"
        style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold" style={{ color: lcosTokens.color.text }}>会话输入</h4>
            <p className="mt-1 text-[10px]" style={{ color: lcosTokens.color.muted }}>
              继续发送到当前协作者；也可以选择新建会话或委托独立任务
            </p>
          </div>
          {!workComposerOpen && (
            <div className="flex flex-wrap justify-end gap-1.5">
              <button
                type="button"
                data-lcos-open-continue-composer
                disabled={!canContinueCurrentConversation}
                title={!canContinueCurrentConversation ? continueComposerReason : undefined}
                onClick={() => {
                  if (!canContinueCurrentConversation || continuationOperation === undefined) return;
                  openComposer({
                    nodeId: `conversation:${connectedConversationId}`,
                    title: projection?.identity.title ?? '当前会话',
                    anchor: { x: 0, y: 0, width: 0, height: 0 },
                    intent: 'continue',
                    receiverConversationId: connectedConversationId,
                    continuationOperationId: continuationOperation.operationId,
                    messageId: callerOwnedMessageId(),
                  });
                }}
                className="rounded-full px-3 py-1.5 text-xs disabled:opacity-40"
                style={{ background: lcosTokens.color.pinViolet, color: lcosTokens.color.textOnInverse }}
              >
                继续当前会话
              </button>
              <button
                type="button"
                data-lcos-open-conversation-options
                onClick={() => openComposer({
                  nodeId: `conversation:${connectedConversationId}`,
                  title: projection?.identity.title ?? '当前会话',
                  anchor: { x: 0, y: 0, width: 0, height: 0 },
                  intent: 'continue',
                  receiverConversationId: connectedConversationId,
                  ...(continuationOperation === undefined ? {} : { continuationOperationId: continuationOperation.operationId }),
                  ...(continueComposerReason === undefined ? {} : { receiverBlockedReason: continueComposerReason }),
                  messageId: callerOwnedMessageId(),
                })}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
                style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
              >
                <GitFork className="h-3.5 w-3.5" aria-hidden />会话选项
              </button>
              <button
                type="button"
                data-lcos-open-work-composer
                onClick={() =>
                  openComposer({
                    nodeId: `conversation:${connectedConversationId}`,
                    title: projection?.identity.title ?? '当前会话',
                    anchor: { x: 0, y: 0, width: 0, height: 0 },
                    intent: 'delegate',
                    ...(activeWorkspaceId === null ? {} : { workspaceId: activeWorkspaceId }),
                    receiverConversationId: connectedConversationId,
                  })
                }
                className="rounded-full px-3 py-1.5 text-xs"
                style={{ background: lcosTokens.color.inverse, color: lcosTokens.color.textOnInverse }}
              >
                委托新任务
              </button>
            </div>
          )}
        </div>
        {workComposerOpen && composerTarget && (
          <LcosComposerHost
            projectId={projectId}
            {...(activeWorkspaceId === null ? {} : { workspaceId: activeWorkspaceId })}
            anchor={composerTarget.anchor}
            open
            inline
            onClose={closeComposer}
          />
        )}
      </section>

      {(projection?.relation.boundContext?.length ?? 0) > 0 && (
        <section data-lcos-conversation-bound-context className="flex flex-col gap-1.5 px-3 py-2">
          <h4 className="text-xs font-semibold" style={{ color: lcosTokens.color.text }}>会话上下文</h4>
          <div className="flex flex-wrap gap-1.5">
            {projection?.relation.boundContext?.map(({ entityRef, title }) => (
              <span key={`${entityRef.type}:${entityRef.id}:${entityRef.viewId ?? ''}`}
                title={title} className="max-w-full truncate rounded-full px-2 py-1 text-[11px]"
                style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}>{title}</span>
            ))}
          </div>
        </section>
      )}

      {/* Context View：relation 只读预览 */}
      {projection !== undefined && projection.relation.targetRefs.length > 0 && (
        <section
          data-lcos-conversation-context
          className="flex flex-col gap-1.5 rounded-xl p-3"
          style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}
        >
          <h4 className="text-xs font-semibold" style={{ color: lcosTokens.color.text }}>历史引用</h4>
          <div className="flex flex-wrap gap-1.5">
            {projection.relation.targetRefs.map((ref) => (
              <span key={ref} className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}>
                {ref}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Diagnostics：工程细节经 readDiagnostics seam（collapsed 默认） */}
      <section
        className="flex flex-col gap-2 rounded-xl p-3"
        style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}
      >
        <button
          type="button"
          data-lcos-diagnostics-toggle
          onClick={() => setDiagnosticsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-left text-xs font-semibold"
          style={{ color: lcosTokens.color.muted }}
        >
          {diagnosticsOpen ? <ChevronDown className="h-3.5 w-3.5" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
          诊断（工程细节）
        </button>
        {diagnosticsOpen && (
          <div data-lcos-diagnostics className="flex flex-col gap-2 pt-1">
            {diagnosticsState === 'loading' && (
              <span className="text-[10px]" style={{ color: lcosTokens.color.muted }}>读取工程状态…</span>
            )}
            {diagnosticsState === 'error' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: lcosTokens.color.danger }}>工程状态读取失败</span>
                <button type="button" onClick={loadDiagnostics} className="rounded-full px-2 py-1 text-[11px]" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}>
                  重试
                </button>
              </div>
            )}
            {diagnosticsState === 'ready' && diagnostics !== undefined && (
              <>
                <div className="text-[10px]" style={{ color: lcosTokens.color.muted }}>
                  会话已连接
                  {diagnostics.identity !== undefined ? ' · 身份链已读' : ''}
                  {diagnostics.reach !== undefined && 'connected' in (diagnostics.reach as object) ? ' · 可达已读' : ''}
                </div>
                <RecoverySection
                  collaboration={collaboration}
                  projectId={projectId}
                  operations={diagnostics.operations.filter((operation) => !userRecoveryOperations.includes(operation))}
                  onRefreshed={() => loadDiagnostics()}
                />
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
