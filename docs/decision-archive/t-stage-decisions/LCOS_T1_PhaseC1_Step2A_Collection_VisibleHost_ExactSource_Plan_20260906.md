# LCOS Gen2 · T1 Phase C1
## Step 2A · Collection Visible Host + Expanded Layout · Exact-Source 施工稿

**日期：2026-09-06**  
**线程：T1 · Spatial Presentation / HUD / LOD / Layout**  
**基线：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`**  
**状态：`SOURCE PLAN · STEP 2A COMPLETE`**  
**上位裁决：`LCOS_Gen2_PhaseB_四路合并_最终跨线程裁决稿_20260906`**

> 本稿只解决 Collection 的空间呈现与 Visible Host 机械。
> 不重新裁 Collection canonical identity / membership。
> 不替 T3 重新定义左右拖手势。
> 不替 T5 决定最终 body / material / motion。
>
> 文件级 owner 与行为在本稿中锁定；新 symbol 名仅为工作名，施工时服从现有命名体系，不为“写得像规格书”额外制造 contract。

---

# 0. 结论

Collection 这一条可以做到很薄。

最终结构：

```text
T6 canonical Collection
├── identity / nesting
└── many-to-many membership

T1 spatial manifestation
├── Collection authoritative projection → Huabu native Frame
├── expanded host → real spatial host
├── collapsed → derived display state，绝不改 canonical membership
├── member placement → Huabu parentId / geometry
└── layout → Huabu free / grid / row / column + 后续 S9 minimal settle

T3 gesture
├── left drag
├── right drag
└── relation handle
```

最重要的边界：

> **Huabu `parentId` 只表示当前 canvas 上的空间 host，不等于 Collection membership。**

因此：

```text
canonical member
≠
一定是 Frame child

Frame child
⇒ 当前 authoritative projection 被这个 expanded Collection 空间托管
```

Collection many-to-many 与“一 canvas 一 authoritative projection”可以同时成立：

```text
Entity E ∈ Collection A
Entity E ∈ Collection B

当前 canvas authoritative projection
只允许被 A 或 B 其中一个 expanded host 物理托管

另一个 Collection
只显示 derived proxy / membership cue
绝不复制第二份 authoritative projection
```

这正好符合 Phase B D02 + D12。

---

# 1. 已拍板产品行为

## 1.1 Collapsed Collection

```text
collapsed Collection
= semantic target
≠ visible spatial host
```

左拖：

```text
Add canonical membership
source projection 留原位
Collection 播放 accept feedback
不自动 expand
不 SET_NODE_PARENT
```

右拖：

```text
Add canonical membership
source 从头到尾不动
```

---

## 1.2 Expanded Collection

```text
expanded Collection
= Visible Host
```

左拖：

```text
Core membership 成功
→ authoritative projection 留在用户 drop 位置
→ 物理托管到 Collection Frame
→ Huabu 可 fit / minimal local settle
→ 不回弹
```

右拖：

```text
Core membership 成功
→ source spatial placement 完全不动
→ target 只更新 membership / derived cue
```

---

## 1.3 默认 layout

默认：

```text
free spatial layout
+
必要时 minimal local settle
```

不默认：

```text
Grid
Masonry
Stack
全量重新 Arrange
```

Grid / row / column / masonry 类 presentation 只有明确用户选择才进入。

---

## 1.4 Collapse → Expand

普通折叠：

```text
保留 expanded Huabu geometry
```

再次展开：

```text
恢复原 expanded geometry
```

不能把用户认真排好的空间劳动当临时缓存扔掉。

Archive → Restore 是另一条规则：

```text
fresh layout
不恢复旧 x/y
```

---

# 2. Current Source 对账

## 2.1 旧 Presentation owner 已被 Phase B 覆盖

### current file

```text
apps/local-core/src/presentation-application-service.ts
```

current source 仍写：

```text
Presentation owns membership / position / hierarchy
```

同时：

- `save()` 仍要求旧 `scopeId`；
- `state.memberViewIds` 仍充当 membership；
- hierarchy 仍与 membership 绑定；
- Colony 仍要求 `contour.points`；
- spatialRegions 仍作为兼容结构。

### 裁决

这些不能继续当 Gen2 Collection truth。

处理：

```text
LEGACY_COMPAT / MIGRATION SOURCE
```

禁止 T1：

```text
Collection membership
→ Presentation.memberViewIds
```

T6 canonical membership transaction 是唯一上游真相。

---

## 2.2 Current ProjectionBinding 可继续沿用

### current file

```text
apps/web-gen2/src/spatial/projectionBinding.ts
```

现有 key：

```text
projectId
canvasId
spatialKind
entityType
entityId
```

正好满足：

```text
same entity + same canvas + same spatial kind
= one authoritative projection
```

### T1 改动

等 T6 提供正式 canonical Collection ref 后：

```text
EntityType
+ 'collection'
```

不加：

```text
instanceId
collectionInstanceId
frameInstanceId
```

---

## 2.3 Current single spatial consumer 保留

### current file

```text
apps/web-gen2/src/spatial/projectToSpaceProjection.ts
```

已有原则：

```text
Core → Huabu
one-way
single spatial consumer
geometry lives in Huabu
```

### T1 改动

让 canonical Collection 使用：

```text
Huabu native `frame`
```

不新增：

```text
CollectionProjectionRuntime
CollectionCanvasEngine
CollectionSpatialStore
```

工作实现可采用最薄方式：

```text
SpaceEntityProjectionSource.kind
由 artifact-only required
调整为允许 collection path 不提供 artifact kind

