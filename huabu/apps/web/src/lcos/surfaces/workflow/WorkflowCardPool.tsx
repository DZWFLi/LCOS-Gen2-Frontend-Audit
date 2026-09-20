// WorkflowCardPool — Workflow/Skill 任务卡 + 独立材料引用/会话接收者 lanes。
// 只有 workflow/skill 使用 Figma TaskCard 物种；普通材料和 conversation 不任务卡化。
// 所有 lane 只引用 canonical identity，不复制正文或创建第二 truth。
// send/fork/handoff 仍由 Wave 8 负责；当前只走既有 Composer/Conversation Work View。


import { CoreAssemblyClient, HttpError } from '@local-creative-os/web-gen2';
import { MessageCircle, PlusCircle, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';


import { isWorkflowCardItem, isWorkflowMaterialItem, isWorkflowReceiverItem, workflowCardMeta } from './workflowCardSemantics';
import { createLcosCoreSession } from '../../app/lcosCoreClient';
import { useLcosReferenceStore } from '../../lcosReferenceState';
import { beginChildWorksiteNavigation } from '../../navigation/childWorksiteNavigation';
import { childSurfaceForItem, workspaceTargetsForItem } from '../../navigation/workspaceTargets';
import { sameEntityRef } from '../../referenceBridge';
import { useLcosShellStore } from '../../shell/lcosShellStore';
import { LcosSurfaceFeedback } from '../../ui/LcosSurfaceFeedback';
import { lcosTokens } from '../../ui/lcosTokens';
import { filterWorkflowTitles } from '../../ui/workflow/filterWorkflowTitles';
import { WorkflowTaskCardView, type WorkflowTaskCardVisualState } from '../../ui/workflow/WorkflowTaskCardView';

import type { LcosComposerTarget } from '../../shell/lcosShellStore';
import type { SkillCatalogEntryV1, WarehouseItemV1 } from '@local-creative-os/contracts';
import type { Workspace } from '@local-creative-os/domain';

export type WorkflowHandCardLane = 'task' | 'material' | 'receiver';

export interface WorkflowHandCard {
  readonly cardId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly title: string;
  readonly meta: string;
  readonly source: 'warehouse' | 'skill';
  readonly lane: WorkflowHandCardLane;
  readonly conversationReceiver: boolean;
  readonly previewUrl?: string;
  /** Exact canonical target identity from the Warehouse producer; never inferred from title/meta. */
  readonly workspaceTargetRef?: Pick<WarehouseItemV1, 'kind' | 'entityRef'>;
}

export type WorkflowCardEntryResolution =
  | {
      readonly status: 'ready';
      readonly reason: string;
      readonly targetSurface: 'workflow';
      readonly targetWorkspace: Workspace;
    }
  | {
      readonly status: 'unavailable';
      readonly reason: string;
      readonly code: 'skill_without_worksite' | 'target_missing' | 'target_ambiguous' | 'canvas_missing' | 'unsupported_target';
    };

export function toWorkflowHandCards(
  warehouse: readonly WarehouseItemV1[],
  skills: readonly SkillCatalogEntryV1[],
): readonly WorkflowHandCard[] {
  const workflowCards = warehouse.filter(isWorkflowCardItem).map((item): WorkflowHandCard => ({
    cardId: `${item.kind}:${item.entityRef.id}`,
    entityType: item.kind,
    entityId: item.entityRef.id,
    title: item.title,
    meta: workflowCardMeta(item),
    source: 'warehouse',
    lane: 'task',
    conversationReceiver: false,
    workspaceTargetRef: { kind: item.kind, entityRef: item.entityRef },
    ...(item.previewRef === undefined ? {} : { previewUrl: item.previewRef }),
  }));
  const materialCards = warehouse.filter(isWorkflowMaterialItem).map((item): WorkflowHandCard => ({
    cardId: `${item.kind}:${item.entityRef.id}`,
    entityType: item.kind,
    entityId: item.entityRef.id,
    title: item.title,
    meta: workflowCardMeta(item),
    source: 'warehouse',
    lane: 'material',
    conversationReceiver: false,
  }));
  const receiverCards = warehouse.filter(isWorkflowReceiverItem).map((item): WorkflowHandCard => ({
    cardId: `${item.kind}:${item.entityRef.id}`,
    entityType: item.kind,
    entityId: item.entityRef.id,
    title: item.title,
    meta: '会话 · 接收者',
    source: 'warehouse',
    lane: 'receiver',
    conversationReceiver: true,
  }));
  const skillCards = skills.map((skill): WorkflowHandCard => ({
    cardId: `skill:${skill.id}`,
    entityType: 'skill',
    entityId: skill.id,
    title: skill.name,
    meta: `技能 · ${skill.source}`,
    source: 'skill',
    lane: 'task',
    conversationReceiver: false,
  }));
  return [...workflowCards, ...skillCards, ...materialCards, ...receiverCards];
}

export function resolveWorkflowCardEntry(
  card: WorkflowHandCard,
  workspaces: readonly Workspace[],
): WorkflowCardEntryResolution {
  if (card.workspaceTargetRef === undefined) {
    return {
      status: 'unavailable',
      code: 'skill_without_worksite',
      reason: '这个技能没有独立工作现场；仍可用于当前会话',
    };
  }
  const targets = workspaceTargetsForItem(card.workspaceTargetRef, workspaces);
  if (targets.length === 0) {
    return {
      status: 'unavailable',
      code: 'target_missing',
      reason: '这个工作流还没有可进入的工作现场',
    };
  }
  if (targets.length > 1) {
    return {
      status: 'unavailable',
      code: 'target_ambiguous',
      reason: `这个工作流对应 ${targets.length} 个现场，暂时无法确定入口`,
    };
  }
  const targetWorkspace = targets[0];
  if (targetWorkspace === undefined) {
    return { status: 'unavailable', code: 'target_missing', reason: '这个工作流还没有可进入的工作现场' };
  }
  if (targetWorkspace.canvasId === undefined) {
    return {
      status: 'unavailable',
      code: 'canvas_missing',
      reason: '这个工作流现场还没有可用画布',
    };
  }
  const targetSurface = childSurfaceForItem(card.workspaceTargetRef, targetWorkspace);
  if (targetSurface !== 'workflow') {
    return {
      status: 'unavailable',
      code: 'unsupported_target',
      reason: '这个目标不是可进入的工作流现场',
    };
  }
  return {
    status: 'ready',
    reason: '双击卡片或按 Enter 进入工作流现场',
    targetSurface,
    targetWorkspace,
  };
}

export function workflowComposerTarget(
  card: WorkflowHandCard,
  activeWorkspaceId: string | null,
): LcosComposerTarget {
  return {
    nodeId: `${card.entityType}:${card.entityId}`,
    title: card.title,
    anchor: { x: 0, y: 0, width: 0, height: 0 },
    ...(activeWorkspaceId === null ? {} : { workspaceId: activeWorkspaceId }),
    ...(card.conversationReceiver
      ? { receiverConversationId: card.entityId }
      : { receiverBlockedReason: '已加入草稿；请先从卡池选择一个会话作为接收者' }),
  };
}

export interface WorkflowCardPoolProps {
  readonly projectId: string;
  readonly workspaces: readonly Workspace[];
  readonly sourceSurface: 'main' | 'workflow';
  readonly sourceWasChild: boolean;
}

export function WorkflowCardPool({ projectId, workspaces, sourceSurface, sourceWasChild }: WorkflowCardPoolProps): React.JSX.Element {
  const navigate = useNavigate();
  const session = useMemo(() => createLcosCoreSession(), []);
  const assembly = useMemo(() => new CoreAssemblyClient(session.http), [session]);
  const [cards, setCards] = useState<readonly WorkflowHandCard[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorDetail, setErrorDetail] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [skillErrorDetail, setSkillErrorDetail] = useState<string | undefined>(undefined);
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);
  const [previewDetail, setPreviewDetail] = useState<string | null>(null);
  // 草稿引用 = 真实 presentation state（Selection ≠ Reference）；用于卡面「草稿中」
  const draftRefs = useLcosReferenceStore((s) => s.draft.orderedEntityRefs);
  const activeWorkspaceId = useLcosShellStore((s) => s.activeWorkspaceId);
  const openComposer = useLcosShellStore((s) => s.openComposer);
  const openWindow = useLcosShellStore((s) => s.openWindow);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState('loading');
    setSkillErrorDetail(undefined);
    void Promise.allSettled([
      assembly.getWarehouse(projectId, controller.signal),
      session.skills.list(projectId, undefined, controller.signal),
    ]).then(([warehouseResult, skillResult]) => {
        if (!active || controller.signal.aborted) return;
        if (warehouseResult.status === 'rejected') throw warehouseResult.reason;
        const skills = skillResult.status === 'fulfilled' ? skillResult.value : [];
        if (skillResult.status === 'rejected') {
          setSkillErrorDetail(skillResult.reason instanceof Error ? skillResult.reason.message : String(skillResult.reason));
        }
        setCards(toWorkflowHandCards(warehouseResult.value.items, skills));
        setState('ready');
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setState('error');
        setErrorDetail(error instanceof HttpError ? error.message : String(error));
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [projectId, assembly, session]);

  const filtered = useMemo(() => filterWorkflowTitles(cards, query), [cards, query]);

  /**
   * 7 状态里生产可达的三种（其余 悬停/键盘焦点 由 CSS 表达；预览/已选目标 归属 R5）：
   * 草稿中 = 该实体已在 Composer 草稿；不可用 = 没有可引用的实体身份；其余为静息。
   */
  const cardState = (card: WorkflowHandCard): WorkflowTaskCardVisualState => {
    if (!card.entityId) return '不可用';
    if (previewCardId === card.cardId) return '预览';
    const ref = { entityType: card.entityType, entityId: card.entityId };
    return draftRefs.some((x) => sameEntityRef(x, ref)) ? '草稿中' : '静息';
  };

  const takeCard = (card: WorkflowHandCard): void => {
    useLcosReferenceStore.getState().addEntityToDraft({
      entityType: card.entityType,
      entityId: card.entityId,
      displayLabel: card.title,
    });
    // “用于当前会话”是独立显式动作。落入草稿后退出临时预览，
    // 让卡面回到真实「草稿中」状态；卡片激活本身从不调用这里。
    setPreviewCardId(null);
    setPreviewDetail(`${card.title}：已加入草稿，尚未发送`);
    openComposer(workflowComposerTarget(card, activeWorkspaceId));
  };

  const openConversation = (card: WorkflowHandCard): void => {
    if (!card.conversationReceiver) return;
    openWindow('conversation', `会话 · ${card.title}`, card.entityId);
  };

  const previewCard = (card: WorkflowHandCard, resolution: WorkflowCardEntryResolution): void => {
    setPreviewCardId(card.cardId);
    setPreviewDetail(`${card.title}：${resolution.reason}`);
  };

  const enterCard = (card: WorkflowHandCard, resolution: WorkflowCardEntryResolution): void => {
    previewCard(card, resolution);
    if (resolution.status !== 'ready') return;
    const entered = beginChildWorksiteNavigation({
      projectId,
      sourceSurface,
      ...(activeWorkspaceId === null ? {} : { sourceWorkspaceId: activeWorkspaceId }),
      sourceWasChild,
      targetSurface: resolution.targetSurface,
      targetWorkspace: resolution.targetWorkspace,
      navigate,
    });
    if (!entered) setPreviewDetail(`${card.title}：工作流现场暂时无法进入`);
  };

  return (
    <div data-lcos-workflow-pool className="lcos-workflow-hand-pool" data-has-search="true">
      <label className="lcos-workflow-hand-search">
        <Search size={18} aria-hidden />
        <input type="search" aria-label="搜索工作流" placeholder="搜索工作流" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="sr-only" role="status" aria-live="polite" data-lcos-workflow-preview-status>{previewDetail ?? ''}</div>
      {state === 'loading' && <div className="py-8"><LcosSurfaceFeedback presentation="loading" message="读取卡池…" /></div>}
      {state === 'error' && (
        <div className="py-8"><LcosSurfaceFeedback presentation="error" message={`卡池读取失败${errorDetail ? `（${errorDetail}）` : ''}`} /></div>
      )}
      {state === 'ready' && skillErrorDetail && (
        <div data-lcos-skill-unavailable className="rounded-lg px-3 py-2 text-[10px]" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.muted }}>
          技能卡暂不可用（Core skill producer 未就绪，材料卡仍可取用）
        </div>
      )}
      {state === 'ready' && filtered.length === 0 && (
        <div className="py-8">
          <LcosSurfaceFeedback presentation="empty" message={query.trim() ? '没有匹配项' : '还没有工作流卡片'} />
        </div>
      )}

      {state === 'ready' && filtered.length > 0 && (
        <div className="lcos-workflow-hand-cards">
          {(['task', 'material', 'receiver'] as const).map((lane) => {
            const laneCards = filtered.filter((card) => card.lane === lane);
            if (laneCards.length === 0) return null;
            const heading = lane === 'task' ? '工作流 / 技能任务' : lane === 'material' ? '材料引用' : '会话接收者';
            return (
              <section key={lane} data-lcos-card-lane={lane} className="space-y-2">
                <div className="px-1 text-[10px] font-semibold tracking-[0.14em]" style={{ color: lcosTokens.color.muted }}>{heading}</div>
                <div className={`lcos-workflow-card-lane-grid lcos-workflow-card-lane-grid--${lane}`}>
                  {laneCards.map((card) => {
                    if (card.lane === 'task') {
                      const entryResolution = resolveWorkflowCardEntry(card, workspaces);
                      const previewed = previewCardId === card.cardId;
                      return (
                        <WorkflowTaskCardView
                          key={card.cardId}
                          state={cardState(card)}
                          title={card.title || '未命名'}
                          summary={previewed ? entryResolution.reason : `${card.meta} · 取用后未发送`}
                          {...(card.previewUrl === undefined ? {} : { previewUrl: card.previewUrl })}
                          dataSource={card.source}
                          dataEntity={`${card.entityType}:${card.entityId}`}
                          legacyWorkflowKind={card.entityType}
                          entryHint={entryResolution.reason}
                          entryAvailable={entryResolution.status === 'ready'}
                          onPreview={() => previewCard(card, entryResolution)}
                          onEnter={() => enterCard(card, entryResolution)}
                          onUse={() => takeCard(card)}
                        />
                      );
                    }
                    if (card.lane === 'material') {
                      return (
                        <article
                          key={card.cardId}
                          data-lcos-reference-card
                          data-lcos-card-lane="material"
                          data-lcos-card-entity={`${card.entityType}:${card.entityId}`}
                          className="flex min-h-[112px] w-[224px] flex-col justify-between rounded-xl border p-3"
                          style={{ background: lcosTokens.color.raised, borderColor: lcosTokens.color.border, color: lcosTokens.color.text }}
                        >
                          <div className="space-y-1">
                            <div className="truncate text-xs font-semibold">{card.title || '未命名'}</div>
                            <div className="text-[10px] opacity-70">{card.meta} · 取用后未发送</div>
                            <div className="text-[10px] opacity-60">材料引用 · 需会话接收者</div>
                          </div>
                          <button
                            type="button"
                            data-lcos-material-take
                            data-lcos-card-source={card.source}
                            data-lcos-card-entity={`${card.entityType}:${card.entityId}`}
                            onClick={() => takeCard(card)}
                            className="mt-2 flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium"
                            style={{ color: lcosTokens.color.text }}
                            title="取用 → 加入 Composer 草稿（未发送）"
                          >
                            <PlusCircle className="h-3 w-3" aria-hidden /> 取用
                          </button>
                        </article>
                      );
                    }
                    return (
                      <article
                        key={card.cardId}
                        data-lcos-receiver-card
                        data-lcos-card-lane="receiver"
                        data-lcos-card-entity={`${card.entityType}:${card.entityId}`}
                        className="flex min-h-[112px] w-[224px] flex-col justify-between rounded-xl border p-3"
                        style={{ background: lcosTokens.color.raised, borderColor: lcosTokens.color.border, color: lcosTokens.color.text }}
                      >
                        <div className="space-y-1">
                          <div className="truncate text-xs font-semibold">{card.title || '未命名'}</div>
                          <div className="text-[10px] opacity-70">{card.meta}</div>
                          <div className="text-[10px] opacity-60">独立会话接收者 · 可打开 Work View</div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            data-lcos-receiver-take
                            data-lcos-card-source={card.source}
                            data-lcos-card-entity={`${card.entityType}:${card.entityId}`}
                            onClick={() => takeCard(card)}
                            className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium"
                            style={{ color: lcosTokens.color.text }}
                            title="设为 Composer 接收者"
                          >
                            <PlusCircle className="h-3 w-3" aria-hidden /> 设为接收者
                          </button>
                          <button
                            type="button"
                            data-lcos-card-open-conversation
                            onClick={() => openConversation(card)}
                            className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px]"
                            style={{ color: lcosTokens.color.muted }}
                            title="打开会话 Work View（Waiting/Review 从 Core 读取）"
                          >
                            <MessageCircle className="h-3 w-3" aria-hidden /> 打开会话
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
