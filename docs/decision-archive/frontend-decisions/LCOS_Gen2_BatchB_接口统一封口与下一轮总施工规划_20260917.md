# LCOS Gen2 下一轮总施工规划
## Collaboration 接口统一封口 × Browser Golden Path × R1–R3 Interaction Closure

**日期**：2026-09-17  
**当前远端分支**：`frontend-reconstruction-v2`  
**当前已核 HEAD**：`43013481f2fa2c4e5b16e5d430ce4a2deda80119`  
**施工性质**：R 系列 UX 基础设施续工 / Collaboration 收敛封口 / 浏览器真实路径验收  
**不是**：新增 R7、重做 Session、重做 Run Runtime、另造 Agent Runtime、重做 Glance 视觉

---

# 0. 施工方先读：当前到底做到哪了

这一轮必须先纠正一个容易误判的说法：

> **“Collaboration 接口统一”已经完成主干，但还没有完成最终封口。**

不能再说“还没做”；也不能说“全部做完”。

目前真正已经完成的是：

```text
Core / Run / Continuation / Huabu / Provider
                ↓
      Collaboration Contract V1
                ↓
      Collaboration Projection
                ↓
        Collaboration Facade V1
                ↓
      Glyth / Work View / Composer
```

这条 **GPT/Codex Desktop 式稳定 UI-facing protocol 主干已经成立**。

当前 UI 已经不需要像此前一样分别理解：

```text
ConversationClient
RunClient
ContinuationClient
WaitingInput
ArtifactReturn
Provider status
Recovery journal
Huabu session
```

而是已经开始通过统一的 Collaboration read / event / command seam 工作。

但它仍存在几个“接口统一未封口”的口子：

1. `CoreCollaborationClient` 仍公开暴露内部 `conversations / runs / continuations`；
2. `WaitingInputSection` 仍通过 `collaboration.runs.getPendingInputRequest()` 读取；
3. `ArtifactReturnSection` 仍通过 `collaboration.runs.listRunReviews()` / `retryArtifactReturn()`；
4. `ConversationWorkViewBody` 的 Diagnostics 仍借旧 `ConversationWorkViewController` / conversation-facing raw aggregation；
5. Conversation Composer 的 UI 写着“继续这个会话”，但实际提交仍走 `delegate()` → new Run；
6. `send()` 与 native `fork()` 仍没有真实 transport，当前正确地 fail-closed；
7. Browser E2E 目前只有 live-stack smoke，没有 receiver-seeded Collaboration golden path。

因此当前更准确的阶段判断是：

```text
Collaboration Contract        CLOSED
Read Projection               CLOSED
Capability Resolver           CLOSED
Timeline Projection           CLOSED
Existing Event Bus reuse      CLOSED
Facade V1                     MOSTLY CLOSED
Safe Commands                 MOSTLY CLOSED
Glyth migration               STRUCTURE CLOSED
Work View productization      STRUCTURE CLOSED
Composer integration          SEMANTIC GAP
Legacy caller retirement      NOT CLOSED
Diagnostics projection        NOT CLOSED
Attention detail projection   NOT CLOSED
Live send                     NOT IMPLEMENTED
Native fork                   NOT IMPLEMENTED / NOT PROBED
Browser Golden Path           NOT CLOSED
```

一句话：

> **接口统一已经从“架构设计”进入“最后封口”，下一轮不应再重构架构，而应把所有旁路堵死，并用真实浏览器证明统一接口确实成立。**

---

# 1. 当前已落地主干，不允许重做

以下内容视为 current canonical construction，不再开新方案。

## 1.1 Collaboration Contract V1

已经冻结：

- 6 个用户态；
- capability model；
- fail-closed + reason；
- Session projection；
- Timeline item projection；
- product errors；
- product commands；
- receipt-or-error；
- adapter descriptor；
- session changed / timeline appended / capability changed 产品事件；
- `send != delegate`。

禁止重新定义第二套：

```text
AgentStatus
SessionState
ConversationCapability
CollabRuntimeState
```

