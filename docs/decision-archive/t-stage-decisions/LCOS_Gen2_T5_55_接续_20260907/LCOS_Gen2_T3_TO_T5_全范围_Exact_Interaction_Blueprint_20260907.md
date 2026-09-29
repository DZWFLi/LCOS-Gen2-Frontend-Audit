# LCOS Gen2 · T3 → T5
# 全范围 Exact Interaction Blueprint
## Content Node / Selection / Edit / Resize / Drag / Assembly / Relation / Composer / Run / Review / Overlay

> 日期：2026-09-07  
> 接收方：T5 Final Visual / Interaction Refinement  
> 输出方：T3 Local Interaction  
> LCOS Gen2 baseline：`232b2ca5fbcb3b76b053cf314b5c1193242abb6a`  
> Huabu upstream baseline：`a3c411e1f655191344285141f08c4738fa6015f7`  
> 状态：`EXACT INTERACTION BLUEPRINT · CURRENT/REUSE/PLANNED/GAP EXPLICIT`
>
> 本稿不是新的产品裁决。
>
> 读取原则：
>
> ```text
> CURRENT
> = 232b2ca5 current source 真实存在
>
> REUSE
> = current primitive 已存在，T5/T3 应收编，不另造
>
> PLANNED
> = 已被 Phase B + T3 C1 批准，但当前 baseline 尚未 landed
>
> GAP
> = 当前 source / 已批准 plan 都没有足够 exact contract
>   不允许 T5 靠视觉补语义
> ```
>
> Phase B 已关闭：
>
> - Right-drag：source spatial placement 不动，target natural semantic commit；
> - Relation Handle 永远另算 Project Relation；
> - visible-host left-drop：current projection 最终留在 target；
> - remote-target left-drop：source current projection 留在 source scene；
> - multi-select：不自动打开 Composer；
> - Work View / Professional Window 改 screen-space，不改 Camera / Canvas world；
> - Selection / Reference / Relation 严格分离；
> - Assembly 不拥有 membership / relation / Skill binding / Collection containment。

---

# 0. T5 先看这一页：Current Truth Map

| 范围 | 状态 | Exact source |
|---|---|---|
| Canvas pointer owner | CURRENT / REUSE | `huabu/apps/web/src/hooks/useCanvasPointerRouter.ts` + `handler/pointerRouter.ts` |
| single/multi Selection | CURRENT / REUSE | ReactFlow + `Canvas.tsx` + `canvasStore.selectNodes()` |
| Selection outline | CURRENT / REUSE | `Canvas/SelectionOutlines.tsx` |
| single resize | CURRENT / REUSE | `Nodes/NodeWrapper.tsx` + Huabu snap/geometry store |
| multi resize | CURRENT / REUSE | `Canvas/MultiSelectResizer.tsx` |
| TextNode inline edit | CURRENT | `Nodes/text/TextNode.tsx` + `shared/TextNodeBody.tsx` |
| Note rich editor | CURRENT | `Nodes/note/NotePreview.tsx` + Milkdown |
| Rich-text selection toolbar | CURRENT / REUSE | `Milkdown/MilkdownFloatingToolbar.tsx` |
| node generic double-click → Preview | CURRENT | `Canvas.tsx` + `previewWorkspace/actions.ts` |
| Shift Selection / Cmd-Ctrl Reference intent | CURRENT | `apps/web-gen2/src/interaction/pointerIntent.ts` |
| Reference ordered state | CURRENT | `apps/web-gen2/src/interaction/referenceController.ts` |
| Relation Core-first path | CURRENT / REUSE | `hostConnectIntent.ts` + `relationProjection.ts` |
| old edge-slot semanticDrop | CURRENT but SUPERSEDED | `semanticDropMachine.ts` |
| Phase-C target-based Semantic Give | PLANNED / NOT LANDED | T3 C1-S3C |
| Right Carry | PLANNED / NOT LANDED | T3 C1-S3C |
| nodeInteraction host callback | PLANNED / NOT LANDED | T3 C1-S3A |
| nodeDropIntent host callback | PLANNED / NOT LANDED | T3 C1-S3C |
| Action Arc body/model | PLANNED / NOT LANDED | T3 C1-S3D / C1-S5 |
| Compact Composer data plane/body | PLANNED / NOT LANDED | T3 C1-S3B / C1-S5 |
| Voice Core route | CURRENT | `apps/local-core/src/routes/voice-transcription.ts` |
| Run Core routes | CURRENT | `apps/local-core/src/routes/runs.ts` |
| waiting_input Core route | CURRENT | `GET/POST /runs/:runId/input-request` |
| RunReview Core service | CURRENT | `runtime-review-service.ts` |
| Accept/Reject/Retry artifact return | CURRENT | `routes/runtime-reviews.ts` |
| generic “Revert accepted result” | GAP | must go through ChangeSet/target owner, not Runtime Review guess |
| Assembly apply Core route | CURRENT | `routes/f6-assembly.ts` |
| Assembly final UI / target focus bridge | GAP / T4-owned | no T3 current body |
| Focus camera mechanics | CURRENT / REUSE | `CanvasLayerPanel/focusNodesOnCanvas.ts` |
| ProfessionalWindowEnvironment | T4 PLANNED | T4 C1-1 source plan |
| current WorkView-exclusive overlay rule | CURRENT but SUPERSEDED | `overlayArbitration.ts` |
| safe-area floating collision | REUSE + PLANNED extension | `CanvasFloatingPopover.tsx` + T4 env |
| Railway semantic destination | PLANNED / NOT LANDED | `SemanticTargetRef {kind:'remote-target', targetKey}` |
| physical cross-Space move | CURRENT / REUSE when truly physical | Huabu `move-selection` API |

---

# PART I · 内容节点优先

# 1. Hover / Single Select / Multi-select / Deselect

## 1.1 CURRENT state owners

### Physical pointer/hit owner

```text
huabu/apps/web/src/hooks/useCanvasPointerRouter.ts
huabu/apps/web/src/handler/pointerRouter.ts
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

Canvas 只允许这一条 pointer arbitration。

禁止：

```text
T5 renderer document.addEventListener('pointer...')
第二 PointerRouter
旧 SpatialCanvas pointer owner
```

---

## 1.2 Hover

### CURRENT

文件：

```text
huabu/apps/web/src/components/Nodes/NodeWrapper.tsx
```

当前局部状态：

```ts
const [hovered, setHovered] = useState(false)
```

事件：

```text
onPointerEnter
→ setHovered(true)

