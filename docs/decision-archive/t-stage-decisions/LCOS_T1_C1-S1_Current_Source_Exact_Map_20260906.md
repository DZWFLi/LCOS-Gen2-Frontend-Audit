# LCOS Gen2 · T1 Phase C1-S1
## Current Source Exact Map / Evidence Census
### 给 T5 的源码施工前置正本 · 2026-09-06

> 文档性质：T1 Phase C1 正式交付 01 / 03  
> 目标：把「已冻结产品语义」反照到 current Gen2 / vendored Huabu / Gen1 donor 的真实源码状态，明确 CURRENT / PARTIAL / GAP / RETIRE / MIGRATE，给 T5 一个不会被旧模型污染的工程底图。  
> 本文不重新讨论产品概念，不替 T2/T3/T4/T6 裁决职责，也不提前决定最终视觉。

---

# 0. 执行摘要

T1 当前不是“产品没想清楚”，而是进入了典型的 C1 状态：

1. **底层空间 mechanics 大量已经存在于 Huabu**：节点投影、Frame、reparent、drag-stop、snap、geometry、frame fit、structured layout、viewport 等，不需要重造。
2. **LCOS-specific canonical semantics 仍主要在 Gen2 host / Core 边界补薄层**：Collection canonical projection、Core-first semantic drop 后的 spatial manifestation、display-only collapse、ProfessionalWindow occupancy consumer、Colony derive-only presentation、Archive projection lifecycle。
3. **一批旧 Core Presentation / Scope / Colony contour / ArtifactView position 仍然存在，但已不再是产品真相**。这些只能用于迁移和历史理解。
4. **T5 可以开始真正 GUI 规划**。当前未闭项不是产品 OPEN，而是「最终 morphology、motion curve、阈值、glyph、密度」等视觉参数，以及少数由 T2/T3/T4/T6 提供的跨线程 contract。
5. 旧 `Step2A Collection Visible Host` 已降级为 evidence fragment，本稿吸收其有效源码结论，不再作为独立正式交付。

一句话：

> **T1 C1 的任务不是再设计一套画布，而是把 Phase B 已冻结的 LCOS 空间语义，压到 Huabu 已有成熟 primitive 上，只补 LCOS 必需的薄 seam。**

---

# 1. 证据优先级与上下文管理

## 1.1 真相层级

本轮采用以下不可逆优先级：

1. **Phase B 四路合并最终跨线程裁决稿**：产品真相，覆盖此前未关闭 OPEN。
2. **current Gen2 HEAD**：当前实现真相。
3. **vendored Huabu current source**：底层 mechanics 真相。
4. **Gen1 / 9 月 2–3 日审计 / donor 拆包**：迁移、行为、实现参考。
5. **更早对话或旧施工卡**：历史来源，不可反向覆盖 Phase B。

因此，旧文档里只要出现：
- Scope 作为 durable group；
- Collection≈Scope；
- Colony canonical contour points；
- Stack 作为唯一 grouping truth；
- Semantic Drop“源对象永不移动”；
- Work View 打开后其他 HUD 必须全部消失；

都必须先经过 Phase B supersession 过滤，不能直接落进源码计划。

## 1.2 会话阅读状态

- `11`：此前已经完整阅读并用于 Stage A / Phase B / donor 规划，本轮不重复全文消费。
- `112`：本轮只做**目标式恢复**，用于补 Phase C1 交付顺序、旧 2A 状态、T5 交接边界；不进行新的全量考古。
- 原则：只有会改变 T5 视觉输入或 exact owner 的历史细节才继续追读。

这不是降低严谨度，而是防止 Context Recovery 反过来吞掉施工本身。

---

# 2. Repo Source Freeze

## 2.1 Gen1

Repository:

`DZWFLi/LCOS-local-creativeOS`

Baseline:

`f0841587921781bd514edf6acffcbb592e672e52`

角色：

- 历史 LCOS 行为 donor；
- 纯 geometry / transition / presentation 参考；
- 不作为 current canonical owner。

## 2.2 Gen2

Repository:

`DZWFLi/LCOS_Gen2`

Baseline:

`c2ff890a867922a1256572199458438572eb0a8c`

角色：

- 当前 Core / web-gen2 / LCOS host integration 真相；
- 本轮 T1 exact-file 施工主仓。

## 2.3 Huabu

Vendored under Gen2：

`huabu/`

Known upstream reference:

`microsoft/Huabu`
`a3c411e1f655191344285141f08c4738fa6015f7`

角色：

- 节点 / Frame / geometry / drag / snap / camera / layout mechanics 主 donor；
- LCOS 不应复制第二套通用画布 runtime。

