# LCOS Gen2 · T3 · C1-S3D
# Exact File Construction Cards
## Local Overlay / Work View / T5 Consumption Plane

> 日期：2026-09-06  
> 状态：`C1-S3D COMPLETE`  
> 基线：`DZWFLi/LCOS_Gen2 @ c2ff890a867922a1256572199458438572eb0a8c`
>
> 前置：
>
> - `C1-S0 · Phase-B Interaction Contract Lock`
> - `C1-S1 · Current Source Exact Map`
> - `C1-S2 · Source Engineering Seam Skeleton`
> - `C1-S3A · Host Interaction / Context Menu / Glyth`
> - `C1-S3B · Composer Data Plane`
> - `C1-S3C · Semantic Drag Plane`
>
> 本批次：
>
> ```text
> T3-C03-14 Action Arc Model
> T3-C03-15 Local Overlay Arbitration Rewrite
> T3-C03-16 Safe Placement / Overlay Priority
> T3-C03-17 ProfessionalWindowEnvironment Consumer
> T3-C03-18 T3InteractionSnapshot
> T3-C03-19 T5 Final Engineering Input Table
> ```
>
> 本批只处理：
>
> ```text
> screen-space local UI
> Work View coexistence
> read-only visual state
> ```
>
> 不重新讨论 Work View 产品语义。
> 不由 T3 建 Professional Window 系统。
> 不由 T3 改 Camera / world node geometry。

---

# 0. Current-source 复核后的关键结论

## FACT-01 · Current `overlayArbitration.ts` 仍有一条已被 Phase B 覆盖的 exclusive rule

Current：

```ts
if (input.workViewOpen) return ['work-view'];
```

对应 current test：

```text
work-view is exclusive, returns the whole canvas
```

这条必须退休。

其它“避免 node Christmas tree”的思想仍然值得保留：

```text
集中式 pure arbitration
统一 overlay layer
不让 renderer 自己随意绝对定位一堆按钮
```

因此：

```text
REWRITE policy
NOT retire module
```

---

## FACT-02 · Current overlay taxonomy 还不够表达 Phase-B active-work priority

Current `OverlayKind`：

```text
resize-handles
node-toolbar
connect-affordance
reference-badge
drop-preview
action-arc
composer
focus-hud
work-view
```

缺少明确：

```text
reference-pick feedback
context-menu
semantic-carry proxy
relation-handle session
tooltip
voice-active state
```

同时：

```text
work-view
```

不应再被当成 T3 local overlay kind。

它应该变成：

> **环境 / occlusion input**。

---

## FACT-03 · Current `CanvasFloatingPopover` 是正确的 positioning primitive

Huabu：

```text
huabu/apps/web/src/components/Common/CanvasFloatingPopover.tsx
```

已经统一：

```text
flow-space anchor
→ screen/page rect
→ body portal
→ Floating UI offset / flip / shift
→ canvas DOM boundary
→ ResizeObserver
→ canvas attention / modal suppression
```

并且源码明确写：

> Every floating canvas surface should funnel through this component.

所以：

```text
Action Arc
Compact Composer
local popover
```

不应该重建 positioning engine。

---

## FACT-04 · Current `CanvasFloatingPopover` 只认识整个 canvas rect，不认识 Work View safe area

Current：

```text
flip({ boundary: domNode })
shift({ boundary: domNode })
```

这是针对传统相邻 panel 的成熟行为。

但 Phase B 要求：

```text
Work View可以覆盖/占据 viewport 局部
canvas world/camera不移动
screen-space local UI避让 occupied region
```

如果 Canvas DOM 本身保持 full-size：

```text
domNode boundary
≠ actual usable safe region
```

因此需要一个**可选、domain-free safe screen boundary**。

---

## FACT-05 · Current Canvas wrapper resize逻辑会主动修正 viewport

Current `Canvas.tsx` 有：

```text
ResizeObserver(wrapper)
→ anchorViewportCentre(...)
→ instance.setViewport(...)
```

其目的，是传统 side panel / split preview 改变 wrapper width 时保持视觉中心稳定。

但最新 Phase B Work View：

```text
open/resize Work View
→ camera MUST NOT move
```

所以新 Professional Work View **不能复用“缩小 Canvas wrapper”作为默认实现路径**。

最薄正确路径：

```text
Canvas wrapper/world viewport保持原尺寸
Work View以 screen-space window layer占位/覆盖
T4发布 occupiedRects / safe regions
T3/T1 screen-space UI消费这些 rect
```

