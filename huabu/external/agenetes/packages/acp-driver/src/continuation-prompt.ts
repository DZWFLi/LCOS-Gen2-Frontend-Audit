import { reportEntryState } from './session.js';

import type { AcpSessionEntry } from './session-registry.js';
import type {
  ContentBlock as AcpContentBlock,
  SessionUpdate,
} from '@agentclientprotocol/sdk';

export interface AcpContinuationPromptReceipt {
  readonly text: string;
  readonly stopReason?: string;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function textFromUpdate(update: SessionUpdate): string {
  const envelope = record(update);
  const content = record(envelope?.content);
  return envelope?.sessionUpdate === 'agent_message_chunk' &&
    content?.type === 'text' &&
    typeof content.text === 'string'
    ? content.text
    : '';
}

/**
 * Send through the already-registered ACP owner. This is intentionally the
 * only continuation prompt helper: it waits for selection replay, collects
 * agent text, and promotes the first successful prompt into the existing
 * durable entry/report path. It never creates a client or writes raw frames.
 */
export async function promptExistingAcpSession(
  entry: AcpSessionEntry,
  text: string,
  signal?: AbortSignal,
): Promise<AcpContinuationPromptReceipt> {
  if (entry.selectionsReplay !== null) await entry.selectionsReplay;
  let assembled = '';
  const blocks: AcpContentBlock[] = [{ type: 'text', text }];
  const result = await entry.client.prompt(
    entry.sessionId,
    blocks,
    (update) => {
      assembled += textFromUpdate(update);
    },
    signal,
    (request) => {
      // Continuation has no interactive permission UI. Fail closed and let
      // the ACP client cancel the pending tool turn instead of auto-allowing.
      entry.client.resolvePermission(request.requestId, { cancelled: true });
    },
  );
  if (!entry.persistedToDisk) {
    entry.persistedToDisk = true;
    reportEntryState(entry);
  }
  return {
    text: assembled,
    ...(result.stopReason === undefined
      ? {}
      : { stopReason: result.stopReason }),
  };
}
