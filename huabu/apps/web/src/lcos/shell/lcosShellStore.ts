// lcosShellStore — LCOS 局部 UI intent（可丢失）。禁止放 Project/Run/Relation truth。
// 只放：activeSurface、open region、draft、focus/hover 等 ephemeral intent。

import { create } from 'zustand';

import type { CanvasViewport } from '@huabu/shared';
import type { AssemblyTargetRefV1 } from '@local-creative-os/contracts';
import type {
  ProfessionalRectV1,
  ProfessionalWindowEnvironmentV1,
} from '@local-creative-os/web-gen2';

export type LcosSurfaceKey = 'main' | 'context' | 'workflow';

export const LCOS_SURFACES: readonly { key: LcosSurfaceKey; label: string }[] =
  [
    { key: 'main', label: 'Main' },
    { key: 'context', label: 'Context' },
    { key: 'workflow', label: 'Workflow' },
  ];

export const SURFACE_LABEL: Readonly<Record<LcosSurfaceKey, string>> = {
  main: 'Main',
  context: 'Context',
  workflow: 'Workflow',
};

export interface LcosLocateRequest {
  /** 请求唯一 id（pipeline 消费后 clear，避免重复 focus）。 */
  readonly reqId: string;
  /** 目标现场；与当前现场不同时先切现场再 pendingFocus。 */
  readonly surface: LcosSurfaceKey;
  /** 目标 canvasId（可选；resolve 用 workspace）。 */
  readonly canvasId?: string;
  /** 当前现场已存在该 nodeId → 直接 focus（无需换现场）。 */
  readonly nodeId?: string;
  /**
   * 同一次空间定位需要一起选择/取景的节点。`nodeId` 仍是到达提示的主目标；
   * 相机与 selection 只由当前 Huabu canvas consumer 执行，不在 Shell 保存第二份状态。
   */
  readonly nodeIds?: readonly string[];
  /** 未投影 → unavailable 展示原因（不假定位）。 */
  readonly status?: 'projected' | 'unprojected' | 'unavailable';
}

/** Known canonical entity handed to the existing Focus/Where occurrence resolver. */
export interface LcosFocusWhereRequest {
  readonly reqId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly title?: string;
}

/**
 * Same-tab return context for a Context/Workflow child worksite.
 * This is UI navigation state only; the workspace and canvas remain owned by Core/Huabu.
 */
export interface LcosChildReturn {
  readonly projectId: string;
  readonly sourceSurface: LcosSurfaceKey;
  readonly sourceWorkspaceId?: string;
  readonly sourceWasChild: boolean;
  readonly sourceCanvasId?: string;
  /** Snapshot of the Huabu viewport at entry; restored through the same canvas store on return. */
  readonly sourceViewport?: CanvasViewport;
  /** The visible approach pose reached before entry; used only as the first return frame. */
  readonly sourceApproachViewport?: CanvasViewport;
  readonly selectedNodeIds: readonly string[];
  /** Canonical entity refs for the selected nodes; node ids alone are not enough after reconcile. */
  readonly sourceEntityRefs?: readonly {
    readonly nodeId: string;
    readonly entityType: string;
    readonly entityId: string;
  }[];
}

export interface LcosWorksiteCameraTransition {
  readonly id: string;
  readonly canvasId: string;
  readonly kind: 'enter-settle' | 'return-restore';
  /** First rendered pose for the destination Canvas mount. */
  readonly startViewport?: CanvasViewport;
  /** Exact settle pose owned by the destination Huabu viewport. */
  readonly targetViewport?: CanvasViewport;
}

export type LcosCameraCommandKind = 'zoom-in' | 'zoom-out' | 'fit' | 'reset';

/** Selection-local Composer intent. It is ephemeral UI state, never Run truth. */
export interface LcosComposerTarget {
  readonly nodeId: string;
  /** User-facing target identity captured from the selected node. */
  readonly title: string;
  readonly anchor: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly workspaceId?: string;
  /**
   * Composer intent is explicit: delegate creates a canonical Run;
   * continue sends into the existing connected conversation.
   */
  readonly intent?: 'delegate' | 'continue';
  /** Canonical connected-conversation receiver, only set after an explicit Core identity read. */
  readonly receiverConversationId?: string;
  /** Caller-owned continuation journal identity for `intent: continue`. */
  readonly continuationOperationId?: string;
  /** Caller-owned message identity for idempotent live send. */
  readonly messageId?: string;
  /** Optional honest block reason for a host that cannot resolve a receiver yet. */
  readonly receiverBlockedReason?: string;
}

