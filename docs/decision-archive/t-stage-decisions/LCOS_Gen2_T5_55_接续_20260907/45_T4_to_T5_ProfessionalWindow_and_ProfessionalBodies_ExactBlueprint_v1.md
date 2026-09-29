# T4 → T5 Professional Window 与专业工作区 Exact Blueprint v1

> 日期：2026-09-07  
> 施工基线：`DZWFLi/LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a`  
> Huabu upstream：`microsoft/Huabu@a3c411e1f655191344285141f08c4738fa6015f7`  
> 性质：`CURRENT SOURCE AUDIT + IMPLEMENTATION BLUEPRINT / NO CODE PATCH`  
> 消费者：T5 视觉与交互规格、后续获批 Sprint 的 T4/T6 实现

## 0. 使用规则

本文每一条都使用以下四级状态，禁止把 donor 或规划写成已接通：

| 标记 | 含义 |
|---|---|
| `CURRENT` | `232b2ca5` 当前源码中真实存在并可定位到 symbol |
| `REUSE` | 当前能力可直接复用，最多加薄 adapter，不复制 truth |
| `PLANNED` | 已形成可施工蓝图，但代码尚不存在，仍需 Sprint Scope 批准 |
| `GAP` | 当前缺 owner、contract、数据链或浏览器证据，不能画成已实现 |

总裁决：

```text
Huabu PreviewWorkspace = mature professional-body donor
Huabu MainLayout       = fixed-column donor, not final topology owner
Gen2 Host Seam         = Canvas integration boundary, not window owner
ProfessionalWindow     = PLANNED; current source has no implementation
Archive browser        = GAP from domain through UI
```

## 1. Blueprint index

| BP | 能力 | 当前状态 | 复用/新增路径 | 关键输出 |
|---|---|---|---|---|
| BP-01 | ProfessionalWindow topology | `PLANNED + GAP` | 新增 `huabu/apps/web/src/lcos/professional/*`；候选 Dockview 8.2.0 | dock/float/split/tab/restore owner |
| BP-02 | Protected Canvas + geometry environment | `PLANNED` | Stage DOM + `ProfessionalWindowEnvironment` | `viewportRect / occupiedRects / safeRect / activeRegions` |
| BP-03 | Canvas → Preview promotion | `CURRENT donor + PLANNED adapter` | `openPreviewNode` + Preview store + identity resolver | 同 entity、同 projection、camera 不跳 |
| BP-04 | Preview body | `CURRENT + REUSE` | `PreviewWorkspace`, `ExpandedNodePanel`, `NodePreviewContent` | tabs、双组、scroll/edit focus |
| BP-05 | Assembly | `backend partial + UI PLANNED` | contracts/Core donor + 新 `lcos/assembly/*` | Source Bay → typed target → apply |
| BP-06 | Workflow / Work View | `legacy donor + canonical GAP` | Presentation/Run donor + 新 canonical owner/body | material/step、detail、run adjacency |
| BP-07 | Skill Builder | `catalog CURRENT + editor PLANNED` | skills typed client + professional body | read/install/compose，能力诚实 |
| BP-08 | Run Review | `adjacent CURRENT + body PLANNED` | RunRecipe/Revision/Checkpoint adapters | Pending Return、Accept/Retry |
| BP-09 | Conversation Scene | `identity CURRENT + body PLANNED` | conversation contracts + Huabu Chat donor | 子画布/阅读/引用/继续对话 |
| BP-10 | Archive browser | `GAP` | domain→schema→service→query→projection→body 全链新增 | 按日浏览、只读、restore |
| BP-11 | Inspector / overlays coexistence | `CURRENT arbitration + PLANNED window contract` | `overlayArbitration.ts` + Stage environment | 单实例 Inspector、Portal overlay |
| BP-12 | Audio / Media region | `Audio node CURRENT + Audio preview GAP` | `AudioNode` + 薄 media controller/adapter | 单播放器 truth、播放连续性 |
| BP-13 | Responsive / restore | `fixed-column CURRENT + topology PLANNED` | MainLayout constraints donor + project-scoped layout | 小窗降级、坏布局 fail-close |

## 2. BP-01 ProfessionalWindow topology

### 2.1 Current / reuse / gap

- `CURRENT` `huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx::MainLayout` 只拥有固定的 `Left | Canvas | Right Preview` 三列、左右 resize/collapse 与 Preview fullscreen。
- `CURRENT` `huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx::CanvasPage` 通过 `rightPanel={<PreviewWorkspacePanel />}` 固定组合 Preview。
- `CURRENT` `huabu/apps/web/src/store/panelStore.ts::PanelState` 保存 right collapse、transient fullscreen、chat focus request。
- `GAP` 当前 `package.json`/lockfile 没有 `dockview`；当前没有 `huabu/apps/web/src/lcos/professional/`。
- `PLANNED` Dockview 只作为 topology implementation detail；T1/T2/T3/T5 不直接 import `DockviewApi`。

### 2.2 Exact planned files / symbols

