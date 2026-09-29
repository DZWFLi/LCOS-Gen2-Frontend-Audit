# LCOS Gen2 · T6 · C1-2
# ProjectEvent Web Subscriber + ActiveContext Recovery
## Formal Exact Source Construction Plan

**日期：2026-09-07**  
**依据提交：`DZWFLi/LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a`；Huabu upstream `a3c411e1f655191344285141f08c4738fa6015f7`**  
**上游：T6 C1-S1、C1-S2、C1-1**  
**性质：可施工源码卡；不执行 production patch，不声明功能已完成**

---

# 0. 本卡目标

把 Local Core 已存在的 ProjectEvent replay/recovery 能力接入 `apps/web-gen2`，形成一条唯一、可恢复、可释放的 Web production subscriber：

```text
committed Core mutation
→ ProjectEventHub.publish()
→ one canonical SSE route
→ typed Web subscriber
→ ordered cursor commit
→ authoritative refetch
→ ActiveContext refresh and/or projection reconcile
→ UI consumers read fresh snapshots
```

本卡解决：

1. 重复 `/projects/:id/events` route 的协议冲突；
2. Web-gen2 没有统一 ProjectEvent subscriber；
3. projectSeq/runtimeId cursor 没有浏览器生命周期 owner；
4. replay、gap、Core restart 后没有权威恢复流程；
5. ActiveContext Core 已持久化、可订阅，但 Web 没有 production consumer；
6. `HostLifecycleReconciler` 有 reconnect trigger，却没被真实事件连接驱动；
7. project switch/dispose 时 SSE、retry timer、in-flight refetch 必须完全释放。

本卡不做：

- 不新建第二 EventBus；
- 不把 SSE envelope 当 Project Truth；
- 不实现通用前端缓存框架；
- 不把 viewport 高频变化塞进 ProjectEvent 主流；
- 不实现 C1-1 的 Archive/Restore production patch；
- 不修改 Huabu 几何所有权；
- 不实现 T4/T5 的 App Shell 或视觉状态。

---

# 1. 冻结语义

## 1.1 Truth 与 signal

```text
SQLite / repositories / services = authoritative truth
ProjectEventHub                = committed-change signal + bounded replay
Web cursor                     = transport progress only
Huabu                           = spatial truth
```

事件到达后必须 refetch 对应 authoritative read model。不得把 event payload 直接 merge 成长期前端真相。

## 1.2 Recovery 优先级

```text
same runtime + retained cursor
→ replay suffix

missing cursor / retention gap / runtimeId changed
→ snapshot_required
→ authoritative full refetch
→ cursor = snapshot.currentSeq only after refetch succeeds

live event
→ targeted invalidation/refetch
→ cursor advances only after required recovery work succeeds
```

## 1.3 ActiveContext

ActiveContext 的 owner 保持 `ActiveContextStore`。Web 只持当前 project/workspace 的最新投影快照，不另造 durable store。

---

# 2. Current source exact findings

## 2.1 Core contract 已存在

`packages/contracts/src/project-events.ts` 已有：

- `ProjectEventEnvelope`；
- `runtimeId`；
- per-project `projectSeq`；
- `ProjectEventReconnectV1`：`replay | snapshot_required`；
- `ProjectEventSnapshotV1`；
- `MutationReceipt`。

结论：KEEP 并收紧 payload typing，不建立新 transport envelope。

## 2.2 Hub 已有 bounded replay

`apps/local-core/src/project-events/project-event-hub.ts`：

- 默认每项目最多 2048 条；
- 默认保留 2 分钟；
- runtimeId 每次 Core runtime 新建；
- runtime mismatch 或 cursor 落在保留窗口前时返回 `snapshot_required`；
- listener failure 不影响 committed mutation。

结论：KEEP。

## 2.3 P0：同一路径存在两套 route

当前同时存在：

```text
apps/local-core/src/routes/project-events.ts
apps/local-core/src/routes/events.ts
```

二者都声明：

```text
GET /projects/:projectId/events
```

但协议不一致：

