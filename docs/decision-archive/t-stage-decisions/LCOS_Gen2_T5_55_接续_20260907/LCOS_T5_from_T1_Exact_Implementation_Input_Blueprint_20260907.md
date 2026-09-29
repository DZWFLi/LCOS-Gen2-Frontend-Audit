# LCOS Gen2 · T5 ← T1 全范围视觉施工 Exact Implementation Input Blueprint

> **用途**：T5 视觉施工直接输入，不是产品讨论稿，不是 Mock 规范，不是 T1 最终 04/05/99 的替代品。  
> **日期**：2026-09-07  
> **LCOS Gen2 baseline**：`232b2ca5`  
> **Huabu upstream baseline**：`a3c411e1f655191344285141f08c4738fa6015f7`  
> **消费方**：T5 Visual / Morphology / Motion  
> **提供方**：T1 Spatial Presentation / HUD / LOD / Layout  
> **最高产品基线**：`LCOS_Gen2_PhaseB_四路合并_最终跨线程裁决稿_20260906.md`  
> **原则**：已冻结语义只消费，不重开；Huabu 机械 owner 不复制；Gen1 只收不可替代行为；Spatial donor 只作行为/手感证据；T1 只增 thin seam。

---

# 0. 这份蓝图怎么读

每个条目都用四种状态之一：

| 状态 | 含义 |
|---|---|
| `CURRENT` | 当前 Gen2 / Huabu 已存在，T5 可以把它当真实 host/mechanic 输入 |
| `REUSE` | Gen1 / Huabu / donor 中已有成熟行为或 primitive，应该迁移/复用，但不能假称已经接入 |
| `PLANNED` | Phase B 已闭合、T1/T4/T3 source plan 已明确应新增的 thin seam；尚未证明落到当前 baseline |
| `GAP` | 当前没有足够 source 证明，或算法/数值尚未确定；T5 不得自己补成“已实现” |

额外标签：

- `SUPERSEDED_CURRENT_CODE`：代码还在，但产品规则已被 Phase B 覆盖，施工必须迁移。
- `REFERENCE_ONLY`：Spatial / TapNow / Lovart 等只能作为行为、视觉或交互参考。
- `UNSPECIFIED`：尺寸、阈值、时序没有可靠证据，T5 可以设计候选，但不能写成工程既定值。

---

# 1. Owner 总图：T5 只能在这些边界内做视觉

```text
Project Truth / Canonical semantics
  ├─ T6 / Core
  │   Collection identity + membership
  │   Archive lifecycle
  │   Colony membership commit
  │   Entity / Revision / Relation
  │
  ├─ T3
  │   pointer grammar
  │   left-drop / right-drag intent
  │   click/dblclick/right-click semantics
  │
  ├─ T4
  │   ProjectSession
  │   ProfessionalWindowEnvironment
  │   occupiedRects / safeRect / activeRegions
  │
  ├─ T1
  │   presentation state mapping
  │   LOD owner
  │   screen-space HUD/identity geometry
  │   Collection host display/layout manifestation
  │   Colony contour/peel/rescope spatial manifestation
  │   local settle / neighbor retreat policy
  │   Archive restore arrival geometry
  │   camera-preservation host policy
  │
  ├─ Huabu
  │   node geometry
  │   ReactFlow camera/viewport
  │   selection
  │   resize
  │   drag
  │   snap
  │   frame/container mechanics
  │   screen/world transforms
  │   MiniMap base
  │   floating anchor mechanics
  │
  └─ T5
      visual anatomy
      material
      morphology
      transition choreography
      state appearance
      density appearance
      motion tuning
```

**T5 禁止新造**：

- 第二套 Camera；
- 第二套 Selection；
- 第二套 LOD runtime；
- 第二套 node geometry；
- 第二套 `safeRect` store；
- 第二套 Collection membership；
- 第二套 Colony contour truth；
- 第二套 Markdown / Outline truth；
- Work View / Preview 独立对象副本；
- `instanceId` 解决同 canvas 重复投影；
- 为视觉方便把 Archive x/y 持久化回来。

---

# 2. Source Authority Ledger

## 2.1 Huabu current / upstream

### `huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

**状态**：`CURRENT`

已确认机械 owner：

- ReactFlow canvas；
- `MiniMap`；
- `flowToScreenPosition` / viewport geometry；
- `SelectionOutlines`；
- `MultiSelectResizer`；
- `SnapGuidesOverlay`；
- `StructuredDropOverlay`；
- `FrameFitPreviewOverlay`；
- `anchorViewportCentre`；
- fit/reveal primitives；
- ResizeObserver 对 wrapper resize 做 camera compensation。

**Phase B 冲突**：

current ResizeObserver 的“wrapper resize → 保持 viewport center → `setViewport(... duration:0)`”与 D15 冲突。LCOS Professional Window resize 必须不动 Camera。

**T5 结论**：

- 当前视觉不能假设右侧/底部专业窗口打开会自动把节点拉回中心；
- T5 动画不得依赖这种 current compensation；
- explicit Focus 仍可以移动 Camera。

---

### `huabu/apps/web/src/components/Panels/Canvas/FloatingToolbars/NodeFloatingToolbar.tsx`

**状态**：`CURRENT / REUSE`

已确认：

```text
useInternalNode(id)
→ positionAbsolute
→ style.width/height preferred
→ measured width/height fallback
→ takeover/collapse uses blendedMarkRect(mark)
→ CanvasFloatingPopover
   offset = 12
   side = top
```

这是 Action Arc、Compact Composer、局部 popover 的可靠 anchor primitive。

**有证据尺寸**：

- `offset = 12px`

**T5 可做**：

- 设计 body、material、motion；
- 依赖 node real rect anchor；
- selected/takeover 时保持连续锚点。

**T5 不做**：

- 自己 `getBoundingClientRect` 重新算节点 anchor；
- 自己写 viewport transform；
- 把 `NodeFloatingToolbar` 整体视觉照搬成 LCOS Action Arc。

---

### `huabu/apps/web/src/components/Panels/Canvas/FrameNode.tsx`

**状态**：`CURRENT`

已确认 layout modes：

```ts
free | column | row | grid
```

默认 `free`。

**未确认 / 不存在**：

- Collection canonical collapse；
- Collection many-to-many membership；
- LCOS collapsed semantic target。

因此 Collection host 要 thin seam，不得把 FrameNode 直接称为“Collection 已实现”。

---

### `huabu/apps/web/src/container/mutation.ts`

**状态**：`CURRENT / REUSE`

关键 mechanical primitive：

- `moveNodeIntoContainer`
- 对应 move-out
- 通过坐标换算维持 absolute world position

**T5 含义**：

expanded Collection 左 drop 成功后，若 T1/T3/T6 决定当前 authoritative projection 要进入 host，可复用 Huabu parent mutation；视觉不需要 invent “瞬移到容器中心”。

---

## 2.2 Gen2 current

### `apps/web-gen2/src/spatial/projectionBinding.ts`

**状态**：`CURRENT`

关键 invariant：

```text
key = projectId | canvasId | spatialKind | entityType | entityId
```

无：

```text
instanceId
geometry
screenRect
```

**T5 绝对约束**：

同 canonical entity + 同 canvas + 同 spatial kind：

> 只有一个 authoritative projection。

其它视觉只能是：

```text
proxy / reference / preview / mirror
```

而不是第二个真实节点。

---

### `apps/web-gen2/src/spatial/nodePresentation.ts`

**状态**：`CURRENT`

当前 LOD/density：

```ts
mark | summary | working | reading
```

已确认原则：

- screen-space size 由 world geometry × zoom 派生；
- DPR 不另设第二 LOD owner；
- editing 至少强制到 `working`；
- 当前阈值属于 provisional，不应被 T5 当最终视觉冻结。

**T5 结论**：

所有 species 的 semantic zoom 都必须映射到这一套 owner，不允许 Image/Document/Note 各跑自己的 zoom thresholds。

---

### `apps/web-gen2/src/spatial/rendererRegistry.ts`

**状态**：`CURRENT / INCOMPLETE`

已出现 renderer family，例如：

```text
lcos/entity
lcos/conversation
lcos/instrument
lcos/external-file
```

但现有 registry / proof renderer 不能冒充最终 species morphology。

**T5 必须按**：

```text
renderer registration exists
≠ visual anatomy completed
```

来施工。

