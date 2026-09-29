# LCOS Gen2 · T4
# C1-2 · Professional Window Topology + Dockview + Protected Canvas
## Exact Source Construction Plan

日期：2026-09-06  
LCOS源码基线：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`  
Dockview donor：`dockview/dockview@v8.2.0`  
阶段：`PHASE C1-2`  
状态：`FORMAL SOURCE-LEVEL PLAN / NO PRODUCTION PATCH`

---

# 0. 本卡只解决什么

本卡只解决：

```text
Professional Window Topology
+
Protected Spatial Canvas
+
PreviewWorkspace 外壳迁移
+
旧 MainLayout right-panel owner 退休
+
窗口布局 presentation persistence
+
Dockview DnD 与 LCOS semantic DnD 共存
```

不解决：

```text
Assembly body业务内容
Context body业务内容
Workflow body业务内容
Skill Builder业务内容
Run Review业务内容
Archive body业务内容
Worksite canonical identity
T2 route
T1 spatial body
T5最终视觉
```

这些只通过本卡提供的统一 Window host 接入。

---

# 1. Phase B / V2 固定输入

本卡执行：

```text
Professional Window / Unified Work View
支持：
Float
Dock
Undock
Resize
Move
横/竖组合
Close
Restore

多 Professional Region 可同时存在

Work View
≠ Child Worksite

Conversation Child Canvas
+ Conversation Preview
+ Assembly
可同时出现

Professional Window resize
不得自动移动 Camera
```

C1-1 已定义：

```text
ProjectSession
ProfessionalWindowEnvironment
viewportResizePolicy='preserve-transform'
```

C1-2不重新打开这些产品定义。

---

# 2. Current Huabu shell 事实

## 2.1 `CanvasPage.tsx`

当前：

```tsx
<MainLayout
  header={<CanvasHeader />}
  leftPanel={<CanvasLayerPanel />}
  rightPanel={<PreviewWorkspacePanel />}
>
  <CenterArea />
</MainLayout>
```

说明 current shell 只能表达：

```text
left rail
center canvas
one right professional body
```

不能表达：

```text
N professional regions
float
arbitrary split
vertical composition
multiple simultaneous tools
```

---

## 2.2 `MainLayout.tsx`

当前自己拥有：

```text
rightWidthPx
right collapse
right animation
right resize
Preview fullscreen
Canvas/Preview width relation
```

Preview fullscreen 当前会：

```text
直接 unmount Canvas subtree
```

并靠：

```text
isRestoringCanvas
requestAnimationFrame
```

重新挂 Canvas。

这与最终：

```text
Protected Canvas always stable
```

不兼容。

### 裁决

```text
MainLayout
KEEP shell
RETIRE professional topology owner
```

---

## 2.3 `MainLayout.test.tsx`

current测试明确保护：

```text
right panel 420px
right resize
right transition
Preview fullscreen unmount Canvas
restoring state before remount
```

这些不是无关测试。

它们证明：

> 当前 shell 真的把 Preview 当唯一 professional destination。

C1-2必须同步退休/替换相应测试。

不能代码改了，旧测试还努力保证旧产品行为。

---

# 3. Current Preview Workspace 是值得保留的成熟 body

## 3.1 `PreviewWorkspace.tsx`

已有：

```text
tabs
最多两组 horizontal groups
dnd-kit tab drag
PointerSensor
KeyboardSensor
splitRatio
scroll memory
active group
node/chat preview
focus requests
```

这套是：

```text
Preview body 内部的信息组织
```

不是：

```text
LCOS 全局 Professional Window topology
```

### 裁决

```text
KEEP
```

---

## 3.2 `PreviewWorkspacePanel.tsx`

current wrapper只负责：

```text
right-panel collapse
fullscreen
empty workspace lazy seed
Esc exit fullscreen
outer surface shadow
```

### 裁决

```text
MIGRATE / THIN
```

未来它只负责：

```text
Preview body
+
empty workspace lazy seed
```

不再拥有：

```text
host collapse
host fullscreen
right panel
```

---

## 3.3 Preview store

```text
huabu/apps/web/src/store/previewWorkspace/store.ts
```

current是：

```text
canvas-bound PreviewWorkspace
```

拥有：

```text
workspace tabs/groups
loadForCanvas
flush
open target
close tab
activate
move
split ratio
focus requests
```

### C1-2裁决

```text
KEEP INTERNAL BODY STATE
```

绝不让 Dockview接管 Preview内部 tabs/groups。

否则会把：

```text
Window tabs
```

和：

```text
Preview content tabs
```

混成一层。

这是典型“两个东西都有 tab，所以干脆统一”的工程诱惑，通常统一完以后两个都不能用了。

---

# 4. Dockview donor 最终工程裁决

## 4.1 Version

当前稳定：

```text
dockview-react 8.2.0
```

React peer：

```text
16.8 / 17 / 18 / 19
```

Huabu：

```text
react 19.2.8
react-dom 19.2.8
```

兼容。

---

## 4.2 License

```text
dockview-react
dockview
dockview-core
= MIT
```

禁止引入：

```text
dockview-enterprise
```

---

## 4.3 免费版已验证可用能力

本卡允许依赖：

```text
DockviewReact

api.addPanel()

renderer:
  'always'
  'onlyWhenVisible'

panel.api.moveTo()

group.api.moveTo()

api.addFloatingGroup(existingPanelOrGroup)

group.api.maximize()
group.api.exitMaximized()

group.locked = true

group.header.hidden = true

api.toJSON()
api.fromJSON()