| 项 | `project-events.ts` | `events.ts` |
|---|---|---|
| cursor query | `lastSeenProjectSeq` | `afterSeq` |
| live event name | `project-event` | `project` |
| first connect | rich `snapshot` | cursor-only `snapshot` |
| gap event | rich `snapshot` | `snapshot_required` |
| SSE id | projectSeq | absent |
| ActiveContext versions | included | absent |

`server.ts` 先调用 `handleProjectEventsRoute()`，其命中后返回；后调用的 `handleEventsRoute()` 对该路径不可达。

结论：这是本卡第一项修复。必须只保留一个 canonical handler 和一套 wire contract。

## 2.4 ActiveContext 已有 Core read/write/SSE

`apps/local-core/src/active-context-store.ts` 已有：

- project+workspace key；
- persistence fallback；
- version CAS；
- semantic fingerprint；
- `work_state.changed` publish-after-save；
- process-local subscribe。

`apps/local-core/src/routes/canvas.ts` 已有：

```text
GET /projects/:id/active-context
PUT /projects/:id/active-context
GET /projects/:id/active-context/events
```

其中专用 SSE 还混合 proposals/runs。C1-2 不用它再创建第二条长期连接；统一 ProjectEvent stream 负责 invalidation，Web 再 GET ActiveContext。

## 2.5 Web-gen2 缺口

`apps/web-gen2/src/backend/client.ts` 只处理完整 HTTP response，不解析流。  
`apps/web-gen2/src` 没有 EventSource/SSE subscriber。  
`Gen2Host` 没有 event client、active-context client、cursor owner。  
`HostLifecycleReconciler` 已支持 `project-open | mutation | reconnect | periodic`，但 reconnect 没接真实 Core event transport。

结论：ADD 小型 typed clients 与单一 coordinator；不扩成巨型 Host cache。

---

# 3. Canonical SSE contract

## 3.1 保留 route

保留并改名义 owner：

```text
apps/local-core/src/routes/project-events.ts
handleProjectEventsRoute()
```

删除或退休：

```text
apps/local-core/src/routes/events.ts
handleEventsRoute()
server.ts 中对应 import 与 dispatch
```

若为降低单次 diff，允许第一提交把 `events.ts` 改为 re-export canonical handler，但最终不得保留两份协议实现。

## 3.2 Query

canonical query：

```text
GET /projects/:projectId/events
  ?afterSeq=<non-negative integer>
  &runtimeId=<last accepted runtime id>
```

兼容窗口可接受 `lastSeenProjectSeq` 一次版本，但响应必须添加 deprecation header，并在同一 Sprint 内删掉 Web 对旧参数的依赖。新 Web 只发 `afterSeq`。

## 3.3 SSE frame names

冻结为：

```text
event: snapshot_required
event: replay
event: project
```

每个 live `project` frame 必须写：

```text
id: <projectSeq>
data: { ok: true, value: ProjectEventEnvelope }
```

首次无 cursor 连接发 `snapshot_required`，不发一个貌似 authoritative、实际只列部分资源版本的“快照”。

## 3.4 Recovery control payload

```ts
interface ProjectEventRecoveryControlV1 {
  runtimeId: string
  projectId: string
  currentSeq: number
}
```

`replay` 沿用 `ProjectEventReconnectV1` 的 replay variant。  
`snapshot_required` 只告诉 consumer 必须 refetch；它本身不是 Project snapshot。

## 3.5 Subscribe-before-replay race

canonical route 必须：

1. 校验 project/query；
2. 建 SSE headers；
3. 先 subscribe；
4. 计算 reconnect；
5. 发 replay/snapshot_required；
6. live listener 对 replay cutoff 之后的事件发帧；
7. 客户端按 seq 去重。

这样避免 reconnect 计算后、subscribe 前丢 mutation。重复允许，丢失不允许。

---

# 4. Exact file action matrix

