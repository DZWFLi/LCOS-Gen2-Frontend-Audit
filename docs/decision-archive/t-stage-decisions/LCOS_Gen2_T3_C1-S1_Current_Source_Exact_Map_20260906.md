# LCOS Gen2 · T3 · C1-S1
# Current Source Exact Map
## Pointer / Selection / Local Overlay / Composer / Reference / Voice / Receiver / Semantic Drop / Relation / Glyth

> 日期：2026-09-06  
> 状态：`C1-S1 COMPLETE`  
> 当前代码基线：`DZWFLi/LCOS_Gen2 @ c2ff890a867922a1256572199458438572eb0a8c`  
> 上一步：`C1-S0 · Phase-B Interaction Contract Lock`  
> 下一步：`C1-S2 · Source Engineering Seam Skeleton`
>
> 本轮只做 current source 建账：
>
> ```text
> exact file
> exact symbol
> current owner
> exact consumer
> current behavior
> existing primitive
> legacy / mismatch status
> ```
>
> **本轮不写 patch，不重新讨论产品，不新增 Store / Manager / Router。**
>
> 最新 Phase B 已关闭的产品问题全部视为固定输入。只有 current source 存在无法经薄适配解决的真实技术冲突时，才允许上报 Coordinator。

---

# 0. 结论先行

本轮重新核 current HEAD 后，T3 的源码现实比 9 月 4 日旧审计更清楚，也更“薄”了：

```text
apps/web-gen2
= 当前 LCOS Gen2 的 headless contract / integration layer

huabu/
= 当前真正的 React Canvas / pointer / node / floating UI / ChatInput 实现

apps/local-core
= canonical Run / Receiver / Voice / Relation 等后端 owner
```

最重要的变化：

> **旧审计里出现过的 `LcosComposerShell.tsx`、`LcosHostOverlay.tsx`、`lcosReferenceState.ts` 等，不在当前 `apps/web-gen2` HEAD 中。**

因此 C1 后续不能把那些旧文件继续写进 exact-file patch 表当 current owner。
它们现在只能作为历史证据 / 旧方案参考。

当前 `apps/web-gen2` 是一个很克制的层：

- backend typed clients；
- HostSeam；
- Huabu React adapter；
- pointer intent；
- reference pure state；
- semantic-drop state machine；
- overlay arbitration；
- presentation descriptor / density；
- spatial binding / relation projection。

这意味着 Phase C 最合理的施工方向不是“把旧 T3 UI 文件搬回来”，而是：

> **在已经存在的 HostSeam / Huabu pointer owner / Huabu floating primitive / Core routes 上补最薄的 LCOS interaction seam。**

本轮没有发现需要 Coordinator 重新裁决的 Architecture Conflict。
发现的差异目前都是：

```text
Phase-A placeholder / stale contract
或
Phase-C 尚未接线
或
一处可薄改的 arbitration rule
```

---

# 1. 当前仓库拓扑与旧审计路径纠正

## 1.1 当前 HEAD

```text
repo: DZWFLi/LCOS_Gen2
branch: main
HEAD: c2ff890a867922a1256572199458438572eb0a8c
commit: Reorganize web-gen2 routes and subtree positions
```

当前根级主要相关目录：

```text
apps/local-core/
apps/web-gen2/
huabu/
```

当前不是：

```text
apps/web/
vendor/huabu/
```

因此此前文档里还写：

```text
vendor/huabu
apps/web/... LCOS integration
```

的路径，应标：

```text
STALE_DOC_PATH
```

不属于产品冲突，只是路径迁移债。

---

## 1.2 `apps/web-gen2` 的性质

`apps/web-gen2/package.json` 当前只有：

```text
typecheck: tsc --noEmit
build:     tsc --noEmit
test:      tsx --test test/*.test.ts
```

依赖也以 Typescript / React types 为主。

结论：

> **web-gen2 当前不是独立完整 React App，而是 Gen2 contract / integration package。**

这件事直接影响 T3：

- T3 canonical interaction logic 应尽量留在 web-gen2 pure modules；
- 真正的 DOM / React / Canvas body 尽量通过 `integration/huabu` 与 Huabu app 复用；
- 不应该在 web-gen2 再造第二套 Canvas runtime。

---

# 2. 总 owner / consumer 图

```text
User Pointer / ReactFlow
        │
        ▼
huabu/.../Canvas.tsx
        │
        ├─ built-in selection / drag / dblclick / contextmenu
        │
        ├─ useCanvasPointerRouter
        │      │
        │      ▼
        │  PointerRouterCore
        │      │
        │      ├─ Huabu recognizers
        │      └─ hostExtension.recognizers  ◄──── LCOS HostSeam
        │
        ├─ hostExtension.overlays            ◄──── LCOS HostSeam
        ├─ hostExtension.nodeTypes           ◄──── LCOS HostSeam
        └─ hostExtension.connectIntent       ◄──── LCOS Semantic Connect

apps/web-gen2
        │
        ├─ HostSeam / Huabu Adapter
        ├─ pointerIntent
        ├─ referenceController
        ├─ semanticDropMachine
        ├─ overlayArbitration
        ├─ rendererRegistry
        └─ typed backend clients [当前只 projects/artifacts/relations/search...]

apps/local-core
        │
        ├─ /projects/:id/runs
        ├─ /projects/:id/connected-conversations
        ├─ /projects/:id/receiver-binding
        ├─ /runtime/voice/transcriptions
        └─ /relations / canonical services
```