---

# 3. Phase B 对 T1 的冻结约束

本稿只列直接影响源码判断的裁决，不再展开产品讨论。

## 3.1 Collection

Collection 是：

- canonical identity；
- 可嵌套；
- durable many-to-many Entity → Collection membership；
- presentation 由 Huabu / T1 承担。

Presentation 可以有：

- collapsed / expanded；
- frame；
- free / grid / stack / masonry 等；
- placement / fanout。

但 presentation 不等于 membership。

## 3.2 Collection Drop

### Left drag → visible expanded host

顺序：

1. 用户以 T3 已裁决 gesture 命中 expanded Collection；
2. canonical membership 先成功；
3. 当前 authoritative projection 保持用户释放位置；
4. T1/Huabu 将当前 projection spatially host 到 Collection Frame；
5. Huabu 可做必要 frame fit / local settle。

### Right drag → Collection

只增加 membership。

不得改变：

- x/y；
- parent；
- camera；
- source projection。

### Collapsed Collection

是 semantic target，不是 visible spatial host。

因此 left-drop：

- membership 可以增加；
- source spatial placement 不移动；
- 不 auto-expand；
- 不 `SET_NODE_PARENT`。

## 3.3 Colony

Colony：

- surface-local presentation semantic；
- membership 可在该 surface 层持久；
- contour 来自 Huabu 当前 member geometry 派生；
- Core 不存 contour points；
- rescope 改 membership，而不是编辑 contour control points。

T1：

- peel threshold；
- settle；
- neck / tether；
- preview；
- derive contour；
- rescope preview。

T6：

- 接受最终 membership commit。

T5：

- morphology；
- material；
- motion；
- feedback。

## 3.4 Same-canvas authoritative projection

同一：

`canonical entity + canvas + spatial kind`

只能有一个 authoritative projection。

额外视觉必须是：

- proxy；
- reference；
- preview；
- mirror；
- derived cue。

当前不引入 `instanceId` 绕过该约束。

## 3.5 Professional Window / Work View

T4 是统一 screen-space occupancy producer。

建议 contract：

`ProfessionalWindowEnvironment`

包含：

- occupiedRects；
- safeRect / safeInsets；
- activeRegions；
- viewportResizePolicy。

T1/T2 只消费。

Work View 打开或 resize：

- 不改变 Camera transform；
- HUD / Pin / Locator / Minimap / Focus / edge interaction 应避让；
- 不得用 DOM query 或硬编码 sidebar width 自己猜窗口占用。

## 3.6 Archive / Restore

Core/T6：

- canonical archive lifecycle owner。

T1：

- eligibility false → remove active projection；
- restore eligibility true → create/reconcile current projection；
- fresh Huabu placement；
- 不恢复旧 x/y。

---

# 4. Current Source Census 总表

| Seam / Area | Current Source | 状态 | 当前判断 | T1 行为 |
|---|---|---:|---|---|
| ProjectionBinding | `apps/web-gen2/src/spatial/projectionBinding.ts` | CURRENT | key 已符合 D12 | KEEP，扩 Collection entity type |
| Core→Huabu projection | `projectToSpaceProjection.ts` | CURRENT/PARTIAL | artifact-centric | MIGRATE，Collection→native Frame |
| Visual family | `presentation/visualFamily.ts` | CURRENT | Collection 不应硬塞 species | KEEP，Collection 走 spatial kind |
| RFS spatial commands | `spatial/types.ts` | CURRENT | 已有 parent/geometry/frame layout | KEEP |
| ProjectionFacade | `host/projectionFacade.ts` | CURRENT/PARTIAL | 缺 canonical Collection client | MIGRATE after T6 |
| Reconciliation | `spatial/reconciliationRunner.ts` | CURRENT/PARTIAL | 目前 artifact/relation | MIGRATE，不能 membership→自动 reparent |
| Native Frame | Huabu `FrameNode.tsx` | CURRENT | free/row/column/grid | REUSE |
| Parent mutation | Huabu `setNodeParent.ts` | CURRENT | cycle/lock/parent mechanics 成熟 | REUSE |
| Absolute-position reparent | Huabu `container/mutation.ts` | CURRENT | move into container 保绝对位置 | REUSE |
| Frame fit | Huabu `frame/projection.ts` + executor | CURRENT | 已有统一 fit / structured relayout | REUSE |
| Drag stop | Huabu `resolveNodeDragStop.ts` | CURRENT | 原生拖拽成熟 | REUSE |
| Reparent bypass | Huabu `snapSession.ts` | CURRENT | 有 bypass machinery | REUSE as thin T3/T1 contract |
| Frame collapse | Huabu Frame | GAP | 未发现 native collapse semantic | T1 thin display projection |
| Collection fold state | current Gen2 | GAP | 无 canonical UI fold owner | T1 session presentation state |
| Collection Core truth | old Presentation | RETIRE | 旧 memberViewIds/scope model | T6 canonical owner |
| Overlay arbitration | `interaction/overlayArbitration.ts` | CURRENT→MIGRATE | WorkView exclusive rule 过期 | T1/T4 seam migration |
| LCOS host overlay | Huabu `LcosHostOverlay.tsx` | PARTIAL | Composer real；Focus/Arc/WorkView placeholder | thin consumers + T5 visual |
| Focus HUD | current LCOS seam | GAP/PARTIAL | contract 有迹象，真实 consumer 未闭环 | thin T1 consumer |
| Marker / Pin / Locator / Minimap | current source | PARTIAL/GAP | 不应另起空间真相 | T1 screen-space projection layer |
| Camera resize | Huabu Canvas ResizeObserver | CURRENT default | 会做 centre compensation | T4 override；T1 acceptance |
| Colony modern derive-only | current Core | GAP | 旧 contour model 冲突 | T1 thin presentation semantic |
| Archive canonical state | Core current | GAP | routes/domain/repository 均未见 archive owner | T6 add canonical lifecycle |
| Archive projection consumer | current web-gen2 | GAP/PARTIAL | general reconcile ≠ archive | T1 lifecycle consumer |
| LOD protocol | node presentation / renderer registry | PARTIAL | 协议先于 morphology | T1 mechanics + T5 C2 |
| Free-layout neighbor settle | Huabu native free frame | GAP | frame fit 有，邻居局部避碰不足 | T1 S9 thin quality layer |