onPointerLeave
→ setHovered(false)
```

NodeWrapper 当前 hover visual：

```text
hover shadow / local ring
```

Selected 时，不靠 node body 自己画 authoritative selection outline。

### Canonical boundary

```text
hover
= disposable visual state
= ZERO Core write
= ZERO Huabu persistence
```

### T5 应显示

```text
轻 hover affordance
不抬高 canonical z-order
不自动打开 Composer
不自动产生 Reference
不自动 Focus Camera
```

### T5 不得偷偷实现

```text
hover → membership
hover → Context Mapping
hover → Reference
hover → Focus
hover → Work View
```

---

## 1.3 Single Selection

### CURRENT

Desktop：

```text
ReactFlow native selection
```

Touch：

```text
CanvasGestures
→ useCanvasPointerRouter
→ onNodeTap(nodeId)
→ selectNodes([nodeId])
```

Store：

```text
huabu/apps/web/src/store/canvasStore.ts
selectNodes(ids, multiSelect=false)
→ SELECT_NODES replace/toggle
```

### Visual owner

```text
huabu/apps/web/src/components/Panels/Canvas/SelectionOutlines.tsx
```

关键：

```text
selected node 不 elevate z-order
selection = screen-space HUD
outline pointer-events:none
```

### Canonical boundary

```text
Selection
= transient canvas state
= 不写 Core
= 不等于 Reference
= 不等于 Relation
= 不等于 membership
```

### T5 应显示

```text
authoritative selection outline
selected-local chrome budget
必要 resize handles / local controls
```

不要把选择做成：

```text
“已经引用”
“已经加入”
“已经成为上下文”
```

---

## 1.4 Multi-selection

### CURRENT

文件：

```text
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

当前 ReactFlow：

```tsx
selectionOnDrag={...}
selectionMode={SelectionMode.Partial}
multiSelectionKeyCode={'Shift'}
```

冻结：

```text
Shift
= 唯一 additive Selection key

Ctrl/Cmd
= 留给 LCOS Reference
```

Current multi visual：

```text
SelectionOutlines
MultiSelectToolbar
MultiSelectResizer
```

### Phase B invariant

```text
multi-select
→ NO automatic Composer
```

只有明确：

```text
AI Work
```

才建立 multi-target Composer。

### T5 应显示

```text
各对象 individual selection outline
+ multi-selection bounding affordance
+ 轻量 multi toolbar
```

不得：

```text
Selection hull 周围自动出现 Composer
Selection 自动变 Reference strip
```

---

## 1.5 Deselect

### CURRENT

Touch empty canvas：

```text
onEmptyCanvasTap
→ selectNodes([])
```

Desktop：

```text
ReactFlow native pane / selection behavior
```

Overlay close：

```text
不得顺手 clear Selection
```

`useCloseOnEscape.ts` 当前甚至明确：

```text
overlay Esc
→ stopPropagation
→ 避免 Escape继续打到 canvas、清 selection
```

### T5 Visual

```text
selection HUD消退
不改变对象本体
不做“删除/离开项目”感
```

---

## 1.6 Effective interaction phase

### CURRENT contract / REUSE

```text
huabu/apps/web/src/lcos-seam/nodePresentation.tsx
```

已有：

```ts
type NodeInteractionPhase =
  | 'rest'
  | 'hover'
  | 'selected'
  | 'editing'
  | 'dragging'
  | 'resizing'
```

priority：

```text
editing
> resizing
> dragging
> selected
> hover
> rest
```

### GAP

在 `232b2ca5` 的 `NodeWrapper.tsx` current wiring 中，本轮未核到它实际 mount：

```text
LcosNodePresentationProvider
```

所以：

```text
TYPE/RESOLVER = CURRENT
NodeWrapper → LCOS presentation context wiring = NEEDS REBASE/CONSUMER VERIFICATION
```

T5可以用这个状态轴设计视觉，但不能声称 current LCOS renderer 已收到它。

---

# 2. Selection 与 Reference 严格边界

## 2.1 CURRENT pointer classifier

文件：

```text
apps/web-gen2/src/interaction/pointerIntent.ts
```

纯函数：

```text
Shift
→ additive Selection

Cmd/Ctrl
→ this-run Reference intent

Shift + Cmd/Ctrl
→ Shift wins
```

这个模块自己明确：

```text
presentation classifier only
never mutates truth
```

---

## 2.2 CURRENT Reference owner

文件：

```text
apps/web-gen2/src/interaction/referenceController.ts
```

真实职责：

```text
Reference
= 当前 Composer/Run draft 的 ordered explicit refs
```

functions：

```text
createReferenceControllerState
openComposerReferences
toggleReference
removeReference
orderedReferences
```

`openComposerReferences`：

```text
starts EMPTY
```

绝不从 Selection auto-copy。

---

## 2.3 State/write matrix

| Action | Selection | Reference | Core canonical | Huabu geometry |
|---|---|---|---|---|
| hover | no write | no write | no | no |
| ordinary click | transient replace | no | no | no |
| Shift click | transient add/toggle | no | no | no |
| Cmd/Ctrl click | Selection unchanged | toggle this-run ref | no | no |
| Reference Pick | Selection unchanged | add/remove ordered ref | no | no |
| Relation handle commit | Selection may stay | no | **Relation write** | edge projection after Core |
| body drop → Collection | Selection irrelevant | no | **membership owner writes** | presentation placement owner |
| body drop → Glyth | Selection irrelevant | no | **Context Mapping owner writes** | source preserve |
| drop → Composer Reference strip | Selection unchanged | **draft ref** | no immediate canonical Project write | no |
| Send Run | freezes snapshot | freezes refs into Run input | **Run write** | no direct node geometry |

---

## 2.4 T5 Visual requirement

Selection 与 Reference 必须有不同 visual language：

```text
Selection
= spatial operation outline / handles

Reference
= ordered explicit chip / tiny ref affordance
```

T5不得用同一种蓝框再靠文字区分。

---

# 3. 双击内容节点：CURRENT 不是“一套统一 inline editor”

这是 T5 必须特别注意的 current-source 差异。

---

## 3.1 TextNode

### CURRENT

文件：

```text
huabu/apps/web/src/components/Nodes/text/TextNode.tsx
huabu/apps/web/src/components/Nodes/shared/TextNodeBody.tsx
```

`TextNode`：

```text
isEditing local state
handleDoubleClick()
→ stopPropagation
→ setIsEditing(true)
```

编辑层不是 portal，不是复制 body。

`TextNodeBody` 当前：

```text
same node footprint 内 textarea
not editing:
  transparent dblclick capture layer absolute inset-0
  textarea pointer-events:none/readOnly

editing:
  textarea nodrag nowheel cursor-text
```

### Selection

进入编辑不会构造新的 Selection truth。

Node本身仍然是同一个 selected/spatial object。

### Geometry / Camera following

因为 editor就在 node DOM 内：

```text
Camera pan/zoom
node move
node resize
```

自然跟随 ReactFlow/node geometry。

不需要：

```text
额外 screen-rect mirror overlay
```

### Exit CURRENT

`handleBlur`：

```text
isEditing=false

draft != content
→ updateNodeData(id,{content:draft})
→ settleNodePreprocess(id)
```

### GAP

