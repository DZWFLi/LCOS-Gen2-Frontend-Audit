# LCOS Gen2 · T4「442」Current Source Census Round 3 接续报告

> **基线更正（2026-09-07）**：当前统一施工基线为 `LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a`，vendored Huabu upstream 为 `a3c411e1f655191344285141f08c4738fa6015f7`。本报告原始普查证据取自 parent `c2ff890a...`；经 diff 核对，非 `huabu/` 源码无变化，相关 Local Core/contracts 结论可继承。

> 文档性质：T4 增量接续 / 阶段成果归档 / 后续施工入口  
> 来源会话：ChatGPT 对话 `442`（conversationId: `6a9d549a-2344-83e9-abaa-88d6da54e112`）  
> 归档日期：2026-09-07  
> 当前阶段：`T4_FULL_CURRENT_SOURCE_CENSUS = IN_PROGRESS`  
> 本报告不宣称 Census 完成，也不构成 C1-4 正式施工卡。

---

## 0. 一页结论

「442」已把 T4 从“沿着旧 C1-0～C1-3 继续写 C1-4”的路径，纠正为：

```text
恢复必要证据
→ 完整 Current Source Census
→ 摊平 owner / producer / consumer / persistence / realtime / legacy
→ 回照并重审 C1-0～C1-3
→ 形成 Seam Map
→ 编写 exact-file / exact-symbol 施工卡
→ 最后才进入 C1-4 及后续正式施工
```

当前资料颗粒度已经足够完成以下工作：

- 恢复 T4 的目标、边界、证据纪律与当前进度；
- 识别已确认的 canonical owner、read model、presentation owner 和 legacy seam；
- 避免把旧 Workbench、web-gen2 Host、Review、Skill Builder 或 Presentation 错认成 durable truth；
- 继续执行剩余 Current Source Census；
- 在 Census 完成后重审旧施工骨架。

当前颗粒度尚不足以：

- 宣布 T4 Full Current Source Census 完成；
- 直接把 C1-0～C1-3 当成已验证施工正本；
- 开始 C1-4 Context 的正式 exact-source construction；
- 决定 Professional Window、Archive 等未完成职责域的最终 owner 和 exact symbol。

因此无需为了达到某个 KB 数量继续扩写；接下来真正缺少的是剩余职责域的原始资料与 current exact source 核验，而不是篇幅。

---

## 1. 对旧 `T4接续.md` 的状态覆盖

桌面接续包中的旧 `T4接续.md` 末尾曾记录：

```text
C1-0 DONE
C1-1 DONE
C1-2 DONE
C1-3 DONE
下一步进入 C1-4
```

「442」后续经过证据恢复和 current-source 复核，已正式将上述状态降级。此后应以本报告为准：

```text
C1-0 = PREVIOUS_CONSTRUCTION_HYPOTHESIS
C1-1 = PREVIOUS_CONSTRUCTION_HYPOTHESIS
C1-2 = PREVIOUS_CONSTRUCTION_HYPOTHESIS
C1-3 = PREVIOUS_CONSTRUCTION_HYPOTHESIS
C1-4 = NOT_STARTED
```

降级不表示旧稿全部错误，而表示它们必须在完整 Census 后逐项重新评级：

```text
SUPPORTED_AS_IS
SUPPORTED_WITH_CORRECTION
NEEDS_REWORK
NOT_YET_VERIFIED
```

旧稿的文件体积、完成度和标题不能代替 current-source verification。

---

## 2. 已锁定的证据纪律

### 2.1 证据优先级

```text
原始用户原话 / 原始需求记录
↓
最新产品冻结 V2
↓
Phase B 四路合并最终跨线程裁决
↓
专项最新冻结补丁
↓
current GitHub exact source
↓
历史源码审计
↓
历史施工稿 / donor 研究
↓
摘要 / 旧会话结论
```

### 2.2 禁止升级为源码事实的材料

以下内容只能作为检索线索，不能单独作为 current-source fact：

- “旧会话说已经读过”；
- 只看过摘要；
- 文件或路径存在；
- 某份历史施工稿提到过；
- 搜索没有命中；
- 旧审计包中的结论；
- 未回到 exact ref 的源码片段。

### 2.3 Evidence Status

后续 ledger 至少使用以下证据状态：

```text
GITHUB_VERIFIED
FOUND_FULL
FOUND_PARTIAL
CONTEXT_ONLY
SUPERSEDED
MISSING
NOT_YET_VERIFIED
```