---

# 5. Projection / Identity Exact Map

## 5.1 `projectionBinding.ts`

Current binding identity：

`projectId | canvasId | spatialKind | entityType | entityId`

这与 D12 的方向天然一致。

### KEEP

- project/canvas/surface 维度；
- canonical entity identity；
- spatialKind。

### MODIFY

Collection canonical source ready 后：

- `entityType` 支持 `collection`；
- Collection Frame binding 仍遵守 same-canvas single authoritative projection；
- 不引入 `instanceId`。

### DO NOT

不要因为 Entity 可以属于多个 Collection，就复制多个 authoritative Huabu nodes。

Many-to-many membership 与 current spatial hosting 必须分离。

---

# 6. Collection Exact Map

## 6.1 Canonical Core owner

旧：

`apps/local-core/src/presentation-application-service.ts`

包含：

- `scopeId`
- `memberViewIds`
- presentation hierarchy
- Colony contour points

状态：

`RETIRE_AS_PRODUCT_OWNER`

它可以保留一段兼容迁移，但不能再被新 T1 code 当 Collection truth。

## 6.2 Spatial projection

Current：

`apps/web-gen2/src/spatial/projectToSpaceProjection.ts`

目前主要围绕 artifact projection。

T1 需要的最小迁移：

- canonical Collection entity → Huabu `frame`;
- binding 仍走 `ProjectionBinding`;
- geometry 仍在 Huabu；
- 不创造 `CollectionVisualFamily` 这种错误抽象。

## 6.3 Native Frame mechanics

Direct reuse：

- `huabu/packages/shared/src/canvas-engine/container/mutation.ts`
- `huabu/packages/shared/src/canvas-engine/frame/projection.ts`
- `huabu/packages/shared/src/canvas-engine/commands/setNodeParent.ts`
- `huabu/packages/shared/src/canvas-engine/executor.ts`
- `huabu/apps/web/src/components/Nodes/frame/FrameNode.tsx`

关键 source fact：

1. move into container 时可保持 absolute position；
2. command layer 已校验 target/cycle/lock；
3. affected frame 在 executor 末尾集中 fit；
4. structured layout 也已有统一 relayout；
5. Frame 默认 free。

所以 expanded Collection left-drop 不需要：

- 自己算 coordinate；
- 自己写 frame bounds；
- 自己写第二套 containment runtime。

## 6.4 Native drag

Relevant：

- `huabu/apps/web/src/store/canvasStore.ts`
- `huabu/apps/web/src/handler/canvasCommand/resolvers/resolveNodeDragStop.ts`
- `huabu/apps/web/src/handler/snap/snapSession.ts`

Current Huabu 已具备：

- drag preview；
- frame target decision；
- auto frame/unframe；
- parent delta；
- geometry diff；
- undo；
- structured insertion。

但 Collection Drop 要遵守 LCOS Core-first semantics，因此不能让 Huabu native auto-reparent 先于 canonical membership。

