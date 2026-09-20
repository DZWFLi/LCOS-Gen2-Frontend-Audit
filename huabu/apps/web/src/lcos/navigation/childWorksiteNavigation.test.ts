import { describe, expect, it, vi } from 'vitest';

import { beginChildWorksiteNavigation } from './childWorksiteNavigation';

import type { Workspace } from '@local-creative-os/domain';

const mocks = vi.hoisted(() => ({
  canvas: {
    canvasId: 'canvas-source',
    viewport: { x: 18, y: -12, zoom: 0.84 },
    rfInstance: null,
    nodes: [
      { id: 'node-selected', selected: true },
      { id: 'node-other', selected: false },
    ],
    switchCanvas: vi.fn(),
  },
  refs: new Map([
    ['node-selected', { entityType: 'collection', entityId: 'collection-1' }],
  ]),
  begin: vi.fn(),
  transition: null as null | {
    id: string;
    canvasId: string;
    kind: 'enter-settle' | 'return-restore';
    startViewport?: { x: number; y: number; zoom: number };
    targetViewport?: { x: number; y: number; zoom: number };
  },
}));

vi.mock('@/store/canvasStore', () => ({
  default: { getState: () => mocks.canvas },
}));
vi.mock('../lcosReferenceState', () => ({
  useLcosReferenceStore: { getState: () => ({ nodeEntityRefs: mocks.refs }) },
}));
vi.mock('../shell/lcosShellStore', () => ({
  useLcosShellStore: {
    getState: () => ({
      beginChildNavigation: mocks.begin,
      worksiteCameraTransition: mocks.transition,
      requestWorksiteCameraTransition: (value: Omit<NonNullable<typeof mocks.transition>, 'id'>) => {
        mocks.transition = { id: 'transition-1', ...value };
        return 'transition-1';
      },
      updateWorksiteCameraTransition: (
        id: string,
        value: Pick<NonNullable<typeof mocks.transition>, 'startViewport' | 'targetViewport'>,
      ) => {
        if (mocks.transition?.id === id) mocks.transition = { ...mocks.transition, ...value };
      },
    }),
  },
}));

describe('beginChildWorksiteNavigation', () => {
  it('approaches, captures the exact source identity, then settles the loaded target before routing', async () => {
    const navigate = vi.fn();
    mocks.begin.mockReset();
    mocks.transition = null;
    mocks.canvas.canvasId = 'canvas-source';
    mocks.canvas.viewport = { x: 18, y: -12, zoom: 0.84 };
    mocks.canvas.switchCanvas.mockImplementation(async (canvasId: string) => {
      mocks.canvas.canvasId = canvasId;
      mocks.canvas.viewport = { x: -50, y: 24, zoom: 0.7 };
      return true;
    });

    expect(beginChildWorksiteNavigation({
      projectId: 'project-1',
      sourceSurface: 'context',
      sourceWorkspaceId: 'workspace-context',
      sourceWasChild: false,
      targetSurface: 'context',
      targetWorkspace: { id: 'workspace-child' as Workspace['id'], canvasId: 'canvas-child' },
      navigate,
    })).toBe(true);

    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(mocks.begin).toHaveBeenCalledWith({
      projectId: 'project-1',
      sourceSurface: 'context',
      sourceWorkspaceId: 'workspace-context',
      sourceWasChild: false,
      sourceCanvasId: 'canvas-source',
      sourceViewport: { x: 18, y: -12, zoom: 0.84 },
      sourceApproachViewport: { x: 18, y: -12, zoom: 0.84 },
      selectedNodeIds: ['node-selected'],
      sourceEntityRefs: [{ nodeId: 'node-selected', entityType: 'collection', entityId: 'collection-1' }],
    });
    expect(mocks.canvas.switchCanvas).toHaveBeenCalledWith('canvas-child');
    expect(mocks.transition).toMatchObject({
      id: 'transition-1',
      canvasId: 'canvas-child',
      kind: 'enter-settle',
      targetViewport: { x: -50, y: 24, zoom: 0.7 },
    });
    expect(navigate).toHaveBeenCalledWith('/projects/project-1/context?workspaceId=workspace-child');
  });

  it('fails closed when the target workspace has no canvas', () => {
    const navigate = vi.fn();
    mocks.begin.mockReset();
    mocks.transition = null;

    expect(beginChildWorksiteNavigation({
      projectId: 'project-1',
      sourceSurface: 'main',
      sourceWasChild: false,
      targetSurface: 'context',
      targetWorkspace: { id: 'workspace-empty' as Workspace['id'] },
      navigate,
    })).toBe(false);
    expect(mocks.begin).not.toHaveBeenCalled();
    expect(mocks.transition).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });
});
