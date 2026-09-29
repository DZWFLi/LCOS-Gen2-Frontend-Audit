# LCOS Gen2 · T4「442」Round 5
# Archive Canonical Lifecycle · Current Source GAP Census

> **基线更正（2026-09-07）**：当前施工基线为 `LCOS_Gen2/main@232b2ca5...` + Huabu `a3c411e1...`。Archive 普查原始证据来自 parent `c2ff890a...`；两版本间非 `huabu/` 源码差异为零，gap 结论继续成立。

> 日期：2026-09-07  
> 状态：`GITHUB_EXACT_SOURCE_GAP_VERIFIED / NO PRODUCTION PATCH`  
> Repository：`DZWFLi/LCOS_Gen2`  
> Branch：`main`  
> Exact SHA：`c2ff890a867922a1256572199458438572eb0a8c`

## 0. 最终结论

M8 Archive 已从“高优先级 GAP candidate”升级为：

```text
CANONICAL_ARCHIVE_LIFECYCLE = VERIFIED_CURRENT_SOURCE_GAP
```

在 exact SHA 的完整仓库归档上执行全仓源码扫描后，没有发现项目对象级：

```text
archived
archivedAt / archived_at
archive mutation
restore-from-archive mutation
archive eligibility
archive event payload
archive query / viewer API
```

仓库中的 `archive` 命中全部属于其它语义：

- ZIP / TAR 等文件格式与 Resource visual family；
- Workflow 导入导出 archive；
- Huabu Canvas `.huabu.zip` 导入导出；
- MHTML 页面快照；
- Run late-result evidence 的文件留存；
- 已废弃设计文档目录；
- 测试夹具标签。

这些均不能承接 V2 / Phase B 定义的 canonical Archive。

---

## 1. Census 方法与证据强度

由于 Git clone 连续三次受到 443 超时/连接重置影响，本轮改用 GitHub exact-SHA zip archive：

```text
https://github.com/DZWFLi/LCOS_Gen2/archive/
c2ff890a867922a1256572199458438572eb0a8c.zip
```

下载后在独立临时目录解包，并对完整仓库执行本地 `rg`。这避免了 GitHub Code Search 未索引或返回空结果造成的假阴性，同时仍严格锁定同一 commit。

扫描范围包括：

```text
apps/local-core
apps/web-gen2
packages/domain
packages/contracts
huabu/apps/web
huabu/apps/server
huabu/packages/shared
tests
docs
```

证据状态：

```text
REPOSITORY_TREE       = GITHUB_EXACT_ARCHIVE_VERIFIED
CANONICAL_TERM_SCAN   = REPO_WIDE_VERIFIED
OWNER_SURFACE_READ    = VERIFIED
ROUTE_SCAN            = VERIFIED
SCHEMA_SCAN           = VERIFIED
EVENT_CONTRACT_SCAN   = VERIFIED
PROJECTION_SCAN       = VERIFIED
```

---

## 2. Latest authority 要求的 Archive

Phase B D13 已冻结：

```text
Archive
→ Core 标记 archived / archivedAt
→ membership / relation / history 保留
→ ProjectEvent: archived
→ active Main projection eligibility = false
→ Projection/Reconciler 移除 active projection
→ 不保存旧 x/y

Restore
→ Core clear archived state
→ ProjectEvent: restored(batch)
→ active Main projection eligibility = true
→ 建立新 projection
→ 使用 fresh layout，不读取旧 x/y
```

同时要求 archived object：

- 仍可 Search；
- 仍可 Reference；
- 仍可被 Agent 读取；
- 仍可被 Context / Workflow 引用；
- 处于 read-only cold state；
- 不自动 Restore；
- Restore 后仍是同一 canonical identity。

这是一套 canonical lifecycle，不是 UI hide，也不是物理 delete。

---

## 3. Domain model 缺口

Exact file：

```text
packages/domain/src/index.ts
```

当前 Artifact：

```ts
Artifact {
  id
  projectId
  title
  kind
  managed
  availability
  currentRevisionId?
  createdAt
  updatedAt
}
```

当前 `ArtifactAvailability` 只有：

```ts
'available' | 'missing' | 'stale'
```

这里表达的是源文件可用性，不是项目对象生命周期。

缺失：

```text
archive lifecycle state
archivedAt
archivedBy / origin（若 contract需要）
read-only archived policy
active projection eligibility
restore semantics
```

结论：

```text
ArtifactAvailability ≠ ArchiveLifecycle
```

禁止把 `missing` 或 `stale` 偷偷解释成 archived。

---

## 4. Persistence / Schema 缺口

Exact file：

```text
apps/local-core/src/metadata-repository.ts
```

当前 `artifacts` 表核心列：

