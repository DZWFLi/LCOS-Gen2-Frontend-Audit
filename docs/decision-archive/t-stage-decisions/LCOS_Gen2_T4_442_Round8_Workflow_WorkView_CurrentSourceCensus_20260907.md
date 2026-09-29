# LCOS Gen2 · T4 / 442 · Round 8

> **基线更正（2026-09-07）**：当前施工基线为 `LCOS_Gen2/main@232b2ca5...` + Huabu `a3c411e1...`。Workflow/Presentation/Run 等非 `huabu/` 源码无变化；相关 Window donor 路径亦无差异，本报告结论可继承。

## Workflow / Work View 当前源码全链普查

- 日期：2026-09-07
- 源码锚点：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`
- 性质：只读 current-source census；未修改仓库代码
- 结论：`CANONICAL_WORKFLOW_GAP / PROFESSIONAL_WORK_VIEW_GAP / LEGACY_DONORS_EXIST`

---

## 1. 总结

当前仓库存在一套可运行的 Workflow Presentation 与 `.lcos-workflow.zip` 导入导出，但它并不满足最终冻结的 Workflow ontology：

- 没有独立 canonical Workflow identity；
- 没有独立 durable typed working composition owner；
- action / edge / operator 实际保存在 Presentation state；
- Workflow 仍由 `scopeId` 定位；
- import/export 会把 Presentation、Workspace、Scope compatibility 混在一个包里；
- 导入不是原子事务，也没有 ChangeSet / rollback 包络；
- Work View 当前没有统一 registry、multi-instance window state、occupied/safe rect seam 或专业 body host。

因此，现有 Workflow 代码应定级为 `LEGACY_COMPAT + MIGRATION_DONOR`，不能直接当作 C1 正式实现。

---

## 2. 冻结语义

### Workflow

Workflow 是三个一级 Surface 之一，但不是：

- Scope 本身；
- 自动化 DAG 搭建器；
- 一组克隆出来的材料；
- Presentation layout 本身；
- Worksite 或 Work View。

D19 要求用户从真实材料整理 Workflow 时：

1. 创建或复用 canonical Workflow identity；
2. 保存 durable typed working composition；
3. 不 clone 原实体；
4. 在 Workflow Surface 建立 projection；
5. 不删除 Main / Context source projection；
6. 只有用户明确“单独开桌长期做”才 materialize Worksite；
7. Agent proposal 未采用前不写 canonical Workflow。

### Work View

Work View 是“把某件事拿近、展开、深入操作的窗口”：

- 不是固定右栏；
- 不是新页面 route；
- 不是 Child Canvas；
- Focus 与 Work View 不是同一 enum；
- project-scoped，不因 Surface 切换无脑销毁；
- 允许多实例，旧 single-dominant 方案已废弃；
- window resize 不自动改变 Camera；
- 通过公共 screen-space occupied/safe rect 影响 overlay 与交互避让。

---

## 3. 当前 Workflow 实现

### 3.1 Presentation state 是实际载体

`packages/contracts/src/presentations.ts` 当前定义：

- `WorkflowActionV0`
- `WorkflowActionEdgeV0`
- `WorkflowOperatorV0`
- `PresentationStateV0.workflowActions`
- `PresentationStateV0.workflowActionEdges`
- `PresentationStateV0.workflowOperators`
- workflow-step / review / active-path / workbench 等 Surface components

`PresentationApplicationService` 会校验 action ID、attached member View、action edge 端点等。

这些结构有价值，但其 owner 是 Presentation。它们目前没有对应的 canonical Workflow entity/repository/version/event。

### 3.2 WorkflowExportService

导出内容：

```text
manifest.json
workflow.json
  ├─ members
  ├─ workspaces
  ├─ presentation edges
  ├─ operators
  ├─ actions
  ├─ actionEdges
  └─ surfaceElements