| Action | File | Exact responsibility |
|---|---|---|
| MODIFY | `packages/contracts/src/project-events.ts` | recovery control、typed payload map、canonical wire names/contract |
| MODIFY | `apps/local-core/src/routes/project-events.ts` | 唯一 SSE route；`afterSeq`；统一 frames；id；cleanup |
| DELETE/RETIRE | `apps/local-core/src/routes/events.ts` | 移除重复 route implementation |
| MODIFY | `apps/local-core/src/server.ts` | 删除重复 import/dispatch；只注册 canonical route |
| MODIFY | `apps/local-core/tests/project-event-hub.test.ts` | gap/runtime/replay edge cases |
| MODIFY | `apps/local-core/tests/events-sse.test.ts` | canonical frame integration；替代旧 route expectation |
| MODIFY | `apps/local-core/tests/active-context-store.test.ts` | publish-after-save、no-op version、origin |
| ADD | `apps/web-gen2/src/backend/projectEvents.ts` | SSE parse/connection client |
| ADD | `apps/web-gen2/src/backend/activeContext.ts` | authoritative GET/PUT client；本卡至少 GET |
| ADD | `apps/web-gen2/src/host/projectEventCoordinator.ts` | cursor、reconnect、refetch、coalescing、generation guard |
| MODIFY | `apps/web-gen2/src/host/projectionFacade.ts` | expose event/active-context clients and coordinator seam |
| MODIFY | `apps/web-gen2/src/host/createLcosHostRuntime.ts` | start/dispose/retarget connection lifecycle |
| MODIFY | `apps/web-gen2/src/host/lifecycleReconciler.ts` | awaitable/coalesced reconnect path if required；不新建 truth |
| MODIFY | `apps/web-gen2/src/index.ts` | public exports |
| ADD | `apps/web-gen2/test/project-events-client.test.ts` | parser/client tests |
| ADD | `apps/web-gen2/test/project-event-coordinator.test.ts` | recovery state machine tests |
| MODIFY | `apps/web-gen2/test/g09-host.test.ts` | host start/switch/dispose/no leak |

预期 production files：9–12 个；tests：4–6 个。若 production 超过 16 个，停止复审范围。

---

# 5. Typed event payload map

不要让所有 consumer 对 `unknown` 乱 cast。保留 envelope generic，并增加 discriminated payload map：

```ts
interface ProjectEventPayloadMap {
  'presentation.changed': PresentationChangedPayloadV1
  'work_state.changed': WorkStateChangedPayloadV1
  'run.changed': RunChangedPayloadV1
  'proposal.changed': ProposalChangedPayloadV1
  'artifact.changed': ArtifactChangedPayloadV1
  'change_set.changed': ChangeSetChangedPayloadV1
  'relation.changed': RelationChangedPayloadV1
  'feedback_revision.changed': FeedbackRevisionChangedPayloadV1
  'continuity.changed': ContinuityChangedPayloadV1
  'snapshot.required': ProjectEventRecoveryControlV1
}
```

C1-1 lifecycle payload冻结为：

```ts
interface ArtifactChangedPayloadV1 {
  schemaVersion: 1
  action: 'created' | 'updated' | 'availability_changed' | 'archived' | 'restored'
  artifactId?: string
  artifactIds?: readonly string[]
  resultingVersion?: number
}
```

约束：

- `artifactId` 与 `artifactIds` 至少一个存在；
- consumer 将二者标准化为去重数组；
- 未认识的 action 必须走保守 graph refetch，不得静默忽略；
- contract version 未识别时 fail to snapshot recovery。

---

# 6. Web SSE client

## 6.1 为什么不用原生 EventSource 直接结束

当前 `HttpClient` 支持 bearer token；原生浏览器 EventSource 不能设置 Authorization header。C1-2 的 transport client 应使用 `fetch()` readable stream，复用 base URL/token/AbortSignal 语义。

## 6.2 `ProjectEventStreamClient`

```ts
interface ProjectEventStreamCursor {
  runtimeId?: string
  afterSeq?: number
}

type ProjectEventStreamMessage =
  | { kind: 'snapshot_required'; value: ProjectEventRecoveryControlV1 }
  | { kind: 'replay'; value: Extract<ProjectEventReconnectV1, { kind: 'replay' }> }
  | { kind: 'project'; value: ProjectEventEnvelope }

interface ProjectEventStreamConnection {
  done: Promise<void>
  close(): void
}
```

