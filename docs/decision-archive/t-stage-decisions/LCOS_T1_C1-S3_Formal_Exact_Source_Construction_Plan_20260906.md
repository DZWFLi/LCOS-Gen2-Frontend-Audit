# LCOS Gen2 · T1 Phase C1-S3
## Formal Exact Source Construction Plan
### T1 → T5 → C3 回填前的源码施工正本 · 2026-09-06

> 文档性质：T1 Phase C1 正式交付 03 / 03  
> 状态：SOURCE PLAN READY / WAIT T5 C2 VISUAL BACKFILL BEFORE PRODUCTION CODING  
> 目标：在不重新造 Huabu、不越权重裁产品语义的前提下，把 T1 空间 / HUD / LOD / Collection / Colony / Layout 的源码施工拆成小步、可验收、可回滚的 wave。

---

# 0. 最终施工口令

本轮 T1 只做：

> **canonical semantics 的薄适配 + Huabu mature primitive 的复用 + LCOS presentation seam + acceptance。**

不做：

- 新 canvas runtime；
- 新 geometry database；
- 新 membership database；
- 新 viewport store；
- 新 overlay window system；
- 新 full layout engine；
- 新 archive truth；
- 新 gesture grammar。

所有 Wave 在进入生产 coding 前还要接收 T5 C2 的 visual patch。

---

# 1. Coding Gate

## 1.1 现在已经可以做的

- exact-file plan；
- type/interface skeleton；
- test matrix；
- owner contract；
- donor adoption plan；
- migration/retirement plan；
- T5 visual input。

## 1.2 现在先不写 production implementation

因为 T5 还要回填：

- morphology；
- dimensions；
- spacing；
- motion；
- glyph；
- opacity；
- threshold feedback；
- occupied-space presentation；
- Collection/Colony/fixed-screen identity final visuals。

若现在把 UI 数值写死，C3 会产生无意义返工。

## 1.3 可以提前冻结的非视觉 mechanics

- one authoritative projection；
- Collection Core-first membership；
- right-drag no spatial move；
- Frame reuse；
- display-only collapse；
- PW resize camera freeze；
- Colony derive-only contour；
- Archive fresh placement；
- local settle bounded；
- failure recovery strategy。

---

# 2. Wave 0 · Cross-thread Contract Freeze

这一 Wave 不造 UI。

目的：

先把 T1 依赖的外部 producer 类型固定，避免施工过程中自己补假接口。

## 2.1 T6 contract

需要：

```text
Collection canonical read
Collection membership add/remove
Collection nesting
Archive eligibility/lifecycle
Colony membership commit
```

T1 acceptance：

- canonical entity id 稳定；
- membership mutation 可重读；
- archive state 可观察；
- 不把 x/y 放 Core contract。

## 2.2 T3 contract

需要 resolved semantic drop：

```text
gesture kind
source projection
target entity
target projection if visible
visible-host vs remote
release world point
```

并能触发 native reparent bypass。

## 2.3 T4 contract

需要：

```text
ProfessionalWindowEnvironment
viewportResizePolicy
ProjectSession host context
```

禁止 T1 fallback 到 DOM width。

## 2.4 Exit

所有 producer contract 有明确 owner。

没有 producer 的，T1 test 用 fake，不自己做 canonical implementation。

---

# 3. Wave 1 · Projection Foundation

目标：

先让 Collection / lifecycle / display presentation 能建立在正确 projection identity 上。

---

## C1-01 · Extend canonical projection entity types

### MODIFY

`apps/web-gen2/src/spatial/projectionBinding.ts`

`apps/web-gen2/src/spatial/projectToSpaceProjection.ts`

可能相关：

`apps/web-gen2/src/spatial/types.ts`

### CHANGE

- support canonical Collection entity；
- map Collection spatial body → Huabu `frame`；
- binding identity 仍是 canonical key；
- 不增加 instanceId。

### ACCEPTANCE

- same Collection same canvas same spatialKind → one binding；
- same Collection different canvas → each canvas allowed one；
- Collection membership count 不影响 projection count。

---

## C1-02 · Projection facade adopts canonical Collection client

### MODIFY

`apps/web-gen2/src/host/projectionFacade.ts`

### DEPENDENCY

T6 canonical Collection API。

### CHANGE

- facade 能 query Collection；
- projection runner 可确保 Collection Frame；
- 不从 old Presentation `memberViewIds` 读 truth。

### ACCEPTANCE

旧 Presentation 服务断开后，Collection Frame 仍可从 canonical owner materialize。

