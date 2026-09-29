# LCOS Gen2 · T4
# C1-0 · Engineering Seam Skeleton
## 给 T5 的第一版工程接缝 + T4 后续 exact-source 施工骨架

日期：2026-09-06  
源码基线：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`  
阶段：`PHASE C1-0`  
状态：`SOURCE-LEVEL SKELETON / NO PRODUCTION PATCH`

---

# 0. 本稿不是产品讨论稿

产品/owner 已由：

```text
LCOS_Gen2_PhaseB_四路合并_最终跨线程裁决稿_20260906
```

关闭。

本稿只回答：

```text
工程从哪里长出来？
当前谁拥有？
谁消费？
复用什么？
新增哪个薄 seam？
旧东西怎么迁？
哪些要退休？
T5能依赖哪些真实状态？
怎么测？
失败怎么恢复？
最大 blast radius 到哪？
```

已关闭问题不重新 OPEN。

若 current source 有旧实现与 Phase B 冲突：

```text
先 compatibility adapter / migration
```

不是重新讨论产品。

---

# 1. C1-0 总结构

T4 给 T5 和后续源码施工的第一版工程 seam 分六张：

```text
SEAM-T4-01
Project Session → Professional Window Lifetime

SEAM-T4-02
Professional Window Environment / Occupancy

SEAM-T4-03
Professional Window Topology / Protected Canvas

SEAM-T4-04
Assembly Source Bay → Canonical Target Apply

SEAM-T4-05
Context Atlas → Temporary Detail → Professional Instruments

SEAM-T4-06
Workflow / Skill / Run Professional Bodies
```

它们不是六个新产品。

是六条工程接口边界。

---

# SEAM-T4-01
# Project Session → Professional Window Lifetime

## Phase B 来源

相关裁决：

```text
D07 Worksite
D09 session navigation
D10 Conversation child canvas
D14 Work View environment
D24 T2 route/source owner
D25 T4 source plan authorized
```

T4只承接：

```text
active Project 的 professional lifecycle
```

不接管 T2 navigation ontology。

---

## 1.1 Exact Current Files

### Current runtime React owner

```text
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
```

当前事实：

```text
projectId change
→ dispose old runtime
→ createLcosRuntime()

canvas ready
→ runtime.retarget({canvasId})
→ host.reconcile('project-open')

component unmount
→ runtime.dispose()
```

当前 seam：

```text
createHostSeam(() => rt.host)
```

已经允许 underlying host retarget 后保持同一 hostExtension 引用模式。

### Current project-id caller

```text
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
```

当前：

```ts
PROJECT_ID env
?? 'disposable-mvp-sample'
→ useLcosCanvasProps(projectId)
```

这只是当前 G0 bridge。

### Current canvas route/load owner

```text
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
```

当前：

```text
URL /canvas/:canvasId
→ loadCanvas / switchCanvas
→ canvasStore.canvasId
```

### App lifetime root

```text
huabu/apps/web/src/App.tsx
```

`RootLayout` 是 app/router lifetime 的 never-unmounting shell。

但：

```text
Setup / spaces / playground
```

并不一定存在 active LCOS Project。

### Current LCOS runtime

```text
apps/web-gen2/src/host/createLcosHostRuntime.ts
```

当前 contract：

```text
same runtime object
retarget(canvasId/projectId)
→ dispose old host reconciler
→ rebuild host

dispose()
→ reconciler.dispose()
```

### Current Surface registry

```text
apps/web-gen2/src/spatial/surfacePort.ts
```

当前：

```text
main/context/workflow
→ distinct canvasId
→ same runtime family
→ collision fail-close
```

### Current Project HTTP client

```text
apps/web-gen2/src/backend/projects.ts
```

当前只实现：

```text
listProjects()
getProjectGraph()
```

---

## 1.2 Current Owner

```text
Project runtime lifecycle:
useLcosCanvasProps.tsx

Canvas load/switch:
CanvasPage.tsx + canvasStore

Surface identity contract:
SurfaceRegistry

Project canonical identity:
Local Core

Project HTTP transport:
CoreProjectClient
```

---

## 1.3 Current Consumers

```text
Canvas
→ hostExtension

LcosHostOverlay
→ registered via HostSeam

Projection/Reconcile
→ runtime.host

