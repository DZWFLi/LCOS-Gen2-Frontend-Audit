import type { AssemblyApplyItemResultV1, AssemblyApplyResultV1, AssemblySourceRefV1 } from '@local-creative-os/contracts';
import type { DropAssemblyApplyIntent, DropCommitReceipt } from './dropTypes';

/** Skill catalog source/version are identity, not interchangeable IDs. */
export function dropSourceKey(ref: AssemblySourceRefV1): string {
  return JSON.stringify(ref.kind === 'skill' ? [ref.kind, ref.id, ref.source, ref.version ?? null] : [ref.kind, ref.id]);
}

/** T4 C1-3 §§24/26/69–72: inspect each canonical result, never HTTP success/allApplied alone. */
export function assemblyDropReceipt(
  intent: DropAssemblyApplyIntent,
  transactionId: string,
  canonicalReceipt: AssemblyApplyResultV1,
  previousItems: readonly AssemblyApplyItemResultV1[] = [],
): DropCommitReceipt {
  const latest = new Map((canonicalReceipt.results ?? []).map((item) => [dropSourceKey(item.sourceRef), item]));
  const previous = new Map(previousItems.map((item) => [dropSourceKey(item.sourceRef), item]));
  const items = intent.sourceRefs.map((sourceRef) => latest.get(dropSourceKey(sourceRef)) ?? previous.get(dropSourceKey(sourceRef)));
  // Missing item outcomes leave mutation status unknown. Do not replay them.
  const unresolved = items.filter((item) => item === undefined).length;
  const known = items.filter((item): item is AssemblyApplyItemResultV1 => item !== undefined);
  const applied = known.filter((item) => item.status === 'applied').length;
  const already = known.filter((item) => item.status === 'skipped' && item.channel === 'already-member').length;
  const unsupported = known.filter((item) => item.channel === 'unsupported').length;
  const failed = known.filter((item) => item.status === 'failed' && item.channel !== 'unsupported').length;
  const skipped = known.length - applied - already - unsupported - failed;
  const allApplied = items.length > 0 && applied === items.length;
  const allAlready = items.length > 0 && already === items.length;
  const status = allApplied || allAlready ? 'success' : applied > 0 ? 'partial' : 'failed';
  const message = [
    allAlready ? (intent.targetRef.kind === 'conversation' ? '已在会话上下文中' : '已在目标中')
      : status === 'success' ? (intent.targetRef.kind === 'conversation' ? '已保存到会话上下文' : '投放完成')
        : status === 'partial' ? '部分完成' : '投放未完成',
    applied > 0 ? `${applied} 项已加入` : undefined,
    !allAlready && already > 0 ? `${already} 项已在目标中` : undefined,
    failed > 0 ? `${failed} 项失败` : undefined,
    unsupported > 0 ? `${unsupported} 项不支持` : undefined,
    skipped > 0 ? `${skipped} 项未应用` : undefined,
    unresolved > 0 || items.length === 0 ? '部分结果未确认，请先查看目标现场' : undefined,
  ].filter(Boolean).join(' · ');
  return {
    status, transactionId, targetId: intent.targetId, message, canonicalReceipt,
    assemblyItems: known,
    // The exact refs from the frozen request, never a substitute Artifact/skill identity.
    retrySourceRefs: intent.sourceRefs.filter((sourceRef) => {
      const item = latest.get(dropSourceKey(sourceRef)) ?? previous.get(dropSourceKey(sourceRef));
      return item?.status === 'failed' && item.channel !== 'unsupported';
    }),
  };
}
