import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { useCloseOnEscape } from '@/hooks/useCloseOnEscape';

import { ProfessionalWindowStage } from './ProfessionalWindowStage';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore } from '../shell/lcosShellStore';

vi.mock('./ArtifactReaderBody', () => ({
  ArtifactReaderBody: ({
    artifactId,
    revisionId,
    onReturnToSource,
  }: {
    artifactId?: string;
    revisionId?: string;
    onReturnToSource?: () => void;
  }) => (
    <button
      type="button"
      data-reader-artifact={artifactId}
      data-reader-revision={revisionId}
      onClick={onReturnToSource}
    />
  ),
}));
vi.mock('./AssemblyBody', () => ({ AssemblyBody: () => null }));
vi.mock('./PortalPreviewBody', () => ({
  PortalPreviewBody: ({
    portalTargetResolution,
    onOpenPortalTarget,
  }: {
    portalTargetResolution?: { canvasId: string; workspaceId: string; targetSurface: string } | null;
    onOpenPortalTarget?: (target: { canvasId: string; workspaceId: string; targetSurface: string }) => void;
  }) => (
    <button
      data-portal-target-resolution={portalTargetResolution === null ? 'missing' : portalTargetResolution?.workspaceId}
      type="button"
      onClick={() => {
        if (portalTargetResolution && onOpenPortalTarget) onOpenPortalTarget(portalTargetResolution);
      }}
    />
  ),
}));
vi.mock('./ConversationWorkViewBody', () => ({ ConversationWorkViewBody: InlineComposerFixture }));

// Reproduce the production child's Escape registration using the real Huabu hook.
function InlineComposerFixture({ connectedConversationId }: { connectedConversationId?: string }) {
  const open = useLcosShellStore((s) => s.composerOpen && s.composerTarget?.receiverConversationId === connectedConversationId);
  useCloseOnEscape(open, () => useLcosShellStore.getState().closeComposer());
  return <div data-composer-open={open} />;
}
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  useLcosShellStore.getState().clear();
  useLcosReferenceStore.getState().reset();
  window.sessionStorage.clear();
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  useLcosReferenceStore.getState().reset();
  host.remove();
});
async function escape() {
  await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
}
it('renders every independent region and publishes every region as occupied', async () => {
  const store = useLcosShellStore.getState();
  store.openWindow('reader', '材料 A', 'artifact-a');
  store.openWindow('reader', '材料 B', 'artifact-b');
  await act(async () => root.render(<ProfessionalWindowStage projectId="p" />));

  expect(host.querySelectorAll('[data-lcos-professional-stage]')).toHaveLength(1);
  const regions = host.querySelectorAll('[data-lcos-window-region-id]');
  expect(regions).toHaveLength(2);
  expect((regions[0] as HTMLElement | undefined)?.style.left).not.toBe((regions[1] as HTMLElement | undefined)?.style.left);
  expect(new Set(Array.from(regions, (element) => element.getAttribute('data-lcos-window-region-id')))).toEqual(
    new Set(useLcosShellStore.getState().windowRegions.map((region) => region.id)),
  );
  expect(host.querySelectorAll('[data-reader-artifact]')).toHaveLength(2);
  expect(useLcosShellStore.getState().windowEnvironment?.occupiedRects).toHaveLength(2);
  expect(useLcosShellStore.getState().windowEnvironment?.activeRegionId).toBe(
    useLcosShellStore.getState().windowRegions[1]?.id,
  );
});
it('passes the shell-owned Reader revision target into the body without changing Stage geometry ownership', async () => {
  useLcosShellStore.getState().openReader('阅读 · 指定版本', 'artifact-target', {
    revisionId: 'revision-target',
    source: { surface: 'context', nodeId: 'node-target' },
  });
  await act(async () => root.render(<ProfessionalWindowStage projectId="p" />));
  expect(host.querySelector('[data-reader-artifact="artifact-target"][data-reader-revision="revision-target"]')).not.toBeNull();
  expect(useLcosShellStore.getState().windows[0]).toMatchObject({
    readerRevisionId: 'revision-target',
    readerSource: { surface: 'context', nodeId: 'node-target' },
  });
  expect(useLcosShellStore.getState().windowRegions).toHaveLength(1);
  expect(useLcosShellStore.getState().windowRegions[0]?.layout).toBe('floating');
});

