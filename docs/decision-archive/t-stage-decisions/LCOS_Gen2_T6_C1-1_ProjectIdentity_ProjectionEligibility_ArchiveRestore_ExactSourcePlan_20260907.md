# LCOS Gen2 · T6 · C1-1
# Project Identity + Projection Eligibility + Archive / Restore
## Formal Exact Source Construction Plan

**日期：2026-09-07**  
**上游：T6 C1-S1 + C1-S2**  
**Current source：`DZWFLi/LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a`；Huabu upstream `a3c411e1f655191344285141f08c4738fa6015f7`**
**Phase B authority：D13 Archive lifecycle 与事件顺序**  
**性质：可施工源码卡；本文件不执行 patch、不授权 production migration**

---

# 0. 本卡只解决三条强耦合 seam

```text
A. Active Project identity 真实上游 wiring
B. Artifact active-Main projection eligibility
C. Artifact Archive / Restore canonical lifecycle
```

不解决：

- Collection/Workflow typed membership；
- Worksite 全量迁移；
- ProjectEvent Web subscriber 的通用实现；
- Presentation/ArtifactView/ResultSlot geometry 全量退休；
- Archive viewer 最终视觉；
- Note/Workspace/Workflow 等其它实体的通用 Archive 平台；
- production patch。

这张卡先闭合 Artifact，因为 current ReconciliationRunner 的 source census 正是 `graph.artifacts`，且 Phase B D13 的复活风险首先发生在 Artifact active Main projection。不要为了“以后所有实体都能归档”先造 UniversalLifecycleManager。

---

# 1. Phase B 不可重开的语义

```text
Archive
→ Core 标记 archived / archivedAt
→ membership / relation / history 保留
→ ProjectEvent: archived
→ active Main projection eligibility = false
→ Reconciler 移除 Main active projection
→ 不保存 archive 前旧 x/y

Archived
→ Searchable
→ Referenceable
→ Agent-readable
→ Context/Workflow-referenceable
→ read-only

Restore
→ archived state clear
→ ProjectEvent: restored(batch-capable contract)
→ active Main projection eligibility = true
→ Reconcile 建立 fresh projection
→ Huabu fresh layout
→ 不读取 archive 前旧 x/y
```

Archived Search/Focus 只进入 Archive viewer / archived reference；不得自动 Restore，也不得定位幽灵坐标。

---

# 2. Current source exact findings

## 2.1 Project identity owner 已存在

```text
packages/domain/src/index.ts
  ProjectId
  Project

apps/local-core/src/routes/projects.ts
  handleProjectsRoute()
  POST /projects
  GET /projects/:projectId/graph

apps/local-core/src/metadata-repository.ts
  SqliteMetadataRepository.createProject()
  getProject()
  get()
```

Core ProjectId 是唯一真身份。

## 2.2 Web composition 仍有 sample fallback

```text
huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx:44
  const lcosProjectId = import.meta.env.PROJECT_ID ?? 'disposable-mvp-sample'

huabu/apps/web/src/lcos/lcosHost.ts:45
  projectId: env.PROJECT_ID ?? 'disposable-mvp-sample'
```

Existing runtime seam：

```text
huabu/apps/web/src/lcos/useLcosCanvasProps.tsx
  useLcosCanvasProps(projectId)

apps/web-gen2/src/host/createLcosHostRuntime.ts
  createLcosHostRuntime()
  LcosHostRuntime.retarget()
  dispose()
```

因此错误在上游 identity provider，不在 runtime 内核。

## 2.3 Artifact 没有 Archive lifecycle

```text
packages/domain/src/index.ts
  ArtifactAvailability = 'available' | 'missing' | 'stale'
  Artifact.availability
```

`availability` 表达文件观察状态，不表达用户 lifecycle。Current SQLite `artifacts` 也没有 `archived_at`。

## 2.4 Current restore vocabulary 不是 Archive Restore

```text
apps/local-core/src/mutation-safety-service.ts
  revert()
  reapply()
  restore_relation
  restore_artifact_view
  restore_note
  restore_artifact_text

apps/local-core/src/metadata-repository.ts
  restoreArtifactCurrentRevision()
```

