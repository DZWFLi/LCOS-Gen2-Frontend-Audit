// Child worksite navigation — the shared Portal entry seam for Context/Assembly.
//
// This helper only captures transient return context and routes to an already
// resolved Core workspace. It does not create a graph, canvas, or second camera.
// The destination workspace/canvas remains owned by Core/Huabu; the shell store
// only remembers enough UI context to return the user to the exact source.

import useCanvasStore from '@/store/canvasStore';

import {
  animateCurrentWorksiteCamera,
  entryStartViewport,
  worksiteCameraViewportSize,
} from './worksiteCameraTransition';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore, type LcosSurfaceKey } from '../shell/lcosShellStore';

import type { Workspace } from '@local-creative-os/domain';

export interface BeginChildWorksiteNavigationInput {
  readonly projectId: string;
  readonly sourceSurface: LcosSurfaceKey;
  readonly sourceWorkspaceId?: string;
  readonly sourceWasChild: boolean;
  readonly targetSurface: LcosSurfaceKey;
  readonly targetWorkspace: Pick<Workspace, 'id' | 'canvasId'>;
  /** Exact source projection to approach when the caller can resolve it. */
  readonly sourceNodeId?: string;
  readonly navigate: (to: string) => void;
}

/**
 * Capture the exact source identity, then enter an existing workspace.
 *
 * Returning false means the target is not a usable child worksite yet. Callers
 * should leave the card/action visible and explain that the canvas is missing;
 * they must not guess a surface root or silently create a different target.
 */
export function beginChildWorksiteNavigation(
  input: BeginChildWorksiteNavigationInput,
): boolean {
  if (input.targetWorkspace.canvasId === undefined) return false;
  const targetCanvasId = input.targetWorkspace.canvasId;

  const canvas = useCanvasStore.getState();
  const references = useLcosReferenceStore.getState().nodeEntityRefs;
  const selectedNodes = canvas.nodes.filter((node) => node.selected);
  const approachNodeIds = input.sourceNodeId === undefined
    ? selectedNodes.map((node) => node.id)
    : [input.sourceNodeId];
  const sourceEntityRefs = selectedNodes.flatMap((node) => {
    const ref = references.get(node.id);
    return ref?.entityType !== undefined && ref.entityId !== undefined
      ? [{ nodeId: node.id, entityType: ref.entityType, entityId: ref.entityId }]
      : [];
  });

  const sourceViewport = canvas.rfInstance?.getViewport() ?? canvas.viewport ?? undefined;
  const shell = useLcosShellStore.getState();
  const transitionId = shell.requestWorksiteCameraTransition({
    canvasId: targetCanvasId,
    kind: 'enter-settle',
  });

  void (async () => {
    const sourceApproachViewport = await animateCurrentWorksiteCamera({
      direction: 'approach',
      nodeIds: approachNodeIds,
    });
    const currentShell = useLcosShellStore.getState();
    if (currentShell.worksiteCameraTransition?.id !== transitionId) return;

    currentShell.beginChildNavigation({
      projectId: input.projectId,
      sourceSurface: input.sourceSurface,
      ...(input.sourceWorkspaceId === undefined ? {} : { sourceWorkspaceId: input.sourceWorkspaceId }),
      sourceWasChild: input.sourceWasChild,
      ...(canvas.canvasId === null ? {} : { sourceCanvasId: canvas.canvasId }),
      ...(sourceViewport === undefined ? {} : { sourceViewport }),
      ...(sourceApproachViewport === undefined ? {} : { sourceApproachViewport }),
      selectedNodeIds: selectedNodes.map((node) => node.id),
      ...(sourceEntityRefs.length === 0 ? {} : { sourceEntityRefs }),
    });

    const loaded = await useCanvasStore.getState().switchCanvas(targetCanvasId);
    const latestShell = useLcosShellStore.getState();
    if (latestShell.worksiteCameraTransition?.id !== transitionId) return;
    if (loaded) {
      const targetViewport = useCanvasStore.getState().viewport ?? undefined;
      latestShell.updateWorksiteCameraTransition(transitionId, {
        ...(targetViewport === undefined
          ? {}
          : {
              startViewport: entryStartViewport(targetViewport, worksiteCameraViewportSize()),
              targetViewport,
            }),
      });
    }
    input.navigate(
      `/projects/${encodeURIComponent(input.projectId)}/${input.targetSurface}?workspaceId=${encodeURIComponent(String(input.targetWorkspace.id))}`,
    );
  })();
  return true;
}