| 文件 | 动作 | symbol / 职责 |
|---|---|---|
| `huabu/apps/web/package.json` | `PLANNED MODIFY` | 精确加入 `dockview-react@8.2.0`，须重新验证许可与 lockfile |
| `huabu/package.json` | `PLANNED MODIFY` | workspace 版本约束，不使用 Enterprise API |
| `huabu/apps/web/src/index.css` | `PLANNED MODIFY` | 导入 Dockview functional CSS；T5 theme 独立覆盖 |
| `huabu/apps/web/src/lcos/professional/professionalWindowModel.ts` | `PLANNED ADD` | descriptor、body key、restore guard、reserved IDs |
| `.../professionalWindowController.ts` | `PLANNED ADD` | 高层 imperative adapter |
| `.../ProfessionalWindowStage.tsx` | `PLANNED ADD` | 唯一 Dockview owner、renderer registry、geometry producer |
| `.../ProtectedSpatialCanvas.tsx` | `PLANNED ADD` | Canvas child，禁止 close/float/tab merge |
| `.../ProfessionalRegionChrome.tsx` | `PLANNED ADD` | tab/header/actions/drag affordance；不承担 body truth |
| `CanvasPage.tsx` | `PLANNED MODIFY` | Stage 替代固定 right-panel topology |
| `MainLayout.tsx` | `PLANNED RETIRE RIGHT OWNER` | 只保留 app header/left shell；删 Preview-only fullscreen owner |
| `panelStore.ts` | `PLANNED RETIRE FIELDS` | 移除 right/fullscreen topology；保留 search/chat focus 等非拓扑状态 |

### 2.3 State shape

```ts
type ProfessionalRegionBodyKey =
  | 'preview'
  | 'assembly'
  | 'context-evolution'
  | 'context-relationship'
  | 'context-provenance'
  | 'workflow-detail'
  | 'skill-builder'
  | 'run-review'
  | 'conversation'
  | 'archive'
  | 'audio-view'
  | 'web-view'
  | 'pdf-view'
  | 'html-view'

type ProfessionalRegionRestorePolicy = 'project' | 'session' | 'never'

interface ProfessionalRegionDescriptor {
  readonly regionId: string          // presentation identity
  readonly bodyKey: ProfessionalRegionBodyKey
  readonly targetKey?: string        // canonical target ref, not copied entity
  readonly title?: string
  readonly restorePolicy: ProfessionalRegionRestorePolicy
}

interface SavedProfessionalWindowLayoutV1 {
  readonly version: 1
  readonly projectId: string
  readonly dockview: unknown
}
```

Reserved identity：`lcos:spatial-canvas`；常驻共享实例可用 `lcos:preview`、`lcos:assembly`、`lcos:archive`；target-bound 实例用 `lcos:run-review:<runId>`、`lcos:conversation:<conversationId>`。`regionId` 不是 entity ID，也不得使用 `canvasId` 冒充跨 Surface identity。

### 2.4 Controller contract

```ts
interface ProfessionalWindowController {
  open(descriptor: ProfessionalRegionDescriptor): void
  focus(regionId: string): void
  close(regionId: string): void
  float(regionId: string): void
  dock(regionId: string, placement?: DockPlacement): void
  enterImmersive(regionId: string): void
  exitImmersive(regionId: string): void
}
```

Controller 不能复制 panel map、split tree 或 floating bounds；这些只能由 Stage 内部 topology engine 拥有。

### 2.5 Window event sequence

```text
source action
→ controller.open(descriptor)
→ existing region? focus : addPanel(default placement)
→ Stage renderer resolves bodyKey
→ region chrome mounts
→ body receives canonical targetRef + visibility
→ onDidActivePanelChange updates presentation focus only
→ onDidMutateLayout debounce 150–300ms
→ api.toJSON() → project-scoped local layout
→ geometry observer publishes environment
```

Tab drag：body 内语义拖拽与 window drag 必须有显式 handle/activation boundary；不能靠 DOM 猜。Preview 内 tab drag 继续归 `PreviewWorkspace`，professional region tab drag 归 topology owner，正文内 artifact/block drag 永远不得触发 dock overlay。

### 2.6 Dock / float / split / close / immersive

- Dock：默认 Preview 在 Canvas 右侧；其他 body 的首开位置见第 4–10 节。只有贴 Stage 外边缘的 grid region 才算 viewport occupant。
- Float：保留在 `activeRegions` 用于 collision/avoidance，但不缩 `safeRect`。
- Split：允许 horizontal/vertical/N regions；内部 split 不重复扣除 safeRect。
- Close：仅 `removePanel`，不删除 canonical target；重新打开引用原 target。
- Protected Canvas：永远 grid、locked、header hidden、独占 group；无 close/float/tab drag。
- Immersive：grid group 可 maximize；floating region 先记 bounds，移入临时 grid group 再 maximize，退出后恢复原 float bounds。
- Popout：`GAP/OUT OF SCOPE`，即使 donor 支持也不启用。

### 2.7 Failure states

| 失败 | 处理 |
|---|---|
| bodyKey unknown | 丢弃该 region 或替换为明确 Unsupported body；不得白屏 |
| saved version/project mismatch | 忽略布局，seed default |
| Protected Canvas 缺失/浮动/与别的 panel 同组 | 整份布局 fail-close，seed default，不 silent repair |
| float→immersive 中途失败 | 恢复原 bounds；region 进入 `ERROR`，Canvas 保持可用 |
| body load 失败 | chrome 保持可关闭/重试，错误局部隔离 |
| DnD ownership 冲突 | 取消 topology drag，保留 semantic payload，禁止双重 mutation |

### 2.8 Browser acceptance