这些恢复 ChangeSet inverse 或 Revision current pointer，不是保留同一 Artifact 的 archived lifecycle。

## 2.5 Reconciliation 无 eligibility

```text
apps/web-gen2/src/spatial/reconciliationRunner.ts
  ReconciliationRunner.runOnce()
  graph.artifacts
  artifactSource()
  nodeProjector.projectArtifacts(sources)
```

它会投影全部 graph artifacts；只有 Artifact 从 graph 消失，orphan prune 才删除 node/binding。

## 2.6 Projection removal primitive 已存在

```text
apps/web-gen2/src/spatial/projectToSpaceProjection.ts
  ProjectToSpaceProjection.removeOrphanNode(binding)
  rfs.deleteNodes([binding.spatialId])
  bindings.unbindByEntity(...)

apps/web-gen2/src/spatial/projectionBinding.ts
  ProjectionBindingRegistry
  unbindByEntity()
```

不需要新建 ArchiveProjectionService。

---

# 3. 目标模型：为什么用 `archivedAt`，不用改 availability

## 3.1 ADD domain field

```ts
export interface Artifact {
  // existing fields...
  readonly availability: ArtifactAvailability
  readonly archivedAt?: IsoDateTime
}
```

Active lifecycle：`archivedAt === undefined`。Archived lifecycle：`archivedAt !== undefined`。

不新增冗余 `lifecycleStatus`，避免：

```text
lifecycleStatus = active
archivedAt = timestamp
```

这类不一致组合。

## 3.2 Availability 与 lifecycle 正交

合法组合：

```text
available + active
missing   + active
stale     + active
available + archived
missing   + archived
stale     + archived
```

`missing` 不能等价于 archived；Restore 也不能把 missing 文件神奇恢复为 available。

## 3.3 Read-only rule

Archived Artifact：

- metadata/read/search/reference/context/agent read 允许；
- membership/relation 保留；
- active Main authoritative projection 不允许；
- revise/current-revision mutation 默认拒绝；
- Restore 是唯一解除 read-only 的显式 lifecycle mutation。

---

# 4. Exact file action matrix

| Action | Exact file | Exact symbol | Responsibility |
|---|---|---|---|
| MODIFY | `packages/domain/src/index.ts` | `Artifact` | 增加 `archivedAt?: IsoDateTime`；保持 `ArtifactAvailability` 不变 |
| MODIFY | `packages/contracts/src/project-events.ts` | `ProjectEventType` / artifact payload contract | 明确 artifact lifecycle action `archived/restored`；不新增事件总线 |
| MODIFY | `packages/contracts/src/curation-patch.ts` | `MutationChangeItemV1` | 增加可逆 lifecycle change item，保存 before/after archivedAt |
| MODIFY | `apps/local-core/src/metadata-repository.ts` | next migration after current schema | `artifacts ADD COLUMN archived_at TEXT`；旧行 NULL |
| MODIFY | `apps/local-core/src/metadata-repository.ts` | `#upsertArtifact()` / row mapper | round-trip archivedAt；upsert 不允许普通 graph save 静默清除 lifecycle |
| ADD | `apps/local-core/src/metadata-repository.ts` | `setArtifactArchivedAt()` | project-scoped CAS lifecycle write；返回 before/after |
| MODIFY | `apps/local-core/src/mutation-safety-service.ts` | `archiveArtifact()` / `restoreArtifact()` / `revert()` / `reapply()` | lifecycle transaction、ChangeSet、inverse/forward、event-after-commit |
| MODIFY | `apps/local-core/src/routes/entity.ts` | `handleEntityRoute()` | 新增显式 Artifact archive/restore routes；保留 DELETE 语义 |
| MODIFY | `apps/local-core/src/context-manifest-service.ts` | Artifact ref serialization | archived 可读，但标记 lifecycle/readOnly |
| MODIFY | `apps/local-core/src/active-context-store.ts` | `#project()` | archived item 可作为 reference/context，但不作为 active editable target |
| MODIFY | `apps/local-core/src/project-search-service.ts` | result projection | Search 包含 archivedAt/readOnly signal |
| MODIFY | `packages/contracts/src/search.ts` | search result item | 携带 archivedAt/readOnly，供 T2 Archive viewer |
| ADD | `apps/web-gen2/src/spatial/projectionEligibility.ts` | `isActiveMainProjectionEligible()` | 纯函数；Artifact archivedAt 存在则 false |
| MODIFY | `apps/web-gen2/src/spatial/reconciliationRunner.ts` | `artifactSource()` / `runOnce()` | source census 先过 eligibility；ineligible bindings 走现有 removal primitive |
| MODIFY | `apps/web-gen2/src/spatial/projectToSpaceProjection.ts` | `removeOrphanNode()` rename/generalize candidate | 支持“Core entity exists but ineligible” removal；仍 delete Huabu node then unbind |
| MODIFY | `apps/web-gen2/src/backend/coreTypes.ts` / typed graph boundary | Artifact transport type | 保留 archivedAt，不丢字段 |
| MODIFY | `huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx` | `CenterArea` | 从真实 active Project provider 接收 projectId；移除 production fallback |
| MODIFY | `huabu/apps/web/src/lcos/lcosHost.ts` | `readLcosHostConfig()` | projectId 必填或仅 test/dev fixture 显式注入；不默认 sample |
| KEEP | `apps/web-gen2/src/host/createLcosHostRuntime.ts` | runtime/retarget/dispose | 不重写 runtime；消费真实 projectId |
| KEEP | `apps/web-gen2/src/spatial/projectionBinding.ts` | binding composite key | 不加 instanceId，不加 geometry/lifecycle |
| KEEP | `apps/local-core/src/project-events/project-event-hub.ts` | publish/reconnect | 复用现有事件基础设施 |
| KEEP | `apps/local-core/src/mvp-sample-project.ts` | fixture helpers | 只用于明确的 sample/test/dev，不作 production fallback |
| RETIRE | `CenterArea.tsx` / `lcosHost.ts` | implicit `'disposable-mvp-sample'` | production identity fallback |