TextNode current没有在该组件中定义：

```text
Esc = cancel vs save
explicit Save button
explicit Cancel button
```

所以 T5不能画：

```text
Esc 回滚未保存文本
```

然后假定工程已支持。

---

## 3.2 Note / rich content

### CURRENT

Canvas：

```text
EXPANDABLE_TYPES includes note
onNodeDoubleClick
→ openPreviewNode(node.id,{transient:true})
```

文件：

```text
huabu/apps/web/src/store/previewWorkspace/actions.ts
```

`openPreviewNode()`：

```text
requestOpenRightPanel(...)
open PreviewWorkspace tab
for note → request focus
```

真正 editor：

```text
huabu/apps/web/src/components/Nodes/note/NotePreview.tsx
→ MilkdownEditor
```

### 结论

Note current：

```text
double-click
≠ node inline edit
≠ “editor overlay exact node screen rect”
```

而是：

```text
PreviewWorkspace editor
```

---

## 3.3 Image/PDF/Web/etc

CURRENT：

```text
double-click
→ Huabu PreviewWorkspace
```

不是 generic inline editing。

---

## 3.4 T5 要求的“编辑层覆盖节点真实 screen rect”

当前统一 contract：

```text
NOT DEFINED
```

只有 TextNode naturally satisfies via in-node editing。

如果 T5 final direction要求所有 LCOS Content Entity：

```text
double-click
→ same-body screen-rect editor
```

这必须先由 T3/T4/T1新增明确 source contract。

T5不能通过：

```text
绝对定位一个视觉 editor
```

就把它变成产品事实。

---

## 3.5 编辑视觉责任

### T5 can own

```text
editing material
focus ring
cursor
text selection styling
toolbar styling
enter/exit micro-motion
```

### T5 cannot own

```text
谁写 canonical content
什么时候 commit
Esc 是 save 还是 cancel
Note 是否从 Preview迁成 inline
```

这些都必须由 source owner明确。

---

# 4. 富文本格式浮层

## 4.1 CURRENT / REUSE

文件：

```text
huabu/apps/web/src/components/Milkdown/MilkdownFloatingToolbar.tsx
```

Exact selection rect：

```text
instance.getSelectionClientRect()
```

状态：

```text
selectionRect
formatting state
engaged / focus-within
subpopover open state
```

---

## 4.2 Position owner

CURRENT：

```text
@floating-ui/react
useFloating
virtual selection rect
offset(8)
flip({padding:8})
shift({padding:8})
autoUpdate
```

Portal：

```text
document.body
```

它：

```text
不进入 Canvas layout
不写 node geometry
```

---

## 4.3 Caret / selection preservation

CURRENT toolbar root：

```text
onMouseDown
→ event.preventDefault()
```

目的：

```text
点击格式工具条
→ 不把 ProseMirror selection/caret 抢走
```

当前设计还明确：

```text
ProseMirror selection 可以在 editor blur 后保留
engaged surface 单独控制 toolbar是否显示
```

---

## 4.4 Collision

### CURRENT

Floating UI对 browser viewport做：

```text
flip / shift
```

### GAP / PLANNED

它还没有接 T4：

```text
ProfessionalWindowEnvironment.safeRect / activeRegions
```

所以：

```text
Work View collision-aware richtext toolbar
= PLANNED integration gap
```

T5可画 safe-area适配，但不能 CSS hardcode right panel width。

---

## 4.5 Esc

CURRENT reusable：

```text
huabu/apps/web/src/hooks/useCloseOnEscape.ts
```

Subpopover：

```text
Escape
→ close top overlay
→ stopPropagation
→ selection stays
```

---

## 4.6 T5 Visual

应显示：

```text
selection-local, light formatting toolbar
selection changes → toolbar follows
no giant editor ribbon
subpopovers local
```

Reduced motion：

```text
position update remains immediate/mechanical
optional fade/scale can be removed
caret/selection semantics unchanged
```

---

# 5. Continuous Resize

# 5.1 Single-node resize

## CURRENT / REUSE

文件：

```text
huabu/apps/web/src/components/Nodes/NodeWrapper.tsx
```

Exact display gate：

```text
selected
resizable
!locked
selectedCount === 1
!collapsedToMark
!multiSelectModifierHeld
```

---

## 5.2 Start

`handleResizeStart`：

```text
onNodeResizeStart()
→ Huabu gesture/undo snapshot

compute parent abs
→ beginSnapSession({
     kind:'resize',
     resizeContext...
   })

optional node-specific onResizeStart
```

Pointer physical owner：

```text
ReactFlow NodeResizer + Huabu
```

T3/T5不 capture这条 pointer。

---

## 5.3 Tick

`handleResize`：

```text
applyResizeProposal(params,zoom)
→ snap
→ updateResizePreview(id)
→ node-specific onResizeProp(snapped geometry)
```

Canvas/store hot path会让：

```text
style / position / measured
```

与 snapped live rect 同步。

所以 T5不得给 width/height加滞后的 CSS transition。

NodeWrapper current也刻意避免让 geometry靠 transition拖尾。

---

## 5.4 Commit

`handleResizeEnd`：

```text
endResizePreview()
read getResizeSnappedRect/getResizeContext

node-specific onResizeEnd
→ BEFORE canonical geometry commit

setNodeGeometry(...)
→ Huabu authoritative spatial commit

endSnapSession()
resumeHeightCommits('node-resize')
```

Canonical boundary：

```text
live preview
= disposable spatial preview

setNodeGeometry
= Huabu spatial truth write
```

不是 Core domain write。

---

## 5.5 Single cancel

### GAP

本轮 current `NodeWrapper`没有提供一条明确的：

```text
Esc/pointercancel
→ restore pre-resize geometry
```

T5不能先设计强 rollback motion。

需要 T1/Huabu owner补 exact cancel seam后才能承诺。

---

# 5.6 Multi-select bounding resize

## CURRENT / REUSE

文件：

```text
huabu/apps/web/src/components/Panels/Canvas/MultiSelectResizer.tsx
```

条件：

```text
selected nodes >= 2
```

一个 bounding resizer。

Per-node handles由 NodeWrapper suppress。

---

## 5.7 Pointer capture

CURRENT start：

```text
setPointerCapture(pointerId)
```

只有：

```text
left mouse
or direct touch/pen
```

---

## 5.8 Multi start

```text
snapshot selected roots
Frame root includes descendants
onNodeResizeStart()
snapshotRef = anchor/diag/nodes
```

---

## 5.9 Multi tick

```text
screen cursor
→ live ReactFlow transform
→ flow-space

resolveMultiSelectScale
default free-axis

Shift OR image/video present
→ uniform scaling

resolveMultiSelectGeometry
→ previewResizeGeometry(items)

fontFit nodes
→ patchNodeSilent temporary font preview
```

---

## 5.10 Multi commit

`endGesture`：

