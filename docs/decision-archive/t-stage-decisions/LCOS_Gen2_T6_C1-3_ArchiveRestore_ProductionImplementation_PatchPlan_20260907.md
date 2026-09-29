# LCOS Gen2 · T6 · C1-3
# Archive / Restore Production Implementation
## Exact Patch Batches + Verification + Rollback Plan

**日期：2026-09-07**  
**源码基线：`DZWFLi/LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a`；Huabu upstream `a3c411e1f655191344285141f08c4738fa6015f7`**  
**上游：T6 C1-1、T6 C1-2**  
**性质：生产实施编排卡；当前只输出 Markdown，不执行 patch**

---

# 0. 当前执行闸门

当前会话目录 `E:\Codex 项目\OS开发` 不是 Gen2 main 且为非干净工作区。已确认唯一允许作为后续施工候选的 `E:\OS开发\LCOS_Gen2` 为干净 `main@232b2ca5`；本轮只同步基线文档，不实施本卡 production patch。依据项目 `AGENTS.md`：

```text
当前工作区不干净
→ 停止 production implementation
→ 不覆盖用户文件
→ 不创建 branch / commit / tag
```

因此本卡把实际代码施工拆成可审查 patch batches，并给出每批验收与回滚点；不在当前状态下写入仓库。

正式开工前必须重新执行：

```powershell
git status --short
git branch --show-current
git log --oneline -10
git diff --check
```

后续目标仓库固定为 `E:\OS开发\LCOS_Gen2`。每次开工仍需重新确认其 status干净和 HEAD未漂移；不得在当前会话目录套 patch。

---

# 1. 本卡交付目标

把 Archive / Restore 变为完整 production vertical slice：

```text
explicit HTTP command
→ identity + lifecycle CAS
→ SQLite transaction
→ Artifact.archivedAt + ChangeSet
→ commit
→ artifact.changed + change_set.changed
→ canonical ProjectEvent SSE
→ Web authoritative refetch
→ projection eligibility
→ Huabu node/edge cleanup or fresh restore placement
→ restart/reconnect remains correct
```

完成后必须同时成立：

- Archive 不删除 Artifact、Revision、Relation、membership、history；
- archived 不等于 missing/stale；
- archived 仍可 Search / Reference / Agent read；
- archived 不能作为 active edit/run target；
- active Main 不投影 archived Artifact；
- Restore 不恢复旧 Huabu 坐标；
- mutation 可审计、可安全 revert/reapply；
- SSE gap/runtime restart 后最终恢复到 authoritative truth；
- 不引入第二领域真相、第二事件总线或 Core geometry。

---

# 2. Frozen data model

## 2.1 Domain

修改 `packages/domain/src/index.ts`：

```ts
export interface Artifact {
  // existing fields...
  readonly archivedAt?: IsoDateTime
}
```

不修改：

```ts
type ArtifactAvailability = 'available' | 'missing' | 'stale'
```

两轴语义：

| archivedAt | availability | Meaning |
|---|---|---|
| absent | available | active and readable/editable |
| absent | missing/stale | active lifecycle, file problem |
| present | available | archived, source still available |
| present | missing/stale | archived and source has file problem |

## 2.2 Pure helpers

建议同文件或窄领域模块增加：

```ts
export function isArtifactArchived(artifact: Artifact): boolean
export function isArtifactActive(artifact: Artifact): boolean
```

不得把 UI projection eligibility 放进 Domain；Domain 只判断 lifecycle。

## 2.3 API compatibility

`archivedAt` 是 optional 字段：旧 client 可忽略，新 client可读取。  
PUT whole-object 路径不得因旧 payload 缺字段而清空已存在 `archivedAt`。

---

# 3. Frozen mutation contract

## 3.1 Commands

```text
POST /projects/:projectId/artifacts/:artifactId/archive
POST /projects/:projectId/artifacts/:artifactId/restore
```

不使用 DELETE 伪装 Archive，不用 PUT 整体覆盖 lifecycle。

Request：