这是 C1-S2 的工程基础。

---

# 3. A · Pointer / Gesture Entry

## Current exact files

### Huabu canonical pointer owner

`huabu/apps/web/src/handler/pointerRouter.ts`

Exact symbol：

```ts
PointerRouterCore<E, C>
PointerRecognizer<E, C>
```

### Huabu React installation

`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

相关：

```text
CanvasGestures
useCanvasPointerRouter(..., extraRecognizers)
```

### Host extension contract

`huabu/apps/web/src/lcos-seam/types.ts`

```ts
CanvasHostRecognizer
CanvasHostExtension.recognizers
```

### LCOS framework-neutral seam

`apps/web-gen2/src/host/hostSeam.ts`

```ts
LcosRecognizerDescriptor
HostSeam.recognizers
createHostSeam(...)
```

### React adapter

`apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx`

```ts
hostExtensionFromSeam(...)
```

---

## Current owner

```text
physical pointer arbitration
= Huabu PointerRouterCore
```

LCOS 只允许：

```text
extra recognizer / observer
```

不拥有第二套路由。

---

## Exact consumer

`Canvas.tsx` 构造 recognizer list 时：

```text
Huabu built-ins
...
hostExtension?.recognizers
```

也就是说 LCOS recognizer 已有正式消费入口。

---

## Current behavior

`PointerRouterCore`：

```text
pointerdown
→ 按 recognizer 顺序询问 canClaim
→ first claim becomes owner
→ move/up/cancel only routed to owner

observe channel
→ 可以观察所有 pointer
→ 必要时 preempt
```

这已经足够承载：

```text
Reference accelerator
Semantic Carry
Drop target observation
```

但具体 T3 recognizer 目前尚未全部落地。

---

## Existing Huabu drag primitive

`huabu/apps/web/src/handler/canvasPointerRecognizers/nodeDrag.ts`

Exact symbol：

```ts
createNodeDragRecognizer()
```

它调用统一：

```ts
getDragActivationDistance(...)
```

并通过已有 store 生命周期移动：

```text
onNodeDragStart
→ onNodesChange
→ onNodeDragStop
```

因此自动保留：

```text
smart snap
frame reparenting
autosave
single undo
```

## C1-S1 status

```text
OWNER FOUND
CONSUMER FOUND
PRIMITIVE FOUND
NO NEW ROUTER NEEDED
```

---

# 4. B · Selection / Multi-selection

## Current exact owner

`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

当前由 ReactFlow + Huabu Canvas store 负责。

关键 current policy：

```tsx
selectionOnDrag={... tool === 'select'}
selectionMode={SelectionMode.Partial}
multiSelectionKeyCode={'Shift'}
```

代码注释已明确：

```text
Shift = 唯一 multi-selection key
Ctrl/Cmd = 保留给 LCOS Reference
```

Touch path：

```text
CanvasGestures.onNodeTap
→ selectNodes([nodeId])
```

---

## Current multi-selection UI

`Canvas.tsx` 已导入：

```text
FloatingToolbars/MultiSelectToolbar.tsx
SelectionOutlines.tsx
MultiSelectResizer.tsx
```

因此：

```text
selection mechanics
multi-selection bounds
basic spatial toolbar
```

已有 Huabu owner。

T3 不应再造一份 Selection Store。

---

## LCOS pointer-intent helper

`apps/web-gen2/src/interaction/pointerIntent.ts`

Exact symbols：

```ts
pointerModifiersOf
isAdditiveSelection
isReferencePick
isAdditiveSelectionExclusively
```

Current policy：

```text
Shift wins
Ctrl/Cmd = this-run Reference
```

---

## Phase B comparison

Phase B：

```text
multi-select
→ no auto Composer
```

当前 Huabu Selection 本身没有自动 LCOS Composer，方向相容。

## C1-S1 status

```text
PHYSICAL OWNER FOUND
MULTI PRIMITIVE FOUND
LCOS COMPOSER CONSUMER NOT YET LANDED
NO PRODUCT CONFLICT
```

---

# 5. C · Click / Double-click

## Current file