---

### `apps/web-gen2/src/interaction/semanticDropMachine.ts`

**状态**：`CURRENT MECHANIC / SUPERSEDED DESTINATION TAXONOMY`

有证据数值：

| 参数 | current value | 是否可直接作为 Phase C 最终语义 |
|---|---:|---|
| `dwellMs` | `420ms` | 只能作为 current mechanic 证据 |
| `dwellBand` | `56` | 同上 |
| `dwellRadius` | `10` | 同上 |
| `cancelDistance` | `16` | 同上 |
| `edgeScrollBand` | `128` | 同上 |

current destination 仍是 Phase-A 的：

```text
slot + left/bottom
```

Phase B D03/D04 已覆盖 destination meaning。

**T5 使用规则**：

- 可以参考 current dwell/cancel feedback 节奏；
- 不能把 `left/bottom slot` 画成最终 Collection / remote target 语法；
- 不能因为 current 有 420ms 就认为所有 drop target 都必须 dwell 420ms。

---

### `apps/web-gen2/src/interaction/overlayArbitration.ts`

**状态**：`SUPERSEDED_CURRENT_CODE`

current：

```text
workViewOpen → only work-view
```

Phase B 已关闭。

**T5 禁止设计**：

- 打开 Work View 后整张 canvas HUD 全消失；
- 一个 Professional Window 独占所有 overlay；
- “只能有一个 Work View”。

---

# 3. T1 → T5 内容节点统一 visual anatomy

这部分是 T5 第一优先级。

---

# 4. Universal Node State Board

T5 所有 Image / Note / Markdown Document 都必须使用同一机械状态框架。

## 4.1 统一状态 shape

> 下面是 **T1 PLANNED thin seam shape**，不是宣称 current 已有同名 type。

```ts
export type T1NodeInteractionPhase =
  | 'rest'
  | 'hover'
  | 'selected-single'
  | 'selected-multi'
  | 'resizing'
  | 'editing'
  | 'dragging'
  | 'drop-receptive'
  | 'focused';

export interface T1NodePresentationInput {
  readonly projectionKey: string;
  readonly nodeId: string;
  readonly family: 'image' | 'note' | 'markdown' | 'other';
  readonly density: 'mark' | 'summary' | 'working' | 'reading';
  readonly phase: T1NodeInteractionPhase;
  readonly explicitMode?: 'text' | 'outline' | 'mindmap';
  readonly expanded?: boolean;
  readonly archived?: boolean;
  readonly screenRect: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}
```

T5 可以直接围绕这些 state 做状态板，不必等 T1 最终 type 名称完全一致。

---

## 4.2 通用 state contract

### REST

**状态**：`CURRENT mechanical / T5 visual`

Before：

- node 有 Huabu world geometry；
- renderer 由 binding/entity metadata 决定；
- density 由 T1 owner 决定。

During：

- 不出现永久 controls；
- 内容本体是第一视觉主体。

After：

- 无 mutation。

Failure：

- renderer 未识别时用 honest fallback；
- 不用 mock body 冒充真实内容。

Reduced motion：

- 无特殊 motion。

---

### HOVER

**状态**：`CURRENT host event / T5 visual`

Before：

- rest。

During：

- 允许轻量 affordance；
- 不改变 canonical state；
- 不改变 geometry；
- 不自动 promotion。

After：

- pointer leave → rest，除非进入 selected/editing/drop。

Failure：

- tooltip/popover 失败不得影响 node drag/selection。

Reduced motion：

- 只允许 opacity/material变化或非常小的无位移反馈；
- timing `UNSPECIFIED`。

---

### SELECTED · SINGLE

**状态**：`CURRENT Huabu mechanical / T5 visual`

Canonical invariant：

- selection 是 Surface-local ephemeral；
- 选中 aggregate 不自动选中成员。

During：

- Huabu owns selection outline/handles；
- Action Arc / Compact Composer 可锚到真实 node rect；
- family visual 可以增加 selected emphasis，但不要再画第二套 selection ring。

After：

- deselect → base morphology；
- explicit action 可进入 editing/focus/work view。

Failure：

- popover body crash 不得丢 selection。

Reduced motion：

- selection change 不要求位移动画。

---

### SELECTED · MULTI

**状态**：`CURRENT Huabu mechanical / T5 visual`

During：

- `MultiSelectResizer` / selection hull 由 Huabu；
- 单节点局部工具应降噪；
- 不把每个 node 都画成 single-selected 的完整 toolbar。

Canonical invariant：

- multi-selection 只是 Surface-local selection；
- 不等价 Collection；
- 不等价 Colony membership。

Failure：

- 某一节点 renderer 错误不影响整体 selection hull。

---

### RESIZING

**状态**：`CURRENT Huabu mechanical + T1 LOD`

Before：

- selected node；
- Huabu real geometry 为 authoritative。

During：

- resize handle / snap feedback由 Huabu；
- T1 density 可降到可承受等级；
- content renderer 不应每像素启动重型 parser/viewer；
- editing draft 不销毁。

After：

- Huabu commit geometry；
- T1 根据最终 screen-width settle 到正确 density；
- species renderer更新内容层级。

Failure：

- content fit 失败不 rollback Huabu geometry；
- 不产生第二 size truth。

Reduced motion：

- resize geometry本身跟手，不做额外 tween。

---

### EDITING

**状态**：`CURRENT LOD override / Gen1 REUSE behavior / Gen2 content path PLANNED`

Canonical invariant：

- editing 至少 `working`；
- 文本 editing 只写 canonical Markdown；
- Image 一般没有正文 editing，进入 metadata/annotation/Work View 时仍不改 image geometry owner。

During：

- pointer ownership切给 editor；
- node drag/branch drag不得抢文本选择；
- IME composition 不触发保存/结构 command。

After：

- save成功 → canonical revision更新；
- face/layout保持同一 projection；
- cancel → 保留 old canonical snapshot。

Failure：

- revision conflict 保留 draft；
- 不 last-write-wins。

Reduced motion：

- editor attach/detach 可立即；
- 不依赖缩放动画表达“已进入编辑”。

---

### DRAGGING

**状态**：`CURRENT Huabu mechanical / T3 grammar`

During：

- Huabu owns physical node drag；
- T5 可以做 lift/material/ghost状态；
- semantic target cue来自 T3/T1 seam；
- node content不重建重型 viewer。

After：

- 普通位置移动 → Huabu geometry；
- left-drop / right-drag target → 按 D03/D04 语义；
- source projection stay/move规则由 target语义决定。

Failure：

- canonical mutation失败 → source geometry按 operation contract恢复/保持；
- preview cue清理。

Reduced motion：

- pointer tracking仍实时；
- release settle可以瞬时到同一最终 geometry。

---

### DROP-RECEPTIVE

**状态**：`CURRENT lifecycle / destination PLANNED`

During：

- target 显示“我可以接收”的局部结构 cue；
- 不提前把 source 真的挪进去；
- remote / visible host / relation target 必须视觉可区分；
- current `left/bottom` taxonomy 不再作为最终图形。

After：

- commit success 再进入真实 membership/geometry变化；
- right-drag Collection source不移动。

Failure：

- cue立即撤销；
- canonical membership不得因为 presentation failure被回滚，除非 canonical command本身失败。

Reduced motion：

- cue可以用静态 outline/material变化；
- dwell不是必须靠动画进度条表达。

---

### FOCUSED

**状态**：`CURRENT explicit camera intent + Spatial REFERENCE`

Canonical invariant：

- Focus 是显式动作，允许 Camera移动；
- Professional Window open/resize本身不能移动 Camera。

During：

- target 提升视觉权重；
- Spatial donor有观察证据：目标 dominate，邻居退让/降权；
- exact neighbor displacement solver尚未证明。

After：

- focus结束可以保留 camera；
- node world geometry不因为单纯 focus 被持久修改，除非 explicit layout action。

Failure：

- 找不到 current projection → resolve live / fail-close；
- archived target → archive viewer，不自动 restore。

Reduced motion：

- Camera仍可直接跳到目标；
- 邻居可只做 opacity/weight，不做大位移。

---

# 5. Image Node · Exact Implementation Input

## 5.1 Source status

### Huabu

- geometry / selection / resize / drag：`CURRENT`
- floating anchor / screen rect：`CURRENT`
- image species final LCOS morphology：`PLANNED / T5`

