import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { ColorPinHud } from './ColorPinHud';

const mocks = vi.hoisted(() => ({
  projection: {} as Record<string, unknown>,
  requestFocusWhere: vi.fn(),
  requestLocate: vi.fn(),
  assign: vi.fn(),
  remove: vi.fn(),
  nodes: [{ id: 'node-a', selected: true }],
  refs: new Map<string, { entityType: string; entityId: string; descriptor?: { title?: string } }>(),
}));

vi.mock('./LcosColorPinProvider', () => ({ useLcosColorPins: () => mocks.projection }));
vi.mock('./lcosColorPinPalette', () => ({
  readColorPinPaletteV1: () => ({ violet: '#6633FF', teal: '#00AA99', amber: '#FFAA00' }),
  paletteTonesV1: () => ['violet', 'teal', 'amber'],
  toneForColorPinV1: () => 'violet',
}));
vi.mock('../navigation/LcosNavigatorIsland', () => ({
  LcosNavigatorIsland: (props: {
    pins?: readonly { id: string; label: string }[];
    onActivatePin?: (pin: { id: string; label: string }) => void;
    onCreatePin?: () => void;
  }) => <div>
    <button data-test-create-pin onClick={props.onCreatePin}>create</button>
    {props.pins?.map((pin) => <button key={pin.id} data-test-pin={pin.id} onClick={() => props.onActivatePin?.(pin)}>{pin.label}</button>)}
  </div>,
}));
vi.mock('../app/useLcosWorksiteNav', () => ({ useLcosWorksiteNav: () => ({ switchWorksite: vi.fn() }) }));
vi.mock('../navigation/waitForProjectedEntity', () => ({ waitForProjectedEntity: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/store/canvasStore', () => ({ default: { getState: () => ({ nodes: mocks.nodes, canvasId: 'canvas-main', switchCanvas: vi.fn() }) } }));
vi.mock('../lcosReferenceState', () => ({ useLcosReferenceStore: { getState: () => ({ nodeEntityRefs: mocks.refs }) } }));
vi.mock('../shell/lcosShellStore', () => ({
  useLcosShellStore: (selector: (state: Record<string, unknown>) => unknown) => selector({
    activeSurface: 'main',
    windowEnvironment: null,
    requestLocate: mocks.requestLocate,
    requestFocusWhere: mocks.requestFocusWhere,
    openWindow: vi.fn(),
    setActiveSurface: vi.fn(),
  }),
}));

const at = '2026-09-20T00:00:00.000Z';
const definition = { id: 'blue', projectId: 'p', color: '#6633FF', label: 'Blue', createdAt: at, updatedAt: at };
const membership = {
  id: 'member-a', projectId: 'p', colorPinId: 'blue',
  targetRef: { projectId: 'p', kind: 'entity' as const, id: 'artifact-a' },
  createdAt: at, updatedAt: at,
};

function resetProjection(): void {
  mocks.projection = {
    projectId: 'p',
    snapshot: { definitions: [definition], memberships: [membership] },
    status: 'ready', busy: false,
    usedDefinitions: [definition],
    membershipsByColorPinId: new Map([['blue', [membership]]]),
    membershipsByTargetKey: new Map(),
    projectTruth: { scopes: [{ id: 'root', projectId: 'p', kind: 'root' }], workspaces: [] },
    authoringTarget: undefined,
    openAuthoring: vi.fn((target) => { mocks.projection = { ...mocks.projection, authoringTarget: target }; }),
    closeAuthoring: vi.fn(),
    assignMembership: mocks.assign,
    removeMembership: mocks.remove,
    targetIdentity: () => ({ entityType: 'artifact', entityId: 'artifact-a', label: 'Brief' }),
    resolveNavigationTarget: vi.fn(),
    refresh: vi.fn(), clearMessage: vi.fn(),
  };
}

afterEach(() => {
  mocks.requestFocusWhere.mockReset(); mocks.requestLocate.mockReset();
  mocks.assign.mockReset(); mocks.remove.mockReset(); mocks.refs.clear();
  document.body.replaceChildren();
});

it('opens a used color group and hands a canonical entity to the existing Focus/Where owner', async () => {
  resetProjection();
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ColorPinHud projectId="p" canvasBySurface={{}} surfaceByWorkspace={new Map()} ensureCanvas={async () => undefined} ensureWorkspaceCanvas={async () => undefined} />));
    await act(async () => host.querySelector<HTMLButtonElement>('[data-test-pin="blue"]')?.click());
    expect(host.querySelector('[data-lcos-color-pin-member="member-a"]')).not.toBeNull();
    await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-color-pin-travel]')?.click());
    expect(mocks.requestFocusWhere).toHaveBeenCalledWith(expect.objectContaining({ entityType: 'artifact', entityId: 'artifact-a', title: 'Brief' }));
  } finally {
    await act(async () => root.unmount());
  }
});

it('authoring preserves canonical Artifact versus explicit View target kinds', async () => {
  resetProjection();
  mocks.refs.set('node-a', { entityType: 'artifact', entityId: 'artifact-a', descriptor: { title: 'Brief' } });
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ColorPinHud projectId="p" canvasBySurface={{}} surfaceByWorkspace={new Map()} ensureCanvas={async () => undefined} ensureWorkspaceCanvas={async () => undefined} />));
    await act(async () => host.querySelector<HTMLButtonElement>('[data-test-create-pin]')?.click());
    expect(mocks.projection.openAuthoring).toHaveBeenCalledWith(expect.objectContaining({ targetRef: { projectId: 'p', kind: 'entity', id: 'artifact-a' } }));

    mocks.refs.set('node-a', { entityType: 'view', entityId: 'view-a', descriptor: { title: 'Specific view' } });
    await act(async () => host.querySelector<HTMLButtonElement>('[data-test-create-pin]')?.click());
    expect(mocks.projection.openAuthoring).toHaveBeenLastCalledWith(expect.objectContaining({ targetRef: { projectId: 'p', kind: 'view', id: 'view-a' } }));
  } finally {
    await act(async () => root.unmount());
  }
});
