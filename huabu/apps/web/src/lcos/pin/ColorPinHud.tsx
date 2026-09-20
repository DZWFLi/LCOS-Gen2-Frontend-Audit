import { colorPinTargetFromEntityRef, colorPinTargetKey } from '@local-creative-os/web-gen2';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useCanvasStore from '@/store/canvasStore';

import { useLcosWorksiteNav } from '../app/useLcosWorksiteNav';
import { useLcosReferenceStore } from '../lcosReferenceState';
import {
  paletteTonesV1,
  readColorPinPaletteV1,
  toneForColorPinV1,
} from './lcosColorPinPalette';
import { useLcosColorPins } from './LcosColorPinProvider';
import { LcosNavigatorIsland } from '../navigation/LcosNavigatorIsland';
import {
  LCOS_SURFACE_MARKER_REASON_TEXT,
  resolveSurfaceMarkerTargetV1,
} from '../navigation/lcosSurfaceMarkerTarget';
import { waitForProjectedEntity } from '../navigation/waitForProjectedEntity';
import { lcosHudEdgeOffsets } from '../shell/lcosHudPlacement';
import { useLcosShellStore, type LcosSurfaceKey } from '../shell/lcosShellStore';
import { lcosGlassStyle, lcosTokens } from '../ui/lcosTokens';

import type { LcosNavigatorPin } from '../ui/families';
import type { ColorPinMembershipV0 } from '@local-creative-os/contracts';

export interface ColorPinHudProps {
  readonly projectId: string;
  readonly canvasBySurface: Readonly<Partial<Record<LcosSurfaceKey, string>>>;
  readonly surfaceByWorkspace: Readonly<Map<string, LcosSurfaceKey>>;
  readonly ensureCanvas: (surface: LcosSurfaceKey, force?: boolean) => Promise<string | undefined>;
  readonly ensureWorkspaceCanvas: (workspaceId: string) => Promise<string | undefined>;
  readonly childWorkspaceId?: string;
}

