# LCOS Gen2 · T3 · C1-S2
# Source Engineering Seam Skeleton
## Action Arc / Compact Composer / Reference / Voice / Receiver / Semantic Give / Right Carry / Relation / Glyth / Work View Occupancy

> 日期：2026-09-06  
> 状态：`C1-S2 COMPLETE`  
> 基线：`DZWFLi/LCOS_Gen2 @ c2ff890a867922a1256572199458438572eb0a8c`  
> 前置：`C1-S0 · Phase-B Interaction Contract Lock` + `C1-S1 · Current Source Exact Map`  
> 下一步：`C1-S3 · Exact File Construction Cards + Tests + Migration Order`
>
> 本稿只定义 **工程接缝骨架**。不写最终 JSX/CSS，不替 T5 决定最终视觉，不重新裁决 Phase B 产品语义。
>
> 每一节严格分成：
>
> ```text
> CURRENT SOURCE FACT
> → ENGINEERING DECISION
> → EXACT SEAM
> → OWNER / CONSUMER
> → ADOPT / WRAP / LIFT / RETIRE
> → T5 STATE CONTRACT
> → BLAST RADIUS
> ```

---

# 0. Executive Verdict

C1-S1 已证明当前 T3 不缺“框架”，缺的是几条很薄的连接线。

当前最正确的施工模型不是：

```text
再造一套 LCOS Canvas
再造一套 Pointer Router
再造一套 Selection
再造一套 Chat / Composer
再造一套 Relation
```

而是：

```text
Huabu Spatial Body
    │
    ├─ PointerRouterCore
    ├─ ReactFlow Selection / Drag
    ├─ NodeWrapper interaction phase
    ├─ CanvasFloatingPopover / FloatingToolbar
    └─ mature input mechanics

         │ neutral HostSeam
         ▼

LCOS T3 headless interaction contracts
    │
    ├─ click / reclick / dblclick intent
    ├─ Action Arc view model
    ├─ Composer draft
    ├─ Reference Pick session
    ├─ Semantic Give / Right Carry session
    ├─ Receiver / Run / Voice typed clients
    └─ relation / target semantic dispatch

         │ read-only view state
         ▼

T5 final visual bodies / motion / LOD
```

**本轮 Architecture Conflict = 0。**

需要改 Huabu thin fork 的地方只有两类，而且必须保持 domain-free：

1. **补 neutral node interaction callback seam**，用于 click / dblclick / context menu；
2. **补 neutral semantic-drop observation seam**，让 LCOS 在不拥有 drag geometry 的前提下判断“这是 Move 还是给目标 / 借给目标”。

其它 T3 逻辑都可以留在 `apps/web-gen2` 的 pure/headless 层，Core canonical 能力继续留 `apps/local-core`。

---

# 1. 不可突破的 owner 边界

## 1.1 Huabu 继续唯一拥有

```text
pointer arbitration
node hit / physical selection
node move geometry
multi-selection bounds
viewport / camera
resize
snap
physical drag lifecycle
screen-space floating primitive
NodeWrapper interaction phase
```

任何 T3 施工卡如果出现：

```text
newPointerRouter
newSelectionStore
newNodePositionEngine
newCanvasDragEngine
```

直接判错。

---

## 1.2 Local Core 继续唯一拥有

```text
Run truth
Receiver truth
Conversation identity
Relation truth
Context Mapping / membership / scope / workflow domain mutation
Voice transcription service
canonical entity identity
```

T3 只允许：

```text
typed client
command adapter
transient UI state
```

---

## 1.3 T3 自己拥有

```text
object-local gesture grammar
Action Arc invocation grammar
Composer draft / Run draft UI state
Reference Pick transient session
Voice insertion into draft
Receiver choice for this Run
Semantic Give / Right Carry transient session
Relation-handle invocation
Glyth local click/reclick/receive behavior grammar
local overlay arbitration
```

---

## 1.4 T3 只消费其它线程 seam

```text
T1 → Visible Host geometry / spatial reflow
T2 → Worksite Enter / Back / Arrival / Pin
T4 → ProfessionalWindowEnvironment / Assembly target / Work View
T5 → final visual body / motion / LOD
T6/Core → canonical target semantics / membership / mapping / receiver truth
```

---

# 2. Seam A · Huabu Neutral Node Interaction Intent

## CURRENT SOURCE FACT

当前 `CanvasHostExtension` 只有：

```ts
nodeTypes
overlays
recognizers
connectIntent
```

对应：

```text
huabu/apps/web/src/lcos-seam/types.ts
apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
```

当前 `Canvas.tsx`：

- Touch node tap 最终走 `selectNodes([nodeId])`；
- double-click 内联处理 Huabu `EXPANDABLE_TYPES`；
- root `onContextMenu` 已经统一抑制 non-editable browser context menu；
- 没有 domain-free 的 host node click / dblclick / context-menu intent。