1. Canvas panel 不能关闭、浮动或拖入 tab group。
2. Preview 首开在右；可拖成 float、左右/上下 split、重新 tab 合并。
3. Close 后 canonical object 不消失；再次打开仍是同 target。
4. Project A/B 切换各自恢复布局，绝不串 topology。
5. 破坏 saved JSON 后刷新回 default layout，Canvas 仍可操作。
6. Region 拖动/resize 期间无 trailing click、无 Canvas pan、无正文 semantic drag。
7. `Esc`：modal/menu → local transient → immersive exit → Canvas 层级，文本输入优先。

## 3. BP-02 Protected Canvas 与 geometry environment

### 3.1 Owner boundary

- `CURRENT` Gen2 `apps/web-gen2/src/host/hostSeam.ts::HostSeam` 与 `integration/huabu/LcosCanvasAdapter.tsx::hostExtensionFromSeam` 只负责 renderer/overlay/recognizer seam。
- `CURRENT` `interaction/overlayArbitration.ts` 已冻结 screen-space overlay 种类和 z-order。
- `PLANNED` `ProfessionalWindowStage` 是唯一几何 producer；Canvas、body、Inspector 不各自计算 safe rect。

### 3.2 Environment shape

```ts
interface ScreenRect {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly width: number
  readonly height: number
}

interface ProfessionalRegionGeometry {
  readonly regionId: string
  readonly mode: 'docked' | 'floating' | 'immersive'
  readonly rect: ScreenRect
  readonly edge?: 'left' | 'right' | 'top' | 'bottom'
  readonly visible: boolean
}

interface ProfessionalWindowEnvironment {
  readonly viewportRect: ScreenRect
  readonly occupiedRects: readonly ScreenRect[]
  readonly safeRect: ScreenRect
  readonly activeRegions: readonly ProfessionalRegionGeometry[]
  readonly isTopologyMutating: boolean
}
```

DOM metadata：

```text
data-lcos-professional-region-id
data-lcos-professional-region-mode="docked|floating|immersive"
data-spatial-viewport-occupant           // only true edge occupant
data-lcos-protected-spatial-canvas
```

### 3.3 Geometry event order

```text
Dockview layout mutation / ResizeObserver / viewport resize
→ rAF batch DOM rect reads
→ determine outer-edge occupants
→ occupiedRects = visible docked edge regions
→ safeRect = viewportRect minus union of edge occupation
→ activeRegions = docked + floating + immersive visible regions
→ publish one immutable snapshot
→ overlays/Inspector/collision consumers reposition
```

Camera rule：window resize/dock/float 只改变可用 screen geometry，不自动 fit、pan 或 rewrite Huabu viewport。`isTopologyMutating=true` 时暂停复杂 edge animation/auto-layout；mutation settled 后也不“补偿”相机。只有用户显式 Focus/Fit 才移动 camera。

### 3.4 Geometry acceptance

1. 右侧 dock 300px 只扣一次 safeRect；其内部再 split 不重复扣。
2. float 越过 Canvas 时 `safeRect` 不变，`activeRegions` rect 连续更新。
3. 连续 resize 30 次，camera transform 数值不变，overlay 无一帧落后。
4. 浏览器缩放、DPR、Windows title bar overlay 下使用 Stage 实际 DOM rect，不写死 viewport。
5. dock 动画过程中 edge/overlay 可降级暂停，但 settled 后位置精确。

## 4. BP-03/BP-04 Canvas → Preview / Work View promotion

### 4.1 Direct reuse inventory

| 状态 | 文件 / symbol | 能力 |
|---|---|---|
| `CURRENT + REUSE` | `store/previewWorkspace/model.ts::PreviewTarget` | `{node,canvasId,nodeId}` / `{chat,canvasId,threadId}` 是唯一 Preview target identity |
| `CURRENT + REUSE` | `model.ts::openTarget` | one-tab-per-target、transient slot、open-to-side |
| `CURRENT + REUSE` | `activateTab/promoteTab/moveTab/closeTab/mergeGroups/setSplitRatio` | 完整内部 tab/group reducer |
| `CURRENT + REUSE` | `store.ts::PreviewWorkspaceState` | canvas-bound workspace、focus/chat one-shot nonce |
| `CURRENT + REUSE` | `PreviewWorkspace.tsx` | dnd-kit tab reorder、两组横向 split、separator pointer/keyboard |
| `CURRENT + REUSE` | `ExpandedNodePanel.tsx` | connected-node navigation、header portal、title edit、preview body |
| `CURRENT + REUSE` | `NodePreviewContent.tsx` / `previews.ts` | Note/Web/PDF/Office/Image/Video/Sketch registry；Audio 当前未注册 |
| `CURRENT + REUSE` | `scrollMemory.ts` | target→viewKey ref counting、scroll remember/restore；仅内存 |
| `CURRENT + REUSE` | `NotePreview.tsx` + `MilkdownEditor.tsx` | rich/raw edit、external reconcile、focus nonce、provenance review |
| `PLANNED ADAPTER` | `openPreviewNode` | 先 ensure/focus professional Preview，再开 target |
| `GAP` | Gen2 canonical identity chain | Artifact/View/ProjectionBinding → Huabu node target 全链尚无 promotion 浏览器证明 |

### 4.2 Exact current Preview state