如果 T4 未来确实必须改变 wrapper layout：

```text
必须由 T1/T4 增加 explicit no-camera-compensation path
```

不能让 T3偷偷 setViewport 补回来。

---

## FACT-06 · Current SurfacePort 已经把三现场 canvas identity隔离

Current：

```text
main
context
workflow
```

拥有 distinct canvasId。

所以 T3 overlay/composer state必须按：

```text
project + surface/canvas + target
```

消费环境。

不能有一个全局：

```text
activeCanvasOverlayStore
```

把三个现场状态混起来。

---

## FACT-07 · Current adaptive presentation 已有 screen-space density input

Huabu node presentation context已经提供：

```text
world size
zoom
screen size
DPR
interaction phase
```

web-gen2 resolver已有：

```text
mark
summary
working
reading
```

所以 T5 的 LOD / local-chrome visibility：

```text
可消费已有 density/phase
```

不需要 T3再建立第二套 zoom thresholds。

---

# 1. T3-C03-14 · Action Arc Model

## 1.1 Goal

把 Action Arc 固定为：

> 当前 target 的 3 个左右高频 direct actions，最多 4 个。

它不是：

```text
mini toolbar of everything
management menu
mode selector
entity taxonomy menu
```

---

# 1.2 Current source to consume

Current：

```text
apps/web-gen2/src/presentation/rendererRegistry.ts
```

已有 family capabilities：

```text
place
compose
reference
connect
inspect
edit
```

但 capability taxonomy仍是 Phase-A presentation capability。

因此 Action Arc不能直接写：

```text
capability === 'compose' → 一切就完成了
```

它需要组合：

```text
renderer capability
+
surface capability
+
cross-thread injected owner port availability
```

---

# 1.3 ADD exact file

```text
apps/web-gen2/src/interaction/actionArcModel.ts
```

---

# 1.4 Action IDs

T3拥有的 direct actions：

```ts
export type T3DirectActionId =
  | 'ai-work'
  | 'relation';
```

跨线程动作通过 injected capability：

```ts
export type ExternalDirectActionId =
  | 'assembly'
  | 'pin';
```

最终：

```ts
export type ActionArcActionId =
  | T3DirectActionId
  | ExternalDirectActionId;
```

这里不增加：

```text
rename
duplicate
delete
archive
voice
receiver
provider
```

---

# 1.5 Model input

```ts
export interface ActionArcModelInput {
  readonly targetKey: string;
  readonly targetCapabilities: ReadonlySet<string>;
  readonly surfaceCapabilities: ReadonlySet<string>;

  readonly canOpenComposer: boolean;
  readonly canCreateRelation: boolean;

  readonly assemblyPortAvailable: boolean;
  readonly pinPortAvailable: boolean;
}
```

---

# 1.6 Output

```ts
export interface ActionArcAction {
  readonly id: ActionArcActionId;
  readonly enabled: boolean;
  readonly priority: number;
}

export interface ActionArcViewModel {
  readonly targetKey: string;
  readonly actions: readonly ActionArcAction[];
}
```

最终：

```text
sort by stable product priority
take <= 4
```

通常：

```text
3 normal
4 max
```

---

# 1.7 Dispatch owner

```text
ai-work
→ T3 ComposerDraftRegistry / local Composer projection

relation
→ T3 RelationHandleSession

assembly
→ injected T4 AssemblyTargetPort

pin
→ injected T2 PinPort
```

Action Arc model：

```text
不执行 domain write
```

---

# 1.8 Multi-selection

冻结：

```text
multi-select
→ no automatic Composer
```

Multi-selection可以拥有一条轻 quick action：

```text
AI Work
```

但它不是 single-node Action Arc 的自动展开。

因此：

```text
single-target ActionArcModel
```

和：

```text
multi-selection quick toolbar
```

保持两个 projection consumer。

不建：

```text
ActionArc around selection hull
```

除非 T5/最终冻结明确要求。

---

# 1.9 Tests

## ADD

```text
apps/web-gen2/test/actionArcModel.test.ts
```

至少：

```text
max 4
stable ordering
management actions never emitted
ai-work only when compose allowed
relation only when connect allowed
assembly only when injected T4 port exists
pin only when injected T2 port exists
unknown capability does not invent action
```

---

# 2. T3-C03-15 · Local Overlay Arbitration Rewrite

## 2.1 Goal

把 current：

```text
“谁开了就独占”
```

改成：

> **优先保护用户正在做的 active local work，装饰性 chrome 逐级让路。**

---

# 2.2 MODIFY

