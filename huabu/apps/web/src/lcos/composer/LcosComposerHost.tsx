// LcosComposerHost — 统一提交入口（Figma Composer READY；T3-A04 机制）。
// 显式引用 strip（reference store draft）+ 文本；Cmd/Ctrl+Enter 提交真实 Run（CoreRunClient.createRun）。
// 提交后回执展示；失败保留草稿文本；不伪造成功。Draft 是 local UI intent，Run truth 在 Core。
// workspaceId 必须用当前现场的真实 workspace（由 Shell 从 Core workspaces 反查传入）——
// 写死 'main' 会被 Core 外键拒绝（FOREIGN KEY constraint failed → 409）。

import { CoreCollaborationClient, HttpError } from '@local-creative-os/web-gen2';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  CanvasFloatingPopover,
  type CanvasAnchorRect,
} from '@/components/Common/CanvasFloatingPopover';
import { useCloseOnEscape } from '@/hooks/useCloseOnEscape';
import useCanvasStore from '@/store/canvasStore';

import { ComposerReferencePicker } from './ComposerReferencePicker';
import {
  buildComposerContinuationInput,
  buildComposerRunInput,
  canSubmitComposerContinuation,
  canSubmitComposerTarget,
} from './composerSubmission';
import { LcosReceiverIdentity } from './LcosReceiverIdentity';
import { referenceImageSource } from './referenceImageSource';
import { useComposerContinuation } from './useComposerContinuation';
import { createLcosCoreSession } from '../app/lcosCoreClient';
import { rectFromDomRect } from '../drop/dropTargetRegistry';
import { useLcosDropStore } from '../lcosDropState';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { buildSelectedContextReferences } from '../professional/conversationContinuationActions';
import { ConversationContinuationControls } from '../professional/ConversationContinuationControls';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { ScaleIn } from '../ui/motion/ScaleIn';
import { LcosComposerView } from '../ui/nearfield/LcosComposerView';
import { LcosNearfieldGlyph } from '../ui/nearfield/LcosNearfieldGlyph';
import { LcosIconButton } from '../ui/primitives/LcosIconButton';
import { createVoiceInput, isVoiceInputSupported, mergeVoiceText } from '../voiceInput';

import type { DropTargetRegistration } from '../drop/dropTypes';
import type { CoreEntityRefLike } from '../referenceBridge';

const ENTITY_LABEL: Readonly<Record<string, string>> = {
  artifact: '材料',
  conversation: '会话',
  note: '便签',
  resource: '资源',
  context: '上下文',
  workflow: '工作流',
  scene: '现场',
  collection: '集合',
};

function referenceLabel(ref: {
  readonly entityType: string;
  readonly displayLabel?: string;
  readonly descriptor?: { readonly title?: string };
}): string {
  return (
    ref.displayLabel ??
    ref.descriptor?.title ??
    ENTITY_LABEL[ref.entityType] ??
    '引用'
  );
}

export interface LcosComposerHostProps {
  readonly projectId: string;
  /** 当前现场的真实 workspaceId（缺省 = 现场未就绪，不可提交）。 */
  readonly workspaceId?: string;
  readonly anchor: CanvasAnchorRect | null;
  readonly open: boolean;
  readonly onClose: () => void;
  /** Work View reuses this exact Composer inline; canvas callers keep the popover host. */
  readonly inline?: boolean;
}

type ComposerState = 'idle' | 'submitting' | 'done' | 'error';
type VoiceState = 'idle' | 'recording' | 'transcribing';

interface VoiceTranscriptionEnvelope {
  readonly ok: boolean;
  readonly value?: { readonly text?: string };
  readonly error?: { readonly message?: string; readonly userMessage?: string };
}

