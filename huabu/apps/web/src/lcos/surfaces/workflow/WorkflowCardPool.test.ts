import { describe, expect, it } from 'vitest';

import { toWorkflowHandCards, workflowComposerTarget } from './WorkflowCardPool';
import { isWorkflowCardItem, isWorkflowMaterialItem, isWorkflowReceiverItem } from './workflowCardSemantics';

import type { WarehouseItemV1 } from '@local-creative-os/contracts';

function item(kind: WarehouseItemV1['kind']): WarehouseItemV1 {
  return {
    schemaVersion: 1,
    entityRef: { type: kind, id: `${kind}-1` },
    kind,
    title: kind,
    usageCount: 0,
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
});
