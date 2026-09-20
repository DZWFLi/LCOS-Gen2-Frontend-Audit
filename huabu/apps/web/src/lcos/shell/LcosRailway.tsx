// LcosRailway — 项目具体目的地导航脊柱（Figma Railway 5385:283）。
// Railway 不承担 Main/Context/Workflow 一级切换；SurfaceDock 才是唯一一级入口。
// 这里读取 Core orderedRefs，按 kind + viewId 解析真实目的地；无法解析的 ref
// 保留为 disabled，避免用静态 roots 或“+N”占位冒充恢复能力。

import {
  projectConnectedConversationStatusV1,
  type ConnectedConversationV1,
  type ProjectViewRailOrderV0,
} from '@local-creative-os/contracts';
import {
  CoreConversationClient,
  CoreProjectClient,
  CoreRailwayClient,
  removeRailwayRefV1,
  railwayRefKeyV1,
  reorderRailwayRefV1,
} from '@local-creative-os/web-gen2';
import { Eye, FolderOpen, Inbox, Layers, ListTree, MessageCircle, MoreHorizontal, PanelsTopLeft, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';

import { lcosHudEdgeOffsets, lcosHudSafeCenterY } from './lcosHudPlacement';
import { useLcosShellStore, type LcosSurfaceKey } from './lcosShellStore';
import { createLcosCoreSession } from '../app/lcosCoreClient';
import { rectFromDomRect } from '../drop/dropTargetRegistry';
import { useLcosDropStore } from '../lcosDropState';
import {
  projectRailwaySnapshot,
  type RailwayUiSnapshot,
  type RailwayDestinationProjection,
} from '../navigation/railwayProjection';
import {
  railwayReceiveLabel,
  railwayReceivePresentation,
} from '../navigation/railwayReceivePresentation';
import { LcosRailwayView, type LcosRailwayViewItem } from '../ui/families';
import { lcosGlassStyle, lcosTokens } from '../ui/lcosTokens';

import type { DropTargetRegistration } from '../drop/dropTypes';

const RAILWAY_PRIMARY_CAPACITY = 4;

function destinationTargetId(
  projectId: string,
  destinationKey: string,
): string {
  return `railway:${projectId}:${destinationKey}`;
}

function receiverTargetId(projectId: string, conversationId: string): string {
  return `railway-receiver:${projectId}:${conversationId}`;
}

export interface LcosRailwayProps {
  readonly projectId: string;
  readonly surfaceByWorkspace: ReadonlyMap<string, LcosSurfaceKey>;
  readonly activateDestination: (
    destination: RailwayDestinationProjection,
  ) => Promise<void> | void;
}

function iconFor(
  kind: RailwayDestinationProjection['kind'],
): React.ComponentType<{ className?: string }> {
  switch (kind) {
    case 'scene':
      return PanelsTopLeft;
    case 'context':
      return Layers;
    case 'workflow':
      return ListTree;
    case 'collection':
      return FolderOpen;
  }
}

function destinationsForOrder(
  order: ProjectViewRailOrderV0,
  previous: readonly RailwayDestinationProjection[],
): readonly RailwayDestinationProjection[] {
  const byKey = new Map(previous.map((destination) => [destination.key, destination]));
  return order.orderedRefs.flatMap((sourceRef, sourceIndex) => {
    const destination = byKey.get(railwayRefKeyV1(sourceRef));
    return destination === undefined
      ? []
      : [{ ...destination, sourceRef, sourceIndex }];
  });
}

export function LcosRailway({
  projectId,
  surfaceByWorkspace,
  activateDestination,
}: LcosRailwayProps): React.JSX.Element {
  const activeSurface = useLcosShellStore((s) => s.activeSurface);
  const activeWorkspaceId = useLcosShellStore((s) => s.activeWorkspaceId);
  const windowEnvironment = useLcosShellStore((s) => s.windowEnvironment);
  const openWindow = useLcosShellStore((s) => s.openWindow);
  const registerTarget = useLcosDropStore((s) => s.registerTarget);
  const unregisterTarget = useLcosDropStore((s) => s.unregisterTarget);
  const dropState = useLcosDropStore((s) => s.state);
  const dropResolution = useLcosDropStore((s) => s.resolution);
  const receiveTargetElements = useRef(new Map<string, HTMLButtonElement>());
  const receiverTargetElement = useRef<HTMLButtonElement | null>(null);
  const [snapshot, setSnapshot] = useState<RailwayUiSnapshot | undefined>(undefined);
  const [activeReceiver, setActiveReceiver] = useState<ConnectedConversationV1 | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [receiverError, setReceiverError] = useState<string | undefined>(undefined);
  const [activatingKey, setActivatingKey] = useState<string | undefined>(undefined);
  const [dragKey, setDragKey] = useState<string | undefined>(undefined);
  const [reorderTargetKey, setReorderTargetKey] = useState<string | undefined>(undefined);
  const [reordering, setReordering] = useState(false);
  const [peekKey, setPeekKey] = useState<string | undefined>(undefined);
  const [moreKey, setMoreKey] = useState<string | undefined>(undefined);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const session = useMemo(() => createLcosCoreSession(), []);
  const railway = useMemo(() => new CoreRailwayClient(session.http), [session]);
  const conversations = useMemo(() => new CoreConversationClient(session.http), [session]);
  const projects = useMemo(
    () => new CoreProjectClient(session.http),
    [session],
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    void Promise.all([
      railway.read(projectId, controller.signal),
      projects.getProjectGraph(projectId),
    ])
      .then(([order, graph]) => {
        if (cancelled) return;
        if (!order || !graph) {
          setSnapshot(undefined);
          setError(undefined);
          return;
        }
        setSnapshot(projectRailwaySnapshot(order, {
          workspaces: graph.workspaces.map((workspace) => ({
            id: String(workspace.id),
            name: workspace.name,
            scopeId: String(workspace.scopeId),
          })),
          scopes: graph.scopes.map((scope) => ({
            id: String(scope.id),
            name: scope.name,
            kind: scope.kind,
          })),
          surfaceByWorkspace,
        }));
        setError(undefined);
      })
      .catch((cause: unknown) => {
        if (!cancelled && (cause as { name?: string }).name !== 'AbortError') {
          setSnapshot(undefined);
          setError('Railway 目的地读取失败');
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [projectId, projects, railway, surfaceByWorkspace]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    void Promise.all([
      conversations.listConnectedConversations(projectId, controller.signal),
      conversations.getReceiverBinding(projectId, controller.signal),
    ])
      .then(([items, binding]) => {
        if (cancelled) return;
        if (binding.activeReceiverId === null) {
          setActiveReceiver(undefined);
          setReceiverError(undefined);
          return;
        }
        const receiver = items.find((item) => item.id === binding.activeReceiverId);
        setActiveReceiver(receiver);
        setReceiverError(receiver === undefined ? '当前承接会话身份已失效' : undefined);
      })
      .catch((cause: unknown) => {
        if (!cancelled && (cause as { name?: string }).name !== 'AbortError') {
          setActiveReceiver(undefined);
          setReceiverError('承接会话读取失败');
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [conversations, projectId]);

  const destinations = useMemo(
    () => snapshot?.destinations ?? [],
    [snapshot],
  );

  const publishReceiveTarget = useCallback((
    destination: RailwayDestinationProjection,
    element: HTMLButtonElement | undefined,
  ): void => {
    const targetId = destinationTargetId(projectId, destination.key);
    if (
      element === undefined ||
      !destination.available ||
      destination.workspaceId === undefined
    ) {
      unregisterTarget(targetId);
      return;
    }
    const target: DropTargetRegistration = {
      targetId,
      kind: 'railway-receive',
      label: destination.label,
      rect: rectFromDomRect(element.getBoundingClientRect()),
      priority: 20,
      enabled: true,
      semantic: {
        kind: 'railway-receive',
        targetRef: { kind: 'workspace', id: destination.workspaceId },
        destinationRef: destination.sourceRef,
      },
    };
    registerTarget(target);
  }, [projectId, registerTarget, unregisterTarget]);

  const publishReceiverTarget = useCallback((): void => {
    if (activeReceiver === undefined || receiverTargetElement.current === null) return;
    const receiverStatus = projectConnectedConversationStatusV1(activeReceiver);
    const enabled = receiverStatus !== 'offline';
    registerTarget({
      targetId: receiverTargetId(projectId, activeReceiver.id),
      kind: 'collaboration-reference',
      label: activeReceiver.label,
      rect: rectFromDomRect(receiverTargetElement.current.getBoundingClientRect()),
      priority: 21,
      enabled,
      ...(enabled ? {} : { ineligibleReason: '承接会话当前离线' }),
      semantic: {
        kind: 'collaboration-reference',
        conversationId: activeReceiver.id,
      },
    });
  }, [activeReceiver, projectId, registerTarget]);

  // Railway is itself scrollable. A ref callback gives us the first rect, but
  // internal scroll / viewport resize can move a button without remounting it.
  // Keep the registry as live screen-space geometry just like Composer does.
  useEffect(() => {
    const publishAll = (): void => {
      for (const destination of destinations) {
        publishReceiveTarget(destination, receiveTargetElements.current.get(destination.key));
      }
    };
    publishAll();
    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(publishAll)
      : undefined;
    for (const destination of destinations) {
      const element = receiveTargetElements.current.get(destination.key);
      if (element !== undefined) observer?.observe(element);
    }
    window.addEventListener('resize', publishAll);
    // capture=true also observes scroll events from the Railway overflow island.
    window.addEventListener('scroll', publishAll, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', publishAll);
      window.removeEventListener('scroll', publishAll, true);
      for (const destination of destinations) {
        unregisterTarget(`railway:${projectId}:${destination.key}`);
      }
    };
  }, [destinations, projectId, publishReceiveTarget, unregisterTarget]);

  useEffect(() => {
    if (activeReceiver === undefined) return;
    const targetId = receiverTargetId(projectId, activeReceiver.id);
    publishReceiverTarget();
    const element = receiverTargetElement.current;
    const observer = element !== null && typeof ResizeObserver === 'function'
      ? new ResizeObserver(publishReceiverTarget)
      : undefined;
    if (element !== null) observer?.observe(element);
    window.addEventListener('resize', publishReceiverTarget);
    window.addEventListener('scroll', publishReceiverTarget, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', publishReceiverTarget);
      window.removeEventListener('scroll', publishReceiverTarget, true);
      unregisterTarget(targetId);
    };
  }, [activeReceiver, projectId, publishReceiverTarget, unregisterTarget]);

  const refreshAfterConflict = useCallback(async (previous: RailwayUiSnapshot): Promise<void> => {
    try {
      const [fresh, graph] = await Promise.all([
        railway.read(projectId),
        projects.getProjectGraph(projectId),
      ]);
      if (fresh === undefined || graph === undefined) {
        setSnapshot(previous);
        setError('Railway 已在别处更新，但最新顺序暂时读取失败');
        return;
      }
      setSnapshot(projectRailwaySnapshot(fresh, {
        workspaces: graph.workspaces.map((workspace) => ({
          id: String(workspace.id),
          name: workspace.name,
          scopeId: String(workspace.scopeId),
        })),
        scopes: graph.scopes.map((scope) => ({
          id: String(scope.id),
          name: scope.name,
          kind: scope.kind,
        })),
        surfaceByWorkspace,
      }));
      setNotice(undefined);
      setError('Railway 已在别处更新，已回读最新顺序');
    } catch {
      setSnapshot(previous);
      setError('Railway 已在别处更新，但最新顺序暂时读取失败');
    }
  }, [projectId, projects, railway, surfaceByWorkspace]);

  const removeDestination = useCallback((destinationKey: string): void => {
    const previous = snapshot;
    if (previous === undefined || reordering) return;
    const orderedRefs = removeRailwayRefV1(previous.order.orderedRefs, destinationKey);
    if (orderedRefs === previous.order.orderedRefs) return;
    setReordering(true);
    setError(undefined);
    setNotice(undefined);
    void railway.write({
      projectId,
      orderedRefs,
      expectedVersion: previous.order.version,
    })
      .then((serverOrder) => {
        setSnapshot({
          order: serverOrder,
          destinations: destinationsForOrder(serverOrder, previous.destinations),
        });
        setPeekKey(undefined);
        setMoreKey(undefined);
        setNotice(`目的地已移出 Railway · v${serverOrder.version}`);
      })
      .catch(async (cause: unknown) => {
        if ((cause as { status?: number }).status === 409) {
          await refreshAfterConflict(previous);
          return;
        }
        setError(cause instanceof Error ? cause.message : 'Railway 目的地移除失败');
      })
      .finally(() => setReordering(false));
  }, [projectId, refreshAfterConflict, railway, reordering, snapshot]);

  const reorder = useCallback((movedKey: string, targetKey: string, placement: 'before' | 'after'): void => {
    const previous = snapshot;
    if (previous === undefined) return;
    const orderedRefs = reorderRailwayRefV1(previous.order.orderedRefs, movedKey, targetKey, placement);
    if (orderedRefs === previous.order.orderedRefs) return;
    const optimisticOrder = { ...previous.order, orderedRefs };
    setSnapshot({
      order: optimisticOrder,
      destinations: destinationsForOrder(optimisticOrder, previous.destinations),
    });
    setReordering(true);
    void railway.write({ projectId, orderedRefs, expectedVersion: previous.order.version })
      .then((serverOrder) => {
        setSnapshot({
          order: serverOrder,
          destinations: destinationsForOrder(serverOrder, previous.destinations),
        });
        setNotice(`Railway 顺序已保存 · v${serverOrder.version}`);
        setError(undefined);
      })
      .catch(async (cause: unknown) => {
        setSnapshot(previous);
        if ((cause as { status?: number }).status === 409) {
          // 409 的解锁条件必须是「fresh order + fresh graph 回读完成」。
          // 若此处 fire-and-forget，finally 会先 setReordering(false)，用户在 fresh
          // 投影回来前又能发起 reorder —— 那一次仍基于旧 version，要么再撞 409，
          // 要么把并发期间新增的目的地顺序写坏。await 让 refresh 与解锁严格同序。
          await refreshAfterConflict(previous);
          return;
        }
        setError(cause instanceof Error ? cause.message : 'Railway 顺序保存失败');
      })
      .finally(() => setReordering(false));
  }, [projectId, refreshAfterConflict, railway, snapshot]);

  const activate = useCallback((destination: RailwayDestinationProjection): void => {
    if (!destination.available || activatingKey !== undefined || reordering) return;
    setActivatingKey(destination.key);
    setError(undefined);
    void Promise.resolve(activateDestination(destination))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => setActivatingKey(undefined));
  }, [activateDestination, activatingKey, reordering]);

  const primaryDestinations = useMemo(
    () => destinations.slice(0, RAILWAY_PRIMARY_CAPACITY),
    [destinations],
  );
  const primaryKeys = useMemo(
    () => new Set(primaryDestinations.map((destination) => destination.key)),
    [primaryDestinations],
  );
  const destinationByKey = useMemo(
    () => new Map(destinations.map((destination) => [destination.key, destination])),
    [destinations],
  );
  const overflowRefs = useMemo(
    () => (snapshot?.order.orderedRefs ?? []).filter(
      (ref) => !primaryKeys.has(railwayRefKeyV1(ref)),
    ),
    [primaryKeys, snapshot],
  );

  const items: readonly LcosRailwayViewItem[] = primaryDestinations.map(
    (destination) => {
      const receivePresentation = railwayReceivePresentation({
        targetId: destinationTargetId(projectId, destination.key),
        enabled: destination.available,
        dropState,
        resolution: dropResolution,
      });
      return {
        key: destination.key,
        label: destination.label,
        icon: iconFor(destination.kind),
      selected:
        destination.available &&
        (destination.workspaceId !== undefined
          ? destination.workspaceId === activeWorkspaceId
          : destination.surface === activeSurface),
      disabled: !destination.available || activatingKey !== undefined || reordering,
      draggable: destination.available && !reordering,
      reorderDropTarget: reorderTargetKey === destination.key,
      receivePresentation,
      peekOpen: peekKey === destination.key,
      onPeekEnter: () => {
        setPeekKey(destination.key);
        setMoreKey(undefined);
      },
      onPeekLeave: () => {
        setPeekKey((current) => current === destination.key ? undefined : current);
        setMoreKey((current) => current === destination.key ? undefined : current);
      },
      peek: peekKey === destination.key ? (
        <div
          data-lcos-railway-peek={destination.key}
          role="dialog"
          aria-label={`${destination.label} 目的地预览`}
          style={{ ...lcosGlassStyle, color: lcosTokens.color.text }}
        >
          <strong data-lcos-railway-peek-label>{destination.label}</strong>
          <span data-lcos-railway-destination-ref>
            {destination.kind}:{destination.viewId}
          </span>
          <span data-lcos-railway-peek-geometry>
            Core 顺序 {destination.sourceIndex + 1}/{snapshot?.order.orderedRefs.length ?? destinations.length}
            {destination.surface === undefined ? '' : ` · ${destination.surface}`}
          </span>
          <span data-lcos-railway-receive-state>
            Receive：{railwayReceiveLabel(receivePresentation, destination.reason)}
          </span>
          <div data-lcos-railway-actions>
            <button
              type="button"
              data-lcos-railway-action="peek"
              aria-pressed="true"
              onClick={() => {
                setPeekKey(destination.key);
                setMoreKey(undefined);
              }}
            >
              <Eye size={14} aria-hidden />
              Peek
            </button>
            <button
              type="button"
              data-lcos-railway-action="receive"
              disabled
              title="Receive 需要从 Assembly 或 Canvas 拖入素材"
            >
              <Inbox size={14} aria-hidden />
              Receive
            </button>
            <button
              type="button"
              data-lcos-railway-action="more"
              aria-expanded={moreKey === destination.key}
              onClick={() => setMoreKey((current) => current === destination.key ? undefined : destination.key)}
            >
              <MoreHorizontal size={14} aria-hidden />
              More
            </button>
          </div>
        </div>
      ) : undefined,
      moreOpen: moreKey === destination.key,
      more: moreKey === destination.key ? (
        <div data-lcos-railway-more role="menu" aria-label={`${destination.label} 更多操作`}>
          <button
            type="button"
            role="menuitem"
            data-lcos-railway-more-action="open"
            disabled={!destination.available || activatingKey !== undefined || reordering}
            onClick={() => activate(destination)}
          >
            <Eye size={14} aria-hidden />
            进入目的地
          </button>
          <button
            type="button"
            role="menuitem"
            data-lcos-railway-more-action="remove"
            disabled={reordering}
            onClick={() => removeDestination(destination.key)}
          >
            <Trash2 size={14} aria-hidden />
            移出 Railway
          </button>
          {!destination.available && (
            <span data-lcos-railway-more-reason>
              {destination.reason ?? '当前目的地缺少可用能力'}
            </span>
          )}
        </div>
      ) : undefined,
      onDragStart: (event: DragEvent<HTMLButtonElement>) => {
        if (!destination.available || reordering) return;
        setDragKey(destination.key);
        setReorderTargetKey(undefined);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/lcos-railway', destination.key);
      },
      onDragOver: (event: DragEvent<HTMLButtonElement>) => {
        if (dragKey === undefined || dragKey === destination.key || reordering) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setReorderTargetKey(destination.key);
      },
      onDrop: (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const movedKey = dragKey ?? event.dataTransfer.getData('text/lcos-railway');
        if (movedKey.length === 0 || movedKey === destination.key || reordering) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const placement = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
        reorder(movedKey, destination.key, placement);
        setDragKey(undefined);
        setReorderTargetKey(undefined);
      },
      onDragEnd: () => {
        setDragKey(undefined);
        setReorderTargetKey(undefined);
      },
      onElement: (element) => {
        if (element === null) {
          receiveTargetElements.current.delete(destination.key);
          unregisterTarget(`railway:${projectId}:${destination.key}`);
          return;
        }
        receiveTargetElements.current.set(destination.key, element);
        publishReceiveTarget(destination, element);
      },
      };
    },
  );

  const overflow = overflowRefs.length > 0 ? (
    <div
      data-lcos-railway-overflow
      role="dialog"
      aria-label="Railway 全部目的地"
      style={{ ...lcosGlassStyle, color: lcosTokens.color.text }}
    >
      <strong>Railway 目的地</strong>
      <span data-lcos-railway-overflow-summary>
        Core {snapshot?.order.orderedRefs.length ?? 0} · 岛内 {primaryDestinations.length}
      </span>
      <div data-lcos-railway-overflow-list>
        {overflowRefs.map((ref) => {
          const key = railwayRefKeyV1(ref);
          const destination = destinationByKey.get(key);
          const presentation = railwayReceivePresentation({
            targetId: destinationTargetId(projectId, key),
            enabled: destination?.available === true,
            dropState,
            resolution: dropResolution,
          });
          return (
            <div key={key} data-lcos-railway-overflow-row={key} data-lcos-receive-state={presentation}>
              <button
                type="button"
                data-lcos-railway-overflow-open={key}
                ref={(element) => {
                  if (destination === undefined) return;
                  if (element === null) {
                    receiveTargetElements.current.delete(destination.key);
                    unregisterTarget(destinationTargetId(projectId, destination.key));
                    return;
                  }
                  receiveTargetElements.current.set(destination.key, element);
                  publishReceiveTarget(destination, element);
                }}
                disabled={destination?.available !== true || activatingKey !== undefined || reordering}
                onClick={() => {
                  if (destination !== undefined) activate(destination);
                }}
              >
                <span>{destination?.label ?? key}</span>
                <small>{key}</small>
              </button>
              <span data-lcos-railway-overflow-state>
                {destination === undefined
                  ? 'Surface 根入口由底部现场入口接管'
                  : railwayReceiveLabel(presentation, destination.reason)}
              </span>
              <button
                type="button"
                data-lcos-railway-overflow-remove={key}
                disabled={reordering}
                aria-label={`移出 ${destination?.label ?? key}`}
                onClick={() => removeDestination(key)}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  ) : undefined;

  const receiverPresentation = activeReceiver === undefined
    ? undefined
    : railwayReceivePresentation({
        targetId: receiverTargetId(projectId, activeReceiver.id),
        enabled: projectConnectedConversationStatusV1(activeReceiver) !== 'offline',
        dropState,
        resolution: dropResolution,
      });
  const receiver = activeReceiver === undefined || receiverPresentation === undefined
    ? undefined
    : (
        <div data-lcos-railway-receiver-shell>
          <button
            ref={(element) => {
              if (receiverTargetElement.current !== null && element === null) {
                unregisterTarget(receiverTargetId(projectId, activeReceiver.id));
              }
              receiverTargetElement.current = element;
              if (element !== null) publishReceiverTarget();
            }}
            type="button"
            data-lcos-railway-receiver={activeReceiver.id}
            data-lcos-receive-state={receiverPresentation}
            title={`${activeReceiver.label} · ${railwayReceiveLabel(receiverPresentation)}`}
            aria-label={`打开承接会话 ${activeReceiver.label}`}
            onClick={() => openWindow('conversation', `会话窗口 · ${activeReceiver.label}`, activeReceiver.id)}
          >
            <MessageCircle size={19} aria-hidden />
            <span data-lcos-railway-receiver-status>
              {projectConnectedConversationStatusV1(activeReceiver)}
            </span>
          </button>
        </div>
      );

  // An empty project has no Railway yet. Active Receiver and canonical
  // compatibility rows are still real identities and keep the vertical chain visible.
  if (
    (snapshot?.order.orderedRefs.length ?? 0) === 0
    && activeReceiver === undefined
    && error === undefined
    && receiverError === undefined
  ) return <></>;

  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const edgeOffsets = lcosHudEdgeOffsets(windowEnvironment, viewport);

  return (
    <div
      data-lcos-railway
      data-lcos-railway-version={snapshot?.order.version}
      data-lcos-railway-canonical-total={snapshot?.order.orderedRefs.length ?? 0}
      className="pointer-events-auto fixed top-1/2 left-6 z-40 flex -translate-y-1/2 flex-col items-center gap-2"
      style={{
        left: edgeOffsets.left,
        top: lcosHudSafeCenterY(windowEnvironment, viewport.height),
      }}
    >
      <LcosRailwayView
        items={items}
        canonicalTotal={snapshot?.order.orderedRefs.length ?? 0}
        overflowCount={overflowRefs.length}
        overflowOpen={overflowOpen}
        onOverflowToggle={() => setOverflowOpen((open) => !open)}
        overflow={overflow}
        receiver={receiver}
        onSelect={(key) => {
          const destination = destinations.find((item) => item.key === key);
          if (destination !== undefined) activate(destination);
        }}
        footer={error ?? receiverError ?? notice ?? (dropState.status === 'failed' ? dropState.reason : undefined)}
      />
    </div>
  );
}