Reference index
→ rt.host.listNodeBindings()
```

---

## 1.4 Phase C1 Decision

### LIFT

把：

```text
runtimeRef
HostSeam
hostExtension
reference suppressor lifecycle
```

从：

```text
CenterArea/useLcosCanvasProps component lifetime
```

上移到：

```text
active Project session lifetime
```

### KEEP

```text
createLcosHostRuntime
createHostSeam(() => rt.host)
SurfaceRegistry
CanvasPage load/switch mechanics
```

不重写。

---

## 1.5 Candidate New Thin Seam

候选 ADD：

```text
huabu/apps/web/src/lcos/session/LcosProjectSessionProvider.tsx
```

职责只包括：

```text
projectId
current surface
current expected canvasId
stable runtime
stable hostExtension
SurfaceRegistry
professional window manager reference
ready-canvas retarget/reconcile coordination
```

候选消费 hook：

```text
useLcosProjectSession()
```

是否单文件还是和 Provider 同文件，在 C1-1 exact plan锁定。

---

## 1.6 Migration

### CenterArea

从：

```text
create project runtime
```

迁成：

```text
consume stable hostExtension
```

RETIRE：

```text
PROJECT_ID env as production selector
disposable-mvp-sample normal fallback
```

### CanvasPage

继续拥有：

```text
Huabu canvas loading/switching
```

新增的只是：

```text
向 ProjectSession 报告 actual ready canvas
```

而不是 CanvasPage 创建 runtime。

### Router

T4不冻结 URL。

T2 source plan提供：

```text
active project
surface/worksite navigation
```

T4只消费：

```text
canonical projectId
active Surface
```

---

## 1.7 Reconcile Guard

需要避免：

```text
surface intent effect
+
canvasId effect
+
window mount effect
```

三次 reconcile。

Provider应以：

```text
{projectId, actualReadyCanvasId}
```

作为本地 effect 去重键。

它不是 canonical truth。

---

## 1.8 T5 可依赖的真实状态

```text
PROJECT_SESSION_ENTER
PROJECT_SESSION_EXIT
SURFACE_SWITCHING
SURFACE_READY
PROFESSIONAL_REGIONS_PERSIST
PROJECT_SWITCH_RESET
```

T5不要设计：

```text
每切 Main/Context/Workflow
→ 所有 professional window全重开
```

---

## 1.9 Tests

### Unit / integration

新增/修改：

```text
LcosProjectSessionProvider.test.tsx
useLcosCanvasProps existing tests → lifecycle responsibilities迁移
surfacePort.test.ts KEEP
createLcosHostRuntime.test.ts KEEP
```

必须测：

```text
same project + same canvas
→ no retarget

same project + new surface canvas
→ one retarget/reconcile

new project
→ old runtime dispose once
→ new runtime create once

Provider re-render
→ no new runtime
```

---

## 1.10 Browser Acceptance

```text
open Project A / Main
open Assembly
switch Context
switch Workflow

assert:
Project session unchanged
Assembly professional region still open
canvasId changes correctly
camera not mutated by professional windows

switch Project B

assert:
A runtime disposed
A professional session cleared
B new session established
```

---

## 1.11 Recovery / Rollback

如果 session lift 出现问题：

```text
rollback only Provider/consumer wiring
```

保留：

```text
createLcosHostRuntime
CanvasPage load/switch
SurfaceRegistry
Core Project routes
```

不得回滚成：

```text
duplicate runtime per panel
```

---

## 1.12 Blast Radius

允许：

```text
Huabu LCOS lifecycle shell
CanvasPage/CenterArea integration
web-gen2 Project client extension
```

禁止：

```text
Core Project schema
Huabu canvas persistence
ProjectionBinding identity
T2 navigation product semantics
```

---

# SEAM-T4-02
# Professional Window Environment / Occupancy

## Phase B 来源

```text
D14
ProfessionalWindowEnvironment