## 1.2 Core Collaboration Projection

已经存在：

- `CollaborationProjectionService`
- `Collaboration Capability Resolver`
- Timeline projector
- read-only aggregation
- no second persistence
- no second Session SoT

其事实来自 existing owners：

```text
ConnectedConversation
Conversation identity
Run / RunReview
Waiting Input
Artifact Return
Continuation Journal
Provider capability probe
Receiver Runtime
```

这些 owner 继续保留。

## 1.3 Read Path

已经存在：

```text
readSession()
readTimeline()
```

并已通过 Core 路由聚合。

不允许 GUI 再自行拼：

```text
Run → user state
Continuation → recovery badge
Provider → canSend
```

## 1.4 Realtime

已经复用现有：

```text
GET /projects/:pid/events
ProjectEventHub
```

Collaboration 只做：

```text
truth change
→ projection invalidation
→ refetch
```

没有第二 Event Bus。

这一点已经符合 GPT/Codex App Server 思路：

```text
内部复杂事件
→ stable UI-ready protocol
→ UI
```

不要再另建 Collaboration websocket / event tree。

## 1.5 Command Seam

已有真实 owner 的动作已经接入：

```text
delegate
answerInput
approve
cancel
recover
resume
handoff
```

当前仍 fail-closed：

```text
send
fork
```

这是正确状态，不是欠账式“按钮没画出来”。

只有真实 transport / capability / receipt 存在时才能开放。

## 1.6 Glyth / Work View / Composer 主结构

已经完成的方向：

### Glyth

只开始消费：

```text
6 user states
attention
capabilities
```

不再自己解释 T6。

### Work View

已经变成：

```text
Header
→ Timeline
→ inline Waiting / Review
→ Composer
→ Context
→ collapsed Diagnostics
```

而不是旧 cockpit。

### R1 CollaborationTarget

已经接入：

```text
Drop to Glyth
→ Conversation reference
→ same preview/execute intent
→ no second chooser
```

owner 不存在时 fail-close。

这些方向全部保留。

---

# 2. 下一轮总目标

下一轮不再叫单纯的 Gate 2 / Gate 3。

建议统一命名：

# **R5 Batch B — Collaboration Interface Seal + Golden Path**

目标不是新增更多功能，而是完成下面这条硬标准：

> **Collaboration UX 域的普通产品 UI，不得再依赖 Run / Continuation / Conversation / Provider raw clients 来理解产品状态；所有产品读、产品动作、产品错误和产品事件统一通过 Collaboration protocol。**

并补上：

> **真实 Browser Golden Path 能证明这件事。**

完成 Batch B 后，“学习 GPT/Codex Desktop 做的接口统一”这一阶段才可以正式标记为 CLOSED。

---

# 3. Batch B 总施工顺序

本轮不要每一步回来请求用户继续。

内部小 commit、小验证，外部一次性施工。

顺序：

```text
B0 Current Source Freeze
        ↓
B1 Collaboration Facade 封口
        ↓
B2 Attention / Review / Diagnostics Read Projection
        ↓
B3 Composer Intent / Command Routing 修正
        ↓
B4 Legacy Caller Retirement
        ↓
B5 Receiver-Seeded Browser Golden Path
        ↓
B6 R1–R3 Interaction Closure
        ↓
B7 Batch Handoff + Push
```

---

# 4. B0 — Current Source Freeze

## 目标

施工前重新 census 当前 HEAD，防止并行线程刚刚 push 后又拿旧 owner 施工。

必须核：

```text
CoreCollaborationClient
CollaborationProjectionService
Collaboration Capability Resolver
Collaboration Timeline Projector

ConversationWorkViewBody
WaitingInputSection
ArtifactReturnSection
RecoverySection
LcosComposerHost
Collaboration Session Store

Semantic Drop
Professional Window
Railway
```

## 必须输出内部施工表

每个问题写：

```text
consumer
current source
current owner
desired Collaboration seam
migration action
tests
```