```ts
interface ArtifactLifecycleCommandV1 {
  schemaVersion: 1
  expectedUpdatedAt: string
  origin: ProjectEventOrigin
  actorKind?: 'user' | 'agent' | 'system'
  actorId?: string
}
```

Response：

```ts
interface ArtifactLifecycleResultV1 {
  artifact: Artifact
  changeSet: MutationChangeSetV1
  operationId: string
}
```

operationId 直接使用 `origin.operationId`，由既有 `ProjectMutationCoordinator` 支持当前 runtime 内幂等 receipt。

## 3.2 Idempotency

- 相同 operationId：返回相同 receipt/result；
- 新 operationId 对已 archived Artifact 调 Archive：返回当前状态，明确 `changed:false`，不制造第二个 lifecycle ChangeSet；
- 新 operationId 对 active Artifact 调 Restore：同上；
- expectedUpdatedAt 不匹配：409；
- Core runtime restart 后 receipt丢失时，以 lifecycle state + CAS 重新判断，不能盲写。

## 3.3 Authorization/validation

- route project 必须存在；
- Artifact 必须属于 route project；
- origin必须完整；
- body拒绝未知字段；
- archived Artifact不因 local file missing 被拒绝 Restore；
- 不接受 browser 提供本地路径。

---

# 4. Frozen ChangeSet shape

扩展 `MutationChangeItemV1` union，新增窄 lifecycle change：

```ts
interface ArtifactArchiveStateChangeV1 {
  type: 'artifact_archive_state'
  artifactId: string
  beforeArchivedAt: string | null
  afterArchivedAt: string | null
  expectedUpdatedAtBefore: string
  expectedUpdatedAtAfter: string
  inverse: {
    type: 'set_artifact_archive_state'
    artifactId: string
    archivedAt: string | null
    expectedUpdatedAt: string
  }
  forward: {
    type: 'set_artifact_archive_state'
    artifactId: string
    archivedAt: string | null
    expectedUpdatedAt: string
  }
  appliedFingerprint: string
}
```

规则：

- Archive inverse = set NULL；
- Restore inverse = set previous timestamp；
- revert/reapply 只改 archive state，不恢复/删除整个 Artifact；
- fingerprint 必须包含 artifactId、archivedAt、updatedAt；
- subsequent edit/lifecycle mutation 改变 touched state 后拒绝覆盖。

---

# 5. SQLite patch

## 5.1 Schema

修改 `apps/local-core/src/metadata-repository.ts` 的 canonical schema与 migration路径：

```sql
ALTER TABLE artifacts ADD COLUMN archived_at TEXT NULL;
```

新建数据库的 `CREATE TABLE artifacts` 同时包含：

```sql
archived_at TEXT NULL
```

不得只加 try/catch ALTER 而漏掉 fresh schema；也不得只改 fresh schema而漏旧库 migration。

## 5.2 Read mapping

Artifact row → Domain：

```ts
...(row.archived_at == null ? {} : { archivedAt: String(row.archived_at) })
```

## 5.3 Upsert preservation

当前 `upsertArtifact()` 的 `ON CONFLICT DO UPDATE` 会覆盖列。修改原则：

- lifecycle-aware internal write可显式写 `archived_at`；
- legacy whole Artifact PUT若 payload缺 `archivedAt`，保留 existing archived_at；
- create 时缺字段写 NULL；
- route不能用 optional undefined 表示“恢复”；恢复只能走专用 command。

可用两个 repository 方法分离意图：

```ts
upsertArtifact(value, { preserveLifecycleWhenOmitted: true })
compareAndSetArtifactArchivedAt({ projectId, artifactId, expectedUpdatedAt, archivedAt, nextUpdatedAt })
```

## 5.4 Transaction

增加窄事务方法：

```text
BEGIN IMMEDIATE
→ read and validate current Artifact
→ CAS archived_at + updated_at
→ insert MutationChangeSet + items
→ COMMIT
```

任何一步失败全部 rollback。ProjectEvent 只能在 commit 返回之后 publish。

## 5.5 Index

首版不需要 `archived_at` index，除非 query plan 证明列表过滤成为瓶颈。Project规模较小，避免无依据优化。

