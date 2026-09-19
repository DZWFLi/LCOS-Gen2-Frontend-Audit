// GlythNodeBody — Conversation/Glyth exact Main anchor.
// Figma visual truth: 5388:118 group 121×142; 5388:119 body 92×92 at x=9/y=0.
// The uploaded donor renderer owns only body motion. Core/Collaboration,
// Huabu geometry, drop callbacks and density retain their existing owners.

import {
  glythInputFromCollaborationState,
  resolveGlythPresentation,
} from '@local-creative-os/web-gen2';
import { useEffect, useRef } from 'react';

import { useLcosNodePresentation } from '@/lcos-seam/nodePresentation';
import useCanvasStore from '@/store/canvasStore';

import { useLcosDensity } from './useLcosDensity';
import { useCollaborationSession } from '../collaboration/useCollaborationSession';
import { rectFromDomRect } from '../drop/dropTargetRegistry';
import { useLcosDropStore } from '../lcosDropState';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { GlythBodyView } from '../ui/glyth/GlythBodyView';
import { lcosTokens } from '../ui/lcosTokens';

import type { DropTargetRegistration } from '../drop/dropTypes';
import type { CanvasNodeBodySlotInput } from '@/lcos-seam/types';
import type { JSX } from 'react';

function titleOf(data: Readonly<Record<string, unknown>>): string {
  const raw = data.label ?? data.title;
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : 'Glyth';
}

export function GlythNodeBody(input: CanvasNodeBodySlotInput): JSX.Element {
  const bodyRef = useRef<HTMLDivElement>(null);
  const selected = useCanvasStore((state) => state.nodes.find((node) => node.id === input.nodeId)?.selected === true);
  const density = useLcosDensity();
  const presentation = useLcosNodePresentation();
  const ref = useLcosReferenceStore((state) => state.nodeEntityRefs.get(input.nodeId));
  const projectId = useLcosReferenceStore((state) => state.projectId);
  const title = titleOf(input.data as Readonly<Record<string, unknown>>);
  // Gate 4：Glyth 只消费 6 用户态（Collaboration projection）。
  // 投影 ready → userState 驱动 pose；未 ready → 回退既有 descriptor（不伪造状态）。
  const conversationId = ref?.entityType === 'conversation' ? ref.entityId : null;
  const collaborationEntry = useCollaborationSession(projectId, conversationId);
  const projection = collaborationEntry?.status === 'ready' ? collaborationEntry.projection : undefined;
  const collabInput = glythInputFromCollaborationState(projection?.userState);
  const pose = resolveGlythPresentation({
    ...collabInput,
    ...(projection === undefined
      ? {
          ...(ref?.descriptor?.active === undefined ? {} : { active: ref.descriptor.active }),
          ...(ref?.descriptor?.waiting === undefined ? {} : { waiting: ref.descriptor.waiting }),
        }
      : {}),
    ...(presentation?.phase === undefined ? {} : { phase: presentation.phase }),
  });
  const attention = projection?.userState === 'needs_user';
  const isMark = density === 'mark';
  const size = isMark ? 34 : 92;
  const left = isMark ? (121 - size) / 2 : 9;
  const top = isMark ? 16 : 0;

  const openWorkView = (): void => {
    if (!ref || ref.entityType !== 'conversation') return;
    useLcosShellStore.getState().openWindow('conversation', `会话窗口 · ${title}`, ref.entityId);
  };

  // R1 合流（CollaborationTarget）：Glyth 是 collaboration-reference drop target。
  // Drop 到 Glyth = 把对象作为 Reference 交给该 Conversation（preview = execute，无二次选择窗）。
  const registerTarget = useLcosDropStore((state) => state.registerTarget);
  const unregisterTarget = useLcosDropStore((state) => state.unregisterTarget);
  useEffect(() => {
    if (projectId === null || conversationId === null || bodyRef.current === null) return;
    const targetId = `glyth:${input.nodeId}`;
    const target: Omit<DropTargetRegistration, 'rect'> = {
      targetId,
      kind: 'collaboration-reference',
      label: `会话引用 · ${title}`,
      priority: 20,
      enabled: projection !== undefined,
      ...(projection === undefined ? { ineligibleReason: '该会话尚未完成状态读取，暂不可接收引用' } : {}),
      semantic: { kind: 'collaboration-reference', conversationId },
    };
    const publish = (): void => {
      const body = bodyRef.current;
      if (body === null) return;
      registerTarget({ ...target, rect: rectFromDomRect(body.getBoundingClientRect()) });
    };
    publish();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(publish) : null;
    observer?.observe(bodyRef.current);
    window.addEventListener('resize', publish);
    window.addEventListener('scroll', publish, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', publish);
      window.removeEventListener('scroll', publish, true);
      unregisterTarget(targetId);
    };
  }, [projectId, conversationId, title, input.nodeId, projection !== undefined, registerTarget, unregisterTarget]);

  return (
    <div
      ref={bodyRef}
      data-lcos-species-body
      data-lcos-species="glyth"
      data-lcos-glyth-body
      data-lcos-glyth-shape="blob"
      data-lcos-glyth-tone="ink"
      data-lcos-glyth-pose={pose}
      data-lcos-glyth-attention={attention ? 'needs_user' : undefined}
      data-lcos-glyth-user-state={projection?.userState}
      data-lcos-density={density}
      data-figma-node-id="5388:118"
      onDoubleClick={(event) => {
        event.stopPropagation();
        openWorkView();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.stopPropagation();
          openWorkView();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${title} · ${pose}${attention ? ' · 等你回应' : ''} · 双击打开会话窗口`}
      className="relative h-full w-full overflow-visible"
      style={{ background: 'transparent', border: 0, boxShadow: 'none' }}
    >
      <GlythBodyView
        pose={pose}
        {...(projection?.userState === undefined ? {} : { userState: projection.userState })}
        selected={selected}
        mark={isMark}
        paused={presentation?.phase === 'dragging' || presentation?.phase === 'resizing'}
        size={size}
        left={left}
        top={top}
      />
      {!isMark && (
        <span
          data-lcos-glyth-label
          className="truncate"
          style={{
            position: 'absolute',
            left: 20,
            top: 108,
            width: 88,
            color: lcosTokens.color.muted,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            lineHeight: '18px',
            fontWeight: 400,
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
}