禁止仅凭 handoff 直接改。

---

# 5. B1 — Collaboration Facade 真正封口

这是下一轮最重要的架构任务。

当前 `CoreCollaborationClient` 仍公开：

```ts
collaboration.conversations
collaboration.runs
collaboration.continuations
```

这会造成一个问题：

> UI 虽然“理论上”统一了接口，但仍可以从 facade 后门继续操作 raw client。

这不符合最终的 App Server / stable UI protocol 心智。

## 5.1 目标状态

Collaboration UX consumer 只允许看到类似：

```text
readSession
readTimeline
readAttention / readPendingInput
readReviews / readReturns
readDiagnostics

subscribe

send
delegate
resume
fork
handoff
answerInput
approve
cancel
recover
```

具体方法名以 current source 为准。

关键不是名字。

关键是：

> **UI 不再访问 `.runs / .continuations / .conversations`。**

## 5.2 Raw clients 怎么处理

不是删除 domain clients。

它们继续存在于 facade 内部：

```text
private conversations
private runs
private continuations
```

或等价封装。

非 Collaboration domain 仍然可以直接使用低层 client。

本轮只禁止：

> 同一个 Collaboration 产品场景绕过统一 seam。

## 5.3 Done

全仓 Collaboration UX census：

```text
huabu/apps/web/src/lcos/**
```

不得再存在产品 UI：

```text
collaboration.runs.*
collaboration.continuations.*
collaboration.conversations.*
```

Diagnostics 如需工程信息，也必须通过明确的 Collaboration diagnostics read seam，不能让 Work View 自己重新拼世界观。

---

# 6. B2 — Attention / Review / Diagnostics Read Projection

当前最大两个 legacy read：

## 6.1 Waiting Input

当前：

```text
WaitingInputSection
→ collaboration.runs.getPendingInputRequest(runId)
```

动作 `answerInput()` 已统一，但读取没统一。

### 应收口为

由 Collaboration read layer 提供产品级 Waiting Input projection。

至少应能表达：

```text
pendingInputId
runId
question
options
allowFreeText
```

它可以：

- 作为 Session/Attention adjunct projection；
- 或 facade 产品级 read method；
- 或 existing Collaboration Projection 的子读取。

**不要为了它新增 canonical table。**

UI 只消费产品投影。

## 6.2 Artifact Review

当前：

```text
ArtifactReturnSection
→ collaboration.runs.listRunReviews()
→ collaboration.runs.retryArtifactReturn()
```

accept/reject 已经走 `approve()`。

仍需解决：

### Read

产品层应得到足够的 review projection：

```text
returnId
artifact / title
status
base revision
accept/reject/retry capability
human reason
```

### Retry

必须做一次语义裁决回读 current source：

- 如果 retry 是真实 product command，给 Collaboration Contract 增加明确产品动作；
- 如果它只是 Run-internal engineering recovery，则不要继续把它常驻成普通产品按钮；
- 不允许 UI 永久借 `.runs.retryArtifactReturn()`。

本轮必须关掉这个悬空语义。

## 6.3 Diagnostics

当前 Work View 主产品状态已经来自 Collaboration Projection，这是正确的。

但 Diagnostics 仍通过旧 controller / raw domain aggregation 获得：

```text
identity
reach
operations
```

下一步应形成明确：

```text
CollaborationDiagnosticsProjection
```

或等价 read seam。

Diagnostics 可以包含工程状态，但仍应：

```text
UI
→ collaboration.readDiagnostics
→ raw owners
```

而不是：

```text
UI
→ controller
→ conversation/run/continuation 各自拼
```

这样未来 transport/provider 变化时 Work View 不需要再改。

---

# 7. B3 — Composer Intent / Command Routing 修正

这是当前 P0 产品语义 bug。

## 7.1 当前错误

当前 Work View 文案：

```text
继续这个会话
```

打开 canonical Conversation Composer。

但 `LcosComposerHost` 提交逻辑仍统一：

```text
collaboration.delegate()
```