---

## ENGINEERING DECISION

**扩现有 HostSeam，不新增第二个 host framework。**

增加一个很窄的 neutral node interaction contract：

```ts
CanvasHostNodeInteraction
```

只转发物理事实：

```text
nodeId
nodeType
surface/canvasId
pointer kind
client point
wasSelected
selectionIds
interaction kind
```

**绝不出现：**

```text
ConversationId
ArtifactId
Glyth
Context Mapping
Assembly
Run
```

Huabu 不知道这些词。

---

## EXACT SEAM

### Modify

```text
huabu/apps/web/src/lcos-seam/types.ts
```

新增：

```ts
CanvasHostNodeInteractionContext
CanvasHostNodeInteraction
CanvasHostInteractionOutcome = 'pass' | 'handled'
```

建议事件面：

```ts
onNodeClick?
onNodeDoubleClick?
onNodeContextMenu?
```

### Mirror

```text
apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
```

### Consume

```text
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

原则：

```text
host handled
→ 不再执行该 host-owned local action

host pass
→ Huabu stock behavior 原样继续
```

特别是 double-click：

```text
LCOS lcos/conversation handled
→ T2 Worksite Enter

Huabu native image/pdf/web/note pass
→ 现有 openPreviewNode
```

---

## ADOPT / WRAP / LIFT / RETIRE

```text
ADOPT  Huabu existing node event points
WRAP   CanvasHostExtension with one neutral callback surface
RETIRE none
```

---

## T5 STATE CONTRACT

T5 不直接监听原始 Canvas event，只收到 T3 已裁决后的：

```ts
LocalTargetEngagement =
  | 'selected-only'
  | 'local-actions-open'
  | 'deep-entry-requested'
```

Glyth：

```text
first click
→ selected-only

click selected Glyth
→ local-actions-open

double-click
→ deep-entry-requested
```

---

## BLAST RADIUS

低。

```text
Huabu seam type
HostSeam mirror
adapter test
Canvas event wiring
```

不碰 Core / RFS schema / Selection owner。

---

# 3. Seam B · Node-Level vs Canvas-Level Overlay Responsibility

## CURRENT SOURCE FACT

`apps/web-gen2/src/interaction/overlayArbitration.ts` 自己已经写明：

```text
node-level overlay
→ NodeWrapper existing slots

canvas-level overlay
→ Host overlay container
```

Huabu `NodeWrapper` / `NodeFloatingToolbar` 已有：

```text
toolbar
actions
overlayContent
interaction priority
live node geometry
```

HostSeam 已有：

```text
overlays[]
```

---

## ENGINEERING DECISION

T3 不再把所有浮层塞进一个万能 overlay。

冻结成两层：

### Node-local

```text
Action Arc
Relation Handle
Glyth local receive affordance
single-node local badge
```

优先走：

```text
NodeWrapper / node renderer presentation seam
```

### Canvas-local

```text
Compact Composer
multi-selection Composer
Reference Pick canvas feedback
Semantic Carry proxy / target preview
Right-click management menu
```

走：

```text
HostSeam.overlays
```

这样既不出现 “node Christmas tree”，也不需要 T3 重新算节点坐标。

---

## T5 STATE CONTRACT

T3 给 T5 的不是绝对坐标，而是：

```ts
AnchorIntent =
  | { kind: 'node'; spatialId: string }
  | { kind: 'selection-hull'; spatialIds: readonly string[] }
  | { kind: 'pointer'; clientX: number; clientY: number }
```

真正：

```text
flow rect
screen rect
flip
shift
viewport clamp
```

继续由 Huabu floating primitive / geometry owner 解决。

---

# 4. Seam C · Headless T3 Interaction Snapshot, NOT Mega Store

## ENGINEERING DECISION

T3 需要给 T5 一个统一可读的状态表面，但不能因此造 `LcosEverythingStore`。

方案：

```text
多个小 owner
→ 组合成 read-only snapshot
→ T5 消费 snapshot
```

---

## EXACT NEW PURE FILE

```text
apps/web-gen2/src/interaction/t3InteractionSnapshot.ts
```

它只定义类型 + compose helper，不持久化任何状态。

建议组合：

```ts
T3InteractionSnapshot {
  actionArc
  composer
  referencePick
  semanticCarry
  contextMenu
  relationHandle
  glythLocal
}
```

各子状态仍独立 owner。

---

## T5 CONTRACT

T5 可以放心把：

```text
hover
selected
receptive
committing
working
waiting
attention
receiver-current
voice-recording
reference-pick
```

映射成视觉/动效，但不得写回 canonical truth。

---

# 5. Seam D · Action Arc

## CURRENT SOURCE FACT

当前：

```text
overlayArbitration.ts
→ 已有 'action-arc' kind
```

但 current HEAD 没有 Action Arc React body。

`rendererRegistry.ts` 已有 capability：

```text
compose
connect
reference
inspect
edit
place
```

---

## ENGINEERING DECISION

Action Arc 先做 **headless action model**，最终图形由 T5。

不按 entity taxonomy 写：

```text
if Artifact...
if Conversation...
if Skill...
```

而是按 capability 映射。

---

## EXACT NEW PURE FILE

```text
apps/web-gen2/src/interaction/actionArcModel.ts
```

建议：

```ts
ActionArcActionId =
  | 'ai-work'
  | 'assembly'
  | 'relation'
  | 'pin'
