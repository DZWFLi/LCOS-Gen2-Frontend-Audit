// LcosGlobalHud — 项目级常驻全局控制（Figma hud 5388:27696：project 左 24 / Navigator 顶 24
// 居中 hug / Railway 左 24 / SurfaceDock 底 24 / camera 左下 52）。三者共享同一直观玻璃岛语言。
// 全部入口只发命令（shell store / worksite nav），不建第二 camera/search/graph。

import { useCallback } from 'react';


import { LcosRailway } from './LcosRailway';
import { type LcosSurfaceKey } from './lcosShellStore';
import { LcosSurfaceDock } from './LcosSurfaceDock';
import { useLcosWorksiteNav } from '../app/useLcosWorksiteNav';
import { NavigationHudProvider } from '../navigation/NavigationHudSlot';
import { LcosFocusWhere } from '../navigation/LcosFocusWhere';
import { ColorPinHud } from '../pin/ColorPinHud';

import type { RailwayDestinationProjection } from '../navigation/railwayProjection';

export interface LcosGlobalHudProps {
  readonly projectId: string;
  readonly canvasBySurface: Readonly<Partial<Record<LcosSurfaceKey, string>>>;
  readonly surfaceByWorkspace: Readonly<Map<string, LcosSurfaceKey>>;
  readonly ensureCanvas: (
    surface: LcosSurfaceKey,
  ) => Promise<string | undefined>;
  readonly ensureWorkspaceCanvas: (
    workspaceId: string,
  ) => Promise<string | undefined>;
  /** route ?workspaceId= —— 显式子工作现场（ColorPin target 用；不得用 activeWorkspaceId 冒充 root surface）。 */
  readonly childWorkspaceId?: string;
}

export function LcosGlobalHud(props: LcosGlobalHudProps): React.JSX.Element {
  const { switchWorksite } = useLcosWorksiteNav({
    projectId: props.projectId,
    canvasBySurface: props.canvasBySurface,
    ensureCanvas: props.ensureCanvas,
  });
  const { ensureWorkspaceCanvas } = props;
  const activateDestination = useCallback(
    async (destination: RailwayDestinationProjection): Promise<void> => {
      if (destination.surface === undefined) return;
      if (destination.workspaceId === undefined) {
        const switched = await switchWorksite(destination.surface);
        if (!switched) throw new Error('未能进入目标现场，请重试');
        return;
      }
      const canvasId = await ensureWorkspaceCanvas(destination.workspaceId);
      if (canvasId === undefined) {
        throw new Error('目标现场还没有可用画布');
      }
      if (!await switchWorksite(destination.surface, { canvasId, workspaceId: destination.workspaceId })) {
        throw new Error('未能读取目标现场，请重试');
      }
    },
    [ensureWorkspaceCanvas, switchWorksite],
  );

  return (
    <NavigationHudProvider>
      <ColorPinHud
        projectId={props.projectId}
        surfaceByWorkspace={props.surfaceByWorkspace}
        canvasBySurface={props.canvasBySurface}
        ensureCanvas={props.ensureCanvas}
        ensureWorkspaceCanvas={props.ensureWorkspaceCanvas}
        {...(props.childWorkspaceId === undefined ? {} : { childWorkspaceId: props.childWorkspaceId })}
      />
      <LcosRailway
        projectId={props.projectId}
        surfaceByWorkspace={props.surfaceByWorkspace}
        activateDestination={activateDestination}
      />
      <LcosFocusWhere
        projectId={props.projectId}
        surfaceByWorkspace={props.surfaceByWorkspace}
        canvasBySurface={props.canvasBySurface}
        ensureCanvas={props.ensureCanvas}
      />
      <LcosSurfaceDock
        projectId={props.projectId}
        canvasBySurface={props.canvasBySurface}
        ensureCanvas={props.ensureCanvas}
      />
    </NavigationHudProvider>
  );
}
