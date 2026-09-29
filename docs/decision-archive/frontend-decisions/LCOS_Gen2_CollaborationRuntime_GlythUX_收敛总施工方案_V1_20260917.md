# LCOS Gen2 · Collaboration Runtime × Glyth UX 收敛总施工方案 V1

**日期：2026-09-17**  
**状态：V0 实验 PASS 后的正式施工总案**  
**适用主线：`frontend-reconstruction-v2` / Gen2 UX 基础设施施工线**  
**目的：一次性冻结后续 Collaboration / Conversation / Glyth / Composer / Run / Huabu / External Agent 的接口与施工边界，允许前后端、UX、Huabu 接线、测试线并行推进，避免“做完一块再补下一块需求”的串行返工。**

---

# 0. 执行裁决

## 0.1 现在可以正式推进

`Collaboration Facade V0` 已完成真实验证并 PASS：

- 基线：`frontend-reconstruction-v2 @ 97841d6fb199a29d4780420cc80ffddb0d29b9fc`
- 实验 commit：`25f97a2`（实验 worktree 内）
- 修改严格 5 文件
- `git apply --check` PASS
- `web-gen2` typecheck PASS
- `web-gen2` 282 tests PASS / 0 fail
- Huabu typecheck PASS
- Huabu build PASS
- Huabu 27 files / 133 tests failures 经基线回放确认并非实验引入
- Composer 仍走 canonical `POST /projects/:pid/runs`
- Conversation Work View 行为不变
- T6 / Core truth / Journal / RuntimeBinding 全未触碰
- 没有第二份状态

因此本轮不再把 Collaboration Facade 当实验概念，而正式升级为：

> **Gen2 所有 AI 协作 UX 的 UI-facing seam。**

---

# 1. 为什么这会让后续 UX 施工明显轻松

当前最大问题并不是“后端没有能力”，而是 **前端知道得太多**。

之前一个 Conversation Work View / Composer / Glyth 可能直接面对：

```text
ConversationClient
RunClient
ContinuationClient
RuntimeBinding
WaitingInput
ArtifactReturn
Provider status
Recovery projection
Huabu session
```

每个 UI 组件都可能自己回答：

- 现在是什么状态？
- 这个按钮能不能点？
- 应该 createRun 还是 send？
- Session 断了怎么办？
- 这是任务还是对话？
- 结果从哪里回来？

结果就是：

> **同一个业务事实，在三个 React 组件里被解释三次。**

这正是 UX 越做越像操控台、各种状态和按钮越补越多的根源。

正式收口后变成：

```text
UI
  │
  ▼
Collaboration Contract
  │
  ├─ Session Projection
  ├─ Capabilities
  ├─ Timeline / Work Events
  └─ Commands
        │
        ▼
Core / Adapter / Runtime owners
```

于是：

- Glyth 不再自己理解 Run；
- Composer 不再自己决定 Provider；
- Work View 不再自己解释 Recovery Journal；
- Figma 实现只需对应稳定的用户态；
- Codex CLI 以后换 App Server，GUI 不需要再施工一次；
- Huabu send 接通以后，只增加 capability，不需要重画 Work View；
- Semantic Drop 以后把对象 drop 到 Conversation / Composer，只需要认统一 collaboration target。

这才是所谓“像 GPT/Codex 桌面端一样”的真正价值：

> **内部很复杂，但 UI 接口很少，而且稳定。**

---

# 2. 这次不是“合并所有 Service”

必须先钉死这一点。

## 错误理解

```text
ConversationService
RunService
ContinuationService
Bridge
Huabu
↓
全部删除
↓
做一个巨型 CollaborationService
```

禁止。

这只是把复杂度塞进更大的文件。

## 正确理解

```text
Canonical owners 继续存在

Conversation owner
Run owner
Continuation owner
Artifact owner
Bridge owner
Huabu owner

           ↓

新增 / 收敛稳定 UI-facing projection + command seam

           ↓

UI 只认识 Collaboration
```

一句话：

> **后端保留真实 owner，前端统一协议。**

---

# 3. 目标架构

