import type { AssemblyApplyResultV1 } from '@local-creative-os/contracts';
import type { CoreCollectionMembershipReceipt } from '@local-creative-os/web-gen2';
import { assemblyDropReceipt } from './dropAssemblyReceipt';
import type {
  DropCollaborationReferenceIntent,
  DropCommitReceipt,
  DropComposerReferenceIntent,
  DropExternalImportIntent,
  DropIntent,
  DropCollectionMembershipIntent,
  DropAssemblyApplyIntent,
} from './dropTypes';

export interface DropCommitOwners {
  /** Existing Core Assembly apply owner. Must return the canonical receipt. */
  readonly applyAssembly: (
    intent: DropAssemblyApplyIntent,
    signal?: AbortSignal,
  ) => Promise<AssemblyApplyResultV1>;
  /** Existing ephemeral Composer reference owner. */
  readonly addComposerReference: (
    intent: DropComposerReferenceIntent,
  ) => void | Promise<void>;
  /**
   * CollaborationTarget owner：把对象作为 Reference 交给该 Conversation。
   * 缺席 = 该会话引用通道不可用 → fail-close（禁止 fake drop success）。
   */
  readonly addConversationReference?: (
    intent: DropCollaborationReferenceIntent,
  ) => void | Promise<void>;
  readonly addCollectionMember?: (intent: DropCollectionMembershipIntent) => Promise<CoreCollectionMembershipReceipt>;
  /** Optional real capture/import owner; absent means fail-close. */
  readonly importExternal?: (
    intent: DropExternalImportIntent,
    signal?: AbortSignal,
  ) => Promise<unknown>;
}

function failed(
  transactionId: string,
  intent: DropIntent,
  message: string,
): DropCommitReceipt {
  return {
    status: 'failed',
    transactionId,
    targetId: intent.targetId,
    message,
  };
}

/**
 * Thin owner router. It never creates Core Conversation/Run/Railway truth and
 * de-duplicates a transaction id within the current gesture host.
 */
export class DropCommitRouter {
  private readonly receipts = new Map<string, Promise<DropCommitReceipt>>();

  commit(
    intent: DropIntent,
    transactionId: string,
    owners: DropCommitOwners,
    signal?: AbortSignal,
  ): Promise<DropCommitReceipt> {
    const existing = this.receipts.get(transactionId);
    if (existing !== undefined) return existing;

    const pending = this.execute(intent, transactionId, owners, signal);
    this.receipts.set(transactionId, pending);
    return pending;
  }

  clear(transactionId?: string): void {
    if (transactionId === undefined) this.receipts.clear();
    else this.receipts.delete(transactionId);
  }

  private async execute(
    intent: DropIntent,
    transactionId: string,
    owners: DropCommitOwners,
    signal?: AbortSignal,
  ): Promise<DropCommitReceipt> {
    try {
      if (intent.kind === 'assembly-apply') {
        const canonicalReceipt = await owners.applyAssembly(intent, signal);
        return assemblyDropReceipt(intent, transactionId, canonicalReceipt);
      }

      if (intent.kind === 'composer-reference') {
        await owners.addComposerReference(intent);
        return { status: 'success', transactionId, targetId: intent.targetId, message: '已加入引用' };
      }

      if (intent.kind === 'collaboration-reference') {
        // Retired draft-only body drop must never silently claim durable success.
        return failed(transactionId, intent, '旧会话投放请求已停用，请重新拖放以加入会话上下文');
      }

      if (intent.kind === 'collection-membership') {
        if (owners.addCollectionMember === undefined) return failed(transactionId, intent, '集合成员写入 owner 尚未就绪');
        const canonicalReceipt = await owners.addCollectionMember(intent);
        const matchesIntent = canonicalReceipt.collectionId === intent.collectionId
          && canonicalReceipt.memberRef.type === intent.memberRef.type
          && canonicalReceipt.memberRef.id === intent.memberRef.id;
        if (!matchesIntent) return failed(transactionId, intent, '集合成员回执与本次投放对象不一致');
        if (canonicalReceipt.status !== 'applied' && canonicalReceipt.status !== 'already-member') {
          return failed(transactionId, intent, canonicalReceipt.status === 'not-member'
            ? '集合未确认该对象为成员' : '集合成员移除未完成投放');
        }
        return { status: 'success', transactionId, targetId: intent.targetId,
          message: canonicalReceipt.status === 'already-member' ? '已是集合成员' : '已加入集合', canonicalReceipt };
      }

      if (owners.importExternal === undefined) {
        return failed(transactionId, intent, '当前没有可用的导入/捕获 owner');
      }

      const canonicalReceipt = await owners.importExternal(intent, signal);
      return {
        status: 'success',
        transactionId,
        targetId: intent.targetId,
        canonicalReceipt,
      };
    } catch (error: unknown) {
      return failed(
        transactionId,
        intent,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