huabuNodeTypeForPresentation(...)
先判 entityType === 'collection'
→ 'frame'
其余继续 visual-family resolver
```

不需要为了 Collection 新增一个 VisualFamily。

---

# 3. 为什么 Huabu Frame 是正确 primitive

## exact files

```text
huabu/packages/shared/src/canvas-engine/container/mutation.ts
huabu/packages/shared/src/canvas-engine/frame/mutation.ts
huabu/packages/shared/src/canvas-engine/frame/projection.ts
huabu/packages/shared/src/canvas-engine/commands/setNodeParent.ts
huabu/packages/shared/src/canvas-engine/executor.ts
```

---

## 3.1 Reparent 自动保留 absolute position

`moveNodeIntoContainer()`：

```text
读取 child absolute position
读取 container absolute position
→ 换 parentId
→ child local position = childAbs - parentAbs
```

因此：

> 用户把节点丢在什么绝对位置，reparent 后仍留在那个视觉位置。

T1 不需要再造 coordinate converter。

---

## 3.2 Frame fit / structured layout 已集中在 executor

`SET_NODE_PARENT`：

```text
validate
→ moveNodeIntoContainer
→ affectedFrameIds
```

batch 末尾：

```text
structured Frame
→ applyStructuredFrameRelayout

free + hug Frame
→ fitFrames

