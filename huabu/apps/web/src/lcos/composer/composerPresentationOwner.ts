import type { LcosComposerTarget, LcosWindow } from '../shell/lcosShellStore';

/** Presentation only. Match visible window bodies using their existing ownership rules. */
export function composerHasVisibleWindowOwner(
  target: LcosComposerTarget | null,
  windows: readonly LcosWindow[],
  visibleWindowIds: readonly string[],
): boolean {
  if (target === null) return false;
  const assemblyIntent = target.nodeId.startsWith('assembly:');
  return visibleWindowIds.some((windowId) => {
    const activeWindow = windows.find((window) => window.id === windowId);
    if (activeWindow === undefined) return false;
    if (assemblyIntent) return activeWindow.bodyKey === 'assembly';
    return activeWindow.bodyKey === 'conversation'
      && target.receiverConversationId !== undefined
      && activeWindow.target === target.receiverConversationId;
  });
}
