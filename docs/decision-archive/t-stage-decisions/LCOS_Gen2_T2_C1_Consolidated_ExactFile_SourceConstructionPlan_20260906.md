# LCOS Gen2 · T2 Phase C1
# Consolidated Exact-File Source Construction Plan

日期：2026-09-06  
状态：`T2 C1 CONSOLIDATED · ENGINEERING READY · NO PRODUCTION PATCH YET`

代码审计基线：

- LCOS Gen2: `DZWFLi/LCOS_Gen2 @ c2ff890a867922a1256572199458438572eb0a8c`
- Gen1 LCOS donor: `DZWFLi/LCOS-local-creativeOS @ 3e99769`
- Huabu vendored pin: `microsoft/Huabu @ 58339e269b784728d67730c70bfe7792cae2457d`
- Huabu upstream latest audited head: `a3c411e1f655191344285141f08c4738fa6015f7`
- upstream vs vendored pin at audit time: `ahead 24 / behind 0`

> 本稿是 T2 C1 四个 checkpoint 的正式合并正本。
>
> 它不重新裁决产品语义，不替 T3/T4/T6 决定 canonical owner。
> 它把 T2 的 12 个 seam 统一成：
>
> - exact current file；
> - exact owner；
> - exact consumer；
> - planned thin file；
> - migration / retirement；
> - dependency gates；
> - source edit order；
> - test / browser / recovery；
> - blast radius。
>
> T5 最终视觉回填前，本稿不锁最终 CSS/body/icon/motion。

---

# 0. Authority

当前 authority：

```text
用户最新明确指令
↓
Phase B 四路合并最终跨线程裁决
↓
最终产品冻结 V2
↓
统一语义考古 / 职责分工
↓
T2 历史考古 + current source audit
↓
T2 C1 四个 engineering checkpoints
↓
Donor visual / implementation evidence
```

Phase B 已关闭的问题禁止重新 OPEN。

---

# 1. 四个 checkpoint 证据总账

| `LCOS_Gen2_T2_C1_EngineeringSeam_SourceSkeleton_v1_S01-S03_20260906.md` | 39,945 B | `f658493f409b` |
| `LCOS_Gen2_T2_C1_EngineeringSeam_SourceSkeleton_v1_S04-S06_20260906.md` | 43,143 B | `9bd2013d6b99` |
| `LCOS_Gen2_T2_C1_EngineeringSeam_SourceSkeleton_v1_S07-S09_20260906.md` | 40,272 B | `f092490ae649` |
| `LCOS_Gen2_T2_C1_EngineeringSeam_SourceSkeleton_v1_S10-S12_20260906.md` | 34,312 B | `4103d33d64a9` |

覆盖：

```text
Checkpoint 01
S01 SurfaceDock
S02 Railway
S03 Worksite Enter / Back

Checkpoint 02
S04 Project Search
S05 Focus / Where
S06 Color Pin

Checkpoint 03
S07 Locator / Camera / Arrival
S08 Minimap / Spatial Navigator
S09 Professional Window Occupancy Consumer

Checkpoint 04
S10 Railway Receive Map
S11 Receiver
S12 Navigation More
```

---

# 2. Current production composition root

正式施工不得另起第二 runtime。

真实 production chain：