manual Frame
→ 保持用户 pinned size
```

因此 expanded Collection 的基础左拖：

> **一个 `SET_NODE_PARENT` 就可以完成“留在 drop 位置 + host fit”。**

不是：

```text
SET_PARENT
+ 手算 x/y
+ 手算 frame bounds
+ 再手算 children
```

---

## 3.3 Current native drag resolver 也成熟

### files

```text
huabu/apps/web/src/store/canvasStore.ts
huabu/apps/web/src/handler/canvasCommand/uiIntent.ts
huabu/apps/web/src/handler/canvasCommand/resolvers/resolveNodeDragStop.ts
```

已有：

- live frame preview；
- cached WYSIWYG drag decision；
- pointer-based frame entry；
- auto-unframe；
- structured insertion；
- parent change；
- geometry diff；
- one undo snapshot；
- frame reflow。

### 结论

这些机械全部：

```text
DIRECT_USE
```

不复制 `resolveNodeDragStop.ts`。

---

# 4. 但不能直接让 native Frame 接管 Collection Drop

这里有一个真实 sequencing conflict。

Huabu native Frame 的正常行为：

```text
pointer release
→ spatial reparent
```

Collection 的正式行为：

```text
pointer release
→ canonical Collection membership commit
→ spatial manifestation
```

也就是：

> **Collection Frame 必须是 host-managed Frame，不能在 Core membership 成功前被 Huabu native auto-reparent 抢先提交。**

这不是重新裁产品。

它只是 current mechanics 与 Core-first truth 顺序之间的薄适配。

---

# 5. Drop 顺序

## 5.1 Collapsed Collection · Left Drag

```text
drag body
→ T3 resolve target = collapsed Collection
→ T6 add membership
→ success
→ T1 no-op spatial
→ accept feedback / count update
```

明确没有：

```text
SET_NODE_PARENT
SET_NODE_GEOMETRY
auto-expand
```

---

## 5.2 Expanded Collection · Left Drag

推荐正式顺序：

```text
1. Native drag 允许更新 dropped geometry
2. Collection target 对 native auto-reparent 使用既有 reparent-bypass 机械
3. pointer up 得到 stable dropped geometry
4. T3 → T6 canonical membership commit
5. success
6. T1 spatial manifestation:
   SET_NODE_PARENT(sourceSpatialId → collectionFrameSpatialId)
7. Huabu 保持 absolute drop position + fit frame
8. 若存在 overlap：
   后续 S9 minimal settle
```

关键：

> bypass 的是 **native reparent**，不是用户拖动本身。

所以用户不会看到：

```text
拖进去
→ 突然弹回原位
→ 等网络
→ 再飞进去
```

这是应该避免的。

---

## 5.3 Expanded Collection · Right Drag

```text
right-drag ghost
→ T6 membership
→ success
→ T1 不发任何 parent / geometry command
```

如果 expanded host 要显示“它也是成员”：

```text
derived proxy / membership cue
```

禁止：

```text
第二份 ProjectionBinding
第二个 authoritative node
把 source 从原 host 抢过来
```

---

## 5.4 Relation Handle

继续走：

```text
hostConnectIntent
→ Core Relation
→ Huabu edge projection
```

绝不经过 Collection membership path。

---

# 6. Many-to-many Collection 的空间规则

假设：

```text
E ∈ A
E ∈ B
```

## 情况 1

E 物理托管在 A：

```text
E.parentId = A.frameSpatialId
```

A：

```text
真实 authoritative body
```

B：

```text
derived membership preview
```

---

## 情况 2 · 用户左拖 E 到 expanded B

```text
membership B 已存在或 idempotent add
→ authoritative projection reparent A → B
```

重要：

```text
E 仍然是 A canonical member
```

只是：

```text
当前 spatial host 从 A 变 B
```

A 不自动删除 membership。

---

## 情况 3 · 用户右拖 E 到 B

```text
add membership B
source parentId 不动
```

---

## 情况 4 · 用户把 E 从 expanded A 拖出去

```text
spatial unparent / move
≠ remove Collection membership
```

从 Collection 删除 membership 必须是显式 semantic action。

绝不能：

```text
离开 Frame
→ 偷偷删 canonical membership
```

否则 spatial geometry 又开始偷偷写 domain truth，前面的分层等于白干。

---

# 7. Collapse / Expand 的机械实现

Huabu native Frame 当前没有 collapse。

因此不能：

```text
“找一个 Frame.collapsed = true”
```

因为它不存在。

也不应该把 collapse 写进 Core Collection。

---

## 7.1 唯一长期 geometry owner

expanded geometry 始终留在 Huabu：

```text
Frame bounds
child parentId
child relative/absolute geometry
layout mode
```

普通 collapse 不改这些 truth。

---

## 7.2 Collapsed body 是 display projection

折叠时：

```text
persisted Huabu Frame geometry
保持原样