Client responsibilities：

- GET canonical route；
- bearer token；
- validate status/content-type；
- incremental UTF-8 decode；
- handle CRLF/LF and frames split across chunks；
- ignore comment heartbeats；
- collect `event` / `id` / multi-line `data`；
- parse `{ok:true,value}`；
- validate minimum envelope identity；
- reject malformed JSON/protocol without advancing cursor；
- AbortSignal closes reader and request；
- no automatic retry inside low-level client。

Retry owner 必须只有 coordinator，避免双重 backoff。

---

# 7. ActiveContext HTTP client

ADD `apps/web-gen2/src/backend/activeContext.ts`：

```ts
class CoreActiveContextClient {
  get(projectId: string, workspaceId: string | null, signal?: AbortSignal): Promise<ActiveContextProjection>
  update(...): Promise<ActiveContextProjection> // 可声明，写接入由 T3/T4 消费
}
```

本卡强制接通 `get()`。返回必须经 `coreRequest()` 解包，不自行猜 route body。

读取策略：

- current Project Overview：workspaceId = null；
- current Workspace：精确 workspaceId；
- event 的 `entityRefs` 为空时 refresh current context；
- refs 包含当前 workspace 时 refresh；
- snapshot recovery 一律 refresh current context；
- 不为所有 workspace 建前端镜像。

---

# 8. ProjectEventCoordinator

## 8.1 Owner

每个 `LcosHostRuntime`、每个 active project 只存在一个 coordinator。它拥有：

- active projectId；
- connection generation；
- accepted runtimeId；
- lastAppliedSeq；
- retry attempt/timer；
- stream AbortController；
- authoritative refetch AbortController；
- coalesced invalidation flags；
- current ActiveContext snapshot；
- small observer set。

不得写 localStorage。换 project 后 cursor 丢弃是正确行为，首次连接走 snapshot recovery。

## 8.2 State

```ts
type ProjectEventConnectionState =
  | { phase: 'idle' }
  | { phase: 'connecting'; attempt: number }
  | { phase: 'recovering'; reason: 'initial' | 'gap' | 'runtime_changed' | 'protocol_error' }
  | { phase: 'live'; runtimeId: string; lastAppliedSeq: number }
  | { phase: 'offline'; attempt: number; error: ProjectEventClientError }
  | { phase: 'disposed' }
```

这是 transport health，不得冒充 Bridge/session lifecycle。

## 8.3 Start

```text
start(projectId, workspaceId)
→ generation++
→ open stream without cursor
→ receive snapshot_required
→ full authoritative recovery
→ accept runtimeId/currentSeq
→ live
```

## 8.4 Event processing

对单条 event：

1. projectId 必须等于 active project；
2. runtimeId 必须等于 accepted runtime，否则 full recovery；
3. `seq <= lastAppliedSeq`：duplicate，ignore；
4. `seq > lastAppliedSeq + 1`：gap，close + full recovery；
5. 按 type 累积 invalidation；
6. 执行相应 authoritative refresh；
7. 成功后才设置 `lastAppliedSeq = seq`；
8. 通知 observer。

## 8.5 Event → recovery action

| Event type | Required action |
|---|---|
| `artifact.changed` | graph refetch + projection reconcile；若 active context引用受影响，再 GET ActiveContext |
| `relation.changed` | relation refetch/reconcile；允许直接 coalesce 到 full reconciliation |
| `change_set.changed` | invalidate audit/review consumer；不单独重跑空间投影，除非同批含 artifact/relation |
| `work_state.changed` | GET current ActiveContext；不重跑全图 reconcile |
| `presentation.changed` | refresh presentation consumer；本卡提供 hook，不实现 T5 renderer cache |
| `run.changed` | refresh run/review consumer hook |
| `proposal.changed` | refresh proposal consumer hook |
| `feedback_revision.changed` | refresh feedback consumer hook |
| `continuity.changed` | refresh continuity consumer hook |
| unknown valid future type | full authoritative recovery + diagnostic |

