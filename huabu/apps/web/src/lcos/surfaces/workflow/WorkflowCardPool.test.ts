import { describe, expect, it } from 'vitest';

import { resolveWorkflowCardEntry, toWorkflowHandCards, workflowComposerTarget } from './WorkflowCardPool';
import { isWorkflowCardItem, isWorkflowMaterialItem, isWorkflowReceiverItem } from './workflowCardSemantics';

import type { WarehouseItemV1 } from '@local-creative-os/contracts';
import type { Workspace } from '@local-creative-os/domain';

function item(kind: WarehouseItemV1['kind']): WarehouseItemV1 {
  return {
    schemaVersion: 1,
    entityRef: { type: kind, id: `${kind}-1` },
    kind,
    title: kind,
    usageCount: 0,
  };
}

function workspace(id: string, scopeId: string, canvasId?: string): Workspace {
  return {
    id: id as Workspace['id'],
    projectId: 'project-1' as Workspace['projectId'],
    scopeId: scopeId as Workspace['scopeId'],
    name: id,
    intent: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    focusedViewIds: [],
    visibleLayers: ['core'],
    contextPolicy: 'selection-only',
    ...(canvasId === undefined ? {} : { canvasId }),
    updatedAt: '2026-09-20T00:00:00.000Z',
  };
}

describe('Workflow card pool UX semantics', () => {
  it('reserves TaskCard semantics for workflow while separating material and receiver lanes', () => {
    expect(isWorkflowCardItem(item('workflow'))).toBe(true);
    expect(isWorkflowCardItem(item('artifact'))).toBe(false);
    expect(isWorkflowCardItem(item('conversation'))).toBe(false);
    expect(isWorkflowCardItem(item('scene'))).toBe(false);
    expect(isWorkflowMaterialItem(item('artifact'))).toBe(true);
    expect(isWorkflowMaterialItem(item('context'))).toBe(true);
    expect(isWorkflowReceiverItem(item('conversation'))).toBe(true);
  });

  it('keeps task, material, and receiver identities and presentation lanes distinct', () => {
    const cards = toWorkflowHandCards(
      [item('workflow'), item('artifact'), item('conversation')],
      [{ id: 'skill-1', source: 'system', name: 'Summarize', description: 'summary' }],
    );
    expect(cards.map((card) => card.entityType)).toEqual(['workflow', 'skill', 'artifact', 'conversation']);
    expect(cards.map((card) => card.lane)).toEqual(['task', 'task', 'material', 'receiver']);
    expect(cards.filter((card) => card.lane === 'task').every((card) => card.entityType === 'workflow' || card.entityType === 'skill')).toBe(true);
    expect(cards.filter((card) => card.lane === 'material').every((card) => card.entityType === 'artifact')).toBe(true);
    expect(cards.filter((card) => card.lane === 'receiver').every((card) => card.entityType === 'conversation')).toBe(true);
    expect(cards.find((card) => card.entityType === 'conversation')?.conversationReceiver).toBe(true);
    expect(cards.find((card) => card.entityType === 'skill')?.conversationReceiver).toBe(false);

    const material = cards.find((card) => card.entityType === 'artifact');
    const conversation = cards.find((card) => card.entityType === 'conversation');
    expect(material).toBeDefined();
    expect(conversation).toBeDefined();
    if (material === undefined || conversation === undefined) throw new Error('expected material and conversation cards');

    const materialTarget = workflowComposerTarget(material, 'workspace-workflow');
    expect(materialTarget.workspaceId).toBe('workspace-workflow');
    expect(materialTarget.receiverConversationId).toBeUndefined();
    expect(materialTarget.receiverBlockedReason).toContain('选择一个会话');

    const conversationTarget = workflowComposerTarget(conversation, 'workspace-workflow');
    expect(conversationTarget.receiverConversationId).toBe('conversation-1');
    expect(conversationTarget.receiverBlockedReason).toBeUndefined();
  });

  it('enters only the single exact workflow scope target and never resolves skills or titles as workspaces', () => {
    const cards = toWorkflowHandCards(
      [item('workflow')],
      [{ id: 'skill-1', source: 'system', name: 'workflow-1', description: 'same-looking title' }],
    );
    const workflow = cards.find((card) => card.entityType === 'workflow');
    const skill = cards.find((card) => card.entityType === 'skill');
    expect(workflow).toBeDefined();
    expect(skill).toBeDefined();
    if (workflow === undefined || skill === undefined) throw new Error('expected workflow and skill cards');

    expect(resolveWorkflowCardEntry(workflow, [workspace('workspace-1', 'workflow-1', 'canvas-1')])).toMatchObject({
      status: 'ready',
      targetSurface: 'workflow',
      targetWorkspace: { id: 'workspace-1', canvasId: 'canvas-1' },
    });
    expect(resolveWorkflowCardEntry(workflow, [])).toMatchObject({ status: 'unavailable', code: 'target_missing' });
    expect(resolveWorkflowCardEntry(workflow, [workspace('workspace-1', 'workflow-1')])).toMatchObject({ status: 'unavailable', code: 'canvas_missing' });
    expect(resolveWorkflowCardEntry(workflow, [
      workspace('workspace-1', 'workflow-1', 'canvas-1'),
      workspace('workspace-2', 'workflow-1', 'canvas-2'),
    ])).toMatchObject({ status: 'unavailable', code: 'target_ambiguous' });
    expect(resolveWorkflowCardEntry(skill, [workspace('workspace-by-title', 'unrelated', 'canvas-3')])).toMatchObject({
      status: 'unavailable',
      code: 'skill_without_worksite',
    });
  });
});