export function ColorPinHud(props: ColorPinHudProps): React.JSX.Element {
  const pinsProjection = useLcosColorPins();
  const activeSurface = useLcosShellStore((state) => state.activeSurface);
  const windowEnvironment = useLcosShellStore((state) => state.windowEnvironment);
  const requestLocate = useLcosShellStore((state) => state.requestLocate);
  const requestFocusWhere = useLcosShellStore((state) => state.requestFocusWhere);
  const openWindow = useLcosShellStore((state) => state.openWindow);
  const setActiveSurface = useLcosShellStore((state) => state.setActiveSurface);
  const navigate = useNavigate();
  const { switchWorksite } = useLcosWorksiteNav({
    projectId: props.projectId,
    canvasBySurface: props.canvasBySurface,
    ensureCanvas: props.ensureCanvas,
  });
  const [palette, setPalette] = useState(() => readColorPinPaletteV1());
  const [openPinId, setOpenPinId] = useState<string | undefined>(undefined);
  const [travelMessage, setTravelMessage] = useState<string | undefined>(undefined);
  const [travelling, setTravelling] = useState(false);

  useEffect(() => { setPalette(readColorPinPaletteV1()); }, []);
  useEffect(() => {
    setOpenPinId(undefined);
    setTravelMessage(undefined);
  }, [props.projectId]);
  useEffect(() => {
    const close = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      setOpenPinId(undefined);
      setTravelMessage(undefined);
      pinsProjection.closeAuthoring();
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [pinsProjection]);

  const definitionsById = useMemo(
    () => new Map(pinsProjection.snapshot.definitions.map((definition) => [definition.id, definition])),
    [pinsProjection.snapshot.definitions],
  );
  const navigatorPins: readonly LcosNavigatorPin[] = useMemo(() =>
    pinsProjection.usedDefinitions.map((definition) => ({
      id: definition.id,
      tone: palette === undefined ? 'violet' : toneForColorPinV1(definition.color, palette),
      label: definition.label ?? `颜色组 ${definition.color}`,
      color: definition.color,
      count: pinsProjection.membershipsByColorPinId.get(definition.id)?.length ?? 0,
    })), [palette, pinsProjection.membershipsByColorPinId, pinsProjection.usedDefinitions]);

  const surfaceTarget = pinsProjection.projectTruth === undefined
    ? undefined
    : resolveSurfaceMarkerTargetV1({
        projectId: props.projectId,
        surface: activeSurface,
        childWorkspaceId: props.childWorkspaceId,
        scopes: pinsProjection.projectTruth.scopes,
        workspaces: pinsProjection.projectTruth.workspaces,
      });

  const openCurrentTarget = (): void => {
    setOpenPinId(undefined);
    setTravelMessage(undefined);
    const selectedNodeId = useCanvasStore.getState().nodes.find((node) => node.selected)?.id;
    const ref = selectedNodeId === undefined
      ? undefined
      : useLcosReferenceStore.getState().nodeEntityRefs.get(selectedNodeId);
    if (ref !== undefined) {
      pinsProjection.openAuthoring({
        targetRef: colorPinTargetFromEntityRef(props.projectId, ref),
        label: ref.descriptor?.title ?? ref.entityId,
      });
      return;
    }
    if (surfaceTarget?.status === 'resolved') {
      pinsProjection.openAuthoring({ targetRef: surfaceTarget.targetRef, label: '当前现场' });
      return;
    }
    setTravelMessage(surfaceTarget?.status === 'unresolved'
      ? LCOS_SURFACE_MARKER_REASON_TEXT[surfaceTarget.reason]
      : '正在读取项目真值…');
  };

  const currentMemberships = pinsProjection.authoringTarget === undefined
    ? []
    : pinsProjection.membershipsByTargetKey.get(colorPinTargetKey(pinsProjection.authoringTarget.targetRef)) ?? [];
  const assignedColors = new Set(currentMemberships
    .map((membership) => definitionsById.get(membership.colorPinId)?.color.toUpperCase())
    .filter((color): color is string => color !== undefined));

  const travelToMembership = async (membership: ColorPinMembershipV0): Promise<void> => {
    const identity = pinsProjection.targetIdentity(membership.targetRef);
    if (membership.targetRef.kind === 'entity' && identity !== undefined) {
      requestFocusWhere({
        reqId: crypto.randomUUID(),
        entityType: identity.entityType,
        entityId: identity.entityId,
        title: identity.label,
      });
      setOpenPinId(undefined);
      return;
    }
    setTravelling(true);
    setTravelMessage(undefined);
    try {
      const resolution = await pinsProjection.resolveNavigationTarget(membership.targetRef);
      if (resolution.status === 'unresolved') {
        setTravelMessage(`无法前往：目标已失效（${resolution.reason}）`);
        return;
      }
      const { surfaceKind, surfaceRef } = resolution.target;
      let surface: LcosSurfaceKey | undefined;
      let canvasId: string | undefined;
      if (surfaceKind === 'main' || surfaceKind === 'context' || surfaceKind === 'workflow') {
        surface = surfaceKind;
        if (!await switchWorksite(surface)) throw new Error('未能进入目标现场，请重试');
        canvasId = useCanvasStore.getState().canvasId ?? undefined;
      } else if (surfaceRef.startsWith('workspace:')) {
        const workspaceId = surfaceRef.slice('workspace:'.length);
        canvasId = await props.ensureWorkspaceCanvas(workspaceId);
        if (canvasId === undefined) throw new Error('目标现场还没有可用画布');
        if (!await useCanvasStore.getState().switchCanvas(canvasId)) throw new Error('未能读取目标现场，请重试');
        surface = props.surfaceByWorkspace.get(workspaceId) ?? 'main';
        setActiveSurface(surface);
        navigate(`/projects/${encodeURIComponent(props.projectId)}/${surface}?workspaceId=${encodeURIComponent(workspaceId)}`, { replace: true });
      } else if (surfaceKind === 'conversation' && surfaceRef.startsWith('conversation:')) {
        const conversationId = surfaceRef.slice('conversation:'.length);
        openWindow('conversation', '会话', conversationId);
        setOpenPinId(undefined);
        return;
      } else {
        setTravelMessage('该颜色组目标暂不支持前往');
        return;
      }
      if (membership.targetRef.kind === 'view' && identity !== undefined && canvasId !== undefined && surface !== undefined) {
        const nodeId = await waitForProjectedEntity({
          projectId: props.projectId,
          canvasId,
          entityType: identity.entityType,
          entityId: identity.entityId,
        });
        if (nodeId === undefined) {
          setTravelMessage('已进入目标现场，但对象投影尚未就绪');
          return;
        }
        requestLocate({ reqId: crypto.randomUUID(), surface, canvasId, nodeId, status: 'projected' });
      }
      setOpenPinId(undefined);
    } catch (error) {
      setTravelMessage(error instanceof Error ? error.message : '前往失败，请重试');
    } finally {
      setTravelling(false);
    }
  };

  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const offsets = lcosHudEdgeOffsets(windowEnvironment ?? null, viewport);
  const left = (offsets.left + (viewport.width - offsets.right)) / 2;

  return (
    <>
      <LcosNavigatorIsland
        projectId={props.projectId}
        canvasBySurface={props.canvasBySurface}
        surfaceByWorkspace={props.surfaceByWorkspace}
        ensureCanvas={props.ensureCanvas}
        pins={navigatorPins}
        onActivatePin={(pin) => {
          pinsProjection.closeAuthoring();
          setTravelMessage(undefined);
          setOpenPinId((current) => current === pin.id ? undefined : pin.id);
        }}
        onCreatePin={openCurrentTarget}
        createPinDisabled={pinsProjection.busy || pinsProjection.status === 'loading'}
      />

      {(pinsProjection.authoringTarget !== undefined || openPinId !== undefined || travelMessage !== undefined || pinsProjection.message !== undefined) && (
        <div
          data-lcos-color-pin-hud
          className="pointer-events-auto fixed z-40 -translate-x-1/2"
          style={{ top: offsets.top + 56, left, maxWidth: '90vw' }}
        >
          {pinsProjection.authoringTarget !== undefined && (
            <div
              data-lcos-color-pin-palette
              data-lcos-color-pin-target={pinsProjection.authoringTarget.targetRef.id}
              data-lcos-color-pin-target-kind={pinsProjection.authoringTarget.targetRef.kind}
              className="rounded-xl p-2"
              style={{ ...lcosGlassStyle, width: 280 }}
            >
              <p className="px-2 pb-1 text-xs" style={{ color: lcosTokens.color.muted }}>
                把「{pinsProjection.authoringTarget.label}」标为颜色组
              </p>
              {palette === undefined ? (
                <p className="px-2 py-1 text-xs" style={{ color: lcosTokens.color.danger }}>调色板不可用（设计 token 未加载）</p>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1">
                  {paletteTonesV1().map((tone) => {
                    const assigned = assignedColors.has(palette[tone]);
                    return (
                      <button
                        key={tone}
                        type="button"
                        data-lcos-color-pin-swatch={tone}
                        data-lcos-color-pin-swatch-assigned={assigned ? 'true' : 'false'}
                        aria-label={assigned ? `${tone} · 已属于该颜色组` : `标为 ${tone}`}
                        aria-pressed={assigned}
                        disabled={pinsProjection.busy || assigned}
                        onClick={() => {
                          const targetRef = pinsProjection.authoringTarget?.targetRef;
                          if (targetRef === undefined) return;
                          void pinsProjection.assignMembership(
                            targetRef,
                            palette[tone],
                          ).catch(() => undefined);
                        }}
                        className="h-8 w-8 rounded-full disabled:opacity-40"
                        style={{ background: palette[tone], minHeight: 32, minWidth: 32 }}
                      />
                    );
                  })}
                </div>
              )}
              {currentMemberships.map((membership) => (
                <button
                  key={membership.id}
                  type="button"
                  data-lcos-color-pin-remove-current={membership.colorPinId}
                  disabled={pinsProjection.busy}
                  onClick={() => { void pinsProjection.removeMembership(membership.id).catch(() => undefined); }}
                  className="w-full rounded-lg px-2 py-1 text-left text-xs"
                  style={{ color: lcosTokens.color.danger, minHeight: 32 }}
                >
                  移除 {definitionsById.get(membership.colorPinId)?.color ?? membership.colorPinId}
                </button>
              ))}
            </div>
          )}

          {openPinId !== undefined && (
            <div data-lcos-color-pin-members className="max-h-[40vh] overflow-y-auto rounded-xl p-2" style={{ ...lcosGlassStyle, width: 340 }}>
              <p className="px-2 pb-1 text-xs" style={{ color: lcosTokens.color.muted }}>
                {definitionsById.get(openPinId)?.label ?? '颜色组'} · 成员 {pinsProjection.membershipsByColorPinId.get(openPinId)?.length ?? 0}
              </p>
              {(pinsProjection.membershipsByColorPinId.get(openPinId) ?? []).map((membership) => {
                const identity = pinsProjection.targetIdentity(membership.targetRef);
                return (
                  <div key={membership.id} data-lcos-color-pin-member={membership.id} className="flex items-center gap-1 px-2 py-1">
                    <span className="min-w-0 flex-1 truncate text-xs" style={{ color: lcosTokens.color.text }}>
                      {identity?.label ?? `${membership.targetRef.kind} · ${membership.targetRef.id}`}
                    </span>
                    <button
                      type="button"
                      data-lcos-color-pin-travel
                      disabled={travelling}
                      onClick={() => { void travelToMembership(membership); }}
                      className="shrink-0 rounded-full px-2 py-1 text-xs"
                      style={{ color: lcosTokens.color.info, minHeight: 32 }}
                    >
                      前往
                    </button>
                    <button
                      type="button"
                      data-lcos-color-pin-remove
                      disabled={pinsProjection.busy}
                      onClick={() => { void pinsProjection.removeMembership(membership.id).catch(() => undefined); }}
                      className="shrink-0 rounded-full px-2 py-1 text-xs"
                      style={{ color: lcosTokens.color.danger, minHeight: 32 }}
                    >
                      移除
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {(travelMessage ?? pinsProjection.message) !== undefined && (
            <div data-lcos-color-pin-note className="mt-2 rounded-xl px-4 py-2 text-xs" style={{ ...lcosGlassStyle, color: lcosTokens.color.muted }} aria-live="polite">
              {travelMessage ?? pinsProjection.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}
