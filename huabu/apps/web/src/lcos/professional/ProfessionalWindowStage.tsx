// ProfessionalWindowStage — route-level 专业窗口舞台（Figma window 5388:27165 / Chrome 5387:331）。
// Stage 是唯一 Window topology + geometry producer；body 数据来自 Core。
// 多个 window region 保持独立，只有显式 group 才共享 tab chrome。

import {
  clampProfessionalRectV1,
  deriveProfessionalWindowEnvironmentV1,
  resizeProfessionalRectV1,
} from '@local-creative-os/web-gen2';
import { X } from 'lucide-react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useCloseOnEscape } from '@/hooks/useCloseOnEscape';
import { useCanvasAttentionStore } from '@/store/canvasAttentionStore';


import { ArchiveBody } from './ArchiveBody';
import { ArtifactReaderBody } from './ArtifactReaderBody';
import { AssemblyBody } from './AssemblyBody';
import { ConversationWorkViewBody } from './ConversationWorkViewBody';
import { PortalPreviewBody, type PortalTargetResolution } from './PortalPreviewBody';
import {
  deriveProfessionalStageRegionPlacementsV1,
  professionalFloatingBoundsV1,
  PROFESSIONAL_STAGE_MIN_HEIGHT,
  PROFESSIONAL_STAGE_MIN_WIDTH,
} from './professionalWindowStageLayout';
import { resolveProfessionalWindowDropTarget, type ProfessionalWindowDropAction, type ProfessionalWindowDropRegionTarget } from './professionalWindowDropTarget';
import { RuntimeDoctorBody } from './RuntimeDoctorBody';
import { visibleWindowIdsForStage } from './professionalStageVisibility';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore, type LcosWindow } from '../shell/lcosShellStore';
import { activeWindowIdForRegion, createWindowRegion, normalizeWindowRegion, windowIdsForRegion } from '../shell/windowRegionTopology';
import { LcosWindowChrome } from '../ui/families';
import { lcosGlassStyle, lcosTokens } from '../ui/lcosTokens';

import type { LcosWindowRegion, WindowRegionInput } from '../shell/windowRegionTopology';
import type { AssemblyTargetRefV1 } from '@local-creative-os/contracts';
import type { ProfessionalRectV1, ProfessionalResizeHandleV1 } from '@local-creative-os/web-gen2';

/** R2-B：8 向 resize 的命中区（透明但可点；视觉克制，是否舒服交给用户手测）。 */
const RESIZE_HANDLE_CLASS: Readonly<Record<ProfessionalResizeHandleV1, string>> = {
  n: 'left-2 right-2 top-0 h-1.5 cursor-ns-resize',
  s: 'left-2 right-2 bottom-0 h-1.5 cursor-ns-resize',
  e: 'top-2 bottom-2 right-0 w-1.5 cursor-ew-resize',
  w: 'top-2 bottom-2 left-0 w-1.5 cursor-ew-resize',
  ne: 'right-0 top-0 h-3.5 w-3.5 cursor-nesw-resize',
  nw: 'left-0 top-0 h-3.5 w-3.5 cursor-nwse-resize',
  se: 'right-0 bottom-0 h-3.5 w-3.5 cursor-nwse-resize',
  sw: 'left-0 bottom-0 h-3.5 w-3.5 cursor-nesw-resize',
};