export function LcosComposerHost({
  projectId,
  workspaceId,
  anchor,
  open,
  onClose,
  inline = false,
}: LcosComposerHostProps): React.JSX.Element | null {
  const session = useMemo(() => createLcosCoreSession(), []);
  const collaboration = useMemo(() => new CoreCollaborationClient(session.http), [session]);
  const draftRefs = useLcosReferenceStore((s) => s.draft.orderedEntityRefs);
  const text = useLcosShellStore((s) => s.composerPrompt);
  const composerTarget = useLcosShellStore((s) => s.composerTarget);
  const setText = useLcosShellStore((s) => s.setComposerPrompt);
  const [state, setState] = useState<ComposerState>('idle');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const referenceSurfaceRef = useRef<HTMLDivElement>(null);
  const [referencePickerOpen, setReferencePickerOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceHandle = useRef<ReturnType<typeof createVoiceInput>>(null);
  const voiceAbort = useRef<AbortController | null>(null);
  const voiceInsertion = useRef<{ readonly start: number; readonly end: number } | undefined>(undefined);
  const mounted = useRef(true);
  const pendingSubmission = useRef<symbol | null>(null);
  const referencePickOwner = useLcosReferenceStore((s) => s.referencePickOwner);
  const presentationKey = JSON.stringify([projectId, composerTarget?.nodeId, composerTarget?.intent, composerTarget?.receiverConversationId]);
  const picking = referencePickOwner === presentationKey;
  useEffect(() => {
    if (!open || state === 'submitting') {
      if (useLcosReferenceStore.getState().referencePickOwner === presentationKey) useLcosReferenceStore.getState().setReferencePickOwner(null);
    }
    return () => {
      if (useLcosReferenceStore.getState().referencePickOwner === presentationKey) useLcosReferenceStore.getState().setReferencePickOwner(null);
    };
  }, [open, presentationKey, state]);
  useEffect(() => {
    if (!open || !picking || referencePickerOpen) return;
    const escape = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault(); event.stopPropagation();
      useLcosReferenceStore.getState().setReferencePickOwner(null);
      textareaRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, [open, picking, referencePickerOpen]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      voiceAbort.current?.abort();
      voiceHandle.current?.cancel();
    };
  }, []);
  useEffect(() => {
    setState('idle');
    setReceipt(null);
    setErrorDetail(undefined);
    setReferencePickerOpen(false);
    pendingSubmission.current = null;
    voiceAbort.current?.abort();
    voiceHandle.current?.cancel();
    voiceHandle.current = null;
    voiceInsertion.current = undefined;
    setVoiceState('idle');
    setVoiceError(null);
  }, [presentationKey]);

  const nodes = useCanvasStore((state) => state.nodes);
  const canvasId = useCanvasStore((state) => state.canvasId);
  const nodeBindings = useLcosReferenceStore((state) => state.nodeEntityRefs);
  const registerTarget = useLcosDropStore((s) => s.registerTarget);
  const unregisterTarget = useLcosDropStore((s) => s.unregisterTarget);
  const referenceDropActive = useLcosDropStore((s) => s.resolution?.status === 'ready'
    && s.resolution.intent.kind === 'composer-reference'
    && s.resolution.intent.targetId === `composer:${projectId}:${composerTarget?.nodeId}`
    && (s.state.status === 'preview' || s.state.status === 'committing'));
  const isContinuation = composerTarget?.intent === 'continue';
  const continuation = useComposerContinuation(projectId, composerTarget, open);
  const unsupportedContinuationRefs = isContinuation
    ? buildSelectedContextReferences(draftRefs).unsupportedEntityTypes
    : [];
  const continuationBlockedReason = isContinuation
    ? continuation.blockedReason
      ?? (unsupportedContinuationRefs.length > 0 ? `当前草稿包含暂不支持的续聊引用：${unsupportedContinuationRefs.join('、')}` : undefined)
      ?? (composerTarget?.receiverConversationId === undefined
        ? '当前会话身份尚未解析，暂不能继续'
        : composerTarget.continuationOperationId === undefined || composerTarget.messageId === undefined
          ? '续聊操作尚未准备好，请从会话窗口重新打开'
          : undefined)
    : undefined;

  useCloseOnEscape(open && !referencePickerOpen && !picking, onClose);

  // T3 §17: both the reference strip and editor accept this-run references.
  // Keep receiver identity outside this area: dropping there is not a receiver switch.
  // The registry is live gesture geometry; the draft and Run remain owned by
  // their existing stores/clients.
  useEffect(() => {
    if (!open || projectId.length === 0 || composerTarget === null || referenceSurfaceRef.current === null) return;
    const targetId = `composer:${projectId}:${composerTarget.nodeId}`;
    const target: Omit<DropTargetRegistration, 'rect'> = {
      targetId,
      kind: 'composer-reference',
      label: 'Composer 引用区',
      priority: 30,
      enabled: true,
      semantic: { kind: 'composer-reference' },
      readRect: () => {
        const editor = referenceSurfaceRef.current;
        return editor?.isConnected ? rectFromDomRect(editor.getBoundingClientRect()) : undefined;
      },
    };
    const publish = (): void => {
      const editor = referenceSurfaceRef.current;
      if (editor === null) return;
      registerTarget({ ...target, rect: rectFromDomRect(editor.getBoundingClientRect()) });
    };
    publish();
    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(publish)
      : null;
    observer?.observe(referenceSurfaceRef.current);
    window.addEventListener('resize', publish);
    window.addEventListener('scroll', publish, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', publish);
      window.removeEventListener('scroll', publish, true);
      unregisterTarget(targetId);
    };
  }, [composerTarget, open, projectId, registerTarget, unregisterTarget]);

  if (!open || (!inline && anchor === null) || projectId.length === 0) return null;

  const canSubmit = composerTarget !== null && state !== 'submitting' && (
    isContinuation
      ? continuationBlockedReason === undefined && canSubmitComposerContinuation(composerTarget, text, draftRefs)
      : canSubmitComposerTarget(composerTarget, text, workspaceId)
  );

  const submit = async (): Promise<void> => {
    if (!canSubmit || !composerTarget || pendingSubmission.current !== null) return;
    const submission = Symbol('composer-submission');
    pendingSubmission.current = submission;
    const isCurrent = (): boolean => {
      const shell = useLcosShellStore.getState();
      return mounted.current && shell.projectId === projectId
        && shell.composerOpen && shell.composerTarget === composerTarget;
    };
    setState('submitting');
    setErrorDetail(undefined);
    setReceipt(null);
    const refs: readonly CoreEntityRefLike[] = draftRefs;
    const request = isContinuation
      ? collaboration.send(projectId, buildComposerContinuationInput({
        conversationId: composerTarget.receiverConversationId as string,
        continuationOperationId: composerTarget.continuationOperationId as string,
        messageId: composerTarget.messageId as string,
        text,
        refs,
      }))
      : workspaceId === undefined
        ? Promise.resolve({ ok: false as const, error: { userMessage: '现场未就绪（未解析到 workspace），暂不可提交' } })
        : collaboration.delegate(projectId, buildComposerRunInput({
          projectId,
          instruction: text.trim(),
          workspaceId,
          target: composerTarget,
          refs,
        }));
    void request
      .then((result) => {
        if (result.ok) {
          const runId = result.receipt.runId;
          if (isCurrent()) {
            setState('done');
            setReceipt(
            isContinuation
              ? '消息已提交 · 等待会话回应'
              : runId !== undefined
              ? '任务已创建 · 等待执行'
              : '请求已提交 · 请在会话中核对结果',
          );
          }
          // The user may have changed projects, receiver, or draft while awaiting Core.
          useLcosShellStore.getState().clearSubmittedComposerPrompt(projectId, composerTarget, text);
        } else if (isCurrent()) {
          // 产品错误（capability/conflict/offline）：草稿保留，如实显示用户可读原因。
          setState('error');
          setErrorDetail(result.error.userMessage);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent()) return;
        setState('error');
        setErrorDetail(
          error instanceof HttpError
            ? `${error.message} (${error.status})`
            : String(error),
        );
      }).finally(() => {
        if (pendingSubmission.current === submission) pendingSubmission.current = null;
      });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const position = event.currentTarget.selectionStart;
    if (event.key === '@' && !event.nativeEvent.isComposing && (position === 0 || /\s/.test(text[position - 1] ?? ''))) {
      event.preventDefault();
      setReferencePickerOpen(true);
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void submit();
    }
  };

  const toggleVoiceInput = (): void => {
    if (voiceState === 'recording') {
      voiceHandle.current?.stop();
      return;
    }
    if (voiceState === 'transcribing') return;
    setVoiceError(null);
    const handle = createVoiceInput({
      onStart: () => setVoiceState('recording'),
      onResult: ({ audio, durationMs }) => {
        setVoiceState('transcribing');
        const form = new FormData();
        const extension = audio.type.includes('mp4') ? 'mp4' : audio.type.includes('ogg') ? 'ogg' : 'webm';
        form.append('file', audio, `composer-voice.${extension}`);
        form.append('durationMs', String(durationMs));
        form.append('language', 'zh-CN');
        const controller = new AbortController();
        voiceAbort.current = controller;
        void session.http.postForm<VoiceTranscriptionEnvelope>('/runtime/voice/transcriptions', form, controller.signal)
          .then((response) => {
            if (!response.ok) throw new Error(response.error?.userMessage ?? response.error?.message ?? '语音转写失败');
            const transcript = response.value?.text?.trim();
            if (!transcript) throw new Error('Core 没有返回可用文本');
            const shell = useLcosShellStore.getState();
            const activePresentationKey = JSON.stringify([
              shell.projectId,
              shell.composerTarget?.nodeId,
              shell.composerTarget?.intent,
              shell.composerTarget?.receiverConversationId,
            ]);
            if (!mounted.current || shell.projectId !== projectId || !shell.composerOpen
              || activePresentationKey !== presentationKey) return;
            const insertion = voiceInsertion.current;
            const merged = mergeVoiceText(shell.composerPrompt, transcript, insertion);
            setText(merged.text);
            voiceInsertion.current = undefined;
            setVoiceState('idle');
            window.requestAnimationFrame(() => {
              const editor = textareaRef.current;
              if (!editor?.isConnected) return;
              editor.focus({ preventScroll: true });
              editor.setSelectionRange(merged.caret, merged.caret);
            });
          })
          .catch((error: unknown) => {
            if (controller.signal.aborted) return;
            setVoiceState('idle');
            setVoiceError(error instanceof Error ? error.message : '语音转写失败');
          })
          .finally(() => { if (voiceAbort.current === controller) voiceAbort.current = null; });
      },
      onEnd: () => setVoiceState((current) => current === 'recording' ? 'idle' : current),
      onError: (code) => {
        setVoiceState('idle');
        setVoiceError(code === 'not-allowed' ? '麦克风权限未开放' : '无法启动录音');
      },
    });
    if (handle === null) {
      setVoiceError('当前浏览器不支持录音');
      return;
    }
    voiceHandle.current = handle;
    void handle.start();
  };

  const referenceItems = draftRefs.map((ref) => ({
    key: ref.entityType + ':' + ref.entityId,
    // Carry payload keeps exact identity minimal; use its live bound title for display.
    label: referenceLabel(ref.displayLabel || ref.descriptor?.title ? ref
      : [...nodeBindings.values()].find((bound) => bound.entityType === ref.entityType && bound.entityId === ref.entityId) ?? ref),
    thumbnailSrc: (() => {
      const image = nodes.find((node) => node.type === 'image'
        && nodeBindings.get(node.id)?.entityType === ref.entityType
        && nodeBindings.get(node.id)?.entityId === ref.entityId);
      return image === undefined ? undefined : referenceImageSource(image.data, canvasId ?? undefined);
    })(),
    onRemove: state === 'submitting' ? undefined
      : () => useLcosReferenceStore.getState().removeEntityFromDraft(ref),
  }));
  const content = (
    <LcosComposerView
      presentation={inline ? 'inline' : 'nearfield'}
      state={state === 'submitting' ? 'sending' : state === 'done' ? 'ready'
        : state === 'error' ? 'error'
        : (isContinuation ? continuationBlockedReason !== undefined : workspaceId === undefined || composerTarget?.receiverBlockedReason) ? 'blocked'
        : text.length === 0 ? 'empty' : 'editing'}
      targetId={composerTarget?.nodeId}
      identity={composerTarget?.receiverConversationId ? (
        <LcosReceiverIdentity projectId={projectId} conversationId={composerTarget.receiverConversationId} size={inline ? 28 : 25} />
      ) : undefined}
      title={isContinuation
        ? `继续「${composerTarget?.title ?? '当前会话'}」`
        : `围绕「${composerTarget?.title ?? '当前对象'}」工作`}
      references={referenceItems}
      continuationControls={isContinuation && composerTarget?.receiverConversationId ? (
        <ConversationContinuationControls projectId={projectId}
          conversationId={composerTarget.receiverConversationId}
          draftReferences={draftRefs} referenceItems={referenceItems}
          collaboration={collaboration} onSubmitted={() => continuation.retry()} />
      ) : undefined}
      referencePicker={<>
        <LcosIconButton appearance="oreo" variant="secondary" className="lcos-composer-tool-hit"
          disabled={state === 'submitting'} aria-label="点取画布引用" aria-pressed={picking}
          title={picking ? '结束点取（Esc）' : '点选画布对象作为本次引用'}
          onClick={() => { setReferencePickerOpen(false); useLcosReferenceStore.getState().setReferencePickOwner(picking ? null : presentationKey); }}>
          <LcosNearfieldGlyph name="at" />
        </LcosIconButton>
        <LcosIconButton appearance="oreo" variant="secondary" className="lcos-composer-tool-hit"
          disabled={!isVoiceInputSupported() || voiceState === 'transcribing' || state === 'submitting'}
          aria-label={voiceState === 'recording' ? '停止录音' : '语音输入'}
          aria-pressed={voiceState === 'recording'}
          title={voiceState === 'recording' ? '停止录音并转写' : voiceState === 'transcribing' ? '语音转写中…' : '录音后转写到草稿'}
          onPointerDown={() => {
            if (voiceState !== 'idle') return;
            const editor = textareaRef.current;
            voiceInsertion.current = editor !== null && document.activeElement === editor
              ? { start: editor.selectionStart, end: editor.selectionEnd }
              : undefined;
          }}
          onClick={toggleVoiceInput}>
          {voiceState === 'recording' ? '停止' : voiceState === 'transcribing' ? '转写中' : '语音'}
        </LcosIconButton>
        {picking && <ComposerReferencePicker listOnly open={referencePickerOpen} onOpenChange={setReferencePickerOpen}
          disabled={state === 'submitting'} onPicked={() => textareaRef.current?.focus()} />}
      </>}
      attachAction={{ label: '打开素材装配', disabled: state === 'submitting', onClick: () => {
        const receiver = composerTarget?.receiverConversationId;
        useLcosShellStore.getState().openAssembly(receiver ? { kind: 'conversation', id: receiver }
          : workspaceId ? { kind: 'workspace', id: workspaceId } : { kind: 'main' }, '素材装配');
      } }}
      text={text}
      textareaRef={textareaRef}
      referenceSurfaceRef={referenceSurfaceRef}
      referenceDropActive={referenceDropActive}
      onTextChange={(e) => {
        setText(e.target.value);
        if (state === 'done' || state === 'error') setState('idle');
      }}
      onKeyDown={onKeyDown}
      onClose={onClose}
      canSubmit={canSubmit}
      submitTitle={isContinuation
        ? continuationBlockedReason ?? '继续当前会话（Cmd/Ctrl+Enter）'
        : workspaceId === undefined
          ? '现场未就绪（未解析到 workspace），暂不可提交'
          : composerTarget?.receiverBlockedReason ?? '提交（Cmd/Ctrl+Enter）'}
      onSubmit={() => void submit()}
      feedbackAction={isContinuation && continuationBlockedReason ? (
        continuation.error
          ? { label: '重试读取', onClick: continuation.retry }
          : composerTarget?.receiverConversationId && continuationBlockedReason === '当前会话需要先连接或恢复'
            ? { label: '查看会话连接', onClick: () => useLcosShellStore.getState().openWindow(
              'conversation', composerTarget.title, composerTarget.receiverConversationId,
            ) }
            : undefined
      ) : undefined}
      feedback={
        (isContinuation ? continuationBlockedReason !== undefined : workspaceId === undefined || composerTarget?.receiverBlockedReason)
          || picking || voiceError !== null || voiceState !== 'idle' || state === 'submitting' || (state === 'done' && receipt) || state === 'error'
          ? (
            <>
              {picking && <div role="status" data-lcos-reference-pick-hint>点选画布对象 · 再点取消引用 · Esc 结束</div>}
              {voiceState === 'recording' && <div role="status">录音中 · 再点“停止”完成转写</div>}
              {voiceState === 'transcribing' && <div role="status">语音转写中…</div>}
              {voiceError !== null && <div role="alert" data-feedback-tone="error">语音输入失败 · {voiceError}（草稿未改动）</div>}
              {!isContinuation && workspaceId === undefined && (
                <div data-lcos-composer-blocked data-feedback-tone="error">
                  现场未就绪（未解析到 workspace），暂不可提交
                </div>
              )}
              {isContinuation && continuationBlockedReason && (
                <div data-lcos-composer-continuation-blocked data-feedback-tone="error">
                  {continuationBlockedReason}
                </div>
              )}
              {!isContinuation && composerTarget?.receiverBlockedReason && (
                <div data-lcos-composer-receiver-blocked data-feedback-tone="error">
                  {composerTarget.receiverBlockedReason}
                </div>
              )}
              {state === 'submitting' && <div data-feedback-tone="loading">提交中…</div>}
              {state === 'done' && receipt && <div data-feedback-tone="normal">{receipt}</div>}
              {state === 'error' && (
                <div data-feedback-tone="error" role="alert">
                  提交失败 · {errorDetail}（草稿已保留）
                </div>
              )}
            </>
          ) : null
      }
    />
  );

  return inline ? content : anchor ? (
    <CanvasFloatingPopover anchor={anchor} open={open} side="top" offset={10}>
      <ScaleIn initialScale={1}>{content}</ScaleIn>
    </CanvasFloatingPopover>
  ) : null;
}