### Gen1 donor

`src/features/canvas/CanvasNodeVisual.tsx`

已恢复：

```ts
type FileIdentity =
  | 'image' | 'video' | 'audio' | 'pdf'
  | 'ppt' | 'markdown' | 'link' | 'archive' | 'file'
```

`CanvasNodeVisual` 根据 family 分流。

历史 source/audit 证明 Image branch 是 Gen1 最成熟 content family，具备：

- image-first anatomy；
- loading / ready / error；
- retry；
- skeleton；
- OCR adjunct。

**状态**：`REUSE BEHAVIOR`, not current Gen2.

---

## 5.2 Canonical invariant

```text
Artifact/Revision/File truth
≠ image viewport truth
≠ Huabu node geometry
```

T5 不把 crop/pan/preview transform 存成第二 node geometry。

---

## 5.3 Anatomy

### MARK

`CURRENT density owner / T5 visual`

最小要求：

- image identity清楚；
- 不启动 full image viewer/OCR重模块。

Exact size：`UNSPECIFIED`.

### SUMMARY

- thumbnail / primary image signal；
- title/identity可读；
- error/loading诚实。

### WORKING

- image本体占主视觉；
- selection、drop、reference affordance可工作；
- OCR若显示，应是 secondary overlay/derived info，不盖住主体。

### READING

- 大图/preview promotion；
- 可以进入 Preview/Professional Window；
- 仍是同 canonical entity/projection intent。

---

## 5.4 Image state board

| phase | before | during visual | after | failure |
|---|---|---|---|---|
| rest | resolved image | image-first | same | fallback |
| hover | rest | light affordance | rest | no effect |
| selected-single | rest | Huabu selection + local controls | selected | control failure isolated |
| selected-multi | multi set | suppress per-node chrome | same | isolated |
| resizing | selected | image scales/clips by host policy; no new geometry owner | recompute density | preview failure ≠ geometry failure |
| editing | N/A for pixels | metadata/annotation/work view only | canonical metadata save | preserve original |
| dragging | world node | lift/drag body | geometry/membership result | clear preview |
| drop-receptive | target | target cue only | commit | cue clears |
| focused | any | target dominates | keep projection | fail-close |
| error | load fail | honest unavailable/error | retry success | no fake thumbnail |

---

# 6. Note Node · Exact Implementation Input

“Note”这里必须区分：

1. anchored/Core annotation Note；
2. managed Text/Markdown Artifact。

Gen1 已经开始把 managed Markdown 归入 document family，而 anchored note 保留 note anatomy。T5 不应再把所有文本都画成同一种“便签卡”。

---

## 6.1 Canonical invariant

Anchored Note：

```text
Note body + anchor = truth
```

Managed Markdown：

```text
Artifact current Revision body = truth
```

不要把 `noteOutline` 当第二 truth。

---

## 6.2 Gen1 anatomy donor

Exact source：

```text
src/features/canvas/CanvasNodeVisual.tsx
NodeVisualFamily
NoteObject
TextPreview
```

历史审计证据：

- note 有大纲引导线/文本方向；
- expanded能展示更多真实行；
- 不是纯 icon；
- hover/selected使用统一 node interaction shell。

**状态**：`REUSE`, not final T5 styling.

---

# 7. Markdown Document · Exact Implementation Input

这是内容节点最重要部分。

---

# 8. Gen1 InlineNoteEditor 完整恢复

Exact source：

```text
src/features/ui/InlineNoteEditor.tsx
```

## 8.1 `measureNodeRect`

```ts
function measureNodeRect(nodeId: string): DOMRect | null
```

Gen1：

```text
query [data-testid="canvas-node-${nodeId}"]
→ getBoundingClientRect()
```

用途：

- 编辑层覆盖节点真实 screen rect；
- camera/focus/zoom变化时 editor跟着 node走。

### Gen1 实际跟随方式

`useLayoutEffect` + RAF：

```text
每帧测 node rect
差异 < .5px → 不更新
否则 setRect
```

**状态**：`REUSE BEHAVIOR / RETIRE MECHANISM`

Gen2/Huabu 不应继续每帧全局 DOM query。应消费 Huabu internal node + screen transform / floating anchor primitive。

T5 视觉上可以依赖：

> editor 与真实 projection 矩形连续贴合。

但不能依赖：

> T1 会复制 Gen1 的 RAF DOM polling。

---

## 8.2 块级 contentEditable

Gen1 exact：

```tsx
<div
  className="inline-note-editor-area"
  contentEditable
  role="textbox"
  aria-multiline="true"
/>
```

**状态**：`REUSE BEHAVIOR`

不是 textarea，也不是 Markdown source editor。

---

## 8.3 Line type

```ts
type LineType = 'p' | 'h1' | 'h2' | 'h3' | 'li'
```

T5 可直接做视觉 anatomy：

- paragraph；
- H1；
- H2；
- H3；
- list item。

---

## 8.4 Markdown → block DOM

Exact Gen1 symbol：

```ts
markdownToHtml(md)
```

规则：

```text
每行 = 一个 top-level div
data-t = p / h1 / h2 / h3 / li
data-indent = 两空格一级
indent clamp = 6
```

解析：

```text
#    → h1
##   → h2
###  → h3
-/*  → li
other→ p
```

Inline：

```text
**bold**    → <b>
==highlight== → <mark>
```

**状态**：`REUSE PURE BEHAVIOR`

---

## 8.5 block DOM → Markdown

Exact Gen1 symbol：

```ts
readMarkdown(root)
```

规则：

```text
data-indent n → "  " * n
h1 → "# "
h2 → "## "
h3 → "### "
li → "- "
b/strong → **...**
mark → ==...==
```

**状态**：`REUSE PURE BEHAVIOR`

Gen2 必须改为 canonical revision write path，不能把 DOM serializer结果留在 presentation-only memory。

---

## 8.6 normalization

Exact：

```ts
normalizeBlocks(root)
plainTitleLine(line)
blockOf(node, root)
```

行为：

- stray text / BR 包回 block；
- 删除空 `<b>` / `<mark>`；
- title extraction剥 heading/list/inline markers；
- caret block从 `data-t` 顶层块解析。

---

## 8.7 toolbar actions

有 source 证据：

- Bold；
- Highlight；
- H1；
- H2；
- H3；
- List；
- Mindmap convert入口。

**状态**：`REUSE CAPABILITY`

T5 不必保留相同常驻 toolbar形态。产品已冻结“内容本体直接操作 + transient controls”。

---

## 8.8 keyboard exact evidence

### 已证明

```text
Esc
→ cancel

Cmd/Ctrl + Enter
→ save

Cmd/Ctrl + B
→ toggleInline('b')

Cmd/Ctrl + G
→ toggleInline('mark')

Tab
→ adjustIndent(+1)

Shift+Tab
→ adjustIndent(-1)

Backspace on empty block with previous sibling
→ remove current block
→ caret to previous block end

Enter
without Shift/Meta/Ctrl
→ insertLine()
```

### Paste

- plain text only；
- single line直接插入；
- multiline拆为多个 block。

---

## 8.9 `# / ## / ### / - + Space` 快捷转换

**状态**：`GAP / NOT PROVEN IN RECOVERED GEN1 SOURCE`

这点必须特别写死，避免 T5/施工代理把用户要求和“旧源码实际存在”混成一件事。

当前追回源码证明：

- `markdownToHtml` 能识别这些 Markdown prefixes；
- toolbar能把当前块改为 H1/H2/H3/list；
- Tab/Shift+Tab、Enter、Backspace存在。

**但尚未找到**：

```text
用户在空块输入 "# " 后立刻转换 H1
输入 "## " → H2
输入 "### " → H3
输入 "- " → list
```

因此 T5 可以把它列为应补 capability，但 engineering status必须写：

```text
PLANNED BEHAVIOR
CURRENT IMPLEMENTATION = GAP
```

不能标成“Gen1 已完整恢复”。

---

# 9. Gen1 Mindmap 同源切换恢复

## 9.1 Old data shape

Gen1：

```text
noteLayout: 'text' | 'mindmap'
noteBody
noteOutline
```

Exact evidence来自：

```text
InlineNoteEditor
notePresentationMemory.ts
runtimeBridge
```

旧 editor：

```ts
const mindmap = node.noteLayout === 'mindmap'
const raw = mindmap
  ? (node.noteOutline || node.noteBody || '')
  : (node.noteBody || '')
```