```text
latest items
→ setNodeGeometry(items)
→ resumeHeightCommits
→ releasePointerCapture
```

---

## 5.11 Multi cancel nuance

CURRENT：

```text
onPointerCancel={endGesture}
```

所以：

> **pointercancel 当前会提交 latest preview geometry。**

它不是 rollback。

状态必须标：

```text
CURRENT COMMIT-ON-CANCEL
```

如果 LCOS最终需要：

```text
Esc/cancel → restore pre-resize
```

必须补 Huabu/T1 physical cancel contract。

T5不得通过“回弹动画”假装已经回滚。

---

## 5.12 T5 visual feedback

```text
bounding outline
corner handles
live body resize
snap cue
text/font responsive update
```

Reduced motion：

```text
pointer geometry仍1:1跟手
禁用非必要spring/glow
不能把resize变成离散跳点
```

---

# 6. Drag / Drop 全状态链

先分：

```text
A. native spatial Move
B. semantic Give
C. Right Carry
D. Relation Handle
E. physical cross-Space transfer
```

T5绝不能用一套动画把五者糊起来。

---

# 6.1 Native left drag → blank

## CURRENT / REUSE

Huabu：

```text
Canvas.tsx
canvasStore.onNodeDragStart
canvasStore.onNodeDrag
canvasStore.onNodeDragStop
snapSession
```

Before：

```text
pre-drag geometry snapshot
gesture undo snapshot
```

During：

```text
node真实跟 pointer
snap / frame previews
```

After：

```text
NODE_DRAG_STOP
frame/reparent commit
free move schedule structure save
undo snapshot retained
```

Canonical：

```text
Huabu spatial truth
```

Core：

```text
no domain mutation
```

T5：

```text
Move cursor/body motion
snap guides
frame receptor
settle
```

---

# 6.2 Semantic Give

## CURRENT

当前 `apps/web-gen2/src/interaction/semanticDropMachine.ts` 仍是旧 Phase-A：

```text
left/bottom edge slot
dwell
420ms
```

它是：

```text
CURRENT BUT SUPERSEDED
```

T5不要围绕这套 edge band设计 final visual。

---

## 6.3 APPROVED PLANNED state

T3 C1-S3C：

```ts
gesture:
  'left-give' | 'right-carry'

target:
  {kind:'node', spatialId}
  | {kind:'remote-target', targetKey}

admission:
  operationKey
  projectionOutcome:
    'place-at-target'
    | 'preserve-source'
```

Planned visual lifecycle：

```text
tracking
→ candidate
→ receptive / invalid
→ release
→ committing
→ accepted / failed
```

---

# 6.4 Pending / release mechanics

### PLANNED

Left semantic body release要在 Huabu normal drag-stop persistence之前判断。

如果 semantic：

```text
cancelActiveNodeDrag()
→ physical trial drag rollback
→ do NOT normal onNodeDragStop
```

之后 target owner async commit。

---

# 6.5 Visible Host

Frozen：

```text
projectionOutcome='place-at-target'
```

Flow：

```text
approach
→ receptor

release
→ physical real node rollback internally
→ landing proxy holds visual position
→ source origin body temporarily suppressed

Core/target success
→ T1/target owner final real projection placement/reflow
→ proxy→real handoff
```

用户视觉：

```text
像“直接放进去”
```

不能看见明显回弹。

---

# 6.6 Remote Target

```text
projectionOutcome='preserve-source'
```

Flow：

```text
release
→ physical trial rollback
→ source real projection stays origin
→ target commits semantic mapping/use
→ receipt
```

用于：

```text
Glyth
Railway remote destination
closed/unopened Worksite portal
```

---

# 6.7 Core failure

Planned：

```text
landing proxy / receptive state → failed
real source is already safe
no fake spatial persistence
```

T5显示：

```text
local rejection / failed settle
```

不能：

```text
维持“成功放入”的body
```

---

# 6.8 Core success but spatial manifestation failure

这是重要边界。

### Canonical rule

如果：

```text
Core target mutation已成功
```

但：

```text
Huabu final projection/reflow失败
```

则：

```text
canonical success不可被T3视觉回滚成“没发生”
```

必须：

```text
projection owner/reconciliation修复
```

### Typed presenter state

```text
GAP
```

当前 T3 尚未正式定义：

```text
canonical-success / manifestation-pending
```

这种 exhaustive UI state。

所以 T5可以为“同步中 / manifestation pending”预留视觉槽，但不能自己发明一个会改 truth 的 Retry。

---

# 6.9 Motion responsibility

T3：

```text
决定 phase
```

T5：

```text
approach / receptive / proxy / settle visual choreography
```

Huabu：

```text
真实 spatial geometry
```

Reduced motion：

```text
保留 receptor状态
保留 source/result位置真相
去掉弹簧/长位移
用 opacity / short scale / immediate handoff
```

---

# 7. Assembly 操作触发 Focus：五种 owner 不得串台

这是 T5 最容易通过“镜头跟着选中东西”偷偷把五件事合并的地方。

---

## 7.1 Assembly canonical apply

### CURRENT

文件：

```text
apps/local-core/src/routes/f6-assembly.ts
```

Current route：

```text
POST /projects/:projectId/assembly/apply
```

Input contract：

```text
schemaVersion:1
sourceRefs[]
targetRef
```

Core owner：

```text
AssemblyApplyService
```

T3/T5不写它的 truth。

---

## 7.2 Assembly target focus

### Owner

```text
T4 Assembly presentation/session owner
```

它表示：

> 当前 Assembly 正在围绕哪个 canonical target工作。

它不是：

```text
Huabu Selection
Reference
Focus camera
membership
```

Current final UI exact source：

```text
GAP / T4 professional-body not yet landed
```

---

## 7.3 Ordinary select

Owner：

```text
Huabu Selection
```

作用：

```text
spatial operation target
```

不改 Assembly target，除非用户执行明确：

```text
Use as Assembly Target
```

---

## 7.4 Explicit Focus request

Owner split：

```text
T2
→ navigation/focus intent

T1/Huabu
→ camera execution
```

Current camera primitive：

```text
huabu/apps/web/src/components/Panels/CanvasLayerPanel/focusNodesOnCanvas.ts
```

`focusNodesOnCanvas()`：

```text
reliable node bounds
→ setCenter(...)
→ explicit Camera travel
```

Focus：

```text
camera-only navigation action
```

不写：

```text
membership
Reference
Assembly apply
Receiver
```

---

## 7.5 membership / Reference

Reference：

```text
T3 Composer draft
```

Membership：

```text
T6 / target owner
```

Assembly自己不拥有 membership。

---

## 7.6 Camera request

只允许：

```text
explicit Focus / Locate
```

Assembly：

```text
hover preview
select source
set target
apply
```

都不能默认调用 Camera。

如果 Assembly按钮同时要“Target + Focus”：

必须是两个串联意图：