```text
huabu/apps/web/src/App.tsx
  /canvas/:canvasId
        ↓
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
        ↓
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
        ↓
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
        ↓
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
        ↓
huabu/apps/web/src/lcos/lcosHost.ts
        ↓
apps/web-gen2/src/host/createLcosHostRuntime.ts
        ↓
apps/web-gen2/src/host/hostSeam.ts
        ↓
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
        ↓
huabu/apps/web/src/lcos-seam/types.ts
        ↓
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

施工纪律：

```text
ONE project-session LCOS runtime
ONE Huabu Canvas spatial truth
ONE LCOS host seam
ONE canonical Core truth per feature
```

禁止：

```text
NavigationManager mega owner
RailwayStore
SurfaceStore
WorksiteStore
second CameraStore
second Minimap engine
second Search index
second Menu framework
second Drop machine
```

---

# 3. 12 seam 总览

| Seam | Product role | Canonical / mechanic owner | T2 source role |
|---|---|---|---|
| S01 SurfaceDock | Main/Context/Workflow primary switch | `surfacePort.ts` + Huabu router/canvasStore | compact primary presenter + route action |
| S02 Railway | structural nav/destination skeleton | Core rail order + T6 Worksite/Receiver | presenter, reorder UX, preview, destination body |
| S03 Worksite Enter/Back | enter recoverable long-term scene | T6 Worksite + Huabu canvas | session navigation + route + Arrival handoff |
| S04 Project Search | project-wide discovery | Core ProjectSearchService | search HUD + hotkey arbitration |
| S05 Focus/Where | known object occurrence navigator | Core navigation resolution + Huabu geometry | occurrence HUD + Locate/Enter dispatch |
| S06 Color Pin | durable many-to-many nav grouping | Core ColorPin | Pin presentation + navigation |
| S07 Locator/Arrival | offscreen direction + explicit locate feedback | Huabu geometry/camera | screen projection, camera plan, arrival |
| S08 Spatial Navigator | current-space overview/viewport controls | Huabu/ReactFlow | host chrome integration + minimap body |
| S09 Occupancy | Work View screen-space avoidance | T4 occupancy | safeRect consumer + camera policy |
| S10 Receive Map | Rail as drag destination map | T3 drop + T6 semantic transaction + Huabu transfer | eligible target presentation |
| S11 Receiver | current conversation receiver identity | Core Receiver | Rail bottom presence/status |
| S12 More | low-frequency nav management | feature owners | menu presentation / callback routing |

---

# 4. Current exact files: KEEP

## 4.1 LCOS web-gen2

```text
apps/web-gen2/src/spatial/surfacePort.ts
apps/web-gen2/src/spatial/projectionBinding.ts

apps/web-gen2/src/host/createLcosHostRuntime.ts
apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx

apps/web-gen2/src/backend/client.ts
apps/web-gen2/src/backend/projects.ts
apps/web-gen2/src/backend/search.ts

apps/web-gen2/src/interaction/semanticDropMachine.ts
apps/web-gen2/src/interaction/overlayArbitration.ts
```

## 4.2 Local Core

```text
apps/local-core/src/project-search-service.ts
apps/local-core/src/navigation-marker-service.ts
apps/local-core/src/receiver-runtime-service.ts
apps/local-core/src/workspace-state-service.ts

apps/local-core/src/routes/projects.ts
apps/local-core/src/routes/workspace-states.ts
apps/local-core/src/routes/curation.ts
apps/local-core/src/routes/navigation-markers.ts
apps/local-core/src/routes/color-pins.ts
apps/local-core/src/routes/receiver.ts
apps/local-core/src/routes/project-events.ts

apps/local-core/src/project-events/project-event-hub.ts
apps/local-core/src/mutation-safety-service.ts
apps/local-core/src/metadata-repository.ts
```

## 4.3 Contracts / Domain

```text
packages/contracts/src/index.ts
packages/contracts/src/navigation-marker.ts
packages/contracts/src/color-pin.ts
packages/contracts/src/receiver.ts
packages/contracts/src/conversation-identity.ts

packages/domain/src/index.ts
```

## 4.4 Huabu construction host

```text
huabu/apps/web/src/App.tsx

huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx

huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
huabu/apps/web/src/components/Panels/Canvas/CanvasToolbar.tsx
huabu/apps/web/src/components/Panels/CanvasLayerPanel/CanvasSearchInput.tsx
huabu/apps/web/src/components/Panels/CanvasLayerPanel/CanvasSearchResults.tsx
huabu/apps/web/src/components/Panels/CanvasLayerPanel/focusNodesOnCanvas.ts