onWillDragPanel
onWillDragGroup
onWillDrop
onWillShowOverlay
onDidMutateLayout
onDidMovePanel
onDidRemovePanel
onDidActivePanelChange
```

---

## 4.4 明确禁止把 Enterprise 能力写进 LCOS requirement

本卡不使用：

```text
Smart Guides
DnD Compass
Layout History
Multi-row Tabs
Pinned Tabs
Advanced Overflow
Auto-hide Edge Groups
Dock-to-edge auto groups
Spatial Keyboard Docking
```

如果未来需要：

```text
另做 donor/license裁决
```

不在 C1-2 偷用。

---

# 5. 为什么正式 ADOPT Dockview

自建需要自己写：

```text
split tree
panel move
group move
floating groups
docking
resize
tab/group headers
layout serialization
focus
drag overlays
cross-input DnD
group maximize
panel lifecycle
```

而 Dockview免费版已经成熟。

因此：

```text
Dockview React/Core
= ADOPT engineering primitive
```

LCOS自己只写：

```text
thin adapter
protected invariant
region registry
presentation persistence validation
semantic DnD arbitration
T5 theme layer
```

---

# 6. Package exact changes

## 6.1 MODIFY

```text
huabu/apps/web/package.json
```

ADD：

```json
"dockview-react": "8.2.0"
```

使用 exact version：

```text
不写 ^8.2.0
```

---

## 6.2 Huabu package manager

current：

```text
pnpm@10.34.3
```

root：

```text
huabu/package.json
```

---

## 6.3 Important reproducibility issue

current vendored Huabu tree：

```text
没有 tracked pnpm-lock.yaml
```

而：

```text
dockview-react@8.2.0
```

内部依赖：

```text
dockview ^8.2.0
```

这意味着没有 lock 时：

```text
未来 install
可能解析到更新 8.x
```

---

## 6.4 MODIFY root `huabu/package.json`

ADD pnpm override：

```json
"pnpm": {
  "overrides": {
    "dockview": "8.2.0",
    "dockview-core": "8.2.0"
  }
}
```

如果 implementation 阶段确认现有 repo CI 会生成并提交 workspace lockfile：

```text
可以改为 lockfile pin
```

但当前 source baseline没看到 tracked lock。

因此本 plan 以：

```text
exact direct dep
+
pnpm transitive overrides
```

保证 donor source稳定。

---

# 7. CSS import exact seam

current：

```text
huabu/apps/web/src/main.tsx
→ import './index.css'
```

current：

```text
index.css
→ @import 'tailwindcss'
```

C1-2建议：

## MODIFY

```text
huabu/apps/web/src/index.css
```

在 Tailwind import后引入：

```css
@import 'dockview-react/dist/styles/dockview.css';
```

或如果 Tailwind/PostCSS import order proof失败：

```text
main.tsx
独立 import dockview css
```

优先统一进入：

```text
index.css
```

但不得把 Dockview默认主题直接当 LCOS final visual。

---

# 8. T5 theme ownership

C1-2只保证：

```text
functional Dockview CSS
```

T5后续负责：

```text
tab height
header density
surface color
border
shadow
radius
active states
drag overlay
float shell
motion
glyph
close controls
```

T4只给：

```text
real state hooks / class / data attributes
```

不提前审美冻结。

---

# 9. New module boundary

## ADD directory

```text
huabu/apps/web/src/lcos/professional/
```

C1-1已计划：

```text
ProfessionalWindowEnvironment.tsx
```

C1-2在同一目录增加最少模块。

---

# 10. Exact new files

建议最终只新增：

```text
ProfessionalWindowStage.tsx
professionalWindowModel.ts
professionalWindowController.ts
ProtectedSpatialCanvas.tsx
```

测试：

```text
professionalWindowModel.test.ts
ProfessionalWindowStage.test.tsx
```

不再额外造：

```text
ProfessionalWindowStore
ProfessionalWindowManager
ProfessionalWindowRegistry
ProfessionalWindowPersistenceService
ProfessionalWindowCoordinator
```

五个不同名字的同一件事。

---

# 11. `professionalWindowModel.ts`

## Owner

```text
T4 presentation model
```

只保存：

```text
region identity
body key
target reference string
restore policy
default placement
panel lifecycle rules
```

不保存：

```text
Core domain body
Camera
Canvas node geometry
Context/Workflow truth
```

---

# 12. Region descriptor

候选：

```ts
export type ProfessionalRegionBodyKey =
  | 'preview'
  | 'assembly'
  | 'context-evolution'
  | 'context-relationship'
  | 'context-provenance'
  | 'workflow-detail'
  | 'skill-builder'
  | 'run-review'
  | 'archive'
  | 'web-view'
  | 'pdf-view'
  | 'html-view'

export type ProfessionalRegionRestorePolicy =
  | 'project'
  | 'session'
  | 'never'

export interface ProfessionalRegionDescriptor {
  readonly regionId: string
  readonly bodyKey: ProfessionalRegionBodyKey
  readonly targetKey?: string
  readonly title?: string
  readonly restorePolicy: ProfessionalRegionRestorePolicy
}
```

---

# 13. `regionId` 是 presentation identity

规则：

```text
regionId
≠ canonical entity ID

regionId可以引用 canonical target
但它自己只表示：
“这一个专业工作区域实例”
```

例如：

```text
lcos:preview
lcos:assembly
lcos:archive

lcos:conversation-preview:<conversationId>
lcos:run-review:<runId>
lcos:skill-builder:<skillId>
```

禁止：

```text
canvasId
```

进入 professional regionId。

因为：

```text
Surface switch
→ canvasId变
→ professional region不应换 identity
```

---

# 14. Reserved Protected Canvas identity

固定：

```ts
export const PROTECTED_CANVAS_PANEL_ID =
  'lcos:spatial-canvas'
```

component key：

```text
lcos-spatial-canvas
```

这只是：

```text
Dockview presentation panel ID
```

不是 Huabu canvasId。

---

# 15. Protected Canvas renderer

创建：

```ts
api.addPanel({
  id: PROTECTED_CANVAS_PANEL_ID,
  component: 'lcos-spatial-canvas',
  renderer: 'always',
})
```

理由：

```text
Canvas DOM不能因为tab hidden/host relocation被拆
```

Dockview文档明确：

```text
renderer='always'
→ DOM tree stays alive
```

---

# 16. Canvas group protection

Canvas panel创建后：

```ts
canvasPanel.group.locked = true
canvasPanel.group.header.hidden = true
```

Dockview locked group：

```text
阻止其它 panel 通过 drop进入 group
```

`true`仍保留：

```text
top/right/bottom/left split targets
```

这正好允许：

```text
professional regions dock around Canvas
```

但禁止：

```text
变成 Canvas tab
```

---

# 17. Protect Canvas from drag

Stage注册：

```text
api.onWillDragPanel
```

如果：

```text
panel.id === PROTECTED_CANVAS_PANEL_ID
```

则：

```text
event.nativeEvent.preventDefault()
```

---

# 18. Protect Canvas group drag

虽然 Canvas header hidden：

```text
正常用户拿不到 group drag handle
```

仍注册：

```text
api.onWillDragGroup
```

如果 group包含 Protected Canvas：

```text
preventDefault
```

做 fail-close。

---

# 19. Protect Canvas from close

LCOS controller：

```text
不暴露 close(canvas)
```

且：

```text
Canvas header hidden
```

没有默认 close affordance。

再监听：

```text
onDidRemovePanel
```

如果意外删除 protected canvas：

```text
development:
throw / hard error

production:
reset professional layout to safe default
```

不要静默继续一个：

```text
没有 Canvas 的 LCOS layout
```

---

# 20. `ProtectedSpatialCanvas.tsx`

## Exact file

```text
huabu/apps/web/src/lcos/professional/ProtectedSpatialCanvas.tsx
```

职责极薄：

```tsx
<div
  data-lcos-protected-spatial-canvas
  className="h-full w-full"
>
  {children}
