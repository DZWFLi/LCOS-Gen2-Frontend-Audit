# LCOS Gen2 · T2 Phase C1 Engineering Seam / Source Skeleton v1
## Checkpoint 01 · S01–S03
### SurfaceDock / Railway / Worksite Enter-Back

日期：2026-09-06  
状态：`PHASE C1 · SOURCE-LEVEL SKELETON · CHECKPOINT 01`  
代码基线：`DZWFLi/LCOS_Gen2 @ c2ff890a867922a1256572199458438572eb0a8c`  
Gen1 donor 基线：`DZWFLi/LCOS-local-creativeOS @ 3e99769`

> 本稿不是 production patch，不重新讨论 Phase B 已关闭的产品语义。
>
> 它只回答：
>
> **现在哪个文件真的负责、谁在消费、下一层薄 seam 应该长在哪里、什么必须复用、什么必须迁移/退休、T5 能依赖哪些真实工程状态。**
>
> 本 checkpoint 只覆盖：
>
> - `T2-S01 SurfaceDock / Surface activation`
> - `T2-S02 Railway Presenter / Rail ontology / durable order`
> - `T2-S03 Worksite Enter / Active Worksite / Back session stack`
>
> S04–S12 后续小步补齐。

---

# 0. Phase B authority

本 checkpoint 无条件服从最新 Phase B：

- D07：Long-term Worksite 保留产品心智，优先迁移/瘦身旧 Workspace，不双轨；
- D08：Worksite 只由明确用户动作 materialize；
- D09：Worksite durable，active Worksite 可恢复，Back stack session-only；
- D10：Conversation child canvas = nested Worksite；
- D14/D15：Professional Window occupancy 由 T4 暴露，窗口 resize 不自动改 Camera；
- D16：SurfaceDock = Main/Context/Workflow primary quick switch；Railway = structural navigation/destination map；
- D17：`/view-rail-order` 机制保留，旧 ontology 迁移；
- Scope / Collection / temporary Context block 不自动成为 Rail destination。

本稿不重新 OPEN 上述问题。

---

# 1. Current production composition root：先纠正一个源码判断

## 1.1 web-gen2 本身不是完整 React shell，但 LCOS→Huabu 已经有 production consumer

`apps/web-gen2/src/index.ts` 的定位是 shared integration helpers/contracts。
如果只看这个 package，容易误判为“当前 LCOS seam 没被真正 mount”。

实际 production path 在 vendored Huabu：

```text
huabu/apps/web/src/App.tsx
  /canvas/:canvasId
        ↓
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
        ↓
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
        ↓
useLcosCanvasProps(projectId)
        ↓
createLcosRuntime()
        ↓
createHostSeam()
        ↓
hostExtensionFromSeam()
        ↓
<Canvas hostExtension={...}/>
        ↓
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

所以：

> **T2 不需要新建第二 LCOS↔Huabu runtime/composition root。**

T2 screen-space navigation shell 应挂到现有 Huabu host page 的 `lcos/` presentation area，
而 Core / Huabu mechanics 继续通过已经存在的 LCOS runtime + typed clients 接线。

---

# 2. Current Huabu / LCOS host seam 已经足够成熟，不新增第二 seam

## 2.1 Current exact files

### LCOS side

`apps/web-gen2/src/host/hostSeam.ts`

当前 `HostSeam` 已提供：

```ts
extraRenderers
overlays
recognizers
connectIntent
```

`createHostSeam()` 负责把 Core-first semantic connect 接到 `Gen2Host.connect()`。

### React glue

`apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx`

唯一 React glue：

```text
HostSeam
→ HuabuCanvasHostExtension
```

### Huabu neutral contract

`huabu/apps/web/src/lcos-seam/types.ts`

`CanvasHostExtension` 当前只允许：

```text
nodeTypes
overlays
recognizers
connectIntent
```

### Huabu Canvas consumer

`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

当前 `<Canvas>`：

```text
hostExtension?.nodeTypes
hostExtension?.overlays
hostExtension?.recognizers
hostExtension?.connectIntent
```

并且 stock Canvas 本身继续拥有：

```text
ReactFlow
Controls
MiniMap
pointer router
camera/viewport
nodes/edges
CanvasToolbar
```

## 2.2 T2 对这个 seam 的裁决

### KEEP

- `HostSeam`
- `hostExtensionFromSeam`
- `CanvasHostExtension`
- `useLcosCanvasProps`
- one-runtime-per-project-session
- `retarget({canvasId})`
- `reconcile('project-open')`

### DO NOT EXTEND YET

SurfaceDock / Railway 是 **screen-space shell chrome**，
不是 canvas-world renderer，也不是 pointer recognizer。

所以 S01/S02 第一选择不是把：

```text
surfaceDock
railway
navigationManager
safeRectManager
```

继续塞进 `CanvasHostExtension`。

它们优先挂在 `CenterArea/MainLayout` 的 screen-space React shell。

只有未来某个 T2 overlay 真正需要进入 ReactFlow canvas wrapper 内部时，
才使用已有 `HostSeam.overlays`。

---

# 3. T2-S01 · SurfaceDock / Surface activation

## 3.1 PRODUCT_BEHAVIOR

用户看到：

```text
Main   Context   Workflow
```

底部中心一级快速切换。

它只回答：

> “我现在要去哪个一级工作现场？”

它不是：

- Tool mode bar；
- Railway；
- Canvas-local search；
- Worksite breadcrumb；
- Scope navigator；
- permanent app menu。

