// LcosProjectShell — LCOS 项目级 Shell（Figma ProjectShell 5386:436；route-level 唯一组合根）。
// 组成：项目身份胶囊（顶左）+ 三现场舞台（唯一 Canvas）+ GlobalHud（Navigator/Railway/Dock/camera）。
// Professional Stage 常驻；Composer 仅由 canvas-local 明确命令按需挂载。

import { ArrowLeft, Hand } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useCanvasStore from '@/store/canvasStore';

import { LcosGlobalHud } from './LcosGlobalHud';
import { useLcosShellStore, type LcosSurfaceKey } from './lcosShellStore';
import { LcosWorksiteStage } from './LcosWorksiteStage';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { beginChildWorksiteNavigation } from '../navigation/childWorksiteNavigation';
import { waitForProjectedEntity } from '../navigation/waitForProjectedEntity';
import { childSurfaceForItem } from '../navigation/workspaceTargets';
import { ProfessionalWindowStage } from '../professional/ProfessionalWindowStage';
import { ContextWorksite } from '../surfaces/context/ContextWorksite';
import { MainWorksite } from '../surfaces/main/MainWorksite';
import { WorkflowHandOverlay, WorkflowWorksite } from '../surfaces/workflow/WorkflowWorksite';
import { LcosProjectIdentityView } from '../ui/families/LcosProjectIdentityView';
import { FigmaShellGlyph } from '../ui/FigmaShellGlyph';
import { LcosSurfaceFeedback } from '../ui/LcosSurfaceFeedback';
import { lcosGlassStyle, lcosTokens } from '../ui/lcosTokens';

import type { PortalTargetResolution } from '../professional/PortalPreviewBody';
import type { Workspace } from '@local-creative-os/domain';

export interface LcosProjectShellProps {
  readonly projectId: string;
  readonly projectName: string | null;
  readonly surface: LcosSurfaceKey;
  readonly workspaces: readonly Workspace[];
  /** Explicit child worksite identity from ?workspaceId=; never inferred from surface. */
  readonly childWorkspaceId?: string;
  readonly canvasBySurface: Readonly<Partial<Record<LcosSurfaceKey, string>>>;
  readonly surfaceByWorkspace: Readonly<Map<string, LcosSurfaceKey>>;
  readonly ensureCanvas: (
    surface: LcosSurfaceKey,
    force?: boolean,
  ) => Promise<string | undefined>;
  readonly ensureWorkspaceCanvas: (workspaceId: string, force?: boolean) => Promise<string | undefined>;
  readonly ensureError?: string;
  readonly shellStatus: 'loading' | 'ready' | 'offline' | 'error';
  readonly onRetry: () => void;
}