```

但可见性必须由输入 capability / owner port 决定；T3 不假定四个总是出现。

输出最多：

```text
3 normal
4 max
```

与冻结一致。

---

## ACTION DISPATCH OWNER

```text
ai-work
→ T3 Composer

relation
→ T3 Relation Handle state

assembly
→ injected T4 AssemblyTargetPort

pin
→ injected T2 PinPort
```

所以 T3 不偷 T2/T4 的 domain owner。

---

## T5 STATE CONTRACT

```ts
ActionArcViewModel {
  open
  targetSpatialId
  actions: {
    id
    enabled
    active
    attention
  }[]
}
```

无强制常驻文字 label。

---

# 6. Seam E · Compact Composer Draft

## CURRENT SOURCE FACT

current `apps/web-gen2` 没有 Composer body / draft owner。

Huabu `ChatInput.tsx` 已验证成熟机械：

```text
controlled value
IME-safe Enter
2–5 line autoresize
inner scroll
paste/drop attachment
send/stop
history
```

Huabu Chat draft 已是外层 `threadId → draft` owner，而不是 Input 自己偷状态。

---

## ENGINEERING DECISION

**借 ChatInput 的输入机械，不借 ChatPanel 的业务语义。**

LCOS Composer 需要自己的 target-local draft model。

---

## EXACT NEW PURE FILE

```text
apps/web-gen2/src/interaction/composerDraft.ts
```

最小状态：

```ts
ComposerDraft {
  composerId
  target
  text
  references
  receiverOverride?
  runPhase
  lastError?
}
```

明确不放：

```text
provider picker
model picker
session diagnostics
token info
Selection copy
Relation
```

---

## Reference composition

直接组合现有：

```text
referenceController.ts
```

Composer open：

```text
openComposerReferences(composerId)
→ EMPTY
```

Selection 不自动进入 References。

---

## Failure contract

```text
Run submit failed
→ draft text KEEP
→ ordered refs KEEP
→ receiver override KEEP
→ error state visible
```

只有明确成功 / user clear 才清。

---

## Multi-selection

```text
multi-select
→ no composer

explicit AI Work
→ create composer draft whose target is Selection Snapshot
```

Selection Snapshot 只用于 target 范围，仍不等于 Reference。

---

## T5 STATE CONTRACT

```ts
ComposerViewModel {
  open
  anchor
  targetSummary
  text
  referenceChips
  receiver
  voicePhase
  runPhase
  error
}
```

T5 只负责 Compact shell、spacing、motion、iconography。

---

# 7. Seam F · Reference Pick Session

## CURRENT SOURCE FACT

`referenceController.ts` 已经是正确的 ordered explicit refs owner。

`pointerIntent.ts` 已经冻结：

```text
Shift = additive Selection
Ctrl/Cmd = Reference accelerator
Shift wins
```

但没有 explicit Reference Pick session。

---

## ENGINEERING DECISION

新增一个很小的 transient session，**不要改 ReferenceController 的职责**。

---

## EXACT NEW PURE FILE

```text
apps/web-gen2/src/interaction/referencePickSession.ts
```

建议状态：

```ts
ReferencePickSession =
  | { active: false }
  | {
      active: true
      composerId: string
      previousFocus?: ...
    }
```

它不存 refs。

实际 refs 继续在：

```text
ReferenceControllerState
```

---

## Pointer path

### Primary

```text
Composer + Reference
→ activate ReferencePickSession
→ canvas candidate click
→ resolve canonical ProjectionBinding
→ toggleReference
→ Selection unchanged
```

### Accelerator

```text
Ctrl/Cmd click
→ same toggleReference path
```

### Escape

```text
Esc
→ close Reference Pick only
→ Composer stays
→ Selection stays
```

---

## Identity gate

继续直接消费：

```text
nodeAdoption.ts / ProjectionBinding
```

无 canonical identity：

```text
fail-close
```

不猜 node label。

---

# 8. Seam G · Voice → Draft, Not Voice Workbench

## CURRENT SOURCE FACT

Core 已有：

```text
POST /runtime/voice/transcriptions
multipart/form-data
```

`web-gen2/backend/client.ts` 当前只会 JSON stringify。

---

## ENGINEERING DECISION

Voice 只做两层：

```text
CoreVoiceClient
+
voiceTextMerge pure function
```

不造 Voice Workbench / provider UI。

---

## EXACT FILES

### Modify

```text
apps/web-gen2/src/backend/client.ts
```

只加一个 narrow raw/form-data transport seam，例如：

```ts
postFormData<T>(path, formData, signal?, headers?)
```

关键：

```text
不要手设 multipart Content-Type
让 browser/fetch 写 boundary
```

### Add

```text
apps/web-gen2/src/backend/voice.ts
```

职责：

```text
FormData
→ /runtime/voice/transcriptions
→ typed response
```

### Add pure merge

```text
apps/web-gen2/src/interaction/voiceTextMerge.ts
```

冻结规则：

```text
selected text exists
→ replace selection