最终：

```text
POST /projects/:pid/runs
```

所以现在实际是：

```text
“继续这个会话”
→ 新建 Run
```

这违反冻结原则：

```text
send != delegate
```

## 7.2 必须建立明确 Composer Intent

Composer 不等于 Run 输入框。

同一个 Compact Composer 根据 target / intent 路由：

### A. Conversation Collaborate

用户心智：

```text
继续这个会话
```

要求：

```text
target = canonical Conversation
capability canSend = true
→ collaboration.send()
```

如果：

```text
canSend = false
```

则：

```text
“继续”不可提交
```

显示人话 reason。

**绝不能 fallback delegate。**

### B. Delegate

用户心智：

```text
交给它做
```

走：

```text
collaboration.delegate()
→ canonical Run
```

它可以绑定 Conversation relation，但不能伪装成原 native session continuation。

### C. Resume

`resume()` 是 continuation operation。

它不是：

```text
把用户当前文本 prompt 发回原会话
```

因此不能用 resume 代替 send。

## 7.3 Conversation Work View

如果 `canSend=false`：

不要继续显示一个可用的：

```text
继续这个会话
```

然后偷偷 delegate。

可以显示：

```text
当前协作方式暂不支持直接追加消息
```

并在用户明确选择时提供另一个不同动作：

```text
委托一个新任务
```

这两个心智必须分开。

## 7.4 Action Arc

同样依据 capabilities / intent：

```text
canSend → 继续
canAnswerInput → 回答
canApprove → 复核
working → 查看进度
canDelegate → 交给它做（按产品入口放 More / Composer intent）
```

不能按钮文本和真实命令不一致。

---

# 8. B4 — Legacy Caller Retirement

完成 B1–B3 后做一次新的 exact source census。

目标不是“文档说没有 raw caller”。

目标是代码级证明。

## 8.1 Collaboration UX 域必须检查

至少：

```text
GlythNodeBody
ConversationWorkViewBody
WaitingInputSection
ArtifactReturnSection
RecoverySection
LcosComposerHost
Action Arc session commands
collaboration session store
drop collaboration target
```

## 8.2 逐项标记

```text
MIGRATED
DIAGNOSTICS_ONLY
NON_COLLAB_DOMAIN
BLOCKED_BY_REAL_RUNTIME
```

不允许：

```text
TODO later
temporary
basically migrated
```

没有 owner / retirement condition。

## 8.3 Facade enforcement test

建议增加静态/结构测试或 lint-style guard，至少保证 Collaboration UI 目录不能再次直接引入：

```text
CoreRunClient
CoreContinuationClient
CoreConversationClient
```

并不能访问 facade raw subclients。

这样未来不会又长回来。

---

# 9. B5 — Receiver-Seeded Browser Golden Path

当前 Playwright 只有 live-stack smoke：

已经证明：

```text
Project Shell boot
real Local Core proxy
Canvas projection
Professional Window open 不移动 camera
unbound Glyth 不伪造
```

但没有真正证明 Collaboration 产品链。

本轮必须补 receiver-seeded fixture。

## 9.1 Fixture

应该能稳定建立：

```text
Project
Workspace
ConnectedConversation
Receiver binding
Glyth projection
Run / waiting input / return fixtures
Continuation recovery fixture
```

如果 provider transport 必须 fake：

允许 fake transport。

但：

- Core truth / HTTP route / projection 必须真实；
- 不能在 Playwright page 里直接 fake UI state；
- fixture 只负责提供 canonical truth。

## 9.2 Browser Cases

### Case A — Bound Glyth

Given：

```text
ConnectedConversation exists
Glyth binding exists
```

Then：

```text
真实 Glyth 出现
identity 正确
user state 来自 projection
```

### Case B — Work View

```text
Glyth
→ Open
→ Header
→ Timeline
→ Context
→ Diagnostics collapsed
```

默认首屏不得出现 raw T6 cockpit。

### Case C — Conversation Composer target

打开 Conversation Composer：