display projection
→ Frame body 呈现 compact Collection body
→ 当前由这个 Frame 物理托管的 children 暂不渲染
```

展开：

```text
移除 display-only collapse projection
→ 原 Huabu Frame + children 原地恢复
```

因此不用另存：

```text
expandedX
expandedY
expandedWidth
expandedHeight
childOriginalPositions
```

避免第二 geometry truth。

---

## 7.3 需要的一条 neutral Huabu seam

current：

```text
CanvasHostExtension
只有：
nodeTypes
overlays
recognizers
connectIntent
```

缺：

> host 对“同一份真实 Huabu nodes，本轮应该怎样显示”做 display-only projection 的入口。

### exact files

```text
huabu/apps/web/src/lcos-seam/types.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
apps/web-gen2/src/host/hostSeam.ts
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
```

### thin seam 目标

工作名：

```text
displayProjection / nodeDisplayProjection
```

语义只有：

```text
输入：authoritative Huabu nodes
输出：render-only nodes
```

允许：

- `hidden` hosted children；
- collapsed Frame 的 render-only compact bounds；
- render-only presentation marker。

禁止：

- 写回 canvasStore；
- 改 ProjectionBinding；
- 改 Core membership；
- 持久化 display-only geometry。

### 为什么这一 seam 合理

若没有它，只剩三种坏方案：

1. 把 collapse geometry 写回 Huabu authoritative geometry  
   → 用户 expanded layout 丢失；

2. 把 child x/y 复制到另一个 LCOS store  
   → 第二 geometry truth；

3. 在 generic Huabu `Canvas.tsx` 直接 import LCOS Collection domain  
   → Huabu 被领域污染。

所以这里确实需要一个很薄、domain-neutral 的 display projection seam。

---

# 8. Fold state owner

需要一份**session-only presentation state**。

建议 colocate：

```text
huabu/apps/web/src/lcos/lcosCollectionPresentationState.ts
```

只保存：

```text
expanded / collapsed
by collection frame spatialId
```

不保存：

- member ids；
- x/y；
- frame bounds；
- Core collection id truth；
- membership；
- layout。

为什么不能散落在多个 component local state：

Collection fold state同时被：

- body renderer；
- child visibility；
- semantic target classification；
- drag admission

消费。

复制四份 boolean 才是真的在制造未来事故。

### durability

当前：

```text
session-only
```

不加：

```text
DB
localStorage
Core column
```

reload 后 fold 状态可以回默认态；

但 Huabu expanded geometry 本身仍然存在。

---

# 9. Native auto-reparent 的 Collection 特例

T3 必须接一个很窄的机械要求：

> 当当前 drag target 是 canonical Collection Frame 时，正常 node movement 继续，但 Huabu native auto-reparent 要 bypass，直到 Core membership success。

Current Huabu 已经有：

```text
_reparentBypassed
NODE_DRAG_STOP.bypassReparent
```

原本由 Space gesture 驱动。

因此优先：

```text
复用同一 bypass machinery
```

而不是再写：

```text
collectionDragResolverV2
```

### T1 提供给 T3

```text
Collection frame spatial ids
collapsed / expanded target state
```

### T3 负责

```text
什么时候进入 host-managed semantic drop
什么时候让 native reparent bypass
什么时候 commit membership
```

### T1 负责

membership success 以后：

```text
manifest spatial host
```

---

# 10. Spatial Manifestation 薄 adapter

建议新建一个很小的文件：

```text
apps/web-gen2/src/spatial/collectionHostProjection.ts
```

这不是新 runtime。

只负责：

```text
“canonical membership 已经成功后，
如何让 current authoritative node 物理进入 Collection Frame。”
```

---

## 10.1 需要后置条件恢复，而不是盲 retry

Huabu RFS current capability：

```text
atomic = false
partialCommit = true
idempotent = false
```

具体失败场景：

```text
Core membership 已成功
→ client 发 SET_NODE_PARENT
→ server 已应用
→ response 在网络中丢了
→ client 以为失败
→ retry
→ 第二次得到 no-op / error
```

如果只把“第二次 no-op”当失败：

用户会看到一个其实已经完成的操作被报错。

### 因此 adapter 应：

```text
query current source parent

if already target
→ success

else
→ execute SET_NODE_PARENT

if execute throws / timeout / no-op
→ requery postcondition