huabu/apps/web/src/components/Common/DropdownMenu.tsx
huabu/apps/web/src/components/Common/Popover.tsx
huabu/apps/web/src/components/Common/Button.tsx

huabu/apps/web/src/store/canvasStore.ts
huabu/apps/web/src/store/canvasSyncStore.ts

huabu/apps/web/src/lcos-seam/types.ts
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
huabu/apps/web/src/lcos/lcosHost.ts
huabu/apps/web/src/lcos/LcosHostOverlay.tsx
huabu/apps/web/src/lcos/lcosDropState.ts
huabu/apps/web/src/lcos/lcosRecognizers.ts
```

---

# 5. Planned new thin files

这些文件不是第二 owner。
它们必须保持 typed client / pure presenter / thin adapter。

## 5.1 web-gen2 backend

```text
apps/web-gen2/src/backend/railway.ts
apps/web-gen2/src/backend/navigation.ts
apps/web-gen2/src/backend/colorPins.ts
apps/web-gen2/src/backend/projectEvents.ts
apps/web-gen2/src/backend/receiver.ts
```

禁止持久 state/cache truth。

---

## 5.2 web-gen2 pure presentation / geometry

```text
apps/web-gen2/src/presentation/railway.ts
apps/web-gen2/src/presentation/railwayReceive.ts
apps/web-gen2/src/presentation/projectSearch.ts
apps/web-gen2/src/presentation/focusOccurrences.ts
apps/web-gen2/src/presentation/colorPins.ts
apps/web-gen2/src/presentation/receiver.ts
apps/web-gen2/src/presentation/arrival.ts

apps/web-gen2/src/spatial/worksiteNavigation.ts
apps/web-gen2/src/spatial/navigationProjection.ts
apps/web-gen2/src/spatial/cameraFraming.ts
apps/web-gen2/src/spatial/locatorGeometry.ts
apps/web-gen2/src/spatial/safeRegion.ts

apps/web-gen2/src/interaction/locatorState.ts
apps/web-gen2/src/interaction/navigationHud.ts
```

要求：

```text
React-free where possible
pure function first
no DOM reads
no persistence
no canonical writes
```

---

## 5.3 Huabu LCOS host presentation

```text
huabu/apps/web/src/lcos/navigationUiStore.ts
huabu/apps/web/src/lcos/useLcosNavigation.ts
huabu/apps/web/src/lcos/useLcosRailway.ts
huabu/apps/web/src/lcos/useLcosProjectSearch.ts
huabu/apps/web/src/lcos/useLcosFocus.ts
huabu/apps/web/src/lcos/useLcosColorPins.ts
huabu/apps/web/src/lcos/useLcosLocator.ts
huabu/apps/web/src/lcos/useLcosSpatialOccupancy.ts
huabu/apps/web/src/lcos/useLcosReceiver.ts

huabu/apps/web/src/lcos/navigationCamera.ts
huabu/apps/web/src/lcos/arrivalState.ts

huabu/apps/web/src/lcos/ui/SurfaceDock.tsx
huabu/apps/web/src/lcos/ui/Railway.tsx
huabu/apps/web/src/lcos/ui/LcosNavigationHud.tsx
huabu/apps/web/src/lcos/ui/LcosLocatorOverlay.tsx
huabu/apps/web/src/lcos/ui/LcosSpatialNavigator.tsx
```

可选，只有现有 `NodeToolbar` 无法支持 compact variant 时才新建：

```text
huabu/apps/web/src/lcos/ui/LcosCanvasToolsLauncher.tsx
```

可选，只有 Railway More 复杂度足够时才拆：

```text
huabu/apps/web/src/lcos/ui/RailwayItemMore.tsx
```

---

# 6. Current files requiring modification

## 6.1 Huabu neutral host contract

```text
huabu/apps/web/src/lcos-seam/types.ts
```

增加 neutral host policies：

```ts
chromePolicy?: {
  viewportControls?: 'native' | 'host'
  minimap?: 'native' | 'host'
  primaryToolbar?: 'native' | 'host'
}

