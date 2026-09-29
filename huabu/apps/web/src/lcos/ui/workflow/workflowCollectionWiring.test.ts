import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WorkflowCardPoolProps } from '../../surfaces/workflow/WorkflowCardPool';
import type { Workspace } from '@local-creative-os/domain';
import type { ReactNode } from 'react';

const m = vi.hoisted(() => ({ pool: vi.fn(), stage: vi.fn() }));
vi.mock('../../surfaces/workflow/WorkflowCardPool', () => ({
  WorkflowCardPool: (props: WorkflowCardPoolProps) => {
    m.pool(props);
    return createElement('button', { 'data-real-entry-completed': true, onClick: props.onEnterWorksite }, '完成现场进入');
  },
}));
vi.mock('../../shell/LcosWorksiteStage', () => ({
  LcosWorksiteStage: (props: { ensureCanvas: (force?: boolean) => Promise<string | undefined> }) => {
    m.stage(props);
    return createElement('button', { 'data-recreate-stage': true, onClick: () => void props.ensureCanvas(true) }, '恢复画布');
  },
}));

import { WorkflowHandOverlay, WorkflowWorksite } from '../../surfaces/workflow/WorkflowWorksite';
import { AssemblyMaterialView } from '../professional/AssemblyMaterialView';

const mounted: { root: Root; host: HTMLDivElement }[] = [];
async function mount(node: ReactNode) {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); mounted.push({ host, root });
  await act(async () => root.render(node)); return host;
}
afterEach(async () => { for (const { root, host } of mounted.splice(0)) { await act(async () => root.unmount()); host.remove(); } vi.clearAllMocks(); });

describe('Workflow production surface wiring', () => {
  const workspaces: readonly Workspace[] = [];
  it('keeps one real canvas stage and passes exact origin through the hand; successful entry retracts it', async () => {
    const ensureCanvas = vi.fn().mockResolvedValue('canvas-existing');
    const host = await mount(createElement(WorkflowWorksite, { projectId: 'project-real', surface: 'workflow', canvasId: 'canvas-real', workspaces, isChildWorksite: true, ensureCanvas }));
    expect(host.querySelectorAll('[data-recreate-stage]')).toHaveLength(1);
    expect(m.pool).not.toHaveBeenCalled();
    await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-workflow-hand-toggle]')?.click());
    expect(m.pool).toHaveBeenLastCalledWith(expect.objectContaining({ projectId: 'project-real', workspaces, sourceSurface: 'workflow', sourceWasChild: true, onEnterWorksite: expect.any(Function) }));
    expect(host.querySelector('[data-lcos-workflow-worksite]')?.getAttribute('data-hand-open')).toBe('true');
    await act(async () => host.querySelector<HTMLButtonElement>('[data-real-entry-completed]')?.click());
    expect(host.querySelector('[data-lcos-workflow-worksite]')?.hasAttribute('data-hand-open')).toBe(false);
    expect(host.querySelectorAll('[data-recreate-stage]')).toHaveLength(1);
    await act(async () => host.querySelector<HTMLButtonElement>('[data-recreate-stage]')?.click());
    expect(ensureCanvas).toHaveBeenCalledWith('workflow', true);
    expect(m.stage).toHaveBeenLastCalledWith(expect.objectContaining({ projectId: 'project-real', canvasId: 'canvas-real', surface: 'workflow' }));
  });
  it('Main uses the same hand owner with its exact source and successful-entry callback', async () => {
    const onClose = vi.fn();
    const host = await mount(createElement(WorkflowHandOverlay, { projectId: 'project-main', workspaces, sourceSurface: 'main', sourceWasChild: false, open: true, onClose }));
    expect(m.pool).toHaveBeenLastCalledWith(expect.objectContaining({ projectId: 'project-main', workspaces, sourceSurface: 'main', sourceWasChild: false, onEnterWorksite: onClose }));
    await act(async () => host.querySelector<HTMLButtonElement>('[data-real-entry-completed]')?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it('Assembly presents the actual workflow face, dispatches the owner action, and reports only its supplied draft state', async () => {
    const onUse = vi.fn();
    const host = await mount(createElement(AssemblyMaterialView, { title: '真实工作流', familyLabel: '工作流', shape: 'workflow', fallbackGlyph: null, referenced: true, onUse }));
    expect(host.querySelector('[data-shape="workflow"] .lcos-workflow-task-card')).not.toBeNull();
    expect(host.textContent).toContain('真实工作流'); expect(host.textContent).toContain('已加入草稿 · 未发送');
    await act(async () => host.querySelector<HTMLButtonElement>('[data-lcos-task-take]')?.click());
    expect(onUse).toHaveBeenCalledTimes(1);
    expect(host.textContent).not.toContain('执行完成');
  });
});