if parent == target
→ recovered success

else
→ recoverable spatial failure
```

这是明确由 current RFS 非幂等 + 网络未知结果导致的具体失败。

不是为了“看起来更工程”增加门禁。

---

## 10.2 不做分布式 rollback

如果：

```text
Core membership success
Spatial manifestation fail
```

禁止自动：

```text
remove membership
```

因为：

- Core truth 已成立；
- spatial 是 downstream projection；
- rollback 本身也可能失败；
- many-to-many membership 不应被 presentation 网络故障删除。

正确：

```text
membership 保留
→ UI 显示 recoverable spatial failure
→ reconciler / manual retry 后续收敛
```

---

# 11. Reconciler 必须扩 Collection，但不读旧 Presentation

## exact file

```text
apps/web-gen2/src/spatial/reconciliationRunner.ts
```

current 只扫：

```text
Core artifacts
Core relations
```

### T1 + T6 改造后

需要消费 T6 canonical Collection source：

```text
canonical collections
→ ensure Collection Frame projection exists
→ repair stale binding
→ prune truly deleted Collection frame binding
```

但：

```text
Collection membership
```

不从：

```text
Presentation.memberViewIds
scope
Frame.parentId
```

反推。

---

## 11.1 Reconciler 不应强行重新托管所有 members

这是很多人最容易“顺手写错”的地方。

Reconcile 看到：

```text
E ∈ Collection A
```

不能自动：

```text
E.parentId = A.frame
```

因为：

- E 可能同时属于 B；
- authoritative projection 只能一个；
- current spatial host 是 Presentation intent；
- right-drag membership 明确不移动 source。

所以 Reconciler 只保证：

```text
Collection authoritative Frame exists
canonical entities exist
bindings valid
```

不把 canonical membership 自动翻译成 spatial parent。

---

# 12. First Expand 的成员表现

Collection 展开时，成员分两类。

## Hosted Member

```text
canonical member
+
current authoritative projection.parentId == collectionFrameSpatialId
```

显示：

```text
真实 spatial body
```

---

## Semantic-only Member

```text
canonical member
+
authoritative projection 在别处 / 未在当前 canvas
```

显示：

```text
derived proxy / membership cue
```

而不是 teleport。

---

## 为什么

否则：

```text
right-drag 加入 Collection
→ 下一次 expand
→ 系统突然把 source 搬过来
```

直接违反 D03。

---

# 13. First-time fan-out 的边界

用户已经同意：

> 没有历史 geometry 时，第一次 expand 可以做一次舒服的 fan-out。

这只适用于：

```text
这批节点已经被当前用户动作明确指定为本 Collection 的 spatial-hosted set
```

例如：

```text
Selection → Create Collection → expand
```

不能用于：

```text
所有 canonical members
```

否则远端 membership 会被偷偷搬动。

初次 fan-out：

```text
优先 Huabu existing layout primitive
```

不搬 Gen1 solver。

---

# 14. Minimal local settle

Current Huabu free Frame：

```text
保 drop point
fit parent
```

但不会自动把邻居“让开”。

因此：

```text
basic host drop = Huabu solved
neighbor settle = REAL GAP
```

这条不在 Step 2A 里重新造完整 solver。

进入后续：

```text
S9 · Layout / Settle Quality
```

目标：

```text
deterministic
local
minimal displacement
locked nodes untouched
no unresolved overlap
```

优先纯函数 policy + Huabu geometry commands。

Spatial 只做行为质量 donor。

---

# 15. Exact-File 施工卡

## C2A-01 · Canonical Collection Projection Adoption

### MODIFY

```text
apps/web-gen2/src/spatial/projectionBinding.ts
apps/web-gen2/src/spatial/projectToSpaceProjection.ts
apps/web-gen2/src/spatial/reconciliationRunner.ts
apps/web-gen2/src/host/projectionFacade.ts
```

### upstream dependency

T6 提供：

```text
canonical Collection ref
Collection list/read
membership transaction
```

### result

```text
Collection → Huabu native Frame
one authoritative binding
```

---

## C2A-02 · Collection Host Manifestation

### NEW thin file

```text
apps/web-gen2/src/spatial/collectionHostProjection.ts
```

### responsibility

```text
membership success 后
ensure current authoritative projection hosted by target Frame
postcondition recovery
```

### command

```text
SET_NODE_PARENT
```

free host 基础路径不手写 geometry。

---

## C2A-03 · Host Fold State

### NEW session-only file

```text
huabu/apps/web/src/lcos/lcosCollectionPresentationState.ts
```

### stores only

```text
expanded/collapsed by Collection frame spatialId
```

### NO

```text
membership
geometry
Core refs as truth
```

---

## C2A-04 · Display-only Projection Seam

### MODIFY

```text
huabu/apps/web/src/lcos-seam/types.ts
apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx
apps/web-gen2/src/host/hostSeam.ts
huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
```

### purpose

```text
authoritative Huabu nodes
→ host display-only projection
```

Collection collapse：

```text
hide hosted children in display
derive compact host body
preserve authoritative expanded geometry
```

T5 C2/C3 回填最终 compact body、size、motion。

---

## C2A-05 · Collection Target Native-Reparent Bypass

### EXISTING machinery to reuse

```text
huabu/apps/web/src/handler/snap/snapSession.ts
huabu/apps/web/src/store/canvasStore.ts
huabu/apps/web/src/handler/canvasCommand/uiIntent.ts
huabu/apps/web/src/handler/canvasCommand/resolvers/resolveNodeDragStop.ts
```

### T3 integration requirement

Collection semantic target：

```text
normal position drag stays active
native frame reparent bypassed
```

Core commit 成功后 T1 再 manifest parent。

不写第二 drag resolver。

---

# 16. Retirement

## RETIRE AS PRODUCT OWNER

```text
PresentationApplicationService.memberViewIds
Presentation hierarchy
old Scope-as-Collection
old opensScopeId ownership
```

仅保迁移读取。

---

## REFERENCE ONLY

Gen1：

```text
ProjectCanvas collectionExpanded
CanvasNodeVisual CollectionObject
collection opening/closing motion
collectionExpandLayout
```

可借：

- collapsed / expanded state；
- opening / closing direction；
- first fan-out intention。

不搬：

- Gen1 DOM canvas runtime；
- Gen1 obstacle solver；
- old scope identity；
- old card/folder final body。

---

# 17. Unit / Integration Tests

## web-gen2

新增建议：

```text
apps/web-gen2/test/collection-host-projection.test.ts
```

至少：

### T1
```text
Collection projects to one native Frame
same collection + same canvas reuses binding
different canvas allows another projection
```

### T2
```text
left expanded manifestation:
SET_NODE_PARENT preserves absolute position
```

### T3
```text
right-drag path never invokes host projection
```

### T4
```text
spatial timeout after server apply
→ requery sees target parent
→ recovered success
```

### T5
```text
spatial failure before apply
→ membership is not rolled back by T1
```

### T6
```text
canonical multi-membership
does not create second same-canvas authoritative projection
```

---

## Huabu / display seam

建议 colocate tests：

```text
huabu/apps/web/src/lcos/lcosCollectionPresentationState.test.ts
```

验证：

```text
collapse changes only presentation state
expand restores state
no geometry stored
```

Canvas projection tests：

```text
collapsed:
hosted children render hidden
authoritative source nodes unchanged