---

# 5. Domain 与 contract exact changes

## 5.1 `packages/domain/src/index.ts`

### MODIFY

在 `Artifact` 增加：

```ts
readonly archivedAt?: IsoDateTime
```

不修改：

```ts
export type ArtifactAvailability = 'available' | 'missing' | 'stale'
```

### Pure helpers candidate

```ts
export function isArtifactArchived(artifact: Pick<Artifact, 'archivedAt'>): boolean
export function isArtifactWritable(artifact: Pick<Artifact, 'archivedAt'>): boolean
```

只在两个以上 package 真实需要时导出；否则把 predicate 留在各边界的窄模块，避免 domain helper 泛滥。

## 5.2 Event payload

复用：

```text
type = artifact.changed
channel = artifact
```

Payload 至少：

```ts
interface ArtifactLifecycleChangedPayload {
  artifactId: string
  action: 'archived' | 'restored'
  archivedAt: string | null
}
```

Restore batch contract允许 payload 携带 `artifactIds`，但第一张实现卡若只有单 Artifact route，不要伪装成已实现 batch endpoint。Event consumer 必须同时接受单 item 与未来 batch envelope 的 versioned contract，具体类型在 C1-2 卡闭合。

---

# 6. SQLite migration

## 6.1 MODIFY `SqliteMetadataRepository`

在当前最新 migration 后新增一步，禁止回改历史 migration：

```sql
ALTER TABLE artifacts ADD COLUMN archived_at TEXT;
CREATE INDEX IF NOT EXISTS idx_artifacts_project_archived
  ON artifacts(project_id, archived_at);
PRAGMA user_version = <next>;
```

不添加 `archived INTEGER`，避免与 archivedAt 双 truth。

## 6.2 Migration invariants

```text
existing row → archived_at NULL
missing/stale availability unchanged
current_revision_id unchanged
relations unchanged
workspace/collection/workflow memberships unchanged
ArtifactView rows unchanged at migration time
ProjectionBinding rows unchanged at migration time
```

Projection cleanup 由 runtime reconcile 完成，不在 SQLite migration 中直接删 Huabu/binding。数据库 migration 不应需要 Huabu 在线。

## 6.3 Row mapping

`#upsertArtifact()` INSERT/UPDATE 和 artifact row mapper必须 round-trip archivedAt。

