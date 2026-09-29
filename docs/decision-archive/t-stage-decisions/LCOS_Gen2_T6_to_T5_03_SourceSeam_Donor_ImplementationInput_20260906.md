# LCOS Gen2 · T6 → T5
# 03 · Source Seam / Donor Implementation Input
## T5 高保真方案可直接依附的源码边界与回灌要求

**日期：2026-09-06**  
**来源线程：T6**  
**接收线程：T5**  
**源码基线：**
- Gen2 `DZWFLi/LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a`
- Gen1 current `DZWFLi/LCOS-local-creativeOS@f0841587921781bd514edf6acffcbb592e672e52`
- Gen1 R3-A provenance `253e98963d5088de930a21943f8a10a28cc8e2d5`
- Huabu `microsoft/Huabu@a3c411e1f655191344285141f08c4738fa6015f7`

**性质：T5 设计可实现性输入。不是正式 T6 production construction card。**

---

# 0. 为什么 T5 需要知道一点 source seam

T5 不需要读 T6 全部 Core。

但最终视觉不能只在 Figma/截图里成立，落地时却要求：

- 新增第二 geometry truth；
- 给 ProjectionBinding 塞 x/y；
- 用 Scope 模拟 Collection；
- 用 Presentation 保存 canonical membership；
- 为一个动效复制 canonical entity；
- 把 Assembly 变成新 owner。

因此本稿只列：

> **T5 视觉方案必须依附的真实 seam，以及哪些成熟代码应该复用。**

---

# 1. Canonical Project Runtime Seam

当前 downstream runtime seam 基本正确：

```text
apps/web-gen2/src/host/createLcosHostRuntime.ts
```

它已经支持：

```text
initialProjectId
retarget(...)
dispose()
```

T5 不需要为“切项目/切现场”设计另一套 app runtime。

当前 source debt 是 upstream ProjectId 仍存在 sample/env fallback：

```text
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx
huabu/apps/web/src/lcos/lcosHost.ts
```

T5 只需注意：

> 所有最终视觉状态应假设同一个 canonical ProjectId 驱动整个 Surface，不设计跨项目混合 truth。

---

# 2. ProjectionBinding Seam

### Current files

```text
apps/web-gen2/src/spatial/projectionBinding.ts
apps/local-core/src/metadata-repository.ts
```

当前 key：

```text
(project_id, canvas_id, spatial_kind, entity_type, entity_id)
```

这是应该保留的 identity bridge。

### T5 可以依赖

```text
same entity
same canvas
same spatial kind
→ one authoritative projection
```

### T5 不应要求

```text
instanceId for ordinary duplicate body
geometry persisted in ProjectionBinding
multiple authoritative same-canvas bodies
```

第二视觉出现应优先：

```text
Reference / Proxy / derived preview
```

---

# 3. Huabu = Geometry / Spatial Mechanics Owner

T6 与 66/Phase B 后共同边界：

```text
LCOS canonical semantics
→ thin host / adapter
→ Huabu mature spatial mechanics
```

T5 最终视觉如果涉及：

```text
position
size
camera
frame body
layout
reflow
contour
spatial history
cross-space move
```

应优先建立在 Huabu/T1 seam 上。

不要设计一个必须由 Core 新增：

```text
LCOSGeometryStoreV2
```

才能成立的 body。

---

# 4. Reconciliation Seam

Current file：

```text
apps/web-gen2/src/spatial/reconciliationRunner.ts
```

当前已知 source reality：

```text
getProjectGraph(projectId)
→ graph.artifacts
→ projectArtifacts
```

现状会偏向“artifact exists → should project”。

Phase B 后 target 需要增加：

```text
canonical lifecycle
→ projection eligibility
→ reconciliation source census
→ projection
```

### 给 T5 的意义

最终视觉必须允许：

- object canonical 仍存在但当前 surface 无 projection；
- archived object 被 reconcile 移出 Main；
- restore 后重新生成 body；
- body 位置由 fresh Huabu layout 决定。

不要把“body 消失”设计成 canonical deletion 的唯一反馈。

---

# 5. Archive / Restore Seam

T6 target chain：

```text
Core canonical lifecycle
→ ProjectEvent
→ projection eligibility
→ reconcile
→ Huabu projection remove/create
```

### T5 应基于的状态