expanded:
same source node geometry returns
```

---

# 18. Browser Acceptance

放到现有：

```text
huabu/apps/web/e2e/canvas-mouse.spec.ts
```

或拆一个 LCOS 专用 spec，取决于现 e2e 组织，不另造 test harness。

必须手跑：

## BA-01 collapsed left-drop

```text
A 在 Collection 外
拖到 collapsed Collection
release

assert:
Collection count +1
A 屏幕位置不变
Collection 不自动展开
无 chooser
```

---

## BA-02 expanded left-drop

```text
展开 Collection
左拖 A 到 host 内
release

assert:
A 最终中心与 release point 近似一致
A 不回弹
A parent = Collection frame
Frame fit
canonical membership exists
```

---

## BA-03 right-drag

```text
A → expanded Collection
right drag

assert:
membership exists
A x/y/parent unchanged
target 可显示 membership cue
```

---

## BA-04 multi-membership

```text
A ∈ Collection 1
A ∈ Collection 2

left-hosted in C1

assert:
C1 shows real body
C2 shows proxy/cue
same canvas only one authoritative binding
```

---

## BA-05 re-host

```text
A 从 expanded C1
左拖到 expanded C2

assert:
parent moves C1 → C2
A 仍然是 C1 canonical member
```

---

## BA-06 drag out

```text
A 从 Collection host 拖到外面