普通 graph upsert 的保护：

```text
existing archived_at != NULL
+ incoming legacy Artifact.archivedAt undefined
→ preserve existing lifecycle
```

只有 lifecycle-specific CAS method 可以清除 archivedAt，防止旧客户端 PUT graph 把 Archive 静默抹掉。

## 6.4 Lifecycle CAS

Candidate repository contract：

```ts
setArtifactArchivedAt(input: {
  projectId: string
  artifactId: string
  expectedArchivedAt: string | null
  nextArchivedAt: string | null
  updatedAt: string
}): { before: Artifact; after: Artifact }
```

SQL WHERE 必须包含：

```text
id
project_id
expected archived_at（含 NULL 分支）
```

避免跨项目 mutation 和 lost update。

---

# 7. MutationSafetyService lifecycle implementation

## 7.1 ADD `archiveArtifact()`

输入：

```ts
{
  projectId: string
  artifactId: string
  expectedArchivedAt?: null
  operationId?: string
  actorKind?: ...
  origin?: ProjectEventOrigin
}
```

顺序：

```text
load Artifact in Project
→ if already archived: return idempotent existing/no-op receipt
→ set archivedAt = now with CAS
→ build ChangeSet
   inverse: artifact_lifecycle_restore(before archivedAt = null)
   forward: artifact_lifecycle_archive(after archivedAt = timestamp)
→ persist ChangeSet/operation receipt in same transaction boundary
→ commit
→ publish artifact.changed(action=archived)
→ publish change_set.changed
```

## 7.2 ADD `restoreArtifact()`

```text
load Artifact in Project
→ require archivedAt != null
→ CAS archivedAt to NULL
→ ChangeSet inverse/forward
→ commit
→ publish artifact.changed(action=restored)
```

Repeated Restore of active Artifact is an idempotent no-op, not a new ChangeSet.

## 7.3 Revert/reapply

`revert()` 和 `reapply()` 增加 lifecycle change handling，通过同一 repository CAS 执行，不直接手写 UPDATE 绕过 owner。

Revert Archive = Restore lifecycle，但 event origin/ChangeSet lineage 必须表明这是 undo。Reapply Restore/Archive同理。

## 7.4 Transaction boundary

Current `MutationSafetyService.record()` 与 metadata transaction 能力应复用。若现有 API 无法保证 lifecycle row + ChangeSet 原子提交，C1-S3 实现者应在 repository 增加一个窄 transaction method；不能先提交 archivedAt 再“尽力写”ChangeSet。

---

# 8. HTTP routes

## 8.1 MODIFY `apps/local-core/src/routes/entity.ts`

新增明确动作：

```text
POST /projects/:projectId/artifacts/:artifactId/archive
POST /projects/:projectId/artifacts/:artifactId/restore
```

不把：

```text
DELETE /projects/:projectId/artifacts/:artifactId
```

改名成 Archive。Delete 保留高风险独立语义。

## 8.2 Request

```json
{
  "expectedArchivedAt": null,
  "operationId": "...",
  "origin": {
    "clientId": "...",
    "sessionId": "...",
    "clientSeq": 1,
    "operationId": "..."
  }
}
```

Restore 的 `expectedArchivedAt` 必须等于当前值，防止对另一次 Archive 做陈旧恢复。

## 8.3 Response

```json
{
  "ok": true,
  "value": {
    "artifact": {},
    "changeSetId": "...",
    "idempotent": false
  }
}
```

## 8.4 Errors

| Condition | HTTP | Code |
|---|---:|---|
| Project/Artifact missing | 404 | `NOT_FOUND` |
| cross-project identity | 404 or fail-close 400 per route convention | `NOT_FOUND/INVALID_ARGUMENT` |
| stale archivedAt | 409 | `CONFLICT` |
| mutation service absent | 503 | `UNAVAILABLE` |
| malformed origin/operationId | 400 | `INVALID_ARGUMENT` |

---

# 9. Archived read-only enforcement

Archive 保留 read paths，因此不可在 repository `getArtifact()` 层隐藏 archived rows。

## 9.1 Read consumers that KEEP archived