`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

---

## Touch click

`CanvasGestures`：

```text
onNodeTap(nodeId)
→ selectNodes([nodeId])
```

当前属于 Huabu selection behavior。

---

## Mouse single click

当前主要由 ReactFlow / node selection 内建行为承担。

当前 HostSeam 没有一个显式：

```text
onNodeClickIntent
```

接口。

因此 T3 的：

```text
普通 content single click
Glyth first click / selected-reclick
```

当前还没有独立 LCOS click-contract seam。

---

## Double-click

`Canvas.tsx` 当前：

```tsx
onNodeDoubleClick={(e, node) => {
  e.stopPropagation();
  if (EXPANDABLE_TYPES.has(node.type ?? '')) {
    openPreviewNode(node.id, { transient: true });
  }
}}
```

`EXPANDABLE_TYPES` 是 Huabu 原生内容类型集合。

Phase B 的：

```text
Glyth double-click
→ same Conversation nested Worksite
```

当前**没有落到 HostSeam 的 dblclick intent**。

但这不是技术冲突：

- LCOS conversation renderer 本来就是 host-injected node family；
- 它并不需要塞进 Huabu `EXPANDABLE_TYPES`；
- C1-S2 只需要确定薄 click/dblclick seam 放在 host renderer 还是 CanvasHostExtension。

## C1-S1 status

```text
HUABU DEFAULT FOUND
LCOS CLICK INTENT SEAM MISSING
THIN-ADAPTABLE
NO ARCHITECTURE CONFLICT
```

---

# 6. D · Right-click / Context Menu

## Current Huabu file

`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

Canvas root 当前有：

```tsx
onContextMenu={(event) => {
  const target = event.target as Element;
  if (target.closest('input, textarea, select, [contenteditable="true"], a[href]')) {
    return;
  }
  ...
}}
```

即：

```text
editable / link
→ 保留正常行为

canvas non-editable area
→ Huabu 自己接管 / 抑制 browser context interaction
```

当前 `apps/web-gen2` HostSeam 没有：

```text
contextMenu descriptor
management menu model
```

T3 也没有 current `LcosContextMenu.tsx`。

---

## Existing insertion options found

当前已有两类薄入口：

```text
1. hostExtension.recognizers
2. hostExtension.overlays
```

所以 Right-click Management Menu 没必要因此另造全局 DOM owner。

C1-S2 再决定：

```text
是否增加 neutral context-menu intent 到 CanvasHostExtension
或
由 host renderer / recognizer + overlay 组合
```

本轮不决定实现。

## C1-S1 status

```text
ROOT EVENT OWNER FOUND
LCOS MANAGEMENT MENU SEAM NOT LANDED
THIN-ADAPTABLE
```

---

# 7. E · Floating Anchor / Local Placement

## Current exact file

`huabu/apps/web/src/components/Panels/Canvas/FloatingToolbars/NodeFloatingToolbar.tsx`

Exact component：

```tsx
NodeFloatingToolbar
```

它内部复用：

```tsx
CanvasFloatingPopover
FloatingToolbar
Tooltip
```

---

## Exact anchor behavior

它读取：

```ts
useInternalNode(id)
```

anchor 优先：

```text
positionAbsolute
style.width/height       ← resize 时 authoritative snapped rect
measured.width/height    ← auto-size fallback
```

takeover / collapse 时：

```text
blendedMarkRect(mark)
```

最终：

```tsx
<CanvasFloatingPopover
  anchor={anchor}
  offset={12}
  side="top"
/>
```

---

## Existing owner split

```text
node geometry
= Huabu / ReactFlow

screen positioning / portal / clamping
= CanvasFloatingPopover

single-node toolbar body
= NodeFloatingToolbar
```

这套 primitive 正适合成为：

```text
Action Arc anchor
Compact Composer anchor
local menu / parameter popover anchor
```

但最终 visual body 不等于复用整条 `NodeFloatingToolbar`。

---

## C1-S1 status

```text
ANCHOR OWNER FOUND
PLACEMENT PRIMITIVE FOUND
REUSE REQUIRED
```

---

# 8. F · Action Arc

## Current LCOS logic

`apps/web-gen2/src/interaction/overlayArbitration.ts`

已经承认 overlay kind：

```ts
'action-arc'
```

并有 z-layer。

---

## Current React body

当前 `apps/web-gen2` **没有**：

```text
ActionArc.tsx
LcosActionArc.tsx
```

HostSeam 虽可注入 overlay，但默认没有 Arc overlay descriptor。

旧审计里“Action Arc not landed”的判断，在当前 reorganized HEAD 仍然成立，只是旧 `LcosHostOverlay.tsx` 文件本身已经不在 current web-gen2。

---

## Existing spatial primitive

Huabu：

```text
NodeFloatingToolbar anchor
CanvasFloatingPopover
NodeWrapper toolbar/actions slots
```

LCOS：

```text
HostSeam.overlays
Overlay arbitration kind='action-arc'
```

## C1-S1 status

```text
STATE SLOT FOUND
ANCHOR PRIMITIVE FOUND
BODY NOT LANDED
```

---

# 9. G · Compact Composer / Draft

## Current LCOS web-gen2

当前 `apps/web-gen2` 没有：

```text
LcosComposerShell.tsx
ComposerDraft store
TargetLocalComposer React body
```

旧文件已是 historical-only。

---

## Huabu mature input primitive

`huabu/apps/web/src/components/Panels/ChatPanel/ChatInput.tsx`

Exact component：

```tsx
ChatInput
```

关键 props：

