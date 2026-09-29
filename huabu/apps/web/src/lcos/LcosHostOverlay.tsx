// LcosHostOverlay — 唯一的 LCOS 画布级 overlay 容器（Phase A07）。
//
// 禁止 node Christmas tree（F-L0 §2）：任何画布浮层不再由各 renderer 自由
// 绝对定位。composer / drop-preview 等画布级浮层一律收进本容器，由
// interaction/overlayArbitration 的纯函数 visibleOverlays 裁决当前应显示哪
// 一些，并按统一 overlayLayers 分级 z-index 渲染。
//
// 仲裁输入从各 store 采集（拖拽保留已打开 Composer 接收面与 drop-preview），
// 仲裁结果决定挂载哪些子浮层。Composer 只有显式 selection-local open intent
// 才挂载；后续拖拽保留真实接收面，草稿仍留在既有 ephemeral store。

import {
  CoreAssemblyClient,
  visibleOverlays,
} from '@local-creative-os/web-gen2';
import React from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { toast } from '@/components/Common/Toast';
import useCanvasStore from '@/store/canvasStore';

import { createLcosCoreSession } from './app/lcosCoreClient';
import { useCollaborationSessionStore } from './collaboration/collaborationSessionStore';
import { composerHasVisibleWindowOwner } from './composer/composerPresentationOwner';
import { LcosComposerHost } from './composer/LcosComposerHost';
import { DropCommitRouter } from './drop/dropCommitRouter';
import { collectionExpansionGeometry } from './nodes/collectionExpandLayout';
import { rectFromDomRect } from './drop/dropTargetRegistry';
import { LcosDropReceipt } from './drop/LcosDropReceipt';
import { useLcosHostStore } from './host/lcosHostState';
import { LcosDropPreview } from './LcosDropPreview';
import { useProfessionalViewport, visibleWindowIdsForStage } from './professional/professionalStageVisibility';
import { useLcosDropStore } from './lcosDropState';
import { advanceDropAtScreenPoint } from './lcosRecognizers';
import { useLcosReferenceStore } from './lcosReferenceState';
import { useLcosShellStore } from './shell/lcosShellStore';
import { TemporalPreviewOutlines } from './surfaces/context/TemporalPreviewOutlines';
import {
  importWorkflowArchiveDrop,
  resolveWorkflowArchiveDrop,
} from './surfaces/workflow/workflowArchiveDrop';

import type {
  DropAssemblyApplyIntent,
  DropComposerReferenceIntent,
  DropCollectionMembershipIntent,
  DropTargetRegistration,
} from './drop/dropTypes';
import type { AssemblyApplyResultV1 } from '@local-creative-os/contracts';

const has = (kinds: readonly string[], kind: string): boolean =>
  kinds.includes(kind);

