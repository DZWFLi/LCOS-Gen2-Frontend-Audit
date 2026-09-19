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

import { CoreCollaborationClient } from '@local-creative-os/web-gen2';
import { Boxes, CheckCheck, ChevronDown, ChevronRight, CircleHelp, GitFork, Info, Loader, Play, Plus, RefreshCw, User, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArtifactReturnSection } from './ArtifactReturnSection';
import {
  buildSelectedContextReferences,
  createContinuationOperationId,
  retainContinuationIntent,
  settleContinuationIntent,
  type ConversationContinuationAction,
  type ConversationContinuationIntent,
} from './conversationContinuationActions';
import { RecoverySection } from './RecoverySection';
import { WaitingInputSection } from './WaitingInputSection';
import { createLcosCoreSession } from '../app/lcosCoreClient';
import { useCollaborationSessionStore } from '../collaboration/collaborationSessionStore';
import { useCollaborationSession } from '../collaboration/useCollaborationSession';
import { LcosComposerHost } from '../composer/LcosComposerHost';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { LcosSurfaceFeedback } from '../ui/LcosSurfaceFeedback';
import { lcosTokens } from '../ui/lcosTokens';
import { ConversationEventView } from '../ui/professional/ConversationEventView';
import { ConversationIdentityView } from '../ui/professional/ConversationIdentityView';