```ts
value
onChange
onSubmit
onCommit?
onStop
isStreaming
mode
placeholder
...slots
```

关键机械：

```text
controlled value
IME-safe Enter
Shift+Enter newline
2–5 line autoresize
internal scroll after max
paste / drag/drop attachments
prompt history
send / stop
slash menu
agent/session slots
```

这证明：

> T3 不需要从零手搓 textarea / IME / autoresize / stop mechanics。

---

## Huabu Chat draft owner

`huabu/apps/web/src/components/Panels/ChatPanel/index.tsx`

Exact owner pattern：

```text
selectThreadDraft(state, threadId)
setDraft(threadId, text)
```

源码注释明确：

> unsent draft keyed by threadId so switching canvas/session does not wipe it.

但这只是 **Huabu Chat thread draft ownership pattern**。

它不是 LCOS target-local Composer 的 canonical owner。

T3 后续只能借：

```text
controlled-draft pattern
```

不能把 LCOS Object Composer 绑死到 Huabu ChatPanel thread store。

---

## Phase B comparison

目标 Composer：

```text
target-local
same state may have local / Work View projection
Reference / Receiver / Voice / Run
```

当前 React body尚未 landed。

## C1-S1 status

```text
LCOS BODY MISSING
HUABU INPUT PRIMITIVE FOUND
DRAFT OWNERSHIP PATTERN FOUND
NO NEED FOR SECOND CHAT SYSTEM
```

---

# 10. H · Reference / Reference Pick

## Exact current LCOS state owner

`apps/web-gen2/src/interaction/referenceController.ts`

Exact symbols：

```ts
ReferenceControllerState
createReferenceControllerState
sameEntityRef
toggleReference
removeReference
orderedReferences
openComposerReferences
```

源码已经写得非常干净：

```text
Selection = Huabu transient canvas state
Reference = this draft ordered explicit refs
Relation = Core
```

并且：

```ts
openComposerReferences(...)
```

默认：

```text
EMPTY
```

绝不从 Selection 自动拷贝。

这项与 Phase B 完全一致，属于明确 KEEP。

---

## Current pointer accelerator

`apps/web-gen2/src/interaction/pointerIntent.ts`

当前：

```text
Ctrl/Cmd
→ Reference intent
Shift
→ additive Selection
Shift wins
```

Phase B / UX 规定：

```text
显式 Reference Pick 是 primary
Ctrl/Cmd 可以是 accelerator
```

因此当前 modifier helper 不必退休，但它**不能成为唯一 Reference entry**。

---

## Missing current surface

目前没有：

```text
ReferencePickSession
ReferencePickerOverlay
Canvas Reference mode owner
```

也没有 React chip strip body。

所以 current status 是：

```text
Reference data semantics landed
Reference full UX not landed
```

## C1-S1 status

```text
CORE UI STATE OWNER FOUND
CORRECT SEMANTICS
PRIMARY PICK MODE / BODY MISSING
```

---

# 11. I · Voice

## Core canonical route exists

`apps/local-core/src/routes/voice-transcription.ts`

Exact symbol：

```ts
handleVoiceTranscriptionRoute
```

Endpoint：

```text
POST /runtime/voice/transcriptions
multipart/form-data
```

输入：

```text
one audio file
+ optional durationMs/language/prompt/timestamps/providerId
```

底层 service：

```text
voice-transcription-service.ts
voice-transcription-whisper-cpp-provider.ts
```

因此后端 owner 已经存在。

---

## Current web-gen2 client gap

`apps/web-gen2/src/backend/` 当前只有：

```text
artifacts.ts
client.ts
coreTypes.ts
projects.ts
relations.ts
search.ts
sqliteBindingStore.ts
```

没有：

```text
voice.ts
voice-transcription.ts
```

---

## HTTP transport blocker (thin)

`apps/web-gen2/src/backend/client.ts`

Current `HttpClient`：

```text
body exists
→ Content-Type: application/json
→ JSON.stringify(body)
```

所以它当前不能直接无损发送 FormData audio。

这不是产品冲突，只是 transport seam gap。

## C1-S1 status

```text
CORE OWNER FOUND
ENDPOINT FOUND
FRONTEND CLIENT MISSING
HTTP RAW/FORMDATA MODE MISSING
THIN-ADAPTABLE
```

---

# 12. J · Receiver / Run

## Core Run owner

`apps/local-core/src/routes/runs.ts`

Exact symbol：

```ts
handleRunsRoute
```

现有 endpoints 包括：

```text
GET/POST /projects/:id/runs
POST /runs/:id/dispatch
POST /runs/:id/recover
POST /runs/:id/sync
POST /runs/:id/cancel
GET/POST /runs/:id/input-request
GET /runs/:id/events
GET /runs/:id/review
...
```

`POST /projects/:id/runs` 当前已经接受：

```text
instruction
outputIntent
targetArtifactId / targetRevisionId
contextArtifactIds
workspaceId / savedContextId
requestedProvider
sessionId
resultPolicy
receiverRef
orderedReferences
resultSlotId
```

所以 T3 **绝对不需要新 Run API**。