同一 microtask/debounce window 内多事件合并：graph/relation 只跑一次 reconcile，ActiveContext 只 GET 一次。cursor 仍逐序确认，批处理失败时不越过失败 batch 的最高序号。

---

# 9. Authoritative full recovery

Full recovery 的固定顺序：

```text
1. capture generation/project/workspace
2. GET Project Graph
3. GET current ActiveContext
4. fetch relations (可由 ReconciliationRunner 内完成)
5. run projection eligibility + reconciliation
6. publish fresh snapshots to Web observers
7. verify generation still current
8. atomically accept runtimeId + currentSeq
9. reconnect with afterSeq=currentSeq
```

关键约束：

- 任何 GET/reconcile 失败，不推进 cursor；
- 恢复过程中到达的旧连接事件不直接应用；
- generation 变化后旧 Promise 完成必须被丢弃；
- `currentSeq` 是恢复起点，不证明 payload truth；
- projection failure 可保留 canonical Web data，但 connection state 不得谎报 fully live；
- retry 必须重新 authoritative refetch，不能只从失败 seq 猜继续。

---

# 10. Replay handling

收到 replay：

1. validate project/runtime；
2. events 按 `projectSeq` 升序；
3. 去重；
4. 第一条必须等于 `lastAppliedSeq + 1`，否则 full recovery；
5. 合并 invalidation；
6. authoritative refresh；
7. 成功后 cursor 跳到 replay 中最后成功覆盖的 seq；
8. reconnect control 的 `currentSeq` 大于最后 event seq 时，只有 events 为空且二者等于 cursor 才可直接接受；否则视为 gap。

不允许仅遍历 event payload 后把 cursor 推到 `currentSeq`。

---

# 11. Retry / offline / visibility

## 11.1 Backoff

建议：

```text
0.5s → 1s → 2s → 5s → 10s → max 30s
+ 0–20% jitter
```

在线事件、成功 recovery 后 attempt 清零。

## 11.2 Browser signals

- `online`：取消现有 retry timer，立即 recovery/reconnect；
- `offline`：关闭 stream，状态 offline；
- `visibilitychange` 回到 visible：若 stream 不 live 或 heartbeat stale，立即 recovery；
- hidden 不关闭 connection，但不得启动更高频 polling；
- periodic reconcile 仍是 last-resort，可保留 60s，事件链稳定后评估是否默认关闭。

## 11.3 Heartbeat stale

低层 parser 应把任何 SSE bytes（包括 comment ping）记为 activity。建议 45 秒无 activity 视为 stale，主动 abort 并 recovery。阈值必须可测试注入。

---

# 12. Host lifecycle exact patch

## 12.1 Build

`Gen2Host` 新增：

```text
projectEvents: ProjectEventStreamClient
activeContext: CoreActiveContextClient
eventCoordinator: ProjectEventCoordinator
```

`eventCoordinator` 依赖现有 `reconciler`，不能另建 ReconciliationRunner。

## 12.2 Start ownership

`createLcosHostRuntime()` 创建 host 后调用显式 `host.start()` 或 coordinator `start()`。不要在 constructor 中产生难测试的隐式网络副作用；推荐 runtime 装配点显式 start。

## 12.3 Retarget

```text
retarget(new project/canvas)
→ generation++
→ abort old SSE
→ abort old refetch
→ clear old retry/stale timers
→ dispose old reconciler
→ build new host
→ start new coordinator
```

旧 project 的迟到 event/refetch 不得触发新 project reconcile。

## 12.4 Dispose

`disposeHost()` 必须同时 dispose coordinator 与 reconciler，并可重复调用。

---

# 13. ActiveContext recovery details

## 13.1 Version rules

- incoming `work_state.changed.payload.version <= current.version`：可跳过 GET，仅作为已知旧信号；
- version 恰为 `current+1` 仍 GET authoritative value；
- version 跳跃：GET authoritative value，不按 payload 补丁；
- Core restart：GET，不信任前端缓存 version；
- GET 返回 version 较低只可能发生 project/runtime切换或坏数据，标 diagnostic 并 full recovery。

