import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { ArchiveBody } from './ArchiveBody';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  listArtifacts: vi.fn(),
  restoreArtifact: vi.fn(),
  openReader: vi.fn(),
  notifyMutationSuccess: vi.fn(),
}));

vi.mock('../app/lcosCoreClient', () => ({
  createLcosCoreSession: () => ({
    artifacts: {
      listArtifacts: mocks.listArtifacts,
      restoreArtifact: mocks.restoreArtifact,
    },
  }),
}));
vi.mock('../host/lcosHostState', () => ({
  useLcosHostStore: Object.assign(() => undefined, {
    getState: () => ({ host: { notifyMutationSuccess: mocks.notifyMutationSuccess } }),
  }),
}));
vi.mock('../shell/lcosShellStore', () => {
  const state = { openReader: mocks.openReader };
  return {
    useLcosShellStore: Object.assign(
      (selector: (value: typeof state) => unknown) => selector(state),
      { getState: () => state },
    ),
  };
});
vi.mock('../ui/lcosTokens', () => ({
  lcosTokens: {
    color: {
      text: '#111',
      muted: '#777',
      raised: '#eee',
      danger: '#a00',
      info: '#06c',
    },
  },
}));

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  Object.values(mocks).forEach((mock) => mock.mockReset());
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it('lists archived objects as read-only, opens Reader, and restores the same identity', async () => {
  const archived = {
    id: 'artifact-1',
    projectId: 'project-1',
    title: '归档材料',
    kind: 'markdown',
    availability: 'available',
    archivedAt: '2026-09-20T00:00:00.000Z',
    createdAt: '2026-09-19T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  };
  mocks.listArtifacts
    .mockResolvedValueOnce([archived])
    .mockResolvedValueOnce([]);
  mocks.restoreArtifact.mockResolvedValue({
    ...archived,
    archivedAt: undefined,
  });

  await act(async () => root.render(<ArchiveBody projectId="project-1" />));
  await act(async () => mocks.listArtifacts.mock.results[0]?.value);
  expect(mocks.listArtifacts).toHaveBeenCalledWith('project-1', 'archived');
  expect(
    host.querySelector('[data-lcos-archive-item="artifact-1"]')?.textContent,
  ).toContain('只读');

  const buttons = [
    ...host.querySelectorAll<HTMLButtonElement>(
      '[data-lcos-archive-item="artifact-1"] button',
    ),
  ];
  await act(async () =>
    buttons.find((button) => button.textContent?.includes('查看'))?.click(),
  );
  expect(mocks.openReader).toHaveBeenCalledWith('归档材料', 'artifact-1');

  await act(async () =>
    buttons.find((button) => button.textContent?.includes('恢复'))?.click(),
  );
  await act(async () => mocks.restoreArtifact.mock.results[0]?.value);
  expect(mocks.restoreArtifact).toHaveBeenCalledWith('project-1', 'artifact-1');
  expect(mocks.notifyMutationSuccess).toHaveBeenCalledOnce();
  expect(host.textContent).toContain('按当前现场重新落位');
});