export const LcosHostOverlay: React.FC = () => {
  const dropStatus = useLcosDropStore((s) => s.state.status);
  const dropState = useLcosDropStore((s) => s.state);
  const dropResolution = useLcosDropStore((s) => s.resolution);
  const registerTarget = useLcosDropStore((s) => s.registerTarget);
  const unregisterTarget = useLcosDropStore((s) => s.unregisterTarget);
  // 真实 selection（审计 §7：仲裁输入必须来自真实 store，不硬编码 false）。
  // resize/hover 相位是 NodeWrapper 局部 owner（overlayInteractionPriority 已反映），
  // 不在此重复订阅；actionArc/workView 待 B 阶段接 surface store。
  const hasSelection = useCanvasStore((state) =>
    state.nodes.some((node) => node.selected === true),
  );
  const isNodeDragging = useCanvasStore((state) =>
    state.nodes.some((node) => node.dragging === true),
  );
  const projectId = useLcosShellStore((state) => state.projectId);
  const activeSurface = useLcosShellStore((state) => state.activeSurface);
  const activeWorkspaceId = useLcosShellStore((state) => state.activeWorkspaceId);
  const host = useLcosHostStore((state) => state.host);
  const composerOpen = useLcosShellStore((state) => state.composerOpen);
  const composerTarget = useLcosShellStore((state) => state.composerTarget);
  const windows = useLcosShellStore((state) => state.windows);
  const windowRegions = useLcosShellStore((state) => state.windowRegions);
  const closeComposer = useLcosShellStore((state) => state.closeComposer);
  const canvasId = useCanvasStore((state) => state.canvasId);
  const canvasWrapper = useCanvasStore((state) => state.canvasWrapper);
  const rfInstance = useCanvasStore((state) => state.rfInstance);
  const session = useMemo(() => createLcosCoreSession(), []);
  const assembly = useMemo(() => new CoreAssemblyClient(session.http), [session]);
  const commitRouterRef = useRef<DropCommitRouter | null>(null);
  if (commitRouterRef.current === null) {
    commitRouterRef.current = new DropCommitRouter();
  }

  const feedbackProjectRef = useRef(projectId);
  useEffect(() => {
    if (feedbackProjectRef.current === projectId) return;
    feedbackProjectRef.current = projectId;
    // A gesture/receipt belongs to its original project, never the next route.
    useLcosDropStore.getState().cancel();
    commitRouterRef.current?.clear();
  }, [projectId]);

  // Native HTML5 drag sources emit dragover rather than pointermove while the
  // payload is held. Feed that event into the same resolver path as the
  // pointer-router observer and prevent the browser's default file-drop page
  // navigation only while an LCOS payload is active.
  useEffect(() => {
    const onDragOver = (event: DragEvent): void => {
      const status = useLcosDropStore.getState().state.status;
      if (
        (status !== 'tracking' && status !== 'dwell' && status !== 'preview') ||
        canvasWrapper === null ||
        rfInstance === null
      ) return;
      event.preventDefault();
      advanceDropAtScreenPoint(event, { wrapper: canvasWrapper, instance: rfInstance });
    };
    window.addEventListener('dragover', onDragOver);
    return () => window.removeEventListener('dragover', onDragOver);
  }, [canvasWrapper, rfInstance]);

  // Portable Workflow archives need their Blob bytes, while the spatial-drop
  // payload intentionally carries only file metadata. Capture this one native
  // file gesture at the LCOS host boundary and route it straight to the
  // canonical Core producer. No second store/card and no client-side ZIP parse.
  useEffect(() => {
    const onDrop = (event: DragEvent): void => {
      if (activeSurface !== 'main' && activeSurface !== 'workflow') return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const isReachableSurface = activeSurface === 'workflow'
        ? target.closest('[data-lcos-workflow-worksite]') !== null
        : target.closest('[data-canvas-root]') !== null;
      if (!isReachableSurface) return;

      const files = event.dataTransfer?.files;
      if (files === undefined || files.length === 0) return;
      const resolution = resolveWorkflowArchiveDrop(files);
      if (resolution.status === 'ignored') return;

      // Consume before any async work so the stock Canvas onDrop cannot turn
      // a failed Workflow import into an unrelated Huabu file node.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (resolution.status === 'rejected') {
        toast(resolution.reason, { tone: 'danger' });
        return;
      }
      if (host === null) {
        toast('工作流导入尚未就绪，请等待项目现场完成连接。', { tone: 'danger' });
        return;
      }

      void importWorkflowArchiveDrop(resolution, host).then((outcome) => {
        if (outcome.status === 'failed') {
          toast(`工作流导入失败：${outcome.reason}`, { tone: 'danger' });
          return;
        }
        toast(
          outcome.receipt.created
            ? '工作流已加入 Main 与 Assembly'
            : '这个工作流已在项目中，已定位到现有定义',
          { tone: 'success' },
        );
      });
    };

    window.addEventListener('drop', onDrop, true);
    return () => window.removeEventListener('drop', onDrop, true);
  }, [activeSurface, host]);

  // Canvas is a live target, not a hard-coded edge destination. Its semantic
  // target is derived from the active Core/Huabu identity; its rect is only
  // ephemeral geometry used for hit testing during the current gesture.
  useEffect(() => {
    if (projectId === null || canvasId === null || canvasWrapper === null) return;
    const targetId = [
      'canvas',
      projectId,
      canvasId,
      activeSurface,
      activeWorkspaceId ?? 'root',
    ].join(':');
    const targetRef = activeSurface === 'main'
      ? { kind: 'main' as const }
      : activeWorkspaceId === null
        ? undefined
        : { kind: 'workspace' as const, id: activeWorkspaceId };
    const base: Omit<DropTargetRegistration, 'rect'> = {
      targetId,
      kind: 'canvas',
      label: activeSurface === 'main' ? 'Main' : `${activeSurface} 现场`,
      priority: 10,
      enabled: targetRef !== undefined,
      ...(targetRef === undefined ? { ineligibleReason: '当前现场尚未解析到 workspace' } : {}),
      semantic: {
        kind: 'canvas',
        // The target is disabled until a real workspace identity exists; the
        // fallback keeps the registration shape total for diagnostics.
        targetRef: targetRef ?? { kind: 'project', id: projectId },
      },
    };
    const publish = (): void => {
      registerTarget({
        ...base,
        rect: rectFromDomRect(canvasWrapper.getBoundingClientRect()),
      });
    };
    publish();
    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(publish)
      : null;
    observer?.observe(canvasWrapper);
    window.addEventListener('resize', publish);
    window.addEventListener('scroll', publish, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', publish);
      window.removeEventListener('scroll', publish, true);
      unregisterTarget(targetId);
    };
  }, [
    activeSurface,
    activeWorkspaceId,
    canvasId,
    canvasWrapper,
    projectId,
    registerTarget,
    unregisterTarget,
  ]);

  // One commit owner bridge: the store freezes the resolved intent at
  // pointer-up, then this host invokes the existing canonical owner exactly
  // once. No Core truth is created in the drop layer itself.
  useEffect(() => {
    if (
      dropState.status !== 'committing' ||
      dropResolution?.status !== 'ready' ||
      projectId === null
    ) return;
    let active = true;
    const dropCanvasId = canvasId;
    const store = useLcosDropStore.getState();
    if (store.state.status !== 'committing' || store.state.transactionId !== dropState.transactionId) return;
    const intent = dropResolution.intent;
    const router = commitRouterRef.current;
    if (router === null) return;
    const owners = {
      applyAssembly: async (assemblyIntent: DropAssemblyApplyIntent, signal?: AbortSignal): Promise<AssemblyApplyResultV1> => {
        const point = assemblyIntent.targetRef.kind === 'conversation' ? undefined : assemblyIntent.placementPoint;
        const placementBySource = point === undefined
          ? undefined
          : assemblyIntent.sourceRefs.reduce<Record<string, { readonly x: number; readonly y: number }>>(
              (placements, sourceRef) => {
                placements[sourceRef.id] = {
                  x: point.x,
                  y: point.y,
                };
                return placements;
              },
              {},
            );
        const result = await assembly.apply(
          projectId,
          {
            schemaVersion: 1,
            projectId,
            sourceRefs: assemblyIntent.sourceRefs,
            targetRef: assemblyIntent.targetRef,
            ...(placementBySource === undefined ? {} : { placementBySource }),
          },
          signal,
        );
        if (assemblyIntent.targetRef.kind === 'conversation' && !signal?.aborted) {
          void useCollaborationSessionStore.getState().refresh(projectId, assemblyIntent.targetRef.id);
        }
        return result;
      },
      addComposerReference: (referenceIntent: DropComposerReferenceIntent): void => {
        useLcosReferenceStore.getState().addEntityToDraft(referenceIntent.reference);
      },
      addCollectionMember: async (membershipIntent: DropCollectionMembershipIntent) => {
        const receipt = await session.collections.addMember(projectId, membershipIntent.collectionId, membershipIntent.memberRef);
        const canvasState = useCanvasStore.getState();
        const shellState = useLcosShellStore.getState();
        if ((receipt.status === 'applied' || receipt.status === 'already-member')
          && shellState.projectId === projectId && active
          && canvasState.canvasId === dropCanvasId) {
          const frame = canvasState.nodes.find((node) => node.type === 'frame'
            && (node.data as Record<string, unknown> | undefined)?.lcosCollectionId === membershipIntent.collectionId);
          const collectionNodeId = typeof (frame?.data as Record<string, unknown> | undefined)?.lcosCollectionNodeId === 'string'
            ? String((frame?.data as Record<string, unknown>).lcosCollectionNodeId) : undefined;
          const memberNode = [...useLcosReferenceStore.getState().nodeEntityRefs].find(([, ref]) =>
            ref.entityType === membershipIntent.memberRef.type && ref.entityId === membershipIntent.memberRef.id);
          const projectedNode = memberNode ? canvasState.nodes.find((node) => node.id === memberNode[0]) : undefined;
          const isCollapsed = frame ? useCanvasStore.getState().collapsedFrameIds.has(frame.id) : false;
          if (frame && collectionNodeId && !isCollapsed && projectedNode && !projectedNode.parentId) {
            const frameChildIds = canvasState.nodes.filter((node) => node.parentId === frame.id).map((node) => node.id);
            const geometry = collectionExpansionGeometry(canvasState.nodes, collectionNodeId, [projectedNode.id], frameChildIds);
            if (geometry.length > 0) useCanvasStore.getState().setNodeGeometry(geometry);
            useCanvasStore.getState().moveNodeIntoFrame(projectedNode.id, frame.id);
          }
        }
        useLcosReferenceStore.getState().requestNodeBindingRefresh();
        return receipt;
      },

    };
    void router.commit(intent, dropState.transactionId, owners)
      .then((receipt) => {
        if (!active || useLcosShellStore.getState().projectId !== projectId) return;
        store.settle(receipt);
      });
    return () => { active = false; };
  }, [assembly, canvasId, dropResolution, dropState, projectId]);

  const dropActive =
    dropStatus === 'tracking' ||
    dropStatus === 'dwell' ||
    dropStatus === 'preview';
  const dropPreview = dropStatus === 'preview';

  const visible = visibleOverlays({
    dragging: isNodeDragging || dropActive,
    resizing: false,
    selected: hasSelection,
    hovered: false,
    composerOpen,
    actionArcOpen: false,
    workViewOpen: false,
    dropPreview,
    // reference-badge 是 per-node 节点级浮层，由 NodeWrapper 的 overlayContent
    // 呈现；此处画布级不重复。
    referenceBadge: false,
  });

  const showDrop = has(visible, 'drop-preview');
  const viewport = useProfessionalViewport();
  const visibleWindowIds = useMemo(
    () => visibleWindowIdsForStage(windows, windowRegions, viewport).windowIds,
    [viewport, windowRegions, windows],
  );
  // Only the visible body that actually owns this intent takes its inline Composer.
  // Unrelated Readers/Assembly windows must leave canvas-local intent reachable.
  const windowOwnsComposer = composerHasVisibleWindowOwner(composerTarget, windows, visibleWindowIds);
  const showComposer = has(visible, 'composer') && !windowOwnsComposer;

  return (
    <>
      <TemporalPreviewOutlines />
      {showDrop && <LcosDropPreview />}
      <LcosDropReceipt />
      {projectId && composerTarget && (
        <LcosComposerHost
          projectId={projectId}
          workspaceId={composerTarget.workspaceId}
          anchor={composerTarget.anchor}
          open={showComposer}
          onClose={closeComposer}
        />
      )}
    </>
  );
};
