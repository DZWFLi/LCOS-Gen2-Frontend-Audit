import { describe, expect, it } from 'vitest';

import { railwayReceiveLabel, railwayReceivePresentation } from './railwayReceivePresentation';

const targetId = 'railway:p:scene:w-1';

describe('railwayReceivePresentation', () => {
  it('uses the shared resolver outcome for the exact hot destination', () => {
    const state = {
      status: 'preview' as const,
      payload: { kind: 'object' as const, entityType: 'artifact', entityId: 'a-1' },
      destination: { targetId, previewPoint: { x: 1, y: 2 } },
      carryAnchor: 'left' as const,
    };
    expect(railwayReceivePresentation({
      targetId,
      enabled: true,
      dropState: state,
      resolution: {
        status: 'ready',
        intent: {
          kind: 'assembly-apply',
          targetId,
          targetRef: { kind: 'workspace', id: 'w-1' },
          sourceRefs: [{ kind: 'artifactView', id: 'a-1' }],
          railwayReceive: true,
          railwayDestinationRef: { kind: 'scene', viewId: 'w-1' },
        },
      },
    })).toBe('receive-hot');
  });

  it('does not make another Railway eligibility decision', () => {
    const state = {
      status: 'preview' as const,
      payload: { kind: 'file' as const, name: 'brief.pdf' },
      destination: { targetId, previewPoint: { x: 1, y: 2 } },
      carryAnchor: 'left' as const,
    };
    expect(railwayReceivePresentation({
      targetId,
      enabled: true,
      dropState: state,
      resolution: { status: 'ineligible', targetId, reason: '该来源没有可写入 Core 的实体引用' },
    })).toBe('ineligible');
  });

  it('keeps unavailable destinations fail-closed and exposes user language', () => {
    const presentation = railwayReceivePresentation({
      targetId,
      enabled: false,
      dropState: { status: 'idle' },
      resolution: null,
    });
    expect(presentation).toBe('ineligible');
    expect(railwayReceiveLabel(presentation, '目标已归档')).toBe('目标已归档');
  });

  it('does not assign a targetless failure to every destination', () => {
    expect(railwayReceivePresentation({
      targetId,
      enabled: true,
      dropState: { status: 'failed', reason: 'network', recoverable: true },
      resolution: null,
    })).toBe('rest');
  });
});