```text
                         LCOS UI
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
       Glyth Node        Composer       Conversation Work View
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                  Collaboration Client
                            │
                            ▼
               Collaboration Projection / API
                     │              │
               READ / EVENTS      COMMANDS
                     │              │
          ┌──────────┴───┐     ┌────┴────────────────┐
          │              │     │                     │
   Conversation Truth    │  collaborate           delegate
   Run Truth             │     │                     │
   Continuation          │     ▼                     ▼
   Artifact Return       │  session/model          Run Core
   ContextManifest       │     │                     │
          │              │  Huabu/API             Bridge
          │              │                        │
          │              │                  Codex / WorkBuddy
          │              │
          └──────────────┴─────────────────────────────
```

关键点：

- **Collaboration Projection 不持久化第二份真相。**
- **Collaboration Client 不成为 Runtime。**
- **Adapter 不成为 Project Truth。**
- **UI 不直接调用 Provider。**

---

# 4. 用户只需要理解三种协作动作

整个产品今后统一成三种，而不是每个功能自己发明名词。

## A. Collaborate：一起做

用户感受：

> “继续和这个 AI 一起做。”

对应：

- Glyth Conversation
- Huabu 驻场 Agent
- 已绑定外部 Conversation
- Core-owned Model API Conversation

特点：

- 长期 Conversation；
- 多轮；
- 当前 Project / Selection / Reference 可进入上下文；
- 结果仍回当前 Conversation。

---

## B. Delegate：交给它做

用户感受：

> “这件事出去做完再回来。”

对应：

```text
Run
→ Bridge
→ Codex / WorkBuddy / external executor
```

特点：

- 有任务生命周期；
- 可以后台运行；
- waiting_input；
- review；
- Artifact Return；
- 用户可以去外部继续与 Provider 沟通；
- 结果最终回 LCOS。

---

## C. Handoff：换人继续

用户感受：

> “把现在这段工作交给另一个 AI 继续。”

它不是 Run，也不是普通 send。

可能是：

```text
Glyth A
→ Codex

Codex Conversation
→ Huabu 驻场 Agent

Conversation A
→ Fork Conversation B
```

Handoff 自动携带：

- 当前目标；
- 当前 Selection；
- Reference；
- ContextManifest；
- 当前工作摘要；
- 必要历史；
- 已产生 Artifact / Result；
- 未解决事项。

---

# 5. Collaboration Contract V1

本轮最先冻结的不是页面，而是这个 contract。

## 5.1 CollaborationSessionProjectionV1

这是所有 Glyth / Work View / Composer 状态的唯一产品投影。

建议字段：

```ts
interface CollaborationSessionProjectionV1 {
  schemaVersion: 1

  projectId: string
  glythId?: string
  conversationId: string

  identity: {
    title: string
    subtitle?: string
    agentLabel?: string
  }

  userState:
    | 'ready'
    | 'thinking'
    | 'working'
    | 'needs_user'
    | 'done'
    | 'unavailable'

  relation: {
    workspaceId?: string
    targetRefs: readonly string[]
    summary?: string
  }

  activity: {
    lastActivityAt?: string
    activeRunId?: string
    activeSummary?: string
    pendingInputId?: string
  }

  capabilities: CollaborationCapabilitiesV1

  recentReturns: readonly CollaborationReturnSummaryV1[]

  recovery?: {
    state: 'none' | 'recoverable' | 'recovering' | 'blocked'
    userMessage?: string
  }
}
```

注意：

- provider 可以存在于 diagnostics projection；
- 不需要默认出现在产品 projection 首屏；
- externalSessionId 不进入普通 UI；
- RuntimeDispatch 不进入普通 UI。

---

# 6. CollaborationCapabilitiesV1

所有按钮是否出现，都必须来自 capability，不允许 UI 猜。

建议：

```ts
interface CollaborationCapabilitiesV1 {
  canSend: boolean
  canDelegate: boolean
  canResume: boolean
  canFork: boolean
  canHandoff: boolean
  canAnswerInput: boolean
  canApprove: boolean
  canCancel: boolean
  canRecover: boolean
  canOpenDiagnostics: boolean
}
```

重要纪律：

## capability false = 按钮不出现 / 合理 disabled + 原因

不能：

```text
canSend=false
↓
UI 仍显示发送
↓
背后偷偷 createRun
```

这是本轮最重要的 anti-fake 原则。

当前 `97841d6` 已明确把 Huabu prompt send 标为 unsupported，正好说明这种诚实 capability 是正确方向。

---

# 7. 用户态必须统一成 6 个

不同 Provider、不同 Run、不同 Session 内部状态再多，GUI 都只投影到以下 6 种：

