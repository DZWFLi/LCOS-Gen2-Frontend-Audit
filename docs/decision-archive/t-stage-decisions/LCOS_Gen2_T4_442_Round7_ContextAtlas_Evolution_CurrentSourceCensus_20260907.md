# LCOS Gen2 · T4 / 442 · Round 7

> **基线更正（2026-09-07）**：当前施工基线为 `LCOS_Gen2/main@232b2ca5...` + Huabu `a3c411e1...`。Context/Presentation/Checkpoint 相关非 `huabu/` 源码无变化，本报告结论可继承。

## Context Atlas / Context Evolution 当前源码普查

- 日期：2026-09-07
- 源码锚点：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`
- 性质：只读 current-source census；未修改仓库代码
- 结论：`CURRENT_SOURCE_GAP / REUSABLE_PRIMITIVES_EXIST`

---

## 1. 结论

Context Atlas 与 Context Evolution 的产品裁决已经足够明确，但当前源码中没有完整 owner：

- Atlas 应是整个 Project canonical truth 的派生总览，不维护人工 membership；
- Evolution 应是 Context 内的 2D professional instrument，不是第四 Surface；
- 两者都是 Presentation / read projection，不得另建 AtlasStore 或 Evolution truth；
- 当前仓库只有 Checkpoint refs、Presentation primitives、Project relations、Active Context、Context Manifest 等可复用材料；
- 尚无项目级 Atlas query/projection service，也无从 canonical history 自动派生 Evolution 的服务；
- 旧 `ContextSnapshot.branch()` 仍公开存在，且继续创建 collection Scope、克隆 ArtifactView、生成 x/y，与冻结裁决 D18 正面冲突。

颗粒度判断：足够进入文件级方案，但施工必须先做“退役旧 branch mutation + 定义派生 read model”，不能只写 Atlas/Evolution UI。

---

## 2. 冻结产品语义

依据 Phase B 四路合并裁决与 Context 考古稿：

```text
Context Surface
  ├─ Context Home / Atlas        项目级派生总览
  ├─ Evolution                   2D 专业视图
  ├─ Relationship / Provenance   Lens / Work View
  └─ Context scope worksite      进入具体自由画布
```

必须保持：

1. Atlas 不是第四一级 Surface；
2. 顶层 Context 不维护“哪些对象属于 Context”的 canonical membership；
3. Atlas 的时间、事情、来源、演进、关系来自 Project truth 的派生理解；
4. 点击 Atlas region 是 focus；打开/双击/Enter 才 resolve 对应 Context worksite；
5. Evolution / Relationship / Provenance 是专业呈现，不拥有业务 truth；
6. branch/fork、Collection membership、spatial placement、Worksite materialization 必须拆开；
7. 没有明确用户动作，不创建 Collection 或 Worksite。

---

## 3. 当前真实源码地图

### 3.1 ContextSnapshotService

已有能力：

- 基于 `checkpoints` 保存一组 refs；
- list / create / compare；
- refs 包含 workspaceId、scopeId、focusedViewIds、artifactIds、relationIds、noteIds、runIds；
- compare 只做集合 added / removed / kept；
- Checkpoint 是不可变历史载体，可保留。

不应被误认成 Atlas：

- 它不是项目级 Context 聚类或区域投影；
- 没有 topic/region/source/evolution 计算；
- 没有 Atlas navigation target；
- 没有 provenance aggregation；
- 没有 derived cache/version contract。

### 3.2 旧 branch mutation

`context-snapshot-service.ts:136-185` 当前执行：

```text
checkpoint refs
  → 创建 kind=collection 的 Scope（若未给 targetScopeId）
  → 找到 snapshot artifact 对应的所有 Views
  → 克隆 ArtifactView
  → 写入新 scopeId
  → 自动生成 x/y
