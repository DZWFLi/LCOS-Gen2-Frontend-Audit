import { describe, expect, it, vi } from 'vitest';

import { beginChildWorksiteNavigation } from './childWorksiteNavigation';

import type { Workspace } from '@local-creative-os/domain';

const mocks = vi.hoisted(() => ({
  canvas: {
    canvasId: 'canvas-source',
    viewport: { x: 18, y: -12, zoom: 0.84 },
    nodes: [
      { id: 'node-selected', selected: true },
      { id: 'node-other', selected: false },
    ],
  },
  refs: new Map([
    ['node-selected', { entityType: 'collection', entityId: 'collection-1' }],
  ]),
  begin: vi.fn(),
}));

vi.mock('@/store/canvasStore', () => ({
  default: { getState: () => mocks.canvas },
}));
vi.mock('../lcosReferenceState', () => ({
  useLcosReferenceStore: { getState: () => ({ nodeEntityRefs: mocks.refs }) },
}));
vi.mock('../shell/lcosShellStore', () => ({
  useLcosShellStore: { getState: () => ({ beginChildNavigation: mocks.begin }) },
}));

describe('beginChildWorksiteNavigation', () => {
  it('captures the exact source camera and selected identity before routing', () => {
    const navigate = vi.fn();
    mocks.begin.mockReset();

    expect(beginChildWorksiteNavigation({
      projectId: 'project-1',
      sourceSurface: 'context',
      sourceWorkspaceId: 'workspace-context',
      sourceWasChild: false,
      targetSurface: 'context',
      targetWorkspace: { id: 'workspace-child' as Workspace['id'], canvasId: 'canvas-child' },
      navigate,
    })).toBe(true);

    expect(mocks.begin).toHaveBeenCalledWith({
      projectId: 'project-1',
      sourceSurface: 'context',
      sourceWorkspaceId: 'workspace-context',
      sourceWasChild: false,
      sourceCanvasId: 'canvas-source',
      sourceViewport: { x: 18, y: -12, zoom: 0.84 },
      selectedNodeIds: ['node-selected'],
      sourceEntityRefs: [{ nodeId: 'node-selected', entityType: 'collection', entityId: 'collection-1' }],
    });
    expect(navigate).toHaveBeenCalledWith('/projects/project-1/context?workspaceId=workspace-child');
  });

  it('fails closed when the target workspace has no canvas', () => {
    const navigate = vi.fn();
    mocks.begin.mockReset();

    expect(beginChildWorksiteNavigation({
      projectId: 'project-1',
      sourceSurface: 'main',
      sourceWasChild: false,
      targetSurface: 'context',
      targetWorkspace: { id: 'workspace-empty' as Workspace['id'] },
      navigate,
    })).toBe(false);
    expect(mocks.begin).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