```sql
id
project_id
title
kind
local_path
availability
current_revision_id
created_at
updated_at
managed
birth_run_id
title_mode
```

未发现：

```sql
archived
archived_at
archive_state
restored_at
```

`getArtifacts(projectId)` 当前直接：

```sql
SELECT * FROM artifacts WHERE project_id = ?
```

没有 active/archived eligibility 过滤参数，也没有专用 archive query。

结论：

```text
ARCHIVE_PERSISTENCE_OWNER = ABSENT
SCHEMA_MIGRATION          = REQUIRED
```

但本轮不提前裁决一定把字段直接加在 `artifacts` 表，最终 source plan 仍需根据多 entity Archive 范围判断是通用 lifecycle substrate 还是每类 owner 的薄扩展。

---

## 5. Artifact routes 缺口

Exact file：

```text
apps/local-core/src/routes/artifacts.ts
```

当前 Artifact API 只有：

```text
GET  source-path
POST open
POST reveal
POST shortcut-resolve
POST relink
GET  project artifact title search
GET  artifact detail
GET  artifact revisions
GET  revision compare
GET  process projection
GET  execution items
```

不存在：

```text
POST archive
POST restore
POST batch archive
POST batch restore
GET archived objects
GET archive groups by archived date
```

当前 `/projects/:id/artifacts/search` 直接读 `getArtifacts()`；因为没有 archive 状态，它也无法返回“Archived 状态 + archive date”的结果语义。

结论：

```text
ARCHIVE_COMMAND_ROUTE = ABSENT
ARCHIVE_QUERY_ROUTE   = ABSENT
```

---

## 6. 当前 Delete 不是 Archive

Exact symbol：

```text
MetadataRepository.deleteArtifact()
```

当前行为：

```text
BEGIN IMMEDIATE
→ DELETE artifact_views
→ DELETE artifact_revisions
→ DELETE artifacts
→ COMMIT
```

源码注释明确这是级联删除；file_records 暂时保留只是因为可能被其它 Artifact 引用。

当前生产 callsite：

```text
MutationSafetyService revert artifact_text_create
→ deleteArtifact()
→ publish artifact.changed { action: deleted }
```

这只是撤销“新建文本 Artifact”的 hard delete inverse，不能复用为 Archive。

结论：

```text
deleteArtifact = HARD_DELETE
≠ Archive
≠ Restore-capable lifecycle
```

---

## 7. ProjectEvent contract 缺口

Exact file：

```text
packages/contracts/src/project-events.ts
```

现有 event type：

```text
presentation.changed
work_state.changed
run.changed
proposal.changed
artifact.changed
change_set.changed
relation.changed
feedback_revision.changed
continuity.changed
snapshot.required
```

已经存在可复用的：

```text
channel = artifact
type = artifact.changed
entityRefs
origin
project sequence / replay / snapshot_required
```

但当前没有冻结的 Archive payload/action schema，也没有 batch restore identity/order。

因此后续可能复用 `artifact.changed`，但必须新增严格 typed action/payload；不能在前端凭字符串猜 `archived`。

结论：

```text
EVENT_TRANSPORT = KEEP
ARCHIVE_EVENT_CONTRACT = GAP
```

---

## 8. Projection / Reconciliation 缺口

Exact file：

```text
apps/web-gen2/src/spatial/reconciliationRunner.ts
```

当前流程：

```text
GET ProjectGraph
→ graph.artifacts 全部转 ArtifactProjectionSource
→ projectArtifacts()
→ 已绑定但 Core artifact 不存在
→ removeOrphanNode + unbind
```

当前 projection eligibility 只有：

```text
Core Artifact 存在 / 不存在
```

不存在：

```text
Artifact 存在但 archived
→ 不进入 active Main projection
→ 保留 canonical identity/binding policy
```

如果只把 archived Artifact 从 ProjectGraph 中隐藏，现有 Reconciler 会把它当作“Core artifact 已不存在”的 orphan 处理。这个 mechanics 可用于移除 active Huabu node，但语义与 binding/restore 策略必须明确，否则 Restore 时可能混淆“修复 orphan”与“恢复同一对象”。

结论：

```text
RECONCILER_MECHANIC = PARTIALLY_REUSABLE
ARCHIVE_ELIGIBILITY = GAP
RESTORE_PROJECTION  = GAP
```

---

## 9. Search / Reference / Agent-read 当前行为

`ProjectSearchService` 当前遍历：

```text
repository.getArtifacts(projectId)
```

标题、正文和 semantic indexing 都没有 archive 状态分支。

这说明当前所有 Artifact 都默认 active，同时也意味着实现 Archive 时不能简单让 repository 全局过滤 archived，否则会破坏 V2 的要求：

```text
archived object remains searchable/referenceable/agent-readable
```

未来必须区分至少两种 query intent：

