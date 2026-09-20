// ArtifactReaderBody — 阅读器（R4 Reader direct manipulation residual）。
//
// 真实 Artifact read：getArtifactDetail + revisions；正文按 kind 诚实降级
// （markdown 走 file-record 文本通道；image 走字节通道；其它 kind 只给元数据 + 外部打开提示）。
//
// R4 补齐（全部复用既有 owner，本组件不拥有 Artifact/Revision 真值）：
// - revision 浏览 / 切换：revision 行变成真实入口，切换即读该版本正文。
// - historical 只读语义：载入非 current 版本时显式标注「历史版本（只读）」并提供「回到当前版本」。
// - revision compare：走 canonical `GET /projects/:pid/revisions/compare`（CoreArtifactClient.compareRevisions）；
//   contentAvailable=false 时如实说明「仅元数据可比」，不伪造行级 diff。
// - 阅读位续读 / 重开续读：按 (projectId, artifactId, revisionId) 隔离位置与阅读缩放。
// - 摘录 / 引用带 Source Trace：引用块永远携带 artifact@revision 身份，不产生 source-less sticky。
// - 加入 Composer / Assembly 引用：走既有 reference store 草稿（Selection≠Reference≠Relation）。
// - 回到来源：按 Core identity 解析当前投影节点后 requestLocate —— 不依赖任何旧 rect。

import { CoreArtifactClient, HttpError } from '@local-creative-os/web-gen2';
import { Archive, ArchiveRestore, FileImage, FileText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createLcosCoreSession } from '../app/lcosCoreClient';
import { useLcosHostStore } from '../host/lcosHostState';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { LcosSurfaceFeedback } from '../ui/LcosSurfaceFeedback';
import { lcosTokens } from '../ui/lcosTokens';
import { ReaderContentView } from '../ui/professional/ReaderContentView';

import type { LcosReaderPositionV1 } from '../shell/lcosShellStore';
import type { RevisionCompareResultV1 } from '@local-creative-os/web-gen2';

export interface ArtifactReaderBodyProps {
  readonly projectId: string;
  readonly artifactId?: string;
  /** Window target 明确指定的 canonical revision；存在时不得偷换 current。 */
  readonly revisionId?: string;
  /** Professional Stage 统一执行关闭 + 返回来源；body 不拥有窗口拓扑。 */
  readonly onReturnToSource?: () => void;
}

/** Source Trace：citation 的身份锚（永远不是「无来源」文本）。 */
export interface ReaderSourceTraceV1 {
  readonly artifactId: string;
  readonly revisionId: string;
  readonly title: string;
}

export function readerSourceTraceLabelV1(trace: ReaderSourceTraceV1): string {
  return `artifact:${trace.artifactId}@${trace.revisionId}`;
}

/** 引用块：身份 + 摘录同时存在；调用方把身份写进草稿引用，文本只是呈现。 */
export function readerCitationBlockV1(trace: ReaderSourceTraceV1, excerpt: string): string {
  return `〔来源 ${readerSourceTraceLabelV1(trace)} · ${trace.title}〕\n> ${excerpt.trim()}`;
}

/**
 * 阅读位续读（UI-only ephemera）：只记「读到哪一版、滚到哪、阅读缩放」，按 project+artifact 隔离。
 * 它不是 Artifact/Revision 真值，也不落库；仅在当前窗口会话内存活，reload persistence 仍是 GAP。
 */
const artifactContinuityKey = (projectId: string, artifactId: string): string =>
  JSON.stringify([projectId, artifactId]);
const revisionPositionKey = (projectId: string, artifactId: string, revisionId: string): string =>
  JSON.stringify([projectId, artifactId, revisionId]);

function readerPositionFor(key: string): LcosReaderPositionV1 | undefined {
  return useLcosShellStore.getState().readerPositions[key];
}