references.json
```

真实来源是：

- `presentation:workflow:${scopeId}`；
- 当前 Project 中 `workspace.scopeId === scopeId` 的 Workspace；
- Presentation membership / edges / operators / actions。

因此文件名虽叫 Workflow，内容本质是“Scope 兼容定位下的一份 Workflow Presentation + Workspace bundle”。

### 3.3 Workflow routes

当前只有：

- `GET /projects/:id/workflow/export?scopeId=...`
- `POST /projects/:id/workflow/import?scopeId=...`

没有：

- create/get/list/update canonical Workflow；
- canonical composition version / CAS；
- propose/accept/reject extraction；
- materialize Worksite 命令；
- Workflow changed event；
- Work View projection query。

### 3.4 Run / Recipe / Revision workflow

仓库已有成熟邻接能力：

- `RunRecipeV0`：prompt、receiver、ordered references、result slot、manifest 的只读聚合；
- Revision workflow：把反馈收口为修订请求并创建 proposal；
- ResultSlot 生命周期；
- Run、Artifact Return、Skill Proposal 等链。

它们可供 Workflow professional detail / review 使用，但不等于 canonical Workflow composition。

---

## 4. P0 结构缺口

### P0-A · Durable workflow composition 被 Presentation 代持

最终产品需要 durable typed working composition，而当前 action/operator/edge 全部存在 `presentation_views.state_json`。

问题：

- Presentation 可删除、替换 renderer、调整 membership；
- Presentation 明确不拥有业务 truth；
- Workflow composition 却需要独立身份、版本、审计和引用稳定性；
- `workflowId` 只作为 optional binding string 出现，没有实体 owner。

施工前必须由 canonical owner 线程冻结最小 Workflow contract。T4 只能消费和呈现，不能自行把 Presentation 升格为业务 truth。

### P0-B · Import 不是原子操作，可能产生半截写入

`WorkflowExportService.import()` 当前顺序：

```text
解析 ZIP
→ 部分结构校验
→ 逐个 upsertWorkspace
→ presentation.save
```

若 Workspace 已写入后，Presentation save 因跨项目 View、Scope 不存在、CAS 冲突或 Surface binding 校验失败而抛错，前面的 Workspace 可能已经落库。

当前没有：

- transaction；
- ChangeSet；
- preflight 全量 ownership 验证；
- rollback；
- import preview。

这与高风险写入、可回滚及失败不留半成品的工程规则不符。

### P0-C · Import 的身份与所有权验证不足

当前：

- references 只检查 artifactId 在数据库中存在，没有显式验证属于目标 Project；
- 没有验证 reference.viewId 与 artifactId 真实匹配；
- scopeId 来自 query，路由不先验证 scope 属于 Project 且语义为 Workflow；
- archive 自带 workspace.id，并尝试直接 upsert；
- members 与 workspaces.memberViewIds 的一致性没有完整验证；
- manifest contentHash 被导出但导入未验证；
- manifest sourceProjectId / workflowViewId 未形成明确迁移策略。

即使后段 Presentation 校验会挡住部分跨项目成员，也挡不住前段已发生的写入风险。

---

## 5. P1 语义与接口缺口

### 5.1 Scope compatibility 仍是主定位

Workflow export/import 的 identity 实际是 `scopeId`，Presentation ID 也是由 scopeId 拼接。冻结语义已明确 Workflow 不是 Scope；当前只能作为 compatibility anchor。

### 5.2 Export 可生成“空但成功”的 Workflow 包

传入没有对应 Presentation 的 scopeId 时，service 会使用空 members/actions/edges 继续导出；route 默认还会回退 root Scope。缺少“这是哪个 canonical Workflow”的必需校验。

### 5.3 Workspace membership 语义混杂

导出 Workspace 时使用 `workspace.focusedViewIds` 作为 `memberViewIds`，没有使用 canonical Workspace membership repository。这会把 focus 状态冒充 membership。

### 5.4 Predicate 只作为文本

源码注释明确 Core 不执行语义条件，`predicateText` 只是创作内容。这符合“Workflow 不是自动化 DAG”的边界；UI 不得把 condition/parallel 图形宣传成可执行流程引擎。

### 5.5 web-gen2 无 Workflow 专用消费链

当前没有 Workflow typed client、canonical model adapter、Surface body、proposal/review state 或 Work View detail body。

---

## 6. Work View 当前源码结论

结合 Round 4 Huabu Window census：

### 可复用 donor

- Huabu `PreviewWorkspace`：target→tab、transient→promote、reorder、两组横向 split、ratio persistence；
- `MainLayout`：左右面板 resize/collapse；
- LCOS Presentation Surface components；
- RunRecipe、ResultSlot、Revision workflow、Artifact Return；
- navigation marker 可把 workflow Scope compatibility 映射到 surface。

### 缺失

- Professional Window / Work View instance registry；
- stable work-view instance ID；
- project-scoped multi-instance lifecycle；
- float/dock/undock/free move；
- horizontal + vertical split 和 N regions；
- public occupiedRects / safeRect contract；
- Work View host 与专业 body registry；
- Surface switch preservation；
- Camera no-compensation policy 接线；
- per-body close/dirty/waiting_input/review guards；
- restart/session restoration。

因此 Work View 状态为 `VERIFIED_CURRENT_SOURCE_GAP`，Huabu 是 mechanics donor，不是完整 owner。

---

## 7. 修正后的 owner 图

```text
Canonical Workflow（缺失，需最小 contract）
  ├─ workflow identity
  ├─ durable typed composition
  ├─ version / audit / proposal acceptance
  └─ references to Project entities（不复制）
          ↓ projection