assert:
spatial host removed
canonical membership remains
```

---

## BA-07 collapse persistence

```text
手动排 5 个 hosted members
collapse
expand

assert:
5 个 geometry 恢复
无重新 Grid
无 random fan-out
```

---

## BA-08 network unknown result

模拟：

```text
SET_NODE_PARENT server applied
response lost
```

assert：

```text
postcondition requery recovers success
不显示假失败
不重复 membership
```

---

# 19. Recovery / Rollback

## Core membership fails

```text
不 manifest spatial host
保用户当前 spatial state
drop preview → failure
```

---

## Core success / spatial fail

```text
canonical membership 保留
spatial state 保留可恢复
不做 distributed rollback
retry/reconcile later
```

---

## Collection Frame stale binding

```text
ProjectionBinding repair
→ recreate Frame
→ 不从 canonical membership 自动 reparent members
```

---

## Collapse UI state corruption

```text
reset fold UI state
authoritative Huabu geometry 未损
```

这正是 fold state 不存 geometry 的价值。

---

# 20. Blast Radius

## T1 direct

```text
Collection projection
Collection host manifestation
Huabu display projection seam
fold presentation state
```

## T3 cross-review

```text
native reparent bypass
left/right semantic drop acquisition/commit
```

## T6 dependency

```text
canonical collection identity
membership add/remove transaction
Collection read/list
```

## T5 later fill

```text
collapsed body
expanded host morphology
accept feedback
proxy cue
fan-out / settle motion
LOD
```

## explicitly unaffected

```text
native Huabu Frame behavior
generic Huabu drag/drop
Project Relation
Workflow composition
Context derived Atlas
Railway
Worksite identity
```

---

# 21. 给 T5 的 Engineering Seam 摘要

T5 可直接依赖：

```text
Collection COLLAPSED
= compact semantic target
= no spatial hosting on drop

Collection EXPANDED
= real Huabu Frame host

HOSTED MEMBER
= real authoritative spatial body

SEMANTIC-ONLY MEMBER
= derived proxy / cue

LEFT DROP → EXPANDED
= stays at release point
= host fit
= optional minimal local settle

RIGHT DROP
= source never moves

COLLAPSE
= geometry preserved
= display-only fold

EXPAND
= restore same geometry

MULTI-MEMBERSHIP
= one real body + other Collection proxies
```

T5 不能再设计：

- collapsed Collection 自动吞进去后展开；
- 每个 Collection 都复制一份真实成员 body；
- drag out 自动删除 membership；
- Collection 每次展开都强制 Grid；
- Collection child canvas；
- Collection 专属第二 canvas runtime。

---

# 22. Step 2A 状态

```text
PRODUCT OPEN = NONE
EXACT OWNER = RESOLVED
HUABU PRIMITIVE = RESOLVED
CURRENT LEGACY OWNER = IDENTIFIED / RETIRE
CORE DEPENDENCY = T6 CANONICAL COLLECTION API
T3 DEPENDENCY = CORE-FIRST DROP + NATIVE REPARENT BYPASS
T5 INPUT = READY
S9 LOCAL SETTLE = DEFERRED BY DESIGN
```

下一条按原顺序：

```text
Step 2B
Professional Window Occupancy + Camera Freeze
Exact-Source Drill-down
```