caret only
→ insert at caret

no caret / no selection
→ append
```

---

## T5 STATE CONTRACT

```text
idle
recording
transcribing
error
```

Stop 后：

```text
text changes
but NEVER auto-Run
```

---

# 9. Seam H · Receiver / Run Ports

## CURRENT SOURCE FACT

Core 已经存在完整 Run / Receiver routes。

而 `createLcosHostRuntime.ts` 明确写了：

```text
Gen2Host 不扩成 199-method monolith
按功能 dock 拆 client
```

并登记：

```text
run
voice
workflow
skill
workbench
```

---

## ENGINEERING DECISION

**不把 Run / Receiver / Voice 全塞进 `Gen2Host`。**

T3 直接新增小 typed clients，由 Composer controller 注入。

---

## EXACT NEW FILES

```text
apps/web-gen2/src/backend/runs.ts
apps/web-gen2/src/backend/receiver.ts
```

### `CoreRunClient`

只包已有：

```text
create run
cancel
dispatch
recover
read events / state where Composer needs
```

### `CoreReceiverClient`

只包已有：

```text
list connected conversations
get receiver-binding
set receiver-binding
```

---

## EXACT NEW PURE ADAPTER

```text
apps/web-gen2/src/interaction/runSubmission.ts
```

职责：

```text
ComposerDraft
+ ordered references
+ receiver override / active receiver
+ target adapter
→ CreateRun request
```

它不执行网络。

---

## Receiver invariant

必须由测试锁死：

```text
per-run receiver change
≠ set Project Active Receiver
```

只有明确 “Set Current” command 才允许调用：

```text
POST receiver-binding
```

普通 Send：

```text
receiverRef only goes into this Run request
```

---

# 10. Seam I · Semantic Give / Right Carry

这是 C1-S2 最关键的一条。

## CURRENT SOURCE FACT

Huabu：

```text
owns physical drag geometry
owns pointer router
owns node hit test
owns drag snapshot / undo / snap / reparent
```

LCOS：

```text
semanticDropMachine.ts
```

已有 lifecycle mechanics，但 destination 还是旧：

```text
left / bottom edge slot
```

---

## ENGINEERING DECISION

**保留 lifecycle，替换 destination taxonomy。**

并严格拆开：

```text
Huabu Move
vs
T3 Semantic Give
vs
T3 Right Carry
vs
Relation Handle
```

---

## 10.1 Left drag blank = Huabu Move

不经过 Core semantic command。

```text
source physical position changes
→ Huabu onNodeDragStop
→ existing snap/reparent/autosave/undo
```

T3 不碰。

---

## 10.2 Left body drag onto semantic target = Give / Join / Use

流程：

```text
Huabu physical drag starts normally
→ T3 observes candidate target
→ target adapter resolves one natural semantic
→ semantic target becomes receptive
→ pointer release
→ source restores to pre-drag position if operation is non-Move
→ T3 dispatches target semantic command
→ accepted / failed receipt
```

这里最重要的是：

> T3 不自己决定 `Artifact→Glyth`、`Artifact→Collection`、`Skill→Workflow` 的 domain mutation。

它只请求目标 owner：

```ts
SemanticTargetAdapter.resolve(source, target, gesture)
```

返回：

```ts
SemanticAdmission {
  operation
  sourceDisposition: 'restore' | 'keep'
  command
}
```

其中 command 由对应 domain owner 执行。

---

## 10.3 Right drag = Borrow / Carry proxy

这条不能复用 stock node move，因为原对象从一开始就不应移动。

因此：

```text
right-button pointerdown
→ dedicated host recognizer CLAIM
→ source stays
→ canvas overlay renders ghost/proxy
→ target approach/receptive feedback
→ drop commit
→ proxy disappears
```

### Exact new Huabu-side recognizer glue

实际 DOM recognizer 必须在可以看到 Huabu `PointerRecognizer` 的 host composition 层创建，然后通过现有：

```text
HostSeamOptions.recognizers
```

注入。

**不新增 Router。**

Recognizer id 建议：

```text
lcos/semantic-carry
```

---

## 10.4 Relation Handle

完全不进入 Semantic Give / Carry state machine。

```text
Relation Handle drag
→ existing connectIntent
→ Core Relation first
→ Huabu edge projection
```

四种手势从源码 owner 上就分开，避免后面 UI 又把它们搅成一个 chooser。

---

# 11. Seam J · semanticDropMachine Phase-C Migration

## RETIRE

当前以下字段/逻辑退休：

```text
DropDestination.kind = 'slot'
anchor = left|bottom
anchoringAt(...edge band...)
inDropPreviewCarryZone(...edge band...)
edgeScrollBand
dwellBand for left/bottom dock
```

它们是 Phase-A edge-dock 时代遗留。

---

## KEEP

保留：

```text
idle
tracking
preview
committing
failed
payload lifecycle
recoverable failure
```

`dwell` 是否保留不再作为“边缘进入条件”，只允许用于 target stability / remote portal 等真正需要短 dwell 的场景。

**不允许所有本地 target 强制 dwell。**

Phase B 的“能直接就直接”优先。

---

## NEW PURE TARGET SHAPE

建议迁移为：

```ts
SemanticTargetRef {
  kind: 'node' | 'remote-target'
  spatialId?: string
  targetKey: string
}