const RESIZE_HANDLES: readonly ProfessionalResizeHandleV1[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export interface ProfessionalWindowStageProps {
  readonly projectId: string;
  /** Core-derived resolver; absent in isolated tests/legacy callers. */
  readonly resolvePortalTarget?: (canvasId: string) => PortalTargetResolution | undefined;
  /** Shell-owned navigation into an already resolved Workspace. */
  readonly onOpenPortalTarget?: (target: PortalTargetResolution) => void;
}

interface ProfessionalRegionEntry {
  readonly region: LcosWindowRegion;
  readonly windows: readonly LcosWindow[];
  readonly activeWindow: LcosWindow;
  readonly preferredWidth: number;
}

interface WindowDropPreview {
  readonly action: ProfessionalWindowDropAction | { readonly kind: 'float'; readonly rect: ProfessionalRectV1 };
  readonly label: string;
}

interface WindowGestureStyle {
  readonly left: string;
  readonly top: string;
  readonly right: string;
  readonly bottom: string;
  readonly width: string;
  readonly height: string;
}

function preferredWidthFor(window: LcosWindow): number {
  return window.bodyKey === 'reader' ? 1120 : window.bodyKey === 'assembly' ? 640 : 520;
}

function currentViewport(): ProfessionalRectV1 {
  if (typeof window === 'undefined') return { x: 0, y: 0, width: 0, height: 0 };
  return {
    x: 0,
    y: 0,
    width: window.innerWidth || document.documentElement.clientWidth || 0,
    height: window.innerHeight || document.documentElement.clientHeight || 0,
  };
}

function materializeRegionEntries(
  windows: readonly LcosWindow[],
  windowRegions: readonly WindowRegionInput[],
): readonly ProfessionalRegionEntry[] {
  const windowsById = new Map(windows.map((window) => [window.id, window]));
  const assignedIds = new Set(windowRegions.flatMap(windowIdsForRegion));
  const effectiveRegions: readonly LcosWindowRegion[] = [
    ...windowRegions.map(normalizeWindowRegion),
    ...windows
      .filter((window) => !assignedIds.has(window.id))
      .map((window) => createWindowRegion(`region-${window.id}`, [window.id], window.id)),
  ];

  return effectiveRegions.flatMap((region) => {
    const regionWindows = windowIdsForRegion(region)
      .map((windowId) => windowsById.get(windowId))
      .filter((window): window is LcosWindow => window !== undefined);
    const firstGroup = region.groups[0];
    const firstGroupWindows = firstGroup?.windowIds.map((id) => windowsById.get(id)).filter((window): window is LcosWindow => window !== undefined) ?? [];
    const activeWindow = firstGroupWindows.find((window) => window.id === firstGroup?.activeWindowId) ?? firstGroupWindows.at(-1) ?? windowsById.get(activeWindowIdForRegion(region) ?? '') ?? regionWindows[regionWindows.length - 1];
    return activeWindow === undefined
      ? []
      : [{
          region,
          windows: regionWindows,
          activeWindow,
          preferredWidth: region.splitDirection === 'vertical'
            ? Math.max(720, ...region.groups.map((group) => preferredWidthFor(windowsById.get(group.activeWindowId) ?? activeWindow)))
            : preferredWidthFor(activeWindow),
        }];
  });
}

export function ProfessionalWindowStage({ projectId, resolvePortalTarget, onOpenPortalTarget }: ProfessionalWindowStageProps): React.JSX.Element {
  const windows = useLcosShellStore((s) => s.windows);
  const windowRegions = useLcosShellStore((s) => s.windowRegions);
  const activateWindow = useLcosShellStore((s) => s.activateWindow);
  const closeWindow = useLcosShellStore((s) => s.closeWindow);
  const requestLocate = useLcosShellStore((s) => s.requestLocate);
  const publishWindowEnvironment = useLcosShellStore((s) => s.publishWindowEnvironment);
  const clearWindowEnvironment = useLcosShellStore((s) => s.clearWindowEnvironment);
  const composerOpen = useLcosShellStore((s) => s.composerOpen);
  const composerReceiver = useLcosShellStore((s) => s.composerTarget?.receiverConversationId);
  const [viewport, setViewport] = useState<ProfessionalRectV1>(currentViewport);
  const [dropPreview, setDropPreview] = useState<WindowDropPreview | null>(null);
  const suppressTabClickRef = useRef(false);
  const regionElements = useRef(new Map<string, HTMLDivElement>());
  const splitterCleanupRef = useRef<(() => void) | null>(null);
  const gestureCleanupRef = useRef<(() => void) | null>(null);
  useLayoutEffect(() => () => {
    splitterCleanupRef.current?.(); splitterCleanupRef.current = null;
    gestureCleanupRef.current?.(); gestureCleanupRef.current = null;
  }, []);
  const active = windows.find((window) => window.active) ?? windows[windows.length - 1];
  useLayoutEffect(() => {
    // Restored/opened windows own attention until the user returns to canvas.
    // Preserve selection; only its floating chrome yields to the active surface.
    if (active?.id) useCanvasAttentionStore.getState().setCanvasEngaged(false);
  }, [active?.id]);
  const regionEntries = useMemo(
    () => materializeRegionEntries(windows, windowRegions),
    [windowRegions, windows],
  );
  const visibility = useMemo(() => visibleWindowIdsForStage(windows, windowRegions, viewport), [windows, windowRegions, viewport]);
  const compact = visibility.compact;
  const visibleIds = new Set(visibility.windowIds);
  const visibleEntries = useMemo(() => regionEntries.filter((entry) => windowIdsForRegion(entry.region).some((id) => visibleIds.has(id))), [regionEntries, visibility.windowIds]);
  const activeRegionId = active === undefined
    ? undefined
    : regionEntries.find((entry) => windowIdsForRegion(entry.region).includes(active.id))?.region.id;
  const inlineComposerOpen = composerOpen && active?.bodyKey === 'conversation'
    && active.target !== undefined && composerReceiver === active.target;

  const returnReaderToSource = useCallback((reader: LcosWindow): void => {
    if (reader.bodyKey !== 'reader' || reader.target === undefined) {
      closeWindow(reader.id);
      return;
    }
    const references = useLcosReferenceStore.getState().nodeEntityRefs;
    const exactSource = reader.readerSource;
    const exactRef = exactSource === undefined ? undefined : references.get(exactSource.nodeId);
    let nodeId = exactRef?.entityType === 'artifact' && exactRef.entityId === reader.target
      ? exactSource?.nodeId
      : undefined;
    if (nodeId === undefined) {
      for (const [candidateNodeId, ref] of references) {
        if (ref.entityType === 'artifact' && ref.entityId === reader.target) {
          nodeId = candidateNodeId;
          break;
        }
      }
    }
    const surface = nodeId === exactSource?.nodeId && exactSource !== undefined
      ? exactSource.surface
      : useLcosShellStore.getState().activeSurface;
    closeWindow(reader.id);
    requestLocate(nodeId === undefined
      ? { reqId: `reader-return-${crypto.randomUUID()}`, surface, status: 'unprojected' }
      : { reqId: `reader-return-${crypto.randomUUID()}`, surface, nodeId, status: 'projected' });
  }, [closeWindow, requestLocate]);
  const placements = useMemo(() => {
    if (compact) return new Map(visibleEntries.map((entry) => [
      entry.region.id, professionalFloatingBoundsV1(viewport),
    ] as const));
    // 单区域且无用户几何/dock 时沿用既有 CSS 默认摆放（与 R2-A 行为逐字一致）。
    const hasExplicitGeometry = visibleEntries.some((entry) =>
      entry.region.rect !== undefined
      || entry.region.dockWidth !== undefined
      || entry.region.layout === 'docked-right');
    if (visibleEntries.length <= 1 && !hasExplicitGeometry) return new Map<string, ProfessionalRectV1>();
    return new Map(
      deriveProfessionalStageRegionPlacementsV1({
        viewport,
        regions: visibleEntries.map((entry) => ({
          regionId: entry.region.id,
          layout: entry.region.layout,
          preferredWidth: entry.preferredWidth,
          ...(entry.region.rect === undefined ? {} : { rect: entry.region.rect }),
          ...(entry.region.dockWidth === undefined ? {} : { dockWidth: entry.region.dockWidth }),
        })),
      }).map((placement) => [placement.regionId, placement.rect] as const),
    );
  }, [compact, visibleEntries, viewport]);

  /** 当前实际生效的区域几何（显式 placement 优先，否则读 DOM 的 CSS 默认值）。 */
  const rectFor = useCallback((regionId: string): ProfessionalRectV1 | undefined => {
    const placement = placements.get(regionId);
    if (placement !== undefined) return placement;
    const element = regionElements.current.get(regionId);
    if (element === undefined) return undefined;
    const r = element.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, [placements]);

  /**
   * R2-B move / resize 手势。
   *
   * 拖拽期间只写 DOM style（不逐帧 setState），pointerup 才把最终几何提交进
   * `windowRegions` —— 几何真相仍只有 store 一份，body 不保存 x/y/dock，
   * 全程不碰 Canvas camera / selection。
   */
  const publishDuringGesture = useRef<(() => void) | null>(null);

  const beginWindowGesture = useCallback((
    event: React.PointerEvent<HTMLElement>,
    region: LcosWindowRegion,
    kind: 'move' | 'resize' | 'tab',
    handle?: ProfessionalResizeHandleV1,
    tabWindowId?: string,
  ): void => {
    if (event.button !== 0) return;
    const targetElement = event.target as HTMLElement;
    const tabId = kind === 'tab'
      ? tabWindowId ?? targetElement.closest<HTMLElement>('[data-lcos-window-tab-value]')?.getAttribute('data-lcos-window-tab-value') ?? undefined
      : undefined;
    if (kind === 'tab' && tabId === undefined) return;
    if (kind === 'move' && targetElement.closest('button') !== null) return;
    const element = regionElements.current.get(region.id);
    const startRect = rectFor(region.id);
    if (element === undefined || startRect === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    gestureCleanupRef.current?.();
    const viewportBounds = currentViewport();
    const floatingBounds = professionalFloatingBoundsV1(viewportBounds);
    const initialStyle: WindowGestureStyle = {
      left: element.style.left, top: element.style.top, right: element.style.right,
      bottom: element.style.bottom, width: element.style.width, height: element.style.height,
    };
    const gesture: {
      pointerId: number;
      startRect: ProfessionalRectV1;
      latest: ProfessionalRectV1;
      startX: number;
      startY: number;
      moved: boolean;
      docked: boolean;
      handle: ProfessionalResizeHandleV1;
      kind: 'move' | 'resize' | 'tab';
      tabWindowId?: string;
      target?: ProfessionalWindowDropAction;
      floatRect?: ProfessionalRectV1;
    } = {
      pointerId: event.pointerId, startRect, startX: event.clientX, startY: event.clientY,
      latest: startRect, moved: false, docked: region.layout === 'docked-right',
      handle: handle ?? 'se', kind, ...(tabId === undefined ? {} : { tabWindowId: tabId }),
    };

    const restoreStyle = (): void => {
      element.style.left = initialStyle.left; element.style.top = initialStyle.top;
      element.style.right = initialStyle.right; element.style.bottom = initialStyle.bottom;
      element.style.width = initialStyle.width; element.style.height = initialStyle.height;
    };
    const dropRegions = (): readonly ProfessionalWindowDropRegionTarget[] => regionEntries.flatMap((entry) => {
      const host = regionElements.current.get(entry.region.id);
      if (!host || getComputedStyle(host).display === 'none') return [];
      const bounds = host.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return [];
      const panes = [...host.querySelectorAll<HTMLElement>('[data-lcos-window-pane]')].map((pane) => {
        const paneBounds = pane.getBoundingClientRect();
        const groupId = pane.getAttribute('data-lcos-window-pane');
        return groupId === null || paneBounds.width <= 0 || paneBounds.height <= 0
          ? undefined
          : { groupId, rect: { x: paneBounds.x, y: paneBounds.y, width: paneBounds.width, height: paneBounds.height } };
      }).filter((pane): pane is NonNullable<typeof pane> => pane !== undefined);
      const groups = panes.length > 0 ? panes : entry.region.groups.map((group) => ({
        groupId: group.id,
        rect: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      }));
      return [{
        regionId: entry.region.id,
        rect: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
        groups,
        canSplit: entry.region.groups.length === 1 && groups.length === 1,
      }];
    }).sort((a, b) => {
      const aZ = Number.parseInt(getComputedStyle(regionElements.current.get(a.regionId) ?? element).zIndex, 10) || 0;
      const bZ = Number.parseInt(getComputedStyle(regionElements.current.get(b.regionId) ?? element).zIndex, 10) || 0;
      return bZ - aZ;
    });

    const showPreview = (action: ProfessionalWindowDropAction | { readonly kind: 'float'; readonly rect: ProfessionalRectV1 }): void => {
      const label = action.kind === 'dock-right' ? '停靠到右侧'
        : action.kind === 'group' ? '并入此窗口组'
          : action.kind === 'split' ? action.direction === 'vertical'
            ? action.sourceFirst ? '在左侧分屏' : '在右侧分屏'
            : action.sourceFirst ? '在上方分屏' : '在下方分屏'
            : '拆出为浮动窗口';
      setDropPreview({ action, label });
    };

    const onMove = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== gesture.pointerId) return;
      const delta = { x: moveEvent.clientX - gesture.startX, y: moveEvent.clientY - gesture.startY };
      if (!gesture.moved && Math.hypot(delta.x, delta.y) < 4) return;
      gesture.moved = true;
      if (gesture.kind === 'tab') {
        const action = resolveProfessionalWindowDropTarget({
          x: moveEvent.clientX, y: moveEvent.clientY, sourceRegionId: region.id, allowSourceRegion: true,
          viewport: viewportBounds, preferredDockWidth: startRect.width, regions: dropRegions(),
        });
        gesture.target = action;
        const floatRect = clampProfessionalRectV1({
          x: moveEvent.clientX - startRect.width / 2, y: moveEvent.clientY - 24,
          width: startRect.width, height: startRect.height,
        }, floatingBounds, PROFESSIONAL_STAGE_MIN_WIDTH, PROFESSIONAL_STAGE_MIN_HEIGHT);
        gesture.floatRect = floatRect;
        showPreview(action ?? { kind: 'float', rect: floatRect });
        return;
      }
      const bounds = gesture.kind === 'move' ? floatingBounds : gesture.docked ? viewportBounds : floatingBounds;
      const next = gesture.kind === 'move'
        ? clampProfessionalRectV1(
            { ...startRect, x: startRect.x + delta.x, y: startRect.y + delta.y },
            bounds, PROFESSIONAL_STAGE_MIN_WIDTH, PROFESSIONAL_STAGE_MIN_HEIGHT,
          )
        : resizeProfessionalRectV1(
            startRect, gesture.handle, delta, bounds,
            PROFESSIONAL_STAGE_MIN_WIDTH, PROFESSIONAL_STAGE_MIN_HEIGHT,
          );
      if (gesture.docked && gesture.kind === 'resize') {
        const width = Math.min(bounds.width, Math.max(PROFESSIONAL_STAGE_MIN_WIDTH, bounds.x + bounds.width - next.x));
        gesture.latest = { x: bounds.x + bounds.width - width, y: bounds.y, width, height: bounds.height };
      } else gesture.latest = next;
      if (gesture.kind === 'move' || gesture.kind === 'resize') {
        element.style.left = `${gesture.latest.x}px`; element.style.top = `${gesture.latest.y}px`;
        element.style.right = ''; element.style.bottom = '';
        element.style.width = `${gesture.latest.width}px`; element.style.height = `${gesture.latest.height}px`;
      }
      if (gesture.kind === 'move') {
        const action = resolveProfessionalWindowDropTarget({
          x: moveEvent.clientX, y: moveEvent.clientY, sourceRegionId: region.id,
          viewport: viewportBounds, preferredDockWidth: gesture.latest.width, regions: dropRegions(),
        });
        gesture.target = action;
        if (action !== undefined) showPreview(action);
        else setDropPreview(null);
      }
      publishDuringGesture.current?.();
    };

    const cleanup = (): void => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      if (gestureCleanupRef.current === cleanup) gestureCleanupRef.current = null;
    };
    const onUp = (upEvent: PointerEvent): void => {
      if (upEvent.pointerId !== gesture.pointerId) return;
      cleanup(); setDropPreview(null);
      if (!gesture.moved) { restoreStyle(); return; }
      const store = useLcosShellStore.getState();
      if (gesture.kind === 'resize') {
        if (gesture.docked) store.setWindowRegionDockWidth(region.id, gesture.latest.width);
        else store.setWindowRegionRect(region.id, gesture.latest);
        return;
      }
      if (gesture.kind === 'move') {
        const action = gesture.target;
        if (action?.kind === 'dock-right') store.dockWindowRegionRight(region.id, action.rect.width);
        else if (action?.kind === 'group') store.groupWindowRegionInto(region.id, action.regionId, action.groupId);
        else if (action?.kind === 'split') store.splitWindowRegionInto(region.id, action.regionId, action.groupId, action.direction, action.sourceFirst);
        else store.floatWindowRegionAt(region.id, gesture.latest);
        return;
      }
      const draggedWindowId = gesture.tabWindowId;
      if (draggedWindowId === undefined) return;
      suppressTabClickRef.current = true;
      window.setTimeout(() => { suppressTabClickRef.current = false; }, 0);
      const action = gesture.target;
      if (action?.kind === 'dock-right') store.detachWindowToDockRight(draggedWindowId, action.rect.width);
      else if (action?.kind === 'group') store.moveWindowToGroup(draggedWindowId, action.regionId, action.groupId);
      else if (action?.kind === 'split') store.splitWindowToGroup(draggedWindowId, action.regionId, action.groupId, action.direction, action.sourceFirst);
      else store.detachWindowToRegion(draggedWindowId, gesture.floatRect ?? gesture.latest);
      store.activateWindow(draggedWindowId);
    };
    const onCancel = (cancelEvent: PointerEvent): void => {
      if (cancelEvent.pointerId !== gesture.pointerId) return;
      cleanup(); restoreStyle(); setDropPreview(null); publishDuringGesture.current?.();
    };
    gestureCleanupRef.current = cleanup;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }, [rectFor, regionEntries]);

  useLayoutEffect(() => {
    const updateViewport = (): void => {
      const next = currentViewport();
      setViewport((previous) =>
        previous.width === next.width && previous.height === next.height ? previous : next,
      );
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useLayoutEffect(() => {
    if (windows.length === 0 || visibleEntries.length === 0) {
      clearWindowEnvironment();
      return undefined;
    }

    const publish = (): void => {
      const regions = visibleEntries.flatMap((entry) => {
        const element = regionElements.current.get(entry.region.id);
        if (element === undefined) return [];
        const rect = element.getBoundingClientRect();
        return [{
          regionId: entry.region.id,
          layout: entry.region.layout,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        }];
      });
      if (regions.length === 0) {
        clearWindowEnvironment();
        return;
      }
      publishWindowEnvironment(deriveProfessionalWindowEnvironmentV1({
        viewport,
        activeRegionId,
        regions,
      }));
    };

    let publishFrame: number | undefined;
    const schedulePublish = (): void => {
      if (publishFrame !== undefined) return;
      publishFrame = window.requestAnimationFrame(() => { publishFrame = undefined; publish(); });
    };
    publishDuringGesture.current = schedulePublish;
    publish();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(publish);
    for (const entry of visibleEntries) {
      const element = regionElements.current.get(entry.region.id);
      if (element !== undefined) observer?.observe(element);
    }
    window.addEventListener('scroll', publish, true);
    return () => {
      if (publishDuringGesture.current === schedulePublish) publishDuringGesture.current = null;
      if (publishFrame !== undefined) window.cancelAnimationFrame(publishFrame);
      observer?.disconnect();
      window.removeEventListener('scroll', publish, true);
    };
  }, [activeRegionId, clearWindowEnvironment, publishWindowEnvironment, visibleEntries, viewport, windows.length]);

  // Esc 栈：Professional Stage 只关闭全局前景窗口；inline Composer 仍先消费一次 Esc。
  useCloseOnEscape(windows.length > 0 && !inlineComposerOpen, () => {
    if (active === undefined) return;
    if (active.bodyKey === 'reader') returnReaderToSource(active);
    else closeWindow(active.id);
  });

  if (windows.length === 0) return <div data-lcos-professional-stage data-empty="true" className="hidden" aria-hidden />;

  return (
    <div data-lcos-professional-stage data-compact={compact ? 'true' : undefined} className="pointer-events-none fixed inset-0 z-40">
      {regionEntries.map((entry) => {
        const { region, windows: regionWindows, preferredWidth } = entry;
        const activeGroup = compact
          ? region.groups.find((group) => group.windowIds.includes(active?.id ?? '')) ?? region.groups[0]
          : region.groups[0];
        const activeWindow = windows.find((window) => window.id === activeGroup?.activeWindowId) ?? entry.activeWindow;
        const peerGroup = compact ? undefined : region.groups[1];
        const peerWindows = peerGroup?.windowIds.flatMap((id) => { const window = windows.find((item) => item.id === id); return window ? [window] : []; }) ?? [];
        const peerWindow = peerWindows.find((window) => window.id === peerGroup?.activeWindowId) ?? peerWindows.at(-1);
        const activeGroupWindows = activeGroup?.windowIds.flatMap((id) => { const window = windows.find((item) => item.id === id); return window ? [window] : []; }) ?? regionWindows;
        const placement = placements.get(region.id);
        const isGlobalActive = active?.id === activeWindow.id;
        const multiRegion = regionEntries.length > 1;
        const docked = region.layout === 'docked-right';
        const isAssembly = activeWindow.bodyKey === 'assembly';
        const portalTargetResolution = resolvePortalTarget === undefined || activeWindow.bodyKey !== 'portal-preview'
          ? undefined
          : activeWindow.targetKind === 'canvas' && activeWindow.target !== undefined
            ? resolvePortalTarget(activeWindow.target) ?? null
            : null;
        return (
          <div
            key={region.id}
            ref={(element) => {
              if (element === null) regionElements.current.delete(region.id);
              else regionElements.current.set(region.id, element);
            }}
            data-lcos-window-region-id={region.id}
            data-lcos-window-layout={region.layout}
            data-lcos-window-active-body={activeWindow.bodyKey}
            inert={compact && !isGlobalActive || undefined}
            aria-hidden={compact && !isGlobalActive || undefined}
            className="pointer-events-auto absolute flex rounded-2xl"
            onPointerDownCapture={() => {
              useCanvasAttentionStore.getState().setCanvasEngaged(false);
              if (!isGlobalActive) activateWindow(activeWindow.id);
            }}
            onFocusCapture={() => {
              useCanvasAttentionStore.getState().setCanvasEngaged(false);
              if (!isGlobalActive) activateWindow(activeWindow.id);
            }}
            style={{
              boxSizing: 'border-box',
              ...(compact && !isGlobalActive ? { display: 'none' } : {}),
              ...(placement === undefined
                ? {
                    right: region.layout === 'docked-right' ? 0 : isAssembly ? (viewport.width >= 1280 ? 96 : viewport.width < 600 ? 12 : 24) : 24,
                    top: region.layout === 'docked-right' ? 0 : isAssembly ? (viewport.width >= 1280 ? 120 : viewport.width < 600 ? 76 : 88) : 88,
                    ...(isAssembly ? { height: 648 } : region.splitDirection === 'horizontal' ? { height: 560, minHeight: 560 } : {}),
                    width: `min(${preferredWidth}px, calc(100vw - ${isAssembly && viewport.width < 600 ? 24 : 48}px))`,
                  }
                : {
                    left: placement.x,
                    top: placement.y,
                    width: placement.width,
                    height: placement.height,
                  }),
              maxWidth: isAssembly && viewport.width < 600 ? 'calc(100vw - 24px)' : 'calc(100vw - 48px)',
              maxHeight: region.layout === 'docked-right' ? '100vh' : isAssembly && viewport.width < 600 ? 'calc(100vh - 100px)' : 'calc(100vh - 140px)',
              ...(region.splitDirection === 'horizontal' ? { minHeight: 560 } : {}),
              border: '1px solid var(--lcos-window-border)',
              boxShadow: 'var(--lcos-window-shadow)',
              background: lcosTokens.color.surface,
              borderRadius: region.layout === 'docked-right' ? 0 : isAssembly ? 18 : 16,
              overflow: 'hidden',
              flexDirection: region.splitDirection === undefined || region.splitDirection === 'horizontal' ? 'column' : 'row',
              zIndex: isGlobalActive ? 2 : 1,
            }}
          >
            <div data-lcos-window-pane={activeGroup?.id} onFocusCapture={() => { if (useLcosShellStore.getState().windows.find((item) => item.active)?.id !== activeWindow.id) activateWindow(activeWindow.id); }} onPointerDownCapture={() => { if (activeWindow) activateWindow(activeWindow.id); }} style={{ display: 'flex', flexDirection: 'column', flex: peerWindow === undefined ? 1 : `${(region.splitRatio ?? 0.5) * 100}%`, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
            {/* R2-B：标题栏是移动手势的抓手（chrome 上的按钮/tab 不触发移动）。 */}
            <div
              className="cursor-grab active:cursor-grabbing"
              data-lcos-window-drag-handle="enabled"
            onPointerDown={(event) => {
                const tab = (event.target as HTMLElement).closest<HTMLElement>('[data-lcos-window-tab-value]');
                if (tab !== null) {
                  beginWindowGesture(event, region, 'tab', undefined, tab.getAttribute('data-lcos-window-tab-value') ?? undefined);
                  return;
                }
                beginWindowGesture(event, region, 'move');
              }}
              onClickCapture={(event) => {
                if (!suppressTabClickRef.current || (event.target as HTMLElement).closest('[data-lcos-window-tab-value]') === null) return;
                suppressTabClickRef.current = false;
                event.preventDefault(); event.stopPropagation();
              }}
            >
              <LcosWindowChrome
                layout={compact || activeGroupWindows.length > 1 ? '分组' : docked ? '停靠' : '浮动'}
                title={activeWindow.title}
                tabs={compact || activeGroupWindows.length > 1
                  ? (compact ? windows : activeGroupWindows).map((window) => ({
                      key: window.bodyKey,
                      value: window.id,
                      label: window.title,
                      selected: compact ? window.id === active?.id : window.id === activeWindow.id,
                    }))
                  : undefined}
                onSelectTab={(id) => activateWindow(id)}
                primaryActions={<button type="button" data-lcos-window-icon-button aria-label="关闭窗口"
                  onClick={() => { if (activeWindow.bodyKey === 'reader') returnReaderToSource(activeWindow); else closeWindow(activeWindow.id); }}><X className="h-4 w-4" /></button>}
                actions={undefined}
                overflowTrigger={undefined}
              />
            </div>

            {/* R2-B：8 向 resize 命中区；停靠区只有左缘 resize（贴右缘满高，宽度由左缘推）。 */}
            {(docked ? (['w'] as const) : RESIZE_HANDLES).map((handle) => (
              <button
                key={handle}
                type="button"
                data-lcos-window-resize={handle}
                aria-label={docked ? '调整停靠宽度' : `调整窗口 · ${handle}`}
                className={`absolute z-10 rounded-sm bg-transparent hover:bg-black/5 ${RESIZE_HANDLE_CLASS[handle]}`}
                onPointerDown={(event) => beginWindowGesture(event, region, 'resize', handle)}
              />
            ))}

            {/* Figma 360×280 minimum includes the 48px chrome, so multi-region body floor is 232px. */}
            <div
              data-lcos-window-body={activeWindow.bodyKey}
              data-lcos-window-target={activeWindow.target}
              className={`${multiRegion ? 'min-h-[232px]' : 'min-h-[240px]'} flex-1 overflow-y-auto`}
              style={{ background: lcosTokens.color.canvas }}
            >
              <ProfessionalBody
                key={`${projectId}:${activeWindow.id}`}
                projectId={projectId}
                bodyKey={activeWindow.bodyKey}
                onClose={() => closeWindow(activeWindow.id)}
                {...(activeWindow.target === undefined ? {} : { target: activeWindow.target })}
                {...(activeWindow.targetKind === undefined ? {} : { targetKind: activeWindow.targetKind })}
                {...(activeWindow.assemblyTargetRef === undefined
                  ? {}
                  : { assemblyTargetRef: activeWindow.assemblyTargetRef })}
                {...(portalTargetResolution === undefined ? {} : { portalTargetResolution })}
                {...(onOpenPortalTarget === undefined ? {} : { onOpenPortalTarget })}
                {...(activeWindow.readerRevisionId === undefined
                  ? {}
                  : { readerRevisionId: activeWindow.readerRevisionId })}
                {...(activeWindow.bodyKey !== 'reader'
                  ? {}
                  : { onReturnReaderSource: () => returnReaderToSource(activeWindow) })}
              />
            </div>
            </div>
            {peerWindow !== undefined && peerGroup !== undefined && !compact && <>
              <div role="separator" aria-orientation={region.splitDirection === 'horizontal' ? 'horizontal' : 'vertical'} aria-label="调整分屏比例" tabIndex={0}
                data-lcos-window-splitter
                aria-valuemin={20} aria-valuemax={80} aria-valuenow={Math.round((region.splitRatio ?? 0.5) * 100)}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 0.1 : 0.05;
                  const decrement = region.splitDirection === 'horizontal' ? event.key === 'ArrowUp' : event.key === 'ArrowLeft';
                  const increment = region.splitDirection === 'horizontal' ? event.key === 'ArrowDown' : event.key === 'ArrowRight';
                  const next = event.key === 'Home' ? 0.2 : event.key === 'End' ? 0.8 : decrement ? (region.splitRatio ?? 0.5) - step : increment ? (region.splitRatio ?? 0.5) + step : undefined;
                  if (next === undefined) return;
                  event.preventDefault();
                  useLcosShellStore.getState().setWindowRegionSplitRatio(region.id, next);
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  splitterCleanupRef.current?.();
                  const element = event.currentTarget.parentElement;
                  if (!element) return;
                  const bounds = element.getBoundingClientRect();
                  const panes = [...element.querySelectorAll<HTMLElement>('[data-lcos-window-pane]')];
                  const originalBases = panes.map((pane) => pane.style.flexBasis);
                  let ratio = region.splitRatio ?? 0.5;
                  const update = (move: PointerEvent): void => {
                    ratio = region.splitDirection === 'horizontal'
                      ? (move.clientY - bounds.top) / bounds.height
                      : (move.clientX - bounds.left) / bounds.width;
                    const clamped = Math.min(0.8, Math.max(0.2, ratio));
                    if (panes[0]) panes[0].style.flexBasis = `${clamped * 100}%`;
                    if (panes[1]) panes[1].style.flexBasis = `${(1 - clamped) * 100}%`;
                  };
                  const cleanup = (): void => { window.removeEventListener('pointermove', update); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', cancel); };
                  const finish = (): void => { cleanup(); splitterCleanupRef.current = null; useLcosShellStore.getState().setWindowRegionSplitRatio(region.id, ratio); };
                  const cancel = (): void => { cleanup(); splitterCleanupRef.current = null; panes.forEach((pane, index) => { pane.style.flexBasis = originalBases[index] ?? ''; }); };
                  splitterCleanupRef.current = cleanup;
                  window.addEventListener('pointermove', update); window.addEventListener('pointerup', finish, { once: true }); window.addEventListener('pointercancel', cancel, { once: true });
                }}
                style={{ flex: '0 0 5px', background: 'var(--lcos-window-border)', cursor: region.splitDirection === 'horizontal' ? 'row-resize' : 'col-resize', touchAction: 'none' }} />
              <div data-lcos-window-pane={peerGroup.id} onFocusCapture={() => { if (useLcosShellStore.getState().windows.find((item) => item.active)?.id !== peerWindow.id) activateWindow(peerWindow.id); }} onPointerDownCapture={() => activateWindow(peerWindow.id)} style={{ display: 'flex', flexDirection: 'column', flex: `${((1 - (region.splitRatio ?? 0.5)) * 100)}%`, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
                <div className="cursor-grab active:cursor-grabbing" data-lcos-window-drag-handle="enabled" onPointerDown={(event) => {
                  const tab = (event.target as HTMLElement).closest<HTMLElement>('[data-lcos-window-tab-value]');
                  if (tab !== null) beginWindowGesture(event, region, 'tab', undefined, tab.getAttribute('data-lcos-window-tab-value') ?? undefined);
                  else beginWindowGesture(event, region, 'move');
                }} onClickCapture={(event) => {
                  if (!suppressTabClickRef.current || (event.target as HTMLElement).closest('[data-lcos-window-tab-value]') === null) return;
                  suppressTabClickRef.current = false; event.preventDefault(); event.stopPropagation();
                }}>
                <LcosWindowChrome layout={peerGroup.windowIds.length > 1 ? '分组' : '浮动'} title={peerWindow.title}
                  tabs={peerGroup.windowIds.length > 1 ? peerGroup.windowIds.flatMap((id) => { const window = windows.find((item) => item.id === id); return window ? [{ key: window.bodyKey, value: window.id, label: window.title, selected: window.id === peerWindow.id }] : []; }) : undefined}
                  onSelectTab={(id) => activateWindow(id)}
                  primaryActions={<button type="button" data-lcos-window-icon-button aria-label="关闭窗口" onClick={() => { if (peerWindow.bodyKey === 'reader') returnReaderToSource(peerWindow); else closeWindow(peerWindow.id); }}><X className="h-4 w-4" /></button>} />
                </div>
                <div data-lcos-window-body={peerWindow.bodyKey} data-lcos-window-target={peerWindow.target} className="min-h-0 flex-1 overflow-y-auto" style={{ background: lcosTokens.color.canvas }}>
                  <ProfessionalBody key={`${projectId}:${peerWindow.id}`} projectId={projectId} bodyKey={peerWindow.bodyKey} onClose={() => closeWindow(peerWindow.id)}
                    {...(peerWindow.target === undefined ? {} : { target: peerWindow.target })}
                    {...(peerWindow.targetKind === undefined ? {} : { targetKind: peerWindow.targetKind })}
                    {...(peerWindow.assemblyTargetRef === undefined ? {} : { assemblyTargetRef: peerWindow.assemblyTargetRef })}
                    {...(peerWindow.bodyKey !== 'portal-preview' ? {} : { portalTargetResolution: resolvePortalTarget === undefined || peerWindow.targetKind !== 'canvas' || peerWindow.target === undefined ? null : resolvePortalTarget(peerWindow.target) ?? null })}
                    {...(onOpenPortalTarget === undefined ? {} : { onOpenPortalTarget })}
                    {...(peerWindow.readerRevisionId === undefined ? {} : { readerRevisionId: peerWindow.readerRevisionId })}
                    {...(peerWindow.bodyKey !== 'reader' ? {} : { onReturnReaderSource: () => returnReaderToSource(peerWindow) })} />
                </div>
              </div>
            </>}
          </div>
        );
      })}
      {dropPreview !== null && (() => {
        const rect = dropPreview.action.kind === 'float' ? dropPreview.action.rect : dropPreview.action.previewRect;
        return <div data-lcos-window-drop-preview aria-live="polite" className="pointer-events-none fixed rounded-xl border border-slate-500/70 bg-slate-500/[0.04]" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, zIndex: 60 }}>
        <span className="absolute top-2 whitespace-nowrap rounded-md bg-slate-900/80 px-2 py-1 text-xs text-white" style={dropPreview.action.kind === 'dock-right' ? { right: 36, top: '50%', transform: 'translateY(-50%)' } : { left: 8 }}>{dropPreview.label}</span>
      </div>;
      })()}
    </div>
  );
}

function ProfessionalBody({
  onClose,
  projectId,
  bodyKey,
  target,
  targetKind,
  assemblyTargetRef,
  portalTargetResolution,
  onOpenPortalTarget,
  readerRevisionId,
  onReturnReaderSource,
}: {
  projectId: string;
  bodyKey: string;
  onClose: () => void;
  target?: string;
  targetKind?: 'canvas';
  assemblyTargetRef?: AssemblyTargetRefV1;
  portalTargetResolution?: PortalTargetResolution | null;
  onOpenPortalTarget?: (target: PortalTargetResolution) => void;
  readerRevisionId?: string;
  onReturnReaderSource?: () => void;
}): React.JSX.Element {
  switch (bodyKey) {
    case 'assembly':
      return (
        <AssemblyBody
          projectId={projectId}
          targetRef={assemblyTargetRef ?? { kind: 'main' }}
        />
      );
    case 'reader':
      return (
        <ArtifactReaderBody
          projectId={projectId}
          artifactId={target}
          {...(readerRevisionId === undefined ? {} : { revisionId: readerRevisionId })}
          {...(onReturnReaderSource === undefined ? {} : { onReturnToSource: onReturnReaderSource })}
        />
      );
    case 'archive':
      return <ArchiveBody projectId={projectId} />;
    case 'conversation':
      return <ConversationWorkViewBody projectId={projectId} connectedConversationId={target} />;
    case 'portal-preview':
      return (
        <PortalPreviewBody
          projectId={projectId}
          target={target}
          {...(targetKind ? { targetKind } : {})}
          {...(portalTargetResolution === undefined ? {} : { portalTargetResolution })}
          {...(onOpenPortalTarget === undefined ? {} : { onOpenPortalTarget })}
        />
      );
    case 'runtime-doctor':
      return <RuntimeDoctorBody onClose={onClose} />;
    case 'capture-inbox':
    case 'connector-source':
      // 尚无生产 caller；若由旧状态恢复，只给用户可理解的不可用状态。
      return (
        <div className="flex h-full min-h-[220px] items-center justify-center">
          <span className="text-sm" style={{ color: lcosTokens.color.muted }}>
            此工具当前不可用
          </span>
        </div>
      );
    default:
      return <></>;
  }
}

// 供 stage body 共享玻璃语言
export { lcosGlassStyle };