```text
apps/web-gen2/src/interaction/overlayArbitration.ts
apps/web-gen2/test/overlayArbitration.test.ts
```

---

# 2.3 RETIRE from OverlayKind

删除：

```text
work-view
```

Work View变 environment，不再是一个 local overlay。

---

# 2.4 Add / rename overlay kinds

建议：

```ts
export type OverlayKind =
  | 'resize-handles'
  | 'node-toolbar'
  | 'connect-affordance'
  | 'reference-badge'
  | 'semantic-drop-preview'
  | 'semantic-carry-proxy'
  | 'relation-handle'
  | 'action-arc'
  | 'composer'
  | 'reference-pick-feedback'
  | 'context-menu'
  | 'focus-hud'
  | 'tooltip';
```

---

# 2.5 OverlayInput v2

替换过于布尔拼盘的 current input。

建议分组：

```ts
export interface LocalWorkInput {
  readonly composer:
    | 'closed'
    | 'passive-empty'
    | 'passive-draft'
    | 'focused'
    | 'voice-recording';

  readonly referencePickActive: boolean;
  readonly contextMenuOpen: boolean;
  readonly relationHandleActive: boolean;
  readonly semanticCarryActive: boolean;
}

export interface NodeChromeInput {
  readonly dragging: boolean;
  readonly resizing: boolean;
  readonly selected: boolean;
  readonly hovered: boolean;
  readonly actionArcOpen: boolean;
  readonly referenceBadge: boolean;
  readonly tooltipOpen: boolean;
}

export interface OverlayInput {
  readonly localWork: LocalWorkInput;
  readonly chrome: NodeChromeInput;
  readonly semanticDropPreview: boolean;
}
```

Work View 不在这里。

---

# 2.6 Frozen priority

高 → 低：

```text
P0
focused Composer
Voice recording
Reference Pick
Context Menu / active popover

P1
unfocused Composer with draft

P2
Relation active
Semantic Carry / Drop active feedback

P3
Action Arc

P4
resize/selection node chrome

P5
hover tooltip / nonessential label
```

注意：

```text
active gesture feedback
```

在对应 gesture 期间必须可见，否则用户不知道 target 是否接收。

---

# 2.7 Important coexistence

不是：

```text
P0存在
→ P1-P5全删
```

而是 arbitration输出：

```ts
OverlayDisposition {
  kind
  visibility:
    | 'visible'
    | 'compact'
    | 'suppressed'
}
```

所以：

```text
Composer focused
→ Composer visible
→ tooltip suppressed
→ Arc可根据空间 suppressed
```

而不是所有东西硬互斥。

---

# 2.8 Composer states

### focused / voice-recording / reference-pick

```text
NEVER auto suppress because Work View opens/resizes
```

### passive draft

空间不足：

```text
compact
```

### passive empty + unfocused

空间严重不足：

```text
可 compact / fold
```

具体 fold body由 T5。

---

# 2.9 Drag / Resize

Current：

```text
dragging only drop-preview
resizing only handles
```

需要细化。

### Native Move dragging

```text
semantic carry/drop proxy no
Arc suppress
Composer:
  focused/voice/reference-pick 不因 unrelated drag自动清状态
  projection可临时 compact if collision
```

### Semantic Give / Right Carry

```text
target receptive / proxy / receipt visible
Arc/tooltip让路
```

### Resize current target

```text
resize handles visible
Arc可 suppress
Composer state preserved
```

---

# 2.10 Tests rewrite

删除 current：

```text
work-view is exclusive
```

新增：

```text
focused Composer outranks Arc
voice recording never suppressed by local chrome
reference pick remains active
passive draft can compact
tooltip suppresses first
Arc suppresses before active Composer
semantic carry proxy remains during gesture
context menu is not hidden by node hover
no Christmas-tree combination
```

---

# 3. T3-C03-16 · Safe Placement / Existing Huabu Primitive

## 3.1 Goal

不要造：

```text
T3PopoverPositioner
T3ArcGeometryEngine
T3SafeRectSolver
```

继续复用 Huabu：

```text
CanvasFloatingPopover
NodeFloatingToolbar live anchor geometry
```

---

# 3.2 Current reusable source

`NodeFloatingToolbar.tsx` 当前已经：

```text
useInternalNode
→ authoritative absolute position
→ style width/height first during resize
→ measured fallback
→ takeover mark rect support
→ CanvasFloatingPopover
```

所以 T3 local UI应读取同一类 anchor seam。

不能：

```text
从保存的 x/y + guessed width
重新算 Action Arc位置
```

