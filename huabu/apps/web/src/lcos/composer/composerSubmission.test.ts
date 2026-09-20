import { describe, expect, it } from 'vitest';

import {
  buildComposerContinuationInput,
  buildComposerRunInput,
  canSubmitComposerContinuation,
  canSubmitComposerTarget,
} from './composerSubmission';

const target = (receiverConversationId?: string) => ({
  nodeId: 'conversation-work-view',
  title: '会话',
  anchor: { x: 0, y: 0, width: 0, height: 0 },
  ...(receiverConversationId === undefined ? {} : { receiverConversationId }),
});

describe('shared Composer receiver mapping', () => {
  it('inline Work View session A creates a Run addressed to receiver A', () => {
    const payload = buildComposerRunInput({
      projectId: 'project-1',
      instruction: '继续整理',
      workspaceId: 'workspace-1',
      target: target('connected-A'),
      refs: [],
    });

    expect(payload.receiverRef).toEqual({ connectedConversationId: 'connected-A' });
  });

  it('does not allow send before the receiver is confirmed', () => {
    const blocked = { ...target(), receiverBlockedReason: 'receiver pending' };
    expect(canSubmitComposerTarget(blocked, '继续整理', 'workspace-1')).toBe(false);
  });

  it('switching from A to B never carries receiver A into the B payload', () => {
    const payload = buildComposerRunInput({
      projectId: 'project-1',
      instruction: '继续整理',
      workspaceId: 'workspace-1',
      target: target('connected-B'),
      refs: [],
    });

    expect(payload.receiverRef).toEqual({ connectedConversationId: 'connected-B' });
    expect(JSON.stringify(payload)).not.toContain('connected-A');
  });

  it('continuation uses operation/message identity and does not require a workspace', () => {
    const continuationTarget = {
      ...target('connected-A'),
      intent: 'continue' as const,
      continuationOperationId: 'operation-A',
      messageId: 'message-A',
    };
    expect(canSubmitComposerContinuation(continuationTarget, '继续', [])).toBe(true);
    expect(buildComposerContinuationInput({
      conversationId: 'connected-A',
      continuationOperationId: 'operation-A',
      messageId: 'message-A',
      text: ' 继续 ',
      refs: [],
    })).toEqual({
      conversationId: 'connected-A',
      continuationOperationId: 'operation-A',
      messageId: 'message-A',
      text: '继续',
    });
  });

  it('continuation carries supported draft references as typed orderedReferences', () => {
    const continuationTarget = {
      ...target('connected-A'),
      intent: 'continue' as const,
      continuationOperationId: 'operation-A',
      messageId: 'message-A',
    };
    const refs = [{ entityType: 'artifact', entityId: 'a-1' }];
    expect(canSubmitComposerContinuation(continuationTarget, '继续', refs)).toBe(true);
    expect(buildComposerContinuationInput({
      conversationId: 'connected-A',
      continuationOperationId: 'operation-A',
      messageId: 'message-A',
      text: '继续',
      refs,
    }).orderedReferences).toEqual([{ order: 0, ref: { type: 'artifact', artifactId: 'a-1' } }]);
  });

  it('continuation blocks references without an authoritative typed mapping', () => {
    const continuationTarget = {
      ...target('connected-A'),
      intent: 'continue' as const,
      continuationOperationId: 'operation-A',
      messageId: 'message-A',
    };
    expect(canSubmitComposerContinuation(continuationTarget, '继续', [{ entityType: 'note', entityId: 'n-1' }])).toBe(false);
  });
});