这证明 Gen1 有同一节点 face切换体验，但实现上保留了双 truth 风险。

---

## 9.2 Gen2 migration ruling

| Gen1 field | Gen2处理 | status |
|---|---|---|
| `noteLayout` | presentation preference | `REUSE` |
| `noteBody` | canonical Markdown body / Core revision content | `REUSE CONCEPT` |
| `noteOutline` | 不再作为 durable second truth | `RETIRE` |
| `noteBodyRevisionId` | canonical revision snapshot | `REUSE CONCEPT` |
| collapsed topic state | session/presentation | `PLANNED` |

**Canonical invariant**：

> Text / Outline / Mindmap 是同一 canonical Markdown 的不同 face，不是三个同步对象。

---

# 10. `outlineTree`

Exact Gen1 source：

```text
src/features/canvas/outlineTree.ts
```

Recovered symbols：

```text
OutlineNode
parseOutline
serializeOutline
extractOutlineBranchText
```

**状态**：`REUSE PURE DONOR`

Gen1 parser面向缩进大纲。Gen2如果 canonical是 Markdown，需要 Markdown AST/heading adapter；不能直接把每一行正文都当 topic。

---

# 11. `MindMapNoteVisual`

Exact source：

```text
src/features/canvas/MindMapNoteVisual.tsx
```

Recovered reusable symbols：

```text
textDisplayWidth
ellipsizeByWidth
MindMapPlacement
MindMapMetrics
mindmapLayout
mindmapContentSize
mindmapNodeSize
pruneCollapsed
MINDMAP_ROOT_ID
MINDMAP_IMMERSIVE
```

### 已证明的布局思想

- root居中；
- 一级分支左右均衡；
- subtree垂直堆叠；
- parent对齐子跨度中心；
- collapse保留节点、剪子孙；
- natural size可以由内容测得。

**状态**：`REUSE PURE ALGORITHM / T5 VISUAL REMAKE`

### 明确不迁

```text
window CustomEvent
LCOS_MINDMAP_BRANCH_EXTRACT_EVENT
document.createElement ghost
旧 CanvasNode geometry
旧 screen→world math
旧 card CSS
```

---

# 12. `MindMapEditor`

Exact source：

```text
src/features/ui/MindMapEditor.tsx
```

Recovered tree operations：

```text
updateText
addChild
addSibling
removeNode
liftNode
```

Recovered keyboard：

```text
Shift+Tab
→ lift selected node

Tab
→ add child
→ select child
→ enter edit

Enter
→ add sibling
→ enter edit

Delete / Backspace
→ remove selected non-root
```

Edit flow：

```text
startEdit
commitEdit
save
```

save：

```text
serializeOutline(roots)
→ onSave({title, body})
```

**状态**：`REUSE BEHAVIOR`

---

## 12.1 双击编辑

旧 mindmap visual/editor存在直接 topic editing心智，但本轮 exact snippet没有重新钉到具体 dblclick handler行。

状态：

```text
REUSE PRODUCT/BEHAVIOR EVIDENCE
EXACT HANDLER = PARTIAL
```

T5 可以设计 direct topic edit，不应设计“先打开属性表”。

---

## 12.2 移动 / reparent

当前恢复 source明确证明：

- add child；
- add sibling；
- lift；
- delete；
- edit。

**没有足够 exact source证明**旧 editor已具备成熟 drag reparent任意移动。

状态：

```text
GAP / NEED NEW THIN CONTROLLER
```

不要把“MindMapEditor存在”扩写成“完整拖拽移动已经实现”。

---

## 12.3 折叠

`MindMapNoteVisual.pruneCollapsed` 证明 visual fold primitive存在。

但是 fold state owner / editor交互在本轮 source没有完整钉死。

状态：

```text
REUSE VISUAL ALGORITHM
PLANNED SESSION STATE
```

---

# 13. 正文 ↔ 导图双向回写：T1/T5 最终 implementation contract

T5 应按这个视觉/交互事实设计：

```text
Canonical Markdown
   ↓ derive
Heading/Outline Tree
   ↓ project
Text Face
Outline Face
Mindmap Face
```

任何 face edit：

```text
visual intent
→ structured patch
→ canonical Markdown draft
→ Core revision mutation
→ success canonical snapshot
→ all faces rederive
```

禁止：

```text
Text保存 noteBody
Mindmap保存 noteOutline
然后靠 effect互相同步
```

因为那会重新制造 Gen1 的 stale dual truth。

---

# 14. Document Semantic Zoom

User要求：

```text
full / outline / title
```

## 14.1 Gen1 donor

历史 exact file：

```text
features/presentation/documentSemanticZoom.ts
```

**状态**：`REUSE IDEA / DO NOT RUN AS SECOND OWNER`

---

## 14.2 Gen2 single owner

唯一 LOD owner：

```text
apps/web-gen2/src/spatial/nodePresentation.ts
density:
mark | summary | working | reading
```

Document renderer内部映射：

```text
mark     → title/identity
summary  → title + truthful outline hint
working  → outline / key blocks
reading  → full
```

这只是 display mapping，不是第二 threshold engine。

---

## 14.3 Forced states

### editing

`CURRENT` evidence：

```text
editing >= working
```

T5：

- editor不可因 zoom out突然退回 title；
- draft/caret不得丢。

### selected

**PLANNED visual override**

selected可以提高 affordance/局部信息，但不应自动强制 full document，除非 T1最终状态 resolver明确。

Threshold：`UNSPECIFIED`.

### expanded

Collection expansion 与 Document expanded不是同一概念。

如果 document有 explicit expansion/takeover：

- 通过 presentation state；
- 不写第二 LOD owner。

### focus

Focus可以提升 target visual weight，必要时让 density达到可读，但仍由 T1 resolver决定。

---

# 15. Image / Note / Markdown real anatomy matrix

| family | identity | primary body | secondary | editing | failure |
|---|---|---|---|---|---|
| Image | image identity / title | image itself | metadata/OCR/reference | metadata/annotation/Work View | honest image error |
| Anchored Note | Note identity + anchor | note text | locate anchor | block editor if supported | preserve note |
| Managed Markdown | document identity | true Markdown content | outline/mindmap mode | Inline rich block editor | raw canonical fallback |

T5最重要的一条：

> 三者可以共享 Huabu mechanical shell，但不能共享成“三张一样的白卡片只换 icon”。

---

# 16. Focus / Promotion / Preview / Work View continuity

## 16.1 Canonical invariant

```text
same entity
same canvas
same spatial kind
→ same authoritative projection
```

Promotion/Preview/Work View：

- 是同一 object 的专业 presentation；
- 不是新的 Core object；
- 不新建第二 authoritative node。

---

## 16.2 Before

- node在 world中有 Huabu geometry；
- current screen rect可由 Huabu transform推导；
- selection/identity保持。

---

## 16.3 During promotion

T5设计目标：

```text
node body / visual identity
→ continuity morph / takeover
→ professional screen-space region
```

可以使用：

- Huabu node screen rect；
- `blendedMarkRect`；
- `CanvasFloatingPopover` anchor；
- T4 `ProfessionalWindowEnvironment`。

不能使用：

- 新 camera；
- 新 entity；
- 新 projectionBinding；
- hardcoded right panel width。

---

## 16.4 Work View open / resize

Phase B D15：

```text
screen-space changes
world stays
Camera stays
```

T5禁止：

- 右栏打开节点跟着 camera recenter；
- panel resize时 canvas“偷偷移一下”；
- 打开 Work View让所有 HUD disappear。

---

## 16.5 Close / restore

普通 Preview / Work View close：

```text
professional presentation ends
→ original authoritative world projection still exists
→ restore visual continuity to its current real screen rect
```

如果 node因为用户显式移动/Focus等已改变 screen位置，close target必须是当前 rect，不是 open前缓存 rect。

---

## 16.6 failure

Professional Window加载失败：

- node authoritative projection不受影响；
- close/fallback回 node；
- 不把 failed preview写进 Core lifecycle。

---

## 16.7 reduced motion

没有可靠 source-backed duration。

因此：

```text
duration = UNSPECIFIED / T5 TO DEFINE
```

reduced-motion：

- 直接 region swap / opacity；
- 同一 identity必须仍可认出；
- 不依赖长距离飞行动画解释 continuity。