| 用户态 | 用户理解 | UI 第一动作 |
|---|---|---|
| `ready` | 可以继续 | 继续 |
| `thinking` | 正在理解 / 整理 | 打开 |
| `working` | 正在做事 | 查看进度 |
| `needs_user` | 等你回答 / 审批 | 回应 |
| `done` | 本轮做完 | 查看结果 / 继续 |
| `unavailable` | 原协作暂时接不上 | 恢复 / 新开 |

后台状态继续完整保存：

```text
queued
running
waiting_input
review
completed
failed
outcome_unknown
external_create
core_bind
attach
projection
recovery_required
provider_status
...
```

但它们只负责算出用户态，不负责画信息架构。

---

# 8. Timeline / Item Projection

这里借 Codex 的 Thread / Turn / Item 思路，但**不立即新增 LCOS canonical Turn 数据表。**

V1 先做 projection。

## CollaborationTimelineItemV1

建议类型：

```text
user_message
agent_message
work_started
progress
input_required
approval_required
result_returned
result_adopted
error
recovered
system_note
```

这些 Item 可以由现有：

- Conversation message；
- Run；
- waiting_input；
- Artifact Return；
- Continuation；
- provider event；

组合投影出来。

## 为什么暂时不做 persisted Turn

如果现阶段：

```text
Conversation message + Run + event
```

已经足够恢复产品 timeline，就不要为了“像 GPT”再造一张 turn 表。

只有未来多个 Provider 都需要 LCOS 自己拥有稳定 Turn identity 时，再晋升成 canonical object。

---

# 9. Collaboration Commands V1

V0 已验证：

```text
delegate()
```

可以安全包装 existing `createRun()`。

正式 V1 建议具备：

```ts
readSession()
readTimeline()
subscribe()

send()
delegate()
resume()
fork()
handoff()
answerInput()
approve()
cancel()
recover()
```

这里的方法多并不等于架构复杂。

重点是：

> **UI 只面对这一组产品动作，不面对每个底层 service 的动作。**

---

# 10. send 和 delegate 永远不能混

## send()

语义：

> 给当前 Conversation / Agent 再说一句。

必须要求：

```text
capabilities.canSend = true
```

如果 Provider 不支持：

```text
返回 capability unavailable
```

禁止 fallback 到 Run。

---

## delegate()

语义：

> 创建 canonical Run，让执行器完成任务。

继续走：

```text
RuntimeApplicationService
→ RuntimeDispatch
→ Bridge
```

V0 已证明这条 seam 可安全包装。

---

# 11. Core / Backend 应该怎么补

这部分是本轮真正需要的后端工作。

## 11.1 新增 Collaboration Projection Service

建议职责：

```text
Conversation
+ Run
+ Waiting Input
+ Artifact Return
+ Continuation
+ Provider capability
↓
CollaborationSessionProjectionV1
```

重要：

**只读聚合，不新增 persistence。**

它不是新的 Source of Truth。

---

## 11.2 Work Event Projector

建立唯一的产品事件映射。

例如：

```text
run queued/running
→ work_started / progress

run waiting_input
→ input_required

artifact return pending_review
→ result_returned

continuation recovering
→ recovering

external session unavailable
→ unavailable
```

以后 GUI 不再直接把 RuntimeDispatch row 转 UI。

---

## 11.3 Capability Resolver

由 Core 决定：

```text
这个 Glyth / Conversation 此刻到底能干什么
```

输入可以来自：

- connected conversation；
- provider capability；
- continuation state；
- active run；
- waiting input；
- Huabu Host probe；
- Bridge provider availability。

输出永远是产品 capability。

---

## 11.4 Huabu live send

这是当前真正的功能缺口。

当前真实边界：

```text
create / recover / status 等已有路径
prompt send 未真正接到 ACP session owner
```

这条工作应该独立解决：

```text
LCOS Core
→ Huabu Host facade
→ ACP session owner
→ active Agent session
→ prompt
```

要求：

- 有真实 receipt；
- timeout 保持 outcome unknown；
- 不能无证据自动 retry；
- send 能力未探测成功前 `canSend=false`；
- 不允许 Core 假装自己是 Agentlet。

---

## 11.5 Bridge / Codex 不急着改

外部 Delegate 已经成立。

因此第一轮不要同时把：

```text
CLI Codex
→ Codex App Server
```

也拉进 blocker。