</div>
```

真正 Canvas body：

```text
CenterArea / Canvas
```

仍属于 existing Huabu body。

Protected component不存：

```text
Camera
nodes
selection
```

---

# 21. Stage 如何拿到 Canvas child

## `ProfessionalWindowStage.tsx`

props：

```ts
interface ProfessionalWindowStageProps {
  spatialCanvas: React.ReactNode
  renderRegion: (
    descriptor: ProfessionalRegionDescriptor
  ) => React.ReactNode
}
```

这样：

```text
Window layer
```

不 import：

```text
Assembly implementation
Context implementation
Skill implementation
```

后续各 body 通过一个：

```text
renderRegion
```

组合进来。

---

# 22. 为什么 `renderRegion` 比一个 global BodyRegistry 好

如果写：

```text
global mutable registry
```

会出现：

```text
模块加载顺序
hot reload残留
test污染
plugin ownership模糊
```

`renderRegion` 是：

```text
React composition seam
```

由 active Project shell 注入。

更薄。

---

# 23. Dockview components map

Stage内部只需要两个 component key：

```text
lcos-spatial-canvas
lcos-professional-region
```

不是每种工具都注册一个 Dockview component。

通用 professional component：

```text
读取 params.descriptor
→ renderRegion(descriptor)
```

这样：

```text
Dockview
只知道 panel
```

不知道：

```text
Assembly
Skill
Workflow
```

---

# 24. `professionalWindowController.ts`

## 为什么需要

current：

```text
openPreviewNode()
openChat()
```

是：

```text
store-level imperative action
```

不在 React tree内部。

未来需要：

```text
打开/focus Preview professional region
```

不能让所有 caller都开始：

```text
import DockviewApi
```

---

# 25. Controller seam

ADD：

```text
huabu/apps/web/src/lcos/professional/professionalWindowController.ts
```

interface：

```ts
export interface ProfessionalWindowController {
  open(descriptor: ProfessionalRegionDescriptor): void
  focus(regionId: string): void
  close(regionId: string): void
  float(regionId: string): void
  dock(regionId: string, placement?: DockPlacement): void
  enterImmersive(regionId: string): void
  exitImmersive(regionId: string): void
}
```

---

# 26. Controller不拥有 layout truth

真正 session layout：

```text
DockviewApi
```

controller只是：

```text
imperative adapter
```

不复制：

```text
panel map
group tree
floating bounds
```

---

# 27. Global imperative bridge

因为 current non-React actions需要调用：

```text
open/focus
```

module允许一个：

```text
current controller ref
```

例如：

```ts
installProfessionalWindowController(controller)
requestProfessionalWindow(...)
```

规则：

```text
one active ProjectSession
→ one controller

unmount
→ dispose installation

new project
→ new controller
```

这与：

```text
HostSeam
```

同类，是薄 imperative bridge。

不是 Zustand truth。

---

# 28. Opening a region

controller.open(descriptor)：

```text
if panel exists:
  setActive()
  ensure visible
  return

else:
  api.addPanel({
    id: descriptor.regionId,
    component: 'lcos-professional-region',
    params: { descriptor },
    renderer: rendererPolicyFor(descriptor),
    position: defaultPlacement
  })
```

---

# 29. Renderer policy

不全局：

```text
defaultRenderer='always'
```

否则大量 hidden tools：

```text
动画
ResizeObserver
video
iframe
polling
```

会继续后台跑。

Dockview文档也明确提醒：

```text
always
→ hidden DOM仍在
→ rAF/video等继续
```

---

## 29.1 `always`

强制：

```text
Protected Canvas
Preview
web/pdf/html if native DOM identity/state必须保留
```

---

## 29.2 `onlyWhenVisible`

优先：

```text
Archive
Relationship
Provenance
pure derived list
stateless/reloadable detail
```

---

## 29.3 body自己暂停后台工作

即使 renderer always：

```text
inactive/hidden
→ body根据 visibility state
暂停：
  polling
  video
  timers
  expensive observers
```

后续各 body必须遵守。

---

# 30. Window placement default

T4只提供：

```text
default placement semantics
```

最终尺寸/比例 T5回填。

初始工程默认只用于 smoke：

```text
Preview
→ right of Canvas

Assembly
→ right or bottom candidate

Run Review
→ bottom candidate

Context professional
→ right candidate
```

这些不是最终视觉规格。

---

# 31. Docked panel occupancy

每个 Dockview professional region root：

```text
如果 location.type='grid'
且贴 ProfessionalWindowStage 某一外边缘
```

由 Stage adapter标：

```text
data-spatial-viewport-occupant
```

并同步：

```text
data-lcos-professional-region-id
data-lcos-professional-region-mode='docked'
```

---

# 32. Floating panel occupancy

Dockview location：

```text
floating
```

标：

```text
data-lcos-professional-region-mode='floating'
```

不写：

```text
data-spatial-viewport-occupant
```

所以 C1-1：

```text
safeRect不被floating缩
activeRegions保留collision
```

---

# 33. Grid中内部 split 不一定缩 safeRect

关键规则：

不是每个：

```text
Dockview grid panel
```

都等于：

```text
viewport edge occupant
```

只有：

```text
真正贴 ProfessionalWindowStage 外边缘
```

才发布 edge occupant。

内部 split：

```text
只属于 window topology
```

不能错误把 safeRect层层扣掉。

---

# 34. Edge determination

不要从：

```text
panel body自己猜
```

由 Stage根据：

```text
Dockview group location
+
group bounding box
+
stage rect
```

统一决定。

必要时使用：

```text
2px tolerance
```

继承 C1-1 donor方法。

---

# 35. MainLayout 最终角色

C1-2后：

```text
MainLayout
├─ left shell
├─ header shell
└─ ProfessionalWindowStage
```

不再：

```text
rightPanel prop
```

---

# 36. `CanvasPage.tsx` exact patch

从：

```tsx
<MainLayout
  header={...}
  leftPanel={...}
  rightPanel={<PreviewWorkspacePanel />}
>
  <CenterArea />
</MainLayout>
```

改为概念上：

```tsx
<MainLayout
  header={...}
  leftPanel={...}
>
  <ProfessionalWindowStage
    spatialCanvas={
      <CenterArea ... />
    }
    renderRegion={renderLcosProfessionalRegion}
  />
