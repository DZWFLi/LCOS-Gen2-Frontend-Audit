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

import { NodeColorPinMarkers } from './NodeColorPinMarkers';
import { NodeReferenceMarker } from './NodeReferenceMarker';
import { useLcosDensity } from './useLcosDensity';
import { useCollaborationSession } from '../collaboration/useCollaborationSession';
import { rectFromDomRect } from '../drop/dropTargetRegistry';
import { useLcosDropStore } from '../lcosDropState';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { glythBodyLayout } from '../ui/glyth/glythBodyLayout';
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
  // 投影 ready → userState 驱动 pose；未 ready 保持中性，不用旧 descriptor 猜运行态。
  const conversationId = ref?.entityType === 'conversation' ? ref.entityId : null;
  const collaborationEntry = useCollaborationSession(projectId, conversationId);
  const projection = collaborationEntry?.status === 'ready' ? collaborationEntry.projection : undefined;
  const collabInput = glythInputFromCollaborationState(projection?.userState);
  const receiving = useLcosDropStore((state) => state.state.status === 'preview'
    && state.resolution?.status === 'ready'
    && state.resolution.intent.kind === 'assembly-apply'
    && state.resolution.intent.targetRef.kind === 'conversation'
    && state.resolution.intent.targetRef.id === conversationId);
  const resolvedPose = resolveGlythPresentation({
    ...collabInput,
    ...(presentation?.phase === undefined ? {} : { phase: presentation.phase }),
  });
  const pose = receiving ? 'curious' : resolvedPose;
  const attention = projection?.userState === 'needs_user';
  const stateLabel = conversationId === null
    ? '未绑定会话'
    : projection === undefined
      ? collaborationEntry?.status === 'error' ? '状态读取失败' : '正在读取状态'
      : ({ ready: '可以继续', thinking: '正在思考', working: '正在执行',
        needs_user: '等你回应', done: '本轮已完成', unavailable: '暂时无法连接' } as const)[projection.userState];
  const isMark = density === 'mark';
  const layout = glythBodyLayout(presentation?.worldWidth, presentation?.worldHeight, presentation?.zoom);
  const stateFontSize = Math.max(10, layout.labelSize - 0.75);
  const stateLineHeight = Math.max(13, Math.round(layout.labelLeading * 0.78));
  const stateTop = layout.labelTop + layout.labelLeading;
  const worldHeight = Number.isFinite(presentation?.worldHeight) && (presentation?.worldHeight ?? 0) > 0
    ? presentation!.worldHeight!
    : 142;
  const stateHasRoom = stateTop + stateLineHeight <= worldHeight;

  const openWorkView = (): void => {
    if (!ref || ref.entityType !== 'conversation') return;
    useLcosShellStore.getState().openWindow('conversation', `会话窗口 · ${title}`, ref.entityId);
  };

  // Glyth 本体投放通过既有 Assembly API 持久绑定会话上下文；Composer 投放才是本次引用。
  const canReceive = projection !== undefined;
  const registerTarget = useLcosDropStore((state) => state.registerTarget);
  const unregisterTarget = useLcosDropStore((state) => state.unregisterTarget);
  useEffect(() => {
    if (projectId === null || conversationId === null || bodyRef.current === null) return;
    const targetId = `glyth:${input.nodeId}`;
    const target: Omit<DropTargetRegistration, 'rect'> = {
      targetId,
      kind: 'collaboration-reference',
      label: `会话上下文 · ${title}`,
      priority: 20,
      enabled: canReceive,
      ...(!canReceive ? { ineligibleReason: '该会话尚未完成状态读取，暂不可接收引用' } : {}),
      semantic: { kind: 'collaboration-reference', conversationId },
      readRect: () => {
        const body = bodyRef.current;
        return body?.isConnected ? rectFromDomRect(body.getBoundingClientRect()) : undefined;
      },
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
  }, [projectId, conversationId, title, input.nodeId, canReceive, registerTarget, unregisterTarget]);

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
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          openWorkView();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${title} · ${stateLabel} · 双击或按回车打开会话窗口`}
      title={`${title} · ${stateLabel}`}
      className="relative h-full w-full overflow-visible"
      style={{ background: 'transparent', border: 0, boxShadow: 'none' }}
    >
      <NodeColorPinMarkers nodeId={input.nodeId} />
      <NodeReferenceMarker nodeId={input.nodeId} />
      <GlythBodyView
        pose={pose}
        {...(projection?.userState === undefined ? {} : { userState: projection.userState })}
        selected={selected}
        mark={isMark}
        paused={presentation?.phase === 'dragging' || presentation?.phase === 'resizing'}
        size={layout.size}
        left={layout.left}
        top={layout.top}
      />
      {!isMark && (
        <>
          <span
            data-lcos-glyth-label
            className="truncate"
            style={{
              position: 'absolute',
              left: 0,
              top: layout.labelTop,
              width: layout.labelWidth,
              textAlign: 'center',
              color: lcosTokens.color.muted,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: layout.labelSize,
              lineHeight: `${layout.labelLeading}px`,
              fontWeight: 400,
            }}
          >
            {title}
          </span>
          {stateHasRoom && (
            <span
              data-lcos-glyth-state={projection?.userState ?? collaborationEntry?.status ?? 'loading'}
              className="lcos-glyth-state-label truncate"
              style={{
                position: 'absolute',
                left: 0,
                top: stateTop,
                width: layout.labelWidth,
                textAlign: 'center',
                color: attention ? lcosTokens.color.accent : lcosTokens.color.muted,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: stateFontSize,
                lineHeight: `${stateLineHeight}px`,
                fontWeight: attention ? 600 : 400,
                pointerEvents: 'none',
              }}
            >
              {stateLabel}
            </span>
          )}
        </>
      )}
    </div>
  );
}
