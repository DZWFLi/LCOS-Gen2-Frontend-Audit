import type { DropResolution } from '../drop/dropTypes';
import type { SemanticDropState } from '@local-creative-os/web-gen2';

export type RailwayReceivePresentation =
  | 'rest'
  | 'receive'
  | 'receive-eligible'
  | 'receive-hot'
  | 'ineligible'
  | 'committing';

export interface RailwayReceivePresentationInput {
  readonly targetId: string;
  readonly enabled: boolean;
  readonly dropState: SemanticDropState;
  readonly resolution: DropResolution | null;
}

/**
 * Projects the one shared Semantic Drop machine into one Railway target.
 * It never re-evaluates payload taxonomy: eligibility comes only from the
 * retained DropIntentResolver result for the exact live target.
 */
export function railwayReceivePresentation(
  input: RailwayReceivePresentationInput,
): RailwayReceivePresentation {
  if (!input.enabled) return 'ineligible';
  if (input.dropState.status === 'idle') return 'rest';
  // `failed` intentionally has no target identity. Painting every destination
  // as failed would invent ownership; the container shows that reason once.
  if (input.dropState.status === 'failed') return 'rest';

  const activeTargetId =
    input.dropState.status === 'preview' || input.dropState.status === 'committing'
      ? input.dropState.destination.targetId
      : undefined;

  if (activeTargetId !== input.targetId) {
    return input.dropState.status === 'tracking' || input.dropState.status === 'dwell'
      ? 'receive'
      : 'receive-eligible';
  }
  if (input.resolution?.status === 'ineligible') return 'ineligible';
  if (input.dropState.status === 'committing') return 'committing';
  return input.resolution?.status === 'ready' ? 'receive-hot' : 'receive';
}

export function railwayReceiveLabel(
  presentation: RailwayReceivePresentation,
  unavailableReason?: string,
): string {
  switch (presentation) {
    case 'rest':
      return '拖入素材即可接收';
    case 'receive':
      return '正在寻找接收目标';
    case 'receive-eligible':
      return '可接收，移到此处';
    case 'receive-hot':
      return '松开后接收到这里';
    case 'committing':
      return '正在写入项目';
    case 'ineligible':
      return unavailableReason ?? '当前素材不能接收到这里';
  }
}