Workflow Presentation
  ├─ positions / hierarchy / visual edges
  ├─ collapsed / selected / emphasis
  └─ professional components
          ↓ open
Work View instance
  ├─ window geometry / dock / split / tab
  ├─ temporary UI state
  └─ body-specific review/editor state

Run / Recipe / Result / Revision
  = 独立 canonical execution facts，被 Workflow/Work View 引用
```

---

## 8. 建议施工分层

### WF-A0 · Canonical owner 与迁移契约

先由对应 owner 冻结：

- WorkflowId；
- Workflow composition schema；
- member/reference/order/action/operator 的业务边界；
- version/CAS/event；
- proposal accept 才写 canonical；
- Scope / Presentation legacy migration；
- Skill capability-use relation的独立 seam。

这是重大对象模型变更，必须先获批，T4 不直接施工。

### WF-A1 · 修复 legacy import/export 安全边界

- 全量 preflight；
- 验证 contentHash；
- 验证 Project/Scope/View/Artifact ownership；
- 不接收 archive workspace ID 直接覆盖现有 identity；
- transaction 或 ChangeSet + rollback；
- 使用真实 Workspace membership，不用 focusedViewIds；
- legacy archive 显式版本与迁移结果。

### WF-A2 · Canonical Workflow APIs + typed web clients

- list/get/create/update/propose/accept；
- composition query；
- projection query；
- web-gen2 typed client；
- stale/version/error 语义。

### WF-A3 · Workflow Surface

- 材料引用与 working composition projection；
- 必要上下文、目标、阶段、动作、结果与回看；
- 非自动化-DAG视觉语言；
- 从 Main/Context 提取时保留 source projection；
- 明确“开长期 Worksite”动作。

### WV-A0 · Professional Window 公共底座

延续 Round 4：

- project-scoped instance registry；
- multi-instance tab/dock/split；
- occupied/safe rect；
- host resize 不动 Camera；
- body registry；
- session restore。

### WV-A1 · Workflow 专业 bodies

- Workflow detail；
- run detail / review；
- recipe / reference inspection；
- revision preparation；
- waiting_input / conflict；
- Skill proposal/builder 仅走既有审批与 canonical owner。

---

## 9. 最低验收矩阵

1. Workflow 有稳定 canonical identity，不以 Scope/Presentation ID 冒充；
2. composition 重启后可恢复且具有版本；
3. Presentation 删除或换 renderer 不删除 Workflow truth；
4. 提取 Workflow 不 clone Artifact，不删除来源 projection；
5. Agent proposal 未 accept 不写 canonical Workflow；
6. 显式创建 Worksite 与创建 Workflow 分离；
7. import 失败 0 partial mutation；
8. import 验证 hash、schema、ownership、refs 对应关系；
9. export 不允许无身份空包伪装成功；
10. Workspace membership 不由 focusedViewIds 代替；
11. predicate/parallel 不伪装成已接通执行引擎；
12. Work View 支持项目内多实例；
13. Surface 切换不无脑销毁 Work View；
14. resize 不改变 Camera；
15. occupied rect 能被 Overlay/Command/Inspector 消费；
16. close/dirty/review/waiting_input 有明确保护；
17. project switch 不串实例和 body state；
18. lint → typecheck → unit → build → smoke 真实通过。

---

## 10. T5 回填位

最终 C1 × T5 对照表需要回填：

- Workflow Surface 的空间构图、节点层级、动作/材料/结果视觉；
- condition/parallel 的“非自动化引擎”表达；
- Work View frame、tabs、dock、split、float 关键帧；
- multi-instance 激活与层级；
- run/review/waiting_input/error/dirty 状态；
- occupied/safe rect 对 Overlay、Command、Inspector 的避让；
- Surface ↔ Work View 的打开、返回与保留行为。

T5 不决定 canonical Workflow schema，也不把 UI edge 升格为业务执行关系。

---

## 11. 状态

- M5 Workflow：`LEGACY_PRESENTATION_IMPLEMENTED / CANONICAL_OWNER_GAP`
- M6 Work View：`VERIFIED_CURRENT_SOURCE_GAP`
- Workflow import/export：`REUSABLE_MIGRATION_DONOR / UNSAFE_AS_FINAL_PATH`
- Run/Recipe/Revision：`REAL_ADJACENT_CAPABILITIES`
- 当前颗粒度：`ENOUGH_FOR_FINAL_C1_SCOPING`
- 仓库修改：无
- 下一轮：Project Session、跨模块状态、Railway/Surface/Window seam 收口