D15
Work View resize does not move Camera
```

---

## 2.1 Exact Current Files

### Global canvas overlay owner

```text
huabu/apps/web/src/lcos/LcosHostOverlay.tsx
```

当前：

```text
selection/drag from real stores
composer/drop preview mounted here
actionArcOpen=false
workViewOpen=false
```

源码注释已经说明：

```text
actionArc/workView待后续surface store
```

### Pure overlay arbitration

```text
apps/web-gen2/src/interaction/overlayArbitration.ts
```

当前：

```text
OverlayInput.workViewOpen: boolean
```

且：

```text
workViewOpen
→ visibleOverlays() returns only ['work-view']
```

这是旧 single/dominant Work View arbitration。

### Current fixed right-panel geometry owner

```text
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
```

目前：

```text
rightWidthPx
right collapsed
preview fullscreen
```

并且 fullscreen：

```text
unmounts Canvas entirely
```

### Legacy safe-region donor

历史成熟 donor：

```text
apps/web/src/features/spatial/activeSpatialViewport.ts
apps/web/src/features/spatial/useObservedActiveSpatialViewport.ts
```

当前 Gen2 GitHub tree未发现已迁入同名 consumer。

C1-1需从历史源码包重新 exact-read 后决定 LIFT 位置。

---

## 2.2 Current Owner

```text
Canvas overlay mutual exclusion:
overlayArbitration.ts

Canvas overlay mounting:
LcosHostOverlay.tsx

Current preview occupancy:
MainLayout.tsx

Camera:
Huabu canvasStore / Huabu spatial layer
```

---

## 2.3 Phase C1 Decision

### KEEP

```text
one canvas-level overlay arbitration owner
```

不造第二套。

### RETIRE

```text
workViewOpen:boolean
```

作为专业窗口的完整表达。

也退休：

```text
workViewOpen → work-view独占整块canvas
```

这种旧单WorkView语义。

### NEW THIN SEAM

Phase B建议语义：

```ts
interface ProfessionalWindowEnvironment {
  occupiedRects: readonly ScreenRect[]
  safeRect?: ScreenRect
  safeInsets?: ScreenInsets
  activeRegions: readonly ProfessionalRegionPresence[]
}
```

最终类型名和 ScreenRect复用情况：

```text
C1-1 exact source决定
```

原则：

```text
不持久化
不成为Core truth
不成为第二Camera
```

---

## 2.4 Consumers

公共环境供：

```text
T1
- HUD
- Minimap
- Pin/Locator
- edge bands
- explicit Focus framing

T2
- Arrival / navigation HUD

T3
- Composer
- Action Arc
- drop feedback

T4
- window/body placement
```

这些 consumer 不应知道：

```text
Dockview group
MainLayout rightWidth
specific panel DOM selector
```

---

## 2.5 Camera Policy

Professional Window：

```text
open
close
resize
dock
undock
split
```

不能触发：

```text
fitView
setViewport
camera compensation
node re-layout
```

如果 Huabu generic resize有 camera compensation：

```text
LCOS host-level override
```

先局部处理。

不改 Huabu global default。

---

## 2.6 T5 可依赖的状态

```text
NO_OCCUPANCY
EDGE_OCCUPIED_LEFT
EDGE_OCCUPIED_RIGHT
EDGE_OCCUPIED_TOP
EDGE_OCCUPIED_BOTTOM
MULTI_EDGE_OCCUPANCY
FLOATING_COLLISION
SAFE_RECT_CONSTRAINED
```

T5可以据此设计：

```text
HUD squeeze
switch side
collapse
hide lower-priority controls
```

---

## 2.7 Tests

### Pure tests

```text
professionalWindowEnvironment.test.ts
overlayArbitration.test.ts patch
```

必须测：

```text
multiple professional regions
→ no single boolean collapse

occupied rect union/insets
→ deterministic

floating region
→ collision input
→ not treated as permanent canvas edge inset
```

---

## 2.8 Browser Acceptance

```text
record camera x/y/zoom
dock Assembly right
resize
add Run Review bottom
float Conversation Preview
close
restore

assert:
camera unchanged
HUD remains usable inside safe rect
Composer/Arc avoid occupied region
```

---

## 2.9 Recovery

Window environment calculation失败：

```text
fail-safe to full canvas rect for calculation
but do not mutate Camera
```

并记录开发态 warning。

不能：

```text
自动fitView“补偿”
```

---

## 2.10 Blast Radius

只允许：

```text
presentation environment
overlay consumer
T1/T2/T3 screen-space consumer seam
```

禁止：

```text
canvas world coordinates
canonical entity
Core
ProjectionBinding
```

---

# SEAM-T4-03
# Professional Window Topology / Protected Canvas

## Phase B / V2 来源

所有大专业界面统一：

```text
Float
Dock
Undock
Resize
Move
Horizontal/Vertical composition
Close
Restore
```

且：

```text
Work View ≠ Worksite
```

---

## 3.1 Exact Current Files

当前 shell：

```text
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
```

当前只有：

```text
left
center canvas
one right panel
```

当前 preview：

```text
huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspace.tsx
```

已有成熟：

```text
tabs
max 2 horizontal groups
dnd-kit
keyboard separator
split ratio
scroll memory
```

它是 Preview body内部能力。

不是全局 window manager。

---

## 3.2 Engineering Donor

当前第一候选：

```text
Dockview React/Core
```

状态：

```text
ADOPT_CANDIDATE
PROTOTYPE_REQUIRED
```

用途：

```text
screen-space panel topology only
```

不拥有：

```text
Project
Surface
Worksite
Context
Workflow
Skill
Run
Assembly truth
```

---

## 3.3 Protected Canvas

Candidate presentation model：

```text
ProfessionalWindowStage
└─ layout manager
   ├─ ProtectedSpatialCanvas
   ├─ Assembly
   ├─ Conversation Preview
   ├─ Context instruments
   ├─ Workflow detail
   ├─ Skill Builder
   ├─ Run Review
   └─ Archive
