// WorkflowWorksite — Workflow 现场（Figma workflow 5388:22998）：真实卡片舞台 + 手牌/卡池仪器。
// 手牌 = 现场表征（非第二 graph）；取用 → 加入 Composer 草稿（未发送，真实动作）；
// 打开/续接（Run 执行）Wave 8 接 T6 Run 事实。

import { Hand, X } from 'lucide-react';
import { useState } from 'react';

import { useCloseOnEscape } from '@/hooks/useCloseOnEscape';

import { WorkflowCardPool } from './WorkflowCardPool';
import { LcosWorksiteStage } from '../../shell/LcosWorksiteStage';
import { WorkflowHandView } from '../../ui/workflow/WorkflowHandView';

import type { LcosSurfaceKey } from '../../shell/lcosShellStore';

export interface WorkflowWorksiteProps {
  readonly projectId: string;
  readonly surface: LcosSurfaceKey;
  readonly canvasId?: string;
  readonly ensureCanvas: (surface: LcosSurfaceKey, force?: boolean) => Promise<string | undefined>;
}

export interface WorkflowHandOverlayProps {
  readonly projectId: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

/** 可由 Main / Workflow 现场共同呼出的手牌；不拥有 Canvas 或业务 truth。 */
export function WorkflowHandOverlay({ projectId, open, onClose }: WorkflowHandOverlayProps): React.JSX.Element | null {
  useCloseOnEscape(open, onClose);
  return (
    <WorkflowHandView key={projectId} open={open} header={<>
      <span>工作流</span>
      <button type="button" aria-label="收回手牌" onClick={onClose} className="lcos-workflow-hand-close">
        <X className="h-[22px] w-[22px]" aria-hidden />
      </button>
    </>}>
      <WorkflowCardPool projectId={projectId} />
    </WorkflowHandView>
  );
}

export function WorkflowWorksite({
  projectId,
  surface,
  canvasId,
  ensureCanvas,
}: WorkflowWorksiteProps): React.JSX.Element {
  const [handOpen, setHandOpen] = useState(false);

  return (
    <div data-lcos-workflow-worksite className="relative h-full w-full">
      <LcosWorksiteStage
        projectId={projectId}
        surface={surface}
        canvasId={canvasId}
        ensureCanvas={(recreate?: boolean) => ensureCanvas(surface, recreate)}
      />

      {/* 手牌呼出（真实：卡池） */}
      <button
        type="button"
        data-lcos-workflow-hand-toggle
        data-open={handOpen ? 'true' : undefined}
        onClick={() => setHandOpen((v) => !v)}
        className="lcos-workflow-hand-trigger"
        aria-label={handOpen ? '收起工作流手牌' : '打开工作流手牌'}
        title={handOpen ? '收起手牌' : '打开手牌'}
      >
        <Hand className="h-4 w-4" aria-hidden />
      </button>

      <WorkflowHandOverlay projectId={projectId} open={handOpen} onClose={() => setHandOpen(false)} />
    </div>
  );
}