Phase B D16 已关闭：

```text
SurfaceDock = primary surface switch
Railway = structural navigation / destination map
```

Railway 可以显示 Surface root，但视觉权重更低。

---

## 3.2 CURRENT_ENTRY

当前 Huabu 一级 canvas route：

`huabu/apps/web/src/App.tsx`

```text
/canvas/:canvasId
```

当前 route consumer：

`huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx`

```text
useParams<{canvasId}>()
→ loadCanvas(canvasId) on initial mount
→ switchCanvas(canvasId) on later id change
```

因此：

> **已有真正的 canvas switching mechanic，不需要 T2 再建第二 canvas switcher。**

SurfaceDock 最终应该发出：

```text
target Surface / Worksite
→ resolve stable canvasId
→ navigate(`/canvas/${canvasId}`)
```

然后复用现有 CanvasPage + canvasStore switch path。

---

## 3.3 CURRENT_FILES

### Current semantic descriptor

`apps/web-gen2/src/spatial/surfacePort.ts`

当前：

```ts
LcosSurfaceId = "main" | "context" | "workflow"

SURFACE_DESCRIPTORS:
main     → main-canvas
context  → context-canvas
workflow → workflow-canvas
```

并声明：

```text
sharesSpatialKernel = true
cameraIsolation = true
selectionIsolation = true
layoutIsolation = true
historyIsolation = true
```

还存在：

```ts
class SurfaceRegistry
```

维护：

```text
activeCanvasBySurface
```

但当前源码审计尚未找到 production instantiation / consumer。

### Current route

`huabu/apps/web/src/App.tsx`

### Current canvas switching consumer

`huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx`

### Current LCOS mount

`huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx`

### Current canvas mechanics

`huabu/apps/web/src/store/canvasStore.ts`

---

## 3.4 CURRENT_OWNER

### Surface semantic identity

OWNER：

`apps/web-gen2/src/spatial/surfacePort.ts`

它定义 Main / Context / Workflow 三个 Surface 的稳定 descriptor。

### Canvas routing / load mechanics

OWNER：

Huabu router + `canvasStore`

T2 不能复制成：

```text
SurfaceStore
NavigationCanvasStore
LCOSCanvasRouterStore
```

---

## 3.5 CURRENT_CONSUMERS

### Confirmed

- `App.tsx` consumes `/canvas/:canvasId`
- `CanvasPage.tsx` consumes URL `canvasId`
- `CenterArea.tsx` mounts LCOS-aware Canvas

### Not confirmed

当前没有发现 `SurfaceRegistry` 的 production consumer。

因此在最终 patch 前必须新增测试证明：

```text
SurfaceRegistry 是否实际需要 runtime instance
```

不能因为 class 已经存在就自动把它当 canonical active-Surface owner。

---

## 3.6 GEN1 REUSE

Gen1 exact donor：

`DZWFLi/LCOS-local-creativeOS`
`apps/web/src/features/shell/SurfaceDock.tsx`
`@ 3e99769`

### LIFT

- bottom-center primary three-Surface mental model；
- direct Main / Context / Workflow switch；
- glyph-first compact Dock；
- Surface current-state indication；
- dock 与 Canvas zoom controls 分离的产品结构。

Gen1 source 自己已有注释：

> 画布缩放控件已从 Dock 移除，缩放走画布手势，dock 空间让给三视图与现场 pill。

### DO NOT LIFT

- `CanvasScope`
- `scopePath`
- `activeScopeId`
- `workbenchScopeId`
- `onScope`
- old work/work-free/deliver compatibility modes as new runtime truth；
- old direct-drop semantics inside SurfaceDock if T3/T6 current semantic seam differs。

---

## 3.7 NEW_THIN_SEAM

### PLANNED_NEW_THIN_FILE

`huabu/apps/web/src/lcos/useLcosNavigation.ts`

职责必须极薄：

```ts
currentSurface
activateSurface(surfaceId)
enterWorksite(worksiteRef)
back()
```

它不能保存 canonical Surface / Worksite identity。

它只：

1. 读取 current route/canvas；
2. 调用 web-gen2 surface/worksite resolver；
3. 调 React Router `navigate()`；
4. 维护 session-only Back stack；
5. 把导航完成交给 S07 Arrival。

### PLANNED_NEW_BODY

`huabu/apps/web/src/lcos/ui/SurfaceDock.tsx`

只做 presenter/body。

Props 类似：

```ts
surface
onActivateSurface
disabled?
attention?
```

不读 Core DB，不自己 load canvas，不自己保存 active Worksite。

### MODIFY

`huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx`

增加 Screen-space shell mount：

```text
Canvas
+ LCOS SurfaceDock
+ 后续 Minimap/Spatial Navigator
```

SurfaceDock 要作为 `CenterArea` 的绝对定位 sibling，
不是 ReactFlow node/overlay。

---

## 3.8 REUSE_EXISTING

```text
Surface descriptor → surfacePort.ts
route → React Router
canvas switch → canvasStore.loadCanvas/switchCanvas
LCOS runtime → useLcosCanvasProps
world/camera state → Huabu
final visual body → T5
```

---

## 3.9 MIGRATION

### Phase 1

只把 current route canvas 映射为 Main/Context/Workflow。

### Phase 2

等 S03 Worksite contract 接上后：

```text
Surface quick switch
→ 回到该 Surface 最近 active Worksite/canvas
```

