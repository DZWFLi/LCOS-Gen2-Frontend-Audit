# LCOS Gen2 · T4
# C1-1 · ProjectSession + ProfessionalWindowEnvironment
## Exact Source Construction Plan

日期：2026-09-06  
源码基线：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`  
Gen1 donor：`DZWFLi/LCOS-local-creativeOS@3e99769`  
阶段：`PHASE C1-1`  
状态：`FORMAL SOURCE-LEVEL PLAN / NO PRODUCTION PATCH`

---

# 0. 本卡只解决两条工程 seam

```text
A. Active Project Session
   把 LCOS runtime / seam 生命周期从 Canvas body 上移到 Project session

B. Professional Window Environment
   把专业窗口的 occupied/safe rect 变成唯一公共 screen-space seam
   并让 LCOS Professional Window resize 不再自动移动 Camera
```

不处理：

```text
Dockview 正式安装 / 多窗口 topology
Assembly body
Context body
Workflow body
Skill body
Run Review body
Archive body
Worksite identity / navigation
T2 route ontology
```

这些属于后续 C1 卡或其它线程。

---

# 1. Phase B 决策输入

本卡直接执行：

```text
D14
T4 对外提供一套 ProfessionalWindowEnvironment
occupiedRects / safeRect / safeInsets / activeRegions

D15
Professional Window / Work View 导致的 host resize
不得自动改变 Camera

D24 / D25
T2 负责 route/navigation exact source
T4 可以进入 source-level professional-work plan
```

已关闭产品问题不重新 OPEN。

---

# 2. 本轮 exact-source 重新核验结果

## 2.1 当前 LCOS runtime owner 过低

文件：

```text
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
```

current：

```ts
const runtimeRef = useRef<LcosHostRuntime | null>(null)
```

它当前同时拥有：

```text
runtime create/dispose
HostSeam
hostExtension
reference click suppressor
canvasId/isLoading subscription
runtime.retarget
reconcile('project-open')
ProjectionBinding → reference cache sync
```

卸载：

```text
runtime.dispose()
suppressor.dispose()
```

因此当前真实生命周期是：

```text
Canvas-side React hook lifetime
```

而不是：

```text
active Project session lifetime
```

### 裁决

```text
LIFT
```

不是重写。

---

## 2.2 当前 seam 本身是成熟资产

同一文件已经采用：

```ts
createHostSeam(() => rt.host)
```

这意味着：

```text
HostSeam / hostExtension identity可稳定
underlying runtime.host 可在 retarget 后替换
```

current `createLcosHostRuntime` 也已经：

```text
ONE runtime object
retarget()
dispose()
```

### 裁决

```text
KEEP
```

---

## 2.3 Current CenterArea 仍错误承担 Project identity bridge

文件：

```text
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
```

current：

```ts
const lcosProjectId =
  import.meta.env.PROJECT_ID
  ?? 'disposable-mvp-sample'