```

Canvas必须：

```text
always mounted
not closeable
not normal tab
not floatable
not removable by restored layout
```

---

## 3.4 Candidate Exact ADD Boundary

先锁目录边界，不在 C1-0 把最终命名当 truth：

```text
huabu/apps/web/src/lcos/professional/
```

候选：

```text
ProfessionalWindowStage.tsx
ProfessionalRegionHost.tsx
ProtectedSpatialCanvas.tsx
professionalWindowModel.ts
```

正式文件数/名字在 Dockview isolated proof 后锁。

禁止现在一次性新建十几个 manager/store。

---

## 3.5 Migration

### MainLayout

KEEP：

```text
left navigation/header shell
left collapse/resize
```

RETIRE as global professional owner：

```text
rightPanel prop
rightWidth as all-work-view geometry truth
preview fullscreen as universal fullscreen mechanic
```

迁移过程中 Preview可暂时通过 compatibility adapter挂到新 stage。

### PreviewWorkspace

KEEP完整 body：

```text
tab/split/scroll memory
```

只改变外层 host：

```text
MainLayout rightPanel
→ ProfessionalRegionHost
```

---

## 3.6 DnD Boundary

必须区分：

```text
panel header drag
→ window topology

Artifact body drag
→ T3 semantic drop

right-drag
→ T3 transport semantic

Relation handle
→ relation
```

window donor不能吃掉对象drag。

---

## 3.7 T5 可依赖的真实 window states

```text
FLOATING
DOCKED
SPLIT_HORIZONTAL
SPLIT_VERTICAL
ACTIVE
INACTIVE
CLOSING
CLOSED
RESTORING
MAXIMIZED/IMMERSIVE-compatible
RESIZING
DRAGGING_WINDOW
```

以及：

```text
PROTECTED_CANVAS
```

Canvas视觉绝不能被做成普通tab。

---

## 3.8 Prototype Acceptance Gate

在正式 ADOPT Dockview前必须做 isolated proof：

```text
P1
Canvas always-mounted identity

P2
camera invariant

P3
semantic DnD coexistence

P4
panel local state
Dock→Float→Dock remains

P5
3+ professional regions simultaneously

P6
Surface switch while regions remain

P7
close/restore no canonical duplication
```

proof失败：

```text
换 layout donor
```

不改产品语义。

---

## 3.9 Recovery

Dockview adoption失败：

```text
remove only professional layout adapter
restore current MainLayout preview compatibility
```

不得影响：

```text
ProjectSession
Core
Huabu Canvas data
```

---

## 3.10 Blast Radius

允许：

```text
Huabu page shell
professional window adapters
Preview outer host
```

禁止：

```text
Core domain
SurfaceRegistry semantics
camera truth
Run/Skill/Assembly truth
```

---

# SEAM-T4-04
# Assembly Source Bay → Canonical Target Apply

## Phase B 来源

```text
D04
D21
```

---

## 4.1 Exact Current Files

Contract：

```text
packages/contracts/src/assembly.ts
```

Current source refs：

```text
artifactView
capture
resource
conversation
context
workflow
scene
collection
skill
note
```

Current target refs：

```text
project
main
workspace
conversation
context
workflow
scene
```

Read model：

```text
WarehouseSnapshotV1
```

Apply：

```text
AssemblyApplyRequestV1
```

### Core apply owner

```text
apps/local-core/src/assembly-apply-service.ts
```

明确：

```text
service不拥有mutation
source+target
→ route existing canonical service
```

当前 routes包括：

```text
capture materialize
artifact/resource → presentation/workspace
aggregate entity → surface
conversation_context relation
```

current：

```text
skill unsupported
context/workflow/collection scope compatibility
```

Phase B已经给出新目标语义。

### Web transport

current通用：

```text
apps/web-gen2/src/backend/client.ts
```

目前：

```text
JSON body
JSON/text/blob response
```

尚无独立 Assembly typed client exact file。

---

## 4.2 Candidate ADD

```text
apps/web-gen2/src/backend/assembly.ts
```

职责只做：

```text
queryWarehouse()
applyAssembly()
```

以及必要的：

```text
Capture/Sources/Skill source adapters
```

按现有 client分层组合。

不能变成：

```text
AssemblyBusinessStore
```

---

## 4.3 Source Bay Owner Map

```text
Project
→ Warehouse