it('closes a Reader and returns to its exact live source for both body action and Escape', async () => {
  const store = useLcosShellStore.getState();
  store.openReader('材料 A', 'artifact-a', {
    revisionId: 'revision-a',
    source: { surface: 'context', nodeId: 'node-a' },
  });
  useLcosReferenceStore.getState().registerNodeEntity('node-a', { entityType: 'artifact', entityId: 'artifact-a' });
  await act(async () => root.render(<ProfessionalWindowStage projectId="p" />));
  const reader = host.querySelector<HTMLButtonElement>('[data-reader-artifact="artifact-a"]');
  if (reader === null) throw new Error('Reader body missing');
  await act(async () => reader.click());
  expect(useLcosShellStore.getState().windows).toHaveLength(0);
  expect(useLcosShellStore.getState().locateRequest).toMatchObject({
    surface: 'context', nodeId: 'node-a', status: 'projected',
  });

  store.consumeLocate();
  store.openReader('材料 A', 'artifact-a', {
    revisionId: 'revision-a',
    source: { surface: 'context', nodeId: 'node-a' },
  });
  await act(async () => {});
  await escape();
  expect(useLcosShellStore.getState().windows).toHaveLength(0);
  expect(useLcosShellStore.getState().locateRequest).toMatchObject({
    surface: 'context', nodeId: 'node-a', status: 'projected',
  });
});
it('closes the inline Composer first and keeps its Work View until the next Escape', async () => {
  const store = useLcosShellStore.getState();
  store.openWindow('conversation', '会话', 'conversation-a');
  store.openComposer({ nodeId: 'n', title: '会话', receiverConversationId: 'conversation-a', anchor: { x: 0, y: 0, width: 1, height: 1 } });
  store.setComposerPrompt('保留这份草稿');
  await act(async () => root.render(<ProfessionalWindowStage projectId="p" />));
  await escape();
  expect(useLcosShellStore.getState().composerOpen).toBe(false);
  expect(useLcosShellStore.getState().composerPrompt).toBe('保留这份草稿');
  expect(useLcosShellStore.getState().windows).toHaveLength(1);
  await escape();
  expect(useLcosShellStore.getState().windows).toHaveLength(0);
});
it('does not let a hidden Composer for another conversation block closing the current window', async () => {
  const store = useLcosShellStore.getState();
  store.openWindow('conversation', '会话 B', 'b');
  store.openComposer({ nodeId: 'n', title: 'A', receiverConversationId: 'a', anchor: { x: 0, y: 0, width: 1, height: 1 } });
  await act(async () => root.render(<ProfessionalWindowStage projectId="p" />));
  await escape();
  expect(useLcosShellStore.getState().windows).toHaveLength(0);
});

it('passes the Core-resolved Portal Workspace to the production open caller', async () => {
  const store = useLcosShellStore.getState();
  store.openWindow('portal-preview', '入口', 'canvas-target', 'canvas');
  const open = vi.fn();
  await act(async () => root.render(
    <ProfessionalWindowStage
      projectId="p"
      resolvePortalTarget={(canvasId) => canvasId === 'canvas-target'
        ? { canvasId, workspaceId: 'workspace-target', targetSurface: 'context' }
        : undefined}
      onOpenPortalTarget={open}
    />,
  ));
  const portal = host.querySelector<HTMLButtonElement>('[data-portal-target-resolution="workspace-target"]');
  if (!portal) throw new Error('Resolved Portal target was not passed to the body');
  await act(async () => portal.click());
  expect(open).toHaveBeenCalledWith({ canvasId: 'canvas-target', workspaceId: 'workspace-target', targetSurface: 'context' });
});