---

## Core Receiver owner

`apps/local-core/src/routes/receiver.ts`

Exact symbol：

```ts
handleReceiverRoute
```

现有：

```text
GET/POST /projects/:id/connected-conversations
DELETE /projects/:id/connected-conversations/:id
GET/POST /projects/:id/receiver-binding
POST /projects/:id/receiver-handoff
...
```

`receiver-binding` 已明确承担 Project Active Receiver。

Run 自己又支持：

```text
receiverRef
```

这正好支持冻结的：

```text
per-run Receiver
≠ Project Active Receiver
```

---

## web-gen2 client gap

当前 `apps/web-gen2/src/backend`：

```text
NO runs.ts
NO receiver.ts
```

但 `apps/web-gen2/src/host/createLcosHostRuntime.ts` 的 Phase-C dock-gap registry 已明确预留：

```text
run
voice
workflow
skill-author
workbench
```

并标：

```text
uiFabricated:false
```

说明设计本身就要求后续通过真实 Core port 接线，而不是 UI 编造。

## C1-S1 status

```text
CORE OWNER FOUND
API EXISTS
FRONTEND TYPED CLIENTS MISSING
EXPECTED PHASE-C GAP
```

---

# 13. K · Semantic Drop

## Current file

`apps/web-gen2/src/interaction/semanticDropMachine.ts`

Exact types：

```ts
DropPayload
DropDestination
SemanticDropState
DROP_INTENT_TOKENS
```

Exact functions：

```ts
beginDrop
advanceDropIntent
anchoringAt
completeDropDwell
confirmDrop
failDrop
```

---

## Reusable part

纯状态机本身已经把生命周期拆成：

```text
idle
tracking
dwell
preview
committing
failed
```

这部分仍然有价值。

---

## Stale Phase-A part

当前 `DropDestination` 仍是：

```ts
kind: 'slot'
anchor: 'left' | 'bottom'
surface
place
```

`DROP_INTENT_TOKENS` 也围绕：

```text
edge band
dwell band
dwell time
```

这对应旧 left/bottom dock / edge target 时代。

Phase B 已冻结的新 target grammar：

```text
Visible Host
Remote Target / Portal
target-natural semantic
source stay rules
```

因此这里是明确：

```text
STALE_PHASE_A_DESTINATION_TAXONOMY
```

但不是 architecture conflict。

原因：

```text
state-machine mechanics 可留
只有 destination/intention payload 需要迁移
```

## C1-S1 status

```text
STATE MACHINE KEEP CANDIDATE
DESTINATION TAXONOMY STALE
THIN-MIGRATABLE
```

---

# 14. L · Relation / Explicit Connect

## LCOS exact file

`apps/web-gen2/src/host/hostConnectIntent.ts`

Exact symbols：

```ts
connectSemantic
resolveConnectKind
ConnectIntentContext
SemanticConnectResult
```

---

## Huabu consumer

`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

`handleNodeConnect(...)`：

```text
if hostExtension.connectIntent exists
→ LCOS semantic connect first

created
→ do not create duplicate native edge

rejected
→ fail-close