我们只要求新 Collaboration Contract 不依赖 CLI-specific semantics。

这样以后 Bridge 内部换：

```text
CodexDispatchService
→ CodexAppServerAdapter
```

上层 UI 不动。

这正是本次接口收敛最大的长期收益之一。

---

# 12. Direct Model API 怎么接

当前 Local Core 已有模型 provider / intelligence 能力。

对于：

```text
GPT / Claude / Gemini / Ollama
```

这种不需要完整外部 Agent Runtime 的即时协作：

建议通过 Collaboration Adapter 接成：

```text
Core-owned Conversation
→ model adapter
→ response
→ Core conversation history
```

而不是：

```text
每个模型一个新的 UI client
```

但施工前必须核对当前 Conversation message owner 和持久化路径。

如果现有 Conversation 已经能承载 message truth：

> 只补 adapter，不新增 database。

---

# 13. Glyth UX 正式绑定这套接口

Glyth 不再自己关心 Run/Continuation。

它只消费：

```text
SessionProjection
Capabilities
Timeline
```

## Canvas Node

只显示：

- 身份；
- 当前主题；
- 6 用户态；
- attention。

## Action Arc

由 capabilities 选 3 个最高频：

```text
继续
打开
交接 / 回应 / 查看结果（按状态变化）
```

## Compact Composer

当前 Selection 是 Glyth 时：

```text
composer target = 当前 Conversation
```

不再让用户二次选 Session。

## Conversation Work View

Conversation-first：

```text
message
message
work event
message
result
message
```

不是：

```text
Overview
Run
Dispatch
Session
Recovery
Provider
Logs
```

---

# 14. T6 怎么处理

**T6 不删。**

T6 负责：

- external_create；
- core_bind；
- attach；
- projection；
- outcome_unknown；
- revision；
- external evidence；
- reconcile；
- cancel。

这些能力证明有必要。

但它以后变成：

```text
Collaboration Projection
        │
        ▼
用户：正在恢复 / 无法连接 / 已恢复
        │
       More
        │
   Diagnostics
        │
        ▼
T6 原始工程信息
```

也就是：

> **正确性留下，操控台味消失。**

---

# 15. Semantic Drop 怎么接

R1 不需要等 Collaboration 全做完。

但 target model 要预留：

```text
CollaborationTarget
```

以后可以支持：

### Drop 到 Glyth

语义：

```text
把对象作为 Reference 交给这个 Conversation
```

不是：

```text
弹窗问“你想如何操作”
```

### Drop 到 Compact Composer

语义：

```text
加入当前 draft references
```

### Drop 到 Conversation Work View

语义：

```text
加入当前 context / composer reference
```

### Drop 到 Railway

仍然走 R1/R3 的 Worksite / navigation 语义。

所以 Collaboration seam 会让 Drop 后续少很多特殊 case。

---

# 16. Professional Window 怎么接

R2 完全可以并行。

Collaboration 不拥有窗口拓扑。

```text
Conversation Work View
→ ProfessionalWindowStage
```

继续遵循：

- floating；
- dock right；
- grouped；
- resize；
- occupiedRects；
- safeRect。

Collaboration 只负责内容和状态。

ProfessionalWindow 只负责窗口几何。

两边通过 component boundary 接，不互相侵占 owner。

---

# 17. Railway 怎么接

R3 也可以并行。

Railway 不应该变成 Agent 列表。

但是如果一个 Glyth / Conversation 本身是可导航的 Project Entity，可以通过已有 destination/reference 体系出现。

规则仍是：

```text
Railway = 去哪里
Glyth = 和谁继续协作
```

不要因为 Collaboration 做统一，就把 Railway 也塞成 Session switcher。

---

# 18. 与现有 R1–R6 的重新排布

不新增 R7。

原主线保持：

```text
R1 Semantic Drop
R2 Professional Window
R3 Railway manipulation
R4 Reader / Assembly direct manipulation
R5 Conversation runtime
R6 Navigation / ColorPin / Temporal / Focus / polish
```

但 R5 现在正式展开为：

```text
R5.0 Collaboration Contract Freeze
R5.1 Session Projection + Capabilities
R5.2 Glyth + Composer migration
R5.3 Conversation Timeline / Work Events
R5.4 Huabu live send + Resume
R5.5 Fork / Handoff / Diagnostics
R5.6 Direct client retirement + browser acceptance
```

R1–R4 可以继续并行。