```ts
type PreviewTarget =
  | { kind: 'node'; canvasId: string; nodeId: string }
  | { kind: 'chat'; canvasId: string; threadId: string }

type CanvasPreviewWorkspace = {
  tabs: Record<string, PreviewTab>
  groups: PreviewGroup[]            // current max 2, horizontal
  activeGroupId: string
  splitRatio: number                // clamp 0.2–0.8
  activationSeq: number
}

type PreviewWorkspaceState = {
  canvasId: string
  workspace: CanvasPreviewWorkspace
  nodeFocusRequest: {tabId:string; nonce:number} | null
  chatOpenRequest: {tabId:string; position:'last-user'|'bottom'; nonce:number} | null
}
```

Current persistence：`localStorage['huabu.previewWorkspace.<canvasId>']`，version 1，最多 50 canvases；仅 tab layout，不存 content。Scroll memory 是运行时 `Map`，刷新不保证保留。

### 4.3 Promotion state proposed

```ts
interface PromotionSnapshot {
  readonly projectId: string
  readonly entityRef: string
  readonly artifactViewId?: string
  readonly projectionBindingId: string
  readonly huabuCanvasId: string
  readonly huabuNodeId: string
  readonly sourceSurface: 'main' | 'context' | 'workflow'
  readonly sourceWorkspaceId: string
  readonly camera: { x: number; y: number; zoom: number }
  readonly selectionIds: readonly string[]
  readonly anchorScreenRect: ScreenRect
  readonly previewScrollKey?: string
  readonly editFocus?: { kind: 'none' | 'body' | 'title'; caretToken?: string }
}
```

该 snapshot 是 presentation/session coordination，不创建第二 Artifact、第二 View 或第二 Markdown store。具体持久化边界需在 Project Session contract 冻结；camera/selection 通常只做 runtime restore token，不进 canonical Project graph。

### 4.4 Event sequence

```text
double-click / Enter / explicit Open
→ resolve canonical entityRef + ArtifactView + ProjectionBinding
→ capture camera + selection + source anchor
→ professionalWindowController.open/focus(lcos:preview)
→ Preview body ready
→ openPreviewTarget({kind:'node', canvasId, nodeId})
→ existing target? activate same tab : create/reuse transient tab
→ explicit edit/double-click/Pin promotes transient tab
→ requestNodeFocus(tabId) only after body mounted
→ NotePreview consumes nonce and focuses Milkdown
```

Close/restore：

```text
settle active editor/save queue
→ remember scroll by stable viewKey
→ close preview tab or region
→ canonical object remains unchanged in identity
→ restore source selection + camera exactly
→ if original projection is missing/stale: focus same entity's surviving projection
→ if none exists: keep Canvas camera and report “原位置不可恢复”，不造假节点
```

### 4.5 Edit and scroll continuity

- `NotePreview` 当前 `MilkdownEditor` mount-once，外部更新通过 reconciliation，不应因 professional tab focus remount。
- `renderer: always` 只给需要 DOM/editor identity 的 Preview；inactive 时必须暂停 video/timer/observer。
- 同一 target 只能有一个 editable authority。Canvas face 为只读；Preview editor active 时不得由 Canvas inline path 静默覆盖。
- current `scrollMemory` 以 viewKey 保存 `scrollTop`；T5 不得把“同 nodeId”视觉误当同 scroll owner，应使用 `node:<canvasId>:<nodeId>` 或未来 canonical projection key。
- tab reorder/split 只移动 presentation container；target、editor instance、scroll key 保持。

### 4.6 Default placement / sizes / responsive

- `CURRENT donor` MainLayout：left min 200/default 260/max 30%；Preview right min 264/default 420；Canvas min 100。这里只是旧三列保护值。
- `PLANNED engineering floor` Preview professional body 最低可用宽度不得低于 264；双组时每组必须满足内容 min-width，否则自动 merge/单组，而不是各压成不可用窄条。
- `T5 TO DECIDE` 正式 default width、chrome 高度、tab density、float min/max、动画曲线。
- 推荐响应场景：`>=1280` 右 dock；`900–1279` 单组右 dock或覆盖式 float；`<900` 单 region immersive/tab switch，禁止 Canvas 与两个 264px Preview group 硬挤。断点是 T5 候选，不是当前冻结值。

### 4.7 Acceptance

1. 同一对象重复打开只激活同 target，不产生重复 canonical View。
2. transient 浏览下一个对象复用原 tab；开始编辑后自动/显式 promote，不被替换。
3. Preview 从右 dock 拖到 float、split、另一个 tab group，Milkdown 内容、undo、caret/selection（能力允许时）不重置。
4. PDF/Office/Web 的 scroll 在 tab 切换和 group move 后恢复；跨 reload 只承诺已冻结的持久化层级。
5. Close 返回后 camera/selection 不跳；原 projection 消失时走诚实降级。
6. Canvas node resize 与 Preview split resize 各自独立，不互写 geometry。

## 5. BP-05 Assembly professional body

### 5.1 Classification

- `CURRENT` `packages/contracts/src/assembly.ts`、Local Core Warehouse/Assembly apply/Capture/Resource/Skill read primitives 存在。
- `CURRENT GAP` web-gen2 尚无 assembly/warehouse/capture/resources/skills 完整 typed clients。
- `CURRENT GAP` Huabu 没有 `lcos/assembly/AssemblyBody.tsx`。
- `PLANNED` Assembly 是一个 Project 共享 professional region，不建第二业务 store；打开位置默认右或下，由 T5 定稿。