---

# 6. MutationSafetyService patch

在 `apps/local-core/src/mutation-safety-service.ts` 增加：

```ts
archiveArtifact(input): ArtifactLifecycleResultV1
restoreArtifact(input): ArtifactLifecycleResultV1
```

内部收敛到：

```ts
#setArtifactArchivedAt(input, nextArchivedAt): ArtifactLifecycleResultV1
```

## 6.1 Archive order

```text
read Artifact
→ validate project + expectedUpdatedAt
→ if already archived: unchanged result
→ now = clock()
→ transaction(CAS archivedAt=now + ChangeSet)
→ publish artifact.changed(action=archived)
→ publish change_set.changed
→ return committed values
```

## 6.2 Restore order

```text
read Artifact
→ validate project + expectedUpdatedAt
→ if active: unchanged result
→ transaction(CAS archivedAt=NULL + ChangeSet)
→ publish artifact.changed(action=restored)
→ publish change_set.changed
→ return committed values
```

## 6.3 Event payload

```ts
{
  schemaVersion: 1,
  artifactId,
  action: 'archived' | 'restored',
  resultingVersion: nextUpdatedAt
}
```

若 `resultingVersion` contract限定 number，则不要塞 timestamp；应改名/另增 `updatedAt`。类型必须在 C1-3-A 先闭合。

## 6.4 Existing collision

当前 `#publishArtifact()` 的 action仅 `'restored' | 'deleted'`，其中 restored表示 revision pointer restore，不等于 archive lifecycle restore。

必须消歧：

```text
revision_restored
archived
restored
deleted (若仍存在真实删除语义)
```

不能让 Web 看到 `restored` 却不知道是 revision还是 lifecycle。

---

# 7. Route patch

修改 `apps/local-core/src/routes/entity.ts`：

```text
const archiveMatch = /^\/projects\/([^/]+)\/artifacts\/([^/]+)\/archive$/
const restoreMatch = /^\/projects\/([^/]+)\/artifacts\/([^/]+)\/restore$/
```

专用 command匹配应放在 generic artifact-one route 前，避免路径层级误判。

Status mapping：

| Case | HTTP |
|---|---:|
| success / unchanged idempotent | 200 |
| invalid body/origin | 400 |
| project/artifact absent | 404 |
| artifact belongs other project | 404 or 409，选定后一致 |
| expectedUpdatedAt conflict | 409 |
| service absent | 503 |

不得返回 `value:null`；返回 canonical Artifact与ChangeSet/changed结果。

## 7.1 Generic PUT guard

当前 artifact PUT直接 `metadata.upsertArtifact(body as Artifact)`。必须增加：

- existing Artifact lookup；
- project identity校验；
- archived existing + body缺 archivedAt时 preserve；
- archived Artifact的普通修改拒绝 409，除非仅是受允许的外部观测字段更新；
- browser不能通过 PUT 清空 archivedAt。

推荐先把 write intent拆成 application service，不让 route继续直接裸 repository write。

---

# 8. Read/write policy patch

## 8.1 KEEP readable

以下读取默认包含 archived：

- get Artifact by ID；
- artifact revision/history；
- Search index/result；
- Relation/reference resolution；
- Agent context explicit reference；
- audit/change set；
- Archive viewer/list。

列表接口建议显式 query：

```text
GET /projects/:id/artifacts?lifecycle=active|archived|all
```

默认兼容策略必须在实现前冻结。建议 canonical project graph返回 all truth，并由 projection eligibility过滤；普通 active UI list可请求 active。

## 8.2 FAIL closed for mutation target

集中 helper：

```ts
assertArtifactAcceptsMutation(artifact, operation)
```

至少接入：

- revise/write；
- Run target选择；
- ArtifactView新建/复制；
- destructive relation creation as active output target；
- file adopt/overwrite；
- accept Artifact Return into archived target。

允许的 archived 操作：

- read/search/reference；
- Restore；
- audit/export（只读）。

不要在几十个 route复制 `if (archivedAt)`；先定位共同 service boundary。