Capture
→ Capture staging

Sources
→ Resource/connector

Skills
→ Skill Catalog
```

UI统一视觉。

数据不统一造表。

---

## 4.4 Phase B Migration

current：

```text
context/workflow/collection
→ scope compatibility
```

T4：

```text
typed target adapter only
```

T6：

```text
真实 canonical target command迁移
```

T4不得解析：

```text
scopeId == target meaning
```

---

## 4.5 Skill

Phase B：

```text
Composer Skill
→ per-run input

Workflow/Glyth durable Skill
→ typed capability-use relation
```

Assembly UI只消费 T6的能力-use command。

不新增前端 binding truth。

---

## 4.6 T5 可依赖的状态

Source：

```text
PROJECT
CAPTURE
SOURCES
SKILLS
```

Item：

```text
REST
HOVER
SELECTED
DRAGGING
UNAVAILABLE
READ_ONLY/COLD
```

Apply：

```text
TARGET_READY
TARGET_ACCEPT
APPLYING
APPLIED
PARTIAL
SKIPPED
UNSUPPORTED
FAILED
```

Window：

```text
QUICK
DOCKED
FLOATING
DEDICATED/IMMERSIVE-compatible
```

---

## 4.7 Visual Donor

Lovart：

```text
material browsing
Masonry
thumbnail hierarchy
source density
```

工程 truth：

```text
LCOS Core only
```

---

## 4.8 Tests

### Client

```text
assembly client
→ exact path/query/body
→ partial result preserved
→ error normalized
```

### Adapter

```text
source kind
→ correct source reader

target
→ typed canonical ref
```

不得测：

```text
scope inference
```

作为最终行为。

---

## 4.9 Browser Acceptance

```text
open Assembly from Main
target Main

open from Context
target Context

open from Workflow
target Workflow

open from Conversation
target Conversation

drag project material
drag resource
drag capture
drag Skill
```

验：

```text
canonical reload一致
no local fake
source spatial result obeys T3 D04
```

---

## 4.10 Recovery

Apply失败：

```text
Core result is authority
UI clears optimistic visual state
re-read target if partial/unknown
```

不做：

```text
frontend manual rollback of fake membership
```

---

## 4.11 Blast Radius

允许：

```text
Assembly body
typed web client
target adapter
```

禁止：

```text
canonical membership implementation
Collection truth
Skill binding schema
Relation schema
```

---

# SEAM-T4-05
# Context Atlas → Temporary Detail → Professional Instruments

## Phase B 来源

```text
D05
D08
D18
```

---

## 5.1 Product-to-engineering states

Context top-level：

```text
derived Project understanding
```

不维护：

```text
Context membership list
```

用户流：

```text
Atlas
→ region
→ temporary detail
→ optional professional instrument
→ explicit long-term transition only if user asks
```

---

## 5.2 Exact Current Source

Context history：

```text
apps/local-core/src/context-snapshot-service.ts
```

KEEP：

```text
Checkpoint-backed
snapshot
compare
refs
```

RETIRE product dependency：

```text
branch()
→ collection scope
→ new/cloned ArtifactViews
→ generated x/y
```

T4 UI不能调用这个副作用来表示：

```text
打开详情
固定区域
开Worksite
```

---

## 5.3 Exact Current Consumer Gap

current Gen2 尚无已冻结的：

```text
ContextAtlas body owner
Evolution body owner
Relationship body owner
```

因此 C1-4 应新增的是：

```text
projection/adapters + professional bodies
```

不是新 Context persistence。

候选目录：

```text
huabu/apps/web/src/lcos/context/
```

实际文件名在 C1-4 donor/source proof 后锁。

---

## 5.4 Body / Donor Candidates

Atlas：

```text
Astra visual language
Spatial morph/focus
Huabu sole geometry
```

Evolution：

```text
2D timeline donor candidate
```

Relationship：

```text
Cytoscape.js candidate
```

Provenance：

```text
native list/tree
react-virtuoso existing dependency
```

Donor都必须：

```text
sealed body
thin canonical adapter
cleanup/dispose
```

---

## 5.5 Temporary Detail State

T4需要内部 presentation state：

```text
regionRef
resolved underlying refs
focus/selected state
active instrument
```

但不得成为：

```text
Core Context entity
durable Scope
```

关闭 detail：

```text
只丢 presentation state
```

---

## 5.6 Worksite Transition

如果用户明确：

```text
单独开桌长期继续
```

T4只发：

```text
materialize Worksite intent
```

真正 command/identity：

```text
T6/T2 seam
```

T4不自己 new workspace。

---

## 5.7 T5 可依赖的真实状态

Atlas：

```text
REGION_REST
REGION_HOVER
REGION_SELECTED
REGION_FOCUSED
TEMP_DETAIL_OPEN
```

Instrument：

```text
EVOLUTION
RELATIONSHIP
PROVENANCE
```

Transition：

```text
TEMP_DETAIL → PROFESSIONAL_WINDOW
TEMP_DETAIL → explicit WORKSITE intent
```

但：

```text
TEMP_DETAIL ≠ WORKSITE
```

视觉必须不同。

---

## 5.8 Tests

```text
Atlas derived input
→ no mutation