### 5.2 Planned files / state

```text
apps/web-gen2/src/backend/assembly.ts
apps/web-gen2/src/backend/warehouse.ts
apps/web-gen2/src/backend/capture.ts
apps/web-gen2/src/backend/resources.ts
apps/web-gen2/src/backend/skills.ts
apps/web-gen2/src/presentation/assemblyApplyPresentation.ts
huabu/apps/web/src/lcos/assembly/AssemblyBody.tsx
huabu/apps/web/src/lcos/assembly/assemblySourceAdapter.ts
huabu/apps/web/src/lcos/assembly/assemblyApplyState.ts
```

```ts
interface AssemblyBodyState {
  readonly activeSource: 'project' | 'capture' | 'resources' | 'skills'
  readonly query: string
  readonly selectedSourceRefs: readonly AssemblySourceRefV1[]
  readonly targetRef: AssemblyTargetRefV1
  readonly requestSnapshot?: AssemblyApplyRequestV1
  readonly phase: 'idle'|'loading'|'ready'|'applying'|'partial'|'failed'
  readonly itemResults: readonly AssemblyApplyItemResultV1[]
}
```

`targetRef` 必须来自打开动作/当前 deep-work target prop，不放进持久业务 Zustand。Apply 开始即冻结 request snapshot；执行中目标变化不偷换 transaction。

### 5.3 Event / failure / acceptance

```text
Open Assembly(targetRef)
→ controller.open(lcos:assembly)
→ per-source independent load
→ select canonical source refs
→ apply freezes source+target snapshot
→ Core validates pathProjectId === body.projectId
→ per-item result
→ UI shows applied / already-member / skipped / failed
→ only truthful allApplied may emit overall success
```

失败：unsupported Skill 不得算成功；placement conflict 必须可见；一个 source service 503 不拖垮其他 tab；partial 可逐项 retry；project switch 取消旧请求。

验收：Main/Context/Workflow/Conversation 打开同一 Assembly region但 target 更新正确；拖出 source 不触发 window drag；Apply 中切 target 不污染请求；close/reopen 恢复 UI preference，不复制 source truth。

## 6. BP-06 Workflow / Work View

### 6.1 Classification

- `CURRENT` `packages/contracts/src/presentations.ts` 有 `WorkflowActionV0/WorkflowActionEdgeV0/WorkflowOperatorV0`，但持久 truth 在 Presentation JSON。
- `CURRENT` Workflow zip import/export、RunRecipe/Revision/Checkpoint 是可复用 migration/adjacent donor。
- `GAP` durable canonical `Workflow` owner、typed APIs、web client、professional bodies。
- `PLANNED` Workflow Surface 管结构；Work View 专业 region 管某一步的深度工作，不把 Workflow 伪装自动化 DAG。

### 6.2 Bodies index

| bodyKey | target | renderer policy | 默认位置 | 状态 |
|---|---|---|---|---|
| `workflow-detail` | `workflowId:stepId` | `always` only when editor identity needed | right | `PLANNED` |
| `run-review` | `runId` | `onlyWhenVisible` unless live stream | bottom/right | `PLANNED` |
| `context-relationship` | entity/ref set | `onlyWhenVisible` | right | `PLANNED` |
| `context-provenance` | entity/revision | `onlyWhenVisible` | right | `PLANNED` |

Workflow state必须区分：Material（仍是 canonical Entity）与 Step（workflow composition identity）；简单顺序使用 Edge；predicate 只是创作文本，未有 runtime proof 时不得画成可执行 condition。

### 6.3 Work View event sequence

```text
select/double-click Workflow Step
→ resolve workflowId + stepId + bound material refs
→ open/focus workflow-detail region
→ body reads canonical workflow projection
→ local edit produces reviewable mutation/change set
→ Run action builds immutable RunRecipe snapshot
→ Run status belongs Bridge/Core
→ pending result opens run-review/Pending Return Zone
→ Accept/Retry produces canonical revision/checkpoint events
```

Failure：legacy `scopeId` identity不得外泄为新 workflow identity；import 必须原子化或明确 partial rollback；focus/membership 不得混用；Bridge unavailable 时保留 recipe draft，不显示 Running。

Acceptance：Surface switch 不卸载 Stage；同 workflow detail 保持 region identity；材料拖到 Step 不弹重复配置表；Run review 与 Workflow body 可 split；close review 不删除 Run/Result。

## 7. BP-07 Skill Builder

- `CURRENT` Skill catalog/read service 是 donor；Assembly Skill apply 当前不支持，必须明示只读/unsupported。
- `PLANNED` `apps/web-gen2/src/backend/skills.ts` 提供 typed list/read；`skill-builder` body 只通过正式 Core capability 写入。
- `GAP` 当前没有 Skill editor schema、validation lifecycle、save/revision browser proof。

State：`skillId? / draftText / sourceLayer / validation / dirty / saving / conflict / readOnlyReason`。打开已有 skill 时 targetKey 稳定；新建 draft 用 session region ID，首次成功保存后绑定 canonical skill ID，不替换 region DOM。

失败：catalog offline、read 404、validation failed、external change/conflict、write capability absent。无写能力时 body 必须 read-only，绝不把本地 textarea 假装已保存。