只要求它们不再新建旧式 AI collaboration client 依赖。

---

# 19. 六条并行施工线

这是本方案最关键的组织方式。

## Track A — Contract / Core Projection

负责人类型：Core / architecture

任务：

1. 冻结 Collaboration V1 types；
2. Session Projection；
3. Capability Resolver；
4. Work Event Projection；
5. read / subscribe contract；
6. contract tests。

**Track A 是其它线唯一需要等待的最小前置。**

一旦 types 冻结，其它线全部并行。

---

## Track B — Huabu Collaboration Adapter

负责人类型：Huabu / runtime

任务：

1. current Host / ACP ownership census；
2. real prompt send；
3. status；
4. resume/recover；
5. cancel；
6. capability probe；
7. evidence / timeout 处理。

禁止：

- 新造 Session store；
- Local Core 伪装 Agentlet；
- fake successful send。

---

## Track C — Glyth / Conversation UX

负责人类型：设计 + web frontend

直接使用已经产出的：

`LCOS_Gen2_Glyth_Conversation_AgentSession_产品化UX设计稿_20260917.md`

任务：

1. Glyth 6 用户态；
2. Action Arc；
3. Compact Composer target；
4. Conversation-first Work View；
5. Timeline；
6. result card；
7. needs-you；
8. unavailable；
9. Diagnostics 降级。

前端不得直接读取 T6 steps 来决定视觉。

---

## Track D — Composer / Commands / Reference / Drop

负责人类型：interaction frontend

任务：

1. V0 `delegate()` 正式保留；
2. send action wiring；
3. current Glyth binding；
4. Reference strip；
5. drop → reference；
6. selected context；
7. action/capability guard。

这个 Track 同时与 R1 Semantic Drop 合流。

---

## Track E — Delegate / Bridge Future-proofing

负责人类型：runtime / Bridge

第一轮主要不施工大重构，只做：

1. 确认 delegate 不泄露 provider-specific contract；
2. Run 与 Conversation relation；
3. waiting_input / result → WorkEvent；
4. 为未来 Codex App Server 留 Adapter seam；
5. 禁止 UI 绑定 CLI session model。

Codex App Server 真正迁移后置。

---

## Track F — Test Baseline / Regression

负责人类型：独立 QA / runtime frontend

当前已发现：

```text
Huabu baseline
27 files failed
133 tests failed
1204 passed
```

这不是 Collaboration 实验引入，但不能一直假装不存在。

任务：

1. 固化当前 known-failure manifest；
2. 分类：stale old-shell test / real regression / environment / fixture；
3. 修复或删除明确过期测试；
4. 每轮 Collaboration 改动必须做到 failure set 不增加；
5. R5 RC 前，所有 LCOS-owned/Glyth/ProfessionalWindow/Conversation 测试必须清零；
6. 非 LCOS upstream 遗留也必须有 owner / reason，不能无主放着。

---

# 20. 施工 Gate

## Gate 0 — V0 正式落线

前提：

实验 commit `25f97a2` 目前是实验工作树产物。

正式施工前必须：

- 确认 commit 可访问；
- cherry-pick 或等价重放到正式 UX 集成分支；
- 再跑 V0 验收链；
- 保持 5 文件行为等价。

完成后 V0 不再叫实验 patch，而成为 Collaboration V1 的 seed。

---

## Gate 1 — Contract Freeze

必须先交付：

- SessionProjectionV1；
- CapabilitiesV1；
- TimelineItemV1；
- command input/output；
- error model；
- adapter capability model。

这批 types 一旦冻结：

**Track B/C/D/E 同时开。**

禁止每条线自己定义一套 `AgentStatus`。

---

## Gate 2 — Read Path Complete

达到：

```text
Glyth
Work View
Composer
```

都可以只通过 Collaboration read projection 得到状态。

此时旧 client 可以仍然在 facade 内部，但 UI caller 不得直接 new。

---

## Gate 3 — Action Path Complete

必须真实成立：

```text
delegate
answerInput
cancel
recover
```

以及能真实接通时才启用：

```text
send
resume
fork
handoff
```

所有 action 都必须：

- capability 驱动；
- 真实 receipt；
- 错误诚实；
- 不 fake fallback。

---

## Gate 4 — UX Productization

达到：

