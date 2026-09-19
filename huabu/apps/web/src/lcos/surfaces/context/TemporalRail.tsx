import { useEffect, useMemo, useState } from 'react';

import { createLcosCoreSession } from '../../app/lcosCoreClient';
import { useLcosReferenceStore } from '../../lcosReferenceState';
import { useLcosShellStore } from '../../shell/lcosShellStore';
import { TemporalRailView, type TemporalRailItemView } from '../../ui/context/TemporalRailView';

import type { TemporalGroupV1, TemporalIndexV1 } from '@local-creative-os/contracts';

export interface TemporalRailProps {
  readonly projectId: string;
  readonly workspaceId?: string;
}

function ratioFor(index: number, count: number): number {
  return count <= 1 ? 0.5 : index / (count - 1);
}

function projectedNodeId(group: TemporalGroupV1): string | undefined {
  const refs = useLcosReferenceStore.getState().nodeEntityRefs;
  return [...refs.entries()].find(([, ref]) => group.targets.some(
    (target) => target.type === ref.entityType && target.id === ref.entityId,
  ))?.[0];
}

export function TemporalRail({ projectId, workspaceId }: TemporalRailProps): React.JSX.Element {
  const [index, setIndex] = useState<TemporalIndexV1 | null>(null);
  const [state, setState] = useState<'loading' | 'empty' | 'ready' | 'error'>('loading');
  const [reason, setReason] = useState<string>();

  useEffect(() => {
    if (workspaceId === undefined) {
      setIndex(null);
      setState('empty');
      setReason('请选择 Context 子现场');
      return;
    }
    const controller = new AbortController();
    setState('loading');
    setReason(undefined);
    const session = createLcosCoreSession();
    void session.temporal.getIndex(projectId, workspaceId, controller.signal).then((response) => {
      setIndex(response.value);
      setState(response.value.facts.length > 0 ? 'ready' : 'empty');
      setReason(response.value.facts.length > 0 ? undefined : '这个 Context 还没有可定位的时间记录');
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setIndex(null);
      setState('error');
      setReason(error instanceof Error ? error.message : '时间记录读取失败');
    });
    return () => controller.abort();
  }, [projectId, workspaceId]);

  const groups = index?.mid ?? [];
  const items = useMemo<readonly TemporalRailItemView[]>(() => groups.map((group, itemIndex) => ({
    id: group.id,
    label: `${new Date(group.start).toLocaleString()} · ${group.eventCount} 条记录`,
    ratio: ratioFor(itemIndex, groups.length),
    disabled: projectedNodeId(group) === undefined,
  })), [groups]);

  const activate = (item: TemporalRailItemView): void => {
    const group = groups.find((candidate) => candidate.id === item.id);
    if (group === undefined) return;
    const nodeId = projectedNodeId(group);
    if (nodeId === undefined) return;
    useLcosShellStore.getState().requestLocate({ reqId: `temporal-${Date.now()}`, surface: 'context', nodeId, status: 'projected' });
  };

  return <TemporalRailView
    items={items}
    reason={reason}
    state={state}
    scopeKey={workspaceId}
    onActivate={activate}
  />;
}
