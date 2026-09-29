// AssemblyBody — 项目共享仓库 / Source Bay（Figma Assembly 瀑布流；四路 canonical source）。
//
// R4 Assembly（C1-3）：
// - 四路 source 各自独立状态：Project Warehouse / Capture Space / Resources / Skills；
//   一路失败不打死整个 Assembly（controller 内 per-path status/error）。
// - Project Warehouse 走 canonical 分页（nextCursor）+ 服务端搜索（query 变化重置 cursor）+ 去重。
// - Assembly 只做 SourceRef + current typed target → 既有 canonical apply owner
//   （POST /projects/:pid/assembly/apply），逐项回执如实分层；HTTP 200 != 全部成功。
// - drag 只消费 R1 Semantic Drop：AssemblySourceRef → acquireDrop → live target → canonical apply，
//   不改 semanticDropMachine / dwell grammar / target registry。
// Assembly 不拥有第二 Project truth——不复制 membership / relation / Skill binding / Capture truth。

import {
  AssemblySourceBayController,
  CoreArtifactClient,
  assemblyCardViewV1,
  isCoreAbortError,
} from '@local-creative-os/web-gen2';
import { Archive, BookOpen, FileAudio, FileImage, FileText, FolderOpen, MessageCircle, PlusCircle, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';

import { DropdownMenu, DropdownMenuItem, DropdownMenuSubmenu } from '@/components/Common/DropdownMenu';

import { createLcosCoreSession } from '../app/lcosCoreClient';
import { LcosComposerHost } from '../composer/LcosComposerHost';
import { useLcosDropStore } from '../lcosDropState';
import { acquireDrop } from '../lcosRecognizers';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { AssemblyArtifactMedia, AssemblyCaptureMedia, AssemblyResourceMedia } from './AssemblySourceMedia';
import { assemblySourceRefOf } from './assemblySourceRef';
import { beginChildWorksiteNavigation } from '../navigation/childWorksiteNavigation';
import { childSurfaceForItem, workspaceTargetsForItem } from '../navigation/workspaceTargets';
import { useLcosShellStore } from '../shell/lcosShellStore';
import { LcosSurfaceFeedback } from '../ui/LcosSurfaceFeedback';
import { LcosButton } from '../ui/primitives/LcosButton';
import { AssemblyItemView } from '../ui/professional/AssemblyItemView';
import { AssemblyMasonryView } from '../ui/professional/AssemblyMasonryView';
import { AssemblyMaterialView } from '../ui/professional/AssemblyMaterialView';
import { assemblyMaterialShape, captureMaterialShape, matchesAssemblyFilter, retainAssemblySelection,
  toggleAssemblySelection, assemblyDate } from '../ui/professional/assemblyPresentation';
import { AssemblyPreviewView } from '../ui/professional/AssemblyPreviewView';
import { AssemblyReceiptView } from '../ui/professional/AssemblyReceiptView';
import { AssemblySourceTabsView } from '../ui/professional/AssemblySourceTabsView';
import { AssemblyToolbarView } from '../ui/professional/AssemblyToolbarView';

import type { LcosComposerTarget } from '../shell/lcosShellStore';
import type { AssemblyMaterialFilter } from '../ui/professional/assemblyPresentation';
import type {
  AssemblyApplyItemResultV1,
  AssemblyApplyResultV1,
  AssemblySourceRefV1,
  AssemblyTargetRefV1,
  CaptureStagingItemV0,
  ResourceDescriptorV0,
  SkillCatalogEntryV1,
  WarehouseEntityKindV1,
  WarehouseItemV1,
} from '@local-creative-os/contracts';
import type { Workspace } from '@local-creative-os/domain';
import type { AssemblySourceTabV1 } from '@local-creative-os/web-gen2';

/**
 * The body that opened a Composer intent is its only presentation owner.
 * Assembly intents are identifiable without adding another shell truth field.
 */
export function assemblyComposerOwnsTarget(
  composerOpen: boolean,
  composerTarget: Pick<LcosComposerTarget, 'nodeId'> | null,
): boolean {
  return composerOpen && composerTarget !== null && composerTarget.nodeId.startsWith('assembly:');
}

const KIND_LABEL: Readonly<Record<WarehouseEntityKindV1, string>> = {
  artifact: '材料',
  note: '便签',
  conversation: '会话',
  resource: '资源',
  context: '上下文',
  workflow: '工作流',
  scene: '现场',
  collection: '集合',
};

const FAMILY_LABEL: Readonly<Record<NonNullable<WarehouseItemV1['visualFamily']>, string>> = {
  image: '图像',
  video: '视频',
  audio: '音频',
  pdf: '文档',
  ppt: '演示文稿',
  markdown: '文本',
  link: '链接',
  archive: '压缩包',
  file: '文件',
};

const TAB_LABEL: Readonly<Record<AssemblySourceTabV1, string>> = {
  project: '项目',
  capture: '收件',
  sources: '来源',
  skills: '技能',
};

const EMPTY_TAB_TEXT: Readonly<Record<AssemblySourceTabV1, string>> = {
  project: '仓库还没有内容',
  capture: '暂存区还没有内容',
  sources: '这个项目还没有导入来源',
  skills: '还没有可用技能',
};

const SKILL_SOURCE_LABEL: Readonly<Record<SkillCatalogEntryV1['source'], string>> = {
  system: '系统',
  user: '用户',
  merged: '两层合并',
};

function materialFamily(item: WarehouseItemV1): string {
  return item.visualFamily === undefined ? KIND_LABEL[item.kind] ?? item.kind : FAMILY_LABEL[item.visualFamily];
}

function MaterialGlyph({ item }: { readonly item: WarehouseItemV1 }): React.JSX.Element {
  if (item.visualFamily === 'image') { return <FileImage className="h-5 w-5" aria-hidden />; }
  if (item.visualFamily === 'audio' || item.visualFamily === 'video') { return <FileAudio className="h-5 w-5" aria-hidden />; }
  if (item.kind === 'collection' || item.kind === 'scene' || item.kind === 'workflow' || item.kind === 'context') { return <FolderOpen className="h-5 w-5" aria-hidden />; }
  return <FileText className="h-5 w-5" aria-hidden />;
}
/** Assembly 的对象入口：会话保留会话工作视图，其余实体进入 Reader。 */
export type AssemblyOpenTarget =
  | { readonly bodyKey: 'reader' | 'conversation' | 'portal-preview'; readonly target: string; readonly label: string; readonly targetKind?: 'canvas' }
  | { readonly bodyKey: 'unavailable'; readonly label: string };

/** 只返回已有 body 能正确消费的 target；不把 scope/resource id 冒充 artifactId。 */
export function assemblyOpenTargetOf(item: WarehouseItemV1, workspaces: readonly Pick<Workspace, 'id' | 'canvasId'>[] = []): AssemblyOpenTarget {
  switch (item.kind) {
    case 'artifact':
      return { bodyKey: 'reader', target: item.entityRef.id, label: '阅读' };
    case 'conversation':
      return { bodyKey: 'conversation', target: item.entityRef.id, label: '打开会话' };
    case 'context':
    case 'workflow':
      return { bodyKey: 'unavailable', label: '尚未关联可打开的现场' };
    case 'scene': {
      const workspace = workspaces.find((candidate) => String(candidate.id) === item.entityRef.id);
      return workspace?.canvasId
        ? { bodyKey: 'portal-preview', target: workspace.canvasId, targetKind: 'canvas', label: '预览现场' }
        : { bodyKey: 'unavailable', label: '现场画布尚未就绪' };
    }
    case 'collection':
    case 'note':
    case 'resource':
      return { bodyKey: 'unavailable', label: '暂不可打开' };
  }
}

export function assemblyWindowOf(item: WarehouseItemV1): AssemblyOpenTarget['bodyKey'] {
  return assemblyOpenTargetOf(item).bodyKey;
}

/** previewRef 目前无 Core producer；仅接受可直接作为 img src 的 URL，拒绝 opaque id。 */
export function previewUrlOf(item: WarehouseItemV1): string | undefined {
  const value = item.previewRef?.trim();
  if (value === undefined || value === '') { return undefined; }
  return /^(?:https?:\/\/|blob:|data:image\/)/i.test(value) ? value : undefined;
}

export { assemblySourceRefOf } from './assemblySourceRef';

// ---------------------------------------------------------------------------
// 逐项 apply 回执的诚实分层（R4 §4）：HTTP 200 不等于全部成功。
// ---------------------------------------------------------------------------

export type AssemblyOutcomeToneV1 = 'applied' | 'already-member' | 'unsupported' | 'skipped' | 'failed';

export interface AssemblyOutcomeLineV1 {
  readonly key: string;
  readonly tone: AssemblyOutcomeToneV1;
  readonly label: string;
  readonly detail?: string;
  readonly changeSetId?: string;
}

/**
 * 回执分层（presentation only，不建新 domain truth）：
 * - applied        ：每一项都真的落地了新 canonical mutation
 * - partial        ：有落地、也有 已存在/跳过/不支持/失败（applied-with-skip）
 * - already-present：全部 already-member —— 没有新增变更，**不是「全部成功」**
 * - unsupported    ：全部不支持投放（诚实 unsupported，不是成功）
 * - skipped        ：全部因其它原因跳过（没有来源落地）
 * - failed         ：有失败且没有任何落地
 */
export type AssemblyApplyToneV1 =
  | 'applied'
  | 'partial'
  | 'already-present'
  | 'unsupported'
  | 'skipped'
  | 'failed';

export interface AssemblyApplySummaryV1 {
  readonly tone: AssemblyApplyToneV1;
  readonly headline: string;
  readonly lines: readonly AssemblyOutcomeLineV1[];
  readonly counts: Readonly<Record<AssemblyOutcomeToneV1, number>>;
}

const OUTCOME_LABEL: Readonly<Record<AssemblyOutcomeToneV1, string>> = {
  applied: '已投放',
  'already-member': '已在目标中（跳过）',
  unsupported: '不支持',
  skipped: '跳过',
  failed: '失败',
};

export function assemblyOutcomeToneOf(result: AssemblyApplyItemResultV1): AssemblyOutcomeToneV1 {
  if (result.status === 'failed') { return 'failed'; }
  if (result.status === 'applied') { return 'applied'; }
  if (result.channel === 'already-member') { return 'already-member'; }
  if (result.channel === 'unsupported') { return 'unsupported'; }
  return 'skipped';
}

const OUTCOME_TONES: readonly AssemblyOutcomeToneV1[] = ['applied', 'already-member', 'unsupported', 'skipped', 'failed'];

/** 不信任 Core 的 allApplied：already-member / skipped / unsupported 都不是「全部成功」。 */
export function describeAssemblyApplyResultV1(result: AssemblyApplyResultV1): AssemblyApplySummaryV1 {
  const lines: AssemblyOutcomeLineV1[] = result.results.map((item) => {
    const tone = assemblyOutcomeToneOf(item);
    return {
      key: `${item.sourceRef.kind}:${item.sourceRef.id}`,
      tone,
      label: OUTCOME_LABEL[tone],
      ...(item.message === undefined ? {} : { detail: item.message }),
      ...(item.changeSetId === undefined ? {} : { changeSetId: item.changeSetId }),
    };
  });

  const counts = Object.fromEntries(OUTCOME_TONES.map((tone) => [tone, 0])) as Record<AssemblyOutcomeToneV1, number>;
  for (const line of lines) { counts[line.tone] += 1; }
  const total = lines.length;
  const landed = counts.applied;

  const rest = [
    counts['already-member'] > 0 ? `已在目标中 ${counts['already-member']}` : undefined,
    counts.skipped > 0 ? `跳过 ${counts.skipped}` : undefined,
    counts.unsupported > 0 ? `不支持 ${counts.unsupported}` : undefined,
    counts.failed > 0 ? `失败 ${counts.failed}` : undefined,
  ].filter((part): part is string => part !== undefined).join(' · ');

  let tone: AssemblyApplyToneV1;
  if (total === 0) { tone = 'skipped'; }
  else if (counts.failed > 0) { tone = landed > 0 ? 'partial' : 'failed'; }
  else if (landed === total) { tone = 'applied'; }
  else if (landed > 0) { tone = 'partial'; }
  else if (counts['already-member'] === total) { tone = 'already-present'; }
  else if (counts.unsupported === total) { tone = 'unsupported'; }
  else { tone = 'skipped'; }

  const headline = ((): string => {
    switch (tone) {
      case 'applied':
        return `全部成功 · ${landed} 项落地`;
      case 'partial':
        return `${landed} 项落地 · ${rest}`;
      case 'already-present':
        return '全部已在目标中 · 没有新增变更';
      case 'unsupported':
        return '这些来源不支持投放到当前目标 · 没有来源落地';
      case 'skipped':
        return total === 0 ? '没有可投放的来源' : `全部跳过 · 没有来源落地${rest === '' ? '' : `（${rest}）`}`;
      case 'failed':
        return `投放失败 · 没有来源落地${rest === '' ? '' : `（${rest}）`}`;
    }
  })();

  return { tone, headline, lines, counts };
}

function targetLabel(target: AssemblyTargetRefV1): string {
  switch (target.kind) {
    case 'main':
      return '主画布';
    case 'conversation':
      return '当前会话';
    case 'context':
      return '当前上下文';
    case 'workflow':
      return '当前工作流';
    case 'workspace':
    case 'scene':
      return '当前工作现场';
    case 'project':
      return '当前项目';
  }
}

function captureTitle(item: CaptureStagingItemV0): string {
  const source = item.source as Readonly<Record<string, unknown>>;
  const title = source['title'];
  if (typeof title === 'string' && title.trim() !== '') { return title; }
  const url = source['url'];
  if (typeof url === 'string' && url.trim() !== '') { return url; }
  const localPath = source['localPath'];
  if (typeof localPath === 'string' && localPath.trim() !== '') { return localPath; }
  return item.kind;
}

/**
 * 取消不是失败：HttpClient 把 abort 归一成 code 'aborted'，DOM 侧则是 name 'AbortError'。
 * 两者都必须被识别，否则取消会被写成一条假的 error 回执/预览。共用 web-gen2 的实现。
 */
const isAbortLikeV1 = isCoreAbortError;

type AssemblyPreviewKindV1 = 'text' | 'image' | 'url' | 'local_path' | 'descriptor' | 'skill' | 'unknown';

interface AssemblyPreviewV1 {
  readonly status: 'loading' | 'ready' | 'error';
  readonly subjectKey: string;
  readonly title: string;
  readonly kind: AssemblyPreviewKindV1;
  readonly text?: string;
  readonly dataUrl?: string;
  readonly url?: string;
  readonly path?: string;
  readonly error?: string;
  readonly lines?: readonly { readonly label: string; readonly value: string }[];
  readonly sourceLabel?: string;
}
export function AssemblyBody({
  projectId,
  targetRef,
}: {
  readonly projectId: string;
  readonly targetRef: AssemblyTargetRefV1;
}): React.JSX.Element {
  const session = useMemo(() => createLcosCoreSession(), []);
  const navigate = useNavigate();
  const artifacts = useMemo(() => new CoreArtifactClient(session.http), [session]);
  const activeSurface = useLcosShellStore((s) => s.activeSurface);
  const activeWorkspaceId = useLcosShellStore((s) => s.activeWorkspaceId);
  const openWindow = useLcosShellStore((s) => s.openWindow);
  const composerOpen = useLcosShellStore((s) => s.composerOpen);
  const composerTarget = useLcosShellStore((s) => s.composerTarget);
  const closeComposer = useLcosShellStore((s) => s.closeComposer);
  const referencedRefs = useLcosReferenceStore((s) => s.draft.orderedEntityRefs);

  const controller = useMemo(
    () => new AssemblySourceBayController({
      assembly: session.assembly,
      captureSpace: session.captureSpace,
      resources: session.resources,
      skills: session.skills,
    }),
    [session],
  );
  const bay = useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.read(),
  );

  const [workspaces, setWorkspaces] = useState<readonly Workspace[]>([]);
  const [workspaceError, setWorkspaceError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [applyResult, setApplyResult] = useState<AssemblyApplyResultV1 | null>(null);
  const [applyingKey, setApplyingKey] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [filter, setFilter] = useState<AssemblyMaterialFilter>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [applyUnconfirmed, setApplyUnconfirmed] = useState(false);
  const previewRetry = useRef<(() => void) | undefined>(undefined);
  const previewOrigin = useRef<HTMLElement | null>(null);
  const applyPending = useRef<number | null>(null);
  const [preview, setPreview] = useState<AssemblyPreviewV1 | undefined>(undefined);

  /**
   * R4 preview correctness：local request generation。
   * project 切换 / source tab 切换 / 新的 preview 都让旧 completion 失效——
   * stale 的 Capture/Resource/Skill 预览绝不进入当前 Project/tab；Abort 也不得写 error 预览。
   */
  const previewGeneration = useRef(0);
  const workspaceGeneration = useRef(0);
  const invalidatePreview = useCallback((): void => {
    previewGeneration.current += 1;
  }, []);

  /**
   * R4 apply correctness：local context generation。
   * canonical mutation 一律用 invocation 时刻捕获的 projectId/targetRef 发出（已发出的写入
   * 不因 Abort 假装没发生）；但回执只在「仍是当前 context」时才允许写 UI / 刷新 Source Bay。
   */
  const applyGeneration = useRef(0);
  /** target 的稳定身份（targetRef 每次渲染都是新对象，不能直接做依赖）。 */
  const targetKey = 'id' in targetRef ? `${targetRef.kind}:${targetRef.id}` : targetRef.kind;

  useEffect(() => {
    controller.open(projectId);
    return () => controller.dispose();
  }, [controller, projectId]);

  useEffect(() => {
    // Project 切换：清掉旧 Project 的选择 / 预览 / 回执，再加载新 Project 的现场信息。
    invalidatePreview();
    applyGeneration.current += 1;
    setApplyResult(null);
    setApplyingKey(null);
    setPreview(undefined);
    setSelectedIds([]); setFilter('all'); setLocalSearch('');
    applyPending.current = null;
    setApplyUnconfirmed(false);
    setSearchInput('');
    setWorkspaces([]);
    setWorkspaceError(false);
  }, [invalidatePreview, projectId]);

  useEffect(() => {
    // 目标变化：旧的回执不再属于当前 context（在飞 mutation 仍已在 Core 发生，不假装没发生）。
    applyGeneration.current += 1;
    setApplyResult(null);
    setApplyingKey(null);
    applyPending.current = null;
    setApplyUnconfirmed(false);
  }, [targetKey]);

  const reloadWorkspaces = useCallback((): void => {
    const generation = ++workspaceGeneration.current;
    void session.projects.getWorkspaces(projectId).then((sites) => {
      if (workspaceGeneration.current !== generation) { return; }
      setWorkspaces(sites); setWorkspaceError(false);
    }).catch(() => {
      if (workspaceGeneration.current === generation) { setWorkspaceError(true); }
    });
  }, [projectId, session]);
  useEffect(() => {
    reloadWorkspaces();
    return () => { workspaceGeneration.current += 1; };
  }, [reloadWorkspaces]);

  const tab: AssemblySourceTabV1 = bay?.tab ?? 'project';

  const selectTab = (next: AssemblySourceTabV1): void => {
    // 切 source tab：旧 tab 的预览完成不再属于当前上下文。
    invalidatePreview();
    setPreview(undefined);
    setSelectedIds([]); setFilter('all'); setLocalSearch('');
    previewRetry.current = undefined;
    controller.selectTab(next);
    controller.loadTab(next);
  };

  const addToComposer = (item: WarehouseItemV1): void => {
    // 加入统一 Composer 草稿（reference store draft；Selection≠Reference）
    useLcosReferenceStore.getState().addEntityToDraft({
      entityType: assemblyCardViewV1(item, new Set()).refEntityType,
      entityId: item.entityRef.id,
      ...(item.title === undefined ? {} : { displayLabel: item.title }),
    });

    // Assembly 复用唯一 Composer。只有明确的 Conversation 才能成为 receiver；
    // 其它材料仍可进入 draft，但提交按钮必须显示真实阻断原因，不能猜一个 agent。
    const receiverConversationId = item.kind === 'conversation' ? item.entityRef.id
      : targetRef.kind === 'conversation' ? targetRef.id : undefined;
    const receiverBlockedReason = receiverConversationId === undefined
      ? '尚未选择会话接收者；请从会话窗口打开 Composer 后再提交'
      : undefined;
    useLcosShellStore.getState().openComposer({
      nodeId: `assembly:${item.kind}:${item.entityRef.id}`,
      title: item.title ?? '当前材料',
      anchor: { x: 0, y: 0, width: 0, height: 0 },
      ...(activeWorkspaceId === null ? {} : { workspaceId: activeWorkspaceId }),
      ...(receiverConversationId === undefined ? {} : { receiverConversationId }),
      ...(receiverBlockedReason === undefined ? {} : { receiverBlockedReason }),
    });
  };

  const applySources = useCallback((sourceRefs: readonly AssemblySourceRefV1[], refreshTab?: AssemblySourceTabV1): void => {
    if (sourceRefs.length === 0 || applyPending.current !== null) { return; }
    const invocationProjectId = projectId;
    const invocationTarget = targetRef;
    const generation = ++applyGeneration.current;
    applyPending.current = generation;
    const isCurrentContext = (): boolean => applyGeneration.current === generation;
    const singleSource = sourceRefs.length === 1 ? sourceRefs[0] : undefined;
    setApplyingKey(singleSource === undefined ? 'selection' : `${singleSource.kind}:${singleSource.id}`);
    setApplyResult(null); setApplyUnconfirmed(false);
    void session.assembly.apply(invocationProjectId, {
      schemaVersion: 1, projectId: invocationProjectId, sourceRefs, targetRef: invocationTarget,
    }).then((result) => {
      if (!isCurrentContext()) { return; }
      setApplyResult(result);
      // Keep incomplete sources selected. Existing Core result, not an inferred success count.
      const completed = new Set(result.results.filter((line) => line.status === 'applied' || (line.status === 'skipped' && line.channel === 'already-member'))
        .map((line) => `${line.sourceRef.kind}:${line.sourceRef.id}`));
      setSelectedIds((current) => current.filter((id) => !completed.has(id)));
      if (refreshTab !== undefined) { void controller.refreshApplied([refreshTab]); }
    }).catch((error: unknown) => {
      if (!isCurrentContext()) { return; }
      // The write may already have happened. Never auto-retry an unconfirmed mutation.
      setApplyUnconfirmed(true);
      setApplyResult({ schemaVersion: 1, projectId: invocationProjectId, allApplied: false,
        results: sourceRefs.map((sourceRef) => ({ sourceRef, status: 'failed', channel: 'error',
          message: error instanceof Error ? error.message : String(error) })) });
    }).finally(() => {
      if (!isCurrentContext()) { return; }
      applyPending.current = null; setApplyingKey(null);
    });
  }, [controller, projectId, session, targetRef]);
  const applySource = useCallback((sourceRef: AssemblySourceRefV1, refreshTab?: AssemblySourceTabV1): void => {
    applySources([sourceRef], refreshTab);
  }, [applySources]);

  const beginAssemblyDrag = (
    event: React.DragEvent<HTMLDivElement>,
    itemId: string,
    sourceRef: AssemblySourceRefV1,
  ): void => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(
      'application/x-lcos-assembly',
      JSON.stringify({ itemId, sourceRef }),
    );
    acquireDrop({ kind: 'assembly', itemId, sourceRef });
  };

  const finishAssemblyDrag = (): void => {
    const store = useLcosDropStore.getState();
    if (store.state.status === 'preview' && store.resolution?.status === 'ready') {
      const transactionId = globalThis.crypto?.randomUUID?.() ?? `drop-${Date.now()}`;
      store.commitAt(transactionId);
      return;
    }
    if (
      store.state.status === 'tracking' ||
      store.state.status === 'dwell' ||
      store.state.status === 'preview'
    ) {
      store.cancel();
    }
  };

  const enterChildWorkspace = (item: WarehouseItemV1, workspace: Workspace): void => {
    if (workspace.canvasId === undefined) { return; }
    const targetSurface = childSurfaceForItem(item, workspace);
    if (targetSurface === undefined) { return; }
    const sourceNodeId = [...(useLcosReferenceStore.getState().nodeEntityRefs?.entries?.() ?? [])].find(
      ([, ref]) => ref.entityId === item.entityRef.id && ref.entityType === item.entityRef.type,
    )?.[0];
    beginChildWorksiteNavigation({
      projectId,
      sourceSurface: activeSurface,
      ...(activeWorkspaceId === null ? {} : { sourceWorkspaceId: activeWorkspaceId }),
      sourceWasChild: new URLSearchParams(window.location.search).has('workspaceId'),
      targetSurface,
      targetWorkspace: workspace,
      ...(sourceNodeId === undefined ? {} : { sourceNodeId }),
      navigate,
    });
  };

  // ---- 预览（transient read；不改 Source Bay 状态）----

  /** 预览读的共同纪律：新的 preview 使旧 completion 失效；Abort 与 stale 都不得写 UI。 */
  const beginPreview = (subjectKey: string, title: string, kind: AssemblyPreviewKindV1): number => {
    previewGeneration.current += 1;
    const generation = previewGeneration.current;
    // A retry originates inside the preview; preserve the original material control.
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      && !document.activeElement.closest('[data-lcos-assembly-preview]')) { previewOrigin.current = document.activeElement; }
    setPreview({ status: 'loading', subjectKey, title, kind });
    return generation;
  };
  const isPreviewCurrent = (generation: number): boolean => previewGeneration.current === generation;

  const previewCapture = (item: CaptureStagingItemV0): void => {
    const subjectKey = `capture:${item.id}`;
    const title = captureTitle(item);
    previewRetry.current = () => previewCapture(item);
    const generation = beginPreview(subjectKey, title, 'unknown');
    void controller.previewCapture(item.id)
      .then((value) => {
        if (!isPreviewCurrent(generation)) { return; }
        setPreview({
          status: 'ready',
          subjectKey,
          title,
          kind: value.type,
          sourceLabel: `收件 · ${assemblyDate(item.capturedAt)}`,
          ...(value.text === undefined ? {} : { text: value.text }),
          ...(value.dataUrl === undefined ? {} : { dataUrl: value.dataUrl }),
          ...(value.url === undefined ? (typeof item.source['url'] === 'string' ? { url: item.source['url'] } : {}) : { url: value.url }),
          ...(value.path === undefined ? {} : { path: value.path }),
        });
      })
      .catch((error: unknown) => {
        // AbortError 不是「预览失败」——不得把取消写成 error 预览。
        if (isAbortLikeV1(error) || !isPreviewCurrent(generation)) { return; }
        setPreview({ status: 'error', subjectKey, title, kind: 'unknown', error: error instanceof Error ? error.message : String(error) });
      });
  };

  const previewResource = (resourceId: string, title: string): void => {
    const subjectKey = `resource:${resourceId}`;
    previewRetry.current = () => previewResource(resourceId, title);
    const generation = beginPreview(subjectKey, title, 'descriptor');
    void controller.readResourceDescriptor(resourceId)
      .then((descriptor: ResourceDescriptorV0) => {
        if (!isPreviewCurrent(generation)) { return; }
        setPreview({
          status: 'ready',
          subjectKey,
          title,
          kind: 'descriptor',
          lines: [
            { label: '来源', value: descriptor.source.kind },
            { label: '理解状态', value: descriptor.understanding.status },
            ...(descriptor.understanding.summary === undefined ? [] : [{ label: '摘要', value: descriptor.understanding.summary }]),
            { label: '信任', value: descriptor.trust.level },
            ...(descriptor.detectedKinds.length === 0
              ? []
              : [{ label: '识别', value: descriptor.detectedKinds.map((kind) => kind.kind).join('、') }]),
          ],
        });
      })
      .catch((error: unknown) => {
        if (isAbortLikeV1(error) || !isPreviewCurrent(generation)) { return; }
        setPreview({ status: 'error', subjectKey, title, kind: 'descriptor', error: error instanceof Error ? error.message : String(error) });
      });
  };

  const previewSkill = (entry: SkillCatalogEntryV1): void => {
    const subjectKey = `skill:${entry.id}`;
    previewRetry.current = () => previewSkill(entry);
    const generation = beginPreview(subjectKey, entry.name, 'skill');
    void controller.readSkill(entry.id)
      .then((value) => {
        if (!isPreviewCurrent(generation)) { return; }
        setPreview({ status: 'ready', subjectKey, title: entry.name, kind: 'skill', text: value.content });
      })
      .catch((error: unknown) => {
        if (isAbortLikeV1(error) || !isPreviewCurrent(generation)) { return; }
        setPreview({ status: 'error', subjectKey, title: entry.name, kind: 'skill', error: error instanceof Error ? error.message : String(error) });
      });
  };

  const referencedKeySet = useMemo(
    () => new Set(referencedRefs.map((ref) => `assembly:${ref.entityType}:${ref.entityId}`)),
    [referencedRefs],
  );

  const summary = applyResult === null ? undefined : describeAssemblyApplyResultV1(applyResult);
  const assemblyOwnsComposer = assemblyComposerOwnsTarget(composerOpen, composerTarget);
  const warehouseItems = bay?.warehouse?.items ?? [];
  const captureItems = bay?.captureItems ?? [];
  const resources = bay?.resources ?? [];
  const skills = bay?.skills ?? [];
  const query = localSearch.trim().toLocaleLowerCase();
  const projectVisible = warehouseItems.filter((item) => matchesAssemblyFilter(assemblyMaterialShape(item), filter));
  const captureVisible = captureItems.filter((item) => matchesAssemblyFilter(captureMaterialShape(item.kind), filter)
    && (!query || captureTitle(item).toLocaleLowerCase().includes(query)));
  const resourcesVisible = resources.filter((item) => !query || item.title.toLocaleLowerCase().includes(query));
  const skillsVisible = skills.filter((item) => !query || `${item.name} ${item.description}`.toLocaleLowerCase().includes(query));
  const availableRefs = useMemo(() => tab === 'project' ? (bay?.warehouse?.items ?? []).map(assemblySourceRefOf)
    : tab === 'capture' ? (bay?.captureItems ?? []).map((item): AssemblySourceRefV1 => ({ kind: 'capture', id: item.id }))
      : tab === 'sources' ? (bay?.resources ?? []).map((item): AssemblySourceRefV1 => ({ kind: 'resource', id: item.resourceId })) : [],
    [tab, bay?.warehouse?.items, bay?.captureItems, bay?.resources]);
  useEffect(() => {
    const ids = new Set(availableRefs.map((ref) => `${ref.kind}:${ref.id}`));
    setSelectedIds((current) => retainAssemblySelection(current, ids));
  }, [availableRefs]);
  useEffect(() => () => { invalidatePreview(); applyGeneration.current += 1; }, [invalidatePreview]);
  const selectedRefs = availableRefs.filter((ref) => selectedIds.includes(`${ref.kind}:${ref.id}`));
  const count = tab === 'project' ? projectVisible.length : tab === 'capture' ? captureVisible.length : tab === 'sources' ? resourcesVisible.length : skillsVisible.length;
  const closePreview = (): void => {
    invalidatePreview(); setPreview(undefined); previewRetry.current = undefined;
    const origin = previewOrigin.current;
    requestAnimationFrame(() => {
      if (!origin?.isConnected) { return; }
      // Hover actions are initially visibility:hidden after the preview loses focus.
      // Focus the persistent take control first so :focus-within reveals the original action.
      origin.closest('.lcos-assembly-item')?.querySelector<HTMLButtonElement>('[data-lcos-assembly-more]')?.focus({ preventScroll: true });
      origin.focus({ preventScroll: true });
    });
  };
  const toggleSelected = (source: AssemblySourceRefV1): void => {
    setSelectedIds((current) => toggleAssemblySelection(current, `${source.kind}:${source.id}`));
  };
  const renderOpenAction = (item: WarehouseItemV1): React.JSX.Element => {
    if (item.kind === 'context' || item.kind === 'workflow' || item.kind === 'collection') {
      const targets = workspaceTargetsForItem(item, workspaces);
      if (targets.length > 0) { return <DropdownMenu trigger={<LcosButton appearance="oreo" variant="ghost">选择现场预览</LcosButton>}>
        {targets.map((workspace) => <DropdownMenuSubmenu key={String(workspace.id)} label={`${workspace.name}${workspace.canvasId ? '' : ' · 画布尚未就绪'}`}>
          <DropdownMenuItem disabled={!workspace.canvasId} onClick={() => {
            if (workspace.canvasId) { openWindow('portal-preview', `预览现场 · ${workspace.name}`, workspace.canvasId, 'canvas'); }
          }}>预览现场</DropdownMenuItem>
          <DropdownMenuItem disabled={!workspace.canvasId} onClick={() => enterChildWorkspace(item, workspace)}>进入现场</DropdownMenuItem>
        </DropdownMenuSubmenu>)}
      </DropdownMenu>; }
    }
    if (item.kind === 'resource') { return <LcosButton appearance="oreo" variant="ghost" onClick={() => previewResource(item.entityRef.id, item.title)}>预览来源</LcosButton>; }
    const destination = assemblyOpenTargetOf(item, workspaces);
    if (destination.bodyKey === 'unavailable') { return <span data-lcos-assembly-unavailable>{workspaceError && ['scene','context','workflow','collection'].includes(item.kind) ? '现场信息读取失败，请重试' : destination.label}</span>; }
    return <LcosButton appearance="oreo" variant="ghost" onClick={() => openWindow(destination.bodyKey, `${destination.label} · ${item.title}`, destination.target, destination.targetKind)}>
      {destination.bodyKey === 'conversation' ? <MessageCircle size={16} aria-hidden /> : <BookOpen size={16} aria-hidden />}{destination.label}
    </LcosButton>;
  };
  const status = tab === 'project' ? bay?.warehouseStatus : tab === 'capture' ? bay?.captureStatus : tab === 'sources' ? bay?.resourceStatus : bay?.skillStatus;
  const errorCode = tab === 'project' ? bay?.warehouseErrorCode : tab === 'capture' ? bay?.captureErrorCode : tab === 'sources' ? bay?.resourceErrorCode : bay?.skillErrorCode;
  const reload = (): void => {
    if (tab === 'project') { controller.reloadWarehouse(); }
    else if (tab === 'capture') { controller.reloadCapture(); }
    else if (tab === 'sources') { controller.reloadResources(); }
    else { controller.reloadSkills(); }
  };
  return <div data-lcos-assembly data-lcos-assembly-target={targetRef.kind}
    data-lcos-assembly-target-id={'id' in targetRef ? targetRef.id : ''} className="lcos-assembly-body">
    <AssemblySourceTabsView items={(['project','capture','sources','skills'] as const).map((key) => ({ key, label: TAB_LABEL[key] }))}
      value={tab} onSelect={selectTab} context={<span>取用到 <strong>{targetLabel(targetRef)}</strong>{tab === 'capture' ? ' · 收件仍保留原始来源' : ''}</span>} />
    {/* Hidden rather than unmounted so closing preview restores exact card focus and scroll. */}
    <div className="lcos-assembly-browse" hidden={preview !== undefined}>
      <AssemblyToolbarView query={tab === 'project' ? searchInput : localSearch}
        placeholder={tab === 'project' ? '搜索项目材料' : tab === 'capture' ? '查找当前收件' : tab === 'sources' ? '查找已载入来源' : '查找技能'}
        localSearch={tab !== 'project'} onQueryChange={tab === 'project' ? setSearchInput : setLocalSearch}
        onSearch={() => { if (tab === 'project') { controller.setWarehouseSearch(searchInput); } }}
        onClear={() => { if (tab === 'project') { setSearchInput(''); controller.setWarehouseSearch(''); } else { setLocalSearch(''); } }}
        filter={filter} onFilterChange={setFilter} showFilters={tab === 'project' || tab === 'capture'} />
      <div className="lcos-assembly-result-meta"><span role="status">{status === 'loading' ? '正在读取材料…' : `${count} 项`}
        {tab === 'project' && bay?.warehouse?.totalApprox !== undefined ? ` · 项目约 ${bay.warehouse.totalApprox} 项` : ''}
        {filter !== 'all' ? ' · 已载入内容筛选' : ''}</span>
        {tab === 'project' ? <LcosButton appearance="oreo" variant="ghost" data-lcos-open-archive
          onClick={() => openWindow('archive', '归档')}><Archive size={15} aria-hidden />查看归档</LcosButton> : null}
        <LcosButton appearance="oreo" variant="ghost" onClick={reload} disabled={status === 'loading'} aria-label="刷新当前来源">刷新</LcosButton></div>
      <div className="lcos-assembly-scroll" data-lcos-assembly-source-panel={tab}>
        {status === 'loading' || status === 'idle' || status === undefined ? <div className="lcos-assembly-loading">
          <LcosSurfaceFeedback presentation="loading" message="正在读取材料…" />
          <div className="lcos-assembly-skeletons" aria-hidden><i /><i /><i /><i /></div>
        </div> : null}
        {status === 'error' ? <div className="lcos-assembly-empty" data-lcos-assembly-error={tab} title={errorCode === undefined ? undefined : `读取诊断代码：${errorCode}`}>
          <LcosSurfaceFeedback presentation="error" message="材料读取失败，请重试。" onAction={reload} actionLabel="重新读取" /></div> : null}
        {workspaceError && status === 'loaded' && tab === 'project' ? <div className="lcos-assembly-inline-notice">
          <span>现场信息读取失败，材料仍可使用。</span><LcosButton appearance="oreo" variant="ghost" data-lcos-assembly-workspace-retry onClick={reloadWorkspaces}>重试读取现场</LcosButton></div> : null}
        {status === 'loaded' && count === 0 ? <div className="lcos-assembly-empty"><LcosSurfaceFeedback presentation="empty"
          message={filter !== 'all' || query || (tab === 'project' && bay?.warehouseSearch) ? '没有匹配材料，换个条件再试。' : EMPTY_TAB_TEXT[tab]} /></div> : null}
        {tab === 'skills' ? <p data-lcos-assembly-skill-admission="read-only" className="lcos-assembly-inline-notice">技能目录只读，可阅读与预览；当前不提供投放或自动执行。</p> : null}
        {status === 'loaded' ? <AssemblyMasonryView label={`${TAB_LABEL[tab]}材料`}>
          {tab === 'project' ? projectVisible.map((item) => {
            const source = assemblySourceRefOf(item);
            const sourceKey = `${source.kind}:${source.id}`;
            const card = assemblyCardViewV1(item, referencedKeySet);
            const shape = assemblyMaterialShape(item);
            const previewUrl = previewUrlOf(item);
            const mediaProps = { title: item.title ?? '未命名', familyLabel: materialFamily(item), shape,
              fallbackGlyph: <MaterialGlyph item={item} />, referenced: card.referenced,
              ...(previewUrl === undefined ? {} : { previewUrl }),
              ...(item.aspectRatio === undefined ? {} : { aspectRatio: item.aspectRatio }) };
            return <AssemblyItemView key={`${projectId}:${item.kind}:${item.entityRef.id}`} title={item.title ?? '未命名'}
              data-lcos-assembly-item={item.entityRef.id} data-lcos-assembly-item-kind={item.kind}
              data-lcos-assembly-item-species={card.species} data-lcos-assembly-visual-family={item.visualFamily ?? item.kind}
              draggable onDragStart={(event) => beginAssemblyDrag(event, item.entityRef.id, source)} onDragEnd={finishAssemblyDrag}
              selected={selectedIds.includes(sourceKey)} onSelect={() => toggleSelected(source)} referenced={card.referenced}
              hideCaption={shape === 'context' || shape === 'workflow'} identity={<span data-lcos-assembly-kind={item.kind}>{materialFamily(item)}</span>}
              subtitle={item.usedHere ? '已在此处' : item.usageCount > 0 ? `${item.usageCount} 处使用` : (card.subtitle && Object.prototype.hasOwnProperty.call(FAMILY_LABEL, card.subtitle) ? FAMILY_LABEL[card.subtitle as keyof typeof FAMILY_LABEL] : card.subtitle)}
              actions={<><LcosButton appearance="oreo" variant="ghost" data-lcos-assembly-add onClick={() => addToComposer(item)} title="加入当前草稿，不会自动执行"><PlusCircle size={16} aria-hidden />草稿</LcosButton>
                {renderOpenAction(item)}<LcosButton appearance="oreo" variant="secondary" data-lcos-assembly-drop disabled={applyingKey !== null}
                  onClick={() => applySource(source)}><Send size={16} aria-hidden />放入{targetLabel(targetRef)}</LcosButton></>}>
              {item.kind === 'artifact' && !mediaProps.previewUrl && (shape === 'image' || shape === 'text')
                ? <AssemblyArtifactMedia key={`${projectId}:${item.entityRef.id}:${item.updatedAt ?? ''}`} client={artifacts} projectId={projectId} artifactId={item.entityRef.id} {...mediaProps} />
                : <AssemblyMaterialView {...mediaProps} {...(shape === 'workflow' ? { onUse: () => addToComposer(item) } : {})} />}
            </AssemblyItemView>;
          }) : null}
          {tab === 'capture' ? captureVisible.map((item) => {
            const title = captureTitle(item); const shape = captureMaterialShape(item.kind);
            const source = { kind: 'capture' as const, id: item.id };
            const mediaProps = { title, shape, familyLabel: shape === 'image' ? '图片' : shape === 'text' ? '文字' : shape === 'link' ? '网页来源' : '收件材料', fallbackGlyph: <FileText size={24} aria-hidden /> };
            return <AssemblyItemView key={`${projectId}:capture:${item.id}`} title={title} data-lcos-assembly-capture-item={item.id}
              draggable onDragStart={(event) => beginAssemblyDrag(event, item.id, source)} onDragEnd={finishAssemblyDrag}
              selected={selectedIds.includes(`capture:${item.id}`)} onSelect={() => toggleSelected(source)}
              identity={assemblyDate(item.capturedAt)} subtitle={item.resolvedProjectId ? '已保留项目产物' : '待整理'}
              actions={<><LcosButton appearance="oreo" variant="ghost" data-lcos-assembly-preview-open={`capture:${item.id}`} onClick={() => previewCapture(item)}>预览</LcosButton>
                {item.resolvedArtifactId && item.resolvedProjectId === projectId ? <LcosButton appearance="oreo" variant="ghost" onClick={() => openWindow('reader', title, item.resolvedArtifactId)}>阅读已有产物</LcosButton> : null}
                <LcosButton appearance="oreo" variant="secondary" data-lcos-assembly-drop disabled={applyingKey !== null} onClick={() => applySource(source, 'capture')}>放入{targetLabel(targetRef)}</LcosButton></>}>
              {shape === 'image' || shape === 'text' ? <AssemblyCaptureMedia client={session.captureSpace} captureId={item.id} {...mediaProps} /> : <AssemblyMaterialView {...mediaProps} />}
            </AssemblyItemView>;
          }) : null}
          {tab === 'sources' ? resourcesVisible.map((item) => {
            const source = { kind: 'resource' as const, id: item.resourceId };
            return <AssemblyItemView key={item.resourceId} title={item.title} data-lcos-assembly-resource-item={item.resourceId}
              draggable onDragStart={(event) => beginAssemblyDrag(event, item.resourceId, source)} onDragEnd={finishAssemblyDrag}
              selected={selectedIds.includes(`resource:${item.resourceId}`)} onSelect={() => toggleSelected(source)} identity="外部来源"
              actions={<><LcosButton appearance="oreo" variant="ghost" data-lcos-assembly-preview-open={`resource:${item.resourceId}`} onClick={() => previewResource(item.resourceId, item.title)}>预览来源</LcosButton>
                <LcosButton appearance="oreo" variant="secondary" data-lcos-assembly-drop disabled={applyingKey !== null} onClick={() => applySource(source)}>放入{targetLabel(targetRef)}</LcosButton></>}>
              <AssemblyResourceMedia client={session.resources} projectId={projectId} resourceId={item.resourceId} title={item.title} shape="link" familyLabel="来源描述" fallbackGlyph={<FolderOpen size={24} aria-hidden />} />
            </AssemblyItemView>;
          }) : null}
          {tab === 'skills' ? skillsVisible.map((entry) => <AssemblyItemView key={`${entry.source}:${entry.id}`} title={entry.name}
            data-lcos-assembly-skill-item={entry.id} identity={SKILL_SOURCE_LABEL[entry.source]}
            actions={<><LcosButton appearance="oreo" variant="ghost" data-lcos-assembly-preview-open={`skill:${entry.id}`} onClick={() => previewSkill(entry)}>阅读</LcosButton>
              <span data-lcos-assembly-skill-apply="unavailable">不可投放</span></>}>
            <AssemblyMaterialView title={entry.name} shape="skill" familyLabel="技能" fallbackGlyph={<BookOpen size={24} aria-hidden />}
              {...(entry.description ? { excerpt: entry.description } : {})} />
          </AssemblyItemView>) : null}
        </AssemblyMasonryView> : null}
        {tab === 'project' && status === 'loaded' && bay?.warehouseNextCursor !== undefined ? <div className="lcos-assembly-pagination">
          {bay.warehouseErrorCode ? <p role="status">下一页尚未读取，当前材料仍可使用。</p> : null}
          <LcosButton appearance="oreo" variant="secondary" data-lcos-assembly-page-more disabled={bay.warehouseLoadingMore}
            onClick={() => controller.loadMoreWarehouse()}>{bay.warehouseLoadingMore ? '读取中…' : bay.warehouseErrorCode ? '重试加载更多' : '加载更多'}</LcosButton>
        </div> : null}
      </div>
      {selectedRefs.length > 0 ? <div className="lcos-assembly-selection-bar" data-lcos-assembly-selection>
        <span>已选择 <strong>{selectedRefs.length}</strong> 项</span><LcosButton appearance="oreo" variant="ghost" onClick={() => setSelectedIds([])}>取消选择</LcosButton>
        <LcosButton appearance="oreo" variant="secondary" data-lcos-assembly-batch-apply disabled={applyingKey !== null}
          onClick={() => applySources(selectedRefs, tab === 'capture' ? 'capture' : undefined)}>{applyingKey === 'selection' ? '正在装配…' : `放入${targetLabel(targetRef)}`}</LcosButton>
      </div> : <p className="lcos-assembly-browse-hint">拖到目标处使用，也可以用「取用」选择操作。</p>}
    </div>
    {preview ? <AssemblyPreviewView preview={preview} onClose={closePreview} onRetry={() => previewRetry.current?.()} /> : null}
    {applyingKey !== null ? <div className="lcos-assembly-apply-feedback"><LcosSurfaceFeedback presentation="loading" message="正在提交装配，请等待真实回执…" /></div> : null}
    {summary ? <AssemblyReceiptView summary={applyUnconfirmed ? { ...summary, tone: 'unconfirmed', headline: '未收到完整装配回执',
      lines: summary.lines.map((line) => ({ ...line, tone: 'unconfirmed', label: '尚未确认' })) } : summary}
      notice={applyUnconfirmed ? <p>请求可能已到达目标，请先核对原操作。不会自动重发。</p> : undefined}
      onClose={() => { setApplyResult(null); setApplyUnconfirmed(false); }} /> : null}
    {assemblyOwnsComposer && composerTarget !== null ? <section data-lcos-assembly-composer>
      <LcosComposerHost projectId={projectId} {...(composerTarget.workspaceId === undefined ? {} : { workspaceId: composerTarget.workspaceId })}
        anchor={composerTarget.anchor} open inline onClose={closeComposer} />
    </section> : null}
  </div>;
}