</MainLayout>
```

`renderLcosProfessionalRegion` 的 body switch：

```text
后续 C1-3...C1-7逐步接
```

C1-2先至少：

```text
preview
prototype placeholders
```

---

# 37. MainLayout exact retirement

REMOVE：

```text
rightPanel prop
COLLAPSED_RIGHT_WIDTH_PX
RIGHT_MIN_WIDTH_PX
RIGHT_DEFAULT_WIDTH_PX
rightWidthPx
isRightPanelVisible
isRightPanelMoving
isRestoringCanvas
committedRightCollapsedRef
rightPanelMotionFallbackRef
restoreCanvasFrameRef
handleTogglePreviewFullscreen
finishRightPanelMotion
rightPanelVisible
rightPanelMotionPending
clipSettledRightPanel
effectiveRightWidthPx
rightHandleDisabled
rightHandleClassName
onRightHandlePointerDown
right resize handle
right panel slot
right panel content
preview fullscreen branch
fullscreen Canvas unmount
```

---

# 38. MainLayout KEEP

继续：

```text
left header
left panel
left collapse
left resize
content root
```

但：

```text
left panel width
```

不归 ProfessionalWindowEnvironment T4 owner。

---

# 39. MainLayout tests migration

current：

```text
MainLayout.test.tsx
```

RETIRE tests：

```text
right panel 420
Preview > half width
Preview fullscreen unmount Canvas
restore Canvas after fullscreen
right transform motion
```

KEEP / rewrite：

```text
left panel shell
left resize
left collapse
```

新的 professional window行为：

```text
搬到 ProfessionalWindowStage tests
```

---

# 40. `panelStore.ts` retirement plan

current Preview-only fields：

```text
isRightCollapsed
isPreviewFullscreen
rightPanelAnchorNodeId
requestOpenRightPanel
toggleRightPanel
setRightCollapsed
togglePreviewFullscreen
...
```

C1-2最终：

```text
RETIRE
```

---

## 40.1 KEEP

`panelStore.ts`仍保留：

```text
left panel state
search state
focusChatInputRequest
```

如果 focus request ownership后续可迁 Preview store：

```text
另卡处理
```

C1-2不额外扩范围。

---

# 41. Preview actions migration

文件：

```text
huabu/apps/web/src/store/previewWorkspace/actions.ts
```

current：

```text
requestOpenRightPanel()
→ openPreviewTarget()
```

改：

```text
requestProfessionalWindow({
  regionId: 'lcos:preview',
  bodyKey: 'preview',
  restorePolicy: 'project'
})

→ openPreviewTarget()
```

---

# 42. 顺序：先 window，再 target

openPreviewNode：

```text
1. ensure/focus Preview professional region
2. open target
3. request node focus
```

理由：

```text
Panel body可能 renderer onlyWhenVisible/正在恢复
```

对 Preview使用 always：

```text
但仍让 host ready在前
```

---

# 43. Empty Preview lazy seed

`PreviewWorkspacePanel.tsx` current：

```text
isHostCollapsed
```

未来不存在。

改为：

```text
当 Preview region真正 mount/open
且 workspace empty
→ seed one unbound Chat
```

不在：

```text
Canvas load
```

自动造 chat。

原设计优点继续 KEEP。

---

# 44. Preview fullscreen retirement

删除：

```text
isFullscreen
onToggleFullscreen
Esc fullscreen
```

Preview需要 immersive：

```text
走统一 ProfessionalWindowController.enterImmersive()
```

不再自己拥有 fullscreen模式。

---

# 45. Immersive / maximize

Dockview grid group：

```text
group.api.maximize()
```

可直接用。

但 Dockview明确：

```text
floating group cannot maximize
```

LCOS product要求同一 professional view可以从 Float进入 Immersive。

因此需要薄 adapter。

---

# 46. Floating → Immersive adapter

controller.enterImmersive(regionId)：

如果 panel当前：

```text
grid
```

则：

```text
remember grid placement
group.api.maximize()
```

如果：

```text
floating
```

则：

```text
1. remember floating bounds/location
2. create temporary grid group adjacent to Protected Canvas
3. panel.api.moveTo(tempGridGroup)
4. tempGridGroup.api.maximize()
```

---

# 47. Immersive → Float restore

exitImmersive：

```text
group.api.exitMaximized()
```

如果之前：

```text
floating
```

则：

```text
api.addFloatingGroup(existingPanel, previousBounds)
```

Dockview支持：

```text
addFloatingGroup(existing panel/group)
```

因此无需：

```text
remove panel
add new panel
```

保持同一 panel identity。

---

# 48. Immersive prototype gate

必须真实 proof：

```text
Floating
→ temporary grid
→ maximize
→ restore
→ floating
```

断言：

```text
same panel instance
same body React identity
same scroll/editor local state
```

如果 Dockview v8.2实际 relocation会造成 body remount：

```text
不强行写 workaround
```

再评估：

```text
renderer always
reuseExistingPanels
app-level immersive wrapper
```

但当前不是 Coordinator conflict。

---

# 49. Layout persistence owner

Professional Window layout：

```text
presentation-only
project-scoped
```

不进 Core。

不进 Huabu Canvas persistence。

---

# 50. `professionalWindowModel.ts` persistence

用：

```text
localStorage
```

key：

```text
lcos.professional-window-layout.v1.<projectId>
```

只在：

```text
active Project
```

读取。

---

# 51. Why not Zustand persist

Dockview本身已经是：

```text
layout state owner
```

再把：

```text
groups
panels
floats
sizes
```

镜像到 Zustand：

```text
second presentation truth
```

禁止。

---

# 52. Persist trigger

Dockview v8.2：

```text
onDidMutateLayout
```

在 top-level layout mutation后触发。

Stage：

```text
debounce 150–300ms
→ api.toJSON()
→ write layout
```

具体 debounce：

```text
implementation smoke后选
```

不是T5视觉值。

---

# 53. Persist什么

Dockview serialized layout：

```text
layout topology
group sizes
panel IDs
params
floating placement
```

T4额外 wrapper：

```ts
interface SavedProfessionalWindowLayoutV1 {
  version: 1
  projectId: string
  dockview: unknown
}
```

---

# 54. Restore safety

raw：

```text
api.fromJSON(saved)
```

不能无条件信。

必须：

```text
try parse
projectId match
version match
fromJSON
validate invariants
```

---

# 55. Restore invariant 1 · Protected Canvas exists

restore后必须：

```text
getPanel(PROTECTED_CANVAS_PANEL_ID)
```

存在。

否则：

```text
discard saved layout
seed default layout
```

---

# 56. Restore invariant 2 · Canvas不是 floating/popout

Protected Canvas只能：

```text
grid
```

如果 restore成：

```text
floating
popout
```

则：

```text
discard saved layout
```

不做复杂 silent repair。

---

# 57. Restore invariant 3 · Canvas group only contains Canvas

如果：

```text
Canvas group还有其它 professional panel
```

说明：

```text
saved layout损坏
或旧版本允许 tab merge
```

处理：

```text
discard saved layout
```

而不是在用户看不见时偷偷重排十个窗口。

---

# 58. Restore invariant 4 · Canvas locked/header hidden

restore后重新 enforce：

```text
group.locked = true
group.header.hidden = true
```

这些：

```text
runtime invariants
```

不信 serialized state。

---

# 59. Restore unknown region

Saved layout里：

```text
bodyKey unknown
```

或：

```text
restorePolicy='never'
```

策略：

```text
drop whole saved layout?
```

不必。

更合理：

```text
Dockview component渲染 MissingRegion
→ Stage移除该 panel
→ persist repaired layout
```

但：

```text
Protected Canvas invariant仍必须先过
```

---

# 60. `reuseExistingPanels`

Dockview v8.2 core API源码存在：

```text
fromJSON(data, { reuseExistingPanels: boolean })
```

C1-2 prototype必须测试：

```text
seed Protected Canvas
→ fromJSON(saved, {reuseExistingPanels:true})
```

是否真正保持：

```text
Canvas panel/body identity
```

v8.2 release本身包含：

```text
preserve reused panel rendering during layout restoration
```

因此是强候选。

但必须 browser proof。

---

# 61. Preferred restore sequence

Prototype通过时：

```text
1. Stage onReady
2. create Protected Canvas panel
3. enforce protection
4. read project layout
5. fromJSON(saved, {reuseExistingPanels:true})
6. validate Protected Canvas
7. enforce lock/header again
8. install controller
```

---

# 62. 如果 `reuseExistingPanels` proof失败

退到：

```text
不 restore raw Dockview layout containing Canvas
```

改：

```text
seed Canvas first
rebuild only professional region placements
```

这会牺牲：

```text
exact arbitrary topology restore
```

但不会牺牲：

```text
Canvas identity
```

C1-2 acceptance优先级：

```text
Canvas stability
> perfect saved layout
```

---

# 63. Layout schema migration

key带：

```text
v1
```

未来 Dockview大版本：

```text
不要直接读旧 raw layout
```

规则：

```text
version mismatch
→ ignore
→ default layout
```

这是 presentation state。

不值得做数据库式迁移系统。

---

# 64. Close / Restore semantics

Professional panel Close：

```text
api.removePanel(panel)
```

只关闭：

```text
presentation region
```

不删 canonical target。

Restore/open：

```text
source action
→ controller.open(descriptor)
```

重新创建：

```text
professional panel
```

引用同一 canonical target。

---

# 65. Project switch

由 C1-1 ProjectSession：

```text
Project A unmount
→ Window Stage dispose
→ flush A layout