---

# 17. Spatial neighbor retreat / downweight / in-place morph / local settle

## 17.1 Spatial donor evidence

Raw symbols存在：

```text
CanvasPincher
ZoomRasterGate / ZoomLevel
presentedScale / itemScaleWhenPresented
CanvasLayoutBuilder
FlexibleGridLayoutBuilder
CanvasItemDistance
CanvasSnapContext / Guide
ResizeSnapper / Highlight
StackDropAnimator
MovePullOutInertia
UnfoldAnimator
TransitionView
KeyboardNavigator
Lasso
Dragger
```

**重要**：

```text
symbol exists ≠ exact behavior proven
```

特别禁止推断：

- `ZoomRasterGate` = 离散 canvas zoom owner；
- `CanvasLayoutBuilder` = 已知 packing solver。

---

## 17.2 video-observed behavior

有观察证据：

1. content可在原位更新，而不是整场 relayout；
2. overview→working有 density/morph变化；
3. Focus/Present时 target提升，surroundings退让/降权；
4. stack/reorganization可以 spread/unfold；
5. exact packing solver未知。

---

## 17.3 T1 seam consumption

### S1 · Adaptive Presentation

消费：

```text
in-place morph
density transition
```

### S9 · Local Settle

消费：

```text
neighbor retreat
bounded local reflow
post-drop settle
post-expand settle
```

### S8 · Focus perception

消费：

```text
target dominance
neighbor de-emphasis
screen-space identity
```

---

## 17.4 T5 visual responsibility

T5定义：

- target与neighbor视觉权重差；
- morph形态；
- settle motion style；
- spread/unfold visual trajectory；
- reduced-motion appearance。

T1定义：

- 谁移动；
- 哪些 node锁定；
- displacement上限；
- collision；
- final geometry；
- 何时 commit。

---

## 17.5 local settle status

```text
CURRENT exact LCOS solver = GAP
HUABU snap/frame/grid primitives = CURRENT
SPATIAL behavior evidence = REFERENCE_ONLY
T1 thin settle policy = PLANNED
```

T5不能把某个 Spatial动画直接写成已收编算法。

---

# 18. Collection · expanded / collapsed / member stack

Phase B语义已关闭，不重开。

---

## 18.1 Collection identity / membership

Owner：

```text
T6 / Core
```

T1只消费：

```text
collectionId
membership
current authoritative projection
host geometry
```

T5不决定 membership。

---

## 18.2 Collapsed Collection

Frozen：

```text
collapsed host = semantic target only
drop adds membership
source projection stays
no auto-expand
```

### State

`PLANNED T1 display seam`

Visual anatomy输入：

- compact Collection identity；
- member count / representative cues可以由 derived data；
- 不显示虚构 member positions；
- 不把 hidden members画成真实 stack nodes占 world geometry；
- drop receptive时显示 target acceptance，不把 source先吞进去。

### Before

collapsed。

### During left drop

- target cue；
- source仍在 pointer下；
- 不展开。

### After success

- membership新增；
- source projection保持当前位置；
- collapsed host可更新 count/preview。

### Failure

- count不变；
- cue撤销；
- source不动。

Reduced motion：

- count/preview可立即变；
- 不需要展开动画。

---

## 18.3 Expanded Collection

Frozen：

```text
default = free spatial layout
minimal neighbor reflow
explicit Grid/Masonry/Stack only user
```

Huabu：

```text
FrameNode free/column/row/grid
moveNodeIntoContainer preserves absolute position
```

### Before

expanded host已有 member geometry。

### During left-drop

- target host cue；
- source world position保持跟手；
- commit前不真正 parent。

### After canonical success

如果 authoritative projection应进入 host：

```text
Huabu parent mutation
→ preserve absolute position
→ T1 local settle minimal neighbor reflow
```

不是：

```text
drop → 全部重排成 grid
```

### Failure

canonical成功但 spatial adaptation失败：

- membership仍成功；
- presentation进入 recovery/reconcile；
- 不 rollback canonical membership。

---

## 18.4 Collapse → re-expand

Frozen：

```text
normal collapse → expand
restores last expanded Huabu geometry
```

T5视觉：

- collapse可 morph到 host identity；
- expand从 host identity恢复；
- 不设计“每次展开随机重新排版”。

Archive restore是例外，见后文。

---

## 18.5 Member stack

`Stack`是 presentation/layout option，不是 membership owner。

状态：

```text
Huabu/Spatial primitives = REUSE
T1 policy = PLANNED
T5 morphology = DESIGN
```

不要：

- stack视觉顺序变成 canonical membership顺序；
- 展开 stack就自动改变 Collection membership。

---

# 19. many-to-many membership · visual manifestation

Frozen：

```text
Entity ↔ Collection = durable many-to-many
```

同一 canvas + 同 spatial kind：

```text
only one authoritative projection
```

因此某 entity属于多个 Collection时：

### 在当前 authoritative host里

- 一个真实 node；
- geometry属于 Huabu。

### 其它 Collection需要表达成员关系

只能用：

```text
proxy cue
reference preview
membership indicator
locator/connection cue
```

不能复制第二个 authoritative node。

**T5施工关键**：

设计 proxy时必须让用户看得出：

> “这是关系/引用表达，不是第二份内容实体。”

---

# 20. left-drop / right-drag · spatial manifestation

## 20.1 Left drop → visible expanded Collection

Frozen：

```text
membership add
projection stays at drop/host
Huabu may reflow minimally
```

T5：

- before：host receptive；
- during：source实体跟手；
- after：source在host内稳定落位；
- local settle只影响必要邻居；
- no full rearrange。

---

## 20.2 Left drop → collapsed Collection

Frozen：

```text
membership add
source stays
no auto expand
```

T5：

- after用 count/member preview反馈“已加入”；
- source节点不飞进去消失。

---

## 20.3 Right-drag → Collection

Frozen：

```text
membership add
source projection never moves
```

T5：

- 必须有“关系已建立但对象仍在原地”的视觉完成反馈；
- 不使用左drop的 physical absorption动画。

---

## 20.4 Relation handle

Frozen：

```text
→ Project Relation
```

视觉必须与 membership drop不同。

---

## 20.5 remote/portal target

Frozen D04：

```text
semantic/mapping update
source remains source scene
```

T5不要做跨空间“节点真的飞走”的动画，除非只是短暂意图提示且最终source仍在。

---

# 21. Colony derive-only / peel / rescope

## 21.1 Canonical invariant

Frozen D11：

```text
contour = derive(member IDs + live Huabu geometry)
Core stores no contour points
```

Colony不是 Collection skin。

---

## 21.2 Planned T1 state shape

> `PLANNED`, not current exact type.

```ts
interface T1ColonyPresentation {
  readonly colonyId: string;
  readonly memberNodeIds: readonly string[];
  readonly derivedContour: readonly { x: number; y: number }[];
  readonly phase:
    | 'rest'
    | 'hover'
    | 'peel-preview'
    | 'rescope-preview'
    | 'settling';
}
```

---

## 21.3 REST

- contour随 live geometry派生；
- 不能直接 drag contour control points。

Failure：

- member geometry缺失 → fail-soft / omit invalid member；
- 不持久化临时 contour修补。

---

## 21.4 PEEL

Before：

- node属于 Colony。

During：

- user把 member拉出；
- contour实时从 live member positions变形；
- neck/tether/feedback是 T5 morphology；
- membership尚未 commit。

After threshold + commit：

- member membership delta；
- contour由新 member set重新派生；
- node authoritative geometry仍Huabu。

Failure/cancel：

- membership不变；
- contour回到 derived result。

Exact threshold：

```text
UNSPECIFIED
```

T5不要猜像素阈值。

---

## 21.5 RESCOPE

Frozen：

```text
rescope changes membership
not contour points
```

T5 visual：

- preview “哪些成员将进入/离开”；
- contour只是结果，不是编辑手柄。

---

## 21.6 Reduced motion

- contour可以直接更新到新 shape；
- peel可以只用静态 tether/outline；
- final membership和geometry完全相同。

---

# 22. fixed-screen identity

## 22.1 What it is

Pin / Locator / edge identity / Focus affordance：

```text
derived from current camera + viewport + live target
```

不是 world object。

---

## 22.2 Source contracts

### Navigation Marker

现有 contract纪律：