如果该 Surface 暂无 long-term Worksite：

```text
→ Surface default canvas
```

### No hidden creation

切 Context / Workflow：

**不得因为没有 Worksite 自动创建 Worksite。**

D08 明确禁止。

---

## 3.10 RETIREMENT

T2 施工后应退休/降级：

- Huabu bottom-center `NodeToolbar` 作为一级常驻 product chrome 的地位；
- old Scope breadcrumb 作为 Surface navigation truth；
- old work/deliver legacy modes 的用户级 Surface identity。

注意：

> `CanvasToolbar` 的能力不删除。

只是 presentation 进入次级/contextual 入口，由 T5/T1/T3 后续视觉回填。

---

## 3.11 DO_NOT_BUILD

- `SurfaceStore`
- `SurfaceRouter`
- `NavigationManager`
- 第二 `canvasStore`
- SurfaceDock 自己持久化 active Surface
- Scope-based Surface truth
- implicit Worksite materialization

---

## 3.12 VISUAL_INPUT_FOR_T5

T5 可以依赖：

```text
SurfaceDock fixed mental model:
Main / Context / Workflow

placement:
bottom-center

visual priority:
higher than Railway Surface roots

state:
rest / hover / active / disabled-or-unavailable / safeRect-shifted

text:
glyph first; text hover/focus or compact identity as final T5 choice
```

T5 不必考虑：

- Scope breadcrumb；
- Canvas editing tools 常驻同一排；
- zoom/fit 常驻 SurfaceDock；
- fourth/fifth product Surface。

---

## 3.13 UNIT_TEST

新增建议：

`huabu/apps/web/src/lcos/useLcosNavigation.test.ts`

覆盖：

```text
canvasId → surface mapping
Main activation
Context activation
Workflow activation
no implicit Worksite create
same target no duplicate navigation
```

`SurfaceDock.test.tsx`：

```text
exactly 3 primary actions
active aria state
keyboard focus
no Canvas tool children
```

---

## 3.14 INTEGRATION_TEST

```text
SurfaceDock click
→ React Router target
→ CanvasPage route id changes
→ canvasStore.switchCanvas()
→ existing pending save drain still works
→ LCOS runtime retarget()
→ reconcile('project-open')
```

重点：

不能绕开 `CanvasPage` 直接调用两个不同的 canvas-switch path。

---

## 3.15 BROWSER_ACCEPTANCE

至少：

```text
Main → Context → Workflow → Main
```

验证：

- 每次 direct switch；
- 无 chooser；
- 无页面级闪白；
- 前一 Canvas pending save 正常 drain；
- 每 Surface camera/selection/layout/history 继续由 Huabu 分离；
- bottom-center 不再被 Huabu editing toolbar 作为一级永久占位；
- Railway Surface roots 不与 Dock 形成双重主按钮。

---

## 3.16 RECOVERY / ROLLBACK

如果目标 canvas 不存在：

```text
不创建 Worksite
不构造假 canvas
SurfaceDock 回退到上一个 active state
显示 lightweight unavailable state
```

Rollback：

`SurfaceDock` body 可以独立卸载；
不影响 Core canonical storage；
不改 Huabu world/camera schema。

---

## 3.17 BLAST_RADIUS

`BR-2 Cross-surface navigation`

原因：

会影响：
- React Router route；
- CanvasPage switch；
- LCOS runtime retarget；
- 三 Surface browser regression。

不触碰 Core canonical schema。

---

## 3.18 OPEN_TECH_CONFLICT

`NONE`

当前 source 已提供足够薄的 route + canvas switch + LCOS retarget seam。

不需要 Coordinator。

---

# 4. T2-S02 · Railway Presenter / Rail ontology / durable order

## 4.1 PRODUCT_BEHAVIOR

Railway：

> Project navigation skeleton。

承担：

- Surface roots（结构根，低权重）；
- Long-term Worksite；
- Receiver / Conversation identity；
- current location；
- Peek；
- reorder；
- cross-surface destination；
- Receive Map；
- Arrival destination feedback。

它不是：

- LayerPanel；
- SurfaceDock；
- Scope tree；
- Collection tree；
- Work View；
- Search results list。

---

## 4.2 CURRENT Core route

exact file：

`apps/local-core/src/routes/projects.ts`

route：

```text
GET /projects/:projectId/view-rail-order
PUT /projects/:projectId/view-rail-order
```

### Current GET

当前实现：

```text
stored = metadata.getProjectViewRailOrder(projectId)

workspaceIds = metadata.getWorkspaces(projectId)
scopeIds = metadata.getScopes(projectId)

stored.orderedRefs.filter(
  ref => workspaceIds.has(ref.viewId) || scopeIds.has(ref.viewId)
)
```

### Current PUT

当前硬编码：

```text
scene
collection
context
workflow
```

并：

```text
dedupe kind:viewId
expectedVersion CAS
metadata.saveProjectViewRailOrder(...)
```

---

## 4.3 CURRENT contract

exact file：

`packages/contracts/src/index.ts`

当前：

```ts
ProjectViewRailKindV0 =
  | 'scene'
  | 'collection'
  | 'context'
  | 'workflow'

ProjectViewRailRefV0 {
  kind
  viewId
}

ProjectViewRailOrderV0 {
  projectId
  orderedRefs
  version
  updatedAt
}
```

这就是 D17 需要迁移的真实旧 ontology。

---

## 4.4 CURRENT persistence owner

