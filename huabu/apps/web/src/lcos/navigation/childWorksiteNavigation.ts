// Child worksite navigation — the shared Portal entry seam for Context/Assembly.
//
// This helper only captures transient return context and routes to an already
// resolved Core workspace. It does not create a graph, canvas, or second camera.
// The destination workspace/canvas remains owned by Core/Huabu; the shell store
// only remembers enough UI context to return the user to the exact source.

import useCanvasStore from '@/store/canvasStore';

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

  const canvas = useCanvasStore.getState();
  const references = useLcosReferenceStore.getState().nodeEntityRefs;
  const selectedNodes = canvas.nodes.filter((node) => node.selected);
  const sourceEntityRefs = selectedNodes.flatMap((node) => {
    const ref = references.get(node.id);
    return ref?.entityType !== undefined && ref.entityId !== undefined
      ? [{ nodeId: node.id, entityType: ref.entityType, entityId: ref.entityId }]
      : [];
  });

  useLcosShellStore.getState().beginChildNavigation({
    projectId: input.projectId,
    sourceSurface: input.sourceSurface,
    ...(input.sourceWorkspaceId === undefined ? {} : { sourceWorkspaceId: input.sourceWorkspaceId }),
    sourceWasChild: input.sourceWasChild,
    ...(canvas.canvasId === null ? {} : { sourceCanvasId: canvas.canvasId }),
    ...(canvas.viewport === null ? {} : { sourceViewport: canvas.viewport }),
    selectedNodeIds: selectedNodes.map((node) => node.id),
    ...(sourceEntityRefs.length === 0 ? {} : { sourceEntityRefs }),
  });

  input.navigate(
    `/projects/${encodeURIComponent(input.projectId)}/${input.targetSurface}?workspaceId=${encodeURIComponent(String(input.targetWorkspace.id))}`,
  );
  return true;
}