```text
canonical project search
→ 包含 archived，并标明 archived state/date

active Main projection eligibility
→ 排除 archived
```

Search owner 与 projection owner 不能共享一个粗暴的 `getActiveArtifacts()` 默认过滤。

---

## 10. Warehouse / Curation 不是 Archive owner

### Warehouse

Exact file：

```text
apps/local-core/src/warehouse-service.ts
```

Warehouse 是项目材料 read model，组合 Artifact、Note、Conversation、Resource、Context、Workflow、Scene、Collection。

其中 `visualFamily: 'archive'` 只表示 ZIP/RAR/7z/TAR/GZ 等压缩文件的视觉类型。

```text
Warehouse archive visual family
≠ canonical Archive lifecycle
```

### Curation

Exact files：

```text
apps/local-core/src/curation-command-service.ts
apps/local-core/src/curation-query-service.ts
```

Curation 提供受控读写、change set、undo、presentation patch、relation mutation 与 Artifact text mutation。它没有 archive state/mutation。

它可以成为未来 command orchestration 的参考，但不能因此被认定为 Archive owner。

---

## 11. Source classification

| 层 | Current owner | Archive 状态 |
|---|---|---|
| Product semantics | V2 / Phase B D13 | CLOSED / REQUIRED |
| Domain identity | Artifact 等 canonical entities | lifecycle field GAP |
| Persistence | MetadataRepository / SQLite | schema GAP |
| Command | 无 Archive service | GAP |
| Query | Artifact/Search/Warehouse | archive-aware query GAP |
| Event | ProjectEventHub + artifact.changed | transport KEEP；typed payload GAP |
| Projection | ReconciliationRunner | mechanics PARTIAL；eligibility GAP |
| Search | ProjectSearchService | current all-active assumption；需保留 archived searchability |
| Reference / Agent read | existing Artifact/revision refs | identity可复用；read-only policy GAP |
| UI | 无 Archive viewer | GAP |
| Restore layout | Huabu layout/reconcile | fresh-layout contract GAP |

---

## 12. 对 M8 与后续施工的影响

M8 ledger 更新为：

```text
M8 Archive
  product authority     = VERIFIED / CLOSED
  canonical owner       = MISSING
  persistence           = MISSING
  command/query         = MISSING
  typed event payload   = MISSING
  projection eligibility= MISSING
  search compatibility  = NEEDS_ADAPTATION
  UI viewer             = MISSING
  current source status = VERIFIED_GAP
```

这已经足够支持后续编写 Archive seam map，但不足以立即实施。原因是 Archive 涉及：

- canonical object lifecycle；
- SQLite schema / migration；
- Project Graph；
- Search；
- Reference / Agent read-only；
- ProjectEvent；
- Reconciliation；
- Huabu projection；
- Restore fresh layout；
- 多对象类型范围；
- batch transaction / undo。

按项目规则，这属于重大跨层变更，必须先输出正式影响说明与前后流程图并获得批准。

---

## 13. 后续 source-plan 必答问题

1. Archive lifecycle 是通用 project-entity contract，还是第一阶段只覆盖 Artifact？
2. Collection、Workflow、Conversation、Skill、Worksite 是否同阶段纳入？
3. lifecycle 数据放在实体表、统一 lifecycle 表，还是复用现有 relation substrate？
4. Archive/Restore 是否进入 MutationSafety change set 与 Undo？
5. batch restore 的 transaction、event 与 idempotency contract 如何定义？
6. archived object 的修改请求统一返回什么结构化错误？
7. Project Graph 是否返回 archived objects，还是提供 active/archived projection views？
8. Search 如何默认展示 archived badge/date，而不自动 Restore？
9. Reference / Context / Workflow 如何继续读取 archived object？
10. Reconciler 如何区分 orphan deletion 与 archived ineligibility？
11. Restore 如何建立 fresh projection 并触发布局，同时保证不读取旧 x/y？
12. Archive viewer 的按日分组是 Core query projection 还是 UI grouping？

---

## 14. Round 5 状态快照

```text
M8_ARCHIVE_CURRENT_SOURCE_CENSUS = COMPLETE

CANONICAL_ARCHIVE_OWNER          = VERIFIED_GAP
DOMAIN_LIFECYCLE                 = GAP
PERSISTENCE                      = GAP
COMMAND / QUERY                  = GAP
EVENT_TRANSPORT                  = KEEP
EVENT_PAYLOAD                    = GAP
SEARCH                           = ADAPT
REFERENCE / AGENT READ           = ADAPT
PROJECTION / RECONCILIATION      = ADAPT + GAP
UI VIEWER                        = GAP

NO_PRODUCT_REOPEN
NO_PRODUCTION_PATCH

NEXT
  M2 Assembly full-chain revalidation
```