const lcosProps = useLcosCanvasProps(lcosProjectId)
```

### 裁决

```text
RETIRE
```

作为 production project selector。

---

## 2.4 Current CanvasPage 的 Huabu canvas switch 是正确 owner

文件：

```text
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
```

current：

```text
route canvasId
→ loadCanvas first
→ switchCanvas later
→ canvasStore.canvasId
→ isLoading
```

### 裁决

```text
KEEP
```

T4 不复制这套 load/switch。

---

## 2.5 RootLayout 不能直接变 global ProjectSession

文件：

```text
huabu/apps/web/src/App.tsx
```

`RootLayout`：

```text
app lifetime never-unmounting
```

但 children 包括：

```text
/setup
/playground/*
/spaces
/canvas/:canvasId
```

并非所有 route 都有 active LCOS Project。

### 裁决

```text
DO NOT MOUNT ProjectSession globally in RootLayout
```

正确 mount consumer：

```text
T2 ActiveProject route/shell
```

T4提供 Provider，不冻结 T2 URL。

---

# 3. ProjectSession owner 边界

## 3.1 ADD

```text
huabu/apps/web/src/lcos/session/LcosProjectSessionProvider.tsx
```

### Exact owner

```text
T4
```

### Exact consumer

```text
T2 active-project navigation shell / route element
```

当前 physical route composition 落在：

```text
huabu/apps/web/src/App.tsx
```

但：

```text
App.tsx route modification
= T2 source-plan owned consumer change
```

T4只提供可挂载 Provider。

---

# 4. Provider 输入：不让 T4 抢 Surface navigation owner

C1-0 原骨架曾建议 Provider直接持 `SurfaceRegistry`。

经过本轮 exact-owner 复核，C1-1 收紧成：

```ts
interface LcosProjectSessionProviderProps {
  projectId: string
  surfacePort: SurfacePort
  children: React.ReactNode
}
```

其中：

```text
projectId
= Core canonical Project identity

surfacePort
= T2 / active Surface consumer
  通过既有 SurfaceRegistry.current(surfaceKey) 解析后的 current port
```

### 为什么不让 Provider 自己决定 surfaceKey

因为：

```text
T2
= Navigation / Surface switch owner
```

T4只需要知道：

```text
当前期望绑定哪张 canvas
```

这样边界更薄：

```text
T2:
Surface intent
→ SurfaceRegistry
→ SurfacePort

T4:
SurfacePort.canvasId
→ wait Huabu actual ready canvas
→ retarget/reconcile
```

不新增：

```text
SurfaceManagerV2
```

---

# 5. Provider 输出

候选 context：

```ts
interface LcosProjectSessionValue {
  projectId: string
  surfacePort: SurfacePort
  hostExtension?: CanvasHostExtension
  runtimeReady: boolean
}
```

T4 当前 consumer 真正需要的只有：

```text
hostExtension
project/session identity for professional layer
```

不要在这里塞：

```text
Project graph cache
Context data
Workflow data
Assembly data
Run data
Skill data
Camera
Dockview JSON
```

---

# 6. Provider exact lifecycle

## 6.1 Project mount

```text
Provider mount(projectId=A)

1. readLcosHostConfig()
2. override config.projectId = A
3. createLcosRuntime(config)
4. installReferenceClickSuppressor()
5. createHostSeam(() => runtime.host, ...)
6. hostExtensionFromSeam()
7. hold stable extension for session lifetime
```

---

## 6.2 Surface ready

Input：

```text
surfacePort.canvasId = expectedCanvasId
```

Huabu current store：

```text
actualCanvasId
isLoading
```

只当：

```text
actualCanvasId === expectedCanvasId
&& isLoading === false
```

才：

```text
runtime.retarget({canvasId: actualCanvasId})
await runtime.host.reconcile('project-open')
await runtime.host.listNodeBindings()
sync node→entity cache
```

---

## 6.3 Surface switching

例如：

```text
Main → Context
```

流程：

```text
T2 changes SurfacePort
CanvasPage / T2 navigation changes Huabu route/canvas
Huabu starts load/switch
Provider sees expected != actual
→ does nothing

Huabu ready
expected == actual
→ one retarget
→ one reconcile
→ one reference binding sync
```

保持：

```text
same Provider
same runtime object
same HostSeam
same Professional Window session
```

---

## 6.4 Project switching

```text
Project A
→ Project B
```

必须：

```text
dispose A runtime exactly once
dispose A suppressor
reset entire reference state
clear T4 project-scoped professional presentation session
mount/create B runtime
```

不要：

```text
A runtime.retarget({projectId:B})
```

后继续携带 A 的 professional regions。

虽然底层 runtime API允许 project retarget：

```text
产品 ProjectSession boundary 仍采用 new session
```

---

# 7. Reconcile 去重

current hook effect依赖：

```text
canvasId
isLoading
projectId
```

在未来 Surface/Window composition 增多后可能发生重复 ready effects。

Provider增加纯本地 ref：

```ts
type ReconciledTarget = {
  projectId: string
  canvasId: string
}

const lastReconciledTargetRef =
  useRef<ReconciledTarget | null>(null)
```

逻辑：

```text
same projectId + same canvasId
→ no reconcile

same project + new canvasId
→ reconcile once
```

它是：

```text
React lifecycle dedupe
```

不是：

```text
canonical truth
```

不落 localStorage/Core。

---

# 8. Async stale reconcile guard

这是本轮 source audit 发现的一个真实技术 race。

场景：

```text
Main reconcile starts
→ before listNodeBindings completes
user switches Context
→ Context reconcile completes
→ Main async finally returns late
```

如果照 current hook：

```text
late Main result
→ resetNodeEntities()
→ write Main bindings
```

可能把：

```text
Context current reference cache
```

覆盖成旧 Main cache。

---

## 8.1 Thin fix

Provider增加：

```ts
const reconcileGenerationRef = useRef(0)
```

每次 ready target：

```ts
const generation = ++reconcileGenerationRef.current
const expected = { projectId, canvasId }
```

await后，在写 reference cache 前检查：

```text
generation === current generation
Provider projectId unchanged
surfacePort.canvasId unchanged
canvasStore.canvasId unchanged
!isLoading
```

任何一项不成立：

```text
drop stale result
```

---

## 8.2 为什么不加 AbortController 到 Core/RFS

没有必要把 blast radius 扩到：

```text
HttpClient
RFS
Reconciler
```

现有 reconcile 能完成。

我们只：

```text
拒绝 stale presentation side-effect
```

足够。

---

# 9. Reference cache exact policy

current store：

```text
huabu/apps/web/src/lcos/lcosReferenceState.ts
```

有两个不同 reset：

```text
resetNodeEntities()
→ 只清 spatial node→Core ref cache

reset()
→ 同时清 draft references
```

---

## 9.1 Surface switch

同一 Project：

```text
KEEP composer draft references
```

只：

```text
resetNodeEntities()
→ repopulate current canvas bindings
```

原因：

```text
Reference 是 Project-level user intent
不应因为 Main→Context 自动消失
```

---

## 9.2 Project switch

不同 Project：

```text
useLcosReferenceStore.getState().reset()
```

防止 Project A draft refs 泄露到 B。

---

# 10. `useLcosCanvasProps.tsx` 的退休方式

不是删除整个文件。

### MODIFY

把它变成 thin consumer hook：

```ts
export function useLcosCanvasProps(): LcosCanvasProps {
  const session = useLcosProjectSessionOptional()
  return { hostExtension: session?.hostExtension }
}
```

### RETIRE from this file

```text
runtimeRef
suppressorDisposeRef
readLcosHostConfig
createLcosRuntime
canvasId subscription
isLoading subscription
retarget
reconcile
binding cache sync
```

这样：

```text
CenterArea
```

无需大改 call shape。

---

# 11. `CenterArea.tsx` exact patch

current：

```ts
useLcosCanvasProps(lcosProjectId)
```

改为：

```ts
useLcosCanvasProps()
```

删除：

```text
PROJECT_ID
disposable-mvp-sample
```

其它：

```text
Canvas
Handbook
Settings
Chat toggle
```

不动。

---

# 12. `CanvasPage.tsx` exact patch

C1-1：

```text
NO T4 runtime creation
NO duplicate canvas loading
```

原则上：

```text
CanvasPage.tsx
KEEP current loadCanvas/switchCanvas
```

只允许未来由 T2 route source plan做：

```text
active Surface route / worksite route integration
```

Provider自己订阅：

```text
canvasStore.canvasId
isLoading
```

因此无需给 CanvasPage 增：

```text
onCanvasReady
```

避免多一道 event bridge。

---

# 13. `App.tsx` exact responsibility

T4 source plan标：

```text
CROSS-THREAD CONSUMER
OWNER = T2
```

T2 最终在 active-project route/shell：

```tsx
<LcosProjectSessionProvider
  projectId={canonicalProjectId}
  surfacePort={activeSurfacePort}
>
  <CanvasPage ... />
</LcosProjectSessionProvider>
```

具体：

```text
route path
params
project launch transition
worksite path
```

全部遵循 T2 source plan。

T4不改产品 URL。

---

# 14. SurfaceRegistry exact relation

current：

```text
apps/web-gen2/src/spatial/surfacePort.ts
```

KEEP原样。

current：

```text
apps/web-gen2/test/surfacePort.test.ts
```

KEEP。

T4 Provider 不构造：

```text
`${projectId}-main-canvas`
```

而消费：

```text
SurfacePort
```

---

# 15. Camera technical conflict · current exact source

文件：

```text
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

current `ResizeObserver`：

```text
wrapper size changes
→ currentViewport = instance.getViewport()
→ anchorViewportCentre(...)
→ optional revealBoundsInViewport(...)
→ instance.setViewport(nextViewport, {duration:0})
```

源码注释明确：

> side panels / split previews change wrapper size; compensate by half delta to keep same flow point centred.

这与 Phase B D15：

```text
Professional Window resize
→ Camera不得自动改变
```

发生真实 implementation conflict。

但可薄适配。

因此：

```text
NO Coordinator escalation
```

---

# 16. Camera thin seam · exact contract

## 16.1 MODIFY

```text
huabu/apps/web/src/lcos-seam/types.ts
```

新增完全 domain-neutral 的：

```ts
export type CanvasViewportResizePolicy =
  | 'anchor-centre'
  | 'preserve-transform'
```

在：

```ts
CanvasHostExtension
```

增加：

```ts
readonly viewportResizePolicy?: CanvasViewportResizePolicy
```

语义：

```text
undefined / anchor-centre
= stock Huabu current behavior

preserve-transform
= wrapper resize不修改 ReactFlow transform
```

---

# 17. 为什么这字段可以放 neutral host seam

因为它表达：

```text
Canvas host mechanics policy
```

不表达：

```text
LCOS Project
Context
Workflow
Work View
Domain entity
```

Huabu独立 host未来也可以使用。

因此没有把 LCOS domain污染到：

```text
lcos-seam/types.ts
```

---

# 18. web-gen2 HostSeam mirror

## MODIFY

```text
apps/web-gen2/src/host/hostSeam.ts
```

增加：

```ts
export type HostViewportResizePolicy =
  | 'anchor-centre'
  | 'preserve-transform'
```

`HostSeam`：

```ts
viewportResizePolicy?: HostViewportResizePolicy
```

`HostSeamOptions`：

```ts
viewportResizePolicy?: HostViewportResizePolicy
```

`createHostSeam()`：

```text
pass-through
```

---

# 19. Huabu adapter structural mirror

## MODIFY

```text
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
```

`HuabuCanvasHostExtension` 增：

```ts
viewportResizePolicy?: 'anchor-centre' | 'preserve-transform'
```

`hostExtensionFromSeam()`：

```text
seam.viewportResizePolicy
→ extension.viewportResizePolicy
```

---

# 20. web-gen2 public export

## MODIFY

```text
apps/web-gen2/src/index.ts
```

export：

```text
HostViewportResizePolicy
```

以及后面本卡新增的：

```text
professionalWindowEnvironment pure types/resolver
```

---

# 21. Provider 应用 LCOS policy

`LcosProjectSessionProvider` 建 seam：

```ts
createHostSeam(() => rt.host, {
  overlays: ...,
  recognizers: ...,
  viewportResizePolicy: 'preserve-transform',
})
```

只有 LCOS project session 设置。

---

# 22. `Canvas.tsx` exact minimal patch

current ResizeObserver 中，在：

```text
nextSize valid
instance found
```

后：

```ts
if (hostExtension?.viewportResizePolicy === 'preserve-transform') {
  previousSize = nextSize
  return
}
```

然后 stock path继续：

```text
anchorViewportCentre
revealBoundsInViewport
setViewport
```

---

## 22.1 为什么必须更新 previousSize 再 return

如果不更新：

```text
LCOS preserve阶段 resize多次
→ previousSize一直旧值
→ 后续policy切回stock时出现巨大补偿
```

所以：

```text
preserve transform
≠ freeze observer bookkeeping
```

---

# 23. Stock Huabu recovery invariant

任何没有 host extension：

```text
CanvasHostExtension = undefined
```

或没有该字段：

```text
viewportResizePolicy = undefined
```

必须继续走 current：

```text
anchor-centre
```

因此：

```text
Huabu stock behavior zero regression
```

这是本 thin seam 的核心价值。

---

# 24. Explicit Focus 仍可移动 Camera

D15只冻结：

```text
window/layout resize不动Camera
```

显式：

```text
Focus
Locate
Arrival-required explicit framing
```

由 T1/T2的 camera owner继续合法移动。

因此：

```text
preserve-transform
```

只影响：

```text
ResizeObserver layout compensation
```

不拦：

```text
user/owner explicit camera command
```

---

# 25. ProfessionalWindowEnvironment · Gen1 donor exact source

Gen1 donor：

```text
DZWFLi/LCOS-local-creativeOS@3e99769
```

## donor A

```text
apps/web/src/features/spatial/activeSpatialViewport.ts
```

已经有成熟纯函数：

```text
viewportRect
staticInsets
persistentOccupiedRects
edgeTolerance
→ activeSpatialRect
→ activeInsets
→ topCenterAnchor
→ edgeBounds
```

关键：

```text
不读/写 Camera
```

---

## donor B

```text
apps/web/src/features/spatial/useObservedActiveSpatialViewport.ts
```

已经有：

```text
data-spatial-viewport-occupant
ResizeObserver
MutationObserver
requestAnimationFrame batching
getBoundingClientRect
```

它只观察 screen-space geometry。

---

## donor C · historical browser proof

历史 admission smoke已经真实测试：

```text
inject:
data-spatial-viewport-occupant="right"

→ HUD anchor shifts left
→ camera snapshot unchanged
```

因此：

```text
这不是理论 donor
```

而是经过 browser smoke 的成熟机制。

---

# 26. Donor adoption rule

不把整个 Gen1 spatial shell迁进来。

只：

```text
LIFT
- pure geometry resolver
- occupant attribute protocol
- observer mechanics
- equality/dedupe pattern
```

RETIRE：

```text
old app shell
old Workspace
old WorkRail
old Scope semantics
```

---

# 27. New pure module exact file

## ADD

```text
apps/web-gen2/src/presentation/professionalWindowEnvironment.ts
```

### Owner

```text
T4 presentation geometry contract
```

### 为什么放 web-gen2

因为它：

```text
React-free
DOM-free
Core-free
Camera-free
```

且需要给：

```text
T1/T2/T3
```

作为稳定纯数据 seam。

---

# 28. Pure types

候选锁定：

```ts
export type ProfessionalWindowEdge =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'

export interface ScreenRect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

export interface ScreenInsets {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

export type ProfessionalRegionMode =
  | 'docked'
  | 'floating'
  | 'immersive'

export interface ProfessionalRegionPresence {
  readonly regionId: string
  readonly mode: ProfessionalRegionMode
  readonly rect: ScreenRect
  readonly edge?: ProfessionalWindowEdge
}

export interface ProfessionalWindowEnvironment {
  readonly viewportRect: ScreenRect
  readonly occupiedRects: readonly (
    ScreenRect & { readonly edge: ProfessionalWindowEdge }
  )[]
  readonly safeRect: ScreenRect
  readonly safeInsets: ScreenInsets
  readonly activeRegions: readonly ProfessionalRegionPresence[]
}
```

---

# 29. 不复用 RFS `Rect`

current：

```text
apps/web-gen2/src/spatial/types.ts
```

已有：

```ts
Rect {
  x
  y
  width
  height
}
```

但它是：

```text
Huabu/RFS spatial transport type
```

ProfessionalWindowEnvironment 是：

```text
client screen-space geometry
```

刻意保持：

```text
left/top
```

避免：

```text
RFS world/spatial Rect
和screen rect
```

混义。

这不是第二 spatial truth。

是完全不同坐标域的 presentation geometry。

---

# 30. Pure resolver exact behavior

ADD：

```ts
resolveProfessionalWindowEnvironment({
  viewportRect,
  staticInsets?,
  activeRegions
})
```

规则：

## docked / edge region

如果：

```text
mode='docked'
edge='right'
```

且 rect与 viewport相交：

```text
shrink safeRect.right
```

同理四边。

## floating region

```text
activeRegions保留
```

但：

```text
默认不 shrink safeRect
```

它作为：

```text
collision obstacle
```

供 Arc/Composer/Pin等二阶段消费者使用。

## immersive

如果 professional region真正占据主 stage：

```text
activeRegions记录
```

safeRect可以趋近零/由具体 C1-2 stage决定占据 rect。

不通过 Camera补偿。

---

# 31. Pure resolver必须继承 donor的 fail-safe

包括：

```text
normalize non-finite rect
clamp negative width/height
ignore zero-area rect
ignore off-viewport rect
edge inference only when unambiguous
stable deterministic output
```

---

# 32. Pure unit tests

## ADD

```text
apps/web-gen2/test/professionalWindowEnvironment.test.ts
```

最少：

```text
right dock shrinks safeRect
left+right dock combine
top+bottom combine
multi-edge clamp no negative rect
floating region does not shrink safeRect
floating remains in activeRegions
offscreen ignored for occupancy
zero-size ignored
explicit edge wins inference
no Camera property exists in output
```

---

# 33. React observer / provider exact file

## ADD

```text
huabu/apps/web/src/lcos/professional/ProfessionalWindowEnvironment.tsx
```

### Owner

```text
T4 React presentation environment
```

### Responsibilities

```text
measure one Professional Window stage root
observe registered region DOM
consume pure resolver
publish context/hook
```

---

# 34. Provider API

候选：

```ts
interface ProfessionalWindowEnvironmentProviderProps {
  viewportRef: React.RefObject<HTMLElement | null>
  staticInsets?: Partial<ScreenInsets>
  children: React.ReactNode
}
```

exports：

```text
ProfessionalWindowEnvironmentProvider
useProfessionalWindowEnvironment()
useProfessionalWindowEnvironmentOptional()
```

---

# 35. 为什么必须传 stage rootRef

Gen1 old hook默认：

```text
viewportRect = 0,0,window viewport
```

但 Gen2：

```text
WindowChrome
left navigation
stage
```

不一定等于全 browser viewport。

因此 C1-1 改良 donor：

```text
measure exact ProfessionalWindowStage root
```

避免：

```text
把 title bar / left navigation 算入 Canvas safe region
```

---

# 36. Occupant DOM protocol

继续保留成熟 attribute：

```text
data-spatial-viewport-occupant="left|right|top|bottom"
```

原因：

```text
T1已有历史 consumer/test语义
donor成熟
generic
无 Dockview依赖
```

Professional region另外标：

```text
data-lcos-professional-region-id="<regionId>"
data-lcos-professional-region-mode="docked|floating|immersive"
```

这些是：

```text
presentation diagnostics / observer protocol
```

不是 Core truth。

---

# 37. Centralized observation

只有：

```text
ProfessionalWindowEnvironmentProvider
```

可以做：

```text
querySelectorAll
ResizeObserver
MutationObserver
getBoundingClientRect
```

T1/T2/T3 consumer禁止重复 DOM query。

---

# 38. Observer scheduling

LIFT Gen1 pattern：

```text
MutationObserver
→ refresh observed elements

ResizeObserver
→ schedule

window/stage resize
→ schedule

schedule
→ requestAnimationFrame
→ measure once
→ pure resolve
→ shallow equality
→ set state only if changed
```

避免：

```text
panel resize pointermove
→ React state storm
→ HUD全树每像素重渲
```

---

# 39. C1-1 compatibility producer · current Preview right panel

在 C1-2 ProfessionalWindowStage 还没落之前，需要真实 browser seam验证。

因此 C1-1允许对 current：

```text
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
```

做一个极薄兼容标记：

当前：

```tsx
<div data-right-panel-slot ...>
```

新增，仅在 panel实际 visible/open 状态下：

```text
data-spatial-viewport-occupant="right"
data-lcos-professional-region-id="preview-workspace-compat"
data-lcos-professional-region-mode="docked"
```

collapsed slot：

```text
width=0
```

observer自然忽略。

---

# 40. 为什么 C1-1 不把左 Layers Panel 也标成 Professional occupant

左 Layers 是：

```text
Huabu navigation/sidebar shell
```

不是：

```text
T4 Professional Window
```

它是否属于 T1 active viewport static inset：

```text
由 T1/T2 shell owner处理
```

T4不偷吞。

C1-1 compatibility只标：

```text
right Preview professional-region-like occupied slot
```

用于验证公共 seam。

---

# 41. Floating region contract

C1-2 后：

floating panel root：

```text
data-lcos-professional-region-id
data-lcos-professional-region-mode="floating"
```

不写：

```text
data-spatial-viewport-occupant
```

因此：

```text
safeRect不缩
activeRegions有collision rect
```

这正好符合 Phase B D14。

---

# 42. `overlayArbitration.ts` exact retirement

当前：

```ts
OverlayKind includes 'work-view'
OverlayInput.workViewOpen: boolean
overlayLayers.workView = 50

if (input.workViewOpen)
  return ['work-view']
```

这是旧：

```text
single dominant Work View
```

模型。

Phase B/V2后专业窗口是：

```text
Canvas sibling screen-space regions
```

不是：

```text
LcosHostOverlay child
```

---

# 43. MODIFY `apps/web-gen2/src/interaction/overlayArbitration.ts`

RETIRE：

```text
OverlayKind 'work-view'
OverlayInput.workViewOpen
overlayLayers.workView
LAYER_BY_KIND['work-view']
visibleOverlays() workView exclusive branch
```

KEEP：

```text
drag
resize
composer
Action Arc
reference
focus HUD
drop preview
```

这仍是唯一 canvas overlay arbitration。

---

# 44. MODIFY overlay tests

文件：

```text
apps/web-gen2/test/overlayArbitration.test.ts
```

删除：

```text
work-view exclusive test
workViewOpen base field
modes 'workview'
all kinds 'work-view'
```

新增/强化：

```text
Professional Window existence is NOT an arbitration input
```

测试可以表达为：

```text
visibleOverlays only reacts to canvas overlay states
```

---

# 45. MODIFY `LcosHostOverlay.tsx`

删除：

```ts
workViewOpen: false
```

以及：

```text
“workView待B阶段接surface store”
```

的旧注释。

专业窗口 occupancy：

```text
读 ProfessionalWindowEnvironment
```

但：

```text
LcosHostOverlay 本卡不需要直接消费环境
```

真正 Composer/Arc safe placement 接线：

```text
T1/T3各自source plan
```

T4只提供环境。

---

# 46. `panelStore.ts` C1-1状态

current：

```text
isRightCollapsed
isPreviewFullscreen
rightPanelAnchorNodeId
```

目前：

```text
Preview-specific
```

且只 persistence：

```text
isRightCollapsed
```

### C1-1

```text
KEEP AS COMPAT
```

不扩展成：

```text
ProfessionalWindowStore
```

---

# 47. `previewWorkspace/actions.ts` C1-1状态

current：

```text
openPreviewNode()
openChat()
→ requestOpenRightPanel()
→ PreviewWorkspaceStore
```

C1-1：

```text
KEEP AS COMPAT
```

C1-2 ProfessionalWindowStage 落地后：

```text
requestOpenRightPanel
→ open/focus Preview professional region adapter
```

PreviewWorkspace内部：

```text
openPreviewTarget
tab state
split groups
```

继续 KEEP。

---

# 48. `rightPanelAnchorNodeId` 与 Camera policy

current Preview open流程：

```text
requestOpenRightPanel(anchorNodeId)
→ Canvas ResizeObserver
→ anchorViewportCentre
→ optional reveal anchor
```

Phase B D15后：

```text
Professional Window open不能隐式 move Camera
```

因此 LCOS：

```text
viewportResizePolicy='preserve-transform'
```

会使：

```text
rightPanelAnchorNodeId
```

不再通过 resize compensation驱动 Camera。

### C1-1

不急着删除字段。

标：

```text
LEGACY_COMPAT
```

C1-2迁移 Preview host 时退休。

如果以后用户显式：

```text
Focus opened Preview target
```

必须走：

```text
T1/T2 explicit Focus command
```

不能偷偷借 resize anchor。

---

# 49. MainLayout fullscreen Canvas unmount

current：

```text
Preview fullscreen
→ Canvas subtree unmount
```

C1-1 Provider 上移后：

```text
runtime可幸存
```

但：

```text
Canvas本体仍被卸载
```

不满足最终 Protected Canvas。

### C1-1

只标：

```text
RETIRE_NEXT
```

### C1-2

ProfessionalWindowStage落地时正式删除：

```text
preview fullscreen unmount Canvas
```

禁止：

```text
第二hidden Canvas
```

---

# 50. Exact file action matrix

| Exact file | Action | Owner | Consumer | C1-1 change |
|---|---|---|---|---|
| `huabu/apps/web/src/lcos/session/LcosProjectSessionProvider.tsx` | ADD | T4 | T2 active-project shell, CenterArea hook | project runtime/session owner |
| `huabu/apps/web/src/lcos/useLcosCanvasProps.tsx` | LIFT/MODIFY | T4 | CenterArea | retire runtime owner; consume Provider |
| `huabu/apps/web/src/lcos/lcosHost.ts` | KEEP | T4 boundary | Provider | use existing runtime factory |
| `huabu/apps/web/src/lcos/lcosReferenceState.ts` | KEEP / consumer use | T3/T4 bridge | Provider, recognizers | surface resetNodeEntities; project reset |
| `huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx` | MODIFY | Huabu/T4 seam | Canvas | remove env projectId |
| `huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx` | KEEP from T4 | Huabu/T2 | Canvas route | no duplicate ready bridge |
| `huabu/apps/web/src/App.tsx` | CROSS-THREAD CONSUMER | T2 | active project route | T4 provides Provider only |
| `apps/web-gen2/src/spatial/surfacePort.ts` | KEEP | shared boundary | T2→T4 | Provider consumes resolved SurfacePort |
| `apps/web-gen2/test/surfacePort.test.ts` | KEEP | shared | CI | no semantic rewrite |
| `huabu/apps/web/src/lcos-seam/types.ts` | MODIFY THIN | Huabu neutral seam | Canvas | optional viewportResizePolicy |
| `apps/web-gen2/src/host/hostSeam.ts` | MODIFY THIN | web-gen2 seam | Provider/adapter | mirror policy |
| `apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx` | MODIFY THIN | bridge | Huabu extension | map policy |
| `apps/web-gen2/src/index.ts` | MODIFY | package boundary | Huabu/T1/T2/T3 | export policy/env |
| `huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx` | MODIFY ONE BRANCH | Huabu | LCOS host | preserve-transform policy |
| `apps/web-gen2/src/presentation/professionalWindowEnvironment.ts` | ADD | T4 presentation seam | T1/T2/T3/T4 | pure geometry resolver |
| `apps/web-gen2/test/professionalWindowEnvironment.test.ts` | ADD | T4 | CI | pure tests |
| `huabu/apps/web/src/lcos/professional/ProfessionalWindowEnvironment.tsx` | ADD | T4 | professional stage + HUD consumers | centralized observer/context |
| `huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx` | MODIFY COMPAT ONLY | Huabu shell | environment | mark current right slot occupant |
| `apps/web-gen2/src/interaction/overlayArbitration.ts` | RETIRE OLD WORKVIEW INPUT | T3/shared | LcosHostOverlay | no Professional Window ownership |
| `apps/web-gen2/test/overlayArbitration.test.ts` | MODIFY | shared | CI | remove single WorkView test |
| `huabu/apps/web/src/lcos/LcosHostOverlay.tsx` | MODIFY | T3/T4 bridge | Canvas overlay | remove workView false |
| `huabu/apps/web/src/store/panelStore.ts` | KEEP COMPAT | Huabu Preview | MainLayout/actions | do not expand |
| `huabu/apps/web/src/store/previewWorkspace/actions.ts` | KEEP COMPAT | Huabu Preview | Preview entry points | C1-2 outer host migration |

---

# 51. Candidate file count discipline

C1-1 实际需要新增的核心文件只有：

```text
1. LcosProjectSessionProvider.tsx
2. professionalWindowEnvironment.ts
3. professionalWindowEnvironment.test.ts
4. ProfessionalWindowEnvironment.tsx
```

必要测试：

```text
Provider test
Observer/provider test
```

可追加两份 test，但不因为“模块漂亮”先拆十个文件。

---

# 52. ProjectSession tests

## ADD candidate

```text
huabu/apps/web/src/lcos/session/LcosProjectSessionProvider.test.tsx
```

必须覆盖：

### P1 · runtime create once

```text
same project rerender
→ create runtime once
```

### P2 · same target no duplicate reconcile

```text
same project
same ready canvas
unrelated rerender
→ no retarget/reconcile
```

### P3 · Surface retarget

```text
A/main ready
→ A/context ready
→ exactly one new retarget/reconcile
```

### P4 · loading mismatch

```text
expected context
actual main
→ no reconcile
```

### P5 · project unmount

```text
dispose runtime once
dispose suppressor once
```

### P6 · project boundary

```text
A session teardown
→ referenceStore.reset()
→ B session create
```

### P7 · stale async

```text
Main reconcile delayed
Context reconcile returns first
Main returns last

assert:
reference cache == Context
```

---

# 53. Camera policy tests

最理想不要在 68KB `Canvas.tsx` 内 hard-to-test。

如果 current test architecture允许，建议把 ResizeObserver decision提成很薄纯函数：

候选：

```text
huabu/apps/web/src/components/Panels/Canvas/canvasViewportResizePolicy.ts
```

例如：

```ts
export function shouldCompensateLayoutResize(
  policy: CanvasViewportResizePolicy | undefined
): boolean
```

但：

```text
只有现有测试结构证明 direct component test太重时才拆
```

C1-1 不强制新文件。

至少 browser/e2e必须证明真实 `setViewport` 不发生。

---

# 54. ProfessionalWindowEnvironment React tests

## ADD candidate

```text
huabu/apps/web/src/lcos/professional/ProfessionalWindowEnvironment.test.tsx
```

测试：

```text
mount provider with stage root
insert right occupant
→ environment updates

resize occupant
→ updates once

remove occupant
→ restores safe rect

add floating professional region
→ activeRegions includes
→ safeRect unchanged

no observer support
→ safe fallback
```

---

# 55. Overlay arbitration tests

current：

```text
apps/web-gen2/test/overlayArbitration.test.ts
```

C1-1必须改：

旧：

```text
test('work-view is exclusive...')
```

删除。

新：

```text
test('professional window presence is outside canvas overlay arbitration')
```

实际上函数签名里：

```text
根本没有 professional window input
```

即可证明 owner分离。

---

# 56. Browser acceptance · BA-C1-1-01

## ProjectSession Surface continuity

```text
1. open canonical Project A / Main
2. wait ready
3. capture runtime/session debug id
4. switch Context
5. switch Workflow
```

断言：

```text
same project session
same runtime object identity
canvasId changes
one reconcile per ready canvas
professional presentation not reset
```

---

# 57. BA-C1-1-02 · Current right Preview occupancy compatibility

在 C1-2 前用 current right Preview：

```text
1. open Preview
2. environment.occupiedRects has right region
3. safeRect.right shrinks
4. resize Preview
5. safeRect changes continuously
6. close
7. safeRect returns
```

---

# 58. BA-C1-1-03 · Camera invariant

```text
before:
get ReactFlow viewport x/y/zoom

open Preview
resize right panel
collapse
reopen
resize browser
```

LCOS host：

```text
after == before
```

注意：

```text
explicit Focus not included
```

---

# 59. BA-C1-1-04 · Stock Huabu invariant

在：

```text
hostExtension absent
```

fixture / playground：

```text
resize wrapper
```

断言 current：

```text
anchor-centre compensation still occurs
```

这样证明：

```text
LCOS policy override
≠ global Huabu behavior rewrite
```

---

# 60. BA-C1-1-05 · Stale reconcile

通过测试 fixture模拟慢 Main reconcile：

```text
Main start
→ switch Context
→ Context finish
→ Main finish late
```

断言：

```text
Reference cache only current Context bindings
```

---

# 61. BA-C1-1-06 · Project switch

```text
Project A draft refs
→ switch Project B
```

断言：

```text
nodeEntityRefs cleared
draft refs cleared
old runtime disposed
new runtime created
```

---

# 62. BA-C1-1-07 · Explicit Focus remains legal

LCOS preserve-transform active：

```text
trigger explicit Focus
```

断言：

```text
Camera moves by Focus owner
```

说明 policy没有错误地冻结所有 camera operation。

---

# 63. Recovery / rollback

## 63.1 Provider lift rollback

如果：

```text
ProjectSession integration regression
```

rollback：

```text
Provider mount + useLcosCanvasProps thin consumer
```

底层继续保留：

```text
createLcosRuntime
createHostSeam
CanvasPage load/switch
SurfaceRegistry
```

无 Core migration。

---

## 63.2 Camera policy rollback

字段：

```text
viewportResizePolicy
```

是 optional。

移除 LCOS传值：

```text
立即恢复 stock anchor-centre
```

无需数据迁移。

---

## 63.3 Environment rollback

如果 observer有 bug：

```text
ProfessionalWindowEnvironmentProvider
→ fallback full stage rect
```

HUD可暂时回到 full rect。

但：

```text
绝不通过 move Camera “补偿”
```

---

## 63.4 Overlay rollback

overlay retirement仅 presentation arbitration。

无 Core truth。

但 C1-2后不要恢复：

```text
workViewOpen exclusive
```

否则再次违反 Phase B。

---

# 64. Blast radius

## 64.1 Allowed

```text
huabu/apps/web/src/lcos/session/*
huabu/apps/web/src/lcos/professional/*
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
huabu/apps/web/src/lcos/LcosHostOverlay.tsx
huabu/apps/web/src/lcos-seam/types.ts
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx (compat attrs only)
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx (one optional policy branch)

apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
apps/web-gen2/src/index.ts
apps/web-gen2/src/presentation/professionalWindowEnvironment.ts
apps/web-gen2/src/interaction/overlayArbitration.ts
related tests
```

---

## 64.2 Explicitly forbidden

C1-1 不碰：

```text
apps/local-core schema/routes
ProjectionBinding key semantics
SurfaceRegistry semantics
Huabu canvasStore viewport persistence
T2 route ontology
Dockview dependency/package.json
PreviewWorkspace internal tabs/groups
Worksite Core contract
Context canonical model
Workflow canonical composition schema
Skill package schema
Run engine
Archive lifecycle
```

---

# 65. T5 Engineering Inputs from C1-1

T5现在可正式依赖：

## Professional Window / Canvas relationship

```text
Professional Window changes screen-space
Canvas world stays
Camera stays
```

---

## Occupancy

```text
Docked edge window
→ shrinks safeRect

Floating window
→ collision obstacle
→ does not shrink global safeRect

Multiple docked edges
→ combine
```

---

## Surface switch

```text
Main / Context / Workflow
→ same ProjectSession
→ professional regions can survive
```

---

## Project switch

```text
→ new ProjectSession
→ project-scoped professional regions reset
```

---

## Canvas

```text
Protected/stable is target architecture
```

C1-2正式实现 topology。

---

# 66. T5 不应设计的旧行为

不要再设计：

```text
Professional Window open
→ camera subtly recenter

right panel open
→ anchored node automatically pulled to center

Work View
→ whole canvas overlays disappear

Surface switch
→ window fades out/reopens

one Work View only
```

---

# 67. Technical conflict gate

本轮找到真实 current-source conflict：

```text
Canvas ResizeObserver
自动 setViewport

vs

Phase B D15
Professional Window resize不动Camera
```

但：

```text
neutral optional host policy
```

可以薄适配。

因此：

```text
COORDINATOR ESCALATION = NONE
```

---

# 68. C1-1 implementation sequence

正式 coding 时顺序建议：

```text
C1-1-A
add pure ProfessionalWindowEnvironment resolver + tests

C1-1-B
add neutral viewportResizePolicy seam + mapping + tests

C1-1-C
patch Canvas ResizeObserver policy branch

C1-1-D
add ProjectSessionProvider + lifecycle tests

C1-1-E
thin useLcosCanvasProps consumer + CenterArea retirement

C1-1-F
add ProfessionalWindowEnvironment React provider/observer

C1-1-G
mark current right Preview compatibility occupant

C1-1-H
retire workViewOpen from overlayArbitration + tests

C1-1-I
browser acceptance
```

为什么这个顺序：

```text
先纯函数
→ 再 neutral seam
→ 再 lifecycle
→ 再 DOM observer
→ 最后旧壳 compatibility
```

失败时最容易单块回滚。

---

# 69. Done / Acceptance Gate

```text
[ ] one runtime per active Project session
[ ] Surface switch does not recreate ProjectSession
[ ] project switch disposes old session exactly once
[ ] stale reconcile cannot overwrite current binding cache
[ ] CenterArea no production PROJECT_ID fallback
[ ] SurfaceRegistry remains sole top-level Surface→canvas contract
[ ] stock Huabu absent-extension resize behavior unchanged
[ ] LCOS Professional Window resize does not setViewport
[ ] explicit Focus can still move Camera
[ ] one centralized ProfessionalWindowEnvironment observer
[ ] right Preview compatibility occupant updates safeRect
[ ] floating region does not shrink safeRect
[ ] overlayArbitration no longer owns Professional Window
[ ] no persisted safeRect
[ ] no second Camera
[ ] no new Core truth
[ ] no Coordinator escalation required
```

任一未通过：

```text
C1-1 不进入 C1-2 production implementation
```

---

# 70. C1-1 Final Exact Owner Matrix

```text
Core Project identity
→ Local Core

active Surface navigation
→ T2

SurfaceKey → canvasId
→ SurfaceRegistry

Huabu canvas load/switch
→ CanvasPage + canvasStore

LCOS project runtime lifecycle
→ NEW LcosProjectSessionProvider

Host neutral resize policy
→ CanvasHostExtension

LCOS resize policy choice
→ LcosProjectSessionProvider HostSeam

Camera truth
→ Huabu

Professional screen-space geometry
→ ProfessionalWindowEnvironment

Canvas overlay arbitration
→ overlayArbitration + LcosHostOverlay

Professional Window topology
→ C1-2

Preview body internal state
→ PreviewWorkspaceStore
```

---

# 71. Next

下一小步：

```text
C1-2
Professional Window Topology
+
Dockview isolated proof
+
Protected Canvas
+
Preview outer-host migration
```

C1-2 必须锁：

```text
Dockview exact version/license
package.json exact add
ProfessionalWindowStage exact mount
Protected Canvas identity
renderer='always' proof
Dock→Float→Dock state continuity
multi-region
DnD coexistence
MainLayout retirement sequence
panelStore/rightPanel compatibility retirement
PreviewWorkspace outer-host adapter
layout persistence sanitization
browser acceptance
rollback
blast radius
```

不碰：

```text
产品语义
Worksite truth
Context/Workflow/Skill canonical truth
```
