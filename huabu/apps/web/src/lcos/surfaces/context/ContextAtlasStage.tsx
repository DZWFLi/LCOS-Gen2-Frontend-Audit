// ContextAtlasStage — Context 现场强表征（Figma atlas 5388:24294 / 集合 5333:96 六变体）。
// 数据：真实 warehouse；事情/时间是表征轴，不把实体 kind 当组织语义。
// 进入：有明确 Workspace 映射的集合进入子现场；普通实体仅对已有投影发定位请求。
// 关闭：回到 Context worksite（camera 不动；approach/restore 动效 Wave 9）。


import { CoreAssemblyClient, HttpError } from '@local-creative-os/web-gen2';
import { useIsPresent } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { DropdownMenu, DropdownMenuItem } from '@/components/Common/DropdownMenu';
import { useCloseOnEscape } from '@/hooks/useCloseOnEscape';

import { buildAtlasGroups, canAtlasLocate, isAtlasItem } from './contextAtlasSemantics';
import { createLcosCoreSession } from '../../app/lcosCoreClient';
import { useLcosReferenceStore } from '../../lcosReferenceState';
import { workspaceTargetsForItem } from '../../navigation/workspaceTargets';
import atlasCloseIcon from '../../ui/context/assets/atlas-close.svg';
import { ContextAtlasView } from '../../ui/context/ContextAtlasView';
import { ContextCollectionActionGlyph } from '../../ui/context/ContextCollectionFace';
import { ContextCollectionView } from '../../ui/context/ContextCollectionView';
import { LcosSurfaceFeedback } from '../../ui/LcosSurfaceFeedback';
import { lcosTokens } from '../../ui/lcosTokens';
import '../../ui/context/context-spatial.css';

import type { WarehouseItemV1 } from '@local-creative-os/contracts';
import type { Workspace } from '@local-creative-os/domain';

export interface ContextAtlasStageProps {
  readonly projectId: string;
  readonly workspaces: readonly Workspace[];
  readonly onClose: () => void;
  readonly onEnterSurface: (item: WarehouseItemV1, workspace?: Workspace) => boolean;
}

export function ContextAtlasStage({ projectId, workspaces, onClose, onEnterSurface }: ContextAtlasStageProps): React.JSX.Element {
  const session = useMemo(() => createLcosCoreSession(), []);
  const assembly = useMemo(() => new CoreAssemblyClient(session.http), [session]);
  const [items, setItems] = useState<readonly WarehouseItemV1[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorDetail, setErrorDetail] = useState<string | undefined>(undefined);
  const requestSequence = useRef(0);
  const present = useIsPresent();
  useCloseOnEscape(present, onClose);

  useEffect(() => {
    const sequence = requestSequence.current + 1;
    requestSequence.current = sequence;
    const controller = new AbortController();
    let active = true;
    // A project switch must not leave the previous project's cards visible
    // while the new warehouse is loading (or after it fails).
    setItems([]);
    setErrorDetail(undefined);
    setState('loading');
    void assembly
      .getWarehouse(projectId, controller.signal)
      .then((snapshot) => {
        if (!active || sequence !== requestSequence.current) return;
        setItems(snapshot.items.filter(isAtlasItem));
        setState('ready');
      })
      .catch((error: unknown) => {
        if (!active || sequence !== requestSequence.current || controller.signal.aborted) return;
        setState('error');
        setErrorDetail(error instanceof HttpError ? error.message : String(error));
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [projectId, assembly]);

  const groups = useMemo(() => buildAtlasGroups(items), [items]);

  const focusOnCanvas = (item: WarehouseItemV1): boolean => onEnterSurface(item);
  const projected = (item: WarehouseItemV1): boolean => canAtlasLocate(item, useLcosReferenceStore.getState().nodeEntityRefs.values());

  const kindLabel = (item: WarehouseItemV1): string => item.kind === 'scene' ? '现场' : item.kind === 'collection' ? '集合' : '上下文';

  return (
    <ContextAtlasView onClose={onClose} header={<>
          <span>{items.length} 个集合</span>
          <button type="button" aria-label="收回集合总览" onClick={onClose} className="lcos-atlas-close">
            <img src={atlasCloseIcon} width={22} height={22} alt="" draggable={false} />
          </button>
        </>}
    >
        {state === 'loading' && <div className="py-16"><LcosSurfaceFeedback presentation="loading" message="正在读取集合…" /></div>}
        {state === 'error' && (
          <div className="py-16"><LcosSurfaceFeedback presentation="error" message={`集合读取失败${errorDetail ? `（${errorDetail}）` : ''}`} /></div>
        )}
        {state === 'ready' && items.length === 0 ? <LcosSurfaceFeedback presentation="empty" message="还没有集合" /> : null}
        {state === 'ready' && items.length > 0 && (
          <div className="lcos-atlas-grid">
            {groups.map((group) => (
              <section key={group.key} style={{ display: 'contents' }}>
                <div style={{ display: 'contents' }}>
                  {group.list.map((item) => {
                    const childTargets = workspaceTargetsForItem(item, workspaces);
                    const soleTarget = childTargets.length === 1 ? childTargets[0] : undefined;
                    const activate = soleTarget?.canvasId
                      ? () => { onEnterSurface(item, soleTarget); }
                      : childTargets.length === 0 && projected(item) ? () => { focusOnCanvas(item); } : undefined;
                    return (
                      <ContextCollectionView
                        key={`${item.kind}:${item.entityRef.id}`}
                        title={item.title ?? '未命名'}
                        organization="未指定"
                        {...(activate === undefined ? {} : { onActivate: activate, activationLabel: soleTarget?.canvasId ? `进入集合 · ${item.title ?? '未命名'}` : `定位集合 · ${item.title ?? '未命名'}` })}
                        {...(item.previewRef === undefined ? {} : { previewUrl: item.previewRef })}
                        disabled={!projected(item) && childTargets.length === 0}
                        action={
                          <span style={{ color: projected(item) || childTargets.length > 0 ? lcosTokens.color.info : lcosTokens.color.muted }}>
                            {childTargets.length === 1 ? (
                              <button type="button" aria-label={`进入 ${item.title ?? '集合'} 现场`} disabled={!childTargets[0]?.canvasId} onClick={() => { onEnterSurface(item, childTargets[0]); }}>
                              <ContextCollectionActionGlyph />
                              </button>
                            ) : childTargets.length > 1 ? (
                            <DropdownMenu trigger={<button type="button" aria-label={`选择 ${item.title ?? '集合'} 的现场`}><ContextCollectionActionGlyph /></button>}>
                                {childTargets.map((workspace) => (
                                  <DropdownMenuItem key={String(workspace.id)} disabled={!workspace.canvasId} onClick={() => { onEnterSurface(item, workspace); }}>
                                    {workspace.name}{workspace.canvasId ? '' : ' · 画布尚未就绪'}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenu>
                          ) : projected(item) ? <button type="button" aria-label={`定位 ${item.title ?? kindLabel(item)}`} onClick={() => { focusOnCanvas(item); }}><ContextCollectionActionGlyph /></button> : <span aria-hidden>↗</span>}
                          </span>
                        }
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
    </ContextAtlasView>
  );
}