import type { LcosComposerTarget } from '../shell/lcosShellStore';
import type { CollaborationDiagnosticsV1, CollaborationTimelineItemV1, CollaborationUserStateV1 } from '@local-creative-os/contracts';

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
  const [diagnostics, setDiagnostics] = useState<CollaborationDiagnosticsV1 | undefined>(undefined);
  const [diagnosticsState, setDiagnosticsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [continuationBusy, setContinuationBusy] = useState<ConversationContinuationAction | null>(null);
  const [continuationReceipt, setContinuationReceipt] = useState<string | null>(null);
  const [continuationError, setContinuationError] = useState<string | null>(null);
  const continuationIntents = useRef<Partial<Record<ConversationContinuationAction, ConversationContinuationIntent>>>({});
  const composerOpen = useLcosShellStore((s) => s.composerOpen);
  const composerTarget = useLcosShellStore((s) => s.composerTarget);
  const activeWorkspaceId = useLcosShellStore((s) => s.activeWorkspaceId);
  const openComposer = useLcosShellStore((s) => s.openComposer);
  const closeComposer = useLcosShellStore((s) => s.closeComposer);
  const openAssembly = useLcosShellStore((s) => s.openAssembly);
  const draftReferences = useLcosReferenceStore((s) => s.draft.orderedEntityRefs);

  // Gate 4：产品状态唯一来源 = Collaboration projection（SSE 驱动刷新）。
  const entry = useCollaborationSession(projectId, connectedConversationId ?? null);
  const projection = entry?.status === 'ready' ? entry.projection : undefined;
  const timeline = entry?.status === 'ready' ? entry.timeline ?? [] : [];
  const selectedContext = useMemo(() => buildSelectedContextReferences(draftReferences), [draftReferences]);
  const selectedContextBlockedReason = selectedContext.unsupportedEntityTypes.length > 0
    ? `当前草稿包含暂不支持的新会话引用：${selectedContext.unsupportedEntityTypes.join('、')}`
    : selectedContext.orderedReferences.length === 0
      ? '当前草稿还没有选中上下文'
      : undefined;

  const actionCapability: Readonly<Record<ConversationContinuationAction, keyof NonNullable<typeof projection>['capabilities']>> = {
    continue_existing: 'canResume',
    selected_context: 'canSelectedContext',
    blank_new: 'canBlankNew',
    native_full_fork: 'canFork',
  };
  const actionLabel: Readonly<Record<ConversationContinuationAction, string>> = {
    continue_existing: '继续现有会话',
    selected_context: '按选中上下文新建',
    blank_new: '新建空会话',
    native_full_fork: '原生完整分叉',
  };

  // B2：工程细节（Diagnostics）只经 readDiagnostics seam 读取，不再由 controller 拼装。
  const loadDiagnostics = useCallback((): void => {
    if (!connectedConversationId) return;
    setDiagnosticsState('loading');
    void collaboration
      .readDiagnostics(projectId, connectedConversationId)
      .then((value) => {
        setDiagnostics(value);
        setDiagnosticsState('ready');
      })
      .catch(() => setDiagnosticsState('error'));
  }, [collaboration, projectId, connectedConversationId]);

  useEffect(() => {
    loadDiagnostics();
  }, [loadDiagnostics]);

  if (!connectedConversationId) {
    return (
      <div className="flex min-h-[220px] items-center justify-center p-6">
        <LcosSurfaceFeedback presentation="empty" message="该 Glyth 尚未绑定 Core 会话（无 binding 不打开会话窗口）" />
      </div>
    );
  }

  const workComposerOpen = conversationComposerOwnsTarget(
    composerOpen,
    composerTarget,
    connectedConversationId,
  );

  const userState = projection?.userState;
  const hasPendingInput = projection?.activity.pendingInputId !== undefined;
  const hasPendingReview = projection?.recentReturns.some((row) => row.status === 'pending_review') ?? false;
  // B3：send 与 delegate 心智必须分开。当前 send fail-closed（无真实 transport）→
  // 不提供「继续这个会话（追加消息）」；Composer 明确是「交给它做（委托新任务）」。
  const canSend = projection?.capabilities.canSend === true;
  const sendReason = projection?.capabilityReasons?.canSend;

  const runContinuationAction = (action: ConversationContinuationAction): void => {
    if (continuationBusy !== null || projection === undefined || connectedConversationId === undefined) return;
    if (projection.capabilities[actionCapability[action]] !== true) return;
    if (action === 'selected_context' && selectedContextBlockedReason !== undefined) return;
    const intent = retainContinuationIntent(
      continuationIntents.current[action],
      action,
      `${projectId}:${connectedConversationId}`,
      () => createContinuationOperationId(action),
      action === 'selected_context' ? selectedContext.orderedReferences : undefined,
    );
    continuationIntents.current[action] = intent;
    setContinuationBusy(action);
    setContinuationReceipt(null);
    setContinuationError(null);
    const request = action === 'continue_existing'
      ? collaboration.resume(projectId, { operationId: intent.operationId, conversationId: connectedConversationId })
      : action === 'selected_context' || action === 'blank_new'
        ? collaboration.newSession(projectId, action, {
          operationId: intent.operationId,
          conversationId: connectedConversationId,
          ...(action === 'selected_context' ? { orderedReferences: intent.orderedReferences ?? [] } : {}),
        })
        : collaboration.fork(projectId, { operationId: intent.operationId, conversationId: connectedConversationId });
    void request
      .then((result) => {
        if (result.ok) {
          const settled = settleContinuationIntent(continuationIntents.current[action], action, intent.operationId, true);
          if (settled === undefined) delete continuationIntents.current[action];
          else continuationIntents.current[action] = settled;
          setContinuationReceipt(`${actionLabel[action]}已提交 · 操作 ${intent.operationId.slice(0, 14)}`);
          setDiagnosticsOpen(true);
          void useCollaborationSessionStore.getState().refresh(projectId, connectedConversationId);
          loadDiagnostics();
        } else {
          // Keep the same operation id: a timeout or unknown outcome must retry the same journal intent.
          setContinuationError(result.error.userMessage);
        }
      })
      .catch((error: unknown) => {
        setContinuationError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => setContinuationBusy(null));
  };

  const actionReason = (action: ConversationContinuationAction): string | undefined => {
    if (action === 'selected_context' && selectedContextBlockedReason !== undefined) return selectedContextBlockedReason;
    const reasonKey = actionCapability[action];
    return projection?.capabilityReasons?.[reasonKey];
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

      <section
        data-lcos-conversation-continuation
        className="flex flex-col gap-2 rounded-xl p-3"
        style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}
      >
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" style={{ color: lcosTokens.color.pinViolet }} aria-hidden />
          <h4 className="text-xs font-semibold" style={{ color: lcosTokens.color.text }}>续工</h4>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['continue_existing', 'selected_context', 'blank_new', 'native_full_fork'] as const).map((action) => {
            const capability = projection?.capabilities[actionCapability[action]] === true;
            const disabled = !capability || continuationBusy !== null || (action === 'selected_context' && selectedContextBlockedReason !== undefined);
            const reason = actionReason(action);
            return (
              <button
                key={action}
                type="button"
                data-lcos-continuation-action={action}
                disabled={disabled}
                title={disabled ? (reason ?? '能力尚未确认，暂不可用') : undefined}
                onClick={() => runContinuationAction(action)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-40"
                style={{ background: lcosTokens.color.inverse, color: lcosTokens.color.textOnInverse, minHeight: 30 }}
              >
                {action === 'native_full_fork' ? <GitFork className="h-3 w-3" aria-hidden /> : action === 'blank_new' || action === 'selected_context' ? <Plus className="h-3 w-3" aria-hidden /> : <RefreshCw className="h-3 w-3" aria-hidden />}
                {continuationBusy === action ? '提交中…' : actionLabel[action]}
              </button>
            );
          })}
        </div>
        {actionReason('selected_context') !== undefined && (
          <span data-lcos-continuation-reason="selected_context" className="text-[10px]" style={{ color: lcosTokens.color.muted }}>
            按选中上下文新建：{actionReason('selected_context')}
          </span>
        )}
        {actionReason('blank_new') !== undefined && projection?.capabilities.canBlankNew !== true && (
          <span data-lcos-continuation-reason="blank_new" className="text-[10px]" style={{ color: lcosTokens.color.muted }}>
            新建空会话：{actionReason('blank_new')}
          </span>
        )}
        {actionReason('native_full_fork') !== undefined && projection?.capabilities.canFork !== true && (
          <span data-lcos-continuation-reason="native_full_fork" className="text-[10px]" style={{ color: lcosTokens.color.muted }}>
            原生完整分叉：{actionReason('native_full_fork')}
          </span>
        )}
        {continuationReceipt !== null && (
          <span data-lcos-continuation-receipt className="text-xs" style={{ color: lcosTokens.color.accent }}>
            {continuationReceipt}；外部会话状态请查看下方诊断/恢复
          </span>
        )}
        {continuationError !== null && (
          <span data-lcos-continuation-error role="alert" className="text-xs" style={{ color: lcosTokens.color.danger }}>
            续工提交失败 · {continuationError}（可复用同一操作重试）
          </span>
        )}
      </section>

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

      {/* Composer（B3）：明确 Delegate 语义——「交给它做」创建 canonical Run，
          绝不伪装成原会话 continuation（send 未接通时 fail-closed）。 */}
      <section
        data-lcos-conversation-composer
        className="flex flex-col gap-2 rounded-xl p-3"
        style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold" style={{ color: lcosTokens.color.text }}>交给它做（委托新任务）</h4>
            <p className="mt-1 text-[10px]" style={{ color: lcosTokens.color.muted }}>
              以当前会话为上下文，创建 Run 交给执行器；与「直接追加消息」不同
            </p>
          </div>
          {!workComposerOpen && (
            <button
              type="button"
              data-lcos-open-work-composer
              onClick={() =>
                openComposer({
                  nodeId: `conversation:${connectedConversationId}`,
                  title: projection?.identity.title ?? '当前会话',
                  anchor: { x: 0, y: 0, width: 0, height: 0 },
                  ...(activeWorkspaceId === null ? {} : { workspaceId: activeWorkspaceId }),
                  receiverConversationId: connectedConversationId,
                })
              }
              className="rounded-full px-3 py-1.5 text-xs"
              style={{ background: lcosTokens.color.inverse, color: lcosTokens.color.textOnInverse }}
            >
              委托新任务
            </button>
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

      {/* Context View：relation 只读预览 */}
      {projection !== undefined && projection.relation.targetRefs.length > 0 && (
        <section
          data-lcos-conversation-context
          className="flex flex-col gap-1.5 rounded-xl p-3"
          style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}
        >
          <h4 className="text-xs font-semibold" style={{ color: lcosTokens.color.text }}>上下文引用</h4>
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
                  operations={diagnostics.operations}
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