```text
set Assembly target
+
explicit Focus request
```

不可用视觉动画偷偷绑定。

---

# 8. Rich Overlay Arbitration
## Action Arc / Composer / Local Toolbar / Focus / Professional Window

---

## 8.1 CURRENT local toolbar

```text
NodeFloatingToolbar
```

CURRENT gate：

```text
single selected node
not dragging
no competing stroke selection/connect
```

它负责 Huabu geometry/display/actions mechanics。

---

## 8.2 Action Arc

```text
PLANNED / NOT LANDED
```

T3 `actionArcModel.ts` approved plan：

```text
3 normal
4 max
capability-driven
direct high-frequency action
```

---

## 8.3 Current overlay arbitration

文件：

```text
apps/web-gen2/src/interaction/overlayArbitration.ts
```

CURRENT stale rule：

```ts
if (workViewOpen) return ['work-view']
```

已被 Phase B覆盖。

---

## 8.4 PLANNED priority

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
Semantic Give / Right Carry active feedback

P3
Action Arc

P4
resize / selection local chrome

P5
tooltip / nonessential label
```

不是单纯：

```text
高优先级出现 → 全部低优先级卸载
```

未来应允许：

```text
visible
compact
suppressed
```

---

## 8.5 Focus

Focus是：

```text
explicit camera request + navigation presentation
```

不是一个可以把 Selection/Composer truth清掉的 modal。

Focus HUD应受 shared safe area。

---

## 8.6 Professional Window

T4计划：

```text
ProfessionalWindowEnvironment {
  viewportRect
  occupiedRects
  safeRect
  safeInsets
  activeRegions
}
```

关键：

```text
Docked edge
→ shrink safeRect

Floating
→ collision obstacle
→ not global safeRect shrink
```

Professional Window：

```text
changes screen-space
Canvas world stays
Camera stays
```

---

## 8.7 Floating placement primitive

CURRENT / REUSE：

```text
huabu/apps/web/src/components/Common/CanvasFloatingPopover.tsx
```

current：

```text
flow anchor
→ body portal
→ Floating UI
→ offset / flip / shift
→ Canvas DOM boundary
→ ResizeObserver
```

PLANNED：

```text
consume T4 safe screen region
```

禁止：

```text
T5 CSS硬编码 right: 420px
T3第二 positioning engine
```

---

# PART II · T5 后续全范围

# 9. Relation

## STATUS

```text
CURRENT canonical path
PLANNED local handle session/body
```

## Exact current

```text
apps/web-gen2/src/host/hostConnectIntent.ts
apps/web-gen2/src/spatial/relationProjection.ts
apps/web-gen2/src/backend/relations.ts
```

Current：

```text
UI semantic connect
→ resolve endpoints
→ Core createRelation FIRST
→ Huabu Edge projection
→ ProjectionBinding
```

Core reject：

```text
NO fake edge
```

Current kind resolver：

```text
resolveConnectKind()
→ 'references'
```

specific port mapping：

```text
GAP / Phase-C future
```

## Pointer owner

```text
ReactFlow connect mechanics / explicit handle
```

不是 body semantic drop machine。

## Before/during/after

```text
available
→ armed
→ dragging live line
→ valid/invalid receptor
→ Core commit
→ edge manifestation
```

Core success + edge failure：

```text
Relation canonical truth remains
projection reconciliation repairs
```

T5不得：

```text
失败后再次 create Relation
```

## Reduced motion

```text
live line remains direct
settle animation can become immediate
semantic edge existence remains obvious
```

---

# 10. Left drag

## CURRENT

blank/native host mechanics landed。

## PLANNED

semantic target branch。

T5 visual must identify cursor/feedback as：

```text
Move
vs
Give
```

不得等 release 才突然换语义。

---

# 11. Right drag

## PLANNED / NOT LANDED

T3 C1-S3C：

```text
mouse button 2
movement < shared drag threshold
→ Right-click Management

movement >= threshold
→ Right Carry
```

Source：

```text
NEVER moves
```

只有 proxy。

Pointer owner：

```text
existing PointerRouter extra recognizer
```

No second router。

T5：

```text
proxy必须与真实 source body视觉可区分
```

---

# 12. Modifier drag

没有一个通用“modifier = semantic mode” contract。

CURRENT已占用的 modifier：

```text
Shift click
→ additive Selection

Cmd/Ctrl click
→ Reference

Space during Huabu node drag
→ bypass auto-reparent

Shift during MultiSelect resize
→ uniform scale

Huabu content DnD:
macOS Option / others Ctrl
→ copy vs move for certain internal note payloads
```

PLANNED：

```text
right button
→ Carry
```

GAP：

```text
Alt/Option semantic Give mode
Cmd/Ctrl drag semantic mode
Shift drag semantic mode
```

T5不得自行给 modifier加 glyph/cursor semantic。

---

# 13. Handle drag

两类不要混：

```text
resize handle
→ Huabu geometry

relation handle
→ Project Relation
```

T5必须把 shape/cursor/feedback做出差异。

---

# 14. Direct semantic trigger

例如 Action Arc：

```text
AI Work
→ open Composer
→ no canonical write

Relation
→ arm handle
→ no canonical write until connect commit

Assembly
→ T4 command
Pin
→ T2 command
```

Hover本身不能做 canonical commit。

---

# 15. Collection expanded / collapsed drop

## Expanded visible host

Phase B frozen：

```text
left body drop
→ add Collection membership
→ current projection最终留在target
→ Huabu/T1 may reflow

right carry
→ add membership
→ source current projection不动