/** Professional body 键（body registry）。 */
export type LcosProfessionalBodyKey =
  | 'assembly'
  | 'reader'
  | 'conversation'
  | 'portal-preview'
  | 'runtime-doctor'
  | 'capture-inbox'
  | 'connector-source';

export interface LcosWindow {
  readonly id: string;
  readonly bodyKey: LcosProfessionalBodyKey;
  readonly title: string;
  /** body 上下文（如 artifactId / projectId）。 */
  readonly target?: string;
  /** Explicit address kind; an entity id must never be fetched as a canvas id. */
  readonly targetKind?: 'canvas';
  /** Assembly caller 注入的 canonical target；Assembly 本身不保存 target truth。 */
  readonly assemblyTargetRef?: AssemblyTargetRefV1;
  /** Reader 的 canonical revision target；缺失表示由 Reader 恢复最后一次 UI 阅读目标。 */
  readonly readerRevisionId?: string;
  /** 打开 Reader 的真实节点来源；只用于关闭/返回时定位，不复制 Canvas geometry。 */
  readonly readerSource?: LcosReaderSourceV1;
  readonly active: boolean;
}

export interface LcosReaderSourceV1 {
  readonly surface: LcosSurfaceKey;
  readonly nodeId: string;
}

export interface LcosReaderOpenOptionsV1 {
  readonly revisionId?: string;
  readonly source?: LcosReaderSourceV1;
}

export interface LcosReaderPositionV1 {
  readonly scrollTop: number;
  readonly zoom: number;
}

/**
 * Window topology intent is separate from the window instances themselves.
 * A region owns grouping/layout; an instance owns body identity and target.
 * Geometry is published by ProfessionalWindowStage, never inferred here.
 */
export type LcosWindowRegionLayout = 'floating' | 'docked-right';

export interface LcosWindowRegion {
  readonly id: string;
  readonly layout: LcosWindowRegionLayout;
  readonly windowIds: readonly string[];
  readonly activeWindowId: string;
  /**
   * R2-B：用户显式几何 override（仅 floating 生效）。缺省 = 由 Stage 派生初始摆放。
   * 它进 `windowRegions` 而不是 body 局部 state —— 拓扑/几何只有这一份真相，
   * 因此工程/现场往返回来时几何随拓扑一起恢复。
   */
  readonly rect?: ProfessionalRectV1;
  /** R2-B：用户显式 dock 宽度（仅 docked-right 生效）。缺省 = 该 region 的 preferredWidth。 */
  readonly dockWidth?: number;
}

