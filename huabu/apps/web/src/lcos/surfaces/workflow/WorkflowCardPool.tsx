// Workflow hand/pool presents workflow identities only; materials and receivers remain in Assembly/WorkView.
import { CoreAssemblyClient } from '@local-creative-os/web-gen2';
import { ArrowUpRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DropdownMenu, DropdownMenuItem } from '@/components/Common/DropdownMenu';
import { useCanvasAttentionStore } from '@/store/canvasAttentionStore';
import useCanvasStore from '@/store/canvasStore';


import { isWorkflowCardItem, workflowCardMeta } from './workflowCardSemantics';
import { createLcosCoreSession } from '../../app/lcosCoreClient';
import { useLcosReferenceStore } from '../../lcosReferenceState';
import { beginChildWorksiteNavigation } from '../../navigation/childWorksiteNavigation';
import { childSurfaceForItem, workspaceTargetsForItem } from '../../navigation/workspaceTargets';
import { useWarehouseBrowse } from '../../professional/useWarehouseBrowse';
import { sameEntityRef } from '../../referenceBridge';
import { useLcosShellStore } from '../../shell/lcosShellStore';
import { LcosSurfaceFeedback } from '../../ui/LcosSurfaceFeedback';
import { lcosTokens } from '../../ui/lcosTokens';
import { WorkflowTaskCardView, type WorkflowTaskCardVisualState } from '../../ui/workflow/WorkflowTaskCardView';

import type { LcosComposerTarget } from '../../shell/lcosShellStore';
import type { WarehouseItemV1 } from '@local-creative-os/contracts';
import type { Workspace } from '@local-creative-os/domain';
import type { WorkflowCardActionAnchor } from '../../ui/workflow/WorkflowTaskCardFace';

export type WorkflowHandCardLane = 'task';

export interface WorkflowHandCard {
  readonly cardId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly title: string;
  readonly meta: string;
  readonly source: 'warehouse';
  readonly lane: WorkflowHandCardLane;
  readonly conversationReceiver: false;
  readonly previewUrl?: string;
  readonly previewFacts: readonly string[];
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
      readonly code: 'target_missing' | 'target_ambiguous' | 'canvas_missing' | 'unsupported_target';
    };

export function toWorkflowHandCards(
  warehouse: readonly WarehouseItemV1[],
): readonly WorkflowHandCard[] {
  const workflowCards = warehouse.filter(isWorkflowCardItem).map((item): WorkflowHandCard => ({
    cardId: `${item.entityRef.type}:${item.entityRef.id}`,
    entityType: item.entityRef.type,
    entityId: item.entityRef.id,
    title: item.title,
    meta: workflowCardMeta(item),
    source: 'warehouse',
    lane: 'task',
    conversationReceiver: false,
    previewFacts: [
      item.provenance?.origin ? `来源：${({ 'run-return': '运行结果', import: '导入', capture: '采集', unknown: '未注明' } as const)[item.provenance.origin]}` : undefined,
      item.usageCount > 0 ? `项目内已使用 ${item.usageCount} 次` : undefined,
      item.updatedAt ? `最近更新：${item.updatedAt}` : undefined,
      item.relationHint && item.relationHint.neighborCount > 0 ? `关联 ${item.relationHint.neighborCount} 项` : undefined,
    ].filter((fact): fact is string => fact !== undefined),
    workspaceTargetRef: { kind: item.kind, entityRef: item.entityRef },
    ...(item.previewRef === undefined ? {} : { previewUrl: item.previewRef }),
  }));
  return workflowCards;
}