relation handle
→ Project Relation only
```

Owner：

```text
T3 gesture
T6 membership
T1 presentation/reflow
T5 feedback
```

## Collapsed Collection

它可以作为 Collection natural semantic receiver。

但当前 Phase B没有为“collapsed body”单独冻结：

```text
projectionOutcome一定 place-at-target
or preserve-source
```

因此最终必须由：

```text
target adapter admission
```

返回。

状态：

```text
SPATIAL OUTCOME = GAP UNTIL TARGET ADAPTER OWNER CONFIRMS
```

T5可以设计：

```text
collapsed receptive
membership accepted
```

但不能自己决定：

```text
source缩进Collection并从原位消失
```

---

# 16. Assembly Source / Target Drop

CURRENT Core：

```text
POST /projects/:id/assembly/apply
sourceRefs[]
targetRef
```

Frozen UX：

```text
Candidate
→ Validate
→ Preview
→ Commit
```

Assembly Source Bay：

```text
read/browse source
```

Target：

```text
typed canonical target
```

T5 feedback要分：

```text
source selected
target active
candidate
validating
preview
applying
applied
rejected
```

但 exact T3 presenter union：

```text
GAP / T4 BODY OWNER
```

T5不能：

```text
Source Bay自己写membership
hover就apply
Focus preview改变Selection
```

---

# 17. Receiver Drop

先区分两个完全不同的用户动作。

## Content → Glyth / Conversation body

Frozen：

```text
durable Conversation Context Mapping
source preserve
```

不是：

```text
Set Receiver
```

## Content → Composer Reference strip

```text
this-run Reference
```

不是 mapping。

## Drop onto Receiver chip to change Receiver

```text
CURRENT/APPROVED CONTRACT:
NOT DEFINED
```

T5不要先把 Receiver chip做成 drop target。

Receiver切换当前应是：

```text
explicit one-step choice
```

per-run override不改 Project Active Receiver。

---

# 18. Railway destination drop

## PLANNED / NOT LANDED

T3 target：

```ts
{
  kind:'remote-target',
  targetKey:string
}
```

source：

```text
preserve-source
```

`targetKey`：

```text
T2/T6 stable destination identity
```

T3不保存 Railway truth。

T5显示：

```text
approach
armed/receptive
commit
receipt
```

Railway-specific formal presenter TS union：

```text
GAP
```

---

## Physical move is separate

CURRENT Huabu：

```text
POST /api/canvas/:sourceCanvasId/move-selection
```

只有产品语义明确是：

> 真正把 Huabu spatial objects 搬到另一个 Space

才走这条。

`MoveSelectionModal`：

```text
不得成为 Railway main UX
```

---

# 19. Action Arc

## PLANNED

`actionArcModel.ts`

State：

```text
open
target
actions
enabled
active
attention
```

T5显示：

```text
3 normal / 4 max
object-local satellites
hover才补字
```

与 Current NodeFloatingToolbar 不能一起堆成：

```text
toolbar + Arc + resize + badges
```

No-go：

```text
management actions
Voice
Provider
大 radial menu
```

---

# 20. Compact Composer

## PLANNED / NOT LANDED

Approved files：

```text
composerDraft.ts
composerDraftRegistry.ts
referencePickSession.ts
voiceTextMerge.ts
receiverResolution.ts
runSubmission.ts
```

Current reusable：

```text
Huabu ChatInput mechanics
```

State：

```text
draft
refs
receiver
run phase
error
```

Projection：

```text
local
work-view-dominant
suppressed-by-promotion
```

T5：

```text
2–4 line compact
max height internal scroll
same draft across projections
```

No-go：

```text
大 sidebar
multi-select自动打开
Provider selector
```

---

# 21. Voice

## CURRENT Core

```text
POST /runtime/voice/transcriptions
```

## PLANNED frontend

```text
CoreVoiceClient
voiceTextMerge
```

States：

```text
idle
recording
transcribing
error
```

No auto-send。

T5 motion：

```text
inline local state
```

Reduced：

```text
waveform可降为静态level/status
不改变录音/转写 truth
```

---

# 22. Run command

## CURRENT Core

```text
POST /projects/:id/runs
POST /runs/:id/dispatch
POST /runs/:id/recover
POST /runs/:id/sync
POST /runs/:id/cancel
GET /runs/:id/review
GET /runs/:id/events
```

## PLANNED T3

```text
create
→ capture runId
→ dispatch
```

dispatch fail：

```text
keep existing runId
Retry existing run
NO duplicate create
```

Stop：

```text
cancel run
draft/refs/receiver keep
```

---

# 23. waiting_input

## CURRENT Core signal

Route：

```text
GET /runs/:runId/input-request
POST /runs/:runId/input-request
```

GET no pending：

```text
404
"This task is not waiting for more information."
```

POST answer：

```text
requestId
text?
selectedOptions?
```

Current `RunReview` also includes：

```text
inputRequest
```

when pending.

## T3 presenter

```text
GAP
```

C1-S3B planned `ComposerRunPhase` did not yet formally add `waiting-input`.

Recommended engineering mapping：

```text
keep run lifecycle state
+
orthogonal pendingInputRequest?
```

而不是 T5自己发明一个新 Run truth。

T5可以设计：

```text
needs input / waiting attention
inline answer affordance
```

但按钮要等 typed client/controller landed。

---

# 24. Retry / Cancel

有两种 Retry，必须区分。

## Runtime dispatch/recovery retry

```text
existing Run
→ recover / dispatch existing
```

T3 RunSubmission owner。

## Review retry

CURRENT：

```text
POST /artifact-returns/:returnId/retry
```

Core：

```text
RuntimeReviewService.retry()
→ creates NEW Run
→ retryOfRunId = previousRun.id
→ new RuntimeDispatch
```

这是真正的“基于被审结果重试”，不是网络 dispatch retry。

T5必须用不同语义/位置。

## Cancel

CURRENT：

```text
POST /runs/:runId/cancel
```

explicit only。

Closing Work View：

```text
≠ cancel
```

---

# 25. Result Review

## CURRENT

`RuntimeReviewService.getRunReview()` 返回：

```text
run
dispatch
binding?
returns[]
draftRevisions[]
inputRequest?
presentationPhase
capabilities {
  accept
  reject
  retry
}
```

当有：

```text
pending_review artifact return
```

则：

```text
presentationPhase='review'
accept/reject/retry enabled
```

T5可以直接围绕 capability设计：

```text
Review ready
Accept
Reject
Retry
```

不要按 Run status字符串自己猜按钮。

---

# 26. Accept / Reject / Revert

## CURRENT runtime review actions

Exact route：

```text
POST /artifact-returns/:id/accept
POST /artifact-returns/:id/reject
POST /artifact-returns/:id/retry
```

Accept：

```text
requires expectedBaseRevisionId
Core mutation
optional ResultSlot materialization
```

Reject：

```text
reject pending return
```

Retry：

```text
new Run
```

## “Revert accepted result”

Generic runtime endpoint：

```text
NOT FOUND
```

状态：

```text
GAP
```

接受以后如果要恢复：

```text
必须走 ChangeSet / target canonical inverse owner
```

T5不能把 Review 的 `reject` 随便改名为：

```text
Revert
```

然后在已 Accept 后还显示同一个按钮。

---

## Note provenance is a separate current local mechanism

`NotePreview.tsx` / `ProvenanceOverlay.tsx` CURRENT有：

```text
Accept block
Reject block
Accept All
Reject All
tombstone restore/dismiss
```

这是 Note content provenance review。

它不是 generic Run Result Review API。

---

# 27. Esc 逐级退出

当前只有部分通用机械 landed。

## CURRENT primitive

```text
useCloseOnEscape()
```

规则：

```text
top overlay closes
stopPropagation
do not clear Selection underneath
```

## PLANNED T3 stack

从内到外：

```text
1. rich-text subpopover / picker
2. Reference Pick
3. Context Menu / local popover
4. active Relation / Semantic Carry transient gesture
5. Compact Composer projection
   → preserve draft/refs/receiver
6. Action Arc
7. explicit Focus presentation
   → T2/T1 owner
8. Professional Window
   → T4 owner
9. Worksite/back
   → T2 owner