export interface LcosShellUiState {
  projectId: string | null;
  activeSurface: LcosSurfaceKey;
  /** 当前 Surface 对应的真实 Core workspace；只读镜像，用于 Run/Assembly target。 */
  activeWorkspaceId: string | null;
  /** 现场 → stable canvasId（只读镜像；真实性来自 Core workspaces）。 */
  surfaceCanvasId: Readonly<Partial<Record<LcosSurfaceKey, string>>>;
  /** 画布内待执行命令（route-level 组件发布，canvas-local overlay 消费）。 */
  cameraRequest: { id: number; kind: LcosCameraCommandKind } | null;
  locateRequest: LcosLocateRequest | null;
  focusWhereRequest: LcosFocusWhereRequest | null;
  composerOpen: boolean;
  composerTarget: LcosComposerTarget | null;
  composerPrompt: string;
  /** route-level Professional 窗口（只放窗口拓扑 intent；body 数据仍在 Core）。 */
  windows: readonly LcosWindow[];
  /** Window instances → regions 的拓扑关系；不会把所有 instance 自动变成一个 tab 组。 */
  windowRegions: readonly LcosWindowRegion[];
  /** Reader UI-only 会话状态；key = JSON([project, artifact, revision])。 */
  readerPositions: Readonly<Record<string, LcosReaderPositionV1>>;
  /** Reader 最近目标 revision；key = JSON([project, artifact])。 */
  readerLastRevisions: Readonly<Record<string, string>>;
  /** 由 ProfessionalWindowStage 唯一发布的临时占位环境。 */
  windowEnvironment: ProfessionalWindowEnvironmentV1 | null;
  /** Child worksite 的来源现场；刷新后允许丢失，返回按钮仍有安全 fallback。 */
  childReturn: LcosChildReturn | null;
  /** One-shot camera intent consumed by the matching Huabu Canvas mount. */
  worksiteCameraTransition: LcosWorksiteCameraTransition | null;
  setProject(projectId: string): void;
  setActiveSurface(surface: LcosSurfaceKey): void;
  setActiveWorkspaceId(workspaceId: string | null): void;
  setSurfaceCanvasId(surface: LcosSurfaceKey, canvasId: string): void;
  setSurfaceCanvasMap(
    map: Readonly<Partial<Record<LcosSurfaceKey, string>>>,
  ): void;
  beginChildNavigation(returnContext: LcosChildReturn): void;
  clearChildNavigation(): void;
  requestWorksiteCameraTransition(
    transition: Omit<LcosWorksiteCameraTransition, 'id'>,
  ): string;
  updateWorksiteCameraTransition(
    id: string,
    patch: Pick<LcosWorksiteCameraTransition, 'startViewport' | 'targetViewport'>,
  ): void;
  consumeWorksiteCameraTransition(id: string): void;
  requestCamera(kind: LcosCameraCommandKind): void;
  requestLocate(request: LcosLocateRequest): void;
  requestFocusWhere(request: LcosFocusWhereRequest): void;
  consumeCamera(): void;
  consumeLocate(): void;
  consumeFocusWhere(): void;
  openComposer(target: LcosComposerTarget): void;
  closeComposer(): void;
  setComposerPrompt(prompt: string): void;
  clearSubmittedComposerPrompt(projectId: string, target: LcosComposerTarget, prompt: string): void;
  openWindow(
    bodyKey: LcosProfessionalBodyKey,
    title: string,
    target?: string,
    targetKind?: 'canvas',
  ): void;
  openReader(title: string, artifactId: string, options?: LcosReaderOpenOptionsV1): void;
  rememberReaderPosition(key: string, value: LcosReaderPositionV1): void;
  rememberReaderRevision(key: string, revisionId: string): void;
  clearReaderContinuity(): void;
  openAssembly(targetRef: AssemblyTargetRefV1, title?: string): void;
  closeWindow(id: string): void;
  activateWindow(id: string): void;
  setWindowRegionLayout(regionId: string, layout: LcosWindowRegionLayout): void;
  /** R2-B：提交一次 move/resize 后的 region 几何（唯一几何真相仍是 windowRegions）。 */
  setWindowRegionRect(regionId: string, rect: ProfessionalRectV1): void;
  /** R2-B：提交 docked-right 的宽度（左缘 resize）。 */
  setWindowRegionDockWidth(regionId: string, dockWidth: number): void;
  /**
   * R2-B 显式分组：把 sourceRegion 的**全部**窗口并进 targetRegion 成为 tab，
   * sourceRegion 消失。绝不自动把多个 instance 合成一个 tab 组 —— 只有本动作会。
   */
  groupWindowRegions(sourceRegionId: string, targetRegionId: string): void;
  /** R2-B 显式取消分组：把该 region 的活动窗口拆成独立 floating region。 */
  ungroupWindowRegion(regionId: string): void;
  publishWindowEnvironment(environment: ProfessionalWindowEnvironmentV1): void;
  clearWindowEnvironment(): void;
  clear(): void;
}

type ProjectUiSession = Pick<LcosShellUiState,
  'windows' | 'windowRegions' | 'composerPrompt' | 'composerTarget' | 'composerOpen' | 'activeSurface'>;

// Same-tab project switching only. This is UI continuity, not reload persistence.
const projectUiSessions = new Map<string, ProjectUiSession>();

