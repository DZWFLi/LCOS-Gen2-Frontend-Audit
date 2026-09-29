# LCOS Gen2 · T4 / 442 · Round 9

> **基线更正（2026-09-07）**：当前施工基线为 `LCOS_Gen2/main@232b2ca5...` + Huabu `a3c411e1...`。Project Session/Surface/Rail/Workspace State 等非 `huabu/` 源码无变化；Window donor 相关路径无差异，本报告结论可继承。

## Project Session / Surface / Railway / Professional Window 跨模块收口普查

- 日期：2026-09-07
- 源码锚点：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`
- 性质：最后一轮分模块 current-source census；未修改仓库代码
- 结论：`CENSUS_COMPLETE / CROSS_MODULE_MIGRATION_REQUIRED`

---

## 1. 总结

当前仓库已有 Project、Workspace、Checkpoint、Presentation、Navigation Marker、Rail ordering、Command Draft 等分散持久化能力，但没有统一 Project Session contract，也没有 Professional Window session owner。

更重要的是，当前源码中仍存在两类与最新冻结直接冲突的旧结构：

1. `surfacePort.ts` 把 Main / Context / Workflow 定义为同项目下三个不同 `canvasId`；最新规则要求一个 Project 只有一张持续存在的 Project Canvas，Workspace 是 Semantic Viewport，不是独立 Canvas。
2. Project View Rail 的 durable order 机制可复用，但 ontology 仍是 `scene | collection | context | workflow` 平级，与 D17 新铁路语义不一致。

此外，Workspace State 的 restore 名义大于事实：当前只向 checkpoint 所属 Workspace 添加旧 membership，不恢复 viewport、focus、visibleLayers、intent，也不删除快照外成员；URL 中的 workspaceId 甚至未参与校验。

因此旧 C1-0/C1-1/C1-2 不可原样施工。底层机制能复用，但必须先完成 identity、session、restore 和 rail ontology 的薄迁移。

---

## 2. 当前持久化版图

| 状态 | 当前 owner | 现实 |
|---|---|---|
| Project graph / entities | Local Core SQLite | canonical |
| Workspace intent / viewport / focused IDs / layers | Workspace rows | canonical/project state，但 Workspace ontology 待迁移 |
| Workspace membership | membership tables + MutationSafety | canonical working-set truth |
| Presentation membership/layout/components | presentation_views + CAS | durable presentation truth |
| Checkpoint / Context refs | checkpoints | immutable history refs |
| Rail ordering | project_view_rail_order + CAS | durable navigation order，ontology 旧 |
| Navigation marker intent | Local Core | canonical intent；screen projection 前端派生 |
| Command draft | project/workspace keyed metadata | durable draft |
| Session summaries | Local Core | handoff/history，不是 UI session |
| Active Context / proposals | Local Core | execution context state |
| Professional Window tabs/dock/split/float | 无 LCOS owner | gap |
| 当前 Surface、back stack、open Work Views | 无统一 owner | gap |
| occupied/safe rect | 无公共 LCOS seam | gap |

---

## 3. Project Session：当前没有统一模型

### 已有可拼接信号

- Project 当前图和版本；
- Workspace viewport / intent / layers；
- Presentation versions；
- Rail order version；
- Navigation marker intents；
- Command draft；
- Active Context；
- SessionSummary；
- Checkpoint。

### 缺失

没有一个明确的 Project Session state/restore contract 来表达：

- 当前 Project；
- 当前一级 Surface；
- 当前 Semantic Viewport / worksite；
- Surface 内相机与 selection 恢复策略；
- Railway 当前选择与 back stack；
- 打开的 Professional Window instances；
- tab/dock/split/float geometry；
- active Work View 与 transient preview；
- Assembly 当前 target 与临时 source selection；
- stale request epoch；
- project switch cleanup；
- restart restore version。

不能把这些全部塞进 localStorage。Project session 中需要重启恢复的部分必须由 Local Core 或现有 durable owners 保存；纯 hover、拖动中状态、临时高亮可留内存。

---

## 4. P0 冲突：三 Surface 三 canvasId

`apps/web-gen2/src/spatial/surfacePort.ts` 当前明确：

```text
同一 project + main/context/workflow
→ 三个不同 canvasId
→ camera / selection / history 按 canvasId 隔离
```

而当前最高项目规则明确：

```text
一个 Project 只有一张持续存在的 Project Canvas
Workspace = Semantic Viewport
不是页面、独立 Graph、真实目录或 GUI Project
```

这是核心 identity 冲突，不是命名问题。

### 处理原则

- 不得继续把 `SurfaceRegistry.assertDistinctCanvas()` 当新施工基础；
- 三个 Surface 可以共享物理 canvas/runtime，通过 presentation/surface mode/semantic viewport 切换；
- Camera、selection、history 是否隔离应由 Project Canvas 上的 Surface/Viewport session policy 定义，而不是伪造三张 Canvas；
- 既有 Huabu canvas persistence 若以 canvasId 为键，需要迁移/兼容读策略；
- T4 不能单独拍板 schema，最终 C1 需把它列为获批 Sprint 前置变更。

---

## 5. Workspace State restore 的真实行为

### save

保存：

- viewport；
- focusedViewIds；
- visibleLayers；
- intent；
- memberships + 当前 View revisionId；
- 最多查询 100 条 Project Run 后筛 workspace linked runs。

### restore

实际只做：

```text
读取 checkpoint.snapshotJson
→ addWorkspaceMembers(checkpoint.workspaceId, snapshot.membership IDs)
→ 返回 snapshot 给调用方
```

没有恢复：

- viewport；
- focusedViewIds；
- visibleLayers；
- intent；
- revision pin；
- linked runs；
- 移除快照外 membership。

### 路由身份缺口

路由是：

```text
POST /workspaces/:workspaceId/states/:stateId/restore
```

但实现只把 `stateId` 传给 service，完全忽略 URL 中的 workspaceId。调用 A 的 URL 配 B 的 stateId，会对 checkpoint 内的 B workspace 写入。

### 其他风险

- snapshotJson 没有 schemaVersion/runtime validation；
- restore 直接写 membership，不走 MutationSafety / ChangeSet；
- 使用 add 语义，不是真正 replace/restore；
- 不检查 ArtifactView 当前是否存在、是否仍属同项目；
- save 的 Run 上限 100 会静默截断；
- 返回成功容易让前端误以为 Core 已恢复所有状态。

该接口应在正式 Project Session restore 前修正或改名为“add saved members”。

---

## 6. Railway：机制可留，ontology 必须换

### 可复用

- SQLite durable ordering；
- version / CAS；
- restart；
- dedupe；
- GET 时过滤已不存在 identity；
- Project-scoped key。

### 当前旧模型

`ProjectViewRailKindV0`：

```text
scene | collection | context | workflow
```

问题：

- 仍把旧类别作为平级 rail item；
- `viewId` 同时指 Workspace ID 或 Scope ID；
- PUT 只验证 kind 字符串和 ID 字符串，不验证 kind 与实体类型匹配；
- GET 只判断 ID 是否存在于 workspaceIds 或 scopeIds，仍不验证 kind；
- invalid input item 被静默过滤，而非 fail-close；
- 没有新 Railway 的 entry type、current selection、temporary entry、Work View instance 或 back stack contract。

D17 已裁决：保留 durable ordering 机制，替换 ontology。最终 C1 不应删除这套表与 CAS，而应做 versioned migration。

---

## 7. Navigation Marker：边界基本正确但词汇旧

正确点：

- Core 只保存导航 intent；
- pin/cursor/cluster、screen x/y、camera zoom 前端派生；
- target 指 canonical identity；
- resolve 时读取实时 world position；
- 删除后 unresolved；跨项目 fail-close；不模糊重绑。

需要迁移：

- `StableSurfaceRefV0` 仍把 Scope、Workspace、Conversation、Assembly 当不同 surface identity；
- `NavigationSurfaceKindV0` 含 scene/collection/assembly；
- Scope kind 被直接映射成 Context/Workflow/Collection surface；
- 与“一 Project 一 Canvas + Semantic Viewport + Professional Window”的新词汇未对齐。

应保留 marker intent/resolve 机制，升级 target resolution vocabulary；不要复制位置。

---

## 8. Professional Window 跨模块结论

Round 4 已确认 Huabu 只提供 mechanics donor。收口后需要的公共 owner 至少包括：

```text
ProjectProfessionalWindowSession
  ├─ instances[]
  │   ├─ instanceId
  │   ├─ bodyType + canonical targetRef
  │   ├─ dock/float/split region
  │   ├─ tab group/order/active
  │   ├─ geometry
  │   ├─ transient/promoted
  │   └─ close guard / dirty / waiting_input / review
  ├─ activeInstanceId
  ├─ occupiedRects / safeRect projection
  └─ version / projectId