native
→ fall through to Huabu onConnect
```

这已经是非常正确的 owner split：

```text
Core Relation first
Huabu edge second / projection
```

---

## Current incomplete piece

`resolveConnectKind(...)` 当前仍固定：

```ts
{ ok: true, kind: 'references' }
```

源码也承认真正 per-port mapping 是 Phase C。

所以：

```text
Relation execution seam EXISTS
Relation kind/capability resolver PLACEHOLDER
```

Phase B 的 Relation Handle 只建 Project Relation，刚好应走这条现有 seam，而不是另写边。

## C1-S1 status

```text
OWNER FOUND
CORE-FIRST SEMANTIC PATH FOUND
KIND RESOLVER PLACEHOLDER
THIN-ADAPTABLE
```

---

# 15. M · Glyth / Conversation Local Interaction

## Current presentation registry

`apps/web-gen2/src/presentation/rendererRegistry.ts`

Exact：

```ts
RendererFamily
PresentationDescriptor
NodeCapability
descriptorFor(...)
familiesFor(...)
```

已有 family：

```text
lcos/entity
lcos/conversation
lcos/instrument
lcos/external-file
```

Conversation 当前 capability：

```text
place
reference
connect
compose
```

这很好地说明：

> Conversation 已经被当作独立 presentation family，而不是普通 artifact node subtype。

---

## Current morphology reality

源码注释明确：

```text
Phase A only descriptor / mapper
real morphology in Phase B/C
```

当前没有：

```text
Glyth.tsx
ConversationCreature.tsx
GlythActionArc.tsx
GlythReceiveMotion.tsx
```

也就是说：

```text
Conversation family contract landed
Glyth final body not landed
T3 local interaction body not landed
```

这正是 T5 后续需要吃 engineering seam 的地方。

---

## Click/deep-work gap

当前 HostSeam 还没有：

```text
conversation selected-reclick
conversation doubleclick → Worksite navigation
```

专门 seam。

这需要 T2 提供 Worksite Enter command 后，T3 负责 gesture entry。

不是 T3 自己创建 Worksite。

## C1-S1 status

```text
PRESENTATION FAMILY FOUND
CAPABILITIES FOUND
MORPHOLOGY NOT LANDED
LOCAL CLICK/RECEIVE SEAM NOT LANDED
EXPECTED PHASE-C GAP
```

---

# 16. N · Overlay Arbitration / Work View Occupancy

## Current LCOS exact file

`apps/web-gen2/src/interaction/overlayArbitration.ts`

Exact：

```ts
OverlayKind
OverlayInput
overlayLayers
overlayZ
compactRestingOverlays
visibleOverlays
```

当前 kinds 已经有：

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

说明 overlay 责任已经有一个纯逻辑收敛点，这是好事。

---

## Real current mismatch with Phase B

当前：

```ts
if (input.workViewOpen) return ['work-view'];
```

即：

> Work View 一开，Canvas local overlay 全灭。

测试：

`apps/web-gen2/test/overlayArbitration.test.ts`

甚至明确断言：

```text
'work-view is exclusive, returns the whole canvas'
```

这与 Phase B D14 的 occupancy/safeRect 合同不一致。

---

## Why this is NOT Architecture Conflict

因为当前冲突只是：

```text
一个 pure function 的 arbitration policy
+
一组对应旧测试
```

没有：

```text
duplicate canonical truth
schema conflict
irreversible migration
pointer owner conflict
```

所以应标：

```text
THIN_POLICY_MISMATCH
```

C1-S2/C1-S3 按 Phase B 改即可，禁止重新 OPEN Work View 产品语义。

---

## T4 occupancy upstream seam

当前 `apps/web-gen2` 中尚未发现：

```ts
ProfessionalWindowEnvironment {
  occupiedRects
  safeRect / safeInsets
  activeRegions
}
```

的已落地模块。

根据 Phase B：

```text
它由 T4 提供
T1/T2/T3 消费
```

所以 T3 当前应标：

```text
UPSTREAM_SEAM_PENDING
```

不是由 T3 创建另一个 Window Store。

## C1-S1 status

```text
ARBITRATION OWNER FOUND
ONE REAL THIN MISMATCH FOUND
T4 OCCUPANCY SEAM PENDING
NO ARCHITECTURE CONFLICT
```

---

# 17. O · Node Presentation / Interaction Phase Arbitration

虽然不属于单独产品功能，但这是 T3 后续必须尊重的视觉机械。

## Huabu file

`huabu/apps/web/src/lcos-seam/nodePresentation.tsx`

Exact：

```ts
NodeInteractionPhase
resolveInteractionPhase
LcosNodePresentationInput
LcosNodePresentationContext
useLcosNodePresentation
```

Current priority：

```text
editing
> resizing
> dragging
> selected
> hover
> rest
```

---

## Node host

`huabu/apps/web/src/components/Nodes/NodeWrapper.tsx`

已有：

```text
toolbar
actions
overlayContent
overlayOffsetY
overlayVisible
overlayInteractionPriority
overlayMaxWidth
onDoubleClick
```

并且拖动时会隐藏/收起不适宜的 floating controls。

因此：

> T3 Arc / Composer / Receiver feedback / Glyth local action 不应该再自行建立一套 node phase state。

C1-S2 应把 T3 interaction visibility 接到现有 phase / overlay arbitration 上。

---

# 18. P · Presentation Density / LOD 输入

## File

`apps/web-gen2/src/presentation/nodePresentation.ts`

Exact：

```ts
PresentationDensity
resolvePresentationDensity
projectScreenSize
```

Current density：

```text
mark
summary
working
reading
```

这是 T5 最终 LOD 的现成工程输入。

T3 只需确保：

```text
Action Arc
Composer
Reference affordance
Glyth receive affordance
```

在 inappropriate density 下不会胡乱常驻。

这属于未来 T5 visual seam，不是 T3 新 owner。

---

# 19. Q · Core Identity / Fail-close Gate

## File

`apps/web-gen2/src/interaction/nodeAdoption.ts`

Exact：

```ts
resolveOrAdoptNode
bindingToCoreRef
```

当前原则已经正确：

```text
Huabu node进入：
Reference / Relation / content / delete / drop / preview / recovery

→ 必须先有真实 Core identity + ProjectionBinding