region click
→ presentation state only

temporary detail close
→ no canonical delete

open Evolution
→ reads existing Context history

legacy branch service
→ never called by detail open
```

---

## 5.9 Browser Acceptance

```text
Context Atlas
click time region
temporary detail appears

open Evolution
close Evolution
return region

reload project
```

断言：

```text
no hidden Scope created
no Worksite created
no cloned ArtifactViews
```

---

## 5.10 Recovery

Context instrument donor失败：

```text
fallback body can render same projection
```

不得要求：

```text
migrate Core data
```

---

## 5.11 Blast Radius

允许：

```text
Context projection
Context professional bodies
Window integration
```

禁止：

```text
Checkpoint truth
Collection truth
Worksite truth
Huabu camera
```

---

# SEAM-T4-06
# Workflow / Skill / Run Professional Bodies

## Phase B 来源

```text
D06
D19
D20
```

---

# 6A · Workflow

## Exact Current Source

current HTTP route：

```text
apps/local-core/src/routes/workflow.ts
```

current export/import仍带：

```text
scopeId
```

Phase B：

```text
LEGACY_COMPAT
```

不能作为最终 product identity。

Workflow canonical transaction/composition：

```text
T6 source plan提供
```

T4消费 typed command/read projection。

---

## Web Transport Gap

current：

```text
apps/web-gen2/src/backend/client.ts
```

所有 request body：

```text
JSON.stringify(body)
Content-Type application/json
```

但 workflow import：

```text
multipart file
```

因此 Phase C1需要最薄：

```text
raw/FormData request seam
```

不是第二 HTTP client。

Candidate：

```text
HttpClient.request(... bodyMode/rawBody ...)
```

具体 API在 C1-5 exact plan锁。

---

## Workflow T5 states

主工作：

```text
MATERIAL
ACTION_ROUND
RESULT
REVIEW
CURRENT_GLYTH
```

深度：

```text
ROUND_DETAIL
LOG
TOOL_CALL
PROVIDER
RETRY
INTERMEDIATE
```

主画面不能视觉上变成 log/DAG。

---

# 6B · Skill Builder

## Exact Current Source

```text
apps/local-core/src/skill-package-service.ts
```

current canonical：

```text
list
create
update
version bump
rename
install
disable
composition
subskills
dependency resolution
provenance
```

所以：

```text
Skill Builder
= editor of canonical Skill
```

不是第二Skill store。

---

## Candidate web typed client

```text
apps/web-gen2/src/backend/skills.ts
```

职责：

```text
list/read/create/update/version/install/enable-disable
```

以 current routes为准。

不存业务状态。

---

## Skill Body Donors

```text
react-arborist candidate
→ Outline

Mind Elixir stable candidate
→ mind map