`搜索未命中`最多只能得到 `NOT_YET_VERIFIED`，不能直接升级成 `DOES_NOT_EXIST`。

### 2.4 已关闭产品语义的处理

最新跨线程裁决已经关闭的产品语义不得因旧源码重新打开。源码不一致统一进入：

```text
MIGRATE
RETIRE
COMPATIBILITY_ADAPTER
```

而不是：

```text
REOPEN_PRODUCT_SEMANTICS
```

已关闭语义包括：

- Scope 非 durable authority；
- Context 顶层是 Project-derived understanding；
- Workflow 是 durable composition；
- Worksite 是显式、独立的长期工作现场；
- Archive 是 canonical lifecycle；
- Professional Window resize 不改变 Camera；
- Canvas 不是 Professional Window。

---

## 3. Current Source 基准

「442」记录并锁定的 current-source 基准为：

```text
repository = DZWFLi/LCOS_Gen2
branch     = main
exact ref  = c2ff890a867922a1256572199458438572eb0a8c
```

当前生产源码至少跨越：

```text
apps/local-core
apps/web-gen2
packages/domain
packages/contracts
huabu/apps/web
```

因此 T4 不能只审 web frontend。每个职责域必须覆盖：

```text
canonical/domain owner
→ producer / local-core service
→ contract
→ persistence
→ presentation / projection
→ Huabu surface consumer
→ realtime / invalidation / recovery
→ legacy migration / retirement
```

---

## 4. 已完成的职责判断

### 4.1 M1 · Professional Window

#### 已排除：legacy `WorkbenchService`

已精读：

```text
apps/local-core/src/workbench-service.ts
apps/local-core/src/routes/workbench.ts
```

current Workbench 的已验证语义是 temporary scope holding View References。其 merge 流程为：

```text
temporary workbench scope
→ 将稳定 ViewRefs 合回 root scope
→ 删除 temporary workbench views
```

对应路由：

```text
POST /projects/:id/workbench/merge
body: workbenchScopeId
```

结论：

```text
WorkbenchService
= CURRENT LEGACY SEAM
≠ Professional Window canonical owner
```

它是 migration / retirement 对象，不是新版 Window System 的基座。

#### 已排除：`apps/web-gen2/src/host/*`

已精读：

```text
apps/web-gen2/src/host/hostSeam.ts
apps/web-gen2/src/host/projectionFacade.ts
```

这里的 Host 承担 LCOS Domain 与 Huabu Canvas 之间的 renderer、overlay、pointer recognizer、semantic connect、projection 和 reconciliation。

结论：

```text
web-gen2 Host
= canvas / surface integration seam
≠ Professional Window Manager
```

它未来可能被 Professional Window 承载，但不能成为 Float、Dock、Undock、Resize、Move、Split 生命周期的 owner。

#### M1 当前状态

```text
CANONICAL_WINDOW_OWNER          = NOT_YET_FOUND
LEGACY_WORKBENCH                = VERIFIED
CANVAS_HOST                     = VERIFIED
WORKSPACE_VIEWPORT_PERSISTENCE  = VERIFIED
FLOAT_DOCK_SPLIT_HOST           = UNRESOLVED
HUABU_WINDOW_SHELL_CENSUS       = IN_PROGRESS
```

### 4.2 Workspace / Project Session

current `Workspace` 仍含有应保留的真实职责：

```ts
Workspace {
  scopeId
  viewport
  focusedViewIds
  visibleLayers
  ...
}
```

`WorkspaceStateService` 已负责：

- viewport；
- focus；
- layers；
- intent；
- memberships；
- linkedRunIds；
- snapshot；
- restore。

Checkpoint 相关注释也确认 Camera autosave 位于 `Workspace.viewport`。

当前迁移方向应是：

```text
保留真实 workspace / viewport / session state
+
迁移旧 scopeId anchoring
```

而不是因为 Scope 过时就删除整个 Workspace。

### 4.3 Domain 中的 Scope 迁移债

current `packages/domain/src/index.ts` 仍定义：

```ts
ScopeKind =
  | root
  | collection
  | context
  | workflow
  | delivery
  | temporary-workbench
```

同时 `Workspace.scopeId` 与 `ArtifactView → Scope` 仍贯穿数据脊柱。

这不代表 Scope 产品语义重新成立，而表示：

```text
LATEST PRODUCT SEMANTICS
        ↓
CURRENT DOMAIN STILL OLD
        ↓
MIGRATION DEBT
```

### 4.4 M5 · Workflow

`WorkflowExportService` 当前 payload 已包含：