Project B mount
→ read B layout
```

绝不跨 Project共享：

```text
window topology
```

---

# 66. Surface switch

同一 Project：

```text
Window Stage不卸载
```

所以：

```text
Preview
Assembly
Run Review
Context instrument
```

panel identity可保持。

Protected Canvas内部：

```text
Huabu canvas target retarget
```

而 panel ID保持：

```text
lcos:spatial-canvas
```

---

# 67. Preview store canvas-bound事实

current Preview store：

```text
workspace.canvasId
```

说明 Preview body内部内容目前和 Huabu canvas绑定。

C1-2不偷偷改成 Project-global Preview DB。

Surface switch时：

```text
Preview region shell
= stays

PreviewWorkspace internal canvas data
= current Huabu preview owner决定 load/reconcile
```

如果后续 Conversation Preview需要：

```text
跨Surface canonical Conversation body
```

C1-6使用：

```text
新的 Conversation professional body
```

不强迫 current Canvas Preview store承担所有未来 Conversation preview语义。

这样避免把旧 PreviewWorkspace过度泛化。

---

# 68. Semantic DnD coexistence

Huabu已经：

```text
@dnd-kit/core
@dnd-kit/sortable
```

PreviewWorkspace内部也用 dnd-kit。

LCOS semantic drag也有自己的 owner。

Dockview同时有：

```text
tab/group DnD
```

因此必须 proof，而不是想当然。

---

# 69. DnD ownership matrix

```text
Dockview tab
→ Dockview

Dockview empty group header
→ Dockview

Preview internal tab
→ PreviewWorkspace dnd-kit

Artifact/body drag
→ T3 semantic drag

Right-drag Give
→ T3

Relation handle
→ T3 relation gesture
```

---

# 70. Dockview DnD不得从 panel body启动

Dockview panel relocation：

```text
只能从其 tab/header chrome
```

T4 custom tab/header必须保证：

```text
drag handle只在chrome
```

body root：

```text
不能 draggable
```

---

# 71. External semantic drag不得显示 Dockview drop overlay

C1-2默认：

```text
不注册 onUnhandledDragOver().accept()
```

所以 Dockview不主动接外部 drag。

如果 browser proof发现：

```text
semantic drag
→ Dockview overlay仍出现
```

则用免费 API：

```text
onWillShowOverlay
onWillDrop
```

基于 LCOS semantic-drag session：

```text
preventDefault()
```

---

# 72. DnD gate信号不从 DOM 猜

不写：

```text
if target.closest('.artifact')
```

优先消费：

```text
T3 existing semantic drag session state
```

因为：

```text
DOM结构是视觉实现
gesture owner是T3
```

若 C1-2 prototype阶段暂时只能 DOM标记：

```text
只可做 test spike
不得进 final source plan
```

---

# 73. Right-drag

Dockview默认：

```text
left/mouse/pointer tab/group drag
```

LCOS right-drag：

```text
body gesture
```

必须测试：

```text
pointer button=2
```

不会触发：

```text
panel/group relocation
```

若触发：

```text
onWillDragPanel/onWillDragGroup fail-close
```

---

# 74. Relation handles

Relation handle存在：

```text
Canvas body
```

Protected Canvas group header隐藏。

Dockview不能覆盖：

```text
Canvas pointer routing
```

验：

```text
Relation connect在四周有 Docked panels时仍正常
```

---

# 75. ProfessionalWindowEnvironment integration

C1-1提供：

```text
ProfessionalWindowEnvironmentProvider
```

C1-2 Stage是其 geometry producer。

推荐结构：

```tsx
<ProfessionalWindowEnvironmentProvider stageRef={stageRef}>
  <ProfessionalWindowStage ... />