---

# 3.3 Huabu generic enhancement

## MODIFY — T1 physical owner cross-review

```text
huabu/apps/web/src/components/Common/CanvasFloatingPopover.tsx
```

新增可选：

```ts
export interface ScreenSafeRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface CanvasFloatingPopoverProps {
  ...
  readonly safeScreenRect?: ScreenSafeRect;
}
```

---

# 3.4 Floating UI usage

当前：

```ts
flip({
  boundary: domNode,
  padding
})

shift({
  boundary: domNode,
  padding
})
```

有 safe rect 时，计算：

```text
canvas DOM rect ∩ safeScreenRect
```

得到有效 rectangular boundary。

实现可采用 Floating UI 支持的：

```text
rootBoundary: Rect
```

配合：

```text
boundary: domNode
```

或等价 custom platform boundary。

关键不是具体 API 名，而是 invariant：

```text
仍由 Floating UI做 flip / shift
T3不自己 clamp x/y
```

---

# 3.5 Multiple active regions

如果 T4 提供：

```text
activeRegions[]
```

T3只做一个纯 region chooser：

## ADD

```text
apps/web-gen2/src/interaction/safeRegionSelection.ts
```

输入：

```text
anchor screen rect
preferred side
safeRect
activeRegions
```

输出：

```text
one chosen rectangular region
```

规则：

```text
1. anchor所在 region优先
2. 否则与 anchor最近 region
3. tie → larger usable area
4. none → safeRect
```

它不改 camera。

---

# 3.6 Arc / Composer anchor

### Action Arc

```text
anchor = target node authoritative rect
preferred region = target附近
```

### Composer

```text
anchor = target node / selection hull
```

local Composer不能：

```text
固定 bottom-center 360px
```

那是旧壳遗留思路。

---

# 3.7 T5 controls presentation, not collision math

T5可决定：

```text
Arc半径
Composer宽度
compact size
glyph body
animation
```

T5不写：

```text
if workViewWidth > 300 then left = ...
```

这些硬编码必须由 safe-region placement处理。

---

# 4. T3-C03-17 · ProfessionalWindowEnvironment Consumer
# UPSTREAM_GATED

## 4.1 Current-source result

在本次 current repo 搜索中，没有发现已经 landed 的：

```text
ProfessionalWindowEnvironment
occupiedRects
safeRect
safeInsets
activeRegions
```

正式 consumer contract。

因此：

```text
T4 seam 当前仍未成为 current source
```

这一点不能靠 T3假装已经存在。

---

# 4.2 T3 only defines a consumption shape

为了 exact construction plan 能继续，T3只定义**consumer-facing structural requirement**。

不在 T3 创建 store。

建议最终由 T4提供类似：

```ts
export interface ProfessionalWindowEnvironment {
  readonly viewportRect: ScreenRect;
  readonly occupiedRects: readonly ScreenRect[];
  readonly safeRect: ScreenRect;
  readonly activeRegions: readonly ScreenRect[];
  readonly immersive: boolean;
  readonly revision: number;
}
```

名字最终以 T4 current source为准。

T3不能要求 T4照抄这个 type 名。

重要的是字段语义。

---

# 4.3 T3 adapter port

## ADD only when T4 seam lands

建议位置：

```text
apps/web-gen2/src/interaction/windowEnvironmentPort.ts
```

但当前施工卡状态：

```text
UPSTREAM_GATED
DO NOT CREATE YET
```

等 T4 exact file出来以后再建 import/adapter。

---

# 4.4 Consumer behavior

每个 active surface：

```text
surface/canvasId
→ its current window environment
```

T3消费：

```text
safe region selection
overlay compact/suppress
Composer projection placement
Arc projection placement
tooltip suppression
```

T3不消费它来：

```text
move node
set viewport
re-layout world
change canonical object
```

---

# 4.5 Work View same-target promotion

当 local target被 T4 promotion进 Work View：

```text
ComposerDraftRegistry
→ same composerId
```

T3 snapshot输出：

```text
localProjection='suppressed-by-promotion'
workViewProjection='dominant'
```

不是：

```text
两个 Composer DOM都保持 active
```

Work View关闭：

```text
localProjection恢复
draft unchanged
```

---

# 4.6 Immersive

T4 immersive：

```text
可 hide local projection
```

但：

```text
draft / voice transcript / refs / run state仍保留
```

如果 Voice正在 recording：

```text
T4切 immersive不允许无声 cancel录音
```

需要：

```text
either preserve active projection
or explicit user-visible handoff
```