viewportPolicy?: {
  resizeBehavior?: 'preserve-center' | 'preserve-transform'
}
```

absent/default：

```text
stock Huabu
```

LCOS：

```text
host chrome
preserve-transform on wrapper resize
```

---

## 6.2 Adapter structural parity

```text
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
```

mirror new neutral host extension fields。

不添加 LCOS business semantics。

---

## 6.3 LCOS host policy installation

```text
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
```

继续：

```text
one runtime
retarget(canvasId)
reconcile(project-open)
```

并给 LCOS Canvas host加：

```text
chromePolicy
viewportPolicy
```

不要把这些塞入 Core/HostSeam semantic owner。

---

## 6.4 Huabu Canvas host behavior

```text
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

修改：

1. stock Controls 按 `chromePolicy.viewportControls` gate；
2. stock MiniMap 按 `chromePolicy.minimap` gate；
3. bottom-center NodeToolbar 按 `chromePolicy.primaryToolbar` gate；
4. ResizeObserver camera compensation 按 `viewportPolicy.resizeBehavior` gate；
5. generic default 100%保持现状。

---

## 6.5 CanvasPage shell mount

```text
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
```

MainLayout：

```text
persistent Railway shell slot
```

CenterArea：

```text
SurfaceDock
Canvas
```

Railway不能塞 LayerPanel。

---

## 6.6 Global Search hotkey

```text
huabu/apps/web/src/hooks/useGlobalSearchHotkey.ts
```

新仲裁：

```text
node Preview scope + Cmd/Ctrl+F
→ preview local find

ordinary LCOS canvas + Cmd/Ctrl+F
→ Project Search
```

Canvas-local Search继续保留显式 LayerPanel Search入口。

---

## 6.7 LCOS Overlay

```text
huabu/apps/web/src/lcos/LcosHostOverlay.tsx
apps/web-gen2/src/interaction/overlayArbitration.ts
```

一个 shared top:

```text
navigation-hud
```

内部：

```text
Search > Focus > Pin > none
```

Locator是 canvas adornment，不抢 top HUD。

---

# 7. Cross-owner exact migration points

这些不是 T2 产品 OPEN。

## 7.1 T6 Worksite

Current old files：

```text
packages/domain/src/index.ts
apps/local-core/src/workspace-state-service.ts
apps/local-core/src/routes/workspace-states.ts
apps/local-core/src/routes/projects.ts
packages/contracts/src/index.ts
```

Phase B要求：

```text
old Workspace identity
→ slim Worksite
```

必须拆走：

```text
viewport
frameBounds
focusedViewIds
visibleLayers
old Scope navigation ownership
```

Huabu负责 spatial state。

T2需要 T6 export：

```text
Worksite identity
stable canvasId
surface/home ref
lifecycle
working-set refs
active Worksite session read
rename/archive/materialize actions
```

---

## 7.2 T6 Rail ontology

current：

```ts
ProjectViewRailKindV0 =
  scene|collection|context|workflow
```

current route GET：

```text
getWorkspaces + getScopes
```

新：

```text
surface
worksite
receiver/conversation
legacy
```

机制 KEEP：

```text
CAS/order/restart/dedupe
```

---

## 7.3 T4 occupancy

Current HEAD未找到：

```text
safeRect
occupiedRects
safeInsets
activeRegions
```

T2禁止 DOM fallback。

需要 T4 C1 export：

```text
viewportRect
occupiedRects
safeRect
activeRegions?
revision
```

exact T4 file/path由 T4 seam决定。

T2 exact consumer：