</ProfessionalWindowEnvironmentProvider>
```

或：

```text
Stage内部provider
```

最终只保留一个环境 owner。

---

# 76. Stage root

Stage root必须：

```text
relative
h-full
w-full
overflow-hidden
```

并提供：

```text
ref
```

作为 C1-1 exact viewportRect。

---

# 77. Region DOM metadata

professional panel root统一：

```text
data-lcos-professional-region-id
data-lcos-professional-region-mode
```

Docked edge：

```text
data-spatial-viewport-occupant
```

Protected Canvas：

```text
data-lcos-protected-spatial-canvas
```

方便：

```text
T5 CSS
browser acceptance
observer
debug
```

---

# 78. Do not expose Dockview API to T1/T2/T3

T1/T2/T3只看：

```text
ProfessionalWindowEnvironment
```

以及：

```text
ProfessionalWindowController high-level request
```

不能：

```text
import DockviewApi
```

否则 donor被写死到全项目。

---

# 79. T5 state contract

T5现在可锁以下真实状态。

## Professional Region

```text
REST_DOCKED
ACTIVE_DOCKED
INACTIVE_TAB
FLOATING
FLOATING_ACTIVE
WINDOW_DRAGGING
WINDOW_RESIZING
SPLIT_PREVIEW
MAXIMIZED / IMMERSIVE
CLOSING
CLOSED
RESTORING
ERROR
```

---

## Protected Canvas

```text
CANVAS_STABLE
SURFACE_SWITCHING
SURFACE_READY
SAFE_RECT_CONSTRAINED
```

没有：

```text
CANVAS_TAB
CANVAS_CLOSE
CANVAS_FLOAT
```

---

# 80. T5 chrome seam

T4必须给 T5：

```text
custom tab component slot
group header action slots
active/inactive state
floating location state
maximized state
close action
dock/float action
```

但 T5决定：

```text
chrome 是否默认隐藏
close glyph长什么样
拖拽抓手多显眼
header高度
float材质
```

---

# 81. Default Dockview chrome只是 prototype

C1-2 prototype允许：

```text
default Dockview tab/header
```

正式视觉：

```text
T5覆盖
```

不要因为 prototype默认长得像 IDE 就宣布 LCOS 要做 VS Code。

工具只是工具，人类总爱把脚手架误当建筑立面，这个坏习惯要提前制止。

---

# 82. Custom tab later but owner already fixed

Professional region tab：

```text
T5 custom tab body
```

但：

```text
drag source
close action
active state
```

仍来自 Dockview。

不自己再写 tab drag engine。

---

# 83. Professional body lifecycle contract

每个 future body必须实现：

```text
mount from canonical target
safe remount
no unique truth only in component
visibility-aware expensive work
close = presentation close
```

---

# 84. `renderer:'always'` 不等于“永不卸载业务订阅”

如果 panel hidden：

```text
body仍需 pause
```

例如：

```text
Run polling
video
expensive timeline observer
```

未来 body消费：

```text
panel visibility
```

不能因为 React没卸载就继续狂刷后台。

---

# 85. Window location observer

Stage订阅：

```text
group.api.onDidLocationChange
```

或 API级 move events。

当：

```text
grid ↔ floating
```

变化：

```text
更新 DOM region mode
→ ProfessionalWindowEnvironment remeasure
```

不复制完整 layout state。

---

# 86. Focus / active

Dockview：

```text
onDidActivePanelChange
```

只表示：

```text
Professional Window presentation focus
```

不写：

```text
Huabu selection
LCOS canonical focus
```

T5可用于：

```text
active chrome
```

---

# 87. Keyboard

C1-2只保留 Dockview免费版基础：

```text
focus/tab accessibility
```

不启用企业：

```text
spatial keyboard docking
```

LCOS全局 shortcut collision必须测试：

```text
Cmd/Ctrl+F
Esc
Delete
Space
Arrow
```

---

# 88. Escape arbitration

当前 Preview fullscreen自己捕获：

```text
Esc
```

C1-2删除。

统一：

```text
Esc优先级
modal/menu
→ local transient
→ immersive professional window exit
→ other T3/T2 rules
```

exact keyboard arbitration在：

```text
T3/T2 final source plan
```

T4只提供：

```text
exitImmersive()
```

---

# 89. Layout history

Dockview v8有：

```text
layout history API surface
```

但真正模块属于 Enterprise。

C1-2：

```text
DO NOT USE
```

LCOS Undo/Recovery：

```text
不是 Window layout undo
```

不要混。

---

# 90. Popout windows

Dockview免费版支持：

```text
popout window
```

但 V2当前要求：

```text
Float
```

不要求 OS/window popout。

C1-2：

```text
DO NOT ENABLE
```

原因：

```text
cross-window React/document
Electron/browser differences
T1 overlay / shortcuts / DnD complexity
```

没有产品收益就别给自己制造跨 window 生命周期豪华套餐。

---

# 91. Edge groups

免费基础 edge groups存在。

但 C1-2：

```text
不用 edge groups 作为主架构
```

只用：

```text
ordinary grid split
+
floating groups
```

原因：

```text
ProfessionalWindowEnvironment需要真实边缘占位
普通grid已够
减少 donor feature surface
```

---

# 92. Exact source action matrix

| File | Action | Owner | Consumer | C1-2 |
|---|---|---|---|---|
| `huabu/apps/web/package.json` | MODIFY | Huabu web | build | add exact `dockview-react:8.2.0` |
| `huabu/package.json` | MODIFY | Huabu workspace | pnpm | pin dockview/dockview-core transitive |
| `huabu/apps/web/src/index.css` | MODIFY | Huabu/T5 | app | import functional Dockview CSS |
| `huabu/apps/web/src/lcos/professional/professionalWindowModel.ts` | ADD | T4 | Stage/controller | descriptors, ids, persistence guards |
| `huabu/apps/web/src/lcos/professional/professionalWindowController.ts` | ADD | T4 | Preview/Assembly/etc actions | imperative high-level seam |
| `huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.tsx` | ADD | T4 | CanvasPage | Dockview adapter/owner |
| `huabu/apps/web/src/lcos/professional/ProtectedSpatialCanvas.tsx` | ADD | T4/Huabu seam | Stage | protected panel body |
| `huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx` | MODIFY | Huabu/T2/T4 compose | app | Stage becomes center host |
| `huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx` | RETIRE RIGHT OWNER | Huabu shell | CanvasPage | left shell only |
| `huabu/apps/web/src/pages/CanvasPage/MainLayout.test.tsx` | MODIFY | Huabu | CI | remove right/fullscreen tests |
| `huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspace.tsx` | KEEP | Huabu Preview | Preview body | internal tabs/groups unchanged |
| `huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspacePanel.tsx` | MODIFY/THIN | Huabu Preview | Stage | no right/fullscreen host props |
| `huabu/apps/web/src/store/previewWorkspace/store.ts` | KEEP | Huabu Preview | body/actions | internal state owner |
| `huabu/apps/web/src/store/previewWorkspace/actions.ts` | MODIFY | Huabu/T4 seam | callers | open Preview via Window controller |
| `huabu/apps/web/src/store/panelStore.ts` | RETIRE PREVIEW HOST FIELDS | Huabu shell | left/search/chat focus | remove right/fullscreen owner |
| `huabu/apps/web/src/lcos/professional/professionalWindowModel.test.ts` | ADD | T4 | CI | ids/restore/sanitize |
| `huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.test.tsx` | ADD | T4 | CI | protected/lifecycle/controller |
| `huabu/apps/web/e2e/professional-window.spec.ts` | ADD | T4 | Playwright | browser proof |

---

# 93. C1-2 prototype before production migration

必须先做：

```text
isolated route/playground
```

优先：

```text
/dev playground component
```

而不是直接替换 CanvasPage。

---

# 94. Prototype exact target

候选：

```text
huabu/apps/web/src/pages/playground/ProfessionalWindowPlaygroundPage.tsx
```

仅 DEV route。

但：

```text
prototype proof完成后
文件可删除
```

或保留成 component showcase fixture。

不要让临时 playground变 production owner。

---

# 95. Prototype P1 · Protected Canvas identity

构造：

```text
Canvas test body
+
Preview
+
Assembly placeholder
+
Run placeholder
```

操作：

```text
dock
float
redock
split
tab
```

断言：

```text
Protected Canvas component mountCount == 1
```

---

# 96. P2 · `renderer:'always'`

Preview test body保存：

```text
local useState counter
scrollTop
input value
```

操作：

```text
dock
tab away
float
dock
```

断言：

```text
state preserved
```

---

# 97. P3 · moveTo identity

Dockview文档明确：

```text
panel.api.moveTo
不 destroy/recreate panel
```

prototype记录：

```text
React mount id
```

断言：

```text
moveTo后不变
```

---

# 98. P4 · floating identity

```text
api.addFloatingGroup(existingPanel)
```

断言：

```text
same panel ID
same body identity
```

---

# 99. P5 · immersive floating round-trip

```text
Float
→ temp grid
→ maximize
→ exit
→ Float
```

断言：

```text
body state unchanged
```

---

# 100. P6 · Protected Canvas drop

拖 Preview panel到 Canvas中央。

预期：

```text
不能成为 Canvas tab
```

但允许：

```text
top/right/bottom/left split
```

验证：

```text
group.locked=true
```

行为符合。

---

# 101. P7 · semantic DnD

模拟：

```text
Artifact drag through professional body
Preview internal tab drag
right-drag
```

断言：

```text
Dockview不启动 panel relocation
不显示错误 drop overlay
```

---

# 102. P8 · Camera invariant

接真实 Canvas：

```text
capture x/y/zoom