/** Caller-owned identity for one live continuation message. */
function createComposerMessageId(): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  return randomUuid !== undefined
    ? randomUuid.call(globalThis.crypto)
    : `message-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useLcosShellStore = create<LcosShellUiState>((set) => ({
  projectId: null,
  activeSurface: 'main',
  activeWorkspaceId: null,
  surfaceCanvasId: {},
  cameraRequest: null,
  locateRequest: null,
  focusWhereRequest: null,
  composerOpen: false,
  composerTarget: null,
  composerPrompt: '',
  windows: [],
  windowRegions: [],
  readerPositions: {},
  readerLastRevisions: {},
  windowEnvironment: null,
  childReturn: null,
  worksiteCameraTransition: null,
  setProject: (projectId) => set((state) => {
    if (state.projectId === projectId) return state;
    if (state.projectId !== null) {
      projectUiSessions.set(state.projectId, {
        windows: state.windows,
        windowRegions: state.windowRegions,
        composerPrompt: state.composerPrompt,
        composerTarget: state.composerTarget,
        composerOpen: state.composerOpen,
        activeSurface: state.activeSurface,
      });
    }
    const restored = projectUiSessions.get(projectId);
    return {
      projectId,
      windows: restored?.windows ?? [],
      windowRegions: restored?.windowRegions ?? [],
      windowEnvironment: null,
      composerPrompt: restored?.composerPrompt ?? '',
      composerTarget: restored?.composerTarget ?? null,
      composerOpen: restored?.composerOpen ?? false,
      activeSurface: restored?.activeSurface ?? 'main',
      childReturn: null,
      worksiteCameraTransition: null,
      activeWorkspaceId: null,
      surfaceCanvasId: {},
      cameraRequest: null,
      locateRequest: null,
      focusWhereRequest: null,
    };
  }),
  setActiveSurface: (activeSurface) => set({ activeSurface }),
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
  setSurfaceCanvasId: (surface, canvasId) =>
    set((s) => ({
      surfaceCanvasId: { ...s.surfaceCanvasId, [surface]: canvasId },
    })),
  setSurfaceCanvasMap: (map) => set({ surfaceCanvasId: map }),
  beginChildNavigation: (childReturn) => set({ childReturn }),
  clearChildNavigation: () => set({ childReturn: null }),
  requestWorksiteCameraTransition: (transition) => {
    const id = globalThis.crypto?.randomUUID?.()
      ?? `worksite-camera-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set({ worksiteCameraTransition: { id, ...transition } });
    return id;
  },
  updateWorksiteCameraTransition: (id, patch) => set((state) =>
    state.worksiteCameraTransition?.id === id
      ? { worksiteCameraTransition: { ...state.worksiteCameraTransition, ...patch } }
      : state),
  consumeWorksiteCameraTransition: (id) => set((state) =>
    state.worksiteCameraTransition?.id === id
      ? { worksiteCameraTransition: null }
      : state),
  requestCamera: (kind) =>
    set((s) => ({
      cameraRequest: { id: (s.cameraRequest?.id ?? 0) + 1, kind },
    })),
  requestLocate: (request) => set({ locateRequest: request }),
  requestFocusWhere: (request) => set({ focusWhereRequest: request }),
  consumeCamera: () => set({ cameraRequest: null }),
  consumeLocate: () => set({ locateRequest: null }),
  consumeFocusWhere: () => set({ focusWhereRequest: null }),
  openComposer: (composerTarget) => set({ composerOpen: true, composerTarget }),
  closeComposer: () => set({ composerOpen: false }),
  setComposerPrompt: (composerPrompt) => set({ composerPrompt }),
  clearSubmittedComposerPrompt: (projectId, target, prompt) => set((state) => {
    if (state.projectId === projectId) {
      if (state.composerTarget !== target || state.composerPrompt !== prompt) return state;
      return target.intent === 'continue'
        ? { composerPrompt: '', composerTarget: { ...target, messageId: createComposerMessageId() } }
        : { composerPrompt: '' };
    }
    const saved = projectUiSessions.get(projectId);
    if (saved?.composerTarget === target && saved.composerPrompt === prompt) {
      projectUiSessions.set(projectId, target.intent === 'continue'
        ? { ...saved, composerPrompt: '', composerTarget: { ...target, messageId: createComposerMessageId() } }
        : { ...saved, composerPrompt: '' });
    }
    return state;
  }),
  openWindow: (bodyKey, title, target, targetKind) =>
    set((s) => {
      const existing = s.windows.find(
        (w) =>
          w.bodyKey === bodyKey &&
          w.targetKind === targetKind &&
          w.target === target,
      );
      if (existing) {
        return {
          windows: s.windows.map((w) => ({
            ...w,
            active: w.id === existing.id,
          })),
          windowRegions: s.windowRegions.map((region) =>
            region.windowIds.includes(existing.id)
              ? { ...region, activeWindowId: existing.id }
              : region,
          ),
        };
      }
      const id = `${bodyKey}-${crypto.randomUUID()}`;
      return {
        windows: [
          ...s.windows.map((w) => ({ ...w, active: false })),
          { id, bodyKey, title, target, ...(targetKind ? { targetKind } : {}), active: true },
        ],
        windowRegions: [
          ...s.windowRegions.map((region) => ({ ...region, activeWindowId: region.activeWindowId })),
          { id: `region-${id}`, layout: 'floating', windowIds: [id], activeWindowId: id },
        ],
      };
    }),
  openReader: (title, artifactId, options) =>
    set((state) => {
      const revisionId = options?.revisionId;
      const existing = state.windows.find((window) =>
        window.bodyKey === 'reader'
        && window.target === artifactId
        && window.readerRevisionId === revisionId);
      if (existing !== undefined) {
        return {
          windows: state.windows.map((window) => window.id === existing.id
            ? {
                ...window,
                title,
                ...(options?.source === undefined ? {} : { readerSource: options.source }),
                active: true,
              }
            : { ...window, active: false }),
          windowRegions: state.windowRegions.map((region) => region.windowIds.includes(existing.id)
            ? { ...region, activeWindowId: existing.id }
            : region),
        };
      }
      const id = `reader-${crypto.randomUUID()}`;
      return {
        windows: [
          ...state.windows.map((window) => ({ ...window, active: false })),
          {
            id,
            bodyKey: 'reader',
            title,
            target: artifactId,
            ...(revisionId === undefined ? {} : { readerRevisionId: revisionId }),
            ...(options?.source === undefined ? {} : { readerSource: options.source }),
            active: true,
          },
        ],
        windowRegions: [
          ...state.windowRegions,
          { id: `region-${id}`, layout: 'floating', windowIds: [id], activeWindowId: id },
        ],
      };
    }),
  rememberReaderPosition: (key, value) => set((state) => ({
    readerPositions: { ...state.readerPositions, [key]: value },
  })),
  rememberReaderRevision: (key, revisionId) => set((state) => ({
    readerLastRevisions: { ...state.readerLastRevisions, [key]: revisionId },
  })),
  clearReaderContinuity: () => set({ readerPositions: {}, readerLastRevisions: {} }),
  openAssembly: (assemblyTargetRef, title = 'Assembly') =>
    set((s) => {
      // R4 / C1-3：一个 Project 只有一个共享 Assembly region。
      // target 不编码进 regionId —— 换 target 只 live 更新同一 instance 的
      // assemblyTargetRef/title 并激活它所在区域，绝不新建第二个 Assembly、也不重建 body。
      const shared = s.windows.find((window) => window.bodyKey === 'assembly');
      if (shared !== undefined) {
        const hostRegion = s.windowRegions.find((region) => region.windowIds.includes(shared.id));
        return {
          windows: s.windows.map((window) =>
            window.id === shared.id
              ? { ...window, title, assemblyTargetRef, active: true }
              : { ...window, active: false }),
          // 保留该 region 既有 geometry / dock / group topology，只把活动窗口指回 Assembly。
          windowRegions: s.windowRegions.map((region) =>
            hostRegion !== undefined && region.id === hostRegion.id
              ? { ...region, activeWindowId: shared.id }
              : region),
        };
      }
      const id = 'assembly';
      return {
        windows: [
          ...s.windows.map((window) => ({ ...window, active: false })),
          {
            id,
            bodyKey: 'assembly',
            title,
            assemblyTargetRef,
            active: true,
          },
        ],
        windowRegions: [
          ...s.windowRegions.map((region) => ({ ...region, activeWindowId: region.activeWindowId })),
          { id: `region-${id}`, layout: 'floating', windowIds: [id], activeWindowId: id },
        ],
      };
    }),
  closeWindow: (id) =>
    set((s) => {
      const remaining = s.windows.filter((w) => w.id !== id);
      const windowRegions = s.windowRegions
        .map((region) => {
          if (!region.windowIds.includes(id)) return region;
          const windowIds = region.windowIds.filter((windowId) => windowId !== id);
          if (windowIds.length === 0) return undefined;
          const activeWindowId = region.activeWindowId === id
            ? windowIds[windowIds.length - 1]
            : region.activeWindowId;
          return { ...region, windowIds, activeWindowId };
        })
        .filter((region): region is LcosWindowRegion => region !== undefined);
      if (remaining.length === 0) return { windows: [], windowRegions };
      const anyActive = remaining.some((w) => w.active);
      return {
        windows: anyActive
          ? remaining
          : remaining.map((w, i) =>
              i === remaining.length - 1 ? { ...w, active: true } : w,
            ),
        windowRegions,
      };
    }),
  activateWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => ({ ...w, active: w.id === id })),
      windowRegions: s.windowRegions.map((region) =>
        region.windowIds.includes(id) ? { ...region, activeWindowId: id } : region,
      ),
    })),
  setWindowRegionLayout: (regionId, layout) =>
    set((s) => ({
      windowRegions: s.windowRegions.map((region) =>
        region.id === regionId ? { ...region, layout } : region,
      ),
    })),
  // R2-B：几何 override 写回 windowRegions —— 拓扑与几何同一份真相，工程往返可恢复。
  setWindowRegionRect: (regionId, rect) =>
    set((s) => ({
      windowRegions: s.windowRegions.map((region) =>
        region.id === regionId ? { ...region, rect } : region,
      ),
    })),
  setWindowRegionDockWidth: (regionId, dockWidth) =>
    set((s) => ({
      windowRegions: s.windowRegions.map((region) =>
        region.id === regionId ? { ...region, dockWidth: Math.max(1, Math.round(dockWidth)) } : region,
      ),
    })),
  // R2-B 显式分组：只有这个动作会把多个 region 合成一个 tab 组。
  groupWindowRegions: (sourceRegionId, targetRegionId) =>
    set((s) => {
      if (sourceRegionId === targetRegionId) return s;
      const source = s.windowRegions.find((region) => region.id === sourceRegionId);
      const target = s.windowRegions.find((region) => region.id === targetRegionId);
      if (source === undefined || target === undefined) return s;
      const merged = [...target.windowIds];
      for (const windowId of source.windowIds) {
        if (!merged.includes(windowId)) merged.push(windowId);
      }
      return {
        windowRegions: s.windowRegions
          .filter((region) => region.id !== sourceRegionId)
          .map((region) =>
            region.id === targetRegionId
              ? {
                  ...region,
                  windowIds: merged,
                  activeWindowId: source.activeWindowId,
                  // tab 顶栏接管呈现：dock 专用宽度不再适用，几何交回 Stage 派生。
                  ...(region.dockWidth === undefined ? {} : { dockWidth: undefined }),
                }
              : region,
          ),
      };
    }),
  // R2-B 显式取消分组：把活动窗口拆出去，剩余窗口留在原 region。
  ungroupWindowRegion: (regionId) =>
    set((s) => {
      const source = s.windowRegions.find((region) => region.id === regionId);
      if (source === undefined || source.windowIds.length < 2) return s;
      const detached = source.windowIds.filter((windowId) => windowId !== source.activeWindowId);
      const nextRegionId = `region-${source.activeWindowId}`;
      if (s.windowRegions.some((region) => region.id === nextRegionId)) return s;
      const index = s.windowRegions.findIndex((region) => region.id === regionId);
      const regions = s.windowRegions.map((region) =>
        region.id === regionId
          ? { ...region, windowIds: detached, activeWindowId: detached[detached.length - 1]! }
          : region,
      );
      regions.splice(index + 1, 0, {
        id: nextRegionId,
        layout: 'floating',
        windowIds: [source.activeWindowId],
        activeWindowId: source.activeWindowId,
      });
      return { windowRegions: regions };
    }),
  publishWindowEnvironment: (windowEnvironment) => set({ windowEnvironment }),
  clearWindowEnvironment: () => set({ windowEnvironment: null }),
  clear: () => {
    projectUiSessions.clear();
    set({
      projectId: null,
      activeSurface: 'main',
      activeWorkspaceId: null,
      surfaceCanvasId: {},
      cameraRequest: null,
      locateRequest: null,
      focusWhereRequest: null,
      composerOpen: false,
      composerTarget: null,
      composerPrompt: '',
      windows: [],
      windowRegions: [],
      readerPositions: {},
      readerLastRevisions: {},
      windowEnvironment: null,
      childReturn: null,
      worksiteCameraTransition: null,
    });
  },
}));
