import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = resolve((import.meta as unknown as { dirname?: string }).dirname ?? process.cwd(), '..', '..', '..', '..', '..', '..', '..');
const read = (relative: string): string => readFileSync(join(ROOT, relative), 'utf8');

describe('Workflow Collection 真实 caller 接线', () => {
  it('Main 节点使用主画布 rendition，并按真实 scope workspace 进入 Workflow', () => {
    const source = read('huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx');
    expect(source).toContain("import { WorkflowCollectionView } from '../ui/workflow/WorkflowCollectionView';");
    expect(source).toContain('rendition="主画布"');
    expect(source).toContain('String(workspace.scopeId) === ref.entityId');
    expect(source).toContain('beginChildWorksiteNavigation({');
    expect(source).toContain("targetSurface: 'workflow'");
  });

  it('Assembly workflow item 使用专用任务卡面，并复用精确 workspaceTargets/child navigation', () => {
    const source = read('huabu/apps/web/src/lcos/professional/AssemblyBody.tsx');
    const material = read('huabu/apps/web/src/lcos/ui/professional/AssemblyMaterialView.tsx');
    expect(source).toContain('assemblyMaterialShape(item)');
    expect(material).toContain("shape === 'workflow'");
    expect(material).toContain('<WorkflowTaskCardFace');
    expect(material).toContain('rendition="装配"');
    expect(source).toContain('workspaceTargetsForItem(item, workspaces)');
    expect(source).toContain('enterChildWorkspace(item, workspace)');
  });

  it('Workflow Worksite 继续由唯一 WorkflowCardPool 提供卡池', () => {
    const source = read('huabu/apps/web/src/lcos/surfaces/workflow/WorkflowWorksite.tsx');
    expect(source).toContain("import { WorkflowCardPool } from './WorkflowCardPool';");
    expect(source).toContain('<WorkflowCardPool projectId={projectId} workspaces={workspaces} sourceSurface={sourceSurface} sourceWasChild={sourceWasChild} />');
  });

  it('Main workflow 节点来自 Core scope 的单一投影绑定，不创建第二 store', () => {
    const runner = read('apps/web-gen2/src/spatial/reconciliationRunner.ts');
    const host = read('apps/web-gen2/src/host/projectionFacade.ts');
    expect(runner).toContain("entityType: 'scope' as const");
    expect(runner).toContain("sourceKind: 'workflow'");
    expect(host).toContain('map.set(`scope:${entityId}`');
    expect(host).toContain("artifactKind: 'workflow'");
  });
});