```text
getArtifact / getArtifacts
ProjectSearchService
ContextManifestService
ContextSnapshot/reference resolution
relations/memberships
Agent context/resource readers
Archive viewer
```

必须携带 `archivedAt/readOnly` signal。

## 9.2 Active/edit consumers that filter or reject

```text
ReconciliationRunner active Main projection
revise Run target validation
text/revision mutation
external-change adoption as Current
active editable target selection
```

## 9.3 Exact likely guards

```text
apps/local-core/src/runtime-application-service.ts
  revise target validation in create()

apps/local-core/src/text-artifact-service.ts
  current revision mutations

apps/local-core/src/curation-command-service.ts
  update text / accepted patch paths

apps/local-core/src/file-observation-service.ts
  may update file availability, but must not clear archivedAt
```

File watcher可以继续更新 missing/stale；这不是对 archived content 的用户编辑。它不得解除 read-only lifecycle。

---

# 10. Projection eligibility pure seam

## 10.1 ADD

```text
apps/web-gen2/src/spatial/projectionEligibility.ts
```

Candidate types：

```ts
export type ProjectionSurfaceRole = 'active-main' | 'reference' | 'archive-viewer'

export function isProjectionEligible(input: {
  entityType: string
  archivedAt?: string
  surfaceRole: ProjectionSurfaceRole
}): boolean
```

Minimum rule：

```text
artifact + archived + active-main → false
artifact + archived + reference/archive-viewer → true
artifact + active + active-main → true
unknown entity/surface → fail-close for authoritative projection
```

不要把 eligibility 塞进 `ProjectionBindingRegistry`；binding 只管理 identity mapping。

## 10.2 Unit tests

ADD candidate：

```text
apps/web-gen2/test/projection-eligibility.test.ts
```

覆盖 active/archived × active-main/reference/archive-viewer，以及 unknown type fail-close。

---

# 11. Reconciliation exact patch

## 11.1 MODIFY `artifactSource()`

Transport/source type增加 archivedAt。`artifactSource()` 只解析，不在这里偷偷丢 archived；eligibility 决策必须显式可测。

## 11.2 MODIFY `ReconciliationRunner.runOnce()`

Before：

```text
rawArtifacts
→ artifactSource
→ projectArtifacts(all)
```

After：

```text
rawArtifacts
→ artifactSource
→ partition eligible / ineligible
→ projectArtifacts(eligible)
→ for current project/canvas artifact node bindings:
     if entity missing OR entity exists but ineligible
       → remove projection
```

Result telemetry增加：

```ts
artifactsIneligible: number
removedIneligibleNodes: number
```

与 orphan removal 分开，便于审计“实体删除”与“实体归档”。

## 11.3 Generalize removal name

Current：

```ts
removeOrphanNode(binding)
```

Candidate：

```ts
removeProjection(binding, reason: 'entity-missing' | 'entity-ineligible')
```

内部仍：

```text
Huabu delete node
→ only after success unbind
```

如果 Huabu delete 失败，binding 暂时保留以供 retry，不能先解绑制造不可追踪孤儿。

## 11.4 Restore fresh placement

Restore 后没有 binding/node，现有 `projectEntity()` 创建路径提供 initial placement policy。禁止读取 archived ArtifactView/Presentation 的旧 x/y 来恢复。

如果 T5/Huabu 最终提供 occupancy-aware fresh layout，作为 projector placement adapter 注入；不把 placement 写进 lifecycle service。

---

# 12. Project identity exact patch

## 12.1 Required upstream owner

`CenterArea` 必须从 App Shell/Project Session 获得 active ProjectId。T6 不新建第二 Project Store；消费 T4/现有 App Shell 的真实 Project session seam。

Candidate prop/context contract：

```ts
interface CenterAreaProps {
  projectId: string
}
```

或读取既有 `ProjectSession` context，最终由 T4 C1-1 返回接口决定。这里冻结要求，不越权冻结 React owner。

## 12.2 Fail-close

Production projectId 缺失：

```text
do not create LCOS host runtime
do not reconcile sample project
show explicit project-not-selected/loading state
```

Dev/sample必须显式：

```text
PROJECT_ID=disposable-mvp-sample
```