dock panel
resize
float
redock
maximize professional group
restore
```

断言：

```text
Camera unchanged
```

依赖 C1-1：

```text
preserve-transform
```

---

# 103. P9 · Surface switch

```text
Main
→ open Preview + Assembly placeholder
→ Context
→ Workflow
```

断言：

```text
Window Stage mountCount == 1
Professional panel identities stay
Protected Canvas panel stays
internal Huabu canvas changes
```

---

# 104. P10 · layout restore

```text
create topology
reload Project
```

断言：

```text
fromJSON/reuse path
Protected Canvas valid
professional regions restored
```

---

# 105. P11 · corrupt layout

写入：

```text
bad JSON
missing Canvas
Canvas floating
wrong version
```

预期：

```text
discard
seed safe default
no app crash
```

---

# 106. P12 · project isolation

```text
Project A layout
Project B layout
```

必须不同 storage key。

---

# 107. Unit tests · model

`professionalWindowModel.test.ts`：

```text
protected ID reserved
regionId stable
canvasId not accepted as region identity input
project storage key versioned
unknown restorePolicy handled
bad saved version rejected
wrong project rejected
```

---

# 108. Stage component tests

`ProfessionalWindowStage.test.tsx`：

```text
onReady seeds Canvas
Canvas renderer always
Canvas group locked
Canvas header hidden
drag Canvas prevented
controller open idempotent
controller focus existing
controller close non-protected
close Canvas rejected
Project change flush/dispose
```

---

# 109. MainLayout tests after migration

保留：

```text
left shell
left collapse
left resize
header floating if left collapsed
```

删除：

```text
right Preview owner assertions
```

---

# 110. Preview tests

existing Preview tests继续。

新增：

```text
PreviewWorkspacePanel mount when empty
→ seeds Chat once

no isHostCollapsed
no fullscreen Esc ownership
```

---

# 111. E2E exact file

ADD：

```text
huabu/apps/web/e2e/professional-window.spec.ts
```

利用已有：

```text
Playwright
Chromium
helpers
```

---

# 112. Browser acceptance · BA-C1-2-01

```text
open Project Main
Canvas visible
open Preview
dock right
resize
```

断言：

```text
Canvas DOM same
Camera same
safeRect shrinks
```

---

# 113. BA-C1-2-02

```text
float Preview
```

断言：

```text
safeRect expands back
activeRegions includes floating
Preview local state preserved
```

---

# 114. BA-C1-2-03

```text
dock Preview bottom
open Assembly placeholder right
open Run placeholder as tab
```

断言：

```text
3 regions simultaneously
Canvas stays
```

---

# 115. BA-C1-2-04

```text
move Preview Dock → Float → Dock
```

记录：

```text
body mount counter
input value
scroll position
```

不变。

---

# 116. BA-C1-2-05

```text
attempt drag professional panel onto Canvas center
```

必须：

```text
no tab merge
```

---

# 117. BA-C1-2-06

```text
artifact semantic drag over Preview/Assembly
```

必须：

```text
T3 drag owner remains
Dockview overlay absent
```

---

# 118. BA-C1-2-07

```text
right-drag semantic Give
```

必须：

```text
source stays
window does not move
```

---

# 119. BA-C1-2-08

```text
Surface Main→Context→Workflow
```

断言：

```text
Window topology remains
Canvas panel remains
Huabu actual canvas changes
```

---

# 120. BA-C1-2-09

```text
reload
```

断言：

```text
project-scoped presentation layout restored
```

但：

```text
canonical Project/Canvas data来自各自owner
```

---

# 121. BA-C1-2-10

```text
Project A→B
```

断言：

```text
A layout flushed
B layout loaded
A panel targets不泄漏
```

---

# 122. BA-C1-2-11 · current Preview functionality regression

以下必须原样可用：

```text
open node Preview
edit note/text
Chat
Preview internal tabs
two internal groups
internal split resize
scroll memory
focus request
```

Dockview只是外壳。

---

# 123. BA-C1-2-12 · touch/pen

Dockview v8支持 touch/pointer DnD。

但 LCOS touch canvas gesture优先。

至少测：

```text
touch Canvas pan/select
touch professional chrome drag
touch Preview content scroll
```

不串台。

---

# 124. Recovery strategy

## Dockview install/prototype失败

直接：

```text
不进入 MainLayout migration
```

保留：

```text
C1-1 ProjectSession
C1-1 ProfessionalWindowEnvironment
current MainLayout
```

换 donor。

---

# 125. Stage integration失败

rollback：

```text
CanvasPage
→ current MainLayout right Preview
```

Core、Canvas、Preview store均无数据迁移。

---

# 126. Layout persistence失败

立即禁用：

```text
read/write saved professional layout
```

每次：

```text
seed default layout
```

不影响：

```text
canonical truth
```

---

# 127. Corrupt saved state recovery

```text
catch
remove storage key
seed default
```

用户最多损失：

```text
窗口摆法
```

不会损失：

```text
项目对象
Workflow
Skill
Run
Canvas geometry
```

---

# 128. Preview migration rollback

Preview body本身：

```text
KEEP
```

所以可退回：

```text
PreviewWorkspacePanel
→ MainLayout rightPanel
```

无内容 migration。

---

# 129. Blast radius

## Allowed

```text
huabu/apps/web/package.json
huabu/package.json
huabu/apps/web/src/index.css

