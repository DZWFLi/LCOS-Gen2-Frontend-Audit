import { createContext, useContext, useMemo } from 'react';

import type { AssemblyTargetRefV1 } from '@local-creative-os/contracts';
import type { Workspace } from '@local-creative-os/domain';

export interface PortalDropWorkspace {
  readonly id: string;
  readonly name: string;
  readonly canvasId?: string;
}

export interface PortalDropWorkspaceContextValue {
  readonly workspaces: readonly PortalDropWorkspace[];
  readonly mainCanvasId?: string;
}

const PortalDropWorkspaceContext = createContext<PortalDropWorkspaceContextValue | null>(null);

export function PortalDropWorkspaceProvider({
  workspaces,
  mainCanvasId,
  children,
}: PortalDropWorkspaceContextValue & { readonly children: React.ReactNode }): React.JSX.Element {
  const value = useMemo(() => ({ workspaces, ...(mainCanvasId === undefined ? {} : { mainCanvasId }) }), [workspaces, mainCanvasId]);
  return <PortalDropWorkspaceContext.Provider value={value}>
    {children}
  </PortalDropWorkspaceContext.Provider>;
}

export function usePortalDropWorkspaceContext(): PortalDropWorkspaceContextValue | null {
  return useContext(PortalDropWorkspaceContext);
}

export function portalDropTargetForCanvas(
  context: PortalDropWorkspaceContextValue | null,
  canvasId: string | undefined,
): { readonly targetRef: AssemblyTargetRefV1; readonly label: string } | undefined {
  if (context === null || canvasId === undefined) return undefined;
  const matches = context.workspaces.filter((workspace) => workspace.canvasId === canvasId);
  if (matches.length !== 1 || matches[0] === undefined) return undefined;
  const workspace = matches[0];
  return context.mainCanvasId === canvasId
    ? { targetRef: { kind: 'main' }, label: workspace.name }
    : { targetRef: { kind: 'workspace', id: workspace.id }, label: workspace.name };
}

export function toPortalDropWorkspaces(workspaces: readonly Workspace[]): readonly PortalDropWorkspace[] {
  return workspaces.map((workspace) => ({
    id: String(workspace.id),
    name: workspace.name,
    ...(workspace.canvasId === undefined ? {} : { canvasId: workspace.canvasId }),
  }));
}