- Glyth 不是 runtime card；
- Conversation 是主内容；
- Work Event 是 inline event；
- Results 回 Conversation；
- Recovery 进 Diagnostics；
- 无 provider jargon 常驻；
- Action Arc ≤3；
- Composer target 正确。

---

## Gate 5 — Legacy Caller Retirement

做完整 census：

```text
哪些 UI 还直接 new CoreRunClient？
哪些 UI 还直接 new CoreContinuationClient？
哪些 UI 自己解释 provider status？
哪些 UI 自己组 waiting_input？
```

目标：

Collaboration UX 域内全部迁走。

注意：

不是全仓禁止 RunClient。

非 collaboration domain 如果确实需要低层 Run API，可以保留。

我们禁止的是：

> **同一个用户协作场景绕开 Collaboration seam。**

---

## Gate 6 — Stabilization / RC

进入冻结：

- 不再新增 collaboration feature；
- 只修 bug；
- browser E2E；
- reload；
- multi-Glyth；
- failure/recovery；
- external disconnect；
- camera invariant；
- artifact return；
- waiting input。

通过后再进入 R6 最终视觉/运动细抛光。

---

# 21. 错误模型也必须统一

UI 不应该接收到 40 种 transport error。

建议产品错误：

```text
unavailable
needs_recovery
permission_required
input_required
provider_offline
operation_unknown
operation_failed
cancelled
```

Diagnostics 可以继续保留：

```text
prompt_transport_not_wired
STALE_REVISION
external_create outcome_unknown
host timeout
bridge task missing
...
```

产品错误回答：

> 用户现在能做什么。

工程错误回答：

> 为什么底层失败。

两者不要混在一个 badge 上。

---

# 22. Realtime / subscribe

如果当前项目事件总线已经能覆盖相关 change：

优先做：

```text
Core truth change
→ projection invalidation / update
→ Collaboration subscriber
→ UI
```

不要为 Collaboration 再建第二个 Event Bus。

UI consumer 应只看到类似：

```text
session.changed
timeline.appended
capability.changed
```

内部是什么：

```text
continuity.changed
run.updated
artifact_return.created
provider.status
```

由 projection / message processor 吸收。

---

# 23. 与 GPT/Codex App Server 思路的对应

我们借的是模式，不是数据结构照搬。

OpenAI App Server 的关键模式：

```text
Codex Core internal events
↓
Message Processor
↓
stable UI-ready protocol
↓
CLI / IDE / Desktop-style clients
```

LCOS 对应：

```text
Core / Run / Continuation / Huabu / Bridge
↓
Collaboration Projection + Adapter
↓
stable UI-facing contract
↓
Glyth / Composer / Work View / Workflow
```

Codex：

```text
Thread / Turn / Item
```

LCOS V1：

```text
Conversation / Work Action / Timeline Item projection
```

**暂时不强制新增 Turn canonical truth。**

这是最重要的“学思想，不抄内部形状”。

---

# 24. 新旧 API 迁移策略

采用 strangler pattern，不 big-bang。

## Stage 1

```text
UI → Collaboration facade → old clients
```

V0 已证明成立。

## Stage 2

```text
UI → Collaboration facade
                    ↓
         Collaboration server projection
                    ↓
              old domain owners
```

## Stage 3

Provider-specific transport 逐步 adapter 化。

## Stage 4

所有 caller 迁完后：

审计哪些 service 已沦为纯 forwarding glue。

只有这时候才：

```text
merge / delete / retire
```

绝不能先删 service 再逼 caller 适配。

---

# 25. 哪些旧东西最终可能被合并 / 退役

这里只列“候选”，不提前判死刑。

需要 census 的：

- Conversation Work View 自己的拼装逻辑；
- receiver runtime 的部分 UI-facing glue；
- Session lifecycle 中 provider-specific forwarding；
- Continuation 前端专用 client；
- CodexDispatchService 的 CLI-era provider glue；
- provider status normalization scattered helpers。

判断标准只有四个：

```text
是否拥有独立 canonical truth？
是否拥有不可替代的 transaction boundary？
是否只是 transport adapter？
是否只是 projection / forwarding？
```

前两者保留。

后两者可以吸入统一 seam。

---

# 26. 哪些东西明确不能被合并掉

至少当前不能动：

- Project Truth；
- Conversation identity；
- Run canonical lifecycle；
- ContextManifest；
- RuntimeDispatch / RuntimeBinding；
- Artifact Return；
- Continuation Journal；
- external evidence / stale guard；
- Huabu Canvas state；
- ProfessionalWindow topology owner；
- Bridge provider boundary。