---

# 9. ActiveContext normalization

Archive 不删除 persisted membership/relation/history，但 ActiveContext projection不能继续把 archived Artifact当 editable selection/target。

修改 `ActiveContextStore.#refreshGraphProjection()` / `#project()`：

- archived view可在 explicit reference/context中解析；
- `selectedViewIds` 的 active-edit selection过滤 archived；
- `targetArtifactId` 若 archived，targetProjection省略或标 readOnly；
- contextItems保留 archived explicit reference并携带 lifecycle/readOnly signal；
- nodes若用于当前 Canvas observation，应遵循 active Main eligibility；
- 不修改 persisted pinned reference identity，只改变派生 projection。

这一步要与 T2/T5 的 Archived viewer形态对齐，不能简单让所有 archived引用消失。

---

# 10. Projection eligibility patch

ADD：

```text
apps/web-gen2/src/spatial/projectionEligibility.ts
```

Pure API：

```ts
interface ProjectionEligibility {
  eligible: boolean
  reason?: 'archived' | 'unsupported' | 'invalid_identity'
}

function activeMainProjectionEligibility(artifact: Artifact): ProjectionEligibility
```

首版规则：

```text
archivedAt present → ineligible: archived
valid active Artifact → eligible
```

availability missing/stale 不自动使其消失；它们应显示异常状态，而非被 Archive语义吞并。

---

# 11. Reconciliation patch

修改 `apps/web-gen2/src/spatial/reconciliationRunner.ts`：

1. `artifactSource()` 读取 `archivedAt`；
2. raw artifacts分为 eligible/ineligible；
3. 只为 eligible 调 `projectArtifacts()`；
4. relation edge仅在两端都有 active projected node时生成；
5. bound node若 Artifact不存在或 ineligible，删除 Huabu node并 unbind；
6. bound relation edge若 Core relation不存在或任一端 ineligible，删除 edge并 unbind；
7. result分别统计 orphan vs ineligible removals。

建议将 `removeOrphanNode()` 泛化命名：

```ts
removeProjectedNode(binding, reason)
```

但不得扩大到重写 projector。

## 11.1 Restore placement

Restore 后 artifact重新 eligible：

```text
no binding
→ ProjectToSpaceProjection.projectArtifacts()
→ Huabu creates node using current placement algorithm
→ new binding
```

不得从 Core `ArtifactView.position/size` 或已删除 binding恢复旧坐标。

---

# 12. Realtime integration

C1-3 必须依赖 C1-2 canonical event path；若 C1-2 尚未代码实现，按下述顺序施工：

```text
first: C1-2 Core route canonicalization + Web subscriber minimum vertical slice
then: C1-3 lifecycle events
```

Archive event recovery：

```text
artifact.changed(archived)
→ coordinator invalidates graph
→ GET graph
→ run reconciliation
→ remove node/affected edges
→ GET ActiveContext if current context may reference artifact
→ cursor advance
```

Restore event recovery：

```text
artifact.changed(restored)
→ GET graph
→ run reconciliation
→ fresh node placement
→ GET ActiveContext
→ cursor advance
```

若 SSE断线：replay或snapshot_required走相同 authoritative恢复，不需要特殊 Archive补偿逻辑。

---

# 13. Exact patch batches

## C1-3-A · Contract/domain

Files：

```text
packages/domain/src/index.ts
packages/contracts/src/project-events.ts
packages/contracts/src/mutation-*.ts (以真实 union owner为准)
```

Exit：domain/contracts build；type fixtures覆盖 optional archivedAt与payload discrimination。

Rollback：纯类型 revert，无数据影响。

## C1-3-B · SQLite migration/read preservation

Files：

```text
apps/local-core/src/metadata-repository.ts
apps/local-core/tests/metadata-repository.test.ts
```

Exit：fresh DB、old DB upgrade、round-trip、legacy upsert preserve、NULL restore、CAS conflict全部通过。

Rollback：代码可回滚；nullable column保留，不 drop。

## C1-3-C · Mutation transaction

Files：