```text
target = canonical conversation
```

不得二次选择 Session。

### Case D — Delegate

显式 Delegate：

```text
→ canonical Run
→ receipt
→ timeline / projection update
```

### Case E — Waiting Input

```text
Run waiting_input
→ Glyth needs_user
→ Work View inline question
→ answerInput
→ same Run continues
```

### Case F — Review

```text
Artifact Return pending
→ needs_user
→ Review inline
→ accept / reject
→ CAS guard
→ projection update
```

### Case G — Recovery

```text
continuation outcome_unknown / recoverable
→ human recovery state
→ recover command
→ diagnostics preserves raw evidence
```

### Case H — Collaboration Drop

真实浏览器：

```text
drag object
→ hover Glyth
→ preview
→ release
→ reference appears in Conversation Composer/context
```

要求：

```text
preview == execute
```

无二次 chooser。

### Case I — Reload

刷新后：

```text
Conversation
Glyth state
Run
Waiting input
Review
Recovery
References
```

全部从 canonical truth 重建。

### Case J — Multiple Glyths

至少：

```text
A = working
B = needs_user
C = ready
```

不得串：

```text
state
reference
composer target
work view
```

### Case K — Camera invariant

Work View：

```text
open
close
resize
dock
```

不允许自动移动 Camera。

只有 explicit Focus / Fit 能移动。

---

# 10. B6 — R1–R3 Interaction Closure

完成 Collaboration interface seal 后，继续同一轮，不回用户请求“继续”。

## 10.1 R1 Semantic Drop Closure

基础设施已经有：

```text
payload
target registry
intent resolver
preview
commit router
CollaborationTarget
```

本轮补：

### Browser physical interaction

```text
pointer drag
→ target discovery
→ dwell
→ preview
→ target change invalidates old preview
→ release
→ commit receipt
```

### Failure

```text
owner absent
ineligible
stale target
commit failure
```

必须有真实反馈，不能静默消失。

### external file/text/url

重新 census current source。

如果已有 canonical capture/import owner：

接入。

如果没有：

保持 fail-close，并在 handoff 写明真正 blocker。

禁止为了“R1 全绿”临时造第二个 import owner。

## 10.2 R2 Professional Window Closure

当前已有：

```text
topology
region / instance separation
floating
docked-right
environment
safeRect
occupied edges
HUD consumption
```

本轮补真实 pointer interaction：

### Move

- titlebar drag
- pointer capture
- drag threshold
- viewport bounds
- window move != camera move

### Resize

- 8-direction handle
- min size
- viewport clamp
- live feedback
- resize != camera move

### Dock

- dock preview
- dock right
- undock
- restore geometry

### Group

如 current topology 已支持 group contract：

补真实 browser interaction。

若 group interaction owner 仍缺，不重造 topology；明确下一子项。

### SafeRect

browser 验证：

```text
open/dock/resize window
→ safeRect changes
→ HUD avoids
→ explicit Focus/Locate uses safeRect
→ camera only moves on user explicit Focus/Fit
```

## 10.3 R3 Railway Closure

当前已有：

```text
Navigate
CAS-backed reorder foundation
```

本轮补：

### Receive

与 R1 Semantic Drop 共用 target：

```text
eligible
hot
ineligible
commit
```

### Reorder

真实：

```text
drag reorder
→ CAS write
→ reload
→ durable order
```

### Stale

模拟并发 stale：

```text
expectedVersion mismatch
→ no silent overwrite
→ refresh / user feedback
```

### Management

- remove
- overflow
- peek
- keyboard reorder（若冻结规范要求）
- keyboard navigation 保持

Railway 仍是：

```text
去哪里
```

不是 Session switcher。

---

# 11. 本轮不要顺手做

明确禁止：