function writeReaderPosition(key: string, value: LcosReaderPositionV1): void {
  const normalized = {
    scrollTop: Math.max(0, value.scrollTop),
    zoom: Math.min(175, Math.max(75, value.zoom)),
  };
  useLcosShellStore.getState().rememberReaderPosition(key, normalized);
}

function lastReaderRevisionFor(key: string): string | undefined {
  return useLcosShellStore.getState().readerLastRevisions[key];
}

function writeLastReaderRevision(key: string, revisionId: string): void {
  useLcosShellStore.getState().rememberReaderRevision(key, revisionId);
}

/** Project/session teardown hook; never deletes Artifact/Revision truth. */
export function clearReaderSessionContinuity(): void {
  useLcosShellStore.getState().clearReaderContinuity();
}

/** locate 请求 id；无 crypto.randomUUID 的环境（jsdom/旧内核）退化为时间戳。 */
function nextLocateReqId(): string {
  const uuid = globalThis.crypto?.randomUUID;
  return typeof uuid === 'function' ? uuid.call(globalThis.crypto) : `reader-locate-${Date.now()}`;
}

export function ArtifactReaderBody({ projectId, artifactId, revisionId, onReturnToSource }: ArtifactReaderBodyProps): React.JSX.Element {
  const session = useMemo(() => createLcosCoreSession(), []);
  const artifacts = useMemo(() => new CoreArtifactClient(session.http), [session]);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'empty'>('loading');
  const [detail, setDetail] = useState<Awaited<ReturnType<CoreArtifactClient['getArtifactDetail']>> | null>(null);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | undefined>(undefined);
  const [loadedRevisionId, setLoadedRevisionId] = useState<string | undefined>(undefined);
  const [content, setContent] = useState<{ kind: 'text'; value: string } | { kind: 'image'; url: string; mimeType: string } | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | undefined>(undefined);
  const [contentError, setContentError] = useState<string | undefined>(undefined);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentAttempt, setContentAttempt] = useState(0);
  const [compare, setCompare] = useState<RevisionCompareResultV1 | null>(null);
  const [compareError, setCompareError] = useState<string | undefined>(undefined);
  const [compareBusy, setCompareBusy] = useState(false);
  const [lastTrace, setLastTrace] = useState<string | undefined>(undefined);
  const [note, setNote] = useState<string | undefined>(undefined);
  const [lifecycleBusy, setLifecycleBusy] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [readerZoom, setReaderZoom] = useState(100);

  // 草稿引用镜像（只读）：draft 变化即重算数量。真值仍在 reference store。
  const draft = useLcosReferenceStore((s) => s.draft);
  void draft;
  const draftCount = useLcosReferenceStore.getState().orderedNodeReferences().length;

  useEffect(() => {
    if (!artifactId) {
      setState('empty');
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    setState('loading');
    setDetail(null);
    setSelectedRevisionId(undefined);
    setLoadedRevisionId(undefined);
    setContent(null);
    setErrorDetail(undefined);
    setContentError(undefined);
    setCompare(null);
    setCompareError(undefined);
    setNote(undefined);
    void (async (): Promise<void> => {
      try {
        const value = await artifacts.getArtifactDetail(artifactId);
        if (cancelled || controller.signal.aborted) return;
        if (String(value.artifact.projectId) !== String(projectId)) {
          throw new Error('材料不属于当前项目。');
        }
        setDetail(value);
        // Window target 的 revision 优先；否则恢复最后一次阅读目标。即使该 revision
        // 已缺失也保留身份，让正文区诚实报错，绝不静默偷换 current。
        const remembered = revisionId ?? lastReaderRevisionFor(artifactContinuityKey(projectId, artifactId));
        setSelectedRevisionId(remembered);
        setState('ready');
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setState('error');
        setErrorDetail(error instanceof HttpError ? `${error.message} (${error.status})` : String(error));
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [artifactId, artifacts, projectId, revisionId]);

  const revisionIdToLoad = selectedRevisionId ?? detail?.currentRevisionId ?? detail?.revisions[0]?.id;

  useEffect(() => {
    if (artifactId === undefined || revisionIdToLoad === undefined) return;
    if (detail === null) return;
    const controller = new AbortController();
    let cancelled = false;
    const projectRef = String(detail.artifact.projectId);
    void (async (): Promise<void> => {
      try {
        setContent(null);
        setContentError(undefined);
        setContentLoading(true);
        // The detail route intentionally returns only revision metadata. Read the
        // canonical revision to obtain its FileRecord identity before reading bytes.
        const revisions = await artifacts.listArtifactRevisions(artifactId);
        if (cancelled || controller.signal.aborted) return;
        const revision = revisions.find((candidate) => String(candidate.id) === String(revisionIdToLoad));
        if (revision === undefined || String(revision.artifactId) !== String(artifactId)) {
          setContentError(`目标版本 ${String(revisionIdToLoad).slice(0, 8)} 已缺失或不可读；未切换到当前版本。`);
          setLoadedRevisionId(String(revisionIdToLoad));
          return;
        }
        // 身份先落稳，再读正文。即使字节出口失败，Reader 仍明确自己尝试的是哪一版。
        setLoadedRevisionId(String(revision.id));
        if (detail.artifact.kind === 'markdown') {
          const text = await artifacts.getFileRecordText(projectRef, String(revision.fileRecordId), controller.signal);
          if (cancelled || controller.signal.aborted) return;
          setContent({ kind: 'text', value: text });
        } else if (detail.artifact.kind === 'image') {
          const blob = await artifacts.getFileRecordContent(projectRef, String(revision.fileRecordId), controller.signal);
          if (cancelled || controller.signal.aborted) return;
          const url = URL.createObjectURL(blob);
          if (cancelled || controller.signal.aborted) {
            URL.revokeObjectURL(url);
            return;
          }
          setContent({ kind: 'image', url, mimeType: blob.type || 'image/*' });
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setContentError(error instanceof HttpError ? `${error.message} (${error.status})` : String(error));
      } finally {
        if (!cancelled && !controller.signal.aborted) setContentLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [artifactId, artifacts, contentAttempt, detail, revisionIdToLoad]);

  useEffect(() => () => {
    if (content?.kind === 'image') URL.revokeObjectURL(content.url);
  }, [content]);

  // 阅读位恢复：每个 artifact+revision 各记一份，不让版本切换互相覆盖位置/缩放。
  useEffect(() => {
    if (artifactId === undefined || loadedRevisionId === undefined) return;
    const node = contentRef.current;
    const saved = readerPositionFor(revisionPositionKey(projectId, artifactId, loadedRevisionId));
    setReaderZoom(saved?.zoom ?? 100);
    if (node !== null) node.scrollTop = saved?.scrollTop ?? 0;
  }, [artifactId, loadedRevisionId, projectId, content]);

  const rememberScroll = useCallback((event: React.UIEvent<HTMLDivElement>): void => {
    if (artifactId === undefined || loadedRevisionId === undefined) return;
    writeReaderPosition(revisionPositionKey(projectId, artifactId, loadedRevisionId), {
      scrollTop: event.currentTarget.scrollTop,
      zoom: readerZoom,
    });
  }, [artifactId, loadedRevisionId, projectId, readerZoom]);

  // 重开续读的另一半：载入某一版只更新“最后阅读版本”，不覆盖该版已有位置。
  useEffect(() => {
    if (artifactId === undefined || loadedRevisionId === undefined) return;
    writeLastReaderRevision(artifactContinuityKey(projectId, artifactId), loadedRevisionId);
  }, [artifactId, loadedRevisionId, projectId]);

  const updateReaderZoom = useCallback((next: number): void => {
    const normalized = Math.min(175, Math.max(75, Math.round(next / 5) * 5));
    setReaderZoom(normalized);
    if (artifactId === undefined || loadedRevisionId === undefined) return;
    const key = revisionPositionKey(projectId, artifactId, loadedRevisionId);
    const current = readerPositionFor(key);
    writeReaderPosition(key, {
      scrollTop: current?.scrollTop ?? contentRef.current?.scrollTop ?? 0,
      zoom: normalized,
    });
  }, [artifactId, loadedRevisionId, projectId]);

  const runCompare = useCallback((): void => {
    if (detail === null) return;
    const revisions = detail.revisions;
    const current = detail.currentRevisionId === undefined ? undefined : String(detail.currentRevisionId);
    if (revisions.length < 2 || current === undefined) return;
    const loaded = loadedRevisionId;
    // 语义：载入历史版本 → 当前(base) → 历史(head)；载入当前版本 → 上一版(base) → 当前(head)。
    let base = current;
    let head = current;
    if (loaded !== undefined && loaded !== current) {
      head = loaded;
    } else {
      const index = revisions.findIndex((r) => String(r.id) === current);
      const previous = index > 0 ? revisions[index - 1] : revisions[revisions.length - 1];
      if (previous === undefined) return;
      base = String(previous.id);
    }
    setCompareBusy(true);
    setCompareError(undefined);
    setCompare(null);
    void artifacts.compareRevisions(projectId, base, head)
      .then((result) => setCompare(result))
      .catch((error: unknown) => setCompareError(error instanceof HttpError ? `${error.message} (${error.status})` : String(error)))
      .finally(() => setCompareBusy(false));
  }, [artifacts, detail, loadedRevisionId, projectId]);

  /** 加入 Composer / Assembly 引用：走既有草稿 owner（同一草稿引用即 Run 的 orderedReferences 来源）。 */
  const addToDraft = useCallback((): void => {
    if (detail === null) return;
    useLcosReferenceStore.getState().addEntityToDraft({
      entityType: 'artifact',
      entityId: String(detail.artifact.id),
      displayLabel: detail.artifact.title,
    });
    setNote('已加入草稿引用（Composer / Assembly 共用同一引用）');
  }, [detail]);

  /** 摘录为引用：身份 + 摘录一起进草稿；绝不产生无来源引用。 */
  const citeSelection = useCallback((): void => {
    if (detail === null || loadedRevisionId === undefined) return;
    const excerpt = (typeof window === 'undefined' ? '' : (window.getSelection()?.toString() ?? '')).trim();
    if (excerpt === '') {
      setNote('先选中正文再摘录（未选中时不生成无来源引用）');
      return;
    }
    const trace: ReaderSourceTraceV1 = {
      artifactId: String(detail.artifact.id),
      revisionId: loadedRevisionId,
      title: detail.artifact.title,
    };
    useLcosReferenceStore.getState().addEntityToDraft({
      entityType: 'artifact',
      entityId: trace.artifactId,
      displayLabel: trace.title,
    });
    const shell = useLcosShellStore.getState();
    const block = readerCitationBlockV1(trace, excerpt);
    shell.setComposerPrompt(shell.composerPrompt.trim() === '' ? block : `${shell.composerPrompt}\n\n${block}`);
    setLastTrace(readerSourceTraceLabelV1(trace));
    setNote('摘录已作为引用进入 Composer 草稿（带 Source Trace）');
  }, [detail, loadedRevisionId]);

  /** 回到来源：按 Core identity 在当前投影里解析节点，再走既有 locate owner（不用旧 rect）。 */
  const sourceReturn = useCallback((): void => {
    if (onReturnToSource !== undefined) {
      onReturnToSource();
      return;
    }
    if (detail === null) return;
    const entityId = String(detail.artifact.id);
    const reference = useLcosReferenceStore.getState();
    let nodeId: string | undefined;
    for (const [candidateNodeId, ref] of reference.nodeEntityRefs) {
      if (ref.entityType === 'artifact' && ref.entityId === entityId) {
        nodeId = candidateNodeId;
        break;
      }
    }
    const shell = useLcosShellStore.getState();
    const surface = shell.activeSurface;
    if (nodeId === undefined) {
      // 未投影 → 如实说明，不假定位（下游 locate 也只在节点真实存在时聚焦）。
      shell.requestLocate({ reqId: nextLocateReqId(), surface, status: 'unprojected' });
      setNote('该材料尚未投影到当前现场，无法回到来源（可稍后重试）');
      return;
    }
    shell.requestLocate({ reqId: nextLocateReqId(), surface, nodeId, status: 'projected' });
    setNote('已请求回到来源（按 Core identity 定位当前投影节点）');
  }, [detail, onReturnToSource]);

  if (state === 'empty') {
    return <ReaderMessage text="选择一项材料开始阅读（从 Assembly 或节点打开）" />;
  }
  if (state === 'loading') {
    return <ReaderMessage feedback="loading" text="读取文件…" />;
  }
  if (state === 'error') {
    return <ReaderMessage feedback="error" text={`读取失败${errorDetail ? `（${errorDetail}）` : ''}`} />;
  }
  if (!detail) return <ReaderMessage text="没有可读内容" />;

  const revision = detail.revisions.find((candidate) => String(candidate.id) === loadedRevisionId);
  const kind = detail.artifact.kind;
  const fileName = detail.artifact.title;
  const currentRevisionId = detail.currentRevisionId === undefined ? undefined : String(detail.currentRevisionId);
  const isHistorical = loadedRevisionId !== undefined && currentRevisionId !== undefined && loadedRevisionId !== currentRevisionId;
  const archived = detail.artifact.archivedAt !== undefined;

  const toggleArchive = (): void => {
    setLifecycleBusy(true);
    setNote(undefined);
    const mutation = archived
      ? artifacts.restoreArtifact(projectId, String(detail.artifact.id))
      : artifacts.archiveArtifact(projectId, String(detail.artifact.id));
    void mutation
      .then((artifact) => {
        setDetail((current) => current === null ? current : { ...current, artifact });
        useLcosHostStore.getState().host?.notifyMutationSuccess();
        setNote(archived ? '已恢复；对象会按当前现场重新落位。' : '已归档；对象已退出活跃现场，内容仍可只读查看。');
      })
      .catch((error: unknown) => setNote(error instanceof Error ? error.message : '归档状态更新失败'))
      .finally(() => setLifecycleBusy(false));
  };

  return (
    <div data-lcos-reader className="lcos-reader-body">
      <div className="lcos-reader-heading">
        <div className="min-w-0">
          <h3 className="lcos-reader-title" style={{ color: lcosTokens.color.text }}>
            {detail.artifact.title ?? '未命名'}
          </h3>
          <p className="mt-0.5 break-all text-xs" style={{ color: lcosTokens.color.muted }}>
            {String(kind)} · {detail.artifact.managed === true ? '受管 Artifact' : '外部引用'}
          </p>
        </div>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px]" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.muted }}>
          {revision ? `${revision.id.slice(0, 8)} · ${revision.status}` : '无 revision'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        {archived ? (
          <span data-lcos-reader-archived className="text-xs" style={{ color: lcosTokens.color.muted }}>归档对象 · 只读</span>
        ) : <span />}
        <button type="button" data-lcos-reader-lifecycle={archived ? 'restore' : 'archive'} disabled={lifecycleBusy} onClick={toggleArchive} className="flex min-h-11 items-center gap-1 rounded-full px-3 text-xs disabled:opacity-50" style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}>
          {archived ? <ArchiveRestore className="h-3.5 w-3.5" aria-hidden /> : <Archive className="h-3.5 w-3.5" aria-hidden />}
          {lifecycleBusy ? '处理中…' : archived ? '恢复' : '归档'}
        </button>
      </div>

      {detail.artifact.availability !== 'available' && (
        <div
          data-lcos-reader-availability={detail.artifact.availability}
          className="rounded-xl px-3 py-2 text-xs"
          style={{ background: 'rgba(194,146,78,0.10)', color: lcosTokens.color.muted }}
        >
          {detail.artifact.availability === 'stale'
            ? '来源文件已变化；当前仍按指定 revision 阅读，不会自动换成外部新内容。'
            : '来源文件已缺失；Reader 保留目标身份，正文读取结果以 Core 回执为准。'}
        </div>
      )}

      {/* R4：historical 只读语义 + 一键回到当前版本 */}
      {isHistorical && (
        <div data-lcos-reader-readonly className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(194,146,78,0.10)', color: lcosTokens.color.muted }}>
          <span>历史版本（只读）· {String(loadedRevisionId).slice(0, 8)}</span>
          <button
            type="button"
            data-lcos-reader-back-to-current
            onClick={() => setSelectedRevisionId(undefined)}
            className="ml-auto rounded-full px-2 py-0.5 text-[11px]"
            style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
          >
            回到当前版本
          </button>
        </div>
      )}

      {/* 正文预览：由真实 Revision 读取通道承载 */}
      <ReaderContent
        content={content}
        kind={kind}
        fileName={fileName}
        contentRef={contentRef}
        onScroll={rememberScroll}
        zoom={readerZoom}
        loading={contentLoading}
        error={contentError}
        onRetry={() => setContentAttempt((attempt) => attempt + 1)}
      />

      <div data-lcos-reader-zoom className="flex items-center gap-2 text-[11px]" style={{ color: lcosTokens.color.muted }}>
        <span>阅读缩放</span>
        <button type="button" data-lcos-reader-zoom-out aria-label="缩小正文" onClick={() => updateReaderZoom(readerZoom - 10)} disabled={readerZoom <= 75}>−</button>
        <span data-lcos-reader-zoom-value>{readerZoom}%</span>
        <button type="button" data-lcos-reader-zoom-in aria-label="放大正文" onClick={() => updateReaderZoom(readerZoom + 10)} disabled={readerZoom >= 175}>＋</button>
        <button type="button" data-lcos-reader-zoom-reset onClick={() => updateReaderZoom(100)}>重置</button>
      </div>

      {/* R4：revision 浏览 / 切换 */}
      {detail.revisions.length > 1 && (
        <div data-lcos-reader-revisions className="flex flex-wrap gap-1">
          {detail.revisions.map((r) => {
            const id = String(r.id);
            const active = id === loadedRevisionId;
            const isCurrent = currentRevisionId !== undefined && id === currentRevisionId;
            return (
              <button
                key={id}
                type="button"
                data-lcos-reader-revision={id}
                data-lcos-reader-revision-role={isCurrent ? 'current' : 'historical'}
                aria-current={active ? 'true' : undefined}
                onClick={() => setSelectedRevisionId(id)}
                title={isCurrent ? '当前版本' : '历史版本（只读）'}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{
                  background: active ? lcosTokens.color.inverse : lcosTokens.color.raised,
                  color: active ? lcosTokens.color.textOnInverse : lcosTokens.color.muted,
                }}
              >
                {id.slice(0, 8)}
                {isCurrent ? ' · 当前' : ' · 历史'}
              </button>
            );
          })}
        </div>
      )}

      {/* R4：动作行（引用 / 摘录 / 对比 / 回到来源） */}
      <div data-lcos-reader-actions className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-lcos-reader-to-draft
          onClick={addToDraft}
          className="rounded-full px-2.5 py-1 text-[11px]"
          style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
        >
          加入引用
        </button>
        <button
          type="button"
          data-lcos-reader-cite
          onClick={citeSelection}
          className="rounded-full px-2.5 py-1 text-[11px]"
          style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
        >
          摘录为引用
        </button>
        <button
          type="button"
          data-lcos-reader-compare-toggle
          onClick={runCompare}
          disabled={compareBusy || detail.revisions.length < 2 || currentRevisionId === undefined}
          title={detail.revisions.length < 2 ? '只有一个版本，无可对比对象' : '走 canonical revisions/compare'}
          className="rounded-full px-2.5 py-1 text-[11px] disabled:opacity-40"
          style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
        >
          {compareBusy ? '对比中…' : isHistorical ? '对比：当前 → 历史' : '对比：上一版 → 当前'}
        </button>
        <button
          type="button"
          data-lcos-reader-source-return
          onClick={sourceReturn}
          className="rounded-full px-2.5 py-1 text-[11px]"
          style={{ background: lcosTokens.color.raised, color: lcosTokens.color.text }}
        >
          回到来源
        </button>
        <span data-lcos-reader-draft-count={draftCount} className="text-[11px]" style={{ color: lcosTokens.color.muted }}>
          草稿引用 {draftCount}
        </span>
      </div>

      {lastTrace !== undefined && (
        <div data-lcos-reader-cite-trace className="break-all text-[11px]" style={{ color: lcosTokens.color.muted }}>
          Source Trace · {lastTrace}
        </div>
      )}
      {note !== undefined && (
        <div data-lcos-reader-note className="text-[11px]" style={{ color: lcosTokens.color.muted }}>{note}</div>
      )}

      {/* R4：revision 对比结果（canonical compare；不可读时如实说明，不伪造 diff） */}
      {compareError !== undefined && (
        <div data-lcos-reader-compare-error className="text-[11px]" style={{ color: lcosTokens.color.danger }}>
          对比失败 · {compareError}
        </div>
      )}
      {compare !== null && (
        <div data-lcos-reader-compare className="flex flex-col gap-1 rounded-xl p-3" style={{ background: lcosTokens.color.surface, border: `1px solid ${lcosTokens.color.borderSubtle}` }}>
          <div className="text-[11px]" style={{ color: lcosTokens.color.muted }}>
            {compare.base.revisionId.slice(0, 8)} → {compare.head.revisionId.slice(0, 8)} · {compare.changed ? '有变化' : '内容一致'}
            {compare.contentAvailable ? '' : ' · 仅元数据可比（正文不可读）'}
          </div>
          {(compare.diff ?? []).map((line, index) => (
            <div
              key={`${line.type}-${index}`}
              data-lcos-reader-compare-line={line.type}
              className="whitespace-pre-wrap break-words text-[11px]"
              style={{ color: line.type === 'add' ? lcosTokens.color.accent : line.type === 'remove' ? lcosTokens.color.danger : lcosTokens.color.muted }}
            >
              {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReaderContent({
  content,
  kind,
  fileName,
  contentRef,
  onScroll,
  zoom,
  loading,
  error,
  onRetry,
}: {
  content: { kind: 'text'; value: string } | { kind: 'image'; url: string; mimeType: string } | null;
  kind: string;
  fileName: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  zoom: number;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <ReaderContentView
      content={content}
      kind={kind}
      fileName={fileName}
      contentRef={contentRef}
      onScroll={onScroll}
      zoom={zoom}
      loading={loading}
      error={error}
      onRetry={onRetry}
      unavailableGlyph={kind === 'image'
        ? <FileImage className="h-6 w-6" style={{ color: lcosTokens.color.muted }} aria-hidden />
        : <FileText className="h-6 w-6" style={{ color: lcosTokens.color.muted }} aria-hidden />}
    />
  );
}

function ReaderMessage({
  text,
  feedback,
}: {
  text: string;
  feedback?: 'loading' | 'error';
}): React.JSX.Element {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center">
      {feedback === 'loading' || feedback === 'error' ? (
        <LcosSurfaceFeedback presentation={feedback} message={text} />
      ) : (
        <span className="text-sm" style={{ color: lcosTokens.color.muted }}>{text}</span>
      )}
    </div>
  );
}