```text
ACTIVE
ARCHIVED_READ_ONLY
ARCHIVED_REFERENCE
RESTORED_PENDING_PROJECTION
ACTIVE_FRESH_PROJECTION
```

而不是只有：

```text
VISIBLE / DELETED
```

---

# 6. Presentation Geometry Retirement

Current source 仍有历史 geometry second-truth：

```text
Presentation positions
bounds
workflow layout state
Colony contour.points
spatialRegions.bounds
surfaceElements.bounds
```

以及 Core/legacy 中：

```text
ArtifactView position/size
Workspace viewport
ResultSlot x/y/width/height
```

T6 目标：

```text
semantic state        KEEP
legacy geometry       COMPAT_READ
new geometry writes   RETIRE_WRITE
authoritative geometry → Huabu
```

### T5 必须注意

视觉稿不能继续把这些 legacy fields 当未来能力设计依据。

如果某种高保真效果需要 geometry：

```text
优先要求 T1/Huabu 提供 spatial primitive
```

而不是要求 T6 保留 second truth。

---

# 7. Collection Seam

Current legacy encodings：

```text
ScopeKind includes collection
ArtifactView.scopeId
Presentation member refs
Assembly context/workflow/collection→scope mapping
```

这些是 migration input。

Phase B target：

```text
durable canonical membership
independent from projection / presentation
```

### 给 T5

Collection final body 可以大胆采用成熟：

```text
Frame
Stack
Grid
Masonry
fan-out
collapse/expand
```

但这些全部是 visual/spatial presentation。

T5 不需要决定 membership persistence。

---

# 8. Workflow Seam

Current source 仍混：

```text
Scope(kind=workflow)
Presentation workflowActions / edges
workflow export/import via scopeId
```

Phase B target 是：

```text
canonical Workflow identity
+
durable typed composition
```

### 给 T5

请把最终 Workflow body 拆成：

```text
semantic composition state
visual layout state
```

两个层次。

T5 可以设计强烈的 direct manipulation，但不能让“拖到某坐标”天然成为 composition contract。

---

# 9. Worksite / Workspace Slim Seam

Current source 存在：

```text
Workspace identity
workspace_memberships
workspace_entity_memberships
Core viewport/focus/spatial state
```

T6 target：

```text
slim existing Workspace identity
→ Worksite semantics

typed durable working-set
→ keep/migrate existing persistence

camera/viewport/geometry
→ Huabu
```

### 给 T5

Worksite final design应依赖：

```text
stable identity
stable canvasId
durable working-set
parent/origin relation
lifecycle
```

不依赖：

```text
Core-owned camera
Core-owned frame geometry
Scope path
```

---

# 10. ProjectEvent / Recovery Seam

Core 已有：

```text
apps/local-core/src/project-events/project-event-hub.ts
apps/local-core/src/routes/project-events.ts
```

能力包括：

```text
runtimeId
projectSeq
replay
snapshot_required
subscribe
heartbeat
```

历史 donor 中 TapNow 的价值主要也是：

```text
cursor
pending
reconnect
recovery pattern
```

但 LCOS 不新造第二 EventBus。

### 给 T5

T5 只需设计：

```text
non-destructive reconnect
stale/recovered transition
minimal visual reconciliation
```

不需要设计“全页面 reload”作为正常恢复体验。

---

# 11. Huabu RFS Live Sync 已是 Current Wired

历史 0903 审计曾把：

```text
RFS backend write
→ open Canvas needs manual refresh
```

列为缺口。

Current HEAD 已形成主链：

```text
RFS POST /execute
→ executeRfsCommands()
→ executeCanvasCommandsOnHost()
→ executeOnServer()
→ persistence
→ publishCanvasUpdate()
→ /sync/stream
→ canvasSyncStore
→ CanvasPage connect()
```

因此 T5 不应再按“后台变更只有刷新页面后出现”来设计。

可以直接假设：

> out-of-band spatial changes 能进入 live canvas sync。

---

# 12. Assembly Seam

Current useful files：

```text
packages/contracts/src/assembly.ts
apps/local-core/src/assembly-apply-service.ts
apps/local-core/src/routes/f6-assembly.ts
```

正确方向：

```text
Assembly
= typed source/target router
```

不是新的 canonical owner。

Phase B 要把旧：

```text
context/workflow/collection → scope
```

降成：

```text
LEGACY_COMPAT
```

### 给 T5

Assembly UI 可以非常强，但最终所有 Apply 状态都应能映射回：