```

`routes/context-snapshots.ts:73-93` 仍公开暴露：

```text
POST /projects/:id/context-snapshots/:snapshotId/branch
```

冻结裁决 D18 已明确这套组合 mutation 退休。因此这不是“将来再迁移”的无害旧代码，而是当前仍可被调用的产品冲突入口。

### 3.3 Presentation primitives

`packages/contracts/src/presentations.ts` 已有：

- `SurfaceComponentTypeV0: evolution / relationship-field / source-chain / structure-map / compare ...`；
- `SurfaceElementV0`：Presentation geometry + identity-only binding；
- `ContextTrackSegmentV0`；
- `PresentationStateV0.trackSegments`；
- Colony、position、hierarchy、presentationEdges、emphasis。

这些可承担 Atlas/Evolution 的呈现状态，但不能承担项目事实或派生结果的唯一来源。

### 3.4 Presentation persistence

`PresentationApplicationService`：

- CAS 版本控制；
- Project ownership 校验；
- `presentation.changed` 事件；
- Surface element、binding、colony 等结构校验；
- 不 bump Project graphVersion。

这是正确的“专业视图布局与用户呈现状态”owner。

### 3.5 Active Context / Context Manifest / Prompt serializer

这些是执行上下文链：

- Active Context：某 Project / Workspace 当前给执行使用的上下文投影；
- Context Proposal：AI 建议、Pending/Accept 类流程；
- Context Manifest / Prompt serializer：确定性组装执行输入，包含预算、文件摘录与 refs。

它们不是 Atlas。Atlas 可以读取其中的状态作为一种信号，但不能把“执行时选中的 Context”冒充“项目知道的一切”。

### 3.6 Project canonical materials

可供未来 Atlas projection 聚合：

- Artifact / Revision / View；
- Relation；
- Note 与 anchor；
- Run / Result / Checkpoint；
- Conversation identity / session / context relation；
- Workspace / Scope compatibility；
- provenance、availability、时间字段；
- Presentation 仅作为用户整理与视图状态。

---

## 4. 已确认的关键缺口

### P0-A · 退休 branch 仍是可写 HTTP 能力

必须在 Atlas/Evolution 施工前处理：

- 停止 UI 消费；
- 路由退役或显式 compatibility gate；
- 不允许新 UI 调用；
- 若保留历史兼容，必须清晰标识 legacy，且不能作为 Gen2 正式 mutation；
- 迁移与回滚方案需由获批 Sprint 明确。

### P0-B · Atlas 没有 canonical-derived read model

当前没有：

- `ContextAtlasSnapshot` contract；
- region/cluster identity 规则；
- Project graph/revision/checkpoint/event 到 Atlas 的派生逻辑；
- source/provenance/evolution/relationship 统一查询；
- navigation target resolution；
- stale/version/cache 语义；
- web-gen2 typed client。

因此不能让前端自行读取多个 API 后临时聚类并把结果保存为 truth。需要 Local Core 拥有确定性 query/projection service。

### P0-C · Evolution 只有手工 Presentation 数据，没有历史派生

`trackSegments` 与 `evolution` Surface element 只是结构槽位。源码没有把 Checkpoint、Revision、Run、Relation change 等转换成 Evolution Wave 的逻辑。

正确拆分应是：

```text
canonical historical facts
  → Evolution derived projection
  → Presentation stores viewport / selected lane / collapsed groups / annotations
