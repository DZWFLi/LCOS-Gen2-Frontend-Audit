// ContextWorksite — Context 现场（Figma context 5388:21602）：真实画布舞台 + 现场仪器
// （Atlas 强表征 / Temporal Rail 局部时间轨 / 来源与关系 Wave 8）。Atlas=Context 现场表征，
// 不是全局 overlay；child canvas 复用同一 Huabu kernel（Portal/Surface 机制 Wave 8 精化）。

import { Layers } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContextAtlasStage } from './ContextAtlasStage';
import { TemporalRail } from './TemporalRail';
import { useLcosWorksiteNav } from '../../app/useLcosWorksiteNav';
import { useLcosReferenceStore } from '../../lcosReferenceState';
import { beginChildWorksiteNavigation } from '../../navigation/childWorksiteNavigation';
import { childSurfaceForItem, workspaceTargetsForItem } from '../../navigation/workspaceTargets';
import { useLcosShellStore } from '../../shell/lcosShellStore';
import { LcosWorksiteStage } from '../../shell/LcosWorksiteStage';
import '../../ui/context/context-spatial.css';

import type { LcosSurfaceKey } from '../../shell/lcosShellStore';
import type { WarehouseItemV1 } from '@local-creative-os/contracts';
import type { Workspace } from '@local-creative-os/domain';

export interface ContextWorksiteProps {
  readonly projectId: string;
  readonly surface: LcosSurfaceKey;
  readonly canvasId?: string;
  readonly canvasBySurface: Readonly<Partial<Record<LcosSurfaceKey, string>>>;
  readonly workspaces: readonly Workspace[];
  readonly ensureCanvas: (surface: LcosSurfaceKey, force?: boolean) => Promise<string | undefined>;
  /** Route-owned child identity; do not infer this from a stale browser URL. */
  readonly isChildWorksite?: boolean;
}

export function ContextWorksite({
  projectId,
  surface,
  canvasId,
  canvasBySurface,
  workspaces,
  ensureCanvas,
  isChildWorksite = false,
}: ContextWorksiteProps): React.JSX.Element {
  const navigate = useNavigate();
  const [atlasOpen, setAtlasOpen] = useState(false);
  const activeWorkspaceId = useLcosShellStore((state) => state.activeWorkspaceId);
  useLcosWorksiteNav({ projectId, canvasBySurface, ensureCanvas });

  const enterItem = (item: WarehouseItemV1, selectedWorkspace?: Workspace): boolean => {
    const childTargets = workspaceTargetsForItem(item, workspaces);
    const childTarget = selectedWorkspace ?? (childTargets.length === 1 ? childTargets[0] : undefined);
    const childSurface = childSurfaceForItem(item, childTarget);
    if (childTarget !== undefined && childSurface !== undefined) {
      const shell = useLcosShellStore.getState();
      const entered = beginChildWorksiteNavigation({
        projectId,
        sourceSurface: surface,
        ...(shell.activeWorkspaceId === null ? {} : { sourceWorkspaceId: shell.activeWorkspaceId }),
        sourceWasChild: isChildWorksite,
        targetSurface: childSurface,
        targetWorkspace: childTarget,
        navigate,
      });
      if (entered) setAtlasOpen(false);
      return entered;
    }
    if (childTargets.length > 0) return false;
    // 有明确 Workspace 映射时进入子现场；其余实体只有已有投影才允许定位，避免“点一下只关闭”。
    const found = [...useLcosReferenceStore.getState().nodeEntityRefs.entries()].find(
      ([, ref]) => ref.entityId === item.entityRef.id && ref.entityType === item.entityRef.type,
    );
    if (found === undefined) return false;
    useLcosShellStore.getState().requestLocate({
      reqId: `atlas-${Date.now()}`,
      surface: 'context',
      ...(canvasId === undefined ? {} : { canvasId }),
      nodeId: found[0],
      status: 'projected',
    });
    setAtlasOpen(false);
    return true;
  };

  return (
    <div data-lcos-context-worksite className="relative h-full w-full">
      <LcosWorksiteStage
        projectId={projectId}
        surface={surface}
        canvasId={canvasId}
        ensureCanvas={(recreate?: boolean) => ensureCanvas(surface, recreate)}
      />

      {/* Context 现场仪器入口（真实动作；Temporal Rail 常驻右侧） */}
      <div className="pointer-events-auto fixed left-6 bottom-24 z-30 flex flex-col gap-2">
        <button
          type="button"
          data-lcos-context-instrument="atlas"
          onClick={() => setAtlasOpen(true)}
          className="lcos-context-instrument-trigger"
          aria-label="打开集合总览"
          title="集合总览"
        >
          <Layers className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <TemporalRail
        projectId={projectId}
        workspaceId={activeWorkspaceId ?? undefined}
        canvasId={canvasId}
      />

      <AnimatePresence key={projectId} initial={false} mode="sync">
        {atlasOpen && (
          <ContextAtlasStage
            key="context-atlas"
            projectId={projectId}
            workspaces={workspaces}
            onClose={() => setAtlasOpen(false)}
            onEnterSurface={enterItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