SemanticDropDestination {
  target: SemanticTargetRef
  operation: string
  sourceDisposition: 'restore' | 'keep'
}
```

注意：

```text
operation 是 target adapter 解析结果
不是 UI taxonomy picker
```

---

# 12. Seam K · Huabu Semantic Drop Observation

## WHY A SECOND SMALL HUABU SEAM IS NECESSARY

当前 mouse left-drag 很大一部分是 ReactFlow native drag，不一定由 host recognizer ownership 接管。

因此只靠 `hostExtension.recognizers` 不足以稳定覆盖：

```text
mouse left-drag body → target semantic drop
```

但我们也绝不能把 LCOS domain semantics塞进 Huabu store。

---

## ENGINEERING DECISION

给 `CanvasHostExtension` 增加一个 **domain-free drag observation/disposition seam**。

名字可以最终在 C1-S3 定，但职责必须严格窄：

```ts
CanvasHostNodeDropIntent
```

Huabu 只提供：

```text
source node ids
target node id or null
screen release point
button/pointer type
surface id
pre-drag geometry restoration capability
```

Host 返回：

```text
native-move
or
host-semantic + sourceDisposition
```

Huabu 只执行空间处分：

```text
keep physical placement
or
restore physical placement
```

至于：

```text
这是 Context Mapping 还是 Collection membership
```

Huabu 永远不知道。

---

## EXACT MODIFY CHAIN

```text
huabu/apps/web/src/lcos-seam/types.ts
apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

这与 Node Interaction seam 走同一条 thin-fork chain，不再开第二条扩展机制。

---

# 13. Seam L · Semantic Target Adapter

## ENGINEERING DECISION

为了保证 T3 不越权替 Collection / Scope / Workflow / Conversation 定语义，新增一个 **port interface**，不是 registry-of-everything。

---

## EXACT NEW PURE FILE

```text
apps/web-gen2/src/interaction/semanticTargetAdapter.ts
```

建议接口：

```ts
interface SemanticTargetAdapter {
  canReceive(source, target, gesture): boolean
  resolve(source, target, gesture): SemanticAdmission | null
  commit(admission): Promise<SemanticReceipt>
}
```

但实际 adapter 实例由目标 domain owner 注入。

T3 自己只负责：

```text
gesture
candidate target
receptive state
source disposition
receipt
```

---

## Example ownership only, NOT new product semantics

```text
Conversation/Glyth adapter
→ Core/T6 owns durable Context Mapping

Collection adapter
→ Collection owner owns membership

Scope adapter
→ T4 owns working-scope admission

Workflow adapter
→ T4 owns add-to-work / Skill use
```

T3 不写这些 canonical mutations。

---

# 14. Seam M · Relation Handle

## CURRENT SOURCE FACT

已有完整 Core-first path：

```text
hostConnectIntent.ts
→ Gen2Host.connect
→ CoreRelationClient.createRelation
→ RelationProjection
→ Huabu edge
```

`Canvas.tsx` 也已经先问 `connectIntent`，Core reject 时不落 fake native edge。

当前唯一 placeholder：

```text
resolveConnectKind()
→ references
```

---

## ENGINEERING DECISION

Relation Handle **直接 Wrap 现有 connect path**。

不新增：

```text
RelationStore
Relation API
Relation edge creator
```

---

## Phase-C resolver rule

关系 handle 不弹 kind chooser。

如果 UI 没有显式 canonical relation kind signal：

