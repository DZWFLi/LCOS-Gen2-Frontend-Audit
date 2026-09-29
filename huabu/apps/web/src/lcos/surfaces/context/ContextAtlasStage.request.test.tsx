import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

import { ContextAtlasStage } from './ContextAtlasStage';

import type { WarehouseSnapshotV1 } from '@local-creative-os/contracts';

const mocks = vi.hoisted(() => ({
  queryWarehouse: vi.fn(),
}));

vi.mock('@local-creative-os/web-gen2', () => ({
  CoreAssemblyClient: class {
    queryWarehouse(...args: unknown[]) {
      return mocks.queryWarehouse(...args);
    }
  },
  HttpError: class HttpError extends Error {},
}));
vi.mock('../../app/lcosCoreClient', () => ({
  createLcosCoreSession: () => ({ http: {} }),
}));
vi.mock('@/hooks/useCloseOnEscape', () => ({
  useCloseOnEscape: () => undefined,
}));
vi.mock('../../lcosReferenceState', () => ({
  useLcosReferenceStore: { getState: () => ({ nodeEntityRefs: new Map() }) },
}));
vi.mock('../../ui/LcosSurfaceFeedback', () => ({
  LcosSurfaceFeedback: ({ message, onAction, actionLabel }: { message?: string; onAction?: () => void; actionLabel?: string }) => (
    <div data-feedback>{message}{onAction ? <button onClick={onAction}>{actionLabel}</button> : null}</div>
  ),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function snapshot(id: string): WarehouseSnapshotV1 {
  return {
    schemaVersion: 1,
    projectId: id,
    items: [
      {
        schemaVersion: 1,
        entityRef: { type: 'context', id },
        kind: 'context',
        title: id,
        usageCount: 0,
      },
    ],
    totalApprox: 1,
  };
}

function renderAtlas(projectId: string, mode?: 'context' | 'main-collections', currentContextId?: string) {
  const host = document.createElement('div');
  const root = createRoot(host);
  root.render(
    <ContextAtlasStage
      projectId={projectId}
      {...(mode === undefined ? {} : { mode })}
      {...(currentContextId === undefined ? {} : { currentContextId })}
      workspaces={[]}
      onClose={vi.fn()}
      onEnterSurface={() => true}
    />,
  );
  return { host, root };
}

describe('ContextAtlasStage warehouse ownership', () => {
  it('requests and renders only canonical Context blocks; scenes and generic collections stay out of Context Atlas', async () => {
    mocks.queryWarehouse.mockReset();
    mocks.queryWarehouse.mockResolvedValue({ ...snapshot('project'), items: [
      { schemaVersion: 1, kind: 'collection', entityRef: { type: 'collection', id: 'c-1' }, title: '集合', usageCount: 0 },
      { schemaVersion: 1, kind: 'scene', entityRef: { type: 'scene', id: 's-1' }, title: '工作空间目标', usageCount: 0 },
      { schemaVersion: 1, kind: 'context', entityRef: { type: 'context', id: 'x-1' }, title: '上下文', usageCount: 0 },
    ] } satisfies WarehouseSnapshotV1);
    const { host, root } = renderAtlas('project', 'context', 'x-1');
    await act(async () => {});
    expect([...host.querySelectorAll('[data-atlas-kind]')].map((node) => node.getAttribute('data-atlas-kind')))
      .toEqual(['context']);
    expect(mocks.queryWarehouse.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ kinds: ['context'] }));
    expect(host.textContent).toContain('1 个上下文集合');
    expect([...host.querySelectorAll('.lcos-context-collection-copy strong')].map((node) => node.textContent)).toEqual(['上下文']);
    expect(host.querySelectorAll('.collection-cover-empty')).toHaveLength(0);
    expect(host.querySelectorAll('[data-atlas-emblem]')).toHaveLength(1);
    expect(host.querySelector('[data-atlas-kind="context"]')?.closest('[data-lcos-context-collection-slot]')?.getAttribute('data-active')).toBe('true');
    expect(host.querySelectorAll('.lcos-context-collection-icon')).toHaveLength(0);
    expect(host.textContent).not.toContain('组织未标注');
    expect(host.textContent).not.toContain('暂无预览');
    root.unmount();
  });

  it('Main collection mode requests canonical Collections and never shows worksite scenes', async () => {
    mocks.queryWarehouse.mockReset();
    mocks.queryWarehouse.mockResolvedValue({ ...snapshot('project'), items: [
      { schemaVersion: 1, kind: 'collection', entityRef: { type: 'collection', id: 'canonical' }, title: '真正集合', usageCount: 0 },
      { schemaVersion: 1, kind: 'scene', entityRef: { type: 'scene', id: 'workspace' }, title: '现场', usageCount: 0 },
      { schemaVersion: 1, kind: 'collection', entityRef: { type: 'context', id: 'wrong-ref' }, title: '非集合身份', usageCount: 0 },
    ] } satisfies WarehouseSnapshotV1);
    const { host, root } = renderAtlas('project', 'main-collections');
    await act(async () => {});
    expect(host.textContent).toContain('真正集合');
    expect(host.textContent).toContain('1 个集合');
    expect(mocks.queryWarehouse.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ kinds: ['collection'] }));
    expect(host.textContent).not.toContain('现场');
    expect(host.textContent).not.toContain('非集合身份');
    root.unmount();
  });

  it('keeps the latest project request authoritative and clears stale cards while loading', async () => {
    const first = deferred<WarehouseSnapshotV1>();
    const second = deferred<WarehouseSnapshotV1>();
    mocks.queryWarehouse.mockReset();
    mocks.queryWarehouse.mockImplementation((projectId: string) =>
      projectId === 'project-a' ? first.promise : second.promise,
    );

    const { host, root } = renderAtlas('project-a');
    await act(async () => {});
    await act(async () => {
      root.render(
        <ContextAtlasStage
          projectId="project-b"
          workspaces={[]}
          onClose={vi.fn()}
          onEnterSurface={() => true}
        />,
      );
    });
    await act(async () => {});

    expect(host.textContent).toContain('正在读取上下文集合');
    expect(host.textContent).not.toContain('project-a');
    expect(mocks.queryWarehouse.mock.calls[0]?.[2]).toBeInstanceOf(AbortSignal);
    expect((mocks.queryWarehouse.mock.calls[0]?.[2] as AbortSignal).aborted).toBe(
      true,
    );

    await act(async () => {
      first.resolve(snapshot('project-a'));
    });
    expect(host.textContent).not.toContain('project-a');
    await act(async () => {
      second.resolve(snapshot('project-b'));
    });
    expect(host.textContent).toContain('project-b');
    root.unmount();
  });

  it('ignores a stale error after the newer project succeeds and aborts on unmount', async () => {
    const first = deferred<WarehouseSnapshotV1>();
    const second = deferred<WarehouseSnapshotV1>();
    mocks.queryWarehouse.mockReset();
    mocks.queryWarehouse.mockImplementation((projectId: string) =>
      projectId === 'project-a' ? first.promise : second.promise,
    );

    const { host, root } = renderAtlas('project-a');
    await act(async () => {});
    await act(async () => {
      root.render(
        <ContextAtlasStage
          projectId="project-b"
          workspaces={[]}
          onClose={vi.fn()}
          onEnterSurface={() => true}
        />,
      );
    });
    await act(async () => {
      second.resolve(snapshot('project-b'));
    });
    expect(host.textContent).toContain('project-b');
    await act(async () => {
      first.reject(new Error('stale failure'));
    });
    expect(host.textContent).toContain('project-b');

    root.unmount();
    expect((mocks.queryWarehouse.mock.calls[1]?.[2] as AbortSignal).aborted).toBe(
      true,
    );
  });
});