exact file：

`apps/local-core/src/metadata-repository.ts`

current type import：

```text
ProjectViewRailOrderV0
ProjectViewRailRefV0
```

current persistence mechanism：

```text
metadata.getProjectViewRailOrder
metadata.saveProjectViewRailOrder
```

### Phase B 裁决

机制 KEEP：

- durable order；
- CAS；
- restart；
- dedupe。

ontology CHANGE。

---

## 4.5 CURRENT frontend consumer

当前 `apps/web-gen2/src/backend/projects.ts` 明确只实现：

```text
listProjects
getProjectGraph
```

没有 Railway typed client。

当前源码审计也没有找到生产 `view-rail-order` frontend consumer。

所以 current status：

```text
CORE_OWNER_EXISTS
FRONTEND_TYPED_CONSUMER_MISSING
GEN2_RAILWAY_BODY_MISSING
```

这是工程 gap，不是产品 OPEN。

---

## 4.6 PHASE_B_DECISION

D17：

新 ontology：

```text
surface
worksite
receiver/conversation
legacy-compat
```

Collection / Scope / temporary Context block：

```text
NOT RAIL ITEM BY DEFAULT
```

---

## 4.7 CORE OWNER CHANGE · T6-owned, T2-consumed

T2 不越权直接设计新 canonical schema。

但 T2 source plan要求的 exact Core migration surface 已经可以明确：

### MODIFY

`packages/contracts/src/index.ts`

需要由 T6 把旧：

```text
ProjectViewRailKindV0
```

迁移到 Phase B ontology。

兼容策略应是：

```text
legacy read accepted
new writes only new ontology
```

而不是长期双轨。

### MODIFY

`apps/local-core/src/routes/projects.ts`

GET 不再以：

```text
getWorkspaces + getScopes
```

作为 Rail eligibility 真相。

PUT 不再接受新写：

```text
scene|collection|context|workflow
```

作为 Gen2 normal ontology。

### KEEP

`apps/local-core/src/metadata-repository.ts`

CAS/persistence mechanism 保留，除非 T6 证明旧 serialized type 无法兼容迁移。

这属于 T6 的 BR-3，
T2 只消费最终 typed route。

---

## 4.8 PLANNED_NEW_TYPED_CLIENT

`apps/web-gen2/src/backend/railway.ts`

职责：

```ts
getRailOrder(projectId)
putRailOrder(projectId, orderedRefs, expectedVersion)
```

只封装 Core route。

不存 durable order。

不做 local cache canonical truth。

失败：

- 409 → refresh/rebase；
- network → UI 保留上一次 stable derived list，不伪造 write success。

---

## 4.9 PLANNED_NEW_PRESENTER

`apps/web-gen2/src/presentation/railway.ts`

保持 React-free。

职责：

```text
Core rail order
+ Surface descriptors
+ Worksite summary
+ Receiver summary
+ Huabu geometry preview inputs
→ RailwayItemVM[]
```

候选 VM：

```ts
RailwayItemVM {
  key
  role: 'surface' | 'worksite' | 'receiver' | 'legacy'
  title
  active
  surfaceId?
  canvasId?
  preview?
  pinned?
  orderable
  dropEligibility
  migrationState?
}
```

不得出现：

```text
membership owner
camera owner
canonical Worksite owner
Receiver owner
```

---

## 4.10 GEN1 LIFT

exact donor：

`DZWFLi/LCOS-local-creativeOS`
`apps/web/src/features/shell/WorkspaceRailVNext.tsx`
`@ 3e99769`

### LIFT pure logic

- `RailMemberPreview`
- normalized real-member mini layout concept；
- truthful no-geometry fallback；
- `+N` overflow；
- member type distribution；
- hover larger preview concept；
- reorder ghost/gap/neighbour shift；
- direct semantic destination target；
- adaptive packing principle。

### Strongest pure candidate

Gen1：

```ts
railMemberLayout(members, limit)
memberKindDistribution(members)
memberSummaryLine(view)
```

这些应 LIFT 到：

`apps/web-gen2/src/presentation/railway.ts`

而不是复制旧 component state。

### DO NOT LIFT

- `ProjectRailViewKind = scene|collection|context|workflow`
- `scopeId`
- old Scope delete/rename ownership
- `WorkspaceRailVNext` 本身 1:1 copy
- auto two-column manual resize as product default
- old NEW_SCENE item
- old Rail local truth

---

## 4.11 PLANNED_NEW_BODY

`huabu/apps/web/src/lcos/ui/Railway.tsx`

职责：

```text
REST
PEEK
RECEIVE
MANAGE
```

它只消费 `RailwayItemVM[]` 和 actions。

不自己：

- fetch Core raw graph；
- load workspace memberships；
- infer Surface ontology；
- save rail order；
- manipulate Huabu camera directly。

---

## 4.12 PLANNED_NEW_HOOK

`huabu/apps/web/src/lcos/useLcosRailway.ts`

职责：

```text
load rail order via Core client
derive RailwayItemVM
track current route/Surface/Worksite
commit reorder via CAS route
invoke useLcosNavigation for activate/enter
later integrate Receiver/Drop
```

不是 store。

React query/cache 若项目已有统一机制则 follow existing；
否则最小 hook state，不持久化 canonical truth。

---

## 4.13 MOUNT

Railway 是 Project shell，不是 ReactFlow overlay。

当前 Huabu shell：