```text
huabu/apps/web/src/lcos/useLcosSpatialOccupancy.ts
apps/web-gen2/src/spatial/safeRegion.ts
```

---

## 7.4 T3 drop transaction

current：

```text
semanticDropMachine.ts
lcosDropState.ts
lcosRecognizers.ts
```

Phase A只有 generic：

```text
surface:left-dock
surface:bottom-dock
```

需要 T3 C1 允许 exact typed Railway destination。

T2只提供：

```text
Railway destination VM
hit target
eligible/hot presentation
```

---

# 8. Huabu upstream selective adoption

当前 vendored pin：

`58339e2`

当前 audited upstream：

`a3c411e`

差：

```text
24 commits ahead
0 behind
```

重要新 primitive：

```text
packages/shared/src/types/api/space-move.ts
apps/server/src/modules/canvas/space-move-plan.ts
apps/server/src/modules/canvas/space-move.service.ts
apps/server/src/modules/canvas/canvas.route.ts
apps/server/src/modules/canvas/write-coordinator.ts
apps/web/src/api/canvas.ts
```

### ADOPT

atomic physical transfer machinery when LCOS semantic transaction真的需要“move between canvases”。

### REJECT as primary LCOS UX

```text
apps/web/src/components/Panels/Canvas/MoveSelectionModal.tsx
```

Railway destination已经表达目标，不再弹 chooser。

### Do not equate

```text
LCOS semantic drop
≠ Huabu physical move-selection
```

---

# 9. Donor source adoption map

## Gen1 LCOS

### LIFT

SurfaceDock：
- bottom-center Main/Context/Workflow mental model；
- primary surface priority。

Railway：
- true member mini-layout；
- truthful no-geometry fallback；
- +N；
- Hover preview；
- reorder interaction；
- direct destination behavior。

CanvasMiniMap：
- Minimap + Zoom/Fit/reset grouping；
- click map；
- drag viewport；
- collapsed/expanded；
- safe-region-aware navigation concept。

### RETIRE

- Scope tree/breadcrumb navigation truth；
- flat scene/collection/context/workflow ontology；
- old Camera model；
- old DOM safeRect query；
- old Workspace geometry truth。

---

## TapNow

### HIGH-FIDELITY VISUAL/INTERACTION DONOR

Pin：
- six-color palette；
- node-local pin geometry；
- chooser geometry；
- membership motion；
- active filtering；
- ~500ms bounded locate feel。

Minimap：
- 200×150 expanded direct map；
- white viewport border；
- dark map；
- click/drag；
- spring feel。

Search：
- compact search flow；
- keyboard；
- close → locate；
- layered Esc。

No proprietary source copy。

---

## Lovart/tldraw

- low-chrome shell；
- hit area vs visible core；
- minimap launcher/reveal restraint；
- LayerPanel remains NOT Railway。

---

## Spatial

- presented continuity；
- FOCUS/restore visual continuity；
- not navigation feature owner。

---

# 10. Construction order

这是最终 source coding 时应遵循的顺序。

不要“看见一个 UI 就先画”。

## G0 · Rebase / pin / evidence freeze

1. fetch latest LCOS Gen2 HEAD；
2. record SHA；
3. fetch Huabu upstream HEAD；
4. compare with vendored pin；
5. confirm T3/T4/T6 C1 exports；
6. update exact-file plan if files moved only；
7. product semantics不重新讨论。

---

## G1 · Neutral host policy first

Files：

```text
huabu/apps/web/src/lcos-seam/types.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
```

Implement：

```text
chromePolicy
viewportPolicy
```

Tests first：

```text
absent = stock Huabu
host = suppress selected chrome
preserve-transform = resize no camera move
```

这是后续 LCOS Chrome不与 Huabu stock UI重复的基础。

---

## G2 · Pure fabrics / typed reads

web-gen2 first：