环境变量可以作为开发选择，但不能有隐式 fallback。

## 12.3 Lifecycle

```text
Project mount
→ build runtime(projectId)
→ project open reconcile

same Project / canvas change
→ runtime.retarget({ canvasId })

Project change
→ dispose old subscriptions/reconciler
→ retarget/rebuild with new ProjectId
→ no old cursor/binding cache leakage

unmount
→ dispose
```

---

# 13. Event order

## Archive

```text
1. validate Project/Artifact/expectedArchivedAt
2. canonical artifacts.archived_at CAS
3. persist ChangeSet + operation receipt
4. commit SQLite transaction
5. publish artifact.changed(action=archived)
6. publish change_set.changed
7. Web subscriber invalidates graph/search/context
8. Reconciliation sees ineligible Artifact
9. Huabu node delete succeeds
10. ProjectionBinding unbind
11. T1/T5 show archived feedback/reference affordance
```

## Restore

```text
1. validate explicit Restore + expectedArchivedAt
2. clear archived_at CAS
3. persist ChangeSet/receipt
4. commit
5. publish artifact.changed(action=restored)
6. Web invalidates/refetches
7. eligibility true
8. projectEntity creates fresh Huabu projection
9. bind new SpatialId
10. fresh layout; no old x/y
```

---

# 14. Races and idempotency

## R1 · Archive vs concurrent revise

Both must validate lifecycle/version in canonical transaction. If Archive commits first, revise rejects read-only. If revise commits first, Archive preserves new current revision and archives it.

## R2 · Duplicate Archive

Same operationId returns same receipt. Different operationId against already archived Artifact returns idempotent current state without creating infinite ChangeSets.

## R3 · Archive then stale Restore

Restore carries expectedArchivedAt. A later Archive timestamp invalidates stale Restore.

## R4 · Event before Web disconnect

Cursor replay handles retained event; otherwise snapshot_required → graph refetch → eligibility/reconcile.

## R5 · Core archived, Huabu delete fails

Canonical state remains archived. Binding stays until successful deletion or is marked repair-needed through observability. Active UI must visually suppress/edit-lock the node immediately based on Core state, even if stale body remains during repair.

## R6 · Huabu node deleted, unbind fails

Next reconcile sees stale binding, `projectEntity()`/removal path repairs. Do not recreate archived node because eligibility is checked before projection.

## R7 · Restore during removal retry

Reconcile uses latest authoritative graph. Removal operation must recheck eligibility/version or tolerate node missing; Restore creates one authoritative projection via composite binding key.

## R8 · Project switch mid-reconcile

Old runtime disposed; stale async completion must not write into new Project session. Reuse T4 ProjectSession stale-generation guard rather than inventing T6 global token.

---

# 15. Search / Reference / Agent behavior

## Search

Search index不删除 archived Artifact。Result携带：

```text
archivedAt
readOnly = true
focusTarget = archive-viewer/reference, not Main coordinates
restoreAvailable = explicit permission-based affordance
```

## Reference

Existing membership/relation IDs remain valid. Dragging/using archived object creates reference/proxy behavior only；不得自动创建 authoritative Main projection。

## Agent

ContextManifest/AgentContextItem携带 archived/readOnly signal。Agent可以读取，但 edit target validation fail-close，除非用户先显式 Restore。

---

# 16. Test exact file plan

## 16.1 Domain

ADD/MODIFY：

```text
packages/domain/tests/artifact-lifecycle.test.ts
```

- archivedAt 与 availability 正交；
- serialization/typing；
- active/archived predicate。

## 16.2 Migration/repository

```text
apps/local-core/tests/metadata-repository.test.ts
apps/local-core/tests/artifact-lifecycle-persistence.test.ts (candidate ADD)
```

- old DB migrates archived_at NULL；
- archive survives close/reopen；
- ordinary graph save cannot clear archivedAt；
- lifecycle CAS rejects stale expectedArchivedAt；
- relation/membership/revision rows preserved。

## 16.3 Mutation

```text
apps/local-core/tests/artifact-archive-restore.test.ts (ADD)
```

- Archive/Restore ChangeSet；
- revert/reapply；
- same operation id receipt；
- cross-project fail-close；
- duplicate Archive/Restore；
- event occurs after committed read is visible。