huabu/apps/web/src/lcos/professional/*
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
huabu/apps/web/src/pages/CanvasPage/MainLayout.test.tsx

huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspacePanel.tsx
huabu/apps/web/src/store/previewWorkspace/actions.ts
huabu/apps/web/src/store/panelStore.ts

professional-window E2E/tests
```

---

## Forbidden

```text
Local Core schema
Project identity
SurfaceRegistry semantics
ProjectionBinding
Huabu canvasStore geometry
Canvas history
PreviewWorkspace internal model
T2 route semantics
T3 semantic mutation
T5 visual body
Worksite Core
Assembly Core
Context Core
Workflow Core
Skill Core
Run Core
Archive Core
```

---

# 130. Donor lock / provenance

施工注释/third-party inventory记录：

```text
dockview-react@8.2.0
MIT
Copyright 2021 mathuo
```

如果只是 npm dependency：

```text
依其包内 LICENCE
```

不复制 proprietary enterprise source。

---

# 131. Exact KEEP / ADOPT / WRAP / RETIRE

## KEEP

```text
Huabu Canvas
PreviewWorkspace internal model/body
PreviewWorkspaceStore
left MainLayout shell
panelStore left/search pieces
ProjectSession
ProfessionalWindowEnvironment
```

## ADOPT

```text
dockview-react@8.2.0
```

## WRAP

```text
ProfessionalWindowStage
ProfessionalWindowController
ProtectedSpatialCanvas
```

## MIGRATE

```text
Preview outer host
Preview open actions
project-scoped window persistence
```

## RETIRE

```text
MainLayout rightPanel owner
right panel manual width/resize/motion
Preview fullscreen Canvas unmount
panelStore right collapse/fullscreen
rightPanelAnchor camera-compensation role
single Professional destination
```

---

# 132. T5 engineering seam after C1-2

T5可以把 Professional Window视觉正式建立在：

```text
one shared window system
```

真实能力：

```text
docked
floating
tabbed
horizontal split
vertical split
resized
active/inactive
close/reopen
grid maximize
floating→immersive adapter
```

---

# 133. T5必须保留的区别

```text
Protected Canvas
≠ Professional Window

Professional Window
≠ Child Worksite

Preview internal tab
≠ Window tab

Floating Window
≠ Canvas node

Immersive Window
≠ route change
```

视觉也必须让这些层级不混。

---

# 134. T5不应依赖的 Dockview默认审美

不要照抄：

```text
IDE tab chrome
VS Code色彩
默认 blue drag overlay
默认 header
默认 tab close button
默认 sash视觉
```

T4只收：

```text
mechanics
```

---

# 135. Technical Conflict Gate

本轮发现的 source constraints：

```text
1. current MainLayout只有一个right panel
2. current fullscreen卸载Canvas
3. Preview open action直接绑panelStore
4. panelStore持有旧right/fullscreen presentation state
5. Preview store自身canvas-bound
6. Dockview floating不能直接maximize
7. repo没有tracked pnpm lock
```

全部可以通过：

```text
ADOPT
WRAP
MIGRATE
RETIRE
pin
```

解决。

没有：

```text
不可薄适配的 product/source contradiction
```

所以：

```text
COORDINATOR ESCALATION = NONE
```

---

# 136. C1-2 coding sequence

正式编码必须按小步：

```text
C1-2-A
pin Dockview dependency
+ isolated playground

C1-2-B
Protected Canvas proof
renderer always / locked / header hidden

C1-2-C
Professional controller
open/focus/close/float/dock

C1-2-D
DnD coexistence proof

C1-2-E
immersive round-trip proof

C1-2-F
layout persistence + corrupt recovery proof

C1-2-G
CanvasPage integrates Stage

C1-2-H
Preview outer-host migration

C1-2-I
MainLayout right owner retirement

C1-2-J
panelStore right fields retirement

C1-2-K
E2E / browser acceptance
```

任何 A–F proof失败：

```text
停止 G
```

不要一边 donor还没验，一边把旧壳拆了。

---

# 137. C1-2 Done Gate

```text
[ ] dockview-react 8.2.0 exact-pinned
[ ] transitive dockview/core deterministic
[ ] no enterprise dependency
[ ] Protected Canvas mountCount remains 1
[ ] Canvas cannot close
[ ] Canvas cannot float
[ ] Canvas cannot become professional tab
[ ] side dock around Canvas works
[ ] professional panel Float/Dock/Undock works
[ ] horizontal + vertical split works
[ ] N regions coexist
[ ] Preview local state survives move
[ ] Preview internal dnd-kit remains
[ ] semantic drag remains T3-owned
[ ] right-drag remains T3-owned
[ ] Camera unchanged on window operations
[ ] Surface switch keeps window topology
[ ] Project switch changes layout namespace
[ ] corrupt saved layout recovers safely
[ ] current Preview functionality passes
[ ] MainLayout right-panel owner removed
[ ] Preview fullscreen Canvas-unmount removed
[ ] panelStore right/fullscreen owner removed
[ ] no Core/domain migration
[ ] Coordinator escalation none
```

---

# 138. C1-2 Final Owner Matrix

```text
Professional window topology
→ Dockview API through T4 Stage

Window region identity
→ T4 professionalWindowModel

Window imperative open/focus
→ T4 ProfessionalWindowController

Window project-scoped presentation persistence
→ T4 local presentation adapter

Window geometry → safe rect
→ C1-1 ProfessionalWindowEnvironment

Protected Canvas body
→ Huabu / T1

Protected Canvas panel invariant
→ T4 Stage

Preview internal tabs/groups
→ PreviewWorkspaceStore

Preview outer placement
→ T4 Stage

Professional visual appearance
→ T5

Surface navigation
→ T2

semantic DnD
→ T3

Camera
→ Huabu/T1
```

---

# 139. Next

下一小步：

```text
C1-3
Assembly Exact Source Plan
```

C1-3将锁：

```text
CoreAssemblyClient exact routes
Warehouse query/read adapter
Capture / Sources / Skills source composition
Target adapter
AssemblyApply result states
Phase B D21 typed migration boundary
Skill capability-use consumer seam
Lovart body mapping
drag/drop admission
partial/failed recovery
browser acceptance
blast radius
```

Assembly body将直接接入本 C1-2：

```text
ProfessionalWindowController.open({
  regionId: 'lcos:assembly',
  bodyKey: 'assembly',
  restorePolicy: 'project'
})
```

不再拥有自己的：

```text
right panel
modal shell
window manager
```

---

# 140. 一句话施工结论

> **Dockview 8.2.0 可以正式收编为 T4 的窗口物理层，但只能待在 adapter 下面。Canvas 是受保护的永驻空间本体；Preview/Assembly/Context/Workflow/Skill/Run/Archive 都只是它周围可 Dock/Float 的专业区域。现有 PreviewWorkspace 的内部能力保留，MainLayout 那套手写单右栏/Fullscreen/Camera补偿壳按顺序退休。**
