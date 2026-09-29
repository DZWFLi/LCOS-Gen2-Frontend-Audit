# T6 C1-2：ProjectEvent SSE 断线恢复修复回传

**结论：** fetch SSE 订阅现已在同一 bearer-authenticated `/projects/:projectId/events` 流上续接，遇到缺口或 runtime 切换会清空旧 cursor 并请求权威 snapshot；取消订阅会终止请求、reader 与重连 timer。Snapshot 还会单独通知 Artifact/Host consumer；浏览器 offline 会中止悬挂 SSE，online 会无 cursor 重连并触发权威恢复刷新。

| 原施工依据 | 实际调用链 / 修改点 | 行为与验证 |
|---|---|---|
| 原卡 `E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T6\LCOS_Gen2_T6_C1-2_ProjectEvent_WebSubscriber_ActiveContextRecovery_ExactSourcePlan_20260907.md` §1.2、§8.3–8.5、§10–12、§15；C1-S2 §4.1–4.7 | `apps/web-gen2/src/backend/collaboration.ts` `CoreCollaborationClient.subscribe`、`processFrame`、`scheduleReconnect` | 首次无有效双字段 cursor 时不带续接参数，接 snapshot；snapshot 接受 runtimeId/currentSeq 后才续接。Replay 逐条校验 project/runtime/连续 projectSeq，必须覆盖 currentSeq；live event 忽略重复，发现 gap/runtime mismatch 转 fresh snapshot。指数退避 500ms 起、上限 30s 加 jitter；保留 Bearer token。 |
| 原卡 §6.2、§12、§15；实际 Core wire source：`apps/local-core/src/routes/project-events.ts` `handleProjectEventsRoute`；协议：`packages/contracts/src/project-events.ts` | 同上；原生 Core 帧是 `snapshot`、`replay`、`project-event`，data 为 `{ok:true,value}`，live id 对应 `projectSeq` | SSE parser 支持分块、CRLF/LF/CR、多 data 行及 heartbeat comment。HTTP 401/403/404 停止自动重试；普通断流退避续接；协议错/缺口丢弃 cursor。取消后 abort fetch、cancel reader、清 timer 与 online/offline listener，不再重连。EventSource seam 与生产 fetch 共用帧解析/校验/dispatch。 |
| 原卡 §8.5、§9；实际 consumer：`huabu/apps/web/src/lcos/collaboration/collaborationSessionStore.ts` `ensureProjectSubscription`；`LcosProjectShell.tsx` `watchArtifactChanges`→host `notifyMutationSuccess`；`ArchiveBody.tsx` 监听归档 artifact 变化 | `collaboration.ts` 新增 `onProjectRecovery(snapshot)`；store 将它映射到既有 artifact listener 集合 | Snapshot 时 session.changed 触发 watched session refetch 与 project/Railway listener；额外 recovery callback 触发 Archive Reader reload 与 Host reconcile。没有伪造 `artifact.changed`，各类 watcher 各触发一次。Snapshot 不 await 下游 refetch 完成，dispatch 后 transport 接受 cursor；消费端读取仍由原 store 管理。 |
| 真实失败复现：浏览器离线后旧 SSE 不 EOF，离线期间 artifact 事件导致 consumer refetch 失败；在线后无新连接，归档列表不更新 | `collaboration.ts` `onOffline` / `onOnline`；`apps/web-gen2/test/collaboration-sse.test.ts` offline-open 测试 | offline 中止旧请求/reader；online 等旧 reader cancel 后单连接、清 cursor 请求 snapshot，session 与 artifact/host recovery 各通知一次；取消清理 connectivity listener。测试断言无 cursor 请求且旧信号 aborted。SSE 测试 25/25；`npx vitest run huabu/apps/web/src/lcos/collaboration/collaborationSessionStore.test.ts`：6/6；web-gen2 typecheck 通过。 |

**状态：** SSE 定向测试 25/25、Session Store 测试 6/6、web-gen2 typecheck 通过。离线悬挂流→online fresh snapshot 的受控测试覆盖了 root 实测失败机制；真实浏览器复测仍由 root 执行，尚不宣称通过。Core/后端未修改，未 commit、未 push。

**文件：**
- `apps/web-gen2/src/backend/collaboration.ts`
- `apps/web-gen2/test/collaboration-sse.test.ts`（新增）
- `apps/web-gen2/test/collaboration-client.test.ts`（有效协议 fixture）
- `huabu/apps/web/src/lcos/collaboration/collaborationSessionStore.ts`（recovery invalidation）
- `huabu/apps/web/src/lcos/collaboration/collaborationSessionStore.test.ts`（recovery consumer 定向测试）


