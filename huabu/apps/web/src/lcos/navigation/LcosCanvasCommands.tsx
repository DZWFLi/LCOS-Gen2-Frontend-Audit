// LcosCanvasCommands — 画布内命令消费者（canvas-local overlay）。
// 订阅 shell store 的 camera/locate 请求并作用于唯一 Huabu RF instance；
// 只调用 RF 相机命令（zoomIn/zoomOut/setViewport/focusNodesOnCanvas），
// 不建立第二 camera、不读写 node geometry truth。
//
// R2 返工：`fit` 不再用 RF 的裸 fitView（那会把内容很少的画布放大到 217%~348%，
// 文字不可读），改用 GEN2 的纯函数 `fitBoundsWithInsets`：
//   - 取**真实节点包围盒**（store 里的 position + 真实尺寸）；
//   - 让出 HUD / Composer / Dock 的安全边距（这些是屏幕空间浮层，落位算法看不见它们）；
//   - zoom 有可读性上限（默认 1.25）。
// 项目打开后首次拿到节点时做同样的一次取景，作为"首屏构图"。

import {
  computeLocatorGeometry,
  fitBoundsWithInsets,
  initialArrivalState,
  initialLocatorState,
  reduceArrivalState,
  reduceLocatorState,
  type SafeInsets,
  type ArrivalState,
  type LocatorState,
} from '@local-creative-os/web-gen2';
import { useReactFlow, useViewport } from '@xyflow/react';
import { useEffect, useReducer, useRef, useState } from 'react';


import { focusNodesOnCanvas } from '@/components/Panels/CanvasLayerPanel/focusNodesOnCanvas';
import useCanvasStore from '@/store/canvasStore';

import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { lcosTokens } from '../ui/lcosTokens';

import type { Node } from '@xyflow/react';

/** HUD / Composer / Dock 在屏幕上的占用（对齐 R1 族的真实几何 + 24 边距）。 */
const HUD_INSETS: SafeInsets = {
  left: 24 + 52 + 16, // Railway 宽 52 + 左右呼吸
  right: 24 + 24,
  top: 24 + 48 + 16, // NavigatorIsland 高 48
  bottom: 24 + 56 + 16, // Composer 高约 56
};

const LOCATOR_SAFE_INSETS = {
  left: HUD_INSETS.left,
  right: HUD_INSETS.right,
  top: HUD_INSETS.top,
  bottom: HUD_INSETS.bottom,
};

const ARRIVAL_LIFETIME_MS = 720;

interface ArrivalTarget {
  readonly surface: ReturnType<typeof useLcosShellStore.getState>['activeSurface'];
  readonly canvasId: string;
  readonly nodeId: string;
  readonly reqId: string;
}

interface Box {
  width: number;
  height: number;
}

function boxOf(node: Node): Box {
  const raw = node as unknown as {
    measured?: { width?: number; height?: number };
    width?: number;
    height?: number;
    style?: { width?: number | string; height?: number | string };
  };
  const num = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  return {
    width: num(raw.measured?.width) ?? num(raw.width) ?? num(raw.style?.width) ?? 280,
    height: num(raw.measured?.height) ?? num(raw.height) ?? num(raw.style?.height) ?? 200,
  };
}

