# GEN2 Artifact 归档 / 恢复纵切交接（2026-09-20）

## 结论

本分支以 **Artifact** 为第一类 canonical 可归档对象，完成了 Core 持久化、项目级 mutation、显式归档入口、Reader 只读状态、Search / Assembly / active projection 的生命周期区分，以及 ChangeSet revert / reapply。对象身份、ArtifactView、Revision、Relation 均保留；归档不是删除。

当前状态为 **PARTIAL**：Core 与组件链验证通过；隔离 headless 整机链已经走到 `Assembly → Reader 归档只读 → Archive 可发现 → Reader 恢复`，但浏览器中的旧 Huabu 节点没有在本轮 reconcile 后退出，ProjectionBinding 也仍在。`ReconciliationRunner` 的定向测试证明预期清理逻辑成立，但真实运行证据不一致，因此不能把“活跃画布退出 / 恢复后 fresh projection”写成整机已闭环。

## 范围与裁决来源

- 仓库：`E:\OS开发\LCOS_Gen2_archive_lifecycle`
- 分支：`codex/archive-lifecycle`
- 起点：`943bb06 fix(runtime): close ACP input recovery gaps`
- 施工卡：
  - `LCOS_Gen2_T6_C1-1_ProjectIdentity_ProjectionEligibility_ArchiveRestore_ExactSourcePlan_20260907.md`
  - `LCOS_Gen2_T6_C1-3_ArchiveRestore_ProductionImplementation_PatchPlan_20260907.md`
  - `T6_Patched_Core_Owner_Plan_20260906.md`
  - `LCOS_Gen2_T6_to_T5_01_StableTruth_StateBoundary_20260906.md`
- 采用：Artifact 是第一批 owner；`archivedAt` 独立于 availability；恢复沿用同一 Artifact id；不恢复旧坐标。
- 未采用：通用 Archive 平台、第二 Store、localStorage、删除 View / Revision、批量归档、其他实体类型归档。

## 数据流

### 变更前

```text
Artifact(active)
  → Project Graph / Search / Warehouse / Huabu projection
  → 没有 canonical archive lifecycle
```

### 变更后

```text
Reader archive
  → POST /projects/:projectId/artifacts/:artifactId/archive
  → MutationSafetyService（project scope + idempotent）
  → SQLite artifacts.archived_at + MutationChangeSet（同事务）
  → artifact.changed / change_set.changed
  → Search / Warehouse 默认排除
  → GET artifacts?lifecycle=archived 显式发现
  → ArchiveBody → Reader（只读）
  → restore（同一 Artifact id）
  → active reconciler 应按当前画布重新投影，不读取 ArtifactView.position
```

## Exact file / symbol / caller

### Domain / Contract

- `packages/domain/src/index.ts` — `Artifact.archivedAt`
- `packages/contracts/src/curation-patch.ts` — `MutationChangeItemV1.artifact_archive_state`
- `packages/contracts/src/search.ts` — `SearchQueryVNext.includeArchived`、`SearchHitVNext.archivedAt/readOnly`

### Core owner

- `apps/local-core/src/metadata-repository.ts`
  - `#migrate_056_from_v55`
  - `runCurationMutation(...artifactArchiveStates)`
  - `#upsertArtifact`：普通 graph save 不覆盖 lifecycle
  - `#artifact`：投影 `archivedAt`
- `apps/local-core/src/mutation-safety-service.ts`
  - `archiveArtifact` / `restoreArtifact` / `#setArtifactArchiveState`
  - `revert` / `reapply` 的 archive state 分支
- `apps/local-core/src/routes/entity.ts`
  - `GET /projects/:pid/artifacts?lifecycle=active|archived|all`
  - `POST /projects/:pid/artifacts/:aid/archive|restore`
- `apps/local-core/src/project-search-service.ts` — 默认 active；`includeArchived` 只读、无 location / view target
- `apps/local-core/src/warehouse-service.ts`、`routes/artifacts.ts` — active 默认排除
- `apps/local-core/src/routes/curation.ts` — 透传 `includeArchived`

### Projection / SSE