```

不能把手工 `trackSegments` 当成项目演化事实。

---

## 5. Snapshot 当前实现的附加风险

### 5.1 phantom workspaceId

`create(projectId, label, workspaceId)` 查询不到 workspace 时不会报错，而是回退 root scope、空 membership；但 refs/checkpoint 仍可记录调用方传入的 workspaceId。这会生成带不存在 workspace 身份的快照。

需要测试并 fail-close：workspace 必须存在且属于当前 Project。

### 5.2 refs 完整性有限

- Relation 只按 artifactId 端点筛选，可能遗漏以 view/note/scope/workspace 为端点的相关关系；
- Note 只收 artifact/artifact_view anchor；
- Run 查询固定最多 200；
- Compare 只比较 ID 集合，不表达 Revision 变化、关系内容变化或对象状态变化；
- `snapshotJson` 被直接强制转换为 V1 contract，没有运行时 schema 校验。

因此现有 Compare 可作为低层 refs diff donor，不能直接充当 Evolution 的语义时间线。

### 5.3 branch 非 ChangeSet 安全包络

当前 branch 直接 `applyMutations` 分阶段创建 Scope 与 Views，没有呈现出统一的可审查 ChangeSet、用户预览或完整回滚语义。冻结裁决要求退休是合理的。

---

## 6. 前端现状

`apps/web-gen2` 当前没有：

- Context Atlas 页面/组件；
- Evolution professional body；
- Context Snapshot typed backend client；
- Atlas projection client；
- Atlas region focus/open reducer；
- Evolution selection/filter/compare state；
- 对 `presentation.changed` 的 Atlas/Evolution 专用消费链。

现有 node presentation / renderer registry 可复用视觉物种解析，但它们不是 Atlas 布局引擎。

---

## 7. 修正后的 owner 划分

| 数据/行为 | Owner |
|---|---|
| Artifact/Revision/Relation/Run/Checkpoint 等事实 | Local Core canonical repositories |
| Atlas regions、counts、source summary、navigation candidates | Local Core derived query/projection |
| Evolution lanes/events/deltas | Local Core derived history projection |
| viewport、focus、selected region、lane collapse、panel state | web-gen2 UI state / Presentation |
| 用户固定的视图元素与布局 | Presentation |
| 创建 Context worksite | 独立、明确的 canonical command；不得由 focus 暗中触发 |
| Snapshot history / refs compare | Checkpoint + ContextSnapshotService（修正后） |
| old branch collection/view clone | retired compatibility path |

---

## 8. 建议的文件级施工分层

### Ctx-A0 · 先消除冲突与补守卫

- `apps/local-core/src/context-snapshot-service.ts`
- `apps/local-core/src/routes/context-snapshots.ts`
- `apps/local-core/tests/context-snapshot-service.test.ts`
- 新增 HTTP route 测试

目标：phantom workspace fail-close；branch 退出正式能力面；V1 snapshot runtime validation；明确 compatibility 行为。

### Ctx-A1 · 定义派生 contracts

建议新增独立 contracts，而不是继续扩写 `packages/contracts/src/index.ts`：

- `context-atlas.ts`
- `context-evolution.ts`

至少包含：

- projection schemaVersion / projectId / sourceVersion；
- region identity、label、signals、counts、source/provenance summary；
- navigation candidate（existing worksite / resolvable context）；
- Evolution event/lane/delta 与 source refs；
- incomplete/stale/warnings；
- 查询 filter，不包含手工 membership truth。

### Ctx-A2 · Local Core derived services + routes

建议：

- `context-atlas-projection-service.ts`
- `context-evolution-projection-service.ts`
- `routes/context-atlas.ts`
- `routes/context-evolution.ts`

首版先做确定性、可解释派生，不做 AI 黑盒聚类。每个 region/event 必须能回指 source refs。

### Ctx-A3 · web-gen2 typed clients 与 UI state

- `backend/contextAtlas.ts`
- `backend/contextEvolution.ts`
- `backend/contextSnapshots.ts`
- `lcos/context/*`（具体位置需服从最终 App Shell / T5 回填）

UI state 只保存交互态；项目切换必须清空 stale selection；请求按 project/sourceVersion 防串线。

### Ctx-A4 · Professional Window bodies

- Context Home / Atlas；
- Evolution 2D body；
- Relationship / Provenance 后续 lens 接口位；
- region focus 与 open 分离；
- open existing worksite；无 worksite 时先显示明确创建动作，不自动创建。

---

## 9. 最低验收矩阵

1. Atlas 默认覆盖 Project 派生事实，不需要人工 membership；
2. 同一 canonical 输入产生确定性 projection；
3. 每个 region/event 可追溯 source refs；
4. Project 切换不泄漏 Atlas/Evolution 状态；
5. Presentation 布局变化不改变 Project truth；
6. canonical truth 变化能使 projection version/stale 状态更新；
7. focus 不创建 Scope/Workspace/View；
8. open 已有 worksite 能解析唯一 target；
9. 无 worksite 时必须显式确认创建；
10. Snapshot 不接受不存在或跨项目 workspace；
11. 旧 branch 不再作为 Gen2 正式入口；
12. Evolution 不把手工 trackSegments 当 canonical history；
13. Checkpoint compare 区分 refs diff 与语义 evolution；
14. 错误、partial/incomplete 数据在 UI 可见；
15. lint → typecheck → unit → build → smoke 真实通过。

---

## 10. T5 回填接口位

最终 C1 × T5 对照表需向本模块回填：

- Atlas 总览的窗口容器、密度、region 视觉语法；
- focus/open/返回的空间关键帧；
- Evolution 2D body 的轨道、时间标记、selection、compare 视觉；
- loading/empty/stale/partial/error 状态；
- Atlas → Context worksite 的过渡；
- Professional Window 中的 tab/dock/temporary detail 生命周期。

T5 只决定呈现与交互，不得反向创造 Atlas membership 或 Evolution history truth。

---

## 11. 当前状态

- M3 Context Atlas：`VERIFIED_CURRENT_SOURCE_GAP`
- M4 Context Evolution：`VERIFIED_CURRENT_SOURCE_GAP`
- 可复用底座：Checkpoint、Presentation、Relations、Active Context、Manifest、Project Events
- 阻塞施工的冲突：公开 branch mutation 与 D18 不一致
- 当前颗粒度：`ENOUGH_FOR_EXACT_SOURCE_PLAN`
- 仓库修改：无
- 下一轮：M5 Workflow / Work View current-source census