```text
members
workspaces
memberViewIds
order
edges
operators
actions
actionEdges
surfaceElements
```

因此 Workflow 已存在值得保留的 durable composition，并非只有 UI 外壳。

```text
KEEP
  operators
  actions
  actionEdges
  surfaceElements
  composition payload

MIGRATE
  Scope anchoring
  workspace / scope association
  presentation lookup assumptions
```

当前结论不是重写 Workflow。

### 4.5 Presentation 与 Process Projection

`PresentationApplicationService` 拥有：

- membership；
- position；
- hierarchy；
- display relation；
- manual anchor；
- emphasis；
- renderer。

源码已明确它不拥有 business truth，并已有：

```text
presentation.changed
→ ProjectEventHub
```

结论：

```text
Presentation = presentation / projection truth
Project / Workflow / Run / Skill = canonical business truth
```

`ProcessProjectionService` 从真实 `Run`、`ContextManifest`、`ArtifactReturn` 生成 Canvas projection，因此：

```text
Run = truth
ProcessProjection = read model
Canvas node = projection
```

### 4.6 M7 · Run / Review

已确认的生产链：

```text
POST /projects/:id/runs
→ RuntimeApplicationService.create()
→ ContextManifest
→ Run + RuntimeDispatch
```

后续 dispatch、recover、sync、cancel、input request、artifact return 均围绕 Run lifecycle。

`RuntimeReviewService.getRunReview()` 从 Run、Dispatch、Binding、ArtifactReturns、DraftRevisions、InputRequest 拼装 Review read model。Accept、Reject、Retry 最终仍回写 Run / Return 生命周期。

结论：

```text
M7 canonical owner = Run lifecycle
Review = derived work interface / read model
```

Professional Window 可以承载 Run Review，但 Review window state 不能成为 Run truth。

### 4.7 M6 · Skill Builder

`SkillPackageService` 负责：

- Skill disk persistence；
- CRUD；
- composition；
- provenance；
- disabled state；
- system → user install。

写操作落到 project user skill root。

`SkillProposalService` 的链条为：

```text
Completed Run
→ pending Skill Proposal
→ accept
→ SkillPackageService.create()
```

结论：

```text
M6 durable owner = Skill Package / Skill Artifact
Skill Builder = editing / authoring / approval interface
Harness Run = separate Run lifecycle
```

### 4.8 M8 · Archive

已精读的 canonical-looking surface：

```text
packages/domain Artifact
metadata-repository.ts
routes/artifacts.ts
```

当前看到的 Artifact availability 只有：

```text
available
missing
stale
```

尚未发现：

```text
archive
archivedAt
restoreFromArchive
canonical archive lifecycle
```

严格结论只能写为：

```text
NO_CANONICAL_ARCHIVE_LIFECYCLE_FOUND
IN_CENSUSED_OWNER_SURFACES
```

不能写成 repo-wide absence。后续仍需检查 warehouse、curation、lifecycle、collection/archive-like state、hide/delete/restore flows。

### 4.9 ContextSnapshot legacy implementation

以下 source 已完成 exact-source verification：

```text
apps/local-core/src/context-snapshot-service.ts
ContextSnapshotService.branch()
```

该实现把下列职责耦合在一起：

```text
Checkpoint / Context snapshot
→ 创建 Collection Scope
→ 读取 Context ArtifactViews
→ clone 新 ArtifactView IDs
→ 生成新 x / y
→ 写 artifact_provenance relation
```

因此：

```text
ContextSnapshotService.branch()
= LEGACY
= RETIRE / MIGRATE
```

不能继续作为 Context temporary detail、Context region open、Context pin 或 Worksite materialization 的默认实现。

---

## 5. M0～M9 Current Census Ledger