不能 silent lose state。

---

# 4.7 Camera invariant

Professional Work View open / resize：

```text
MUST NOT:
instance.setViewport(...)
auto pan
move node
reflow canvas world
```

Current Huabu wrapper-resize camera compensation是旧 panel行为，不是新 Work View默认实现机制。

如果 T4实现改变 canvas wrapper尺寸：

```text
T1/T4必须提供 explicit compensation bypass
```

T3不补这个坑。

---

# 5. T3-C03-18 · T3InteractionSnapshot

## 5.1 Goal

给 T5 / React host一个稳定、只读的“当前 T3到底发生什么”视图。

但不能造：

```text
T3GlobalMegaStore
```

---

# 5.2 ADD exact file

```text
apps/web-gen2/src/interaction/t3InteractionSnapshot.ts
```

只定义：

```text
snapshot type
compose function
```

不持久化。

---

# 5.3 Inputs

snapshot从各 owner读：

```text
ActionArc model/session
ComposerDraftRegistry
ReferencePickSession
Voice transient phase
ContextMenuSession
SemanticDropMachine
SemanticCarrySession
RelationHandleSession
GlythLocalState
Overlay arbitration result
surface identity
window environment adapter if available
presentation density if current target supplies it
```

---

# 5.4 Snapshot shape

建议：

```ts
export interface T3InteractionSnapshot {
  readonly surface: {
    readonly key: 'main'|'context'|'workflow';
    readonly canvasId: string;
  };

  readonly target?: {
    readonly key: string;
    readonly spatialIds: readonly string[];
    readonly density?: 'mark'|'summary'|'working'|'reading';
  };

  readonly actionArc: {
    readonly open: boolean;
    readonly actions: readonly ActionArcAction[];
    readonly visibility: OverlayVisibility;
  };

  readonly composer: {
    readonly composerId?: string;
    readonly projection:
      | 'closed'
      | 'local'
      | 'work-view-dominant'
      | 'suppressed-by-promotion';
    readonly focus:
      | 'none'
      | 'passive-empty'
      | 'passive-draft'
      | 'focused'
      | 'voice-recording';
    readonly refCount: number;
    readonly receiverState:
      | 'none'
      | 'resolved'
      | 'needs-choice';
    readonly runPhase:
      | 'idle'
      | 'submitting'
      | 'dispatching'
      | 'running'
      | 'stopping'
      | 'failed';
  };

  readonly referencePick: {
    readonly active: boolean;
  };

  readonly contextMenu: {
    readonly open: boolean;
  };

  readonly semanticTransfer: {
    readonly kind:
      | 'none'
      | 'left-give'
      | 'right-carry';
    readonly phase:
      | 'idle'
      | 'tracking'
      | 'receptive'
      | 'committing'
      | 'accepted'
      | 'failed';
    readonly projectionOutcome?:
      | 'place-at-target'
      | 'preserve-source';
  };

  readonly relation: {
    readonly phase:
      | 'idle'
      | 'armed'
      | 'dragging'
      | 'valid'
      | 'invalid'
      | 'committing'
      | 'failed';
  };

  readonly glyth?: GlythLocalState;

  readonly environment: {
    readonly safeRegionAvailable: boolean;
    readonly compactPressure:
      | 'none'
      | 'moderate'
      | 'severe';
  };
}
```

---

# 5.5 Snapshot invariant

Snapshot：

```text
READ ONLY
DERIVED
DISPOSABLE
```

不能：

```text
serialize to Core
persist to DB
become source of truth
```

如果 React host reload：

```text
重建 snapshot
```

---

# 5.6 Surface isolation

`composeT3InteractionSnapshot(...)` 必须显式接：

```text
SurfacePort / canvasId
```

所以：

```text
Main的 Composer
不能因为 Context切换
自动被当成 Context Composer
```

draft registry key也必须包含/绑定 target所处 surface identity where required。

---

# 5.7 Tests

## ADD

```text
apps/web-gen2/test/t3InteractionSnapshot.test.ts
```

至少：

```text
derived only
same owner states → deterministic snapshot
surface ids remain distinct
work-view promotion changes projection, not draft
semantic transfer projectionOutcome preserved
Glyth axes coexist
```

---

# 6. T3-C03-19 · T5 Final Engineering Input Table

这张是本轮交 T5 最重要的表。

T5不需要读 Core route，也不需要猜 gesture owner。

---

## 6.1 Action Arc

T5输入：

```text
target anchor
open / closed
action id
enabled
active
attention
safe region
compact pressure
```