LibTV MIT
→ direct reusable Skill package donor where exact fit
```

Mindmap必须是 interaction island。

---

## Skill Use

T4只展示：

```text
available
selected
durably-used
version-compatible
missing/incompatible
```

canonical capability-use relation由 T6 command返回。

---

# 6C · Run Review

T4不拥有 Run engine。

需要 typed body seam提供：

```text
Run state
RunEvent sequence
waiting input
Result
ArtifactReturn
Review
Retry
```

当前 Phase A 已登记：

```text
createLcosHostRuntime.ts
DOCK_GAP_REGISTRY:
run → coreContract 'runs'
```

C1-6需重新 exact-read current run routes/contracts并锁客户端文件。

C1-0 不提前虚构 route。

---

## T5 Run states

```text
RUNNING
WAITING_INPUT
RESULT_READY
REVIEW_REQUIRED
ACCEPTED
REJECTED
RETRYING_AS_NEW_RUN
FAILED
```

Retry：

```text
new Run
```

不是 mutate old Run。

---

## 6D Tests

### Workflow

```text
typed composition read/adopt
no clone source
multipart import works
blob export works
```

### Skill

```text
canonical edit
version conflict
composition validate
reopen persists
```

### Run

```text
sequence polling monotonic
waiting input
ArtifactReturn accept/reject/retry
```

---

## 6E Browser Acceptance

```text
Workflow
→ open round detail
→ open Run Review
→ close Run Review
Workflow remains

Skill Builder
→ edit
→ version
→ close
→ reopen
same Skill

Workflow durable Skill use
→ reload
→ same skillId/version relation
```

---

## 6F Recovery

Workflow/Skill/Run body失败：

```text
presentation can remount from canonical truth
```

不得：

```text
store unique truth only in local component
```

---

## 6G Blast Radius

允许：

```text
typed clients
professional bodies
window adapters
```

禁止：

```text
Workflow composition schema ownership
Skill package schema
Run engine
Run retry truth
```

---

# 7. Cross-Seam Shared Constraints

所有 T4 seam共同遵守：

## 7.1 No second truth

```text
UI presentation state
≠ canonical truth
```

## 7.2 No second spatial engine

```text
Huabu
= sole spatial body
```

## 7.3 No second window system per tool

```text
Assembly
Context
Workflow
Skill
Run
Conversation Preview
Archive
```

都吃同一 Professional Window layer。

## 7.4 No donor-owned semantics

Donor只供应：

```text
mechanics
body
motion
layout primitive
```

## 7.5 Fail-close

Core command不存在/不支持：

```text
UI不得fake success
```

---

# 8. T4 → T5 Engineering Seams

这一节可直接摘给 T5。

| Feature | Canonical owner | Current/Target render host | Real states T5 can design | Screen occupancy | Donor / primitive | T5 不应画出的内部东西 |
|---|---|---|---|---|---|---|
| Professional Window | T4 presentation | shared ProfessionalWindowStage | float/dock/split/resize/active/close/restore | edge + floating | Dockview candidate | Core truth / Worksite identity |
| Protected Canvas | Huabu/T1 spatial | same stage protected body | stable / surface switching | remaining central region | Huabu Canvas | normal tab / close button |
| Assembly | Core source owners + T4 body | professional region | source tabs, target, drag, applied/partial/error | variable | Lovart body + LCOS Apply | membership tables / scope taxonomy |
| Context Atlas | derived Context + T4 entry | Context Surface / detail window | region rest/hover/focus/temp-detail | Surface / professional region | Astra + Spatial | artificial Context membership |
| Evolution | Context history + T4 body | professional region | range/compare/selection | dock/float | 2D timeline candidate | 3D history city |
| Relationship | Core relation + T4 body | professional region | selected/neighbors/focus | dock/float | Cytoscape candidate | second relation truth |
| Workflow | T6 composition + T4 body | Workflow Surface + detail windows | material/action/result/review | Surface + windows | LCOS + donor body | DAG/tool-call main canvas |
| Skill Builder | SkillPackage Core + T4 body | professional region | outline/map/version/proposal | dock/float | Arborist/MindElixir/LibTV | Run diagnostics as main Skill body |
| Run Review | Run Core + T4 body | professional region | running/waiting/result/review/retry | dock/float | native/virtualized body | provider logs in main Workflow |
| Archive | T6 lifecycle + T4 body | professional region | cold/date/select/restore | dock/float | Lovart + Virtuoso | old x/y / second warehouse |
| Conversation Preview | Conversation truth + T4 body | professional region | preview/open/active/closed | dock/float | PreviewWorkspace reuse | child Worksite state |
| Conversation Child Canvas | T6/T2/T1 | Huabu nested Worksite | worksite states from other seams | central spatial | Huabu | Professional Window chrome |

---

# 9. C1-0 Exact-File Action Summary

## KEEP

```text
apps/web-gen2/src/host/createLcosHostRuntime.ts
apps/web-gen2/src/spatial/surfacePort.ts
apps/web-gen2/src/backend/projects.ts
apps/web-gen2/src/backend/client.ts
packages/contracts/src/assembly.ts
apps/local-core/src/assembly-apply-service.ts
apps/local-core/src/context-snapshot-service.ts
apps/local-core/src/skill-package-service.ts
huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspace.tsx
```

KEEP表示：

```text
保留owner/成熟mechanic
```

不表示完全零修改。

---

## LIFT

```text
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
```

其中：

```text
runtime/seam lifecycle
```

上移到 Project session。

---

## MODIFY

```text
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
huabu/apps/web/src/lcos/LcosHostOverlay.tsx
apps/web-gen2/src/interaction/overlayArbitration.ts
apps/web-gen2/src/backend/client.ts
apps/web-gen2/src/backend/projects.ts
```

---

## RETIRE / MIGRATE

```text
CenterArea PROJECT_ID production selector
disposable-mvp-sample normal fallback