```text
Collection membership command
Workflow composition/adoption command
Worksite working-set command
Conversation/context command
spatial placement command
```

而不是一个神秘 `AssemblyOwnsEverything()`。

---

# 13. ResultSlot Seam

Existing source：

```text
apps/local-core/src/result-slot-service.ts
apps/local-core/src/runtime-review-service.ts
apps/local-core/src/runtime-result-ingestion.ts
apps/local-core/src/routes/runs.ts
apps/local-core/src/runtime-application-service.ts
```

已有 lifecycle：

```text
create
claim
review
materialize
release/remove
slotForRun
```

T6 当前判断：

```text
KEEP lifecycle
WIRE missing create/review hooks
MIGRATE slot geometry → Huabu
```

### 给 T5

ResultSlot 可以继续是明确的 workflow/execution staging visual。

但其 x/y/size 不应成为 Core canonical truth。

---

# 14. Donor Adoption Boundary

T6 对 donor 的原则：

```text
LCOS canonical owner
→ thin port / adapter
→ replaceable supplier
```

## Huabu
优先 LIFT / ADOPT：

- spatial primitives；
- write coordination；
- cross-space mechanics；
- layout；
- storage/spatial integration。

## TapNow
只借：

- reconnect；
- cursor；
- pending；
- queue/recovery pattern。

不复制它的 proprietary state owner。

## Lovart
借：

- Thread / History / Memory / Skill / Asset / Web Search 的责任拆分；
- 高保真 Workbench 组织逻辑。

不造 Mega Context Service。

## Spatial
借：

```text
canonical DB
vs
rebuildable derived index
```

的架构边界。

## LibTV
放在 runtime adapter 后。

不把 supplier session 当 LCOS canonical Run。

---

# 15. T5 可安全“直接拿来用”的视觉层

只要与 T1/T2/T3/T4 owner 不冲突，T5 可以大胆复用成熟 donor 的：

```text
Frame / Panel body
Masonry
Stack
Strip
Grid
popover
transient menu
selection treatment
preview body
dock treatment
professional workbench layout
micro-motion
hover/active transitions
read-only visual grammar
LOD body variants
```

因为这些是 presentation mechanics。

但若 donor 代码自带：

```text
membership store
entity store
workflow truth
project DB
geometry second truth
```

必须拆掉/包住，只取 visual primitive。

---

# 16. T5 最终方案必须回灌给 T6 的信息

T5 完成高保真后，请对涉及 T6 truth 的 component/state 返回：

```text
1. State name
2. Canonical meaning
3. Visual body
4. Authoritative vs derived
5. Read-only behavior
6. Projection presence rule
7. LOD variants
8. Enter/exit transition
9. Donor/source component
10. Required source seam
11. Does it require new canonical state? YES/NO
12. Conflict note
```

---

# 17. T6 接收 T5 回灌后的动作

T6 只做：

```text
将 visual state 映射回现有/目标 canonical contract
确认无需 second truth
补 exact consumer
补 migration / retirement
补 test
补 browser/restart/reconnect acceptance
```

T6 不会因为 T5 视觉漂亮就扩权做新的 product semantic。

---

# 18. 对 T5 的 source-level 禁区

最终 visual patch 不应要求：

```text
[ ] Scope 重新成为 durable universal container
[ ] Presentation 保存 canonical Collection membership
[ ] ProjectionBinding 保存 geometry
[ ] same canvas 为同 entity 增加 ordinary instanceId
[ ] Archive 保存旧 x/y 供 restore
[ ] Worksite 自动 materialize
[ ] Assembly 成为 membership/relation owner
[ ] 新建第二 ProjectEvent/EventBus
[ ] 新建第二 canonical DB
[ ] 新建第二 spatial runtime
[ ] ResultSlot 保留 Core geometry truth
[ ] donor supplier session 变成 LCOS canonical identity
```

---

# 19. 最终联合施工的接口

三份 T6→T5 文档的关系：

```text
01 Stable Truth / State Boundary
    ↓
02 Visual State / Interaction Constraint Matrix
    ↓
03 Source Seam / Donor Implementation Input
    ↓
T5 Final Visual Design
    ↓
T5 visual patch / state return
    ↓
T1/T2/T3/T4/T6 final exact-source construction cards
```

这才是当前阶段要走的路径。

不是继续无限考古，也不是现在直接 patch production。