T5决定：

```text
arc radius
satellite shape
glyph
hover label
spring/motion
```

T5不得改变：

```text
3 normal / 4 max
direct actions only
More/management separation
```

---

## 6.2 Compact Composer

T5输入：

```text
target anchor
projection local/work-view-dominant
focus state
draft presence
Reference chips
Receiver state
Voice state
Run phase
error
safe region
compact pressure
```

T5决定：

```text
shell
width
height within frozen compact bounds
chip form
waveform form
button anatomy
transition
fold body
```

T5不得：

```text
auto-open on multi-select
Selection自动进Reference
Voice自动Send
Provider selector
```

---

## 6.3 Reference Pick

T5输入：

```text
active
candidate eligible/invalid
ordered picked refs
Composer anchor remains
```

T5决定：

```text
candidate halo
Add Reference affordance
chip selected motion
canvas cursor treatment
```

---

## 6.4 Semantic Give

T5输入：

```text
left-give
tracking
candidate
receptive
invalid
landing proxy
committing
accepted/failed
projectionOutcome
```

### `place-at-target`

视觉要求：

```text
看起来“直接进去”
不显式回弹
proxy→real body handoff
```

### `preserve-source`

视觉要求：

```text
target被喂/接收
source回原场景
```

---

## 6.5 Right Carry

T5输入：

```text
armed
proxy
valid/invalid
committing
receipt
```

视觉不可造成：

```text
原对象真的被搬动
```

---

## 6.6 Relation

T5输入：

```text
handle availability
armed
live line
valid/invalid receptor
committing
settled
```

视觉必须和 Give明显不同。

---

## 6.7 Glyth

T5输入：

```text
selection:
rest / selected / engaged

receive:
idle / approach / receptive / committing / accepted / failed

run:
idle / working / waiting / attention

receiver:
none / current / other

presentation density:
mark / summary / working / reading
```

T5决定：

```text
morphology
breath
gaze
squash
blink
micro-motion
context mark
LOD
```

不得：

```text
重新画成 Provider/Agent card
永久展开诊断文字
```

---

## 6.8 Work View coexistence

T5输入：

```text
safe region
active regions
compact pressure
local projection dominant/suppressed
```

T5决定：

```text
compact morph
Arc fold
tooltip hide
Composer folding visual
```

不得：

```text
通过移动 Camera给窗口腾位置
```

---

# 7. Overlay Layer Contract v2

Current layer思想保留，但建议去掉：

```text
workView layer
```

因为 Work View不再由 T3层管理。

建议：

```ts
export const overlayLayers = {
  canvasAdornment: 10,
  nodeChrome: 20,
  semanticFeedback: 30,
  localAction: 40,
  composer: 50,
  localMenu: 60,
  modal: 70,
} as const;
```

映射：

```text
selection / resize
→ nodeChrome

drop/carry/relation live feedback
→ semanticFeedback

Action Arc
→ localAction

Composer
→ composer

Context Menu / active anchored popover
→ localMenu
```

具体 final z tokens需和 T5/T4总视觉层级回填。

不要在这一轮提前写死 CSS `z-index: 999999`。

---

# 8. Current `CanvasFloatingPopover` z-index note

Current源码固定：

```text
zIndex: 1000
```

这在现有 Huabu app里是统一 floating chrome策略。

Phase B最终落地时：

```text
T5/T4如果建立全局 Professional Window z-layer contract
```

则应把：

```text
1000
```

迁成共享 token。

但这属于最终视觉/窗口层级回填，不在 T3 C1-S3D擅自改。

标记：

```text
T5/T4 CROSS-REVIEW
```

---

# 9. Exact File Inventory

## MODIFY — web-gen2

```text
apps/web-gen2/src/interaction/overlayArbitration.ts
apps/web-gen2/test/overlayArbitration.test.ts
apps/web-gen2/src/index.ts
```

---

## ADD — web-gen2

```text
apps/web-gen2/src/interaction/actionArcModel.ts
apps/web-gen2/src/interaction/safeRegionSelection.ts
apps/web-gen2/src/interaction/t3InteractionSnapshot.ts

apps/web-gen2/test/actionArcModel.test.ts
apps/web-gen2/test/safeRegionSelection.test.ts
apps/web-gen2/test/t3InteractionSnapshot.test.ts
```

---

## UPSTREAM-GATED — do not create until T4 exact seam lands

```text
apps/web-gen2/src/interaction/windowEnvironmentPort.ts
```

最终名称跟 T4 exact current source对齐。

---