it('keeps retained collection bodies mounted and puts failed page recovery after the spatial field', async () => {
  const next = deferred<WarehouseSnapshotV1>();
  mocks.queryWarehouse.mockReset();
  mocks.queryWarehouse.mockResolvedValueOnce({ ...snapshot('first-page'), nextCursor: 'page-two' });
  mocks.queryWarehouse.mockReturnValueOnce(next.promise);
  mocks.queryWarehouse.mockResolvedValueOnce(snapshot('second-page'));
  const { host, root } = renderAtlas('project');
  await act(async () => {});
  const grid = host.querySelector('.lcos-atlas-grid');
  const firstCard = host.querySelector('[data-lcos-context-collection-slot]');
  await act(async () => host.querySelector<HTMLButtonElement>('.lcos-atlas-load-more')?.click());
  expect(host.querySelector('.lcos-atlas-grid')).toBe(grid);
  expect(host.querySelector('[data-lcos-context-collection-slot]')).toBe(firstCard);
  expect(host.querySelector('.py-16')).toBeNull();
  expect(host.querySelector('.lcos-atlas-load-more')?.textContent).toContain('正在读取更多');
  await act(async () => { next.reject(new Error('offline page two')); });
  const feedback = host.querySelector('.lcos-atlas-pagination-feedback');
  if (grid === null || feedback === null) throw new Error('Retained field and inline recovery must both be present');
  expect(grid.compareDocumentPosition(feedback)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(host.querySelector('[data-lcos-context-collection-slot]')).toBe(firstCard);
  expect(host.querySelector('.lcos-atlas-load-more')).toBeNull();
  await act(async () => feedback?.querySelector('button')?.click());
  expect(mocks.queryWarehouse.mock.calls[2]?.[1]).toEqual({ limit: 50, kinds: ['context'], cursor: 'page-two' });
  expect(host.querySelectorAll('[data-lcos-context-collection-slot]')).toHaveLength(2);
  expect(host.querySelector('[data-lcos-context-collection-slot]')).toBe(firstCard);
  root.unmount();
});

it('does not turn an unavailable scene workspace into a Context Atlas block', async () => {
  mocks.queryWarehouse.mockReset();
  mocks.queryWarehouse.mockResolvedValue({ ...snapshot('project'), items: [{
    schemaVersion: 1, kind: 'scene', entityRef: { type: 'scene', id: 'target' }, title: '工作空间目标', usageCount: 0,
  }] } satisfies WarehouseSnapshotV1);
  const { host, root } = renderAtlas('project');
  await act(async () => {});
  expect(host.querySelectorAll('[data-lcos-context-collection-slot]')).toHaveLength(0);
  expect(host.textContent).toContain('还没有上下文集合');
  root.unmount();
});