- durable navigation intent；
- 不持久化 screen coords；
- 不持久化 zoom；
- 不持久化 edge cursor geometry；
- resolve live current camera/viewport。

### Color Pin

canonical：

- project color identity；
- many-to-many targets；
- no spatial coords。

---

## 22.3 T1 thin seam

`PLANNED`

输入：

```ts
interface FixedScreenIdentityInput {
  readonly targetRef: CanonicalTargetRef;
  readonly liveWorldBounds?: Rect;
  readonly viewport: Viewport;
  readonly safeRect: ScreenRect;
  readonly occupiedRects: readonly ScreenRect[];
}
```

输出：

```text
onscreen anchor
edge locator
occluded state
cluster cue
```

不持久化。

---

## 22.4 T5 visual responsibility

- on-screen pin shape；
- edge locator shape；
- selected/focused emphasis；
- cluster visual；
- material；
- motion。

T1负责 geometry/clamp/avoid。

---

# 23. HUD / Pin / Locator / MiniMap avoidance

## 23.1 Environment producer

T4 planned canonical seam：

```ts
ProfessionalWindowEnvironment {
  occupiedRects
  safeRect / safeInsets
  activeRegions
}
```

**状态**：`PLANNED T4 PRODUCER`

T1/T2只是 consumer。

---

## 23.2 Rules

Docked edge Professional Window：

```text
shrinks safeRect
```

Floating professional region：

```text
collision obstacle
does not globally shrink safeRect
```

Multiple docked regions：

```text
combine
```

---

## 23.3 T5禁止

- CSS写死“右侧栏 360px”；
- Pin自己 query DOM；
- MiniMap永远固定右下角；
- Work View打开就隐藏所有 HUD；
- 把 `safeRect`持久化。

---

## 23.4 MiniMap

Huabu MiniMap：

`CURRENT`

TapNow donor观察：

- bounds + viewport；
- node bounds；
- selection/group color；
- drag；
- auto-open相关条件；
- `screenToFlowPosition` / `fitView`。

TapNow：

```text
REFERENCE_ONLY
```

其 proprietary bundle不直接收编。

---

## 23.5 Before / during / after

Before：

- HUD在 current safeRect内。

During dock resize：

- T4 environment连续更新；
- T1重新布局 HUD；
- Camera不动。

After close：

- safeRect恢复；
- HUD回到最合适位置。

Failure：

- environment unavailable → safe fallback；
- 不让 HUD进入不可点击区域。

Reduced motion：

- HUD relocation可立即；
- 不需要跨屏飞行动画。

---

# 24. local settle / layout

## 24.1 Current assets

Huabu：

- frame layout；
- free/row/column/grid；
- snap guides；
- resize snap；
- parent mutation；
- selection bounds。

Spatial：

- behavior reference。

Gen1 / donor：

- layout engines可作为历史参考，但不能成为第二 geometry owner。

---

## 24.2 T1 invariant

local settle必须满足：

```text
deterministic enough to avoid jitter
no overlap after settle where policy promises separation
bounded displacement
locked/pinned nodes unchanged
only local neighborhood moves
canonical membership unaffected
same final geometry under reduced motion
```

---

## 24.3 GAP

当前未证明成熟的：

```text
LCOS exact neighbor solver
exact displacement cap
exact settle radius
exact collision iterations
exact animation duration
```

全部：

```text
UNSPECIFIED
```

T5不要把视觉样机里的参数写成工程常量。

---

# 25. Archive / Restore arrival

Frozen D13。

## 25.1 Archive

```text
Core eligibility false
→ current projection removed
```

T1/T5不做“把节点拖到一个 Archive仓库画布”。

Archived Search/Focus：

```text
opens archive viewer
does not auto restore
```

---

## 25.2 Restore

```text
same canonical identity
eligibility true
→ create current projection
→ fresh Huabu layout
→ DO NOT restore old x/y
```

这是与普通 Work View close/restore最大的区别。

---

## 25.3 T5 arrival choreography

Before：

- archived item在 archive viewer/list，没有 current world node。

During restore：

- lifecycle mutation进行；
- 可以有“返回现场”视觉反馈；
- 不能提前显示一个假 node当成功。

After success：

- new authoritative current projection；
- fresh placement；
- T1 local settle；
- same canonical identity。

Failure：

- archive viewer仍保持；
- 不留下 orphan placeholder node。

Reduced motion：

- 直接出现于 fresh layout位置；
- same final geometry。

Duration：

`UNSPECIFIED`.

---

# 26. Glyth takeover host constraints

T5后续会画 Glyth，但它不能自己决定 host mechanics。

## 26.1 Current/known host truths

- renderer family已有 conversation/Glyth insertion方向；
- Huabu NodeWrapper / floating system支持 takeover/collapse的 blended mark rect；
- selection/geometry/camera仍Huabu；
- Professional Window occupancy仍T4；
- screen-space overlay仍T1/T4 environment约束。

**当前完整 Glyth takeover production chain**：

```text
PARTIAL / NOT FULLY VERIFIED AT 232b2ca5
```

因此状态是：

```text
host primitives = CURRENT
LCOS Glyth final takeover seam = PLANNED/GAP
T5 Glyth body = DESIGN
```

---

## 26.2 Hard constraints

Glyth takeover不能：

- new canvas；
- new camera；
- duplicate entity；
- duplicate selection；
- bypass safeRect；
-把 receiver/runtime状态存进 geometry；
- takeover时永久改变 node x/y 只为视觉方便。

---

## 26.3 Continuity

T5应设计：

```text
glyph/mark
→ expanded functional face
→ takeover/professional region
```

三者保持：

- identity；
- status lineage；
- selection referent；
- same projection contract。

Reduced motion：

- instant morph / opacity；
- no required flying path。

---

# 27. Evidence-backed numeric ledger

只有这里的数值可当“源代码已证实”，其余不得想当然。

| Source | value | meaning | status |
|---|---:|---|---|
| Huabu `NodeFloatingToolbar` | `12px` | floating popover offset | `CURRENT` |
| Gen2 `semanticDropMachine` | `420ms` | current dwell | `CURRENT MECHANIC / OLD TAXONOMY` |
| Gen2 `semanticDropMachine` | `56` | current dwellBand | 同上 |
| Gen2 `semanticDropMachine` | `10` | current dwellRadius | 同上 |
| Gen2 `semanticDropMachine` | `16` | current cancelDistance | 同上 |
| Gen2 `semanticDropMachine` | `128` | current edgeScrollBand | 同上 |
| Gen1 InlineNoteEditor | `.5px` | RAF screen-rect update tolerance | `REUSE BEHAVIOR, OLD MECHANISM` |
| Gen1 Markdown blocks | `2 spaces` | one indent level | `REUSE` |
| Gen1 Markdown blocks | `6` | indent clamp | `REUSE OLD EDITOR` |
| Gen1 heading | H1–H3 | directly supported block types | `REUSE` |

**不在这张表里的 motion duration / radius / padding / card size / focus displacement**：

```text
UNSPECIFIED
```

旧规划里的 90–140ms / 180–260ms 等只能叫历史计划参考，不进入本蓝图工程证据。

---

# 28. T5 Direct State Board Schema

T5可以直接把每个 visual frame记录为：

```ts
interface T5StateBoardFrame {
  id: string;
  family:
    | 'image'
    | 'note'
    | 'markdown'
    | 'collection'
    | 'colony'
    | 'glyth'
    | 'hud';
  sourceStatus: 'CURRENT' | 'REUSE' | 'PLANNED' | 'GAP';

  density?: 'mark' | 'summary' | 'working' | 'reading';
  phase?:
    | 'rest'
    | 'hover'
    | 'selected-single'
    | 'selected-multi'
    | 'resizing'
    | 'editing'
    | 'dragging'
    | 'drop-receptive'
    | 'focused'
    | 'failure';

  before: string;
  during: string;
  after: string;
  failure: string;

  canonicalInvariant: string;
  visualResponsibility: string;
  mechanicalOwner: 'Huabu' | 'T1' | 'T3' | 'T4' | 'T6/Core';
  reducedMotion: string;

  evidence: {
    file: string;
    symbol?: string;
    value?: string;
    authority: 'current-source' | 'gen1-source' | 'phase-b-freeze' | 'donor-observation';
  }[];

  unspecified: string[];
}
```

---

# 29. T5 Construction Card Template

每张施工卡必须包含：