验收：dirty tab close 有显式处理；project switch 隔离；split/float 不丢 draft；Skill 从 Assembly 打开与直接打开命中同 canonical target。

## 8. BP-08 Run Review professional body

- `CURRENT` Run/Recipe/Revision/Checkpoint/late-result 文件证据存在于 Core/contracts，属于 adjacent capability。
- `PLANNED` `run-review` 专业 body 消费 typed run projection；窗口只持 `runId`。
- `GAP` 当前 Huabu 没有统一 Pending Return/Accept/Retry body。

```ts
interface RunReviewViewState {
  readonly runId: string
  readonly phase: 'queued'|'running'|'waiting_input'|'review'|'accepted'|'failed'|'cancelled'
  readonly selectedArtifactRef?: string
  readonly diffMode: 'result'|'changed-files'|'provenance'
  readonly requestInFlight?: 'accept'|'retry'|'cancel'
  readonly error?: StructuredError
}
```

事件：Run opens/focuses bottom candidate → live events update projection → waiting_input 保留上下文 → review shows Target→Working→Run→Pending Return → Accept 创建受控 Current/Revision → Retry 创建新 Run，旧 Run 不被覆盖。

失败：Bridge disconnect、late result、hash conflict、permission、cancel race 都显示真实 terminal/intermediate state；窗口恢复时先查 canonical Run，不能仅恢复旧 spinner。

验收：关闭/重开仍见同 Run；Accept 前人工 Current 不变；Retry 新旧 Run 可追溯；inactive live panel 降低 polling/animation。

## 9. BP-09 Conversation Scene

### 9.1 Current donors

- `CURRENT` `packages/contracts/src/conversations.ts`：Session、Message、Section、Projection、Import/Search contracts。
- `CURRENT` `conversation-identity.ts::ConversationIdentityChainV1`：ConnectedConversation → Session → Artifact/View 链，可缺席并诚实 unknown。
- `CURRENT + REUSE` Huabu `ChatPanel`、Preview chat target、`questionCompose.ts::enterQuestionConversation`、chat open/scroll request。
- `GAP` LCOS canonical Conversation professional body、child canvas/scene、跨 Surface restore。

### 9.2 Planned body responsibilities

Conversation chrome：标题、连接身份、状态、region actions。Conversation body：message timeline、sections、pinned decisions、file refs、search、composer（只有 capability 允许时）。Child Canvas 是同 Project Canvas 的语义 viewport/scene，不创建第二 Project Canvas。

```text
open Conversation entity
→ resolve identity chain
→ missing hop? render honest disconnected/importing state
→ open lcos:conversation:<conversationId>
→ restore section/message anchor + scroll
→ optional child-scene projection uses same entities
→ composer send goes Receiver/Bridge owner
→ new messages update canonical projection
```

同一会话从 node、search、Run 或 Railway 打开应命中同 target region；Preview chat donor 可保留轻量交谈，深工作 Conversation body 不强迫复用 canvas-bound PreviewWorkspace 作为 project-global DB。

Failure：session未绑定、artifact endpoint 缺失、import parsing/failed、semantic index failed、receiver offline。每个 failure 必须局部显示，不能创建假 conversation。

Acceptance：消息 anchor、scroll、selected decision 在 dock/float/split 后连续；从 Conversation 进入 Assembly 使用 conversation target；Surface switch 后窗口不换身份；project switch 不串会话。

## 10. BP-10 Archive browser

### 10.1 Current truth

`GAP` 当前没有 canonical archive lifecycle field/schema/service/query/event/projection/UI。压缩文件 `visualFamily:'archive'`、导入 zip、late-result 文件留存都不是 Archive 功能。

### 10.2 Required chain before body can be real

```text
domain lifecycle contract
→ SQLite schema + migration
→ archive/restore service with MutationSafety
→ archive-aware active/search/warehouse queries
→ typed ProjectEvent payload
→ projection eligibility and binding retention
→ web-gen2 client
→ ArchiveBody
```

T5 可以设计 body anatomy，但必须标 `GAP`，不能标 CURRENT。建议 state：`dateGroups / entityKinds / query / selectedIds / restoreRequest / perItemResult / coldPreview / error`。Archive 是 read-only cold state；restore 回到同 canonical identity，并按新鲜布局规则重新产生 projection，不恢复陈旧 canvas coordinates 为真相。

事件：Archive mutation → active projection remove/mark ineligible → binding 保留可追溯 → Archive query按日期返回 → select one/batch → preview restore ChangeSet → confirm → atomic/per-item contract执行 → ProjectEvent restored → reconciliation创建 fresh projection。

Failure：跨 project ID、已恢复幂等、原文件 missing、hash conflict、batch partial、migration failure。Batch transaction 语义在 domain 冻结前不能由 UI 猜。

Acceptance：active search默认不混入 archived；Archive search明确显示状态/日期；只读预览不能编辑；restore 不产生新 Artifact ID；失败不出现 active/archived 双真相；按日分组在大量数据下可虚拟化。

## 11. BP-11 Inspector / overlay coexistence

- `CURRENT` `overlayArbitration.ts::visibleOverlays/overlayZ` 定义 screen-space overlay；`work-view` 已作为 overlay kind 占位，但 Professional Window 不应继续实现成普通 overlay。
- `CURRENT` HostSeam keyed overlays 能挂入 Huabu Canvas。
- `PLANNED` Inspector 单实例、默认关闭、屏幕坐标 Portal；局部导航栈；不订阅全部 nodes。