## MODIFY — Huabu / T1 cross-review

```text
huabu/apps/web/src/components/Common/CanvasFloatingPopover.tsx
```

只增加 generic：

```text
safe screen collision boundary
```

不加入：

```text
WorkView
LCOS
Glyth
Composer
```

业务词。

---

## KEEP

```text
huabu/apps/web/src/components/Panels/Canvas/FloatingToolbars/NodeFloatingToolbar.tsx
huabu/apps/web/src/lcos-seam/nodePresentation.tsx

apps/web-gen2/src/presentation/nodePresentation.ts
apps/web-gen2/src/presentation/rendererRegistry.ts
apps/web-gen2/src/spatial/surfacePort.ts
```

---

# 10. Construction Order

建议真实施工：

```text
STEP 1
actionArcModel
+ tests

STEP 2
overlayArbitration v2 pure rewrite
+ replace obsolete exclusive Work View tests

STEP 3
safeRegionSelection pure function
+ tests

STEP 4
T1 review / generic CanvasFloatingPopover safe boundary
+ Huabu positioning tests / browser checks

STEP 5
T3InteractionSnapshot
+ tests

STEP 6
Surface isolation tests

STEP 7
等待/消费 T4 ProfessionalWindowEnvironment exact seam
→ windowEnvironmentPort adapter

STEP 8
Work View coexistence browser acceptance

STEP 9
交 T5 state table
```

---

# 11. Real Browser Acceptance

## BA-36 Arc local placement

```text
select/engage target
→ Arc anchors to current live target rect
→ target near viewport edge时 flip/shift
→ no overflow into occupied Work View region
```

---

## BA-37 Composer safe placement

```text
Composer focused
→ open Work View
→ Composer state stays
→ projection shifts/compacts into safe region
→ textarea focus remains
→ draft unchanged
```

---

## BA-38 Voice + Work View resize

```text
voice recording
→ Work View resize
→ recording not silently canceled
→ Composer remains operable
```

---

## BA-39 Passive draft pressure

```text
draft exists but Composer unfocused
→ severe safe-space pressure
→ may compact/fold
→ draft remains
```

---

## BA-40 Tooltip gives way first

```text
Arc/Composer需要空间
→ tooltip/nonessential label先 suppress
```

---

## BA-41 Same target promotion

```text
local Composer has draft
→ same target promoted to Work View
→ Work View becomes dominant Composer projection
→ local duplicate disappears/folds
→ only one draft
```

---

## BA-42 Restore

```text
close Work View
→ local Composer restores
→ exact draft/ref/receiver/run state remains
```

---

## BA-43 Camera freeze

```text
record camera transform
open Work View
resize Work View
dock/undock Work View
→ ReactFlow viewport transform unchanged
```

这是强制验收，不是“肉眼感觉差不多”。

---

## BA-44 Node world freeze

```text
record node world x/y
open/resize Work View
→ node world geometry byte-equivalent
```

---

## BA-45 Surface isolation

```text
Main open local Composer
switch Context
→ Main draft retained
→ Context不错误显示 Main local overlay
switch back Main
→ recover
```

---

# 12. Recovery / Failure

## safe environment temporarily unavailable

例如 T4 mount transition第一帧：

```text
safeRect unavailable
```

fallback：

```text
CanvasFloatingPopover current canvas boundary
```

但：

```text
不能 move camera
```

下一帧 environment ready：

```text
reposition only
```

---

## Work View destroyed unexpectedly

```text
environment revision changes
→ local overlay recompute
→ draft/state unchanged
```

---

## safeRect too small for active Composer

优先级：

```text
1. flip
2. shift
3. compact lower-priority chrome
4. compact passive Composer
5. active Composer保持可操作，允许内部 scroll
```

不能：

```text
直接 close focused Composer
```

---

# 13. Cross-thread Handoff

## To T1

需要 T1确认/施工：

```text
CanvasFloatingPopover generic safe boundary
camera-free Work View layout compatibility
live anchor geometry remains authoritative
```

---

## To T4

T3等待：

```text
ProfessionalWindowEnvironment exact file/symbol
occupied rect semantics
safe region semantics
active region semantics
same-target Work View identity handoff
```

T3不要求 T4重新讨论产品，只要交 exact engineering seam。

---

## To T5

T5现在可以正式基于：

```text
C1-S0
C1-S1
C1-S2
C1-S3A
C1-S3B
C1-S3C
C1-S3D
```

锁：