没有 binding
→ fail-close
→ 不从 spatialId / label 猜 entity
```

这会直接成为 T3：

```text
Reference
Semantic Give
Right Carry
Relation
```

的身份门禁。

必须 KEEP。

---

# 20. Current Source × T3 功能矩阵

| T3 能力 | Current source owner | Current consumer | 现状 |
|---|---|---|---|
| Pointer arbitration | Huabu `pointerRouter.ts` | `Canvas/useCanvasPointerRouter` | ✅ mature |
| LCOS recognizer insertion | `hostSeam.ts` / `CanvasHostExtension` | Huabu Canvas recognizer list | ✅ seam exists |
| Selection | Huabu ReactFlow/Canvas store | NodeWrapper / toolbars | ✅ mature |
| Multi-select | Huabu Canvas + MultiSelectToolbar | Canvas | ✅ mature |
| Shift/Ctrl intent | `pointerIntent.ts` | future T3 recognizer | ✅ pure helper |
| Single click T3 intent | Huabu default selection | no explicit LCOS consumer | ⚠ thin seam missing |
| Double-click Glyth | none | none | ⚠ thin seam missing |
| Right-click management | Huabu root context event | no LCOS menu model | ⚠ thin seam missing |
| Floating placement | Huabu `CanvasFloatingPopover` / `NodeFloatingToolbar` | selected node toolbar | ✅ mature donor |
| Action Arc state slot | `overlayArbitration.ts` | future host overlay | ✅ state kind / ❌ body |
| Compact Composer body | none in web-gen2 | none | ❌ not landed |
| Input mechanics | Huabu `ChatInput.tsx` | Huabu ChatPanel | ✅ mature donor |
| Target-local draft owner | none | none | ❌ not landed |
| Reference ordered state | `referenceController.ts` | future Composer | ✅ correct |
| Reference pick mode/body | none | none | ❌ not landed |
| Voice Core | Local Core voice route/service | no web-gen2 client | ✅ Core / ❌ client |
| Receiver Core | Local Core receiver route/service | no web-gen2 client | ✅ Core / ❌ client |
| Run Core | Local Core runs route/service | no web-gen2 client | ✅ Core / ❌ client |
| Semantic Drop machine | `semanticDropMachine.ts` | future recognizer/UI | ✅ mechanics / ⚠ stale target taxonomy |
| Project Relation | `hostConnectIntent.ts` + Core relation | Huabu `handleNodeConnect` | ✅ path / ⚠ kind resolver placeholder |
| Conversation family | `rendererRegistry.ts` | future host renderer | ✅ descriptor / ❌ final body |
| Glyth local behavior | none | none | ❌ not landed |
| Overlay policy | `overlayArbitration.ts` | future host overlay composition | ✅ owner / ⚠ WorkView stale rule |
| WorkView safeRect | T4 pending | T3 future consumer | ⏳ upstream seam pending |
| Node interaction phase | Huabu `nodePresentation.tsx` | `NodeWrapper` | ✅ mature |
| Presentation LOD | web-gen2 `nodePresentation.ts` | renderer/T5 | ✅ pure input |
| Identity fail-close | `nodeAdoption.ts` | reference/connect/drop future consumers | ✅ correct |

---

# 21. Current tests relevant to T3

`apps/web-gen2/test/` 当前已有测试基础：

```text
binding-projection.test.ts
core-clients.test.ts
createLcosHostRuntime.test.ts
g06-reconciliation.test.ts
g08-closure.test.ts
g09-host.test.ts
host-adapter.test.ts
hostConnectIntent.test.ts
nodeAdoption.test.ts
nodePresentation.test.ts
overlayArbitration.test.ts
...
```

Huabu 也已有：

```text
canvasGestureSession.test.ts
canvasPointerRecognizers/nodeDrag.test.ts
handlerOwner.test.ts
viewportNavigation.test.ts
ChatInput.test.tsx
...
```

这说明后续不需要另建“交互测试框架”。

T3 应在现有：

```text
pure Node test
Huabu component/unit test
browser acceptance
```

三层增量补测试。

---

# 22. 明确的 Historical-only 文件

以下旧 T3 文件在 current HEAD 不存在，因此不能再出现在 C1-S3 exact current patch list：

```text
LcosComposerShell.tsx
LcosHostOverlay.tsx
lcosReferenceState.ts
lcosRecognizers.ts
lcosDropState.ts
LcosDropPreview.tsx
```

如果后续 Git 历史 / migration 仍要处理它们，应明确标：

```text
HISTORICAL_PATH
```

而不是 `CURRENT_FILE`。

这条很重要，因为旧计划最容易在这里发生“幽灵施工”：给一个已经不存在的文件写三页修改方案，颇有给拆掉的房子装修厨房的风采。

---

# 23. 当前发现的 stale / migration hotspots

## H01 · `semanticDropMachine.DropDestination`

当前：

```text
left / bottom slot
```

Phase B：

```text
Visible Host / Remote Target / target-natural semantic
```

状态：

```text
STALE_PHASE_A
mechanics reusable
```

---

## H02 · `overlayArbitration.visibleOverlays`

当前：

```text
Work View exclusive
```

Phase B：

```text
safeRect coexist / lower-priority yield
```

状态：

```text
THIN_POLICY_MISMATCH
```

对应旧 test 必须未来更新。

---

## H03 · `hostConnectIntent.resolveConnectKind`

当前：

```text
always references
```

状态：

```text
PHASE_C_PLACEHOLDER
```

relation owner seam 本身正确。

---

## H04 · `HttpClient`

当前：

```text
JSON body only
```

Voice：

```text
multipart/form-data
```

状态：

```text
THIN_TRANSPORT_GAP
```

---

## H05 · `rendererRegistry`

当前：

```text
conversation family exists
real morphology absent
```

状态：

```text
EXPECTED_PHASE_C_VISUAL_GAP
```

---

## H06 · `HUABU_UPSTREAM.md`

仍有旧：

```text
vendor/huabu
apps/web
```

状态：

```text
STALE_PATH_DOC
```

不要让施工脚本继续依赖旧目录。

---

# 24. C1-S1 的 exact owner 判定

## T3 自己已有 owner

```text
pointerIntent.ts
referenceController.ts
semanticDropMachine.ts
overlayArbitration.ts
hostSeam.ts
hostConnectIntent.ts
rendererRegistry.ts（与 T5 presentation 共享消费）
```

---

## Huabu owner，T3 只能消费 / Wrap

```text
PointerRouterCore
Canvas / ReactFlow selection
node drag lifecycle
CanvasFloatingPopover
NodeFloatingToolbar
NodeWrapper interaction phase
ChatInput mechanics
```

---

## Core owner，T3 只建 typed client / command adapter

```text
Run
Receiver
Voice transcription
Relation
canonical identity
ProjectionBinding
```

---

## 其它线程 owner，T3 只等待 / 消费 seam

```text
T4 ProfessionalWindowEnvironment
T2 Worksite Enter/Back/Arrival
T1 Visible Host geometry/reflow
T5 final visual body/motion/LOD
```

---

# 25. C1-S2 可以直接建立的 Engineering Seam 输入

C1-S1 已经把 source reality 收敛成下面几类，下一步无需再广泛考古。

## Seam Family A · Existing Host Extension

已有：

```text
nodeTypes
overlays
recognizers
connectIntent
```

目标：

> 优先延伸这个唯一 seam，拒绝新 Host framework。

---

## Seam Family B · Local Interaction State

已有：

```text
referenceController
overlayArbitration
semanticDropMachine
pointerIntent
```

缺：

```text
Composer draft/target state
Reference Pick session
Action Arc intent state
Semantic Carry transient state
```

C1-S2 要判断最小组合，不得造 mega store。

---

## Seam Family C · Core Typed Clients

Core 已有：

```text
runs
receiver
voice
```

web-gen2 缺客户端。

目标：

```text
thin typed client only
```

不把业务状态塞进 HttpClient / Gen2Host。

---

## Seam Family D · Local Bodies

缺：

```text
Action Arc body
Compact Composer body
Reference chips/pick indicator
Semantic Carry proxy
Glyth local reaction layer
management menu body
```

这些正是 C1-S2 需要给 T5 暴露 state、但暂时不锁最终视觉的部分。

---

# 26. Architecture Conflict Gate 结果

本轮结果：

```text
ARCHITECTURE CONFLICTS: 0
```

发现：

```text
THIN POLICY MISMATCH: 1
- Work View exclusive overlay rule