`CanvasPage.tsx`
→ `MainLayout.tsx`
→ left LayerPanel / center Canvas / right Preview.

Railway 不应该塞进 `CanvasLayerPanel`。

### Preferred mount seam

MODIFY：

`huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx`

给 Railway 一个独立 persistent screen-space slot：

```text
Railway
| existing optional LayerPanel
| CenterArea
| right Professional/Preview region
```

为什么不塞 `CenterArea`：

Railway 是 project-wide left structural skeleton，
应位于 LayerPanel 之外。

但：

> 不把它写进 `panelStore`。

Railway persistent body 与 Huabu collapsible LayerPanel 是不同概念。

---

## 4.14 REORDER

User drag reorder：

```text
Railway body
→ optimistic visual reorder
→ PUT /view-rail-order expectedVersion
```

成功：

```text
commit returned version
```

409：

```text
refetch
merge server canonical order
reapply user intent if still valid
or restore canonical visual order
```

失败不能静默留在假顺序。

---

## 4.15 PREVIEW GEOMETRY OWNER

Railway real mini preview：

World geometry owner = Huabu。

T2 只读取：

```text
member node bounds
```

然后 pure normalize。

禁止：

```text
Core Workspace.viewport/frameBounds
```

作为 preview geometry truth。

---

## 4.16 MIGRATION

### Legacy read

迁移窗口可把：

```text
scene → worksite or legacy item
context/workflow → resolve actual canonical target
collection → remove from normal Rail unless explicitly materialized Worksite
```

具体 mapping 由 T6 compatibility migration 决定。

### New write

新写只允许 D17 ontology。

### Unknown legacy ref

UI：

```text
legacy compatibility item
```

可读，可进入明确迁移动作；

不能偷偷 reinterpret 为 Collection/Scope/Worksite。

---

## 4.17 RETIREMENT

- old flat peer ontology；
- old Scope-backed Rail item；
- Collection auto Rail item；
- local persisted order；
- Rail-specific canonical store；
- generic “New Scene”；
- old Rail delete semantics tied to Scope deletion。

---

## 4.18 DO_NOT_BUILD

- `RailwayStore`
- second project hierarchy
- Rail LayerPanel tree
- Rail Search engine
- localStorage order
- copy of Core Receiver truth
- copy of Worksite membership truth

---

## 4.19 VISUAL_INPUT_FOR_T5

Real engineering states guaranteed:

### Item species

```text
Surface Root
Long-term Worksite
Receiver/Conversation
Legacy compatibility
```

### Body states

```text
REST
HOVER/PEEK
ACTIVE
REORDER
RECEIVE-ELIGIBLE
RECEIVE-HOT
OVERFLOW
LEGACY
UNAVAILABLE
```

### Worksite preview

可以提供：

```text
true member geometry normalized preview
truthful type/count fallback
+N overflow
```

T5 不必设计假缩略图。

### Surface roots

存在，但低于 SurfaceDock 主权重。

---

## 4.20 UNIT_TEST

web-gen2：

`presentation/railway.test.ts`

- geometry normalize；
- no geometry fallback；
- +N；
- role derivation；
- legacy role；
- Surface root weight metadata。

`backend/railway.test.ts`

- GET；
- PUT；
- CAS conflict；
- malformed/legacy response compatibility。

Huabu:

`lcos/ui/Railway.test.tsx`

- REST/PEEK；
- active；
- reorder intent；
- keyboard；
- receiver slot；
- no Collection default item。

---

## 4.21 INTEGRATION_TEST

```text
Core canonical rail order
→ client
→ presenter
→ Railway
→ user reorder
→ PUT CAS
→ reload
→ same order
```

以及：

```text
Worksite activate
→ useLcosNavigation.enterWorksite()
→ route canvas switch
```

---

## 4.22 BROWSER_ACCEPTANCE

数据量：

```text
2 Worksites
8 Worksites
20 Worksites
```

状态：

```text
REST
PEEK
REORDER
RECEIVE
right Work View open
LayerPanel open/collapsed
narrow viewport
```

验证：

- Rail 不变 Explorer；
- LayerPanel 与 Rail 不抢同一语义；
- SurfaceDock 仍然是更强的三 Surface switch；
- Worksite preview 来自真实 geometry；
- reorder restart 后保持；
- 409 conflict 不出现 phantom order。

---

## 4.23 RECOVERY / ROLLBACK

Core GET 失败：

```text
保持最后 stable render
标 transient unavailable
不写 local canonical fallback
```

PUT 失败：

```text
rollback visual order or rebase canonical
```

Legacy unresolved：

```text
显示 legacy/unavailable
不自动删 durable ref
```

Rollback：

Railway UI 可以独立 feature disable；
Core old read compatibility在迁移窗口保留。

---

## 4.24 BLAST_RADIUS

T2 UI：

`BR-2`

Core ontology migration：

`BR-3`，T6 owner。

---

## 4.25 OPEN_TECH_CONFLICT

`NONE`

当前旧 route/type 明确而且有薄 compatibility migration 路径。

不需要 Coordinator。

---

# 5. T2-S03 · Worksite Enter / Active Worksite / Back session stack

## 5.1 PRODUCT_BEHAVIOR

Worksite：

> 一张以后还能回来继续的长期工作桌。

Enter：

```text
用户明确进入另一张长期桌
→ active Worksite 改变
→ route 到 stable canvasId
→ Huabu 加载该 canvas
→ Arrival
```

Locate：

```text
只移动当前 Canvas camera
```