---

## C1-03 · Reconciliation understands Collection projection only

### MODIFY

`apps/web-gen2/src/spatial/reconciliationRunner.ts`

### CHANGE

Reconciler 可：

- ensure canonical Collection frame projection；
- repair missing binding；
- remove invalid active projection based on lifecycle consumer。

Reconciler 不可：

- 因为 entity 是 Collection member 就自动 `SET_NODE_PARENT`；
- 把所有 many-to-many membership spatially materialize；
- 恢复旧 ArtifactView x/y。

### TEST

reconcile 两次无 duplicate authoritative Collection Frame。

---

# 4. Wave 2 · Collection Visible Host

这是旧 Step2A 的正式吸收位置。

---

## C2-01 · Collection host manifestation adapter

### NEW

`apps/web-gen2/src/spatial/collectionHostProjection.ts`

### RESPONSIBILITY

只做：

- semantic commit 后的 current projection hosting；
- postcondition recovery。

### PSEUDO

```text
ensureHosted(projectionId, collectionFrameId):
  current = queryNode(projectionId)
  if current.parentId == collectionFrameId:
      return success

  execute SET_NODE_PARENT

  if response success:
      return success

  current2 = queryNode(projectionId)
  if current2.parentId == collectionFrameId:
      return recovered-success

  return recoverable-spatial-failure
```

### DO NOT

- update membership；
- perform drag intent recognition；
- rollback Core；
- invent coordinate transforms。

---

## C2-02 · Native reparent bypass integration

### REUSE

`huabu/apps/web/src/handler/snap/snapSession.ts`

`huabu/apps/web/src/handler/canvasCommand/resolvers/resolveNodeDragStop.ts`

### CHANGE

LCOS/T3 resolved Collection semantic target 时：

- normal drag geometry can commit；
- native automatic reparent is bypassed；
- T1 waits Core success；
- then host adapter runs.

### BLAST RADIUS

不得改变普通 Huabu drag。

LCOS feature flag / host extension path only。

---

## C2-03 · Collection presentation fold state

### NEW

Suggested:

`huabu/apps/web/src/lcos/lcosCollectionPresentationState.ts`

### STATE

```ts
Map<spatialId, 'collapsed' | 'expanded'>
```

### DO NOT STORE

- member ids；
- geometry；
- membership；
- layout;
- canonical truth。

### DURABILITY

session/presentation only。

如果后续产品决定持久化 fold preference，也只能持久化 presentation preference，不升级成 Core semantic。

---

## C2-04 · Domain-neutral display projection seam

### MODIFY