## 16.4 Routes

```text
apps/local-core/tests/runtime-http.test.ts or entity-http test split
```

- explicit archive/restore endpoints；
- DELETE remains destructive and distinct；
- 400/404/409/503；
- archived remains GET/search/reference visible。

## 16.5 Projection

```text
apps/web-gen2/test/projection-eligibility.test.ts (ADD)
apps/web-gen2/test/g08-closure.test.ts (MODIFY)
apps/web-gen2/test/g09-host.test.ts (MODIFY)
```

- archived artifact not projected；
- active artifact projected；
- existing binding for newly archived artifact removed；
- missing vs ineligible telemetry separate；
- Restore creates exactly one fresh projection；
- repeated reconcile idempotent；
- reconnect/restart cannot resurrect archived node。

## 16.6 Project identity

```text
huabu/apps/web/src/lcos/*.test.ts(x)
huabu/apps/web/src/pages/CanvasPage/CenterArea*.test.tsx
```

- missing production ProjectId does not mount runtime；
- explicit dev fixture works；
- Project switch disposes old runtime；
- stale reconcile cannot contaminate new Project。

---

# 17. Browser acceptance

## BA-C1-1-01 · Real Project identity

1. Open Project A；
2. verify runtime/reconcile requests use A；
3. switch to Project B；
4. verify no A nodes/events appear in B；
5. remove Project selection；
6. verify sample project is not silently mounted。

## BA-C1-1-02 · Archive visible Artifact

1. Select active Artifact node；
2. explicit Archive preview/confirm；
3. node leaves active Main；
4. Search still finds it as Archived/read-only；
5. Collection/Workflow/Relation references remain；
6. Focus opens archive/reference surface, not ghost coordinates。

## BA-C1-1-03 · Restore fresh projection

1. Restore from Archive viewer；
2. one new authoritative Main projection appears；
3. old x/y is not reused；
4. repeated Restore/reconcile does not duplicate node。

## BA-C1-1-04 · Restart recovery

1. Archive Artifact；
2. close Web/Core；
3. reopen same Project；
4. archived node does not resurrect；
5. Search/reference still work；
6. Restore creates fresh projection。

## BA-C1-1-05 · Offline Huabu repair

1. disconnect Huabu before Archive projection removal；
2. Core Archive commits；
3. stale body becomes non-editable/suppressed；
4. reconnect；
5. reconcile removes node/binding；
6. no canonical rollback occurred。

## BA-C1-1-06 · Concurrent edit conflict

1. open Artifact in two clients；
2. Archive in client A；
3. revise in B with stale state；
4. B receives conflict/read-only；
5. no silent current revision overwrite。

---

# 18. Observability

Structured logs/metrics：

```text
artifact_lifecycle_mutation
  projectId / artifactId / action / operationId / result

projection_reconcile
  artifactsScanned / eligible / ineligible
  orphanRemoved / ineligibleRemoved / failed

project_session
  previousProjectId / nextProjectId / generation / disposeReason
```

敏感 Context/body 不进入普通日志。

Repair diagnostics必须能区分：

```text
entity_missing
entity_archived
huabu_delete_failed
binding_unbind_failed
stale_project_generation
```

---

# 19. Implementation sequence

```text
1. Domain archivedAt + transport round-trip
2. SQLite migration + repository CAS + persistence tests
3. Mutation ChangeSet/inverse/event + tests
4. Archive/Restore HTTP routes
5. read-only guards in revise/current mutation paths
6. Search/Context/Agent archived signal
7. pure projection eligibility + unit tests
8. Reconciliation partition/removal telemetry
9. real ProjectId composition + fail-close
10. reconnect/restart integration tests
11. browser acceptance
12. observation window
```

不要先改 Reconciliation 再补 Core lifecycle；否则 Web 会根据不存在的字段自行猜状态。

---

# 20. Candidate file count discipline

Expected direct production files：约 14–18 个，测试 6–9 个。

如果实施明显超过：

```text
production > 22 files
new tables > 1
new broad services > 1
new event systems > 0
```

必须停止复审，说明 seam 已失控或混入其它卡范围。

