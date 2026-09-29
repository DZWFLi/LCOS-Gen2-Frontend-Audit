import { FolderPlus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { MultiSelectToolbar } from '@/components/Panels/Canvas/FloatingToolbars/MultiSelectToolbar';
import { deletableCanvasNodeIds } from '@/hooks/shortcuts/deleteSelection';
import { createLcosCoreSession } from '@/lcos/app/lcosCoreClient';
import useCanvasStore from '@/store/canvasStore';

import { useLcosReferenceStore } from '../lcosReferenceState';
import { waitForProjectedEntity } from './waitForProjectedEntity';
import { useLcosShellStore } from '../shell/lcosShellStore';

import type { CoreCollectionMemberRef } from '@local-creative-os/web-gen2';

/** Reuse Huabu geometry/alignment mechanics; the host owns identity restrictions. */
export function LcosMultiSelectToolbar(): React.JSX.Element {
  const nodes = useCanvasStore((s) => s.nodes);
  const canvasId = useCanvasStore((s) => s.canvasId);
  const projectId = useLcosShellStore((s) => s.projectId);
  const refs = useLcosReferenceStore((s) => s.nodeEntityRefs);
  const ready = useLcosReferenceStore((s) => s.bindingIdentitiesReady
    && s.projectId !== null && s.projectId === projectId && s.bindingCanvasId === canvasId);
  const selected = nodes.filter((node) => node.selected).map((node) => node.id);
  // Also protects an unbound parent whose descendants carry canonical bindings.
  const protectedSelection = deletableCanvasNodeIds(nodes, refs, selected).length !== selected.length;
  const loading = !ready ? '正在确认所选对象的身份，请稍后再试' : undefined;
  const deleteReason = loading ?? (protectedSelection ? '所选内容包含项目绑定对象，请先在对应内容窗口管理；不会只删除其中一部分' : undefined);
  const moveReason = loading ?? (protectedSelection ? '所选内容包含暂不支持跨现场移动的项目对象' : undefined);
  const selectedRefs = useMemo(() => {
    const unique = new Map<string, { entityType: string; entityId: string }>();
    for (const nodeId of selected) {
      const ref = refs.get(nodeId);
      if (ref !== undefined) unique.set(`${ref.entityType}:${ref.entityId}`, { entityType: ref.entityType, entityId: ref.entityId });
    }
    return [...unique.values()];
  }, [refs, selected]);
  const supportedMemberTypes = new Set(['artifact', 'note', 'collection', 'scope', 'workspace', 'conversation', 'run']);
  const canCreateFromSelection = ready && selected.length >= 2 && selectedRefs.length === selected.length
    && selectedRefs.every((ref) => supportedMemberTypes.has(ref.entityType));
  // Keep the action visible during identity hydration; only its commit is gated.
  const lcosActive = projectId !== null;
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const createSelectedCollection = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!projectId || !canCreateFromSelection || busy || !title.trim()) return;
    setBusy(true);
    setFeedback('');
    const originProjectId = projectId;
    const originCanvasId = canvasId;
    const originSurface = useLcosShellStore.getState().activeSurface;
    try {
      const session = createLcosCoreSession();
      const { collection } = await session.collections.create(originProjectId, title.trim());
      const members: CoreCollectionMemberRef[] = selectedRefs.map((ref) => ({
        type: ref.entityType as CoreCollectionMemberRef['type'], id: ref.entityId,
      }));
      let confirmed = 0;
      let failed = 0;
      for (const member of members) {
        try {
          const receipt = await session.collections.addMember(originProjectId, collection.id, member);
          if (receipt.collectionId === collection.id && receipt.memberRef.type === member.type
            && receipt.memberRef.id === member.id && (receipt.status === 'applied' || receipt.status === 'already-member')) confirmed += 1;
          else failed += 1;
        } catch {
          failed += 1;
        }
      }
      const currentCanvasId = useCanvasStore.getState().canvasId;
      const sameOrigin = useLcosShellStore.getState().projectId === originProjectId
        && useLcosReferenceStore.getState().projectId === originProjectId
        && currentCanvasId === originCanvasId
        && useLcosShellStore.getState().activeSurface === originSurface;
      let located = false;
      if (sameOrigin && originCanvasId) {
        useLcosReferenceStore.getState().requestNodeBindingRefresh();
        const nodeId = await waitForProjectedEntity({ projectId: originProjectId, canvasId: originCanvasId, entityType: 'collection', entityId: collection.id, timeoutMs: 8000 });
        if (nodeId) {
          const shell = useLcosShellStore.getState();
          const stillAtOrigin = shell.projectId === originProjectId && shell.activeSurface === originSurface
            && useCanvasStore.getState().canvasId === originCanvasId;
          if (stillAtOrigin) {
            shell.requestLocate({ reqId: crypto.randomUUID(), surface: originSurface, canvasId: originCanvasId, nodeId, status: 'projected', preserveSelection: true });
            located = true;
          }
        }
      }
      if (failed > 0) {
        setFeedback(`集合已创建；${confirmed}/${members.length} 项已确认加入，${failed} 项失败。`);
      } else {
        setFeedback(located ? `已创建集合并加入 ${confirmed} 项，已定位。`
          : sameOrigin ? `已创建集合并加入 ${confirmed} 项；等待当前画布投影。`
            : `已创建集合并加入 ${confirmed} 项；现场已变化，未抢占当前相机。`);
      }
      setCreateOpen(false);
      setTitle('');
    } catch (cause) {
      setFeedback(`集合创建失败：${cause instanceof Error ? cause.message : 'Core 请求未确认'}`);
    } finally {
      setBusy(false);
    }
  }, [busy, canCreateFromSelection, canvasId, projectId, selectedRefs, title]);
  const selectionAction = lcosActive ? <>
    <div className="flex items-center gap-1">
      <button type="button" aria-label="将所选对象创建为集合" title={!ready ? '正在确认所选对象身份' : canCreateFromSelection ? '将所选对象创建为集合' : '需要至少两个全部具有可写 canonical 身份的对象'} disabled={!canCreateFromSelection || busy}
        onClick={() => { setCreateOpen((open) => !open); setFeedback(''); }} className="grid h-11 w-11 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40">
        <FolderPlus size={17} aria-hidden />
      </button>
      {createOpen && <form className="flex items-center gap-1" onSubmit={(event) => { void createSelectedCollection(event); }}>
        <input aria-label="集合名称" autoFocus maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="集合名称" className="h-9 w-32 rounded border px-2 text-xs" />
        <button type="submit" disabled={busy || !title.trim()} className="h-9 rounded px-2 text-xs">{busy ? '创建中…' : '创建并加入'}</button>
        <button type="button" disabled={busy} onClick={() => setCreateOpen(false)} className="h-9 rounded px-2 text-xs">取消</button>
      </form>}
    </div>
    {!ready && <span role="status" className="max-w-48 text-[10px]">正在确认所选对象身份…</span>}
    {feedback && <span role="status" aria-live="polite" className="max-w-64 text-xs">{feedback}</span>}
  </> : null;
  return <MultiSelectToolbar
    presentation="lcos"
    {...(deleteReason === undefined ? {} : { deleteDisabledReason: deleteReason })}
    {...(moveReason === undefined ? {} : { moveDisabledReason: moveReason })}
    selectionAction={selectionAction}
  />;
}