```text
backend/railway.ts
backend/navigation.ts
backend/colorPins.ts
backend/projectEvents.ts
backend/receiver.ts

presentation/*.ts
spatial/worksiteNavigation.ts
spatial/navigationProjection.ts
spatial/cameraFraming.ts
spatial/locatorGeometry.ts
spatial/safeRegion.ts
interaction/locatorState.ts
interaction/navigationHud.ts
```

先写纯单测。

此时不要 mount UI。

---

## G3 · T6 compatibility contracts

Before real Railway/Worksite browser path：

```text
Worksite stable canvasId
Rail ontology migration
active Worksite read
Archive/rename/materialize callbacks
Search occurrence migration
```

如果 T6尚未 merge：

可以用 typed fixture contract测试 presenter，
但不能在 production frontend fabricated canonical state。

---

## G4 · Shell mount

Files：

```text
MainLayout.tsx
CenterArea.tsx
lcos/ui/SurfaceDock.tsx
lcos/ui/Railway.tsx
useLcosNavigation.ts
useLcosRailway.ts
```

First visual body只需要：

```text
functional low-fidelity shell
```

T5 final body later。

Browser gate：

```text
three Surface switch
Rail persistent
Worksite enter/back
no duplicate Huabu toolbar
```

---

## G5 · Project Search / Focus / Pin

Mount shared:

```text
navigationUiStore
LcosNavigationHud
useLcosProjectSearch
useLcosFocus
useLcosColorPins
```

Patch:

```text
useGlobalSearchHotkey
LcosHostOverlay
overlayArbitration
```

Browser gate：

```text
Cmd+F
Selection+F
Pin assignment
Search→Focus
Pin→Locate
```

---

## G6 · Camera / Locator / Arrival

Implement：

```text
navigationCamera.ts
useLcosLocator.ts
LcosLocatorOverlay.tsx
arrivalState.ts
```

Require：

```text
reliable Huabu bounds
ProjectionBinding
safeRect adapter
```

If T4 occupancy not yet ready：

test with typed occupancy fixture，
do not ship DOM fallback.

---

## G7 · Spatial Navigator / Canvas tool secondary

Implement：

```text
LcosSpatialNavigator.tsx
```

Use：

```text
ReactFlow MiniMap
Huabu camera
current minimap preference
CanvasZoomLevel mechanics
```

Move primary NodeToolbar placement behind host policy。

Do not duplicate tool actions.

---

## G8 · Railway Receive / Receiver / More

Implement：

```text
railwayReceive presenter
Receiver client/presenter
Railway RECEIVE states
Receiver bottom item
DropdownMenu More
```

Integrate T3 typed drop commit。

Only then selectively adopt upstream Huabu physical move if needed。

---

## G9 · T5 visual patch

T5 returns：

```text
final geometry
materials
tokens
icons
motion
LOD
hover/labels
Arrival style
Rail Peek
Receive morph
Spatial Navigator body
```

Then patch exact JSX/CSS/Tailwind.

No semantic changes at G9.

---

## G10 · Final acceptance / recovery

Run：

```text
unit
contracts
integration
browser
restart
failure injection
upstream regression
```

Only after all pass enter production closeout。

---

# 11. Migration / retirement matrix