export function LcosProjectShell({
  projectId,
  projectName,
  surface,
  workspaces,
  childWorkspaceId,
  canvasBySurface,
  surfaceByWorkspace,
  ensureCanvas,
  ensureWorkspaceCanvas,
  ensureError,
  shellStatus,
  onRetry,
}: LcosProjectShellProps): React.JSX.Element {
  const navigate = useNavigate();
  const activeSurface = useLcosShellStore((s) => s.activeSurface);
  const stateProjectId = useLcosShellStore((s) => s.projectId);
  const setActiveSurface = useLcosShellStore((s) => s.setActiveSurface);
  const setActiveWorkspaceId = useLcosShellStore(
    (s) => s.setActiveWorkspaceId,
  );
  const activeWorkspaceId = useLcosShellStore((s) => s.activeWorkspaceId);
  const childReturn = useLcosShellStore((s) => s.childReturn);
  const clearChildNavigation = useLcosShellStore((s) => s.clearChildNavigation);
  const setProject = useLcosShellStore((s) => s.setProject);
  const openAssembly = useLcosShellStore((s) => s.openAssembly);
  const mainNodeCount = useCanvasStore((s) => s.nodes.length);
  const [mainHandOpen, setMainHandOpen] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState<string | undefined>(undefined);

  const resolvePortalTarget = (canvasId: string): PortalTargetResolution | undefined => {
    const workspace = workspaces.find((candidate) => candidate.canvasId === canvasId);
    if (workspace === undefined) return undefined;
    const targetSurface = childSurfaceForItem({ kind: 'scene' }, workspace);
    return targetSurface === undefined
      ? undefined
      : { canvasId, workspaceId: String(workspace.id), targetSurface };
  };

  const openPortalTarget = (target: PortalTargetResolution): void => {
    const workspace = workspaces.find(
      (candidate) => String(candidate.id) === target.workspaceId && candidate.canvasId === target.canvasId,
    );
    if (workspace === undefined) return;
    const resolvedSurface = childSurfaceForItem({ kind: 'scene' }, workspace);
    if (resolvedSurface !== target.targetSurface) return;
    beginChildWorksiteNavigation({
      projectId,
      sourceSurface: surface,
      ...(activeWorkspaceId === null ? {} : { sourceWorkspaceId: activeWorkspaceId }),
      sourceWasChild: childWorkspaceId !== undefined,
      targetSurface: target.targetSurface,
      targetWorkspace: workspace,
      navigate,
    });
  };

  const childWorkspace = childWorkspaceId === undefined
    ? undefined
    : workspaces.find((workspace) => String(workspace.id) === childWorkspaceId);
  const effectiveCanvasBySurface = childWorkspaceId === undefined
    ? canvasBySurface
    : { ...canvasBySurface, [surface]: childWorkspace?.canvasId };
  const childUnavailable = childWorkspaceId !== undefined && (
    (shellStatus === 'ready' && childWorkspace === undefined) ||
    (childWorkspace !== undefined && childWorkspace.canvasId === undefined)
  );
  const ensureActiveCanvas = childWorkspaceId !== undefined
    ? (_surface: LcosSurfaceKey, force = false) => ensureWorkspaceCanvas(childWorkspaceId, force)
    : ensureCanvas;

  useEffect(() => { setMainHandOpen(false); }, [projectId, activeSurface]);

  useEffect(() => {
    useLcosReferenceStore.getState().setProject(projectId);
    setProject(projectId);
    setActiveSurface(surface);
  }, [projectId, surface, setProject, setActiveSurface]);

  useEffect(() => {
    const workspaceId = childWorkspaceId ?? [...surfaceByWorkspace.entries()].find(
      ([, mappedSurface]) => mappedSurface === activeSurface,
    )?.[0];
    setActiveWorkspaceId(workspaceId ?? null);
  }, [activeSurface, childWorkspaceId, setActiveWorkspaceId, surfaceByWorkspace]);

  const returnToSource = (): void => {
    if (returning) return;
    const context = childReturn;
    setReturning(true);
    setReturnError(undefined);
    void (async () => {
      try {
        if (context?.projectId === projectId && context.sourceCanvasId !== undefined) {
          const loaded = await useCanvasStore.getState().switchCanvas(context.sourceCanvasId);
          if (!loaded) throw new Error('来源现场暂不可读取，请重试');
          // Restore the exact source camera through Huabu's existing canvas
          // store. This is a one-shot return restore; it does not create a
          // second camera or persist navigation state as Core truth.
          if (context.sourceViewport !== undefined) {
            useCanvasStore.getState().setViewport(context.sourceViewport);
          }
          const canvasState = useCanvasStore.getState();
          const currentNodeIds = new Set(canvasState.nodes.map((node) => node.id));
          const restoredNodeIds = new Set(
            context.selectedNodeIds.filter((nodeId) => currentNodeIds.has(nodeId)),
          );
          // Node ids are spatial projection ids, not Core identity. If a
          // reconcile rebuilt a selected node with a new id, resolve the
          // captured entity ref against the current projection before
          // selecting. This keeps sourceEntityRefs a real recovery input.
          for (const ref of context.sourceEntityRefs ?? []) {
            if (currentNodeIds.has(ref.nodeId)) {
              restoredNodeIds.add(ref.nodeId);
              continue;
            }
            const reboundNodeId = await waitForProjectedEntity({
              projectId,
              canvasId: context.sourceCanvasId,
              entityType: ref.entityType,
              entityId: ref.entityId,
              timeoutMs: 5000,
            });
            if (reboundNodeId !== undefined) restoredNodeIds.add(reboundNodeId);
          }
          canvasState.selectNodes([...restoredNodeIds]);
        }
        if (context?.projectId === projectId) clearChildNavigation();
        const sourceSurface = context?.projectId === projectId ? context.sourceSurface : 'main';
        const sourceQuery = context?.projectId === projectId && context.sourceWasChild && context.sourceWorkspaceId !== undefined
          ? `?workspaceId=${encodeURIComponent(context.sourceWorkspaceId)}`
          : '';
        navigate(`/projects/${encodeURIComponent(projectId)}/${sourceSurface}${sourceQuery}`, { replace: true });
      } catch (error) {
        setReturnError(error instanceof Error ? error.message : String(error));
      } finally {
        setReturning(false);
      }
    })();
  };

  const active = activeSurface;

  return (
    <div
      data-lcos-family="project-shell"
      data-lcos-variant={active}
      data-lcos-project-shell
      className="relative h-full w-full overflow-hidden"
    >
      {shellStatus !== 'ready' || stateProjectId !== projectId ? (
        <div className="flex h-full w-full items-center justify-center">
          <LcosWorksiteStageLoading status={shellStatus === 'ready' ? 'loading' : shellStatus} onRetry={onRetry} />
        </div>
      ) : (
        <>
          {/* 工作现场舞台（唯一 Canvas）；Main/Context/Workflow 各自壳（空态/仪器差异） */}
          <div className="absolute inset-0">
            {childUnavailable ? (
              <ChildWorkspaceUnavailable
                workspaceId={childWorkspaceId}
                hasWorkspace={childWorkspace !== undefined}
                onReturn={returnToSource}
              />
            ) : active === 'main' ? (
              <MainWorksite
                projectId={projectId}
                surface={active}
                canvasId={effectiveCanvasBySurface[active]}
                canvasNodeCount={mainNodeCount}
                // 必须透传 recreate：Main 的「重新建立现场画布」按钮靠它强制重建，
                // 丢掉这个参数会退回到返回旧（失效）canvasId，按钮看起来点了没反应。
                  ensureCanvas={(recreate?: boolean) =>
                  ensureActiveCanvas(active, recreate)
                }
                ensureError={ensureError}
              />
            ) : active === 'context' ? (
              <ContextWorksite
                projectId={projectId}
                surface={active}
                canvasId={effectiveCanvasBySurface[active]}
                canvasBySurface={effectiveCanvasBySurface}
                workspaces={workspaces}
                ensureCanvas={ensureActiveCanvas}
                isChildWorksite={childWorkspaceId !== undefined}
              />
            ) : active === 'workflow' ? (
              <WorkflowWorksite
                projectId={projectId}
                surface={active}
                canvasId={effectiveCanvasBySurface[active]}
                ensureCanvas={ensureActiveCanvas}
              />
            ) : (
              <LcosWorksiteStage
                projectId={projectId}
                surface={active}
                canvasId={effectiveCanvasBySurface[active]}
                ensureCanvas={(recreate?: boolean) =>
                  ensureActiveCanvas(active, recreate)
                }
                ensureError={ensureError}
              />
            )}
          </div>

          {/* 项目身份胶囊（顶左；点击返回项目列表） */}
          <div data-lcos-shell-project-cluster className="pointer-events-auto fixed top-6 left-6 z-40 flex items-center gap-2">
            {childWorkspaceId !== undefined && (
              <button
                type="button"
                data-lcos-child-return
                onClick={returnToSource}
                disabled={returning}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-60"
                style={{ ...lcosGlassStyle, color: lcosTokens.color.text }}
                title="返回来源现场"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {returning ? '返回中…' : '返回来源现场'}
              </button>
            )}
            <Link to="/projects" data-lcos-project-identity title="返回项目列表">
              <LcosProjectIdentityView name={projectName ?? projectId.slice(0, 12)} />
            </Link>
            <button
              type="button"
              data-lcos-assembly-entry
              aria-label="Assembly"
              title={`打开 Assembly · 投放到 ${active}`}
              onClick={() => {
                if (active === 'main') {
                  openAssembly({ kind: 'main' }, 'Assembly · Main');
                  return;
                }
                if (activeWorkspaceId) {
                  openAssembly(
                    { kind: 'workspace', id: activeWorkspaceId },
                    `Assembly · ${active === 'context' ? 'Context' : 'Workflow'}`,
                  );
                  return;
                }
                openAssembly({ kind: 'project', id: projectId }, 'Assembly · 项目');
              }}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-90"
              style={{ ...lcosGlassStyle, color: lcosTokens.color.text }}
            >
              <FigmaShellGlyph name="bench" size={20} />
            </button>
          </div>
          {returnError && (
            <div className="pointer-events-auto fixed top-[76px] left-6 z-40 rounded-full px-3 py-2 text-xs" style={{ ...lcosGlassStyle, color: lcosTokens.color.danger }}>
              {returnError}
            </div>
          )}

          {/* 全局 HUD：Navigator 岛 / Railway / Dock / FocusWhere */}
          <LcosGlobalHud
            projectId={projectId}
            canvasBySurface={effectiveCanvasBySurface}
            surfaceByWorkspace={surfaceByWorkspace}
            ensureCanvas={ensureCanvas}
            ensureWorkspaceCanvas={ensureWorkspaceCanvas}
            {...(childWorkspaceId === undefined ? {} : { childWorkspaceId })}
          />

          {/* 专业窗口舞台；Composer 由 canvas-local 明确命令挂载。 */}
          <ProfessionalWindowStage
            projectId={projectId}
            resolvePortalTarget={resolvePortalTarget}
            onOpenPortalTarget={openPortalTarget}
          />
          {active === 'main' && (
            <>
              <button
                type="button"
                aria-label="呼出工作流手牌"
                aria-expanded={mainHandOpen}
                title="工作流手牌"
                onClick={() => setMainHandOpen((open) => !open)}
                className="pointer-events-auto fixed right-6 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full"
                style={lcosGlassStyle}
              >
                <Hand size={18} aria-hidden />
              </button>
              <WorkflowHandOverlay projectId={projectId} open={mainHandOpen} onClose={() => setMainHandOpen(false)} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function ChildWorkspaceUnavailable({
  workspaceId,
  hasWorkspace,
  onReturn,
}: {
  readonly workspaceId?: string;
  readonly hasWorkspace: boolean;
  readonly onReturn: () => void;
}): React.JSX.Element {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: lcosTokens.color.canvas }}>
      <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
        <LcosSurfaceFeedback
          presentation="disabled"
          message={hasWorkspace ? '这个工作现场还没有可用画布' : '找不到指定的工作现场'}
        />
        <span className="text-xs" style={{ color: lcosTokens.color.muted }}>
          {hasWorkspace ? '需要先建立并绑定画布，才能进入编辑现场。' : `workspaceId：${workspaceId ?? '未提供'}`}
        </span>
        <button
          type="button"
          data-lcos-child-return-fallback
          onClick={onReturn}
          className="rounded-full px-4 py-2 text-sm font-medium"
          style={{ background: lcosTokens.color.inverse, color: lcosTokens.color.textOnInverse, minHeight: 44 }}
        >
          返回来源现场
        </button>
      </div>
    </div>
  );
}

function LcosWorksiteStageLoading({
  status,
  onRetry,
}: {
  readonly status: 'loading' | 'offline' | 'error';
  readonly onRetry: () => void;
}): React.JSX.Element {
  if (status === 'loading') {
    return (
      <div
        className="flex flex-col items-center gap-3"
        style={{ color: lcosTokens.color.muted }}
      >
        <span className="lcos-static-pulse text-sm">正在读取现场与画布…</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-sm" style={{ color: lcosTokens.color.danger }}>
        {status === 'offline'
          ? 'Local Core 未连接，无法进入项目'
          : '现场信息读取失败'}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full px-5 font-medium"
        style={{
          background: lcosTokens.color.inverse,
          color: lcosTokens.color.textOnInverse,
          minHeight: 44,
        }}
      >
        重试
      </button>
    </div>
  );
}