MainLayout sole rightPanel as universal professional owner
Preview fullscreen unmount-Canvas mechanism as universal immersive mechanic

OverlayInput.workViewOpen:boolean as complete Work View state
visibleOverlays(workViewOpen) exclusive-single-workview rule

ContextSnapshot.branch combined collection-scope/view/x-y product mutation

Workflow scopeId product ontology
Assembly scope compatibility product ontology
```

---

## Candidate ADD — to be locked in C1-1...C1-6

```text
huabu/apps/web/src/lcos/session/LcosProjectSessionProvider.tsx

huabu/apps/web/src/lcos/professional/...
  ProfessionalWindowStage
  ProfessionalRegionHost
  ProtectedSpatialCanvas
  ProfessionalWindowEnvironment

apps/web-gen2/src/backend/assembly.ts
apps/web-gen2/src/backend/context.ts
apps/web-gen2/src/backend/workflow.ts
apps/web-gen2/src/backend/skills.ts
apps/web-gen2/src/backend/runs.ts
```

这些是：

```text
candidate exact paths
```

不是现在就授权批量建文件。

后续每个 C1 卡必须先重读 current tree再锁。

---

# 10. Technical Conflict Gate Result

C1-0 目前没有发现：

```text
Phase B技术不可实现
且无法薄适配
```

当前全部冲突都属于：

```text
legacy owner location
legacy taxonomy
single-panel shell
missing typed frontend adapter
missing professional presentation layer
```

均可通过：

```text
LIFT
WRAP
MIGRATE
RETIRE
```

处理。

所以：

```text
COORDINATOR ESCALATION:
NONE
```

---

# 11. C1-0 Gate

```text
[PASS] Phase B product decisions unchanged
[PASS] current HEAD reverified
[PASS] ProjectSession current owner found
[PASS] SurfaceRegistry current owner found
[PASS] MainLayout old single-right-panel constraint found
[PASS] overlay old single-workview constraint found
[PASS] PreviewWorkspace reusable body found
[PASS] Assembly canonical apply owner found
[PASS] Context legacy branch debt found
[PASS] Workflow legacy scope transport identified
[PASS] Skill canonical owner found
[PASS] T5 engineering states produced
[PASS] no technical conflict requiring Coordinator
```

---

# 12. Next

```text
C1-1
ProjectSession + ProfessionalWindowEnvironment
EXACT SOURCE PLAN
```

C1-1 要进一步锁：

```text
Provider exact mount point
Provider exact API
Surface-ready handoff
retarget/reconcile dedupe
ProfessionalWindowEnvironment exact type reuse
legacy activeSpatialViewport donor exact lift
MainLayout migration order
overlayArbitration exact patch
Camera host-level no-compensation seam
tests
browser proof
rollback
```

同时：

```text
T5 可从本 C1-0 开始锁最终 Professional Window / Context / Workflow / Assembly / Skill / Archive视觉方向。
```
