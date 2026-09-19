// WorkflowCardPool — Workflow/Skill 任务卡 + 独立材料引用/会话接收者 lanes。
// 只有 workflow/skill 使用 Figma TaskCard 物种；普通材料和 conversation 不任务卡化。
// 所有 lane 只引用 canonical identity，不复制正文或创建第二 truth。
// send/fork/handoff 仍由 Wave 8 负责；当前只走既有 Composer/Conversation Work View。


import { CoreAssemblyClient, HttpError } from '@local-creative-os/web-gen2';
import { MessageCircle, PlusCircle, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';


import { isWorkflowCardItem, isWorkflowMaterialItem, isWorkflowReceiverItem, workflowCardMeta } from './workflowCardSemantics';
import { createLcosCoreSession } from '../../app/lcosCoreClient';
import { useLcosReferenceStore } from '../../lcosReferenceState';
import { sameEntityRef } from '../../referenceBridge';
import { useLcosShellStore } from '../../shell/lcosShellStore';
import { LcosSurfaceFeedback } from '../../ui/LcosSurfaceFeedback';
import { lcosTokens } from '../../ui/lcosTokens';
import { WorkflowTaskCardView, type WorkflowTaskCardVisualState } from '../../ui/workflow/WorkflowTaskCardView';

import type { LcosComposerTarget } from '../../shell/lcosShellStore';
import type { SkillCatalogEntryV1, WarehouseItemV1 } from '@local-creative-os/contracts';

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
}

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

export function WorkflowCardPool({ projectId }: { readonly projectId: string }): React.JSX.Element {
  const session = useMemo(() => createLcosCoreSession(), []);
  const assembly = useMemo(() => new CoreAssemblyClient(session.http), [session]);
  const [cards, setCards] = useState<readonly WorkflowHandCard[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorDetail, setErrorDetail] = useState<string | undefined>(undefined);
  const [skillErrorDetail, setSkillErrorDetail] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return cards;
    return cards.filter((card) => `${card.title} ${card.meta}`.toLowerCase().includes(q));
  }, [cards, query]);

  /**
   * 7 状态里生产可达的三种（其余 悬停/键盘焦点 由 CSS 表达；预览/已选目标 归属 R5）：
   * 草稿中 = 该实体已在 Composer 草稿；不可用 = 没有可引用的实体身份；其余为静息。
   */
  const cardState = (card: WorkflowHandCard): WorkflowTaskCardVisualState => {
    if (!card.entityId) return '不可用';
    const ref = { entityType: card.entityType, entityId: card.entityId };
    return draftRefs.some((x) => sameEntityRef(x, ref)) ? '草稿中' : '静息';
  };

  const takeCard = (card: WorkflowHandCard): void => {
    useLcosReferenceStore.getState().addEntityToDraft({
      entityType: card.entityType,
      entityId: card.entityId,
      displayLabel: card.title,
    });
    openComposer(workflowComposerTarget(card, activeWorkspaceId));
  };

  const openConversation = (card: WorkflowHandCard): void => {
    if (!card.conversationReceiver) return;
    openWindow('conversation', `会话 · ${card.title}`, card.entityId);
  };

  return (
    <div data-lcos-workflow-pool className="lcos-workflow-hand-pool">
      <div className="lcos-workflow-hand-search">
        <label className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2" style={{ background: lcosTokens.color.raised }}>
          <Search className="h-4 w-4 shrink-0" style={{ color: lcosTokens.color.muted }} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工作流、材料或技能"
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: lcosTokens.color.text }}
          />
        </label>
      </div>

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
          <LcosSurfaceFeedback presentation="empty" message={query ? '没有匹配项' : '还没有可取用的工作流、材料或技能'} />
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
                <div className="flex flex-wrap gap-3">
                  {laneCards.map((card) => {
                    if (card.lane === 'task') {
                      return (
                        <WorkflowTaskCardView
                          key={card.cardId}
                          state={cardState(card)}
                          title={card.title || '未命名'}
                          summary={`${card.meta} · 取用后未发送`}
                          {...(card.previewUrl === undefined ? {} : { previewUrl: card.previewUrl })}
                          dataSource={card.source}
                          dataEntity={`${card.entityType}:${card.entityId}`}
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