不属于 S03 Enter。

Back：

```text
返回本次 session 中上一个真实导航现场
```

不是：

```text
Scope.parentScopeId
```

---

## 5.2 CURRENT old Workspace domain

exact file：

`packages/domain/src/index.ts`

当前旧 `Workspace`：

```ts
Workspace {
  id
  projectId
  scopeId
  name
  intent
  viewport
  focusedViewIds
  visibleLayers
  contextPolicy
  frameBounds?
  preferredSurface?
  version?
  updatedAt
}
```

这正是 Phase B D07 要“瘦身”而不能原样复活的原因。

它混在一起：

```text
canonical identity-ish fields
Scope ownership
camera
spatial frame
presentation
focus
surface hint
```

---

## 5.3 CURRENT old Workspace state route

exact file：

`apps/local-core/src/routes/workspace-states.ts`

现有：

```text
GET/POST /workspaces/:id/states
POST /workspaces/:id/states/:stateId/restore

GET /projects/:id/workspace-memberships

GET /workspaces/:id/entity-members

GET/POST /workspaces/:id/members
DELETE /workspaces/:id/members/:viewId
POST /workspaces/:id/members/move
```

现有 member write 已经走 `MutationSafetyService / ChangeSet`。

这些机械不能因为概念迁移就随便丢掉。

---

## 5.4 CURRENT WorkspaceStateService

exact file：

`apps/local-core/src/workspace-state-service.ts`

`WorkspaceStateSnapshot` 当前保存：

```text
workspace.viewport
workspace.focusedViewIds
workspace.visibleLayers
workspace.intent
memberships
linkedRunIds
```

`restore()` 当前：

```text
repository.addWorkspaceMembers(...)
return snapshot
```

重要：

> **当前 restore 并没有负责恢复 Huabu camera。**

但 snapshot 仍携带旧 viewport。

Phase B D07/D09 要求最终 Worksite identity 与 Huabu camera 分层。

---

## 5.5 CURRENT actual canvas navigation mechanic

Huabu：

`App.tsx`

```text
/canvas/:canvasId
```

`CanvasPage.tsx`

```text
loadCanvas(canvasId)
switchCanvas(canvasId)
```

`MainLayout.tsx`

在 Fullscreen Preview 恢复 Canvas 时已有注释：

> Canvas restores its viewport from canvasStore when subtree mounts again.

这说明：

> **Worksite Enter 不应该把 Core Workspace.viewport 重新喂给 camera。**

stable `canvasId` 是正确跨层连接点。

---

## 5.6 CURRENT LCOS runtime retarget

exact：

`huabu/apps/web/src/lcos/useLcosCanvasProps.tsx`

当 Huabu canvas ready：

```text
runtime.retarget({canvasId})
→ host.reconcile('project-open')
→ reload ProjectionBinding identity cache
```

这条必须继续使用。

---

## 5.7 PHASE_B_DECISION

D07：

Worksite Core 最少应保留：

```text
identity
projectId
name/intent
stable canvasId
durable working-set refs
home/origin Surface or parent worksite ref
lifecycle
timestamps
```

Huabu：

```text
camera
node geometry
layout
spatial history
frame/body geometry
```

D09：

```text
Worksite durable
active Worksite recoverable
Back stack session-only
```

---

## 5.8 OWNER SPLIT

### T6 / Core owner

Worksite canonical identity/persistence。

T2 不新增 canonical Worksite schema。

### T1 / Huabu owner

Canvas/world/camera/layout/history。

### T2 owner

Navigation session:

```text
Enter
Back
current navigation path
Arrival orchestration
```

---

## 5.9 CURRENT MIGRATION SURFACE · T6-owned

Exact old fields必须分类：

### KEEP / MIGRATE into slim Worksite

候选按 Phase B：

```text
Workspace.id
projectId
name
intent
updatedAt
```

以及由 T6建立/迁移的：

```text
stable canvasId
working-set refs
home/origin Surface
parent Worksite ref if actual product relation exists
lifecycle
```

### RETIRE as canonical Worksite fields

```text
scopeId
viewport
focusedViewIds
visibleLayers
contextPolicy
frameBounds
preferredSurface
```

注意：

`preferredSurface` 不是说信息永远无用，
而是不能继续作为 old Workspace canonical blob 中混合 owner。

需要的 origin Surface 应迁到正式 Worksite contract。

### Huabu-owned after migration

```text
viewport
frame/body geometry
layout
history
```

---

## 5.10 WorkspaceStateService migration warning

`WorkspaceStateService.save()` 当前仍 snapshot `viewport/focusedViewIds/visibleLayers`。

C1 final source plan必须要求 T6：

- legacy read 可继续；
- new Worksite checkpoint 不把旧 viewport 重新定义为 spatial truth；
- restore membership side effect必须按新 composition/working-set contract复核；
- T2 不直接调用 old state restore 来实现 Enter/Back。

---

## 5.11 PLANNED T2 SESSION SEAM

### PLANNED_NEW_THIN_FILE

`apps/web-gen2/src/spatial/worksiteNavigation.ts`

React-free，只定义 T2 可消费的 navigation model：

```ts
WorksiteNavigationTarget {
  worksiteId
  projectId
  canvasId
  surfaceId
  title?
}

NavigationStackEntry {
  target
  enteredAt
}
```

可以提供纯函数：

```text
pushBackEntry
popBackEntry
dedupeConsecutive
```

**不得持久化。**