## 13.2 Workspace switch

workspace switch 不沿用旧 workspace ActiveContext snapshot：

```text
setWorkspace(next)
→ generation++ (或 workspaceGeneration++)
→ abort context refetch
→ GET next workspace ActiveContext
→ keep same project event stream when project unchanged
```

Project event cursor 是 project级；ActiveContext cache 是 current workspace级。两者不得混成同一个 version。

## 13.3 Archive interaction

C1-1 Archive event 到达时：

1. graph refetch；
2. eligibility/reconcile 删除 active Main projection；
3. GET current ActiveContext；
4. Core projection负责移除/刷新失效 selected nodes；
5. Web 不靠旧 selection 自行保留 archived editable target。

---

# 14. Error model and observability

ADD structured client errors：

```ts
type ProjectEventClientErrorCode =
  | 'network'
  | 'http'
  | 'content_type'
  | 'protocol'
  | 'identity_mismatch'
  | 'sequence_gap'
  | 'runtime_changed'
  | 'recovery_failed'
  | 'aborted'
```

Debug state至少包括：

```text
projectId
workspaceId
phase
runtimeId
lastAppliedSeq
lastActivityAt
retryAttempt
pendingInvalidations
lastErrorCode
generation
```

不得记录 token、完整敏感 payload 或 ActiveContext 内容。生产日志只记录 IDs、seq、type、耗时、错误码。

---

# 15. Races and failure decisions

## R1 · mutation commits before first connection

首次 `snapshot_required` → authoritative recovery；不需要历史事件。

## R2 · event occurs between reconnect calculation and subscribe

Core route 先 subscribe，再计算 replay；客户端 seq 去重。

## R3 · duplicate live/replay event

`seq <= lastAppliedSeq` 忽略，不重复 reconcile。

## R4 · seq gap

关闭流，full recovery；不得等待“也许下一条补回来”。

## R5 · Core restart

runtimeId mismatch → full recovery，清空旧 runtime cursor。

## R6 · graph GET success, reconcile fails

不推进 cursor；保留错误态并 retry full recovery。

## R7 · ActiveContext GET fails but artifact reconcile succeeds

若 batch 包含 work_state invalidation，整个 batch 未完成，不推进 cursor；下次可幂等重跑 reconcile。

## R8 · project switch during recovery

generation guard 丢弃旧完成值；不通知新 project observer。

## R9 · malformed SSE frame

protocol error → close + full recovery；不得跳过 frame 继续推进。

## R10 · authorization failure

401/403 不无限快速重试；进入 offline/error，等待配置变化或显式 reconnect。

## R11 · server 404 project removed

进入 terminal project-unavailable hook，交给 ProjectSession；不自动切 sample project。

## R12 · reconnect storm

single-flight recovery + one retry timer + coalesced browser signals。

---

# 16. Core tests

## 16.1 ProjectEventHub

- per-project monotonic seq；
- retained suffix replay；
- gap → snapshot_required；
- runtime mismatch → snapshot_required；
- empty project with cursor 0；
- boundary `lastSeen = firstSeq - 1` replays；
- age trim；
- broken observer isolation；
- unsubscribe idempotent。

## 16.2 SSE integration

- exactly one server route handles path；
- no cursor → `snapshot_required`；
- `afterSeq + runtimeId` → replay；
- live frame is `project` and carries SSE id；
- heartbeat does not corrupt frames；
- invalid afterSeq → 400 before headers；
- missing project → 404；
- close releases subscriber and interval；
- mutation after connection reaches stream；
- subscribe/replay boundary yields no missing seq；
- runtime restart response requires snapshot。

## 16.3 ActiveContext

- save before publish；
- no semantic change does not publish version-advance event；
- work_state payload carries workspace/version；
- expectedVersion conflict publishes nothing；
- persistence failure publishes nothing；
- origin round-trips into envelope。

---

# 17. Web unit tests

## 17.1 Parser/client

- frame split byte-by-byte；
- multiple frames in one chunk；
- CRLF；
- multi-line data；
- comment heartbeat；
- unknown fields ignored；
- malformed JSON fails；
- `{ok:false}` fails；
- wrong content-type fails；
- abort closes reader；
- bearer header present；
- no token leakage in error。