```text
neutral Project Relation
→ current Core generic fallback `references`
```

只有调用方已有明确 canonical capability 时，才可传：

```text
uses
depends-on
derived-from
...
```

绝不让用户先填关系类型表单。

---

## T5 STATE CONTRACT

```text
hidden
available
armed
dragging
valid-target
invalid-target
committing
```

线本身继续是 Huabu edge projection，不由 T5 另画一份永久真相。

---

# 15. Seam N · Glyth Local Interaction Behavior Contract

## CURRENT SOURCE FACT

`rendererRegistry.ts` 已经有：

```text
lcos/conversation
```

family，并带：

```text
place
reference
connect
compose
```

但真实 Glyth morphology 尚未 landed。

---

## ENGINEERING DECISION

T3 不画 Glyth creature。

T3 只提供一个独立、稳定的 behavior state contract 给 T5。

---

## EXACT NEW PURE FILE

```text
apps/web-gen2/src/interaction/glythLocalState.ts
```

建议状态轴彼此正交，不搞一个 19-value mega enum：

```ts
selection: 'rest' | 'selected' | 'engaged'
receive: 'idle' | 'approach' | 'receptive' | 'committing' | 'accepted' | 'failed'
run: 'idle' | 'working' | 'waiting' | 'attention'
receiver: 'none' | 'current' | 'other'
```

T5 决定：

```text
呼吸
朝向
缩放
微位移
亮度
边缘反应
触手/光带/轮廓等最终表现
```

---

## Gesture contract

```text
first click
→ selection=selected
→ NO Arc / Composer

click selected Glyth
→ selection=engaged
→ Arc + Composer open

double-click
→ injected T2 WorksiteNavigationPort.enterConversation
→ same Conversation

body Give approaching Glyth
→ receive=approach/receptive

accepted
→ receive=accepted
→ source returns
```

---

# 16. Seam O · Work View Occupancy / SafeRect Consumption

## CURRENT SOURCE FACT

`overlayArbitration.visibleOverlays()` 当前：

```ts
if (workViewOpen) return ['work-view']
```

这是旧的 exclusive model。

Phase B 已冻结：

```text
Work View does not move camera
Main nodes do not relayout
active local overlay may survive
screen-space UI must consume occupied/safe rect
```

---

## ENGINEERING DECISION

T3 不拥有 Work View。

因此 future arbitration 应改成：

```text
Work View = environment input
不是“把所有 T3 overlay 杀掉”的 primary mode
```

---

## EXACT MODIFY

```text
apps/web-gen2/src/interaction/overlayArbitration.ts
apps/web-gen2/test/overlayArbitration.test.ts
```

但必须等 T4 的：

```text
ProfessionalWindowEnvironment
occupiedRects / safeRect / activeRegions
```

接口落地后再接。

在此之前 C1-S3 只能写：

```text
UPSTREAM_GATED
```

不能让 T3 自己发明第二套 Window Rect store。

---

## T5 CONTRACT

T5 最终只收到：

```text
preferred side
actual safe side
compact state
occluded / suppressed
```

而不是自己去读 DOM 猜 Work View 占位。

---

# 17. Seam P · Right-click Management Menu

## CURRENT SOURCE FACT

Huabu root 已统一处理 `contextmenu`，editable/link 保留，canvas non-editable 不直接交 browser。

Huabu 也已有成熟 DropdownMenu / command mechanics。

但 HostSeam 没有 node context-menu callback。

---

## ENGINEERING DECISION

依赖 Seam A 的：

```text
onNodeContextMenu
```

T3 只拥有：

```text
menu invocation
anchor point
management-only action filtering
```

具体：

```text
rename / duplicate / copy / align / tidy / remove / delete...
```

仍通过现有 Huabu command / 对应 domain owner执行。

Archive 浏览器继续是 top HUD More owner，不被拖进 T3 Action Arc。

---

## T5 CONTRACT

```ts
ContextMenuViewModel {
  open
  anchor: pointer point
  items: command descriptors
}
```

无自造 modal / form。

---

# 18. Backend Thin Client Construction Rule

C1-S2 冻结：

```text
backend client = transport only
interaction controller = UI intent only
Core = business truth only
```

因此：

```text
CoreRunClient
CoreReceiverClient
CoreVoiceClient
```

不能拥有：

```text
selection
composer open state
receiver chip UI state
run spinner state
voice waveform state
```

这些是 T3 transient presentation state。

同理：

```text
HttpClient
```

不能顺手长成 cache / session / provider manager。

---

# 19. Adopt / Wrap / Lift / Retire Matrix