```text
apps/local-core/src/mutation-safety-service.ts
apps/local-core/tests/mutation-safety-b5.test.ts
apps/local-core/tests/project-mutation-coordinator.test.ts
```

Exit：Archive/Restore/unchanged/conflict/revert/reapply/event-after-commit测试通过。

Rollback：停用 route；保留数据列与已写 lifecycle值。

## C1-3-D · HTTP command + generic write guards

Files：

```text
apps/local-core/src/routes/entity.ts
apps/local-core/src/server.ts（仅依赖注入需要时）
apps/local-core/tests/entity-routes*.test.ts（按现有命名新增/修改）
```

Exit：status、identity、unknown field、origin、idempotency、archived write rejection。

Rollback：下线专用 route；不清空 archivedAt。

## C1-3-E · ActiveContext/read policy

Files：

```text
apps/local-core/src/active-context-store.ts
共享 artifact mutation guard owner
对应 context/runtime/result tests
```

Exit：archived retained as reference but not editable target；no hidden mutation path。

Rollback：可回滚 derived projection；lifecycle truth保留。

## C1-3-F · Projection eligibility/reconciliation

Files：

```text
apps/web-gen2/src/spatial/projectionEligibility.ts
apps/web-gen2/src/spatial/reconciliationRunner.ts
apps/web-gen2/src/spatial/projectToSpaceProjection.ts（只做删除命名/理由时）
apps/web-gen2/test/g06-reconciliation.test.ts
apps/web-gen2/test/g08-closure.test.ts
```

Exit：Archive removes projection；Restore fresh placement；missing/stale stays projected；relations clean。

Rollback：disable lifecycle commands first，不能重新投影已 archived artifact冒充回滚。

## C1-3-G · Realtime vertical slice

Files：C1-2指定的 canonical route、client、coordinator、host lifecycle files。

Exit：cross-client Archive/Restore、replay、snapshot_required、Core restart、project switch通过。

Rollback：关闭 Web subscriber，临时回到 explicit refetch/periodic reconcile；truth不变。

## C1-3-H · Browser acceptance/evidence

不再改产品语义，只修验收暴露的问题。产出 `docs/handoffs/` Markdown 与截图/日志证据；但只有在获准写入干净仓库后执行。

---

# 14. Migration test matrix

| Case | Setup | Expected |
|---|---|---|
| fresh DB | no file | artifacts has archived_at |
| legacy DB | schema before column | migration adds nullable column |
| legacy rows | existing artifacts | all archivedAt absent |
| archived roundtrip | timestamp | exact ISO value returned |
| restore roundtrip | NULL | field omitted in Domain JSON |
| legacy upsert | no archivedAt | existing timestamp preserved |
| explicit lifecycle CAS | expected matches | update succeeds |
| stale CAS | expected differs | no row/change set modified |
| rollback | ChangeSet insert failure | archived_at unchanged |
| reopen | close/reopen repo | lifecycle persists |

---

# 15. Mutation test matrix

| Case | Expected |
|---|---|
| active → archive | timestamp + one ChangeSet + events after commit |
| archived → archive new op | changed false, no duplicate ChangeSet |
| archived → restore | NULL + one ChangeSet + restored event |
| active → restore new op | changed false |
| same operationId | same receipt/result |
| wrong project | fail, no mutation |
| stale updatedAt | 409, no event |
| persistence failure | no event |
| event listener throws | committed result remains |
| revert archive | active if touched state unchanged |
| revert after later mutation | refused |
| reapply | archived if forward state valid |
| membership/relation/history | byte/row equivalent before and after lifecycle |

---

# 16. Projection test matrix

| Artifact | archivedAt | availability | Active Main |
|---|---|---|---|
| A | absent | available | projected |
| B | absent | missing | projected with missing state |
| C | absent | stale | projected with stale state |
| D | present | available | removed/not projected |
| E | present | missing | removed/not projected |

Additional：

- archived bound node removed and binding deleted；
- adjacent bound edges removed；
- Core relation remains；
- Restore creates fresh node/binding；
- repeated reconcile idempotent；
- partial Huabu failure leaves repairable state；
- restart never resurrects archived node；
- artifact absent and archived removal stats分开。