| Legacy/current behavior | Action | Replacement |
|---|---|---|
| old Workspace mixed spatial/canonical object | MIGRATE/SLIM | Worksite + Huabu spatial truth |
| Scope.parentScopeId Back | RETIRE | session Back stack |
| flat Rail kinds | RETIRE/MIGRATE | Surface/Worksite/Receiver/legacy |
| Collection auto Rail item | RETIRE | only explicit Worksite |
| Context/Workflow identity auto Worksite | RETIRE | explicit materialization |
| Core Workspace.viewport as Enter camera | RETIRE | Huabu per-canvas viewport |
| Core navigation worldPosition as final geometry | LEGACY_HINT ONLY | ProjectionBinding + Huabu bounds |
| Huabu global Cmd+F Canvas Search | PATCH | Project Search outside Preview |
| Huabu bottom-center NodeToolbar primary | DOWNGRADE | SurfaceDock primary + secondary tools |
| standalone stock Controls in LCOS | HOST OVERRIDE | Spatial Navigator |
| standalone stock MiniMap in LCOS | HOST OVERRIDE | Spatial Navigator |
| resize auto camera compensation in LCOS | HOST OVERRIDE | preserve-transform |
| DOM safeRect | FORBIDDEN | T4 occupancy seam |
| MoveSelectionModal primary path | REJECT | Railway direct destination |
| Pin localStorage truth | FORBIDDEN | Core ColorPin |
| separate Search/Focus/Pin overlay roots | RETIRE/DO NOT BUILD | one Navigation HUD slot |

---

# 12. Test pyramid

## 12.1 Pure unit

Highest count。

Test：

```text
Rail preview geometry
Rail receive eligibility presentation
Worksite stack
Search VM
Focus occurrence VM
Pin grouping
Receiver VM
cameraFraming
locatorGeometry
safeRegion
overlay arbitration
```

No React required where possible。

---

## 12.2 Client contract

Mock HTTP/SSE：

```text
railway
search
navigation
colorPins
projectEvents
receiver
```

Error cases：

```text
400
404
409
503
Abort
stale SSE
snapshot_required
```

---

## 12.3 Huabu host integration

Test：

```text
hostExtension default
chromePolicy
viewportPolicy
LCOS runtime retarget
overlay mount
hotkey arbitration
secondary tools
```

---

## 12.4 Core regression

T6/T3 owners run：

```text
rail order CAS
Worksite migration
navigation occurrences
Color Pin ChangeSet/Undo
Receiver continuity
semantic drop
Archive
```

---

## 12.5 Upstream Huabu regression

Selective move sync必须保留 upstream：

```text
space-move-plan tests
space-move service tests
canvas route tests
artifact rewrite
Agent thread movement
compensation failure tests
```

---

# 13. Browser acceptance master sequence

建议不是零散点 UI，而是按真实旅程：

## Journey A · Navigation

```text
open Project
→ Main
→ Context
→ Workflow
→ back to Main
```

验证 SurfaceDock primary，Rail structural。

---

## Journey B · Worksite

```text
enter Worksite A
→ B
→ C
→ Back B
→ Back A
→ reload
```

reload：

```text
active Worksite recoverable
Back history not resurrected
```

---

## Journey C · Search / Focus

```text
Cmd+F
→ project result
→ 1 location locate

Cmd+F
→ another result
→ many locations
→ Focus choose remote Worksite
→ Enter
→ Locate
→ Arrival
```

---

## Journey D · Pin

```text
select object
→ Arc Pin
→ assign
→ second Pin
→ top Pin group
→ member click
→ safeRect-aware locate
```

---

## Journey E · Offscreen Locator

```text
target far right
→ edge cue
→ click
→ travel
→ Arrival
```

Repeat 8 directions + narrow safeRect。

---

## Journey F · Work View

```text
open right Dock
→ camera unchanged
→ HUD/minimap/locator reflow
→ resize Dock
→ camera unchanged
→ explicit Focus
→ camera fits remaining safeRect
```

---

## Journey G · Spatial Navigator

```text
expand
→ click map
→ drag viewport
→ zoom
→ reset100
→ fit
```

No second coordinate drift。

---

## Journey H · Railway Receive

```text
drag Selection
→ Rail RECEIVE
→ hover Surface root
→ reveal concrete Worksite targets
→ direct drop
→ no chooser modal
```

Test source-stay semantic and physical transfer semantic separately。

---

## Journey I · Receiver

```text
Receiver active
→ event updates working/waiting
→ explicit switch
→ multi-client update
→ disconnect
```

Rail resting body stays lightweight。

---

# 14. Recovery master matrix