Z-order：Canvas content < node chrome < semantic actions < composer < professional float/immersive < modal。Professional dock 本身参与 layout，不放 Host overlay；float region 的 collision rect来自 environment。Inspector/detail overlay 打开不改变 topology/safeRect，除非产品明确将其 dock 为 professional region。

Esc：modal/menu → local floating toolbar/search → Inspector detail stack → Inspector close → immersive exit → Canvas selection。Text input/editor composition 时 Canvas shortcut 不执行。

Acceptance：Inspector 与右 dock Preview 同时存在，均不遮住各自必须操作区；float 穿过 overlay 时 hit-test owner稳定；节点拖动时 Inspector跟随但不引起全图重渲染；关闭 Inspector 不关闭 professional region。

## 12. BP-12 Audio / Media professional region

### 12.1 Current / gap

- `CURRENT + REUSE` `components/Nodes/audio/AudioNode.tsx::AudioNode` 已有 MediaRecorder、MIME fallback、upload、play/pause、seek、duration workaround、listener/stream cleanup。
- `CURRENT + REUSE` Image/PDF/Office/Video/Web Preview 已注册；PDF/Office/Web 使用 scroll memory。
- `GAP` `previews.ts` 没有 Audio；没有共享 media controller；若 Canvas 与 Preview 各建 `<audio>` 会形成双播放器 truth。

### 12.2 Planned adapter

```text
AudioNode UI
        └── stable AudioPlaybackController(targetRef)
AudioPreviewAdapter
        └── same controller + same resolved source
```

Runtime state：`src / currentTime / duration / paused|playing|buffering|ended|error / volume / playbackRate`。MediaStream、timer、currentTime 不进 Project Graph；canonical truth 只保存 artifact/source/revision metadata。

Promotion：capture current playback state → open `audio-view` or Preview Audio target → bind same controller → hand off media element authority → Canvas face becomes passive mirror → close reverses authority。若浏览器证明无法安全 handoff，Alpha 明确降级为 Focus + Inspector-only，不创建第二播放器。

Visibility：inactive hidden media必须 pause visual timers；是否继续音频由用户意图与 media policy决定，不能因 tab switch 意外停止/双播。Video/Web iframe 同理必须有 visibility hook。

Acceptance：播放中 dock→float→split 不从 0 开始；只有一个 audible source；seek state一致；missing file/relink明确；unmount 后无活 MediaStream/timer/listener；reduced motion 不影响时间精度。

## 13. BP-13 Responsive 与 restore matrix

### 13.1 Scenario matrix

| 场景 | topology 行为 | Canvas | body |
|---|---|---|---|
| Wide desktop | Canvas + right dock，可再 bottom split/float | 不 auto-fit | Preview可双组 |
| Medium | 收窄 side regions、合并内部双组 | camera freeze | 保证最小可用宽度 |
| Narrow | 单一 active professional region immersive 或 tab switch | 保留后台 identity/viewport | 禁止不可用多列硬挤 |
| Window resize | topology constraint重算 | transform不变 | scroll/editor state保持 |
| Project switch | flush/dispose A，restore B | 加载B viewport | B layout only |
| Surface switch | Stage不卸载，Canvas retarget | 同一 Project Canvas semantic viewport | regions保持 |
| Restart | validate saved layout then restore/default | Core恢复 canonical state | ephemeral request清空 |

### 13.2 Restore order

```text
load Project canonical state
→ establish ProjectSession + one Project Canvas
→ mount Stage and Protected Canvas
→ parse SavedProfessionalWindowLayoutV1
→ validate project/version/invariants
→ fromJSON or seed default
→ resolve each descriptor target against current Core
→ missing target becomes local unavailable state, not deleted identity
→ publish geometry environment
→ restore body-local safe UI state
→ enable interactions
```

Project window layout是可丢失 UI preference，可暂存 localStorage；Project Graph、Run、Revision、Checkpoint 不得进入 localStorage。Preview current canvas-bound layout可以作为迁移输入，不能直接宣称 project-global final owner。

## 14. Chrome / body responsibility matrix

| Concern | Professional chrome | Body | Core/Domain |
|---|---|---|---|
| title/icon/active/dirty badge | owner | 提供 descriptor/state | canonical label source |
| close/dock/float/split/immersive | owner | 不直接调用 Dockview | none |
| target content | 不拥有 | render/edit/read | canonical truth owner |
| tab/window drag | owner + explicit handle | 阻止正文 drag 泄漏 | none |
| semantic artifact/block drag | 不拦截为窗口拖拽 | owner | validate/apply |
| loading/error/retry | frame可承载通用壳 | 解释业务错误 | structured error |
| save/conflict | dirty indicator | edit coordinator | revision/hash owner |
| visibility pause | 提供 active/visible | 停 polling/media/observer | none |
| geometry | Stage owner | 只消费 available rect | none |

## 15. T5 必须回填的视觉值

以下不能由 T4 擅自冻结：