| Capability | Decision | Exact current donor / owner |
|---|---|---|
| Pointer arbitration | ADOPT | Huabu `PointerRouterCore` |
| Left blank Move | ADOPT | Huabu node drag lifecycle |
| Multi-selection | ADOPT | ReactFlow + Huabu MultiSelect |
| floating placement | ADOPT | Huabu floating/node geometry primitives |
| node event entry | WRAP | `CanvasHostExtension` narrow callbacks |
| Action Arc logic | BUILD THIN HEADLESS | new `actionArcModel.ts` |
| Composer input mechanics | LIFT/REUSE MECHANICS | Huabu `ChatInput.tsx` behavior patterns |
| Composer business state | BUILD THIN HEADLESS | new `composerDraft.ts` |
| Reference ordered state | ADOPT | `referenceController.ts` |
| Reference Pick mode | BUILD THIN | new `referencePickSession.ts` |
| Voice transport | WRAP | existing Core voice route |
| Voice text insertion | BUILD PURE | new `voiceTextMerge.ts` |
| Run | WRAP | existing Core runs route |
| Receiver | WRAP | existing Core receiver route |
| Semantic Drop lifecycle | LIFT | current `semanticDropMachine.ts` states |
| old edge-slot target taxonomy | RETIRE | left/bottom/dwell edge logic |
| left semantic Give | WRAP HUABU DRAG + TARGET PORT | no new drag engine |
| right Carry | NEW RECOGNIZER ON EXISTING ROUTER | `HostSeam.recognizers` |
| Relation | ADOPT/WRAP | current `connectIntent` / Core Relation |
| Relation kind chooser | DO NOT BUILD | use capability/default resolver |
| Glyth final creature | DEFER TO T5 | renderer family already exists |
| Glyth behavior state | BUILD PURE | new `glythLocalState.ts` |
| Work View geometry | CONSUME T4 | no T3 store |
| exclusive WorkView overlay rule | RETIRE WHEN T4 SEAM LANDS | `overlayArbitration.ts` |
| Management menu behavior primitive | ADOPT | Huabu menu primitives |

---

# 20. Exact File Skeleton for C1-S3

## EXISTING FILES TO MODIFY

```text
huabu/apps/web/src/lcos-seam/types.ts
apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx

apps/web-gen2/src/backend/client.ts
apps/web-gen2/src/interaction/semanticDropMachine.ts
apps/web-gen2/src/interaction/overlayArbitration.ts
apps/web-gen2/src/host/hostConnectIntent.ts
apps/web-gen2/src/presentation/rendererRegistry.ts   [capability-only if needed]
apps/web-gen2/src/index.ts                          [exports]
```

---

## NEW PURE / BACKEND FILES

```text
apps/web-gen2/src/backend/runs.ts
apps/web-gen2/src/backend/receiver.ts
apps/web-gen2/src/backend/voice.ts

apps/web-gen2/src/interaction/actionArcModel.ts
apps/web-gen2/src/interaction/composerDraft.ts
apps/web-gen2/src/interaction/referencePickSession.ts
apps/web-gen2/src/interaction/voiceTextMerge.ts
apps/web-gen2/src/interaction/runSubmission.ts
apps/web-gen2/src/interaction/semanticTargetAdapter.ts
apps/web-gen2/src/interaction/glythLocalState.ts
apps/web-gen2/src/interaction/t3InteractionSnapshot.ts
```

这些名称在 C1-S3 可以最后再按 repo naming 习惯微调，但职责边界不能再扩大。

---

## TEST FILES TO ADD / PATCH

```text
apps/web-gen2/test/host-adapter.test.ts
apps/web-gen2/test/overlayArbitration.test.ts
apps/web-gen2/test/hostConnectIntent.test.ts
apps/web-gen2/test/core-clients.test.ts

apps/web-gen2/test/actionArcModel.test.ts
apps/web-gen2/test/composerDraft.test.ts
apps/web-gen2/test/referencePickSession.test.ts
apps/web-gen2/test/voiceTextMerge.test.ts
apps/web-gen2/test/runSubmission.test.ts
apps/web-gen2/test/semanticDropMachine.test.ts
apps/web-gen2/test/glythLocalState.test.ts
```

Huabu thin-fork test：

```text
huabu/apps/web/src/lcos-seam/* test
Canvas pointer / drag relevant tests
```

---

# 21. Mandatory Acceptance Invariants for C1-S3

下一步每张 Exact File Card 必须绑定这些 invariant。

## Pointer / Selection

```text
pointerdown cannot accidentally open Composer
movement beyond threshold lets drag win
multi-select never auto-opens Composer
closing transient UI does not clear Selection
```

## Glyth

```text
first click = select only
selected reclick = Arc + Composer
double-click = same Conversation Worksite
```

## Reference

```text
Selection ≠ Reference
Reference ≠ Relation
Composer open does not copy Selection
Reference Pick keeps target/Selection unchanged
Esc exits Reference Pick only
```

## Voice

```text
replace selection
insert at caret
append otherwise
never auto-Run
failure keeps draft
```