STALE PHASE-A CONTRACTS: 2+
- drop destination taxonomy
- relation-kind placeholder

MISSING PHASE-C CLIENTS: 3
- Run
- Receiver
- Voice

MISSING PHASE-C UI BODIES:
- Arc
- Composer
- Ref Pick
- Carry proxy
- Glyth local interaction
- Management menu
```

全部可以在当前 owner 架构内通过薄适配承接。

因此：

> **不回报 Coordinator；直接进入 C1-S2。**

---

# 27. C1-S1 Done Checklist

- [x] current HEAD 重新确认
- [x] root source topology 重新确认
- [x] `apps/web-gen2` 当前性质确认
- [x] Huabu current subtree 路径确认
- [x] pointer owner / consumer 确认
- [x] selection / multi-select owner 确认
- [x] click / dblclick current behavior 确认
- [x] contextmenu root owner 确认
- [x] floating anchor primitive 确认
- [x] Action Arc current landing status 确认
- [x] Compact Composer current landing status 确认
- [x] Huabu ChatInput / draft pattern 确认
- [x] Reference exact state owner 确认
- [x] Voice Core / frontend gap 确认
- [x] Run Core / frontend gap 确认
- [x] Receiver Core / frontend gap 确认
- [x] Semantic Drop stale taxonomy 确认
- [x] Relation Core-first seam 确认
- [x] Conversation renderer family / Glyth body gap 确认
- [x] Work View overlay mismatch 确认
- [x] T4 occupancy seam pending 状态确认
- [x] node interaction phase owner 确认
- [x] presentation density input 确认
- [x] identity fail-close gate 确认
- [x] historical-only old T3 files 清退
- [x] Architecture Conflict gate 复核：0

---

# 28. 下一步

立即进入：

# `C1-S2 · T3 Source Engineering Seam Skeleton`

下一轮不再重新扫整个仓库。

只基于本 Exact Map 产出：

```text
每个 T3 capability
→ existing file / owner
→ exact thin seam
→ exact consumer
→ Adopt / Wrap / Lift / Retire
→ state exposed to T5
→ migration / retirement
→ initial blast radius
```

做到 C1-S2 后，T3 就已经有第一份可以正式交给 T5 的工程骨架。