这些是正常分层，不是“后端太碎”。

不要为了减少文件数量把 transaction boundary 删掉。

---

# 27. Figma / 设计实现线现在能获得什么

这次接口冻结以后，Figma 线终于可以不再猜业务状态。

它只需要针对：

```text
ready
thinking
working
needs_user
done
unavailable
```

设计 Glyth 状态。

只需要针对：

```text
message
work event
input required
result
error/recovery
```

设计 Timeline Item。

只需要针对 capability：

```text
send
delegate
fork
handoff
recover
```

决定 Action Arc / More。

这会比现在每次先问“这个 provider 到底是什么状态”轻松很多。

也是为什么这轮架构先收口，能显著减少后面 UX 返工。

---

# 28. 真实浏览器验收矩阵

最终必须验证，不接受只跑 unit test。

## Case 1：Glyth Ready

- Canvas 正常；
- Composer target 正确；
- 打开 Conversation；
- history 正确。

## Case 2：Delegate Run

- Composer 发起真实 Run；
- working；
- 关闭 Work View 后继续；
- result 回原 Conversation。

## Case 3：Waiting Input

- Run waiting_input；
- Glyth needs_user；
- 点击回应进入正确 Conversation；
- 回答后继续。

## Case 4：Artifact Return

- result card 出现在 timeline；
- Preview / Adopt；
- adoption 后状态正确。

## Case 5：Huabu Send

- capability true 后才显示；
- message 真正进入同一 external session；
- reply 回同一 Conversation；
- timeout 不重复发送。

## Case 6：External Session Unavailable

- Glyth 不消失；
- history 保留；
- unavailable；
- recover / new from context 可用；
- diagnostics 能看真实错误。

## Case 7：Fork

- 从指定位置 fork；
- 新 Conversation identity；
- 原 Conversation 不受影响；
- inheritance 正确。

## Case 8：Handoff

- 当前 context 自动带过去；
- source relation 保留；
- target Agent / Run 可追踪。

## Case 9：Multiple Glyths

- A working；
- B needs_user；
- C ready；
- 状态不串；
- references 不串；
- Work View 不串。

## Case 10：Professional Window

- floating；
- dock；
- resize；
- group；
- Canvas camera 不动；
- safeRect 正确。

## Case 11：Reload

- Conversation；
- Glyth state；
- active run；
- waiting input；
- results；
- recovery；

全部从 canonical truth 重建。

## Case 12：Provider Upgrade

至少用 adapter fake / test double 验证：

Provider implementation 替换后，UI contract 不变。

这是未来 Codex App Server 替换 CLI 时的回归保障。

---

# 29. 测试层级

## Contract Tests

验证 projection / capabilities / commands。

## Core Tests

验证：

- Run；
- Continuation；
- projection mapping；
- error mapping；
- no duplicate truth。

## Adapter Tests

Huabu / Bridge / model API 分开测。

## Frontend Unit Tests

只按 Collaboration contract mock。

**不要再 mock 5 个 Core Client。**

## Host Tests

真实 Huabu host integration。

## Browser E2E

按上面 12 Case。

---

# 30. 对当前 Huabu 133 failures 的处理

本轮不应把它算到 Collaboration 头上，但也不允许继续变成背景噪音。

建立：

```text
HUABU_BASELINE_FAILURES_20260917
```

记录：

- test file；
- test name；
- failure reason；
- stale / real；
- owner；
- disposition。

迁移期间硬规则：

> 新 commit 的失败集合不能超过 baseline。

R5 RC 前：

> LCOS-owned 的失败必须为 0。

这样测试才重新变成报警器，而不是办公室里永远响着没人管的烟雾警报。

---

# 31. Git / 分支施工建议

不要让 6 条线直接互相踩同一个工作树。

建议：

```text
integration:
  frontend-reconstruction-v2 / dedicated collaboration integration line

tracks:
  codex/collab-contract
  codex/collab-huabu
  codex/collab-glyth-ui
  codex/collab-composer
  codex/collab-bridge
  codex/collab-test-stabilization
```

每条线：

- 独立 worktree；
- 小 commit；
- 每个 Gate 合并一次；
- 不长时间持有大范围改动；
- shared contract 文件由 Track A owner 维护。

如果当前并非 Codex 执行，可换命名，但隔离原则不变。