| Domain | 当前 owner / 判断 | Persistence | Presentation / Consumer | Migration / Gap |
|---|---|---|---|---|
| M0 Project Session | 分散 durable primitives 已确认，但无统一 session owner | `VERIFIED_GAP`；单 Canvas identity、restore、project-switch policy需迁移；详见 Round 9 | Project Session + Local Core durable owners | `surfacePort` 三 canvas 与最新规则冲突；Workspace restore 不完整 |
| M1 Professional Window | LCOS canonical host/registry 未实现 | `VERIFIED_CURRENT_SOURCE_GAP`；Huabu mechanics donor 已核；详见 Round 4/9 | project-scoped Window Session | multi-instance/occupancy/restart/Camera policy 缺失 |
| M2 Assembly | Project-shared、无第二套 truth；旧 C1-3 方向成立但需校正 | `VERIFIED_CURRENT_CHAIN / PLAN_REQUIRES_CORRECTION`；详见 Round 6 | Professional Window | P0：path/body project guard、unsupported 被 allApplied 误判；P1：placement warning、usedHere 契约缺口、Resource 首 View 语义 |
| M3 Context Atlas | Project-derived、顶层无人工 membership | `VERIFIED_CURRENT_SOURCE_GAP`；只有可复用 primitives，无 Atlas projection owner；详见 Round 7 | Local Core derived projection + Presentation | 公开 Snapshot branch 与 D18 冲突；Scope legacy |
| M4 Context Evolution | canonical history 派生，不由手工轨道拥有 truth | `VERIFIED_CURRENT_SOURCE_GAP`；当前仅有 Presentation `trackSegments` / `evolution` 槽位；详见 Round 7 | derived history projection + Presentation | refs compare 不等于语义 evolution；old branch coupling |
| M5 Workflow | 冻结目标为独立 canonical identity + durable typed composition | `LEGACY_PRESENTATION_IMPLEMENTED / CANONICAL_OWNER_GAP`；现有 action/edge/operator 由 Presentation 代持，详见 Round 8 | Workflow Surface + Professional Work View | Scope anchoring；import 非原子且 ownership/hash 验证不足 |
| M6 Skill Builder | Skill Package / Artifact | true disk persistence | Builder = work interface | UI consumer 待 trace |
| M7 Run / Review | Run lifecycle | Run / Dispatch / Returns | Review = derived model | realtime consumer 待 trace |
| M8 Archive | authority 要求 canonical lifecycle | repo-wide exact-source 已确认 owner/persistence 缺失 | UI viewer 缺失 | `VERIFIED_CURRENT_SOURCE_GAP`；详见 Round 5 |
| M9 Conversation Preview | Conversation owner 待 trace | 待核 | Preview / Canvas host 待核 | Workbench / preview legacy 待拆 |

---

## 6. 已识别的高风险误接线

后续施工必须主动防止：

```text
legacy Workbench → Professional Window owner         ❌
web-gen2 Host → Window Manager                       ❌
Workspace.scopeId → 新产品 Scope authority           ❌
Review model → Run durable truth                     ❌
Skill Builder UI → Skill durable owner               ❌
Presentation membership → business membership        ❌
Workflow scopeId → Workflow 产品语义                 ❌
Canvas / Camera → Professional Window geometry       ❌
搜索未命中 → repo-wide absence                        ❌
旧施工稿篇幅充分 → current-source verified            ❌
```

---

## 7. T5 是否构成阻塞

结论：T5 不是当前 T4 Census 的阻塞项。

T4 与 T5 可以并行：

```text
T4
→ source owner / lifecycle / contract / persistence / recovery
→ engineering seam
→ visual-state delta

T5
→ chrome / geometry / density / material / motion
→ final visual body
```

需要 T5 最终输入才能锁死的是最后一公里视觉 body，例如窗口 chrome、精确尺寸、spacing、motion、hover / active / selected、LOD 和材质。它们不阻止 T4 继续核验真实状态、数据能力、生命周期与 donor mechanics。

---

## 8. 下一执行批次

必须按以下顺序继续，不跳步：

### Batch 1 · Huabu Window / Shell Census

```text
huabu/apps/web
├─ Float
├─ Dock / Undock
├─ Split
├─ Resize / Move
├─ panel / layout / shell / workspace
└─ LCOS surface embedding
```

目标：定位 Professional Window 是否已有真实 mechanics owner；若不存在，也必须给出 repo-wide 检查证据。

### Batch 2 · M8 Archive repo-wide Census

```text
warehouse
curation
lifecycle
hide / delete
restore
collection / archive-like state
```

目标：区分 canonical archive、availability、UI hiding、collection membership 与 delete。

### Batch 3 · M2 Assembly full chain

```text
assembly-apply-service.ts
routes/f6-assembly.ts
contracts/assembly
persistence
presentation
Huabu consumers
recovery / realtime
tests
```

目标：重审旧 C1-3 exact-source plan 的 owner、symbol 和 seam。

### Batch 4 · M3 / M4 Context

```text
context-manifest-service
companion-projection
active-context-store
context snapshot legacy
Project / provenance ownership
temporary detail
Evolution / Relationship
Worksite transition
```

目标：先分离 canonical Project truth、Context read model、presentation projection 与 legacy branch，再决定 C1-4。