---

# 17. Failure/race decisions

## R1 · Archive vs revision write

两者都基于 `updatedAt`/version CAS；先提交者获胜，后者409。不得静默覆盖。

## R2 · Archive vs Artifact Return accept

accept前重新读 lifecycle；若已 archived进入 `waiting_input`/conflict，不写 current revision。

## R3 · Archive commit，Huabu离线

Core返回成功；Web显示 recovery/offline；重连后 reconcile删除投影。不得回滚 canonical archive。

## R4 · Huabu删 node成功，binding删除失败

下次 reconcile发现 stale binding并修复；操作幂等。

## R5 · Restore后 projector失败

Artifact已 active；标 projection recovery failed，重试 projector。不得把 archivedAt写回去掩盖视觉失败。

## R6 · Archive event丢失

periodic/open/reconnect authoritative reconcile最终删除投影。

## R7 · batch Restore future contract

consumer支持 artifactIds数组；本卡HTTP只实现单 Artifact，不能声明 batch endpoint完成。

## R8 · old client PUT archived Artifact

preserve lifecycle或409；绝不能因为缺 archivedAt字段而恢复。

## R9 · Search stale index

Archive不删除 index；搜索结果从 canonical Artifact补 lifecycle/readOnly状态。

## R10 · Core crash between DB commit and event publish

事件可能丢，但重连runtimeId变化或 periodic/open reconcile从 canonical DB恢复。事件不是 durability boundary。

---

# 18. Browser acceptance

## BA-C1-3-01 · Archive visible Artifact

在 active Main选择 Artifact并 Archive：确认命令成功、节点消失、关系边消失、Archive列表可找到、详情只读。

## BA-C1-3-02 · Search/reference

Archived Artifact仍能搜索并作为显式 reference加入 Context；不能设为编辑目标。

## BA-C1-3-03 · Restore

Restore 后回到 active Main；新节点由 Huabu当前算法放置，不复用旧位置。

## BA-C1-3-04 · Restart

Archive 后重启 Core/Web：Artifact仍 archived，active Main不出现旧节点。

## BA-C1-3-05 · Replay

Web短暂离线，期间 Archive/Restore；回连 replay后与 Core一致且无重复节点。

## BA-C1-3-06 · Snapshot recovery

超过事件保留或 Core restart：full refetch后状态正确。

## BA-C1-3-07 · Concurrent conflict

两个 client用同一 expectedUpdatedAt：仅一个成功，另一个409并刷新。

## BA-C1-3-08 · Huabu unavailable

Archive truth提交成功；UI诚实显示空间恢复未完成；Huabu恢复后自动收敛。

## BA-C1-3-09 · ActiveContext

Archive当前 target：selection/target不再可编辑；pinned reference按规则保留只读。

## BA-C1-3-10 · History preservation

Archive/Restore前后 Revision、Relation、membership、ChangeSet历史可核对，未级联删除。

---

# 19. Real validation commands

依据 pinned `package.json`，实施后最低执行：

```powershell
npm run build:domain
npm run build:contracts
npm run check:core
npm run typecheck:web-gen2
npm run test:web-gen2
npm run build:local-core
npm run g0:core:smoke
npm run g0:fullclosure
```

若 RFS/Huabu未运行，`g0:fullclosure` 可诚实标为 BLOCKED，不能用 unit tests冒充 browser/runtime closure。

测试前后再次执行：

```powershell
git diff --check
git status --short
git diff --stat
```

---

# 20. Evidence package

正式实施每批必须记录：

- commit/base SHA；
- modified files；
- schema before/after；
- test commands + exit codes；
- SSE sample frames（脱敏）；
- debug runtimeId/projectSeq/subscriber count；
- Archive前后 Core Artifact JSON；
- Huabu node/binding前后状态；
- restart/reconnect browser evidence；
- blocked/untested items；
- rollback point。

仓库内最终报告放：