export function resolveWorkflowCardEntry(
  card: WorkflowHandCard,
  workspaces: readonly Workspace[],
): WorkflowCardEntryResolution {
  if (card.workspaceTargetRef === undefined) {
    return {
      status: 'unavailable',
      code: 'target_missing',
      reason: '这个工作流还没有明确工作现场；仍可用于当前会话',
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
      reason: `这个工作流对应 ${targets.length} 个现场，请选择要进入的现场`,
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
  anchor: WorkflowCardActionAnchor,
  currentReceiverConversationId?: string,
): LcosComposerTarget {
  return {
    nodeId: `${card.entityType}:${card.entityId}`,
    title: card.title,
    anchor,
    ...(activeWorkspaceId === null ? {} : { workspaceId: activeWorkspaceId }),
    ...(currentReceiverConversationId
      ? { receiverConversationId: currentReceiverConversationId }
      : { receiverBlockedReason: '已加入草稿；请先在 Glyth 或会话入口选择接收者' }),
  };
}

export interface WorkflowCardPoolProps {
  readonly projectId: string;
  readonly workspaces: readonly Workspace[];
  readonly sourceSurface: 'main' | 'workflow';
  readonly sourceWasChild: boolean;
  readonly onEnterWorksite?: () => void;
}

export function WorkflowCardPool({ projectId, workspaces, sourceSurface, sourceWasChild, onEnterWorksite }: WorkflowCardPoolProps): React.JSX.Element {
  const navigate = useNavigate();
  const session = useMemo(() => createLcosCoreSession(), []);
  const assembly = useMemo(() => new CoreAssemblyClient(session.http), [session]);
  const [query, setQuery] = useState('');
  const warehouse = useWarehouseBrowse(assembly, projectId, query, 'workflow');
  const { state, error: errorDetail } = warehouse;
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);
  const [previewDetail, setPreviewDetail] = useState<string | null>(null);
  // 草稿引用 = 真实 presentation state（Selection ≠ Reference）；用于卡面「草稿中」
  const draftRefs = useLcosReferenceStore((s) => s.draft.orderedEntityRefs);
  const activeWorkspaceId = useLcosShellStore((s) => s.activeWorkspaceId);
  const openComposer = useLcosShellStore((s) => s.openComposer);
  const rfInstance = useCanvasStore((s) => s.rfInstance);
  const filtered = useMemo(() => toWorkflowHandCards(warehouse.items), [warehouse.items]);

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

  const takeCard = (card: WorkflowHandCard, anchor: WorkflowCardActionAnchor): void => {
    useLcosReferenceStore.getState().addEntityToDraft({
      entityType: card.entityType,
      entityId: card.entityId,
      displayLabel: card.title,
    });
    // “用于当前会话”是独立显式动作。落入草稿后退出临时预览，
    // 让卡面回到真实「草稿中」状态；卡片激活本身从不调用这里。
    setPreviewCardId(null);
    setPreviewDetail(`${card.title}：已加入草稿，尚未发送`);
    // Workflow hand controls sit outside React Flow's canvas root. Their
    // explicit "use" action is still a canvas-scoped Composer intent, so
    // restore the existing attention owner before its popover evaluates visibility.
    useCanvasAttentionStore.getState().setCanvasEngaged(true);
    const target = workflowComposerTarget(card, activeWorkspaceId, {
      ...(() => {
        const topLeft = rfInstance?.screenToFlowPosition({ x: anchor.x, y: anchor.y });
        const bottomRight = rfInstance?.screenToFlowPosition({ x: anchor.x + anchor.width, y: anchor.y + anchor.height });
        if (topLeft === undefined || bottomRight === undefined) return anchor;
        return {
          x: topLeft.x,
          y: topLeft.y,
          width: bottomRight.x - topLeft.x,
          height: bottomRight.y - topLeft.y,
        };
      })(),
    }, useLcosShellStore.getState().composerTarget?.receiverConversationId);
    openComposer(target);
  };

  const previewCard = (card: WorkflowHandCard, resolution: WorkflowCardEntryResolution): void => {
    setPreviewCardId(card.cardId);
    setPreviewDetail(`${card.title}：${resolution.reason}`);
  };

  const enterCard = async (card: WorkflowHandCard, resolution: WorkflowCardEntryResolution): Promise<void> => {
    previewCard(card, resolution);
    if (resolution.status !== 'ready') return;
    const entered = await beginChildWorksiteNavigation({
      projectId,
      sourceSurface,
      ...(activeWorkspaceId === null ? {} : { sourceWorkspaceId: activeWorkspaceId }),
      sourceWasChild,
      targetSurface: resolution.targetSurface,
      targetWorkspace: resolution.targetWorkspace,
      navigate,
    });
    if (entered) onEnterWorksite?.();
    else setPreviewDetail(`${card.title}：工作流现场暂时无法进入`);
  };

  return (
    <div data-lcos-workflow-pool className="lcos-workflow-hand-pool" data-has-search="true">
      <label className="lcos-workflow-hand-search">
        <Search size={18} aria-hidden />
        <input type="search" aria-label="搜索工作流" placeholder="搜索工作流" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="sr-only" role="status" aria-live="polite" data-lcos-workflow-preview-status>{previewDetail ?? ''}</div>
      {state === 'loading' && <div className={filtered.length === 0 ? 'py-8' : 'sr-only'}><LcosSurfaceFeedback presentation="loading" message="读取卡池…" /></div>}
      {state === 'error' && (
        <div className="py-8"><LcosSurfaceFeedback presentation="error" message={`卡池读取失败${errorDetail ? `（${errorDetail}）` : ''}`} onAction={warehouse.retry} actionLabel="重试" /></div>
      )}
      {state === 'ready' && filtered.length === 0 && (
        <div className="py-8">
          <LcosSurfaceFeedback presentation="empty" message={query.trim() ? '没有匹配项' : '还没有工作流卡片'} />
        </div>
      )}

      {filtered.length > 0 && (
        <div className="lcos-workflow-hand-cards">
          <section data-lcos-card-lane="task" className="space-y-2">
            <div className="px-1 text-[10px] font-semibold tracking-[0.14em]" style={{ color: lcosTokens.color.muted }}>工作流</div>
            <div className="lcos-workflow-card-lane-grid lcos-workflow-card-lane-grid--task" data-card-layout={query.trim() || filtered.length >= 6 ? 'pool' : 'hand'}>
              {filtered.map((card) => {
                const entryResolution = resolveWorkflowCardEntry(card, workspaces);
                const previewed = previewCardId === card.cardId;
                const entryChoices = card.workspaceTargetRef === undefined ? [] : workspaceTargetsForItem(card.workspaceTargetRef, workspaces);
                const entryControl = entryChoices.length > 1 ? <DropdownMenu trigger={
                  <button type="button" className="lcos-workflow-preview-action"><ArrowUpRight size={16} aria-hidden />选择工作流现场</button>
                }>{entryChoices.map((workspace) => {
                  const target = resolveWorkflowCardEntry(card, [workspace]);
                  return <DropdownMenuItem key={String(workspace.id)} disabled={target.status !== 'ready'} title={target.reason} onClick={() => enterCard(card, target)}>
                    {workspace.name}{target.status === 'ready' ? '' : ' · 当前不可用'}
                  </DropdownMenuItem>;
                })}</DropdownMenu> : undefined;
                      return (
                        <WorkflowTaskCardView
                          key={card.cardId}
                          state={cardState(card)}
                          title={card.title || '未命名'}
                          summary={previewed ? entryResolution.reason : `${card.meta} · 取用后未发送`}
                          previewFacts={card.previewFacts}
                          {...(card.previewUrl === undefined ? {} : { previewUrl: card.previewUrl })}
                          dataSource={card.source}
                          dataEntity={`${card.entityType}:${card.entityId}`}
                          legacyWorkflowKind={card.workspaceTargetRef?.kind}
                          entryHint={entryResolution.reason}
                          entryAvailable={entryResolution.status === 'ready'}
                          {...(entryControl === undefined ? {} : { entryControl })}
                          onPreview={() => previewCard(card, entryResolution)}
                          onClosePreview={() => { setPreviewCardId(null); setPreviewDetail(null); }}
                          onEnter={() => enterCard(card, entryResolution)}
                          onUse={(anchor) => takeCard(card, anchor)}
                        />
                      );
              })}
            </div>
          </section>
        </div>
      )}
      {warehouse.nextCursor !== undefined && <button type="button" className="lcos-workflow-load-more" disabled={state === 'loading'} onClick={warehouse.loadMore}>继续读取卡池</button>}
    </div>
  );
}