```md
## Card ID
T5-<family>-<state>-<n>

### Target
<具体 family / state / density>

### Status
CURRENT / REUSE / PLANNED / GAP

### Consumes
- T1 seam:
- Huabu primitive:
- T3 intent:
- T4 environment:
- T6/Core canonical:

### Exact source evidence
- file:
- symbol:
- baseline:
- behavior:
- evidence-backed numbers:

### Canonical invariant
- ...

### Visual anatomy
- identity:
- body:
- interaction affordance:
- overlay:
- selection relationship:
- failure anatomy:

### Before
...

### During
...

### After
...

### Failure
...

### Reduced motion
...

### Must not implement
- duplicate camera
- duplicate selection
- duplicate LOD
- duplicate geometry
- fake connected mock
- hidden second truth

### Browser acceptance
1.
2.
3.

### Open visual choices
- only items T5 is actually allowed to decide

### Unspecified engineering values
- ...
```

---

# 30. Browser Acceptance · Content Nodes

## BA-T5-T1-01 · Image identity and mechanics

1. place one real image Artifact projection；
2. zoom through all T1 densities；
3. hover/select/resize/drag；
4. open Preview/Professional Window；
5. resize right professional region；
6. close。

Assert：

```text
same canonical entity
same authoritative projection
Huabu geometry remains owner
Professional Window resize does not move Camera
image load error never becomes fake success
```

---

## BA-T5-T1-02 · Note vs managed Markdown

1. display anchored Note；
2. display managed Markdown；
3. compare far/mid/near；
4. select both individually and together。

Assert：

```text
not visually identical species
same mechanical selection shell
anchored Note keeps annotation identity
managed Markdown behaves as document/material
```

---

## BA-T5-T1-03 · Inline editor follows real projection

1. start Markdown editing；
2. pan/zoom/explicit Focus；
3. resize node；
4. type IME Chinese；
5. Cmd/Ctrl+B and Cmd/Ctrl+G；
6. H1/H2/H3/list toolbar；
7. Tab/Shift+Tab；
8. Enter/Backspace。

Assert：

```text
editor stays attached to real screen rect
no second camera
caret not lost on ordinary geometry updates
save serializes to canonical Markdown
cancel keeps previous canonical revision
```

---

## BA-T5-T1-04 · Shortcut gap honesty

Test：

```text
type "# " / "## " / "### " / "- " in empty block
```

Until implementation lands：

```text
MUST NOT mark as passed based only on parser support
```

This is an explicit GAP.

---

# 31. Browser Acceptance · Text / Outline / Mindmap

## BA-05 · Same projection

Switch：

```text
Text → Outline → Mindmap → Text
```

Assert：

```text
entityId unchanged
nodeId unchanged
ProjectionBinding unchanged
world geometry unchanged except explicit content-fit command
```

---

## BA-06 · Canonical round trip

1. edit Text；
2. add heading；
3. switch Mindmap；
4. rename topic；
5. switch Text；
6. verify Markdown heading updated；
7. reload。

Assert：

```text
one canonical body
no noteOutline divergence
revision survives reload
```

---

## BA-07 · Mindmap operations

Verify separately：

```text
Tab add child
Shift+Tab lift
Enter sibling
Delete/Backspace remove
direct edit
```

Drag reparent：

```text
only mark passed after new implementation is actually wired
```

Fold：

```text
must preserve parent, hide descendants
```

---

# 32. Browser Acceptance · Focus / Work View

## BA-08 · Professional Window camera invariant

Capture:

```text
viewport x/y/zoom
```

Then：

```text
open Preview
resize dock
collapse
reopen
resize browser
```

Assert：

```text
viewport unchanged
```

Then explicit Focus：

```text
Camera allowed to move
```

---

## BA-09 · Close continuity

1. select node；
2. open Work View；
3. user pans canvas if allowed / node world scene changes through legitimate interaction；
4. close。

Assert：

```text
returns to current live projection rect
not stale cached rect
same identity
```

---

# 33. Browser Acceptance · Collection

## BA-10 · Collapsed left drop

Assert：

```text
membership added
source stays
collection stays collapsed
member count/cue updates
no auto expand
```

---

## BA-11 · Expanded left drop

Assert：

```text
membership added
source enters/associates with visible host as source plan requires
absolute position continuity
only local neighbors settle
no full-grid rewrite
```

---

## BA-12 · Right-drag

Assert：

```text
membership added
source node world position unchanged
visual completion differs from physical left-drop
```

---

## BA-13 · Many-to-many

One entity joins Collection A and B on same canvas.

Assert：

```text
one authoritative projection
other membership expressed as proxy/reference cue
no second real node
```

---

# 34. Browser Acceptance · Colony

## BA-14 · Derived contour

Move member nodes.

Assert：

```text
contour follows live geometry
no Core contour-point write
```

---

## BA-15 · Peel cancel

Pull member partly out then cancel.

Assert：

```text
membership unchanged
contour returns from derived geometry
no hidden state residue
```

---

## BA-16 · Peel commit

Pull past actual implemented threshold.

Assert：

```text
membership delta
contour rederived
node geometry remains Huabu-owned
```

---

# 35. Browser Acceptance · Archive

## BA-17 · Archive

Assert：

```text
eligibility false
current projection disappears
Search/Focus archive target opens archive viewer
does not auto restore
```

---

## BA-18 · Restore

Assert：

```text
same canonical identity
new current projection
fresh Huabu placement
old x/y not restored
local settle occurs only as needed
```

---

# 36. Browser Acceptance · HUD

## BA-19 · Docked occupancy

1. HUD / Pin / Locator / MiniMap visible；
2. open docked Professional Window；
3. resize；
4. close。

Assert：

```text
safeRect updates
HUD avoids occupied region
Camera unchanged
```

---

## BA-20 · Floating region

Assert：

```text
floating professional region is obstacle
does not shrink entire safeRect
HUD avoids collision
```

---

# 37. Reduced Motion Matrix

| scope | normal | reduced motion |
|---|---|---|
| node density morph | T5 tuned | immediate content swap / opacity |
| Focus dominance | possible weight + local settle | weight only or direct geometry |
| Work View takeover | continuity morph | direct attach/detach |
| Collection expand | unfold/settle | same final geometry, immediate |
| Colony peel | tether/contour morph | static tether + direct contour |
| Archive restore | arrival/settle | direct fresh placement |
| HUD avoidance | reposition animation optional | immediate relocation |
| MiniMap | normal viewport update | same geometry, no decorative tween |

**关键**：

> reduced-motion改变的是运动，不是 final state、semantic result 或 layout geometry。

---

# 38. Exact File / Symbol Consumption Matrix

| Area | Layer | Exact file/symbol | Status | T5 consumption |
|---|---|---|---|---|
| LOD | Gen2 | `apps/web-gen2/src/spatial/nodePresentation.ts` | CURRENT | density states |
| renderer | Gen2 | `apps/web-gen2/src/spatial/rendererRegistry.ts` | CURRENT/INCOMPLETE | family insertion |
| identity | Gen2 | `apps/web-gen2/src/spatial/projectionBinding.ts` | CURRENT | one authoritative projection |
| semantic drop lifecycle | Gen2 | `apps/web-gen2/src/interaction/semanticDropMachine.ts` | CURRENT + taxonomy stale | dwell/cancel feedback only |
| overlay arb | Gen2 | `apps/web-gen2/src/interaction/overlayArbitration.ts` | SUPERSEDED_CURRENT_CODE | do not design exclusivity |
| canvas | Huabu | `.../Canvas/Canvas.tsx` | CURRENT | geometry/camera/Minimap |
| floating anchor | Huabu | `.../FloatingToolbars/NodeFloatingToolbar.tsx` | CURRENT | node rect anchor, offset 12 |
| frame | Huabu | `.../FrameNode.tsx` | CURRENT | free/row/column/grid |
| container mutation | Huabu | `.../container/mutation.ts` | CURRENT | absolute-position preserving reparent |
| old content dispatch | Gen1 | `src/features/canvas/CanvasNodeVisual.tsx` | REUSE | family anatomy |
| rich editor | Gen1 | `src/features/ui/InlineNoteEditor.tsx` | REUSE | block editor behavior |
| markdown serializer | Gen1 | `markdownToHtml`, `readMarkdown` | REUSE | same body direct editing |
| mindmap | Gen1 | `src/features/ui/MindMapEditor.tsx` | REUSE/PARTIAL | topic editing/add/lift/delete |
| outline | Gen1 | `src/features/canvas/outlineTree.ts` | REUSE | pure tree helpers |
| mindmap visual | Gen1 | `src/features/canvas/MindMapNoteVisual.tsx` | REUSE | pure layout/fold |
| old memory | Gen1 | `src/state/notePresentationMemory.ts` | RETIRE AS TRUTH | migration evidence |
| document zoom | Gen1 | `features/presentation/documentSemanticZoom.ts` | REUSE IDEA | map to single T1 LOD |
| Professional Window | T4 | `professionalWindowEnvironment.ts/.tsx` candidate | PLANNED | safeRect producer |
| Collection host | T1 | thin display/layout seam | PLANNED | host morphology |
| Colony | T1 | derived geometry seam | PLANNED | contour state |
| local settle | T1 | local policy/solver seam | GAP/PLANNED | final geometry/motion input |
| fixed identity | T1 | screen-space derivation seam | PLANNED | Pin/Locator |
| Archive arrival | T1+T6 | lifecycle→projection reconcile | PLANNED | fresh placement |
| Glyth takeover | Huabu+T1 | host primitives | PARTIAL | host constraints |