- `apps/web-gen2/src/spatial/reconciliationRunner.ts` — graph 保留 archived，active source set 排除 archived；restore 仍走 `ProjectToSpaceProjection` 的当前画布 incremental placement，没有读取旧 `ArtifactView.position`
- `apps/web-gen2/src/backend/collaboration.ts` — 既有项目 SSE 暴露 `onProjectEvent`
- `huabu/apps/web/src/lcos/collaboration/collaborationSessionStore.ts` — `watchArtifactChanges` 复用同一 project SSE
- `huabu/apps/web/src/lcos/shell/LcosProjectShell.tsx` — `artifact.changed` caller → 当前 host reconcile

### UI consumer

- `apps/web-gen2/src/backend/artifacts.ts` — list/archive/restore typed client
- `huabu/apps/web/src/lcos/professional/ArchiveBody.tsx` — 归档列表、Reader、恢复
- `huabu/apps/web/src/lcos/professional/ArtifactReaderBody.tsx` — active archive / archived readonly / restore
- `huabu/apps/web/src/lcos/professional/AssemblyBody.tsx` — 复用 Professional Window 打开 Archive
- `ProfessionalWindowStage.tsx`、`lcosShellStore.ts` — 注册 `archive` body key；没有新壳

## 已验证

- migration 55→56：已填充 v55 DB 升级，Project Graph / View / Revision / Relation 保留。
- project-scoped archive / restore；不存在或跨项目返回 404。
- 重复 archive / restore 幂等；不重复 Event / ChangeSet。
- Project Graph 保留 archived Artifact；Warehouse / Search 默认排除。
- `includeArchived` 返回 read-only hit，`locationRefs=[]`、`locationCount=0`、无 viewId。
- ChangeSet revert / reapply；restore 后 SQLite reopen 状态一致。
- active reconciler 定向测试：archived binding 被列为 orphan 并删除。
- UI 组件链：Assembly 打开 canonical Archive body；归档条目可打开 Reader；Reader 显示只读并恢复同一 identity。

### 命令与结果

```text
npx vitest run tests/archive-lifecycle.test.ts tests/projection-bindings.test.ts tests/metadata-repository.test.ts tests/conversation-continuation-service.test.ts --maxWorkers=1
→ 47/47 PASS

npm run test --workspace @local-creative-os/web-gen2 ...
→ 338/338 PASS

npm run test -- --run ArchiveBody.test.tsx ArtifactReaderBody.test.tsx
→ 19/19 PASS

Assembly archive entrance targeted test
→ PASS

Core / web-gen2 / Huabu web typecheck
→ PASS

npm run build:local-core
npm run build (huabu/apps/web)
→ PASS（仅既有 CSS / third-party / chunk-size warning）

git diff --check
→ PASS
```

## 浏览器实测与未完成

隔离栈使用 Core `:43136`、Huabu `:3016`、Vite `:5276`，没有打开可见窗口。headless Chromium 实际完成：

```text
Assembly
→ 打开 项目定位 Reader
→ Archive
→ Reader 显示「归档对象 · 只读」
→ Archive 列表发现同一 artifact-positioning
→ 再开 Reader
→ Restore
```

失败证据：归档后 `.react-flow__node` 仍包含“项目定位”，Binding `artifact-positioning → node-91f...` 仍在；恢复复用了该 node id。Core `/graph` 已真实返回 `archivedAt`，所以这不是 Core persistence 问题。需下一轮只追 `ReconciliationRunner → ProjectToSpaceProjection.removeOrphanNode → RFS DELETE_NODES → binding DELETE` 的 production caller，不能把定向 mock 绿当整机完成。

截图证据：`C:\Users\1\AppData\Local\Temp\archive-e2e-main.png`（隔离 Main 起始现场）。完整恢复截图未生成，因为场景按上述断言失败退出。

另有一条既有测试失败：`AssemblyBody.lifecycle.test.tsx` 的 context child workspace case mock 缺少当前 navigation `entries`；本次新增的 Archive 入口 case 单独通过，本批没有顺手修旧 mock。

## 回滚

- 代码可按本分支提交逐个 `git revert`。
- migration 56 是 nullable additive column。已经打开过的 DB 会停在 v56；若回滚运行时代码，必须保留能读取 v56 的兼容 reader 或追加 forward migration，不能直接把旧二进制指向 v56 DB。
- 归档/恢复从不删除 Artifact、ArtifactView、Revision 或源文件。