```text
Action Arc
Compact Composer
Reference Pick
Voice inline states
Receiver
Semantic Give
Right Carry
Relation
Glyth local reactions
safe-space morph
Work View coexistence
```

最终视觉。

---

# 14. Architecture Conflict Gate

本轮发现两处 current-source / Phase-B差异：

### 1. Work View exclusive overlay rule

```text
pure arbitration policy mismatch
```

直接 rewrite即可。

### 2. Canvas wrapper resize会补偿 camera

如果新 Work View继续通过 wrapper resize实现：

```text
会违反 camera freeze
```

但可通过：

```text
Professional Work View改 screen-space occupation
+
safeRect consumer
```

或 T1/T4 narrow bypass解决。

当前不需要改 Core/schema，也不需要第二 Canvas architecture。

因此：

```text
ARCHITECTURE CONFLICT = 0
COORDINATOR ESCALATION = NO
```

但：

```text
T4 IMPLEMENTATION MUST NOT REUSE LEGACY WRAPPER-RESIZE BEHAVIOR UNCHANGED
```

这条必须写进跨线程工程交接。

---

# 15. Blast Radius

## ActionArcModel

```text
LOW
```

pure headless。

## overlayArbitration rewrite

```text
LOW-MEDIUM
```

pure逻辑，但影响所有 local chrome visibility。

## CanvasFloatingPopover safe boundary

```text
MEDIUM
```

共享 Huabu primitive，必须回归：

```text
NodeFloatingToolbar
MultiSelectToolbar
EdgeStyleToolbar
```

确保没有新定位回归。

## Work View environment integration

```text
MEDIUM
```

因为跨 T3/T4/T1，但无 canonical data风险。

---

# 16. No-go List

```text
T3自己建 WorkViewRectStore

Work View打开
→ clear local Composer

Work View打开
→ move camera

Work View打开
→ re-layout nodes

Composer和WorkView各持一份draft

Action Arc塞 management actions

各 renderer自己 absolute-position local buttons

自己算 left/top clamp
而绕过 CanvasFloatingPopover/Floating UI

T5 CSS里硬编码 workView width来移动 Composer

Main/Context/Workflow共享一个 overlay state
```

---

# 17. C1-S3D Done Checklist

- [x] current overlayArbitration重新核实
- [x] obsolete exclusive Work View rule exact定位
- [x] current CanvasFloatingPopover exact能力核实
- [x] current safe-area gap定位
- [x] current Canvas wrapper camera compensation风险定位
- [x] SurfacePort隔离核实
- [x] existing presentation density seam核实
- [x] Action Arc exact model
- [x] local overlay priority rewrite
- [x] active Composer preservation
- [x] safe region selection
- [x] generic Huabu safe-boundary patch
- [x] T4 upstream gate
- [x] same-target promotion
- [x] T3InteractionSnapshot
- [x] T5 final state table
- [x] browser acceptance
- [x] recovery
- [x] cross-thread handoff
- [x] blast radius
- [x] Architecture Conflict = 0

---

# 18. C1 status after S3D

```text
C1-S0  Phase-B Contract Lock
✅

C1-S1  Current Source Exact Map
✅

C1-S2  Engineering Seam Skeleton
✅

C1-S3A Host Interaction / Context Menu / Glyth
✅

C1-S3B Composer Data Plane
✅

C1-S3C Semantic Drag Plane
✅

C1-S3D Local Overlay / Work View / T5 Consumption
✅
```

到这里：

> **T3 主体功能施工卡已经闭合。**

还没有做完的不是“功能想法”，而是施工收束：

```text
C1-S4
Integrated Verification / Test / Browser / Recovery / Blast-Radius Matrix

C1-S5
T5 final visual回填后
Exact JSX / CSS / token / motion insertion cards

C1-FINAL
T3正式源码施工正本
```

---

# 19. Next

下一步建议立即进入：

# `C1-S4 · Integrated Verification Matrix`

它会把 S3A/S3B/S3C/S3D 不再分散地看，而是串起来做完整用户链：

```text
click
→ Arc
→ Composer
→ Reference
→ Voice
→ Receiver
→ Run

left drag
→ Give
→ target commit
→ receipt

right drag
→ Carry
→ no context menu

Relation
→ Core-first edge

Work View
→ safe area
→ same draft
→ camera freeze
```

并给出：

```text
exact test file
unit / integration / browser
failure injection
rollback
blast radius
must-pass gate
```

S4完成以后，T3就可以非常放心地停在“等待T5最终视觉回填”的位置，不会再有那种视觉稿回来之后才发现底层行为根本没验收的经典节目。