- 不做 Glance / Glyth 绘画视觉细修；
- 不新建 R7；
- 不新建 Session Store；
- 不新建 Event Bus；
- 不新建 persisted Turn；
- 不把所有 domain client 删除；
- 不把 Railway 变 Session list；
- 不把 Work View 重新变 dashboard；
- 不让 send fallback createRun；
- 不让 selected-context 冒充 native fork；
- 不为了 Browser test 在 page 内写 fake UI truth；
- 不重做 R1/R2/R3 已有 architecture owner；
- 不提前做 R6 大范围视觉抛光。

---

# 12. Batch B 完成后，“GPT/Codex 接口统一”才可正式标 CLOSED

必须同时满足：

## Protocol

- [ ] UI-facing Collaboration contract 稳定；
- [ ] projection / event / command / error 统一；
- [ ] no second truth；
- [ ] no second event bus。

## Caller seal

- [ ] Collaboration product UI 无 raw Run/Continuation/Conversation client；
- [ ] facade raw clients 不再暴露给 Collaboration UI；
- [ ] Waiting Input read 通过 product projection；
- [ ] Review read 通过 product projection；
- [ ] Diagnostics 通过 diagnostics projection/seam；
- [ ] Retry 语义已明确归位。

## Composer

- [ ] Conversation Continue 不再调用 delegate；
- [ ] send 与 delegate 有明确 intent；
- [ ] canSend=false 时 Continue fail-close；
- [ ] Delegate 仍真实创建 Run；
- [ ] Resume 不冒充 prompt send。

## Browser

- [ ] receiver-seeded bound Glyth；
- [ ] timeline；
- [ ] composer target；
- [ ] delegate；
- [ ] waiting input；
- [ ] review；
- [ ] recovery；
- [ ] drop→Glyth；
- [ ] reload；
- [ ] multi-Glyth；
- [ ] camera invariant。

完成后才写：

```text
Collaboration UI Protocol / Interface Unification = CLOSED
```

注意：

这仍然不代表：

```text
Huabu native live send = DONE
native full fork = DONE
```

它们属于真实 runtime capability。

接口统一可以先完成，而 capability 继续 fail-closed。

这正是这次学习 GPT/Codex 架构的目的：

> **UI protocol 稳定，不再等待每一种 Provider transport 都完成才收口。**

---

# 13. Batch B 之后剩余施工

Batch B 结束后，整个 UX 工程进入后半程。

## Batch C1 — R4 Reader / Assembly

重点：

```text
Reader revision
reading position restore
excerpt
citation
source return
Reader ↔ Assembly
Reader ↔ Context
Reader ↔ Conversation
Assembly direct manipulation
artifact identity continuity
```

并复用：

```text
R1 Drop
R2 Professional Window
Selection
Source Return
```

## Batch C2 — R5 Hard Runtime Capability

与 R4 可以并行。

重点：

```text
Huabu live send
real prompt receipt
timeout outcome_unknown
resume real provider semantics
native fork probe / transport
handoff full browser path
disconnect / reconnect
```

原则：

```text
capability true
ONLY IF
real transport + receipt
```

没有则继续 fail-close。

## Batch D — R6 Global Continuity

最后做：

```text
Search
Focus
Locator
ColorPin
Temporal
Navigation continuity
Surface return
Selection restore
Camera restore
Window restore
Reader restore
safeRect system-wide
motion semantics
cross-surface transient layer
final Figma polish
```

R6 不再大改 architecture。

它负责：

> **让此前所有正确的局部能力，用起来像同一个软件。**

## Batch E — Stabilization / RC

冻结 feature。

只做：

```text
automated regression
browser walkthrough
reload
restart
disconnect
multi-surface
multi-Glyth
failure/recovery
accessibility
performance
user manual testing
bugfix
RC
```

---

# 14. 推荐施工总路线（更新版）