---

# 39. GAP Ledger T5 必须看见

这些目前不允许被任何视觉稿/施工稿写成“已经接通”。

## GAP-01

`# / ## / ### / - + Space` live transform。

Source evidence不足。

---

## GAP-02

Gen2 production-grade Text/Outline/Mindmap renderer complete path。

类型/旧规划存在，不等于 current completed。

---

## GAP-03

MindMap arbitrary drag reparent/move exact current implementation。

Gen1 exact source本轮只证明 add/lift/delete/edit；不要扩大。

---

## GAP-04

MindMap fold state final owner。

`pruneCollapsed`算法可复用，但 session/persistence owner要新 seam。

---

## GAP-05

Collection collapsed host exact Huabu implementation。

FrameNode没有 canonical collapse。

---

## GAP-06

minimal neighbor reflow exact solver。

没有可靠 source证明。

---

## GAP-07

Focus neighbor displacement数值。

Spatial只有行为证据。

---

## GAP-08

Colony peel threshold / tether dimensions / motion timing。

没有可靠数值。

---

## GAP-09

ProfessionalWindowEnvironment是否已经 landing到 `232b2ca5`。

本蓝图按 T4 approved source plan标 `PLANNED`，直到 current source重新证明。

---

## GAP-10

Glyth full takeover production chain。

host primitives存在，final LCOS seam没有在本轮 exact baseline完全证明。

---

# 40. T5 Visual Construction Priority

建议 T5按下面顺序做，不然很容易又被“画面先走，owner后补”拖回返工地狱。

## V1 · Universal mechanics skin

先完成：

```text
rest
hover
single selection
multi selection
resize
drag
drop receptive
focus
failure
```

只在 Huabu mechanical owner上做视觉。

---

## V2 · Image

先做最真实、最不抽象的 species：

```text
mark
summary
working
reading
loading/error
selected/resize
preview promotion
```

---

## V3 · Markdown Text

做：

```text
title/outline/full LOD
inline block editor
H1/H2/H3/list
bold/highlight
selection/caret
```

---

## V4 · Outline / Mindmap

在 canonical same-body约束下设计：

```text
face switch
topic
branch
fold
edit
add child/sibling
lift
delete
drag-reparent future state
```

把 GAP visual也画出来，但卡上必须标 `PLANNED/GAP`。

---

## V5 · Collection

按：

```text
collapsed
expanded free
member stack
left-drop
right-drag
many-to-many proxy
collapse/expand continuity
```

---

## V6 · Colony

按：

```text
rest contour
hover
peel begin
tether
threshold pending
commit
cancel
rescope preview
```

---

## V7 · HUD / Pin / Locator / MiniMap

全部放到：

```text
normal
docked right
docked bottom
multi-dock
floating obstacle
focus
offscreen
```

矩阵中。

---

## V8 · Glyth takeover

最后接 host constraints，不要在 node world规则没稳定前先画一套独立“聊天窗口宇宙”。

---

# 41. T5 Handoff Checklist

T5收到本稿后，每一项只要没有对应 evidence，就必须继续写 `GAP`：

```text
[ ] Image anatomy 不是白卡换图标
[ ] Note 与 managed Markdown 视觉有语义差
[ ] Markdown rich editor 保留 Gen1 直接块编辑能力
[ ] markdownToHtml/readMarkdown 行为被纳入 visual state
[ ] Bold/Highlight/H1/H2/H3/List 已画
[ ] Tab/ShiftTab 已画
[ ] Enter/Backspace 已画
[ ] # + Space 等明确标 GAP，直到工程补上
[ ] Text/Outline/Mindmap 同一 canonical body
[ ] noteOutline 不被当新 truth
[ ] Document semantic zoom只消费 T1 density owner
[ ] editing不因 zoom out退化丢 draft
[ ] Focus与Professional Window camera规则分开
[ ] Collection collapsed drop不auto-expand
[ ] right-drag source不动
[ ] many-to-many不复制 authoritative projection
[ ] Colony contour无编辑控制点
[ ] Archive restore不用旧 x/y
[ ] HUD不写死 side panel尺寸
[ ] MiniMap避让Professional Window
[ ] Glyth takeover不造第二canvas/camera
[ ] 所有 reduced-motion有相同 final state
[ ] 所有未证实尺寸/时序写 UNSPECIFIED
```

---

# 42. 最终施工口令

T5 可以把下面这段直接放在自己的总蓝图顶部：

```text
T5 不负责重新定义 LCOS 的 Spatial 语义。

T5 的输入不是“几种卡片”，而是一组已分 owner 的连续 presentation states：

Huabu 提供真实 geometry / selection / resize / drag / screen transform；
T1 提供一个 LOD owner、screen-space identity、Collection/Colony spatial manifestation、
local settle policy、Archive arrival 与 Professional Window HUD avoidance；
T3 提供 pointer/drop intent；
T4 提供 ProfessionalWindowEnvironment；
T6/Core 提供 canonical identity/membership/lifecycle。

Gen1 InlineNoteEditor / MindMapNoteVisual / MindMapEditor 的不可替代能力应恢复，
但旧 noteBody/noteOutline 双 truth、window event、DOM ghost、旧 canvas math 不迁。

Spatial donor只证明目标 dominance、邻居退让、原位 morph、spread/unfold 等行为方向，
不证明 exact packing solver 或 zoom owner。

任何 current 没接通的东西必须标 PLANNED/GAP。
任何没有 source evidence 的尺寸和时序必须写 UNSPECIFIED。
任何 visual preview 都不能冒充 canonical mutation成功。
```

---

# 43. Evidence Notes

本稿所用证据层级：

1. **Phase B 2026-09-06 最终跨线程裁决**：语义最高；
2. **Gen2 `232b2ca5` current-source audit**：mechanical/current truth；
3. **Huabu `a3c411e...` current/upstream source audit**；
4. **Gen1 `LCOS_前端源码合并版.md` 原始源码合并**：
   - `InlineNoteEditor.tsx`
   - `MindMapEditor.tsx`
   - `CanvasNodeVisual.tsx`
   - `outlineTree.ts`
   - `MindMapNoteVisual.tsx`
   - `notePresentationMemory.ts`
5. **T4 ProfessionalWindowEnvironment exact-source plan**；
6. **Spatial v4 donor correction + raw symbol/video evidence**；
7. 旧 2026-09-02 / 09-03 B02/Phase-B 施工稿只作 provenance，不作为比 Phase B 更新的产品 authority。

---

# 44. Authority warning

`LCOS_Gen2_施工补丁_B02_TextOutlineMindmap_一对一源码版_20260903.md`
自身已明确降级为返工草稿。

因此本蓝图没有把它提出的“目标文件树”或“78条测试”等直接当 current truth。

真正保留的是：

- 它指向的 Gen1 exact source；
- 之后重新从 `LCOS_前端源码合并版.md` 追回的函数与行为；
- Phase B 2026-09-06 对 canonical semantics 的覆盖。

这点很重要。否则人类最擅长的传统节目又会出现：拿一份“写得特别详细的旧计划”压过真实源码，然后过两天大家一起返工。

---

# END