## HTTP read failure

```text
keep current canonical-looking stable UI only if known
mark unavailable
retry
no fabricated fallback
```

## canonical write failure

```text
rollback optimistic presentation
never pretend success
```

## camera failure

```text
no Core rollback
current target remains known
retry available
```

## SSE disconnect

```text
reconnect/backoff
snapshot-required → canonical refetch
```

## Worksite missing

```text
navigation rollback
no implicit recreation
```

## target unresolved

```text
unavailable
no heuristic rebinding
```

## archived target

```text
viewer
no Restore
no ghost location
```

## Huabu physical move uncertain

```text
force source+destination reconciliation
do not retry blindly
```

---

# 15. Blast-radius execution strategy

按低风险到高风险：

## BR-0 / BR-1 first

```text
pure presenter
pure geometry
typed clients
menu wrapper
UI state
```

## BR-2 second

```text
Surface route
Search hotkey
Focus navigation
Receiver events
Rail interactions
```

## BR-3 only with T6

```text
Worksite migration
Rail ontology
navigation occurrence compatibility
```

## BR-4 isolated

```text
Huabu chromePolicy
Huabu viewportPolicy
upstream move sync
```

BR-4必须：

```text
default generic behavior unchanged
LCOS host explicit opt-in
```

---

# 16. T2 to T5 boundary

C1已经告诉 T5：

- 哪些 UI真实存在；
- 哪些 state真实能提供；
- 哪些 motion触发点确定；
- 哪些 geometry可算；
- 哪些 host空间会占屏；
- 哪些 controls被降级；
- 哪些 donor有 exact measurements；
- 哪些旧 UI必须退休。

T5仍决定：

```text
final Rail body
SurfaceDock body
Search/Focus/Pin glyph
HUD material
Locator glyph
Arrival body
Minimap shell
Canvas Tools launcher
Receiver body
More menu styling
motion easing/duration fine tuning
LOD
typography
spacing
```

T5不能改变：

```text
owner
canonical writes
camera-on-WorkView rule
Search/Focus/Pin semantics
Rail ontology
Worksite materialization
drop source-stay/move semantic
Archive semantics
```

---

# 17. Implementation dependency ledger

## DEP-T6-01 Worksite contract

Required before G4 Worksite production path。

## DEP-T6-02 Rail ontology

Required before G4 durable Rail write。

## DEP-T6-03 Navigation occurrence / Archive compatibility

Required before full S05 production。

## DEP-T4-01 Occupancy seam

Required before G6/G7 production acceptance。

## DEP-T3-01 Railway typed DropDestination

Required before G8 commit。

## DEP-T3/T6-02 semantic drop transaction result

Required before physical transfer selection。

## DEP-HUABU-01 move-selection selective upstream sync

Only required if LCOS finalized transaction needs actual cross-canvas move。

None of these are product OPEN。

---

# 18. Technical conflict escalation rule

Only escalate if current code proves:

```text
existing owner cannot express Phase B behavior
AND
thin adapter cannot solve
AND
fix crosses owner boundary semantically
```

Current C1 result：

```text
NO SUCH BLOCKER FOUND
```

Known conflicts all have thin path：

```text
Cmd+F
rail ontology
locationRefs cap
resize camera
drop destination resolution
missing frontend receiver/pin clients
```

---

# 19. Final C1 status

```text
Historical archaeology     CLOSED
Product OPEN               CLOSED by Phase B
Donor census               SUFFICIENT
Current-source owner trace COMPLETE FOR T2 C1
S01-S12 seam skeleton      COMPLETE
C1 consolidated plan       COMPLETE
T5 input pack              NEXT/parallel
Production patch           STILL LOCKED
```

下一步：

```text
T2 → T5 engineering visual input
T2 → Coordinator dependency handoff
T5 final visual
↓
T2 exact JSX/CSS/motion patch plan
↓
production coding
```
