import { useLcosReferenceStore } from '../../lcosReferenceState';
import { useLcosShellStore } from '../../shell/lcosShellStore';
import { ContextAtlasStage } from '../context/ContextAtlasStage';
import useCanvasStore from '@/store/canvasStore';
import { isCanonicalCollectionItem } from '../context/contextAtlasSemantics';

import type { WarehouseItemV1 } from '@local-creative-os/contracts';

/** Main is a canonical Collection locator; Context owns worksite/child navigation semantics. */
export function MainCollectionAtlas({ projectId, onClose }: {
  readonly projectId: string;
  readonly onClose: () => void;
}): React.JSX.Element {
  const activate = (item: WarehouseItemV1): boolean => {
    if (!isCanonicalCollectionItem(item)) return false;
    const nodeId = [...useLcosReferenceStore.getState().nodeEntityRefs.entries()].find(
      ([, ref]) => ref.entityType === 'collection' && ref.entityId === item.entityRef.id,
    )?.[0];
    if (nodeId === undefined) return false;
    const canvasId = useCanvasStore.getState().canvasId;
    useLcosShellStore.getState().requestLocate({
      reqId: crypto.randomUUID(), surface: 'main', ...(canvasId ? { canvasId } : {}), nodeId, status: 'projected', preserveSelection: true,
    });
    onClose();
    return true;
  };
  return <ContextAtlasStage mode="main-collections" projectId={projectId} workspaces={[]}
    onClose={onClose} onEnterSurface={activate} />;
}