---

## 5.12 PLANNED HUABU CONSUMER

继续复用：

`huabu/apps/web/src/lcos/useLcosNavigation.ts`

同一个 hook 服务 S01/S03。

内部：

```text
navigate React Router
session-only back stack
current target resolver
```

不要另建：

```text
useWorksiteStore
worksiteNavigationStore
```

---

## 5.13 ACTIVE WORKSITE RECOVERY

D09 要求 active Worksite project session 可恢复。

T2 施工约束：

```text
T2 Back stack = memory only

active Worksite durable/recoverable identity
= consume T6/Core session/current-worksite contract
```

禁止为了赶进度自己用：

```text
localStorage.activeWorkspace
sessionStorage.scopePath
```

制造第二 truth。

在 T6 C1 seam 未回填 exact route 前，
T2 的 `useLcosNavigation` 只允许：

```text
receive activeWorksite ref as typed dependency
```

不能重新用 `Workspace.preferredSurface` 猜。

这不是产品 OPEN；
只是跨 owner 的 engineering seam 等待 T6 exact contract 名称。

---

## 5.14 ENTER ALGORITHM

当用户点 Railway Worksite / Conversation child Worksite：

```text
1. resolve canonical Worksite target
2. validate target.lifecycle is enterable
3. push current true navigation target to Back stack
4. navigate(`/canvas/${stableCanvasId}`)
5. CanvasPage.switchCanvas(canvasId)
6. Huabu restores its per-canvas spatial state
7. LCOS runtime.retarget({canvasId})
8. reconcile('project-open')
9. S07 Arrival on resolved target context
```

禁止：

```text
read Workspace.viewport
→ setViewport
```

作为普通 Enter。

---

## 5.15 BACK ALGORITHM

```text
1. pop session Back stack
2. if empty → no-op / disabled
3. revalidate target still exists
4. navigate stable canvasId
5. existing Huabu switch/reconcile
6. Arrival
```

如果 target 已 archive/delete/unavailable：

```text
skip invalid entry
continue pop
```

但不自动 Restore。

---

## 5.16 CONVERSATION CHILD CANVAS

D10：

Conversation child canvas = nested Worksite。

S03 只需要统一 Enter path：

```text
double-click Glyth
→ resolve Conversation Worksite
→ enterWorksite()
```

不新造：

```text
ConversationCanvasNavigator
```

Conversation Preview 仍走 T4 Professional Window，不走 Enter。

---

## 5.17 MATERIALIZATION

D08：

不存在 Worksite 时，点击普通 Context detail / Workflow identity：

```text
不能因为 Enter 方便就自动创建 Worksite
```

只有 explicit action：

```text
“单独开桌”
```

由 T6 canonical transaction 创建，
T2 接创建结果后 Enter。

---

## 5.18 RETIREMENT

- `Scope.parentScopeId` Back；
- `scopePath` navigation truth；
- old Workspace.viewport camera restore；
- old Workspace frameBounds spatial truth；
- old Workspace preferredSurface 直接做 active-Surface owner；
- persistent full Back history；
- implicit child Worksite creation。

---

## 5.19 DO_NOT_BUILD

- `WorksiteStore`
- second Workspace system
- frontend canonical active Worksite localStorage
- Scope navigator
- camera restore from Core old Workspace
- duplicate canvas load/switch path

---

## 5.20 VISUAL_INPUT_FOR_T5

Enter / Back 的真实视觉状态：

```text
idle
press/commit
canvas transition
arrival
unavailable
archived/cold
back-disabled
```

T5 可以设计：

- Worksite body；
- Railway active transition；
- surface continuity；
- Arrival。

但不能设计：

```text
“进入 Worksite 后弹确认”
“因为节点多自动变 Worksite”
“Back 回 Scope 父级”
```

---

## 5.21 UNIT_TEST

`apps/web-gen2/src/spatial/worksiteNavigation.test.ts`

```text
push/pop
consecutive dedupe
invalid skip policy
Back empty
no persistence
```

`huabu/apps/web/src/lcos/useLcosNavigation.test.ts`

```text
Enter → route canvas id
Back → previous canvas
same target no duplicate stack
Surface switch vs Worksite Enter
```

---

## 5.22 INTEGRATION_TEST

```text
Rail Worksite click
→ resolve Worksite
→ navigate
→ CanvasPage.switchCanvas
→ LCOS retarget
→ reconcile
```

Back：

```text
Worksite A
→ Worksite B
→ Worksite C
→ Back B
→ Back A
```

reload：

```text
restore most recent active Worksite
Back stack does NOT resurrect
```

---

## 5.23 BROWSER_ACCEPTANCE

至少：

### Basic

```text
Main worksite
→ Workflow worksite
→ Back
```

### Nested Conversation

```text
Glyth dblclick
→ Conversation child Worksite
→ Back
```

### Restart

```text
enter Worksite B
reload/restart
→ B recoverable

Back
→ no stale pre-restart history
```

### Spatial integrity

每次 Enter：

```text
camera/geometry/layout from Huabu
not Core Workspace.viewport/frameBounds
```

---

## 5.24 RECOVERY / ROLLBACK

Worksite target Core read fail：

```text
do not push stack
do not navigate
current canvas remains
```

canvas missing：

```text
navigation failure
pop just-pushed entry / rollback current navigation state
do not create new Worksite
```

reconcile fail：

```text
Canvas may remain loaded
show recoverable LCOS projection unavailable state
do not corrupt Core identity
```

