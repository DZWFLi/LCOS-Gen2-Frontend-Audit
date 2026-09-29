# T6 ArchiveBody 外部变更刷新修复

日期：2026-09-29
范围：`E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926`。本次只改 `ArchiveBody.tsx` 和其定向测试；未碰 SSE transport / shared event owner，没有新增事件总线，也未 commit / push。

## 原件与现状

- T6 原卡：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T6\LCOS_Gen2_T6_C1-3_ArchiveRestore_ProductionImplementation_PatchPlan_20260907.md`，§1 明确 archive mutation → canonical ProjectEvent → Web authoritative refetch；§12 realtime integration；§17 R6/R10 事件丢失及恢复决策；§18 BA-C1-3-05/06 replay 与 snapshot recovery；§24 将事件 transport/recovery 归 C1-2 canonical SSE + Web coordinator。
- `huabu/apps/web/src/lcos/collaboration/collaborationSessionStore.ts` 已提供 `watchArtifactChanges(projectId, listener)`，通过同一 project SSE 的 `artifact.changed` 通知消费者；`LcosProjectShell` 也用该 owner 触发 host mutation reconcile。ArchiveBody 之前只在打开与自身 restore 后读取归档列表，因此其他 client 的 archive/restore 变更不会刷新窗口。

## 修改

`huabu/apps/web/src/lcos/professional/ArchiveBody.tsx`

- 打开时仍以 Core `listArtifacts(projectId, 'archived')` 作为权威读取，并在同一共享订阅 owner 注册 artifact invalidation；收到事件后重新读取，不把事件 payload 当状态真相。
- 每次请求带单调请求序号；仅当前项目、当前挂载且最新请求的响应可写 UI，防止连续事件 refetch 的旧响应覆盖新列表。
- 项目切换/卸载时失效旧请求、解除监听；即使旧 listener 已排队触发也不再发请求。切项目同时清空旧项目列表和 busy state。
- restore 成功后保留既有 mutation reconcile 通知并主动刷新归档列表；失败显示错误。迟到的 restore 回应在项目切换/卸载后不再更新当前 UI。

仅测试文件同步调整：`huabu/apps/web/src/lcos/professional/ArchiveBody.test.tsx`。

## 验证

- `pnpm --filter @huabu/web test -- src/lcos/professional/ArchiveBody.test.tsx`：1 个文件、5 个测试通过。覆盖初始读取/Reader/Restore 后刷新、共享 artifact event 导致列表 refetch、旧请求迟到不覆盖新结果、切项目后旧请求与排队事件失效、卸载取消订阅并忽略排队回调。
- `pnpm --filter @huabu/web typecheck`：通过。
- `git diff --check -- huabu/apps/web/src/lcos/professional/ArchiveBody.tsx huabu/apps/web/src/lcos/professional/ArchiveBody.test.tsx`：通过。
- 未启动浏览器，没有将定向组件测试记为 SSE transport 或 browser acceptance。

## 回传字段

READ_SOURCE：上述 T6 C1-3 原卡 §§1、12、17、18、24；共享 consumer 实现 `collaborationSessionStore.ts` 与 production caller `LcosProjectShell.tsx`。

ADOPTED：既有 `useCollaborationSessionStore.getState().watchArtifactChanges(projectId, listener)` → `ArchiveBody` 重新 GET `listArtifacts(projectId, 'archived')` → 当前窗口列表；没有改订阅 transport。

VISUAL_SOURCE：无视觉变化，保留现有 Archive body 与 restore UX。

RETIRED：ArchiveBody 打开时只读一次、仅自有 restore 后才刷新的陈旧列表路径。

VERIFIED：定向测试 5/5、Web typecheck、限定文件 diff check；browser acceptance 未执行。

UNRESOLVED：真实浏览器中第二 client archive/restore 后窗口实时更新尚未实测；WebCore SSE 断线 replay / snapshot recovery 仍由既有 ProjectEvent owner 与 T6 C1-2 负责。