```text
已完成
────────────────────────────────
R1–R3 Infrastructure Core
Collaboration Facade V0
Collaboration Contract V1
Gate 2 Read Projection
Capability Resolver
Timeline
SSE reuse
Safe command seam
Glyth migration
Work View structural migration
R1 CollaborationTarget
Live-stack smoke
────────────────────────────────

现在
▼

Batch B
Collaboration Interface Seal
+ Composer semantic fix
+ receiver-seeded browser golden path
+ R1–R3 interaction closure

           ↓

┌────────────────────┬────────────────────┐
│ Batch C1           │ Batch C2           │
│ Reader / Assembly  │ Hard Runtime       │
│ R4                 │ R5 send/fork/etc.  │
└────────────────────┴────────────────────┘

           ↓

Batch D
R6 Global Continuity + Polish

           ↓

Batch E
Stabilization / User Test / RC
```

---

# 15. 给 Trae / Trio 的连续执行指令

从：

```text
frontend-reconstruction-v2 @ 43013481f2fa2c4e5b16e5d430ce4a2deda80119
```

开始。

本轮执行：

```text
B0 Current Source Freeze
→ B1 Collaboration Facade Seal
→ B2 Attention/Review/Diagnostics Projection
→ B3 Composer Intent Routing
→ B4 Legacy Caller Retirement
→ B5 Receiver-Seeded Browser Golden Path
→ B6 R1–R3 Interaction Closure
→ B7 Handoff + Push
```

## 工作方式

- 内部分小 commit；
- 每个 commit 自测；
- 不在中间回来请求用户“继续”；
- 普通 source drift / test repair / implementation difficulty 自行解决；
- 一个子项 BLOCKED 不阻塞其它可施工子项。

只有以下情况才允许停止整个批次：

1. current canonical source 与冻结 contract 存在真正不可兼容冲突；
2. 必须新建 canonical truth 才能继续；
3. 必须 fake transport 才能声称成功；
4. transaction boundary owner 无法从 current source 判定。

否则继续。

---

# 16. 推荐 commit 切分

建议：

```text
1. refactor(collab): seal UI-facing collaboration facade
2. feat(core): project collaboration attention review and diagnostics reads
3. fix(gen2): route composer collaborate vs delegate honestly
4. refactor(gen2): retire remaining collaboration raw-client callers
5. test(e2e): add receiver-seeded collaboration golden paths
6. feat(gen2): close semantic drop browser interaction paths
7. feat(gen2): close professional window pointer manipulation
8. feat(gen2): close railway receive reorder and management
9. docs(handoff): close Batch B collaboration interface and R1-R3 interaction
```

具体 commit 数量允许根据 source 合并/拆分，但不要做一个超大不可审计 commit。

---

# 17. 最终 Handoff 必须写

```text
Current HEAD

Commits

Changed files
Changed symbols

Canonical owners touched

Collaboration protocol:
- read
- event
- command
- error
- diagnostics

Remaining raw callers
（目标应为 0 in Collaboration product UI）

Composer intent matrix

Browser paths:
PASS / BLOCKED / NOT APPLICABLE

R1 status
R2 status
R3 status

Tests:
contracts
local-core
web-gen2
huabu
browser e2e

Known baseline failures
New failures = 0

Unsupported runtime capabilities:
send
fork
or updated truth

Remaining exact-file gaps

Next unique entry:
R4 Reader/Assembly + R5 Hard Runtime
```

禁止写：

```text
基本完成
大部分完成
后续优化
```

必须能让下一个施工会话直接继续。

---

# 18. 最后一句判断

当前 LCOS 已经真正学到了 GPT/Codex Desktop / App Server 模式里最重要的部分：

```text
复杂 backend owners
↓
稳定 UI protocol
↓
多个前端 surface 共用
```

但还差最后一层工程纪律：

```text
把所有旁路 caller 封死
+
让 Composer 真正遵守 send != delegate
+
用真实 browser golden path 证明
```

**Batch B 完成后，Collaboration “接口统一”这一专题可以正式结束，不再作为独立架构施工议题反复重开。**

之后新增 Provider / Huabu live send / Codex App Server 替换，都应只改：

```text
Adapter / Capability / Runtime owner
```

而不再要求：

```text
Glyth
Composer
Work View
```

重新理解一遍 backend。

这才是本轮收敛真正的终点。