### Batch 5 · M9 Conversation Preview

```text
conversation-identity-service
Conversation contracts
preview producer
preview consumer
Professional Window / Canvas seam
child canvas
```

### Batch 6 · Realtime / Invalidation / Recovery

对 M0～M9 回填：

- event producer；
- ProjectEventHub topic；
- websocket / subscription；
- consumer invalidation；
- refresh；
- restart recovery；
- missing / stale / conflict behavior。

### Batch 7 · 重审与施工卡

```text
完整 M0～M9 ledger
→ C1-0～C1-3 revalidation
→ full Seam Map
→ exact-file / exact-symbol construction cards
→ C1-4
```

---

## 9. 已确认的资料与源码入口

当前会话可以读取「442」的文字记录；原会话首轮提到的 16 个附件虽然没有通过会话接口直接返回文件内容，但用户已确认相关资料均可在桌面几个明显与 Gen2 相关的目录中找到，Huabu、Gen1、Gen2 源码均可直接从其 GitHub 仓库核验。因此这些材料当前不记为缺失，而记为 `LOCAL_DISCOVERY_REQUIRED` / `GITHUB_EXACT_FETCH_REQUIRED`。

桌面资料入口已确认：

```text
C:\Users\1\Desktop\正式规划用：
  → 最新产品冻结 V2、六路职责、统一语义考古、Donor 双轨裁决

C:\Users\1\Desktop\施工前最后一轮校准
  → Phase B 四路合并最终跨线程裁决、T4 考古、跨线程问题与修订稿

C:\Users\1\Desktop\Gen2开发
  → 总索引、历史审计、源码参考、Library 补充、旧施工规划与恢复档案

C:\Users\1\Desktop\接续包
  → T1～T6 接续材料、T4 C1-0～C1-3、T5 输入与本轮增量接续
```

继续完整 Census 时，必须从上述入口重新定位并核对至少以下材料：

- 四路合并最终跨线程裁决稿；
- 最新产品冻结 V2 精确原件；
- Context Atlas 冻结补丁；
- `Gen2开发(20260906-115603).zip` 或对应解包目录；
- T4 历史审计 corpus；
- Gen1、Gen2、Huabu 的 GitHub repository、branch 与 current exact ref；
- 原始用户原话和语音模糊处的终结稿；
- 与 T4 相关的 C1-0～C1-3 原始施工文档及 T5 输入。

现有桌面材料已经提供清晰入口，但在逐份精读前不得把“文件存在”升级为“内容已验证”；GitHub 文件也必须记录 repository、branch、commit SHA、exact path 与 exact symbol。

只有经过桌面定向检索、相关 ZIP 清单核对和 GitHub 仓库检索后，仍无法定位某份精确原件，或多个候选终结稿发生无法按权威顺序解决的冲突，才向用户请求具体文件或裁决；不应先凭摘要补造结论。

---

## 10. 颗粒度验收

### 已达到

- 状态清晰；
- 新旧结论覆盖关系清晰；
- 证据优先级与证据状态清晰；
- 已验证 owner 与假 owner 清晰；
- M0～M9 缺口清晰；
- 后续批次、顺序和停止条件清晰；
- T5 并行边界清晰；
- 下一执行者可以在不重开产品语义的前提下继续 Census。

### 尚未达到

- 全职责域 exact file / exact symbol；
- 每一块完整 producer / consumer / persistence / realtime matrix；
- Professional Window 与 Archive 的最终 owner；
- C1-0～C1-3 最终 revalidation；
- C1-4 正式施工卡。

### 最终判断

```text
HANDOFF_GRANULARITY              = SUFFICIENT
NEXT_CENSUS_EXECUTION            = READY
FORMAL_CONSTRUCTION_CARD         = NOT_READY
C1-4_IMPLEMENTATION              = NOT_AUTHORIZED_BY_EVIDENCE_YET
MORE_PROSE_FOR_SIZE              = NOT_NEEDED
MORE_PRIMARY_SOURCE_VERIFICATION = REQUIRED
```

---

## 11. 接续启动口令

新执行者应从下面这一句继续：

> 以本报告覆盖旧 `T4接续.md` 的 C1-0～C1-3 DONE 状态；先定位并精读缺失的权威原件与 Gen2 ZIP 历史审计，再从 Huabu Window / Shell repo-wide Census 开始，逐块回填 M0～M9 的 exact file、exact symbol、owner、producer、consumer、persistence、realtime、recovery 和 legacy disposition；完整 Census 前不进入 C1-4 正式施工。