## 17.2 Coordinator

- initial snapshot recovery then reconnect with cursor；
- ordered live event applies once；
- duplicate ignored；
- gap triggers full recovery；
- runtime change triggers full recovery；
- replay coalesces reconcile；
- cursor advances only after successful refetch；
- failed refetch keeps cursor；
- `work_state.changed` refreshes only current ActiveContext；
- artifact/relation batch triggers one reconcile；
- unknown event takes conservative recovery；
- online/visibility signals single-flight；
- exponential backoff caps；
- stale heartbeat reconnects；
- project retarget aborts old generation；
- dispose clears all timers/listeners/requests。

## 17.3 Host

- construction has no accidental duplicate stream；
- runtime start creates one connection；
- React-like repeated access creates none；
- project retarget closes old before opening new；
- config/token change rebuilds client；
- dispose is idempotent；
- reconnect calls existing lifecycle reconciler, not a second runner。

---

# 18. Browser acceptance

## BA-C1-2-01 · Initial recovery

打开真实 Project：Web 收到 snapshot_required，读取 graph + ActiveContext，完成 Huabu reconcile，进入 live。

## BA-C1-2-02 · Cross-surface mutation

另一 client 修改 Artifact：当前页面无需刷新，收到 event 后以 Core graph 为准更新投影。

## BA-C1-2-03 · ActiveContext

另一 client 更新 current workspace selection/context：Web 收到 work_state event，GET 后显示新 version，不直接套 event payload。

## BA-C1-2-04 · Short disconnect with replay

断网期间产生 retained events；恢复后 replay，无重复节点/边，cursor 连续。

## BA-C1-2-05 · Long disconnect / retention gap

超过 buffer：snapshot_required → full refetch/reconcile，最终与 Core/Huabu truth一致。

## BA-C1-2-06 · Core restart

Core runtimeId 改变：Web 不沿用旧 cursor，full recovery 后恢复 live。

## BA-C1-2-07 · Archive

C1-1 实现存在时：Archive 后 active Main node消失；Search/Reference仍可读；重连不复活节点。

## BA-C1-2-08 · Project switch

A 项目 recovery 中切到 B：A 的迟到响应不会修改 B canvas/context；debug subscriber count回落。

## BA-C1-2-09 · Dispose

关闭 Project/卸载宿主后无 SSE、retry、heartbeat stale timer、periodic timer 泄漏。

## BA-C1-2-10 · Auth failure

token 失效显示可诊断 offline/error，不出现无限请求风暴；新配置生效后可恢复。

---

# 19. Implementation sequence

```text
C1-2-A  contract test fixtures
→ C1-2-B  canonicalize Core SSE route
→ C1-2-C  Core SSE/hub regression tests
→ C1-2-D  low-level fetch SSE parser/client
→ C1-2-E  ActiveContext typed client
→ C1-2-F  coordinator state machine
→ C1-2-G  event invalidation matrix + reconciliation wiring
→ C1-2-H  host start/retarget/dispose
→ C1-2-I  offline/visibility/stale heartbeat
→ C1-2-J  unit/integration suite
→ C1-2-K  browser acceptance and evidence
```

每步保持可审查提交；未获授权不创建 branch/commit/tag。

---

# 20. Validation chain

按仓库真实 scripts 执行，不臆造命令。最低链：

```text
contracts typecheck/test
→ local-core lint/typecheck/unit
→ web-gen2 lint/typecheck/unit
→ workspace build
→ Local Core SSE smoke
→ browser offline/reconnect smoke
→ project switch/dispose leak check
```

证据必须记录：命令、exit code、关键输出、浏览器步骤、debug subscriber/cursor 状态。

---

# 21. Rollback

## Code rollback

- revert Web coordinator/client wiring；
-恢复 periodic reconciliation 作为临时 fallback；
- canonical Core route contract若已有外部 consumer，保留一次兼容 query/event adapter；
- 不恢复两个独立 route handler。