- `huabu/apps/web/src/lcos-seam/types.ts`
- `apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx`
- `apps/web-gen2/src/host/hostSeam.ts`
- `huabu/apps/web/src/lcos/useLcosCanvasProps.tsx`
- `huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

### PURPOSE

让 LCOS host 能声明：

- authoritative node body 当前怎样 display；
- hosted child bodies 是否显示；
- compact Collection body。

### DESIGN RULE

seam 应尽量 domain-neutral。

Huabu 不需要理解“Collection membership”。

Huabu 只理解 display projection。

---

## C2-05 · Multi-membership proxy presentation

### NEW / MODIFY

最终 exact file 可在 T5 renderer patch 后确定。

逻辑必须区分：

- authoritative body；
- membership proxy/reference cue。

### TEST

same entity A+B membership：

- binding 仍一份；
- B cue 不注册第二 authoritative binding；
- hit / focus 能回 canonical entity。

---

# 5. Wave 3 · Professional Window / HUD / Focus

---

## C3-01 · Adopt T4 ProfessionalWindowEnvironment

### MODIFY

Host seam / relevant interaction presentation layer。

以 T4 最终 file path 为 source of truth。

### T1 CONSUMERS

- Focus；
- fixed-screen identity；
- Marker；
- Pin；
- Locator；
- Minimap；
- edge regions；
- T1-owned transient feedback。

### DO NOT

- persist safeRect；
- hardcode PW width；
- query DOM。

---

## C3-02 · Overlay arbitration migration

### MODIFY

`apps/web-gen2/src/interaction/overlayArbitration.ts`

### OLD

`workViewOpen → ['work-view']`

### NEW PRINCIPLE

Arbitration 返回：

- coexistence eligibility；
- priority；
- placement constraints / environment consumer。

具体 data shape 与 T4/T2 final seam 对齐。

### ACCEPTANCE

PW open：

- Focus HUD 可存在并避让；
- Composer/ActionArc 按 owner rule 避让；
- 不全局消失。

---

## C3-03 · LCOS Host Overlay wires real consumers

### MODIFY

`huabu/apps/web/src/lcos/LcosHostOverlay.tsx`

### CURRENT

Composer real。

FocusHUD / ActionArc / WorkView booleans 仍 placeholder。

### CHANGE

不在这里造新状态机。

只接：

- host-provided overlay state；
- T4 environment；
- renderer/slot。

### T5 BACKFILL

最终 component body / placement / motion。

---

## C3-04 · Focus camera consumer

### NEW OR CONNECT

最终 file 以 existing host conventions 为准。

职责：

```text
explicit Focus target
+ current world bounds
+ ProfessionalWindow safeRect
→ camera framing request
```

### INVARIANTS

- explicit Focus may change camera；
- WorkView passive resize may not；
- Focus 不改 selection/membership，除非上游明确另有 user action；
- archived target 打 archive viewer，不 auto restore。

---

## C3-05 · Fixed-screen identity projector

### NEW THIN PRESENTATION MODULE

建议职责：

```text
world node bounds
+ viewport
+ zoom
+ environment
→ screen-space identity placement
```

服务：

- distant identity；
- Pin/Marker/Locator shared placement basis。

不得成为 new canonical node store。

---

# 6. Wave 4 · Colony Derive-only Presentation

---

## C4-01 · Surface-local Colony presentation state

### NEW

Suggested web-gen2 or Huabu LCOS host module.

保存：

- colony id；
- member ids / surface-local membership reference；
- current interaction state。

不保存：

- contour points。

canonical member commit 仍依赖 T6 owner。

---

## C4-02 · Colony geometry projection

### NEW

输入：

- member spatial ids；
- Huabu current node bounds。

输出：

- derived contour；
- hull/field geometry；
- render data。

### PURE RULE

尽量 pure function。

没有 Core side effect。

### TEST

移动任何 member：

重新 derive contour；

Core untouched。

---

## C4-03 · Peel session

### NEW

负责：

- candidate；
- pointer/session state；
- threshold；
- neck/tether geometry；
- preview；
- commit/cancel；
- settle trigger。

### COMMIT

只提交 member delta。

不提交 contour。

### T5 BACKFILL

- neck style；
- elasticity；
- threshold cue；
- duration；
- opacity/material。

---

## C4-04 · Rescope preview

### NEW

输入 proposed member set。

派生 preview contour。

Commit 后：

- T6 membership owner 更新；
- T1 derive current contour。

### DO NOT

提供 permanent contour handles。

---

# 7. Wave 5 · Archive Projection Lifecycle

此 Wave 依赖 T6 canonical archive owner 落地。

---

## C5-01 · Projection eligibility consumer

### MODIFY / NEW

围绕：

`apps/web-gen2/src/host/lifecycleReconciler.ts`

`apps/web-gen2/src/spatial/reconciliationRunner.ts`

### RULE

archive active → inactive：

- remove current active spatial projection；
- clean/reconcile binding；
- canonical entity remains archive-owned。

### DO NOT

把 archive 写进 Huabu node metadata 当 truth。

---

## C5-02 · Restore fresh placement

### NEW thin placement policy

输入：

- restored canonical entity；
- current canvas；
- current safe visible region；
- existing nearby geometry。

输出：

- fresh initial geometry。

### MUST NOT READ

old `ArtifactView.position` as authoritative restore coordinate。

### ACCEPTANCE

Archive at (100,100) → restore：

不要求回 (100,100)。

same canonical entity id remains。

---

## C5-03 · Archived Focus/Search routing

T6/T2/T1 shared integration。

规则：

- archived result → archive viewer；
- explicit restore separate action；
- viewer open 不 materialize canvas projection。

---

# 8. Wave 6 · Layout / Settle Quality

---

## C6-01 · Keep native Huabu layout paths

No fork for:

- Grid；
- Row；
- Column；
- Frame fit；
- Snap；
- structured insertion。

Explicit presentation layout commands directly reuse Huabu。

---

## C6-02 · Minimal local settle

### NEW thin geometry function

建议纯 geometry module：

`apps/web-gen2/src/spatial/localSettle.ts`

最终路径可按 repo convention 调整。

### INPUT

- newly placed node；
- local neighbor bounds；
- frame bounds；
- locked ids；
- max displacement；
- spacing token。

### OUTPUT

minimal geometry deltas。

### PROPERTIES

- deterministic；
- local；
- bounded；
- stable；
- no canonical side effects；
- no global reorder。

### ALGORITHM POLICY

先做最薄可验收版本。

不得一上来复制 Gen1 全 solver。

### DONOR

Gen1 `collectionExpandLayout.ts` / Spatial behavior 仅作参考。

---

## C6-03 · Settle execution

用 existing RFS geometry commands。

避免 direct store mutation。

同一 settle batch：

- geometry deltas；
- frame fit；
- undo semantic 与 Huabu 对齐。

---

# 9. Wave 7 · LOD / Final Presentation Integration

等 T5 C2 返回后执行。

---

## C7-01 · Renderer registry final bodies

修改 current node presentation / renderer paths。

将 T5：

- morphology；
- compact body；
- identity glyph；
- fixed-screen state；

映到 existing presentation contract。

不创建 parallel renderer runtime。

---

## C7-02 · Collection visuals

填：

- collapsed body；
- expanded host boundary；
- title；
- receptive；
- proxy；
- transition；
- explicit layout UI。

## C7-03 · Colony visuals

填：

- field；
- neck；
- tether；
- peel；
- dissolve；
- rescope。

## C7-04 · HUD visuals

填：

- Marker；
- Pin；
- Locator；
- Minimap；
- Focus；
- fixed-screen identity；
- occupied-space relocation。

## C7-05 · Archive visuals

填：

- archive viewer；
- cold state；
- restore arrival。

---

# 10. Unit / Integration Test Plan

## 10.1 Projection identity

File suggestion：

`apps/web-gen2/test/projection-binding-collection.test.ts`

Cases：

- Collection same canvas idempotent；
- different canvas permitted；
- multi membership no duplicate body；
- proxy not authoritative binding。

## 10.2 Collection host

`apps/web-gen2/test/collection-host-projection.test.ts`

Cases：

1. current parent already target → no-op success；
2. command succeeds；
3. response lost but parent applied → recovered success；
4. command fails and parent unchanged → recoverable failure；
5. Core success/spatial failure → membership not rollback；
6. right-drag → no host call；
7. collapsed left-drop → no host call。

## 10.3 Fold/display projection

Huabu LCOS seam tests：

- collapse hides hosted bodies only；
- geometry unchanged；
- expand restores prior manual geometry；
- no duplicate nodes；
- hit/focus canonical ids stable。

## 10.4 Overlay / PW

- PW environment changes safeRect；
- no hardcoded width dependency；
- FocusHUD relocates；
- WorkView no longer forces all overlays absent；
- no camera mutation from environment-only update。

## 10.5 Camera freeze

Capture transform:

```text
before
open PW
resize PW
close PW
after
```

Expect transform same.

Then explicit Focus:

expect transform allowed to change.

## 10.6 Colony

- contour = deterministic function(member bounds)；
- geometry move → contour changes；
- no Core contour write；
- peel cancel no membership change；
- peel commit writes membership delta only；
- rescope preview no canonical commit；
- dissolve removes presentation semantic correctly。

## 10.7 Archive

After T6 owner available：

- archive removes active projection；
- archive does not delete canonical entity；
- restore same identity；
- fresh placement differs from stale old view position；
- archived Focus opens archive viewer；
- viewer does not auto restore。

## 10.8 Local settle

- no overlap/simple case；
- one neighbor；
- many neighbors；
- locked neighbor；
- near frame edge；
- deterministic repeat；
- max displacement respected；
- explicit Grid bypasses free-settle path；
- reduced-motion final geometry same。

---

# 11. Browser Acceptance Matrix

## BA-01 · Collapsed Collection left drop

Given：

- Collection collapsed；
- source visible elsewhere。

Action：

left-drag source to Collection。

Expect：

- membership +1；
- source x/y unchanged；
- parent unchanged；
- no auto-expand；
- compact target gives accepted feedback；
- no chooser。

## BA-02 · Expanded Collection left drop

Expect：

- membership exists；
- source stays at release point；
- parent becomes target frame；
- frame fits；
- local settle only if necessary；
- no unexpected Grid。

## BA-03 · Right drag

Expect：

- membership +1；
- x/y/parent unchanged；
- target feedback；
- no spatial flight.

## BA-04 · Multi-membership

A and B membership.

Expect：

- one authoritative body；
- other Collection cue clearly secondary；
- Focus proxy resolves same canonical entity。

## BA-05 · Rehost

A-hosted entity left-dropped to B.

Expect：

- spatial parent=B；
- membership A remains；
- no duplicate body。

## BA-06 · Drag out

Expect：

- spatial parent exits frame；
- Collection membership remains。

## BA-07 · Collapse / expand

User manually arranged five nodes.

Collapse → expand.

Expect：

- manual geometry preserved；
- no random fanout；
- no auto Grid。

## BA-08 · Lost RFS response

Parent command applied but response lost.

Expect：

- postcondition query recognizes target parent；
- no duplicate retry side effect；
- UI settles to success。

## BA-09 · Work View open

Expect：

- camera unchanged；
- safeRect shrinks；
- relevant HUD relocates；
- no global HUD disappearance。

## BA-10 · Work View resize

Expect：

- world objects screen movement only from container clipping/available view, not camera transform mutation；
- HUD continuously reflows。

## BA-11 · Explicit Focus under PW

Target near occupied edge.

Expect：

- camera frames target into safeRect；
- PW remains；
- no membership/selection mutation beyond explicit owner behavior。

## BA-12 · Distant identity

Zoom far out.

Expect：

- identity remains perceivable；
- no tiny unusable dot；
- no duplicate canonical node。

## BA-13 · Colony peel cancel

Expect：

- elastic preview；
- cancel returns；
- membership unchanged；
- contour re-derives stable。

## BA-14 · Colony peel commit

Expect：

- membership delta commits；
- contour updates；
- no contour-point mutation。

## BA-15 · Archive

Expect：

- active projection removed；
- archive viewer accessible；
- no hidden active body remains。

## BA-16 · Restore

Expect：

- same entity；
- new/fresh placement；
- no stale old-coordinate resurrection。

---

# 12. Failure / Recovery Rules

## 12.1 Canonical semantics always win

如果 canonical commit 已成功但 presentation 失败：

优先恢复 presentation。

不 rollback canonical truth 以迁就画布。

## 12.2 No blind retries on non-idempotent RFS

先 requery postcondition。

只在明确未应用时 retry。

## 12.3 Visual preview is disposable

drop preview / peel preview / receptive state：

都不是 truth。

session abort：

可直接清除。

## 12.4 Reconciler is not a hidden semantic engine

Reconciler：

修复 projection/binding。

不能根据 UI 猜 membership。

---

# 13. Migration / Retirement Order

按这个顺序，避免旧 owner 与新 owner 同时写。

## M1

先引入 canonical Collection read path。

## M2

Projection uses Collection canonical identity。

## M3

新增 spatial host adapter / display projection。

## M4

停止新代码读取 old Presentation memberViewIds。

## M5

旧 Scope/Workspace presentation 路径进入 compatibility only。

## M6

modern Colony derive-only 路径落地后，停止 contour point write。

## M7

T6 archive lifecycle ready 后，T1 停止任何 legacy “recover old view position” 路径。

## M8

最终清理只在 integration tests 证明新 owner 稳定后进行。

---

# 14. Exact File Change Ledger

## Existing · MODIFY

`apps/web-gen2/src/spatial/projectionBinding.ts`

`apps/web-gen2/src/spatial/projectToSpaceProjection.ts`

`apps/web-gen2/src/host/projectionFacade.ts`

`apps/web-gen2/src/spatial/reconciliationRunner.ts`

`apps/web-gen2/src/interaction/overlayArbitration.ts`

`apps/web-gen2/src/integration/huabu/LcosCanvasAdapter.tsx`

`apps/web-gen2/src/host/hostSeam.ts`

`huabu/apps/web/src/lcos-seam/types.ts`

`huabu/apps/web/src/lcos/useLcosCanvasProps.tsx`

`huabu/apps/web/src/lcos/LcosHostOverlay.tsx`

`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`

Potential current presentation files：

`apps/web-gen2/src/presentation/*`

node presentation / renderer registry exact names以 current tree 为准。

## Existing · REUSE, avoid fork

`huabu/packages/shared/src/canvas-engine/container/mutation.ts`

`huabu/packages/shared/src/canvas-engine/frame/projection.ts`

`huabu/packages/shared/src/canvas-engine/commands/setNodeParent.ts`

`huabu/packages/shared/src/canvas-engine/executor.ts`

`huabu/apps/web/src/components/Nodes/frame/FrameNode.tsx`

`huabu/apps/web/src/store/canvasStore.ts`

`huabu/apps/web/src/handler/canvasCommand/resolvers/resolveNodeDragStop.ts`

`huabu/apps/web/src/handler/snap/snapSession.ts`

## Suggested · NEW thin files

`apps/web-gen2/src/spatial/collectionHostProjection.ts`

`apps/web-gen2/src/spatial/localSettle.ts`

Colony：

`apps/web-gen2/src/spatial/colonyGeometryProjection.ts`

`apps/web-gen2/src/interaction/colonyPeelSession.ts`

`apps/web-gen2/src/interaction/colonyRescopePreview.ts`

Host/presentation：

`huabu/apps/web/src/lcos/lcosCollectionPresentationState.ts`

fixed-screen projector / focus consumer file name应在 C3 对现有目录命名再贴合，不强行提前发明名字。

## RETIRE AS OWNER

`apps/local-core/src/presentation-application-service.ts`

其中旧 presentation/member/contour owner semantics。

注意：

RETIRE AS OWNER ≠ 立即删文件。

先迁移 consumer，再删。

---

# 15. T5 C2 Backfill Checklist

T5 返回时，T1 需要可执行数值，而不是只有“更高级一点”。

## Collection

- collapsed width/height range；
- expanded frame padding；
- title position；
- member cue；
- proxy appearance；
- receptive visual；
- accepted visual；
- expansion duration/easing；
- free→Grid transition；
- label policy。

## Colony

- contour thickness/field strength；
- padding around members；
- neck/tether width；
- peel threshold visual mapping；
- settle easing；
- dissolve；
- selected/hovered states；
- reduced-motion equivalent。

## HUD

- safe edge margin；
- marker size；
- fixed-screen identity min/max size；
- label reveal；
- clustering；
- Pin/Locator differentiation；
- Minimap footprint；
- collision priority；
- PW narrow-state behavior。

## Focus

- framing margin；
- focus duration；
- selected vs merely located visual；
- archived target behavior visual。

## Restore

- arrival scale/opacity/motion；
- fresh-placement acknowledgment；
- crowded-area behavior。

## LOD

- thresholds or threshold intent；
- full/compact/identity states；
- transition hysteresis if needed；
- hover takeover；
- focus override。

---

# 16. C3 Backfill Procedure

T5 C2 完成后：

1. T1 不重新讨论 semantics；
2. 把视觉参数落到 S1/S2/S4/S6/S8/S9；
3. 对每个参数标：
   - CSS/token；
   - renderer prop；
   - state-machine threshold；
   - motion config；
   - geometry constant；
4. 更新 exact file ledger；
5. 跑 browser acceptance；
6. 若视觉要求需要新增 canonical data，立即标红退回，不偷偷实现；
7. 只做 presentation/mechanics 范围内的适配。

---

# 17. Small-Step Build Order

为了“小步快跑”又不返工，实际 coding 建议：

### Session 1
Projection identity + canonical Collection Frame only.

Done before next：
- one binding；
- one frame；
- tests green。

### Session 2
Expanded visible-host Core-first manifestation.

Done：
- left-drop；
- right-drag no move；
- response-loss recovery。

### Session 3
Collapse/display projection.

Done：
- geometry preservation；
- no duplicate node；
- no auto-expand。

### Session 4
T4 occupancy consumer + camera freeze acceptance.

Done：
- no hardcoded width；
- PW resize camera invariant；
- overlay coexistence.

### Session 5
Focus / fixed-screen identity base.

Done：
- one world truth；
- safeRect-aware placement。

### Session 6
Colony derive-only base.

Done：
- pure contour；
- peel preview；
- no contour Core write。

### Session 7
Archive projection consumer after T6 lifecycle ready.

Done：
- remove active；
- restore same id/fresh position。

### Session 8
local settle.

Done：
- bounded/local/deterministic；
- no default Grid。

### Session 9
T5 visual integration.

Done：
- state boards implemented；
- reduced motion；
- collision cases。

### Session 10
Cross-surface browser acceptance + migration retirement.

No next session until debt list clear.

---

# 18. Final Done / Acceptance Checklist

T1 不能用“能跑”作为 Done。

必须逐项：

- [ ] same-canvas one authoritative projection
- [ ] Collection canonical membership not old Presentation
- [ ] expanded left-drop Core-first
- [ ] expanded left-drop preserves release position
- [ ] right-drag never spatially moves source
- [ ] collapsed target no auto-expand
- [ ] multi-membership no duplicate truth
- [ ] collapse/expand geometry preserved
- [ ] native Huabu Frame mechanics reused
- [ ] no parallel drag resolver
- [ ] no DOM-derived PW width
- [ ] PW resize camera unchanged
- [ ] Focus can explicitly frame safeRect
- [ ] HUD can coexist with PW
- [ ] fixed-screen identity does not create duplicate node
- [ ] Colony contour derived only
- [ ] peel/rescope commits membership, not contour
- [ ] Archive active projection removed
- [ ] Restore same identity + fresh placement
- [ ] no old ArtifactView x/y restore
- [ ] free layout not silently Grid
- [ ] local settle bounded/deterministic
- [ ] reduced motion final geometry same
- [ ] Core success/spatial failure recoverable
- [ ] non-idempotent RFS uses postcondition query
- [ ] T5 visual values integrated without new canonical truth
- [ ] browser acceptance BA-01 ~ BA-16 pass

任何一项欠账：

停止进入下一 Session。

---

# 19. 给 T5 的最终施工交接

T5 现在不需要等 T1 再读更多历史。

请以：

1. Phase B final verdict；
2. T1 C1-S1 Current Source Exact Map；
3. T1 C1-S2 Engineering Seam Skeleton；

为 GUI 规划输入。

本 C1-S3 的用途是：

当 T5 设计某个视觉状态时，能够知道它最终会落到：

- 哪个 current source；
- 哪条 thin seam；
- 哪个 owner；
- 哪个 test；
- 哪个 failure path。

T5 不负责把这些源文件全读完。

T5 只需保证最终 visual patch 没有反向要求错误语义。

---

# 20. 状态

```text
T1 Stage A              CLOSED
Phase B cross-thread    CLOSED
T1 C1-S1                READY
T1 C1-S2                READY / T5 DESIGN INPUT
T1 C1-S3                READY
Old Step2A              ABSORBED / EVIDENCE ONLY

Production Coding       HOLD FOR T5 C2 VISUAL BACKFILL
Product Semantics       NO OPEN
Cross-thread Contracts  OWNER-IDENTIFIED
Current Source Gaps     EXPLICIT, NOT HIDDEN
```

最终判断：

> **T1 已经到“应该交给 T5 做真正 GUI 设计”的点。继续扩大历史阅读的边际收益已经低于它对上下文与施工节奏的损害。下一轮重点应是 T5 C2，而不是再开第五轮概念考古。**

---

# Appendix A · Wave Dependency DAG

施工不要按文件目录顺序，而按语义依赖。

```text
T6 Collection API ─────┐
                       ├─> Wave 1 Projection
T3 Drop Intent ────────┤        │
                       │        └─> Wave 2 Collection Host
Huabu primitives ──────┘

T4 PW Environment ──────────────> Wave 3 HUD/Focus
                                      │
T5 C2 visual ─────────────────────────┼─> Wave 7 Presentation
                                      │
T6 Colony membership ──> Wave 4 ──────┤
T6 Archive lifecycle ──> Wave 5 ──────┤
Huabu geometry ────────> Wave 6 ──────┘
```

如果某 producer 延迟：

- 不阻塞其它独立 Wave；
- 用 interface fake 做 test；
- 不让 T1 temporary implementation 变成事实 owner。

---

# Appendix B · Per-Wave Commit Boundary

## Wave 1

一个 commit 只建立：

- Collection projection type；
- binding；
- reconcile。

不要同时做 UI。

Rollback：

可恢复到 artifact-only projection，不影响 Core data。

## Wave 2

建议拆 3 commits：

1. host adapter；
2. reparent bypass integration；
3. display projection/fold。

每个都单独测试。

尤其 display projection 不应和 semantic drop 混成一个巨大 PR。

## Wave 3

先 environment consumer，再 overlay migration，再 Focus/HUD renderer。

这样遇到视觉问题时可判断是：

- environment；
- arbitration；
- renderer。

## Wave 4

Colony pure geometry 先于 interaction。

顺序：

1. derive contour；
2. presentation；
3. peel session；
4. membership commit；
5. rescope。

如果 derive 都不稳定，不要先堆 elastic UI。

## Wave 5

T6 lifecycle API ready 后再接。

绝不提前用 metadata flag 临时冒充 archive。

## Wave 6

local settle 放后面。

理由：

native Frame/Drop correctness 比“落下后更漂亮”优先。

---

# Appendix C · Regression Risk Matrix

| Change | Main risk | Regression surface | Required guard |
|---|---|---|---|
| Collection entityType | binding collision | all projection | uniqueness tests |
| Frame mapping | wrong renderer/node type | canvas render | projection snapshot |
| reparent bypass | normal drag broken | all Huabu drag | host-only gating |
| host adapter | double parent command | Collection drop | postcondition query |
| display projection | hidden node loses interaction | Collection collapse | canonical id tests |
| overlay arbitration | Composer/Arc regression | all overlays | coexistence tests |
| PW env consumer | stale rect | resize/dock | environment update tests |
| camera policy | browser resize behavior damaged | Huabu global | LCOS-only policy |
| fixed-screen identity | duplicate hit target | zoom/focus | canonical mapping |
| Colony derive | geometry churn | drag performance | memoization/perf test |
| peel session | accidental commit | pointer cancel | session cancel tests |
| Archive consumer | data deletion | lifecycle | Core identity test |
| fresh placement | overlap | crowded canvas | local placement test |
| local settle | global drift | free layout | max displacement guard |
| T5 motion | geometry coupled to animation | reduced motion | same-final-state test |

---

# Appendix D · Observability / Debug Hooks

为了后期不要靠肉眼猜“为什么节点飞了”，建议施工时保留开发态 debug event，生产可关闭。

建议 event 类别：

```text
projection.ensure
collection.membership.accepted
collection.host.requested
collection.host.recovered
collection.host.failed
displayProjection.changed
pw.environment.changed
camera.focus.requested
camera.resize.suppressed
colony.derive
colony.peel.threshold
archive.projection.removed
restore.projection.created
settle.applied
```

要求：

- 不记录敏感 content；
- 不把 debug event 变 canonical state；
- 可用于 browser acceptance 与失败定位。

---

# Appendix E · Rollback Strategy

## E.1 Collection projection

若新 Collection projection renderer 出问题：

- canonical membership 不回滚；
- 可暂时隐藏/禁用 new visual path；
- binding migration保留。

## E.2 Spatial host

若 `SET_NODE_PARENT` manifestation 出问题：

- canonical membership 保留；
- node 可暂时留原 parent；
- 显示 recoverable state；
- reconcile later。

## E.3 Display projection

若 collapse 视觉有 regression：

- fallback expanded presentation；
- authoritative geometry 不受影响。

## E.4 PW/HUD

若某 HUD occupancy consumer失败：

- fallback safe placement/compact；
- 不修改 camera。

## E.5 Colony

若 peel interaction失败：

- disable peel session；
- derived idle Colony仍可存在；
- membership unchanged。

## E.6 Archive restore

若 fresh placement失败：

- restored entity保持 active canonical state；
- projection 可进入 pending materialization；
- 不恢复 stale old x/y 作为“救急”。

---

# Appendix F · Performance Budget Intent

这不是最终 profiling 数字，但施工时要守住结构预算。

## F.1 Collection

- collapse/expand 不复制 child node trees；
- display projection应复用 existing nodes；
- local settle只查 local neighbors。

## F.2 HUD

- occupied rect update 不触发 whole-project recompute；
- screen-space identities由 current viewport派生；
- marker clustering只作用当前可见/边缘候选。

## F.3 Colony

derive contour：

- 只跟 member geometry revision 变化；
- pointer peel preview可局部更新；
- 不每帧写 Core。

## F.4 Reconcile

不得用：

“每帧扫描所有 canonical Collection 并 reparent members”。

Reconcile 是收敛机制，不是 render loop。

---

# Appendix G · T5 Patch → Exact Source Mapping Template

C2 回来后，T1 用这个格式回填，防止“视觉稿收到但不知道改哪”。

```text
Visual Requirement:
  Collection collapsed boundary = ...

State:
  collapsed / selected / receptive

Owner:
  T1 presentation

Current source:
  <exact file>

Change kind:
  token | renderer | state | motion | geometry

Canonical data impact:
  NONE

Test:
  <unit/browser case>

Reduced motion:
  <equivalent>

PW occupancy:
  <behavior>
```

每一条 visual requirement 都要有：

`Canonical data impact = NONE`

除非它本来就是其它线程已经冻结的 canonical contract。

一旦出现：

“为了这个视觉，需要 Core 多存一个 contour/position/instance”

必须停止，先检查是不是视觉反向污染架构。

---

# Appendix H · Final Construction Readiness

进入 production coding 前只需确认四件事：

1. T6 Collection / Archive / Colony membership contract exact type 可用；
2. T3 resolved drop intent contract 可用；
3. T4 `ProfessionalWindowEnvironment` / resize policy 可用；
4. T5 C2 state boards 与视觉参数已回填。

不需要：

- 再开一轮产品语义讨论；
- 再把 11 全读一次；
- 再把 donor 大包全盘全文复核；
- 为“保险”造 fallback canonical stores。

如果四项满足：

**直接按 Wave 1 → Wave 7 小步施工。**