## Receiver

```text
per-run receiver does not mutate Project Active Receiver
Glyth defaults its own Conversation
ordinary target resolves receiver by frozen rule
no guessing when none exists
```

## Drag grammar

```text
left blank = Move / source stays
left target = target-natural semantic / source restores for non-Move
right drag = proxy / source never moves
Relation handle = Project Relation
no chooser modal
```

## Core truth

```text
no fake entity ref from node id
no fake relation edge before Core
no duplicate Run API
no UI-owned receiver truth
```

## Work View

```text
camera does not move
nodes do not relayout
active local overlay may survive
safeRect controls screen-space repositioning
```

---

# 22. Dependency Graph

```text
C1-S3-A
Huabu neutral node interaction seam
      │
      ├── Action Arc click/reclick
      ├── Glyth click/dblclick
      └── Right-click menu

C1-S3-B
Backend Run/Receiver/Voice clients
      │
      └── Composer submit / voice

C1-S3-C
ComposerDraft + ReferencePick + voice merge
      │
      └── Compact Composer behavior complete

C1-S3-D
SemanticDrop migration + Huabu drop observation seam
      │
      ├── Left Give
      └── source restore

C1-S3-E
Right Carry recognizer
      │
      └── proxy / target reception

C1-S3-F
Relation Handle
      │
      └── existing connectIntent

T2 seam
→ Glyth double-click Worksite enter

T4 seam
→ Assembly target
→ ProfessionalWindowEnvironment

T5
→ Arc / Composer / Carry / Glyth final body & motion
```

---

# 23. What T5 Can Start From Immediately

在 C1-S3 施工前，T5 已经可以把下面这组状态当作未来稳定输入，而不需要猜业务：

```text
Action Arc
- open
- action id / enabled / active / attention

Composer
- target anchor kind
- open
- text
- ordered refs
- receiver state
- voice phase
- run phase
- error

Semantic Carry
- give / borrow
- source
- target
- approach / receptive / committing / accepted / failed
- sourceDisposition

Relation Handle
- available / armed / dragging / valid / invalid / committing

Glyth
- rest / selected / engaged
- idle / approach / receptive / accepted / failed
- idle / working / waiting / attention
- current receiver / other / none

Work View collision
- preferred side
- safe side
- compact / suppressed
```

T5 不需要知道：

```text
Core endpoint
ProjectionBinding SQL
Run POST body
Receiver route
pointer arbitration
```

这就是这份 seam skeleton 的主要价值。

---

# 24. C1-S2 Done Checklist

- [x] 不新增 Pointer Router
- [x] 不新增 Selection owner
- [x] 不新增 geometry engine
- [x] HostSeam 仍是唯一 Canvas extension surface
- [x] click/reclick/dblclick/context-menu 缺口收敛到一条 neutral seam
- [x] mouse left semantic drop 缺口收敛到一条 neutral drag observation seam
- [x] right Carry 复用 existing PointerRouter recognizer injection
- [x] left blank Move 完全保留 Huabu stock drag
- [x] Action Arc 收敛到 capability-driven headless model
- [x] Composer 收敛到 target-local pure draft
- [x] ReferenceController KEEP
- [x] Reference Pick 与 Reference list 分离
- [x] Voice 只补 form-data client + text merge
- [x] Run / Receiver 只补 typed client，不塞 Gen2Host monolith
- [x] per-run receiver 与 Project Active Receiver 分离
- [x] semanticDrop 生命周期保留，旧 left/bottom taxonomy 退休
- [x] target domain semantics 通过 injected adapter，不由 T3 重裁决
- [x] Relation 继续 Core-first connectIntent
- [x] Glyth T3 behavior / T5 visual ownership明确
- [x] Work View safeRect 继续等待 T4，不造 T3 Window Store
- [x] T5 read-only state contract 已形成
- [x] Architecture Conflict = 0

---

# 25. Next

下一步进入：

# `C1-S3 · Exact File Construction Cards`

C1-S3 不再讨论“应该怎么设计”。

直接把上面的 seam 拆成小步快跑施工卡：

```text
Card ID
→ UX Scene ID
→ exact file
→ exact symbol
→ change type
→ before
→ after
→ dependency
→ test
→ acceptance
→ rollback
→ migration / retirement
```

优先顺序建议：

```text
1. Host neutral node interaction seam
2. Run / Receiver / Voice clients
3. ComposerDraft + Reference Pick + Voice merge
4. Semantic Drop destination migration
5. Huabu semantic-drop observation seam
6. Right Carry recognizer
7. Relation Handle resolver cleanup
8. Glyth local behavior state
9. T4 safeRect接入后修 overlay arbitration
10. T5 final visual consumption
```

到 C1-S3 完成后，T3 就从“规划”正式进入可逐卡施工状态。