1. region chrome 高度、tab高度、icon/dirty/close布局；
2. Preview/Assembly/Workflow/Run/Conversation/Archive 的 default/min/max size；
3. dock drop indicator、float shadow、active/inactive层级；
4. split handle宽度与 hover/focus state；
5. narrow/medium/wide 的最终 breakpoint 与降级动作；
6. body empty/loading/partial/error/readonly/missing-target 关键帧；
7. motion时长、easing、reduced-motion替代；
8. Audio/Media 从 node 到 professional region 的 shared-element 表达；
9. Inspector 与 float window 同屏时的避让/层级；
10. Archive date group、Run Pending Return、Conversation deep-work 的专业身体 anatomy。

T5 回填时必须附状态标签；任何尚未实现的值标 `PLANNED`，不要用成品截图语言暗示 CURRENT。

## 16. Implementation dependency order

```text
A0  冻结 ProjectSession / one Project Canvas / Surface identity
A1  isolated ProfessionalWindow playground + Dockview capability proof
A2  Protected Canvas invariants + geometry environment + camera freeze
A3  Preview migration（只迁 host，保留 PreviewWorkspace内部）
A4  identity promotion/close restore browser proof（先 Note）
A5  Assembly typed clients + body（先修 Core truth conflicts）
A6  canonical Workflow owner + Workflow/Run bodies
A7  Conversation professional body
A8  Audio shared-controller proof
A9  Archive domain-to-UI chain（domain冻结后）
A10 full responsive/restart/project-switch Golden Path
```

Archive、canonical Workflow 与 ProfessionalWindow 都属于重大能力，不得在未获 Sprint Scope 批准时直接施工。

## 17. Consolidated browser acceptance checklist

- [ ] Preview 默认右侧打开但可 dock/float/split/tab move/resize/close/restore。
- [ ] Protected Canvas 永不成为普通 tab、永不 close/float。
- [ ] topology mutation 不改变 camera transform。
- [ ] occupiedRects/safeRect只有一个 producer；float不缩safeRect。
- [ ] Canvas对象→Preview保持 entity/view/projection identity，不生成副本。
- [ ] Note edit focus、caret可实现范围、scroll、undo在移动窗口时连续。
- [ ] Preview内部tab drag、window drag、semantic drag三种手势不串线。
- [ ] Assembly partial/unsupported/placement failure不显示假成功。
- [ ] Workflow Material与Step不混；Run result在Accept前保持Pending。
- [ ] Conversation identity chain缺失时诚实显示，不造假会话。
- [ ] Archive restore回到同canonical ID，失败无双真相。
- [ ] Inspector Portal与professional region独立关闭、正确层级。
- [ ] Audio只有一个播放authority，窗口移动不双播/重播。
- [ ] inactive media/iframe/polling正确暂停或按政策继续。
- [ ] narrow viewport不挤出不可操作多列；文本输入优先快捷键。
- [ ] Project A/B layout不串；坏layout fail-close；restart恢复真实Core状态。

## 18. Exact source evidence map

| 证据 | 结论 |
|---|---|
| `huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx::CanvasPage` | current fixed composition owner |
| `huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx::MainLayout` | current fixed columns/resize/fullscreen donor |
| `huabu/apps/web/src/store/panelStore.ts::PanelState` | current right-panel presentation state，未来部分退休 |
| `huabu/apps/web/src/store/previewWorkspace/model.ts` | current Preview topology reducers/identity |
| `.../store.ts::PreviewWorkspaceState` | current canvas-bound state/focus requests |
| `.../persistence.ts` | current localStorage v1/50-canvas layout persistence |
| `.../scrollMemory.ts` | current runtime scroll identity/memory |
| `components/Panels/PreviewWorkspace/PreviewWorkspace.tsx` | current internal DnD/two-group split |
| `components/Panels/ExpandedNodePanel/ExpandedNodePanel.tsx` | current deep preview frame/header/navigation |
| `components/Nodes/NodePreviewContent.tsx` + `previews.ts` | current renderer registry；Audio absent |
| `components/Nodes/note/NotePreview.tsx` | current rich/raw edit/provenance/focus/scroll |
| `components/Milkdown/MilkdownEditor.tsx` | current editor mount/reconcile contract |
| `components/Nodes/audio/AudioNode.tsx` | current functional audio node，非 professional preview |
| `apps/web-gen2/src/host/hostSeam.ts` | current renderer/overlay/recognizer seam |
| `apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx` | current React/Huabu adapter |
| `apps/web-gen2/src/interaction/overlayArbitration.ts` | current overlay priority/arbitration |
| `packages/contracts/src/conversations.ts` | current Conversation contracts |
| `packages/contracts/src/conversation-identity.ts` | current identity bridge |
| `packages/contracts/src/presentations.ts` | current legacy Workflow/Presentation donor |
| `packages/contracts/src/run-assembly.ts` / `revision-workflow.ts` | current Run/Revision adjacent truth |
| `packages/contracts/src/assembly.ts` | current Assembly contract donor |

## 19. Final handoff judgment

T5 现在可以直接消费本文建立窗口拓扑与全部专业 body 的视觉状态体系，但必须保留三条红线：

1. Preview mechanics 是 `CURRENT/REUSE`；完整 ProfessionalWindow 是 `PLANNED`，不是现成功能。
2. Archive 是 domain-to-UI 全链 `GAP`；Audio professional Preview 也是 `GAP`。
3. 所有 Work View 只是一种 projection/presentation，canonical Entity、Artifact、Workflow、Run、Conversation truth 仍由 Core/Domain 拥有。

本文件只形成施工蓝图和 T5 输入，不修改仓库源码，也不授权进入未批准 Sprint。