## Data rollback

本卡不新增 schema，不迁移 Project data。Web cursor 不持久化，无数据回滚。

## Operational rollback

若 subscriber 造成风暴：关闭 coordinator start feature flag/assembly hook，保留 Core endpoint与现有 periodic reconcile；排障后再启用。

---

# 22. Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| duplicate Core route contracts | P0 | one canonical handler before Web wiring |
| cursor advances before truth refresh | P0 | advance only after recovery success |
| project switch late writes | P0 | generation + AbortController |
| EventSource cannot send bearer token | P0 | fetch streaming client |
| reconnect race loses event | P0 | subscribe-before-replay + client dedupe |
| runtime restart reuses cursor | P0 | runtimeId mismatch full recovery |
| event payload becomes second truth | P0 | authoritative GET/reconcile |
| retry/visibility storm | P1 | single-flight + one timer + backoff |
| ActiveContext and project seq conflated | P0 | separate project cursor/context version |
| malformed future event silently ignored | P1 | conservative recovery + diagnostic |
| leaked SSE/timers | P1 | explicit start/dispose tests |
| specialized ActiveContext SSE duplicates connection | P1 | unified stream invalidates; GET context |

---

# 23. Done checklist

- [ ] only one `/projects/:id/events` route implementation remains；
- [ ] canonical query/frame names are frozen and tested；
- [ ] live project events carry SSE id/projectSeq；
- [ ] subscribe/replay boundary cannot lose sequence；
- [ ] Web fetch-stream SSE parser passes chunk-boundary tests；
- [ ] bearer auth works without token leakage；
- [ ] one coordinator exists per active project runtime；
- [ ] initial connect performs authoritative recovery；
- [ ] replay applies ordered/coalesced invalidation；
- [ ] gap/runtime change performs full recovery；
- [ ] cursor advances only after required work succeeds；
- [ ] ActiveContext is GET from Core, not event-payload truth；
- [ ] project cursor and ActiveContext version remain separate；
- [ ] artifact/relation event drives existing reconciler；
- [ ] Archive/Restore envelope accepts single and batch IDs；
- [ ] project switch rejects old generation completions；
- [ ] offline/online/visibility/stale behavior is bounded；
- [ ] dispose releases stream, readers, timers, listeners and in-flight work；
- [ ] no new EventBus/cache truth/geometry truth was introduced；
- [ ] Core and Web test chains pass；
- [ ] BA-C1-2-01..10 recorded with evidence。

---

# 24. Final owner matrix

| Concern | Final owner |
|---|---|
| Project truth | Local Core repositories/services |
| event sequence/replay | ProjectEventHub |
| SSE wire route | canonical `routes/project-events.ts` |
| browser transport parsing | ProjectEventStreamClient |
| browser cursor/recovery | ProjectEventCoordinator |
| ActiveContext truth/version | ActiveContextStore |
| current Web ActiveContext snapshot | coordinator read model, disposable |
| spatial reconciliation | existing ReconciliationRunner / HostLifecycleReconciler |
| geometry | Huabu |
| project lifecycle | LcosHostRuntime / upstream ProjectSession |
| transport health UI | T4/T5 consumer hook |

---

# 25. Handoff / next card boundary

本卡完成后提供给：

- T2：Search/Focus 在 event recovery 后消费新 graph/context；
- T3：mutation receipt 与 event origin 的跨 surface UX；
- T4：ProjectSession start/retarget/dispose、offline状态；
- T5：recovering/offline/stale 视觉，不自造连接真相；
- T6 C1-3：Archive/Restore implementation patch 可复用 event subscriber验收；
- 后续 Run/ResultSlot：复用 `run.changed` invalidation hook。

下一张建议：

```text
T6 C1-3
Archive / Restore Production Implementation
+ lifecycle migration
+ mutation safety
+ projection eligibility
+ C1-2 realtime acceptance
```

当前状态：

```text
C1-2 FORMAL EXACT SOURCE PLAN COMPLETE
IMPLEMENTATION NOT STARTED
PRODUCTION PATCH NOT AUTHORIZED
```