```

边界：

- body truth 仍由对应 canonical service 提供；
- Window session 只存窗口组织和恢复所需状态；
- occupiedRects 是 screen-space projection，不进入 Project graph；
- resize 不改 Camera；
- Surface switch 不销毁 project-scoped instances；
- Project switch 必须隔离 session；
- transient preview 是否重启恢复需明确，默认不恢复；promoted/durable instance 才考虑恢复。

---

## 9. 跨模块状态清理与恢复矩阵

| 状态 | 切 Surface | 切 Project | 重启 |
|---|---|---|---|
| Project canonical truth | 保留 | 卸载当前、加载目标 | Core 恢复 |
| Presentation | 各 Surface 读取对应 projection | 按 project 隔离 | Core 恢复 |
| Project Canvas camera | 按冻结 policy 恢复/切换 viewport | 不串项目 | durable owner 恢复 |
| selection/hover/drag | selection按产品 policy；hover/drag 清 | 清 | 清 |
| Work View promoted instance | 保留 | 切换到目标项目 session | 可恢复 |
| transient preview | 可保留到目标变化 | 清 | 默认清 |
| Assembly source selection/loading | 视 UI policy | 清并 cancel stale request | 默认清 |
| Assembly canonical outcomes | 从 Core truth重读 | 按项目隔离 | 重读 |
| Railway order | 保留 | 加载目标项目 | Core 恢复 |
| Railway active/back stack | 保留 | 按项目隔离 | 需 session owner |
| Navigation marker intent | 保留 | 按项目隔离 | Core 恢复 |
| pin/cursor/cluster screen projection | 重算 | 清并重算 | 重算 |
| Command draft | 按 project/workspace key | 切换 key | Core 恢复 |
| occupied/safe rect | 由当前窗口重算 | 重算 | 重算 |

---

## 10. 建议的前置施工批次

### PS-A0 · 冻结单 Canvas identity 与兼容迁移

- 替换 `surfacePort.ts` 的 distinct canvas 假设；
- 定义 Project Canvas + Surface mode + Semantic Viewport identity；
- 审计 Huabu canvasId persistence keys；
- 给旧三 canvas 数据兼容读取/迁移策略；
- 不自动丢弃旧布局。

### PS-A1 · 修正 Workspace State

- path workspaceId 必须与 checkpoint.workspaceId 一致；
- snapshot 加 schemaVersion；
- 明确 restore 是 replace、merge 或 preview+confirm；
- 走 ChangeSet/事务；
- 校验所有 refs ownership/availability；
- viewport/focus/layers/intent 要么真实恢复，要么从接口名和 contract 中移除；
- 取消静默 Run 截断或返回 incomplete warning。

### PS-A2 · Project Session contract

- current Surface / Semantic Viewport；
- navigation selection/back stack；
- promoted Work View instances；
- window layout version；
- project-scoped restoration；
- transient state 排除规则；
- stale/cancel epoch。

### PS-A3 · Railway ontology migration

- 保留表、CAS、dedupe、restart；
- 新 typed entry ref；
- kind/identity 严格验证；
- invalid 不静默丢弃；
- legacy V0 → 新版本映射；
- current/temporary/back-stack 与 durable order 分层。

### PS-A4 · Professional Window host

- instances/tabs/dock/split/float；
- public occupied/safe rect；
- body registry；
- close guards；
- project switch/restart；
- Camera no-compensation。

---

## 11. 最低验收

1. 同一 Project 只有一个持续 Project Canvas identity；
2. Main/Context/Workflow 切换不创建三套 Project truth；
3. 旧 canvas persistence 有明确兼容策略；
4. workspace restore 不允许 URL 与 state 跨 workspace；
5. restore 失败 0 partial mutation；
6. restore 行为与名称/返回值一致；
7. Rail kind 与 identity 严格匹配；
8. invalid rail item fail-close，不静默消失；
9. Rail V0 顺序可迁移且可回滚；
10. promoted Work Views 按 Project 隔离并可恢复；
11. transient preview 不污染 durable session；
12. Surface switch 不销毁 project-scoped Work View；
13. Project switch cancel/忽略所有旧项目异步响应；
14. occupiedRects/safeRect 统一，Camera 不因窗口 resize 自动移动；
15. marker 只存 intent，screen projection 重算；
16. localStorage 不保存 Project graph、Run 或正式 session truth；
17. lint → typecheck → unit → build → smoke 真实通过。

---

## 12. T5 回填位

最终 C1 × T5 回填需要覆盖：

- 单 Project Canvas 下三 Surface 切换关键帧；
- Railway 新条目视觉、选中、临时态、重排；
- Professional Window 多实例、tab、dock、split、float；
- project switch / restart restore 的视觉状态；
- transient preview → promoted；
- occupied/safe rect 与 Overlay/Command/Inspector；
- loading/stale/conflict/dirty/waiting_input/review；
- Window resize 时 Camera 保持不动的对照帧。

T5 不能继续沿用“三 Surface 三 canvasId”或旧 Rail 平级 ontology。

---

## 13. 当前状态

- M0 Project Session：`VERIFIED_GAP / DISTRIBUTED_DURABLE_PRIMITIVES_EXIST`
- Surface identity：`CURRENT_SOURCE_CONFLICT_WITH_LATEST_RULE`
- Railway：`MECHANISM_VERIFIED / ONTOLOGY_MIGRATION_REQUIRED`
- Workspace State restore：`PARTIAL_AND_MISLEADING / SAFETY_FIX_REQUIRED`
- Professional Window：`VERIFIED_CURRENT_SOURCE_GAP`
- Navigation Marker：`MECHANISM_VERIFIED / VOCABULARY_MIGRATION_REQUIRED`
- 分模块 current-source census：`COMPLETE`
- 下一轮：合成正式《C1 最终施工总方案》初版，再执行 T5 逐项回填冻结