```text
docs/handoffs/T6_C1-3_ArchiveRestore_Implementation_Handoff_<date>.md
```

当前这份桌面文件是施工前接续资产，不冒充实施 handoff。

---

# 21. Stop conditions during implementation

出现以下任一项立即停止：

- migration需要重建/移动大表；
- `Artifact` lifecycle影响超出预期 22 个 production files；
- 发现 Archive产品定义与 Phase B冲突；
- 必须更改 Workspace/Canvas冻结对象模型；
- 必须把 geometry写入 Core；
- 现有 tests基线持续失败且不能归因；
- 脏工作区与目标 patch重叠；
- 需要升级主要框架；
- 无法让 lifecycle + ChangeSet原子提交；
- 发现敏感信息；
- 无法给出可审查回滚。

---

# 22. Rollback strategy

## 22.1 Feature rollback

1. 禁用/下线 Archive/Restore command入口；
2. 保留读取 `archivedAt`；
3. 不批量清空 lifecycle数据；
4. Web subscriber可降级为 periodic reconcile；
5. 修复后重新启用 command。

## 22.2 Code rollback

按批次逆序：G → F → E → D → C → B → A。  
但 B 的 nullable column不 drop，A 的optional read compatibility可保留。

## 22.3 Data recovery

依赖 ChangeSet逐项安全 revert，而不是数据库脚本盲改。大批量恢复必须另开批准卡。

---

# 23. Done gate

- [ ] clean, explicit target checkout confirmed；
- [ ] preflight status/branch/log/diff-check recorded；
- [ ] domain `archivedAt` is independent of availability；
- [ ] fresh and legacy DB migrations pass；
- [ ] legacy Artifact PUT cannot clear lifecycle；
- [ ] lifecycle and ChangeSet commit atomically；
- [ ] event publishes only after commit；
- [ ] revision restore and lifecycle restore actions are unambiguous；
- [ ] dedicated archive/restore routes validate identity/origin/CAS；
- [ ] duplicate operation returns stable receipt/result；
- [ ] archived content remains read/search/reference accessible；
- [ ] every active mutation target fails closed for archived content；
- [ ] ActiveContext distinguishes editable selection from read-only reference；
- [ ] active Main eligibility filters archived but not missing/stale；
- [ ] reconciliation removes ineligible nodes and affected edges；
- [ ] Restore uses fresh Huabu placement；
- [ ] membership/relation/revision/history preservation proven；
- [ ] C1-2 canonical SSE subscriber is wired；
- [ ] replay/gap/runtime restart recover authoritatively；
- [ ] project switch/dispose leaks none；
- [ ] Core check and Web tests pass；
- [ ] smoke/browser BA-C1-3-01..10 evidence exists；
- [ ] implementation handoff Markdown exists；
- [ ] risks, blocked items and rollback point are honest。

---

# 24. Final file ownership

| Concern | Owner |
|---|---|
| lifecycle field | `packages/domain` Artifact |
| lifecycle persistence/CAS | SqliteMetadataRepository |
| lifecycle command/audit | MutationSafetyService |
| HTTP command | Local Core entity/application route |
| committed signal | ProjectEventHub |
| event transport/recovery | C1-2 canonical SSE + Web coordinator |
| active edit permission | shared Core mutation guard |
| ActiveContext projection | ActiveContextStore |
| active Main eligibility | web-gen2 projectionEligibility |
| spatial converge | ReconciliationRunner |
| node geometry/placement | Huabu |
| archived browse/search UX | T2/T5 consumers |

---

# 25. Final status and next decision

```text
C1-3 PRODUCTION IMPLEMENTATION PATCH PLAN COMPLETE
PRODUCTION CODE NOT MODIFIED
IMPLEMENTATION NOT STARTED; TARGET CHECKOUT CONFIRMED CLEAN AT DOCUMENT SYNC TIME
```

后续若获准实施，应先重新核验 `E:\OS开发\LCOS_Gen2` 的 status与HEAD，再从 `C1-3-A` 开始真实编码。不得跳过 C1-2 canonical route最小闭环就直接声称 realtime Archive完成。