现成 reparent bypass machinery 可以复用，不应另写一套 drag resolver。

---

# 7. Collection Collapse / Expand Current Gap

Huabu Frame 当前未发现 LCOS 需要的 collapse semantic。

因此：

## 7.1 Authoritative geometry

仍只有 Huabu expanded geometry 一份。

不得：

- 把 collapsed geometry 写进 Core；
- 创建第二份 Collection layout store；
- collapse 时修改 canonical child position。

## 7.2 Collapsed presentation

应是 display-only projection。

建议 thin seam：

`nodeDisplayProjection` / `displayProjection`

职责：

- 对某些 authoritative nodes 改变当前显示；
- 隐藏 hosted child bodies；
- 显示 compact Collection body；
- 保留 authoritative node / parent / geometry。

### 可能修改点

- `huabu/apps/web/src/lcos-seam/types.ts`
- `apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx`
- `apps/web-gen2/src/host/hostSeam.ts`
- `huabu/apps/web/src/lcos/useLcosCanvasProps.tsx`
- `huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

建议 LCOS-only state：

`huabu/apps/web/src/lcos/lcosCollectionPresentationState.ts`

只保存：

- collection spatialId；
- `collapsed | expanded`。

不得保存：

- membership；
- contour；
- canonical geometry；
- Core entity truth。

---

# 8. Collection Spatial Manifestation

建议 T1 薄 adapter：

`apps/web-gen2/src/spatial/collectionHostProjection.ts`

输入：

- target Collection canonical id；
- target Collection frame spatial id；
- current authoritative projection id；
- semantic commit result；
- drop spatial outcome。

流程：

1. T3 gesture resolver 判定 Collection left-drop；
2. T6/Core membership commit；
3. 成功后 T1 query current spatial parent；
4. 已在 target parent → success；
5. 否则 `SET_NODE_PARENT`；
6. timeout / response lost 后 requery；
7. parent 已 target → recovered success；
8. 否则 recoverable spatial failure；
9. 不回滚已经成功的 canonical membership。

为什么：

RFS 当前并非 idempotent/atomic。盲 retry 可能产生重复副作用；后置条件查询比“再发一次看看”更安全。

---

# 9. Many-to-many Collection 与 Spatial Hosting

必须写进 T5 与施工验收，因为视觉很容易误导成“一份 membership = 一份实体副本”。

## 9.1 Entity 属于 A 与 B

语义：

- canonical membership 有 A、B 两条；
- same canvas authoritative body 仍一份。

如果当前 spatial parent=A：

- A 可显示真实 hosted body；
- B 只能显示 proxy/reference/membership cue，除非用户显式 rehost。

## 9.2 Left drag A → expanded B

结果：

- 新增/确认 B membership；
- spatial parent A → B；
- A membership 不自动删除；
- authoritative body 仍一份。

## 9.3 Right drag → B

结果：

- B membership 增加；
- parent 不变；
- x/y 不变。

## 9.4 Drag out of A

结果：

- spatial parent 可改变；
- A membership 不自动删除。

T5 禁止通过视觉暗示“拖出 = 从 Collection 删除”。

---

# 10. ProfessionalWindow / HUD Exact Map

## 10.1 Producer owner

T4。

T1 不创建第二个 safe-area store。

T4 formal seam：

`ProfessionalWindowEnvironment`

T1 只消费：

- occupiedRects；
- safeRect / safeInsets；
- activeRegions；
- viewport resize policy 结果。

## 10.2 `overlayArbitration.ts`

Current：

`apps/web-gen2/src/interaction/overlayArbitration.ts`

当前逻辑包含：

`if (workViewOpen) return ['work-view']`

这与 Phase B D14 不再一致。

状态：

`CURRENT_MECHANISM / MIGRATE_RULE`

未来：

Work View 不是把所有 HUD 都杀掉，而是改变可用 screen-space。

因此 Arbitration 要从：

“哪个 overlay 独占”

迁移为：

“哪些 overlay 可共存 + 各自 layout placement 受 environment 约束”。

## 10.3 `LcosHostOverlay.tsx`

Current：

`huabu/apps/web/src/lcos/LcosHostOverlay.tsx`

当前 source fact：

- Composer 已是真实 consumer；
- `dropPreviewOpen=false`
- `actionArcOpen=false`
- `focusHudOpen=false`
- `workViewOpen=false`

因此这个 seam 对 Focus/ActionArc/WorkView 仍是 placeholder。

状态：

`PARTIAL_CURRENT`

T1/T2/T4 后续应共享同一个 host environment，不应各自 query DOM。

---

# 11. Camera Resize Exact Map

Huabu Canvas current ResizeObserver 会根据 wrapper size：

- 记录 previous size；
- 用 `anchorViewportCentre(...)` 补偿 viewport；
- 某些情况下 `revealBoundsInViewport(...)`；
- 再 `setViewport(...)`。

Huabu 作为通用画布，这个默认行为合理。

LCOS Phase B D15 明确：

Professional Window / Work View open/resize 不能改变 Camera。

因此：

- 不修改 Huabu global default；
- T4 host seam 提供 LCOS viewport resize policy；
- T1 只验收 camera transform 在 PW resize 前后相同；
- 显式 Focus 是另一条用户请求，可以改变 camera。

不要把：

“被动 window resize”

与

“显式 Focus/Locate”

混为一类 Camera 操作。

---

# 12. Focus / Pin / Locator / Minimap Exact State

## 12.1 已确认

Huabu 有成熟 viewport / camera mechanics。

LCOS host seam 已有 overlay arbitration 与 Composer adapter。

## 12.2 未确认成完整 CURRENT 的部分

当前源码没有足够证据证明以下已经端到端落地：

- Focus HUD current consumer；
- Navigation Marker 完整边缘投影；
- Locator；
- Minimap；
- Color Pin fixed-screen identity。

因此本轮不冒充“已实现”。

统一状态：

`PARTIAL / THIN_CONSUMER_GAP`

## 12.3 T1 施工原则

这些系统共享：

- authoritative world geometry；
- viewport transform；
- screen-space environment；
- T4 occupancy；
- selection/focus target。

不允许每个系统：

- 自建 object location truth；
- 自建 camera store；
- 自建 hardcoded panel inset；
- 在 world-space 缩成看不见的小点。

T5 可以设计 glyph/morphology，但不能要求新增第二套定位模型。

---

# 13. Colony Exact Map

## 13.1 旧实现

旧 Core / presentation materials 中存在：

- member ids；
- contour points；
- home / spring；
- old grouping hierarchy。

其中“contour points 作为 Core truth”已被 D11 supersede。

状态：

`RETIRE / MIGRATION_REFERENCE`

## 13.2 新 canonical split

Surface-local membership：

- 可持久在对应 presentation/surface layer；
- owner 不应回退为 old Core contour state。

Geometry：

- 读取 Huabu current member node geometry；
- derive contour。

User interactions：

- create；
- explicit add；
- sticky membership；
- peel；
- rescope；
- dissolve。

Rescope：

- preview 由 T1；
- commit member delta 由 T6/canonical membership owner；
- 不写 contour control points。

## 13.3 Current implementation status

modern derive-only Colony：

`GAP / THIN_NEW_PRESENTATION`

这不是产品语义缺口。

是 source implementation gap。

T5 可直接规划：

- organic field；
- neck/tether；
- peel deformation；
- threshold feedback；

但不可设计：

- 永久 contour edit handles；
- contour point editor；
- 把 Colony 画成 Collection folder/frame。

---

# 14. Archive / Restore Exact Map

已反查：

- `apps/web-gen2/src/host/lifecycleReconciler.ts`
- `apps/local-core/src/routes/artifacts.ts`
- `apps/local-core/src/metadata-repository.ts`
- `packages/domain/src/index.ts`

结论：

general reconcile / recovery 已存在。

但 current Core 未见完整：

- archive lifecycle field；
- archivedAt；
- archiveEligibility；
- archive route；
- restore route。

因此：

`CURRENT CORE ARCHIVE OWNER = GAP`

这不重新开启产品决策。

Phase B D13 仍然是产品真相。

Owner split：

- T6：补 canonical archive/restore lifecycle；
- T1：消费 eligibility；
- archive → remove active projection；
- restore → same identity, new/current projection；
- fresh Huabu placement；
- 不用旧 `ArtifactView.position`。

---

# 15. LOD / Node Presentation

现有 Gen2 已有：

- node presentation 协议；
- renderer registry；
- artifact node shell；
- visual family/species mapping。

状态：

`PARTIAL_CURRENT`

真正缺的不是再做 registry，而是：

- LCOS final morphology；
- LOD threshold；
- fixed-screen takeover；
- hover/focus label；
- compact vs expanded body；
- motion states。

这些正是 C2 T5 的输入区。

T1 应保留 mechanics：

- world node identity；
- screen-space projection；
- state machine；
- reduced-motion behavior；
- deterministic hit target。

T5 决定：

- 长什么样；
- 何时显/隐；
- transition visual；
- glyph；
- material。

---

# 16. Layout / Settle Exact Map

## 16.1 已有

Huabu：

- free frame；
- row；
- column；
- grid；
- frame fit；
- snap；
- drag stop；
- parent change；
- structured insertion。

## 16.2 缺口

用户将节点 drop 到 expanded Collection 后，默认 free layout 下：

- 节点可保持释放位置；
- Frame 可 fit；

但没有充分 current evidence 表明：

“附近重叠节点会做 LCOS 所需的 bounded local neighbor settle”。

因此状态：

`REAL GAP / S9`

目标不是造通用 solver。

只需要：

- local；
- bounded；
- deterministic；
- minimal displacement；
- locked nodes unchanged；
- 不改变 canonical membership；
- reduced motion 时 geometry 结果一致，只取消动画。

Spatial donor 可提供手感证据。

---

# 17. RETIRE / KEEP / MIGRATE 清单

## 17.1 RETIRE AS PRODUCT OWNER

- old Scope durable group ontology；
- old Presentation membership truth；
- `memberViewIds` 作为 Collection membership；
- Core Colony contour points；
- `ArtifactView.position` 作为 Restore position；
- WorkView open → all HUD disappear 的旧 arbitration；
- membership → automatic spatial host 的推断；
- same canvas multiple authoritative duplicate nodes。

## 17.2 KEEP

- ProjectionBinding identity model；
- Huabu Frame；
- Huabu parent mutation；
- frame projection / fit；
- drag-stop；
- snap；
- viewport primitives；
- renderer registry；
- one-way Core→Huabu projection direction；
- reconciliation infrastructure；
- Gen1/Spatial 的纯行为 donor 证据。

## 17.3 MIGRATE

- artifact-centric projection → canonical Collection Frame projection；
- overlay arbitration → occupancy-aware coexistence；
- reconciler → Collection canonical projection awareness；
- host seam → display projection / PW environment consumers；
- presentation model → modern LOD / fixed-screen identity；
- lifecycle reconcile → consume T6 archive eligibility。

---

# 18. Cross-thread Owner Matrix

| Contract | Producer | T1 consumer / output | T5 should know |
|---|---|---|---|
| canonical Collection identity/membership | T6 | Frame projection / host manifestation | visual must not own membership |
| drag grammar | T3 | spatial outcome / reparent / settle | left/right/handle must look different |
| edge/drop semantic target | T3 + target owner | world hit + spatial manifestation | collapsed/expanded/remote states differ |
| ProfessionalWindowEnvironment | T4 | HUD/Focus/Pin/Locator layout | occupied space is dynamic |
| viewportResizePolicy | T4 | camera-freeze acceptance | PW resize must not visually pan canvas |
| selection/composer behaviors | T2/T3 shared | T1 placement consumer | overlay coexistence |
| Archive lifecycle | T6 | projection remove/fresh restore | archive is lifecycle, not hidden folder |
| Colony membership commit | T6 | derive contour / preview / settle | visual contour not canonical truth |
| final morphology | T5 | T1 later backfill exact values | C2 owner |

---

# 19. T5 Safe Assumptions

T5 现在可以无风险依赖：

1. Collection 可 collapsed / expanded；
2. expanded Collection spatially 是 Frame-like visible host；
3. default expanded layout 是 free，不是自动 Grid；
4. explicit Grid/Stack/Masonry 是 presentation choice；
5. collapsed Collection 仍能成为 semantic drop target；
6. right-drag membership 不搬节点；
7. many-to-many membership 不复制 authoritative body；
8. Colony contour 是 derived organic field；
9. Work View/PW 不移动 Camera；
10. HUD 必须避让 occupied rect，而不是统一消失；
11. Focus 是显式 Camera request，可以移动 Camera；
12. Archive Restore 是 fresh placement；
13. fixed-screen identity 不应退化成 tiny world dot；
14. nearest-neighbor settle 是局部而非全局重排；
15. drag/drop 的最终手感必须呈现 commit / settle，而不是表单确认。

---

# 20. T5 不应从视觉反向要求的错误实现

禁止：

- Collection 画成独立 child canvas；
- collapsed Collection drop 后强制 auto-expand；
- visible expanded left-drop 弹 chooser；
- right-drag 后节点飞过去；
- relation handle 被画成 grouping gesture；
- 多 membership 出现多份“真身”；
- Colony 出现 contour edit control points；
- Work View 打开后 Camera 跳动；
- PW width 被硬编码进 T1；
- archived entity restore 回历史 x/y；
- Minimap/Locator 自建第二套 world truth；
- LOD 通过重复实体解决；
- free layout 每次 drop 自动整齐 Grid；
- drag out host 自动删除 canonical Collection membership。

---

# 21. C1-S1 Exit Criteria

本稿认为 Source Census 已达到给 T5 的工程输入门槛：

- 产品语义无 OPEN；
- current owner / legacy owner 已分开；
- Huabu 可直接复用 primitive 已定位；
- Collection exact mechanics 已到文件级；
- T4/T6 跨线程 dependency 已明确；
- Archive / Colony / FocusHUD 不冒充已经实现；
- 旧 2A 已吸收；
- 不再需要扩大历史阅读面。

剩余工作全部属于：

- S2 seam construction skeleton；
- S3 exact construction order；
- T5 C2 visual values；
- C3 backfill。

**C1-S1：READY FOR T5 / READY FOR S2。**

---

# Appendix A · Exact Evidence Ledger

本附录只收已经在本轮或前两轮确认过的 source fact，不增加新的外部推断。目的不是把正文再说一遍，而是让 T5/T1 后续能够从「产品状态」反查到「为什么可以这样画 / 为什么不能这样画」。

| Evidence ID | Exact source / artifact | Confirmed fact | Phase B interpretation | Status |
|---|---|---|---|---|
| E01 | `apps/web-gen2/src/spatial/projectionBinding.ts` | binding key 含 project/canvas/spatialKind/entityType/entityId | same-canvas authoritative projection 有自然唯一键 | KEEP |
| E02 | `apps/web-gen2/src/spatial/projectToSpaceProjection.ts` | current projection path artifact-centric、Core→Huabu 单向 | Collection 需要扩 canonical projection，不应另建 runtime | MIGRATE |
| E03 | `apps/web-gen2/src/presentation/visualFamily.ts` | family 表中无 Collection | Collection 不应硬塞 artifact species | KEEP |
| E04 | `apps/web-gen2/src/spatial/types.ts` | native types 含 frame；RFS 有 parent/geometry/frame layout | Collection visible host 可直接建立在 Frame/RFS 上 | KEEP |
| E05 | `apps/web-gen2/src/host/projectionFacade.ts` | projection/binding/relation/reconcile 已集中 | Collection client 应接现有 facade | MIGRATE |
| E06 | `apps/web-gen2/src/spatial/reconciliationRunner.ts` | current reconcile artifact/relation | 可扩 Collection projection，但不能 membership→parent | MIGRATE |
| E07 | `huabu/.../container/mutation.ts` | reparent 可保持 absolute position | expanded left-drop 可保持释放位置 | KEEP |
| E08 | `huabu/.../frame/projection.ts` | frame geometry/fit 有集中逻辑 | 不手写 Collection frame bounds solver | KEEP |
| E09 | `huabu/.../commands/setNodeParent.ts` | target/cycle/lock validation + parent mutation | T1 只需要薄 host adapter | KEEP |
| E10 | `huabu/.../executor.ts` | batch 末尾 structured relayout / fitFrames | 不复制一套 execution order | KEEP |
| E11 | `huabu/.../FrameNode.tsx` | native frame free/row/column/grid，free 可作为默认 | expanded Collection default 不自动 Grid | KEEP |
| E12 | `huabu/.../resolveNodeDragStop.ts` | native drag resolver 已处理 parent/geometry/undo | 不建立 LCOS parallel drag runtime | KEEP |
| E13 | `huabu/.../snapSession.ts` | 有 reparent bypass machinery | Core-first Collection Drop 可复用 bypass | KEEP |
| E14 | `huabu/apps/web/src/lcos/LcosHostOverlay.tsx` | Composer 真实接入；Focus/Arc/WorkView 参数仍 false placeholder | HUD/overlay 不是“已经完成” | PARTIAL |
| E15 | `apps/web-gen2/src/interaction/overlayArbitration.ts` | WorkView open 当前会独占 | 与 D14 冲突，应迁移 coexistence/occupancy | MIGRATE |
| E16 | Huabu `Canvas.tsx` resize path | wrapper resize 默认做 camera centre compensation | Huabu 默认保留；T4 LCOS policy override | KEEP+OVERRIDE |
| E17 | `apps/local-core/src/presentation-application-service.ts` | old Presentation 拥有 memberViewIds / hierarchy / contour points | 旧 owner 被 Collection/Colony 新裁决覆盖 | RETIRE AS OWNER |
| E18 | `apps/local-core/src/routes/artifacts.ts` | 未见 archive/restore route | D13 current canonical implementation 尚缺 | GAP/T6 |
| E19 | `apps/local-core/src/metadata-repository.ts` | 未找到 archive/isArchived/archivedAt owner | general recovery 不能冒充 Archive lifecycle | GAP/T6 |
| E20 | `packages/domain/src/index.ts` | Artifact domain 未见 archive lifecycle field | Archive truth 需要 canonical owner 扩充 | GAP/T6 |
| E21 | `apps/web-gen2/src/host/lifecycleReconciler.ts` | general projection recovery/reconcile 已有 | 可做 T1 projection consumer 基础，不是 lifecycle truth | PARTIAL |
| E22 | Gen1 `collectionExpandLayout.ts` | 有 fan-out/obstacle geometry 参考 | behavior donor，不恢复旧 ontology | REFERENCE |
| E23 | Gen1 `ProjectCanvas.tsx` | 有 collection expansion transition 状态 | 可借 motion/state evidence | REFERENCE |
| E24 | Gen1 `CanvasNodeVisual.tsx` | 有 collapsed Collection-like visual | 只做视觉历史参考 | REFERENCE |
| E25 | Spatial donor audit/raw evidence | focus fade、drop settle、transition 等行为成熟 | 借手感，不搬语义/runtime | REFERENCE |

## A.1 Negative evidence 的使用方式

本轮对以下内容采用“未发现 current owner → 明确 GAP/PARTIAL”，而不是自动推断它一定不存在：

- complete Focus HUD consumer；
- complete Marker / Locator / Minimap chain；
- modern derive-only Colony；
- canonical Archive lifecycle。

这是有意的保守标记。

施工时如果在更窄的 exact-file 路径中发现已有模块：

- 优先接现有模块；
- 更新 Ledger；
- 不影响 Phase B invariant；
- 不因为发现旧名字相似就恢复旧 ontology。

---

# Appendix B · Legacy → Current Replacement Map

| Legacy concept/source | 旧职责 | Current replacement | 迁移纪律 |
|---|---|---|---|
| Scope as durable grouping | group/membership/container 混合 | Collection + Workflow + Worksite + transient Scope | 不保留万能 Scope |
| Presentation.memberViewIds | member truth | T6 canonical Collection membership | 新代码停止读取 |
| ArtifactView.position | view-era geometry | Huabu current geometry | Restore 不复用 |
| Colony contour.points | canonical contour | derive(member Huabu geometry) | 禁止新写入 |
| WorkView overlay exclusivity | 开大窗口时关闭一切 | T4 occupancy + consumer relocation | 改 arbitration |
| duplicated Collection members | membership visualization | one authoritative + proxy/reference | 禁 duplicate truth |
| auto-parent from membership | semantic=spatial | explicit visible-host outcome | reconciler 不推断 |
| collapse as geometry rewrite | compact container layout | display-only projection | geometry 不变 |
| remote Collection as local host | membership + teleport | semantic update / remote mapping | source scene 不动 |

---

# Appendix C · T1 Source Readiness by T5 Design Area

## C.1 Collection

源码确定度：**HIGH**

T5 可以大胆设计 final form，因为：

- canonical / presentation split 已冻结；
- Frame donor 已确认；
- drop mechanics 已确认；
- collapse 的 display-only implementation direction 已明确；
- multi-membership invariant 已明确。

仍等待：

- T6 canonical Collection API 的 exact type；
- T5 morphology。

## C.2 Colony

源码确定度：**MEDIUM-HIGH**

产品语义完全冻结，但 current modern implementation 尚薄。

T5 不需要等 implementation 才设计。

T5 只要严格围绕：

`derived field / sticky membership / peel / rescope`

即可。

## C.3 HUD / Focus / Pin

源码确定度：**MEDIUM**

底层 viewport mechanics 确定；
T4 occupancy contract 确定；
current LCOS overlay wiring 部分 placeholder。

所以 T5 可以做状态板，但不要把某个现有 placeholder 组件外观当最终约束。

## C.4 Archive / Restore

源码确定度：

- 产品：HIGH；
- current canonical implementation：LOW；
- T1 consumer architecture：HIGH。

T5 可以设计 lifecycle appearance，不应假设 current source 已有完整 Archive API。

## C.5 Layout / settle

源码确定度：**HIGH for native layout / MEDIUM for local settle**

Grid/Frame/Snap 不需要设计新 engine。

local settle 只需要 T5 给 motion/spacing intent，算法留 T1。

---

# Appendix D · C1-S1 Non-Goals

本稿明确没有做：

- 把所有 donor 文件逐字审计；
- 把 112 会话完整复刻；
- 对 T2/T3/T4/T6 重新做源码计划；
- 重新讨论 Collection / Colony / Worksite ontology；
- 提前决定最终 CSS / SVG；
- 为达到篇幅复制旧文档。

后续只有当 T5 的 visual patch 与 current source 发生具体冲突时，才进行定点 source re-open。