本卡预期不新增专用 Archive table；只在 `artifacts` 增加 nullable `archived_at`。

---

# 21. Rollback

## Code rollback

Revert Web eligibility/routes/mutation guards；保留 nullable column向后兼容。不得在紧急回滚时删除 `archived_at` 数据。

## Behavioral rollback

若 projection removal 产生严重问题：

- 暂停新的 Archive route；
- archived canonical rows保持；
- Archive viewer/search仍可读；
- 修复 reconciler 后恢复 projection cleanup；
- 不把 archivedAt 批量清空冒充回滚。

## Schema rollback

首次发布不 drop column。真正 schema cleanup 不在本卡范围。

---

# 22. Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| old graph PUT clears archivedAt | P0 | repository preserve rule + lifecycle-only CAS |
| archived node resurrects on restart | P0 | eligibility before projection + restart test |
| Archive mistaken for file missing | P0 | separate archivedAt from availability |
| membership/relation accidentally cascade | P0 | migration/mutation preservation assertions |
| archived Artifact still editable | P0 | central target guards + concurrent test |
| Huabu failure leaves visible stale body | P1 | read-only suppression + repair diagnostics |
| Project switch cross-contamination | P0 | existing runtime disposal + generation guard |
| Search deletes archived index entry | P1 | keep index; add lifecycle signal |
| Restore reuses old coordinates | P1 | fresh projector path; no Core geometry lookup |
| ChangeSet and lifecycle non-atomic | P0 | narrow repository transaction |

---

# 23. Done checklist

- [ ] `Artifact.archivedAt` exists and is independent from availability；
- [ ] migration upgrades old DB with NULL archived_at；
- [ ] archivedAt round-trips across Core graph/API；
- [ ] legacy graph write cannot silently clear lifecycle；
- [ ] Archive/Restore are explicit routes, not DELETE aliases；
- [ ] lifecycle + ChangeSet/receipt are atomic；
- [ ] events publish only after commit；
- [ ] archived remains Search/Reference/Agent readable；
- [ ] archived edit target fails closed；
- [ ] active Main eligibility is a pure tested seam；
- [ ] reconciler removes ineligible projection and binding；
- [ ] Restore creates fresh projection without old x/y；
- [ ] real ProjectId replaces implicit sample fallback；
- [ ] Project switch disposes old runtime/reconcile work；
- [ ] restart/reconnect does not resurrect archived node；
- [ ] membership/relation/history preservation proven；
- [ ] rollback preserves lifecycle data；
- [ ] browser acceptance BA-C1-1-01..06 passes；
- [ ] no new EventBus/Project Manager/geometry truth introduced。

---

# 24. Final owner matrix

| Concern | Final owner |
|---|---|
| Project identity | Core Project + App ProjectSession upstream |
| Artifact lifecycle | Core Artifact archivedAt |
| file condition | Artifact/FileRecord availability |
| lifecycle mutation | MutationSafetyService + repository transaction |
| ChangeSet/Undo | existing MutationSafety/Curation substrate |
| lifecycle event | existing ProjectEventHub |
| active Main eligibility | web-gen2 pure projection predicate |
| projection reconciliation | ReconciliationRunner |
| spatial node/geometry | Huabu |
| identity mapping | ProjectionBinding |
| archived search/reference | Core read/search/context + T2 viewer |
| final visual/motion | T5 consuming T6 truth |

---

# 25. Handoff / next card boundary

本卡输出给：

- T2：Archived Search/Focus signal，不定位旧坐标；
- T3：Archive/Restore action 与 event/refetch trigger；
- T4：真实 ProjectSession identity input；
- T5：archived/read-only/reference/restore-in-progress states；
- T6 C1-2：ProjectEvent Web subscriber 必须消费 `artifact.changed` 后 refetch/reconcile。

下一张：

```text
T6 C1-2
ProjectEvent Web Subscriber
+ ActiveContext Recovery
+ replay / snapshot_required / authoritative refetch
```

当前状态：

```text
C1-1 FORMAL EXACT SOURCE PLAN COMPLETE
IMPLEMENTATION NOT STARTED
PRODUCTION PATCH NOT AUTHORIZED
```