---

# 32. Handoff 文档要求

每个 Track 每轮必须留下：

```text
Current HEAD
Changed files
Changed symbols
Canonical owners touched
Contracts consumed
Contracts produced
Tests run
Known failures
Open risks
Next exact step
```

禁止：

```text
“基本完成”
“后续再优化”
“已接入”但没写真实 owner
```

用户切会话时必须可以直接从 Handoff 恢复，不重新考古。

---

# 33. Done 定义

这条 Collaboration 收敛线真正完成，不是 facade 文件存在。

必须同时满足：

## Architecture

- Collaboration UI 域只有一个 UI-facing seam；
- 没有第二份 Conversation / Run truth；
- provider-specific 状态不泄露到 GUI；
- adapter 可以替换而不改 UI。

## UX

- Glyth 是持续协作对象；
- Conversation-first；
- Composer 无二次选择负担；
- Run 是后台工作，不是主界面；
- Recovery 不再像工程控制台；
- Handoff / Fork 心智清楚。

## Runtime

- delegate 真实；
- waiting input 真实；
- artifact return 真实；
- recovery 真实；
- Huabu send 若宣称可用则必须真实；
- 不可用时诚实 fail-close。

## Test

- web-gen2 绿；
- LCOS Huabu 相关测试绿；
- known baseline failures 全部有 disposition；
- browser acceptance 全过；
- reload / disconnect / multi-session 通过。

## Cleanup

- collaboration 域 direct legacy caller 完成 census；
- 无用 forwarding glue 才允许退役；
- docs / SOP / handoff 更新。

---

# 34. 明确不做的东西

这轮不要顺手：

- 重写全部 Local Core；
- 把所有 Agent 都强塞 Huabu；
- 立刻换 Codex App Server；
- 新建 Agent Git-style session database；
- 新建第二 Event Bus；
- 新建 Task Manager；
- 新建 Agent sidebar；
- 新建 provider dashboard；
- 把 Debug 状态画成主 UI；
- 新建 persisted Turn 只为了模仿 GPT；
- 用 fake send 解锁 UI；
- 把 R1/R2/R3 停下来等 R5。

---

# 35. 推荐实际启动顺序

现在就按下面开：

```text
Gate 0
V0 结果正式落线

        ↓

Gate 1
Track A 冻结 Collaboration Contract V1

        ↓ types freeze

┌───────────────┬──────────────┬───────────────┬───────────────┐
│ Track B       │ Track C      │ Track D       │ Track E       │
│ Huabu send    │ Glyth UX     │ Composer/Drop │ Bridge seam   │
└───────────────┴──────────────┴───────────────┴───────────────┘
        │
        └──────────── Track F tests 全程伴随

R1 / R2 / R3 / R4 同时继续

        ↓

Gate 2 Read Path
        ↓
Gate 3 Action Path
        ↓
Gate 4 UX Productization
        ↓
Gate 5 Legacy Caller Retirement
        ↓
Gate 6 Stabilization
        ↓
R6 Final Polish
```

这能最大限度避免：

> 后端等前端 → 前端发现接口缺 → 回去补后端 → Figma 又改 → 测试再补 → Conversation 又重写。

---

# 36. 最终判断

这次实验 PASS 之后，正式做 Collaboration 收口是值得的。

它不会让所有 UX 地基工作消失，但会显著降低接下来最复杂的：

- Glyth；
- Conversation Work View；
- Composer；
- Waiting Input；
- Run；
- Handoff；
- Recovery；
- Huabu 驻场协作；
- 外部 Agent；

之间的互相返工。

最重要的收益不是少几个文件。

而是：

> **以后任何一个 UX 施工者，只需要问“Collaboration Contract 现在说什么”，不用再分别去读 Run、Continuation、Huabu、Bridge、Provider 五套实现后自己猜产品语义。**

这才是真正的 UX 基础设施。

---

# 37. 本轮施工最高优先级原则

> **先统一用户协议，再统一实现；先隐藏复杂度，再删除复杂度。**

V0 已经证明第一步可行。

接下来只要守住：

- Core Truth 不复制；
- Adapter 不越权；
- capability 诚实；
- UI 不理解 transport；
- 每个 Gate 有真实验收；

这条线就应该比此前 T6/T7 那种“每补一个正确性能力就给 GUI 长一个旋钮”的施工方式顺很多。
