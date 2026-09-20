import { useEffect, useMemo, useState } from 'react';

import {
  createTemporalLocateRequest,
  projectTemporalGroupTargets,
  temporalPartialReason,
} from './temporalTargetProjection';
import { createLcosCoreSession } from '../../app/lcosCoreClient';
import { useLcosReferenceStore } from '../../lcosReferenceState';
import { useLcosShellStore } from '../../shell/lcosShellStore';
import { TemporalRailView, type TemporalRailItemView } from '../../ui/context/TemporalRailView';

import type { TemporalIndexV1 } from '@local-creative-os/contracts';

export interface TemporalRailProps {
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly canvasId?: string;
}

function ratioFor(index: number, count: number): number {
  return count <= 1 ? 0.5 : index / (count - 1);
}

export function TemporalRail({ projectId, workspaceId, canvasId }: TemporalRailProps): React.JSX.Element {
  const [index, setIndex] = useState<TemporalIndexV1 | null>(null);
  const [state, setState] = useState<'loading' | 'empty' | 'ready' | 'error'>('loading');
  const [reason, setReason] = useState<string>();
  const [activationReason, setActivationReason] = useState<string>();
  const nodeEntityRefs = useLcosReferenceStore((referenceState) => referenceState.nodeEntityRefs);

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
    setActivationReason(undefined);
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

  const groups = useMemo(() => index?.mid ?? [], [index]);
  const projections = useMemo(
    () => new Map(groups.map((group) => [group.id, projectTemporalGroupTargets(group, nodeEntityRefs)])),
    [groups, nodeEntityRefs],
  );
  const items = useMemo<readonly TemporalRailItemView[]>(() => groups.map((group, itemIndex) => {
    const projection = projections.get(group.id);
    const located = projection?.projectedTargetCount ?? 0;
    const targetSummary = `可定位 ${located}/${group.targets.length} 个目标`;
    return {
      id: group.id,
      label: `${new Date(group.start).toLocaleString()} · ${group.eventCount} 条记录 · ${targetSummary}`,
      ratio: ratioFor(itemIndex, groups.length),
      disabled: projection === undefined || projection.nodeIds.length === 0,
    };
  }), [groups, projections]);

  const activate = (item: TemporalRailItemView): void => {
    const group = groups.find((candidate) => candidate.id === item.id);
    if (group === undefined) return;
    const projection = projections.get(group.id);
    if (projection === undefined || projection.nodeIds.length === 0) return;
    setActivationReason(temporalPartialReason(projection, group.targets.length));
    const request = createTemporalLocateRequest({
      reqId: `temporal-${Date.now()}`,
      ...(canvasId === undefined ? {} : { canvasId }),
      projection,
    });
    if (request !== undefined) useLcosShellStore.getState().requestLocate(request);
  };

  return <TemporalRailView
    items={items}
    reason={activationReason ?? reason}
    state={activationReason === undefined ? state : 'recovery'}
    scopeKey={workspaceId}
    onActivate={activate}
  />;
}