Rollback：

T2 navigation seam可独立移除；
旧 Workspace legacy routes继续可读直到 T6 migration closeout。

---

## 5.25 BLAST_RADIUS

T2：

`BR-2 Cross-surface navigation`

T6 Workspace→Worksite migration：

`BR-3 Canonical compatibility/migration`

---

## 5.26 OPEN_TECH_CONFLICT

`NONE`

当前真实技术结构存在薄适配路径：

```text
Core Worksite identity
→ stable canvasId
→ existing React Router
→ existing CanvasPage switch
→ existing Huabu spatial restore
→ existing LCOS runtime retarget
```

因此不回报 Coordinator。

---

# 6. S01–S03 shared target architecture

```text
                         Core / T6
                   ┌─────────────────┐
                   │ Worksite truth  │
                   │ Rail order      │
                   └───────┬─────────┘
                           │ typed HTTP
                           ▼
                apps/web-gen2/src/backend
                 railway.ts / Worksite API
                           │
                           ▼
          apps/web-gen2 React-free presentation/spatial
        ┌────────────────────────────────────┐
        │ surfacePort.ts                     │
        │ worksiteNavigation.ts              │
        │ presentation/railway.ts            │
        └────────────────┬───────────────────┘
                         │ typed derived data
                         ▼
            huabu/apps/web/src/lcos/*
        ┌────────────────────────────────────┐
        │ useLcosNavigation.ts               │
        │ useLcosRailway.ts                  │
        │ ui/SurfaceDock.tsx                 │
        │ ui/Railway.tsx                     │
        └────────────────┬───────────────────┘
                         │
                         ▼
       Existing Huabu route / canvas / LCOS runtime
        App.tsx → CanvasPage → CenterArea → Canvas
                         │
                         ▼
                 Huabu Spatial Truth
```

关键：

> 左边不是一条新的产品 runtime。

这只是现有 Core + Huabu owner 之间增加真正缺失的 presentation/navigation adapters。

---

# 7. Exact planned file ledger after Checkpoint 01

## CURRENT · KEEP

```text
apps/web-gen2/src/spatial/surfacePort.ts
apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
apps/web-gen2/src/backend/projects.ts

huabu/apps/web/src/App.tsx
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
huabu/apps/web/src/lcos-seam/types.ts
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
huabu/apps/web/src/lcos/lcosHost.ts
huabu/apps/web/src/store/canvasStore.ts

apps/local-core/src/routes/projects.ts
apps/local-core/src/routes/workspace-states.ts
apps/local-core/src/workspace-state-service.ts
apps/local-core/src/metadata-repository.ts
packages/contracts/src/index.ts
packages/domain/src/index.ts
```

## PLANNED NEW · T2 thin layer

```text
apps/web-gen2/src/backend/railway.ts
apps/web-gen2/src/presentation/railway.ts
apps/web-gen2/src/spatial/worksiteNavigation.ts

huabu/apps/web/src/lcos/useLcosNavigation.ts
huabu/apps/web/src/lcos/useLcosRailway.ts
huabu/apps/web/src/lcos/ui/SurfaceDock.tsx
huabu/apps/web/src/lcos/ui/Railway.tsx
```

## MODIFY · T2 mount

```text
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
```

## MODIFY · T6 owner / T2 consumer after C1 cross-review

```text
packages/contracts/src/index.ts
apps/local-core/src/routes/projects.ts
apps/local-core/src/workspace-state-service.ts / workspace-states.ts
packages/domain/src/index.ts
```

T2 不越权直接决定 T6 最终 type 名，
但 current migration points 已经 exact-file 锁定。

---

# 8. Source-level non-goals after Checkpoint 01

这三张 seam 不做：

- T5 final CSS/body；
- final Railway width；
- final Surface glyph；
- final Worksite visual；
- final Arrival motion；
- Search / Focus / Pin / Locator；
- Minimap；
- Professional Window safeRect；
- T3 drop gesture semantics；
- T6 Worksite schema 最终命名。

这些分别在后续 seam / T5 / T6 回填。

---

# 9. Checkpoint 01 conclusion

S01–S03 目前没有发现必须回 Coordinator 的技术冲突。

相反，current source 给出了一条很薄而且相当清楚的施工路径：

```text
SurfaceDock
→ existing /canvas/:canvasId switching

Railway
→ reuse Core rail-order CAS
→ migrate ontology
→ Gen1 pure preview/reorder behavior LIFT
→ no RailwayStore

Worksite Enter/Back
→ migrate slim Workspace identity
→ stable canvasId
→ existing Huabu switch
→ existing per-canvas spatial truth
→ existing LCOS runtime retarget/reconcile
→ session-only Back
```

最危险的旧债也已经 exact-file 可见：

```text
ProjectViewRailKindV0 = scene|collection|context|workflow
routes/projects.ts GET filters by Workspace/Scope ids
old Workspace mixes scopeId + viewport + focus + layer + frame
WorkspaceStateSnapshot still carries viewport
```

这些后面必须迁移，但没有任何理由再造平行 owner。

---

# 10. Next checkpoint

Checkpoint 02：

```text
T2-S04 Project Search
T2-S05 Focus / Where
T2-S06 Color Pin Navigation
```

目标继续保持：

```text
exact current route
exact Core owner
exact current consumer
existing Huabu mechanics
new thin adapter only
T5 visual inputs
test / browser / recovery / blast radius
```