/** 全部节点的真实包围盒（无节点返回 null）。 */
function contentBounds(nodes: readonly Node[]): { x: number; y: number; width: number; height: number } | null {
  if (nodes.length === 0) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const node of nodes) {
    const box = boxOf(node);
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + box.width);
    maxY = Math.max(maxY, node.position.y + box.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * 该节点是否已有**已知尺寸**。
 *
 * 不能只看 `measured`：Canvas 开了 `onlyRenderVisibleElements`，视口外的节点根本不渲染、
 * 永远拿不到 `measured`；只等 measured 会永远等不到（实测 7 个节点只有 2 个进 DOM，
 * 取景死等超时，首屏停在 1.46 倍，剩下 5 个节点一直不出现）。
 * 引擎在建节点时就把**真实尺寸**写进 `style`（CREATE 回执 width/height），
 * 所以 `measured ?? style` 才是完整事实。
 */
function hasKnownSize(node: Node): boolean {
  const raw = node as unknown as {
    measured?: { width?: number; height?: number };
    width?: number;
    height?: number;
    style?: { width?: number | string; height?: number | string };
  };
  const positive = (value: unknown): boolean =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;
  if (positive(raw.measured?.width) && positive(raw.measured?.height)) return true;
  if (positive(raw.width) && positive(raw.height)) return true;
  return positive(raw.style?.width) && positive(raw.style?.height);
}

export function LcosCanvasCommands(): React.JSX.Element {
  const cameraRequest = useLcosShellStore((s) => s.cameraRequest);
  const locateRequest = useLcosShellStore((s) => s.locateRequest);
  const consumeCamera = useLcosShellStore((s) => s.consumeCamera);
  const consumeLocate = useLcosShellStore((s) => s.consumeLocate);
  const activeSurface = useLcosShellStore((s) => s.activeSurface);
  const canvasId = useCanvasStore((s) => s.canvasId);
  const nodeCount = useCanvasStore((s) => s.nodes.length);
  const rf = useReactFlow();
  const viewport = useViewport();
  const [locatorState, dispatchLocator] = useReducer(
    reduceLocatorState,
    initialLocatorState,
  );
  const [arrivalState, dispatchArrival] = useReducer(
    reduceArrivalState,
    initialArrivalState,
  );
  const [arrivalTarget, setArrivalTarget] = useState<ArrivalTarget | null>(null);
  const locateGeneration = useRef(0);
  const arrivalTimer = useRef<number | null>(null);

  const cancelArrivalTimer = (): void => {
    if (arrivalTimer.current !== null) {
      window.clearTimeout(arrivalTimer.current);
      arrivalTimer.current = null;
    }
  };

  /** 安全取景：节点真实包围盒 + HUD 安全边距 + 可读性 zoom 上限。 */
  const fitWithHud = (duration = 0): void => {
    const nodes = useCanvasStore.getState().nodes;
    const bounds = contentBounds(nodes);
    const size = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!size || size.width <= 0) return;
    const result = fitBoundsWithInsets(bounds, { width: size.width, height: size.height }, HUD_INSETS);
    rf.setViewport(result, duration > 0 ? { duration } : undefined);
  };

  useEffect(() => {
    if (!cameraRequest) return;
    switch (cameraRequest.kind) {
      case 'zoom-in':
        rf.zoomIn({ duration: 220 });
        break;
      case 'zoom-out':
        rf.zoomOut({ duration: 220 });
        break;
      case 'fit':
        fitWithHud(380);
        break;
      case 'reset':
        rf.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 380 });
        break;
    }
    consumeCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraRequest, rf, consumeCamera]);

  // 首屏构图：**在内容补齐期内跟随取景**，补齐之后永久交还相机。
  //
  // 为什么不是"只取一次"：
  //   1) Huabu 自己有 `useInitialCanvasViewport`（只 fit 少数 nodeIdsToFit、不考虑 HUD 安全边距，
  //      实测会把 2 个节点放大到 1.71 倍），它运行期间 `.react-flow` 带 `invisible` 类 —— 必须等它结束；
  //   2) R2 投影是**服务端 RFS 写**，浏览器画布 store 明显滞后（实测 reconcile 结束时 store 里只有
  //      1 个节点，而 bindings 已有 7 条），其余节点还落在视口外；Canvas 又开了
  //      `onlyRenderVisibleElements`，视口外的节点永远不会渲染 —— 于是"只取一次"会把首屏
  //      定死在"只看见 1 个节点"上，永远等不到剩下的内容。
  // 因此：只要**已登记的绑定数还没全部落到画面上**，就允许跟随内容继续取景；
  // 一旦补齐，相机永久交还用户。全程只调用 RF 相机命令，不写任何节点数据。
  const framedRef = useRef<{ canvasId: string | null; count: number }>({
    canvasId: null,
    count: 0,
  });
  // 已登记的 Core 绑定数：绑定到达时触发一次重估（内容可能还没同步到 store）。
  const registeredNodeIds = useLcosReferenceStore((s) => s.nodeEntityRefs);
  const registeredBindingCount = registeredNodeIds.size;
  const canvasLoading = useCanvasStore((s) => s.isLoading);
  useEffect(() => {
    if (canvasId === undefined || canvasLoading) return;
    let cancelled = false;
    let tries = 0;

    const attempt = (): void => {
      if (cancelled) return;
      const nodes = useCanvasStore.getState().nodes;
      const surface = document.querySelector('.react-flow');
      if (nodes.length > 0 && surface !== null && !surface.classList.contains('invisible')) {
        const expected = registeredNodeIds.size;
        // The Gen2 route registers bindings only after reconcile has completed.
        // Fitting before that point races the SSE snapshot and permanently
        // frames the first partial batch. An empty projection has no content
        // to frame, so waiting here is also the honest empty-canvas behavior.
        if (expected === 0) return;
        const presentIds = new Set(nodes.map((node) => node.id));
        const allProjectedNodesPresent = [...registeredNodeIds.keys()].every((id) => presentIds.has(id));
        const framed = framedRef.current;
        const sameCanvas = framed.canvasId === canvasId;
        // One fit after all registered projection nodes have arrived. The
        // binding ids are the completion signal; total node count can include
        // unrelated native nodes and therefore cannot prove projection ready.
        const needFrame = !sameCanvas || framed.count < expected;
        // 尺寸未齐（例如从服务端加载的节点既没有 measured 也没有 style）时先等一会儿，
        // 但必须有上限 —— 否则"视口外节点永不渲染 → 永无量到的尺寸"会死锁成空首屏。
        const allSized = nodes.every(hasKnownSize);
        if (needFrame && allProjectedNodesPresent && allSized) {
          fitWithHud(0);
          framedRef.current = { canvasId, count: expected };
          return;
        }
      }
      tries += 1;
      if (tries < 60) window.setTimeout(attempt, 150);
    };

    window.setTimeout(attempt, 120);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, nodeCount, canvasLoading, registeredBindingCount, rf]);

  useEffect(() => {
    if (!locateRequest || locateRequest.surface !== activeSurface) return;
    if (locateRequest.canvasId && locateRequest.canvasId !== canvasId) return;

    const request = locateRequest;
    const nodeId = request.nodeId;
    const generation = locateGeneration.current + 1;
    locateGeneration.current = generation;
    cancelArrivalTimer();
    dispatchLocator({ type: 'locate-requested' });
    dispatchArrival({ type: 'travel-start' });
    setArrivalTarget(
      nodeId && canvasId
        ? { surface: request.surface, canvasId, nodeId, reqId: request.reqId }
        : null,
    );

    const nodePresent = nodeId !== undefined
      && useCanvasStore.getState().nodes.some((node) => node.id === nodeId);
    if (!nodePresent || nodeId === undefined) {
      dispatchLocator({ type: request.status === 'unavailable' ? 'target-unavailable' : 'target-gone' });
      dispatchArrival({ type: 'cancel' });
      setArrivalTarget(null);
      if (request.status !== 'unavailable') consumeLocate();
      return;
    }

    let active = true;
    const cancelForUserGesture = (): void => {
      if (!active || locateGeneration.current !== generation) return;
      active = false;
      locateGeneration.current += 1;
      cancelArrivalTimer();
      dispatchLocator({ type: 'cancel' });
      dispatchArrival({ type: 'cancel' });
      setArrivalTarget(null);
      // A user gesture wins over an in-flight camera request. Clear only the
      // request this consumer started; a newer request must survive.
      if (useLcosShellStore.getState().locateRequest?.reqId === request.reqId) {
        consumeLocate();
      }
    };
    const flowRoot = document.querySelector('.react-flow');
    flowRoot?.addEventListener('pointerdown', cancelForUserGesture);
    flowRoot?.addEventListener('wheel', cancelForUserGesture, { passive: true });
    flowRoot?.addEventListener('touchstart', cancelForUserGesture, { passive: true });
    void focusNodesOnCanvas(rf, [nodeId]).then((settled) => {
      if (!active || locateGeneration.current !== generation) return;
      if (!settled) {
        dispatchLocator({ type: 'target-gone' });
        dispatchArrival({ type: 'cancel' });
        setArrivalTarget(null);
        if (useLcosShellStore.getState().locateRequest?.reqId === request.reqId) {
          consumeLocate();
        }
        return;
      }

      // The focus helper resolves from Huabu's setCenter promise. Arrival is
      // therefore driven by the actual camera settle, never by a guessed
      // timeout. The request remains alive until the target-local cue closes.
      dispatchLocator({ type: 'camera-settled' });
      dispatchArrival({ type: 'camera-settled' });
      cancelArrivalTimer();
      arrivalTimer.current = window.setTimeout(() => {
        if (locateGeneration.current !== generation) return;
        dispatchLocator({ type: 'arrival-done' });
        dispatchArrival({ type: 'arrival-complete' });
        setArrivalTarget(null);
        consumeLocate();
        arrivalTimer.current = null;
      }, ARRIVAL_LIFETIME_MS);
    });

    return () => {
      active = false;
      flowRoot?.removeEventListener('pointerdown', cancelForUserGesture);
      flowRoot?.removeEventListener('wheel', cancelForUserGesture);
      flowRoot?.removeEventListener('touchstart', cancelForUserGesture);
      locateGeneration.current += 1;
      cancelArrivalTimer();
      dispatchLocator({ type: 'cancel' });
      dispatchArrival({ type: 'cancel' });
      setArrivalTarget(null);
    };
    // The shell request is the existing locate command seam; all state below
    // is transient presentation state owned by this canvas-local consumer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateRequest?.reqId, activeSurface, canvasId, rf]);

  useEffect(() => () => {
    cancelArrivalTimer();
  }, []);

  return (
    <>
      <span
        data-lcos-canvas-commands
        aria-hidden
        className="pointer-events-none absolute top-1 left-1 text-[10px] opacity-60"
        style={{ display: 'none' }}
      >
        {Math.round(viewport.zoom * 100)}%
      </span>
      <LcosLocatorCue
        request={locateRequest}
        activeSurface={activeSurface}
        canvasId={canvasId}
        rf={rf}
        viewport={viewport}
        locatorState={locatorState}
        arrivalState={arrivalState}
        arrivalTarget={arrivalTarget}
      />
    </>
  );
}

function LcosLocatorCue({
  request,
  activeSurface,
  canvasId,
  rf,
  viewport,
  locatorState,
  arrivalState,
  arrivalTarget,
}: {
  readonly request: ReturnType<typeof useLcosShellStore.getState>['locateRequest'];
  readonly activeSurface: ReturnType<typeof useLcosShellStore.getState>['activeSurface'];
  readonly canvasId: string | null | undefined;
  readonly rf: ReturnType<typeof useReactFlow>;
  readonly viewport: ReturnType<typeof useViewport>;
  readonly locatorState: LocatorState;
  readonly arrivalState: ArrivalState;
  readonly arrivalTarget: ArrivalTarget | null;
}): React.JSX.Element | null {
  const presentationRequest = request ?? (
    arrivalTarget === null
      ? null
      : {
          reqId: arrivalTarget.reqId,
          surface: arrivalTarget.surface,
          canvasId: arrivalTarget.canvasId,
          nodeId: arrivalTarget.nodeId,
          status: 'projected' as const,
        }
  );
  if (!presentationRequest || presentationRequest.surface !== activeSurface) return null;
  if (presentationRequest.canvasId !== undefined && presentationRequest.canvasId !== canvasId) return null;

  const root = document.querySelector('.react-flow');
  if (!(root instanceof HTMLElement)) return null;
  const rootRect = root.getBoundingClientRect();
  if (rootRect.width <= 0 || rootRect.height <= 0) return null;

  if (presentationRequest.status === 'unavailable' || locatorState.phase === 'unavailable') {
    return (
      <div
        data-lcos-locator="unavailable"
        role="status"
        className="pointer-events-none fixed z-[65] rounded-full px-3 py-2 text-xs font-medium"
        style={{
          left: rootRect.left + rootRect.width / 2,
          top: rootRect.top + 24,
          transform: 'translateX(-50%)',
          background: lcosTokens.color.inverse,
          color: lcosTokens.color.textOnInverse,
          boxShadow: lcosTokens.glass.shadow,
        }}
      >
        这个对象暂时无法定位
      </div>
    );
  }

  if (!presentationRequest.nodeId) return null;
  const internal = rf.getInternalNode(presentationRequest.nodeId);
  if (!internal || internal.hidden) return null;
  const width = internal.measured.width ?? internal.width ?? internal.initialWidth ?? 280;
  const height = internal.measured.height ?? internal.height ?? internal.initialHeight ?? 200;
  const targetRect = {
    x: rootRect.left + internal.internals.positionAbsolute.x * viewport.zoom + viewport.x,
    y: rootRect.top + internal.internals.positionAbsolute.y * viewport.zoom + viewport.y,
    width: width * viewport.zoom,
    height: height * viewport.zoom,
  };
  const professionalStage = document.querySelector('[data-lcos-professional-stage]');
  const professionalRect = professionalStage instanceof HTMLElement
    ? professionalStage.getBoundingClientRect()
    : undefined;
  const rightInset = professionalRect !== undefined && professionalRect.left > rootRect.left
    ? Math.max(LOCATOR_SAFE_INSETS.right, rootRect.right - professionalRect.left + 16)
    : LOCATOR_SAFE_INSETS.right;
  const safeLeft = rootRect.left + LOCATOR_SAFE_INSETS.left;
  const safeTop = rootRect.top + LOCATOR_SAFE_INSETS.top;
  const safeRect = {
    left: safeLeft,
    top: safeTop,
    // On a narrow viewport a professional window can consume almost the
    // entire width. Keep a one-pixel mathematical safe rect instead of
    // feeding an inverted rectangle into the pure geometry function.
    right: Math.max(safeLeft + 1, rootRect.right - rightInset),
    bottom: Math.max(safeTop + 1, rootRect.bottom - LOCATOR_SAFE_INSETS.bottom),
  };
  const geometry = computeLocatorGeometry({
    safeRect,
    targetRect: {
      left: targetRect.x,
      top: targetRect.y,
      right: targetRect.x + targetRect.width,
      bottom: targetRect.y + targetRect.height,
    },
    edgeInset: 12,
    nearEdgeDistance: 72,
  });

  if (arrivalState.phase === 'arriving' && arrivalTarget !== null) {
    return (
      <div
        data-lcos-arrival="arriving"
        data-lcos-arrival-node-id={arrivalTarget.nodeId}
        role="status"
        aria-label="已抵达目标"
        className="lcos-static-pulse pointer-events-none fixed z-[65] rounded-xl"
        style={{
          left: targetRect.x,
          top: targetRect.y,
          width: targetRect.width,
          height: targetRect.height,
          border: `2px solid ${lcosTokens.color.accent}`,
          boxShadow: `0 0 0 6px color-mix(in srgb, ${lcosTokens.color.accent} 18%, transparent)`,
        }}
      />
    );
  }

  if (locatorState.phase === 'arriving' || locatorState.phase === 'hidden') return null;
  if (geometry.state === 'local') return null;

  const anchor = geometry.edgeAnchor ?? geometry.directionAnchor ?? geometry.targetCenter;
  const angle = Math.atan2(geometry.direction.y, geometry.direction.x) * 180 / Math.PI;
  return (
    <div
      data-lcos-locator={geometry.state}
      role="status"
      aria-label={geometry.state === 'edge' ? '目标在画外，正在抵达' : '目标接近画布边缘'}
      className="pointer-events-none fixed z-[65] flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"
      style={{
        left: anchor.x,
        top: anchor.y,
        transform: 'translate(-50%, -50%)',
          background: lcosTokens.color.inverse,
          color: lcosTokens.color.textOnInverse,
          boxShadow: lcosTokens.glass.shadow,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 0,
          height: 0,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: '6px solid currentColor',
          transform: `rotate(${angle}deg)`,
        }}
      />
      {geometry.state === 'edge' ? '正在定位' : '目标在边缘'}
    </div>
  );
}