10. Canvas-level selection/gesture fallback
   → Huabu owner
```

## Important GAPs

```text
Voice recording + Escape
= NOT FROZEN

global current exact handler for every layer
= NOT LANDED

Professional Window Esc
= T4 exact behavior required
```

T5不能做：

```text
一个 Esc
→ 全部 overlay + Composer + Selection + Work View 一起消失
```

---

# 28. Drag settle

## Native Move

```text
real body
→ snapped real geometry
→ Huabu commit
```

T5 settle只表现，不改最终点。

## Visible semantic Give

```text
landing proxy
→ real projection handoff
```

## Remote Give

```text
source settles/restores origin
target receipt
```

## Right Carry

```text
proxy dissolve
source real body remains static
```

## Relation

```text
live line
→ canonical projected edge
```

Core success但edge manifestation failure：

```text
don't visually create second relation
reconciliation owner repairs
```

Reduced motion：

```text
position truth立即到位
去掉spring/overshoot
保留accepted/rejected state cue
```

---

# 29. Overlay collision priority

Final engineering priority from T3 C1-S3D：

```text
P0
focused Composer
Voice active
Reference Pick
Context Menu / active local popover

P1
passive Composer with draft

P2
Relation / Semantic Give / Right Carry active feedback

P3
Action Arc

P4
Selection / resize chrome

P5
Tooltip / nonessential labels
```

Professional Window：

```text
NOT overlay kind
= environment / occupancy
```

T4 planned：

```text
docked → safeRect shrink
floating → activeRegion obstacle
```

T5：

```text
low-priority chrome yields first
active user work survives
```

---

# 30. Motion Responsibility Master Matrix

| State change | Truth owner | Physical owner | Motion owner |
|---|---|---|---|
| hover | Huabu transient | NodeWrapper | T5 |
| select | Huabu transient | ReactFlow/Selection HUD | T5 |
| Reference add | T3 draft | Reference controller | T5 |
| resize tick | Huabu preview | resize engine | T5 only non-lagging styling |
| resize commit | Huabu spatial truth | canvasStore | T5 settle |
| native move | Huabu spatial truth | drag engine | T5 snap/settle styling |
| semantic candidate | T3 transient | target adapter | T5 |
| semantic canonical commit | T6/target owner | Core | T5 pending/receipt |
| projection manifestation | T1/Huabu | projection owner | T5 handoff |
| Relation create | Core | relation seam | T5 line/settle |
| Voice recording | T3 transient + Core transcription | Composer | T5 |
| Run state | Core | Runtime | T5 Glance/status only |
| Focus | T2 intent | T1/Huabu Camera | T5 arrival cue, not Camera truth |
| Work View | T4 | Professional Window | T5 material/motion |

---

# 31. Reduced Motion Master Rule

Reduced motion 不等于：

```text
去掉状态反馈
```

必须保留：

```text
position truth
selected state
receptive/invalid
pending
accepted/failed
waiting input
review required
focus target
```

减少：

```text
spring
overshoot
long travel
continuous decorative loop
```

建议：

```text
Move/resize
→ pointer-direct unchanged

Give/Carry
→ opacity + short scale

Arc
→ short fade/scale

Composer
→ short opacity/height snap

Glyth attention
→ static emphasis / brief opacity

explicit Focus camera
→ T1/T2 reduced-motion policy，T5不定义camera duration
```

---

# 32. Browser Acceptance Master List

Huabu current Playwright harness可直接复用。

## Selection

```text
B01 hover does not select
B02 click selects exactly once
B03 Shift adds selection
B04 Cmd/Ctrl Reference does not replace Selection
B05 blank click/tap deselect
B06 overlay Esc does not clear Selection
```

## Text edit

```text
B07 TextNode dblclick enters in-place edit
B08 editor remains aligned during pan/zoom
B09 resize while editing follows real node rect
B10 blur commits current TextNode behavior
B11 no fake generic Esc rollback
```

## Note/rich editor

```text
B12 Note dblclick opens PreviewWorkspace editor
B13 Milkdown selection toolbar follows selected text
B14 toolbar click preserves selection/caret
B15 subpopover Esc closes only top layer
B16 toolbar never participates in Canvas layout
```

## Resize

```text
B17 single resize continuous
B18 snap preview and final commit match
B19 multi resize one bounding handle set
B20 Shift uniform scale
B21 pointer capture survives leaving handle rect
B22 pointercancel current commit behavior documented
```

## Drag

```text
B23 blank left drag remains native Move
B24 semantic target does not persist trial Move
B25 Visible Host no visible bounce
B26 remote target source preserved
B27 Core failure no fake success
B28 right click under threshold opens management
B29 right drag source body never moves
B30 locked right drag suppresses exactly one contextmenu
```

## Relation

```text
B31 Core rejects → no edge
B32 Core succeeds → one edge
B33 manifestation failure does not duplicate relation
```

## Assembly / Focus

```text
B34 Assembly hover preview does not change Selection
B35 set Assembly target does not move Camera
B36 Reference does not change Assembly target
B37 explicit Focus may move Camera
B38 Professional Window resize does not move Camera
```

## Run

```text
B39 Voice transcript never auto-sends
B40 per-run Receiver does not mutate Project Active Receiver
B41 create→dispatch
B42 dispatch failure retry reuses existing Run
B43 waiting_input renders from real inputRequest
B44 Cancel calls existing Run cancel
B45 Review actions use capability flags
B46 Reject ≠ post-accept Revert
```

## Overlay

```text
B47 focused Composer survives Work View resize
B48 safeRect collision moves screen-space UI only
B49 Camera transform unchanged by Professional Window
B50 node world geometry unchanged
B51 Main/Context/Workflow local states do not leak
```

Final RC：

```text
Chromium
+
system Edge channel
```

---

# 33. T5 Visual Feedback Checklist

T5必须能从画面上直接看出：

```text
hover
selection
multi-selection
editing
Reference
resize
native Move
semantic Give
Right Carry
Relation
valid receiver
invalid receiver
pending Core
accepted
failed
manifestation pending
Run working
waiting_input
review ready
accepted review
rejected review
Focus target
Professional Window occupancy
```

但：

> Visual differentiation ≠ new semantic state.

如果 T5发现必须新增一个视觉状态才能讲清：

```text
先回 T3/T1/T2/T4/T6 owner
确认它是否真有 source state
```

不要让 CSS class 先成为事实。

---

# 34. T5 绝对不能通过视觉偷偷实现的语义

```text
hover → Focus
select → Reference
select → Assembly target
select → Receiver
multi-select → Composer
proximity → Context Mapping
proximity → Relation
drop onto Glyth → Set Receiver
drop onto collapsed Collection → guessed spatial outcome
right drag → physical Move
relation line → membership
Assembly hover → apply
Work View open → Camera recenter
Work View open → clear local Composer
Retry → duplicate Run
Reject → generic Revert
pointercancel resize → visual rollback when source committed
```

---

# 35. Current / Reuse / Planned / Gap 总表

| Seam | Status |
|---|---|
| Hover | CURRENT |
| single Selection | CURRENT / REUSE |
| Shift multi-select | CURRENT / REUSE |
| Cmd/Ctrl Reference classifier | CURRENT |
| Reference ordered state | CURRENT |
| Text inline edit | CURRENT |
| Note rich edit | CURRENT PreviewWorkspace |
| generic “all content inline editor” | GAP |
| rich-text FloatingToolbar | CURRENT / REUSE |
| single resize | CURRENT / REUSE |
| multi resize | CURRENT / REUSE |
| resize rollback cancel | GAP |
| native left Move | CURRENT / REUSE |
| Phase-C Semantic Give | PLANNED |
| Right Carry | PLANNED |
| Relation Core-first | CURRENT / REUSE |
| Relation local session | PLANNED |
| Collection expanded left-drop | FROZEN / target owner + T3 planned gesture |
| Collection collapsed spatial outcome | GAP |
| Assembly Core apply | CURRENT |
| Assembly final interaction body | T4 GAP/PLANNED |
| Receiver choice | Core current + T3 PLANNED |
| Receiver drop target | GAP except Glyth/Composer known semantics |
| Railway remote-target | PLANNED |
| physical cross-Space move | CURRENT |
| Action Arc | PLANNED |
| Composer | PLANNED |
| Voice Core | CURRENT |
| Voice frontend | PLANNED |
| Run Core | CURRENT |
| Run frontend controller | PLANNED |
| waiting_input Core | CURRENT |
| waiting_input T3 presenter | GAP |
| RunReview | CURRENT |
| Accept/Reject/Retry return | CURRENT |
| generic Revert after Accept | GAP |
| Esc top-overlay primitive | CURRENT |
| full Esc hierarchy | PLANNED + cross-thread GAP |
| overlayArbitration current | CURRENT stale |
| overlayArbitration v2 | PLANNED |
| ProfessionalWindowEnvironment | T4 PLANNED |
| safe-area CanvasFloatingPopover | CURRENT primitive + PLANNED extension |
| Focus camera mechanics | CURRENT / REUSE |

---

# 36. Exact Source Index

## Huabu

```text
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
huabu/apps/web/src/components/Nodes/NodeWrapper.tsx
huabu/apps/web/src/components/Panels/Canvas/SelectionOutlines.tsx
huabu/apps/web/src/components/Panels/Canvas/MultiSelectResizer.tsx

huabu/apps/web/src/components/Nodes/text/TextNode.tsx
huabu/apps/web/src/components/Nodes/shared/TextNodeBody.tsx

huabu/apps/web/src/components/Nodes/note/NoteNode.tsx
huabu/apps/web/src/components/Nodes/note/NotePreview.tsx
huabu/apps/web/src/components/Nodes/note/ProvenanceOverlay.tsx

huabu/apps/web/src/components/Milkdown/MilkdownFloatingToolbar.tsx

huabu/apps/web/src/components/Common/CanvasFloatingPopover.tsx

huabu/apps/web/src/store/previewWorkspace/actions.ts
huabu/apps/web/src/store/canvasStore.ts

huabu/apps/web/src/hooks/useCanvasPointerRouter.ts
huabu/apps/web/src/hooks/useCloseOnEscape.ts
huabu/apps/web/src/hooks/shortcuts/useCanvasShortcuts.ts

huabu/apps/web/src/lcos-seam/types.ts
huabu/apps/web/src/lcos-seam/nodePresentation.tsx

huabu/apps/web/src/components/Panels/CanvasLayerPanel/focusNodesOnCanvas.ts
```

## web-gen2

```text
apps/web-gen2/src/interaction/pointerIntent.ts
apps/web-gen2/src/interaction/referenceController.ts
apps/web-gen2/src/interaction/semanticDropMachine.ts
apps/web-gen2/src/interaction/overlayArbitration.ts

apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/host/hostConnectIntent.ts
apps/web-gen2/src/spatial/relationProjection.ts
apps/web-gen2/src/spatial/projectionBinding.ts
apps/web-gen2/src/presentation/rendererRegistry.ts
apps/web-gen2/src/presentation/nodePresentation.ts
```

## Local Core

```text
apps/local-core/src/routes/runs.ts
apps/local-core/src/routes/runtime-reviews.ts
apps/local-core/src/runtime-review-service.ts
apps/local-core/src/routes/receiver.ts
apps/local-core/src/routes/voice-transcription.ts
apps/local-core/src/routes/f6-assembly.ts
apps/local-core/src/routes/relations.ts
```

---

# 37. Planned Exact Files from T3 C1

当前 baseline 尚未 landed：

```text
apps/web-gen2/src/backend/runs.ts
apps/web-gen2/src/backend/receiver.ts
apps/web-gen2/src/backend/voice.ts

apps/web-gen2/src/interaction/actionArcModel.ts
apps/web-gen2/src/interaction/composerDraft.ts
apps/web-gen2/src/interaction/composerDraftRegistry.ts
apps/web-gen2/src/interaction/referencePickSession.ts
apps/web-gen2/src/interaction/runReferenceResolver.ts
apps/web-gen2/src/interaction/voiceTextMerge.ts
apps/web-gen2/src/interaction/receiverResolution.ts
apps/web-gen2/src/interaction/runSubmission.ts

apps/web-gen2/src/interaction/semanticCarrySession.ts
apps/web-gen2/src/interaction/semanticTargetAdapter.ts
apps/web-gen2/src/interaction/bodyCollisionResolver.ts
apps/web-gen2/src/interaction/relationHandleSession.ts

apps/web-gen2/src/interaction/actionArcModel.ts
apps/web-gen2/src/interaction/safeRegionSelection.ts
apps/web-gen2/src/interaction/t3InteractionSnapshot.ts
```

Host thin seams planned：

```text
CanvasHostExtension.nodeInteraction
CanvasHostExtension.nodeDropIntent
generic safe-screen floating boundary
```

---

# 38. T5 交付格式

T5 后续每个 final visual item回传时，请带：

```text
T5-ID
feature
exact engineering state(s)
body
glyph
material
spacing
LOD
motion
reduced-motion
safe-area behavior
hit-area
focus/a11y

CURRENT owner component to reuse
or
FINAL production component mapping
```

如果 T5只给：

```text
Figma frame / image
```

但没有：

```text
它消费哪个 exact interaction state
```

则不能直接回填 C1-FINAL。

---

# 39. 最后一条施工原则

这份蓝图的最终边界可以压成一句：

> **T5 可以把每个真实状态画得非常清楚，但不能通过“看起来像发生了”来替代真正的 owner / commit / rollback / recovery。**

或者更大白话：

```text
能动的地方很多。
有资格改真相的地方很少。
```

这条守住，视觉越精致越安全。
