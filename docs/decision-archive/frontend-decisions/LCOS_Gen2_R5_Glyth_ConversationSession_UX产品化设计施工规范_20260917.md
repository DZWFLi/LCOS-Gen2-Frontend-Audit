# LCOS Gen2 R5 — Glyth Conversation / Session UX 产品化设计与施工规范

> **文档性质**：设计实现规范 / 源码施工指导  
> **目标分支**：`frontend-reconstruction-v2`  
> **归属阶段**：现有 UX 施工序列中的 **R5 Conversation Runtime States**  
> **不是**：新建 AgentGit 子系统、另开 R7、重做 Session 后端、重做 Run Runtime  
> **设计母题**：让“绑定对话的 Glyth”重新成为一个自然、轻量、可继续的会话对象，而不是一个把 T6/T7 工程状态铺给用户看的运维操控台。  
> **参考 donor**：Einsia AgentGit（借产品模型与交互心智，不复制其 Git Session Store）  
> **日期**：2026-09-17

---

## 0. 先给施工方的结论

这一轮不要重新发明 “Session”。

Gen2 现有源码已经有：

- `ConnectedConversationV1`
- Active Receiver / Receiver binding
- `ProjectHandoffPackV1`
- 四种 continuation 语义
- T6 Continuation Journal
- external session evidence / reconcile / revision guard
- Run / Waiting Input / Review / Artifact Return
- Conversation Work View
- Huabu Agentlet continuation adapter / host transport
- Context / ordered reference / manifest 一类上下文基础

因此本轮正确动作不是：

```text
新增 Session 数据库
新增 Session Runtime
新增 Session Event Store
新增一套独立工作台
```

而是：

```text
现有 Core Truth
        ↓
Conversation / Session 产品投影
        ↓
绑定 Conversation 的 Glyth
        ↓
轻量 Action Arc + Compact Composer
        ↓
需要深入时才打开 Conversation Work View
        ↓
T6/T7 工程细节退到 Diagnostics
```

### 本轮最重要的三条裁决

**裁决 A：Glyth 是空间锚点，不是小型 Agent 控制台。**

绑定 Conversation 后，Glyth 只负责让用户知道：

- 这是谁 / 这是什么会话；
- 它现在能不能继续；
- 有没有一件事情在等我；
- 我现在最自然能做什么。

它不负责展示 operation id、journal step、revision、provider receipt、attach/projection 等工程状态。

---

**裁决 B：Session 是对现有真相的“产品投影”，不是新的 canonical truth。**

UI 里可以把一个绑定 Conversation 的对象理解成 “Session”，但其事实仍来自：

```text
ConnectedConversation
Receiver / Binding
Continuation
Run
WaitingInput / Review
Context
Provider session evidence
```

不要新增第二套持久化 Session SoT。

---

**裁决 C：前台统一，后台分流。**

用户只需要理解：

```text
继续
分叉
用当前内容新开
空白新开
回答
复核
交接
```

用户不需要理解：

```text
Huabu
ACP
Bridge
T6
T7
external_create
core_bind
attach
projection
```

不同 Provider、Huabu Agentlet、Codex/WorkBuddy Run 可以继续走不同 transport。  
统一的是 **用户体验、能力投影与 Core 语义**，不是强迫所有 Agent 共用一个 transport。

---

# 1. 为什么之前会“越做越像操控台”

当前实现的问题不是“功能做错了”，而是**正确性层被抬到了产品层**。

T6/T7 当时补的内容是必要的，因为外部 Provider session 与 Local Core 不是同一个事务：

```text
外部 session 创建成功
        ↓
Core 还没来得及 bind
        ↓
进程崩了 / 网络断了
```

这时如果直接重试 create，可能产生重复外部会话；如果直接算失败，又可能丢掉已经存在的 session。

所以 T6 才需要：

```text
external_create
core_bind
attach
projection

outcome_unknown
reconcile
revision guard
cancel
external evidence
```

这些工程机制非常正确。

问题在于当前 `ConversationWorkViewBody` 把：

```text
Run
Waiting Input
Composer
Artifact Return
Recovery
```

几乎永久堆在同一个 Work View 中，而 `RecoverySection` 进一步把：

```text
external_create
core_bind
attach
projection
recover_bind
retry_attach
retry_projection
reconcile
```

直接暴露给普通用户。

于是一个本来应该是：

> “这是我之前那个 Codex 会话，我继续一下。”

的产品，

被呈现成：

> “这是一个带 operation journal、recovery action、run monitor、review queue 的管理控制台。”

这就是此前 DVC / Conversation GUI 会产生“很奇怪、很工作台、很操控台”的根源之一。

**本轮不是把这些 correctness 删掉，而是把它们放回它们应该待的位置。**

---

# 2. 当前源码已经拥有的事实，不允许重造

以下内容视为本轮施工的既有资产。

## 2.1 ConnectedConversation 已经是“用户视角的承接关系”

源文件：

```text
packages/contracts/src/receiver.ts
```

当前 `ConnectedConversationV1` 已经明确承担：

- 稳定本地 Conversation identity；
- Receiver key；
- Thread / Run grouping；
- reopen；
- 可选 conversation artifact 绑定；
- 用户可理解 label / metadata。

这意味着：

**我们已经有“员工档案 / 会话身份”。**

不要新增：

```text
SessionProfile
AgentEmployee
ConversationIdentityV2
```

去重复这件事。

---

## 2.2 Receiver / Active Receiver 已经存在

当前 Core 已经知道：

```text
local-core
```

或：

```text
connected-conversation:{conversationId}
```

谁是当前承接者。

这意味着 Glyth 与 Conversation 的关系不需要重新做“谁接收这条信息”的第二套 binding。

---

## 2.3 ProjectHandoffPackV1 已经存在

当前 `ProjectHandoffPackV1` 用于切换 Active Receiver 时带现场，已有：

```text
fromConversationId
toConversationId
carriedSelectionEntityIds
carriedOpenTarget
carriedDraftPrompt
```

这已经是一个很有价值的基础。

但注意：

**它是本地 Receiver 切换时的 scene handoff pack。**

以后若做真正可导出的 Session Handoff，不要粗暴复用同一个 contract 让它承担完全不同语义；应另做派生/export payload。

---

## 2.4 四种 Continuation 语义已经存在

源文件：

```text
packages/contracts/src/conversation-continuation.ts
```

已有 canonical mode：

```ts
continue_existing
native_full_fork
selected_context
blank_new
```

以及两个独立轴：

```ts
contextInheritance = inherit | none
checkout = shared | isolated
```

所以本轮不允许重新开会讨论：

> “我们到底应该有哪几种新开方式？”

已经定了。

产品文案映射如下：

| Canonical | 用户文案 |
|---|---|
| `continue_existing` | 继续这个会话 |
| `native_full_fork` | 从这里分叉 |
| `selected_context` | 用当前选中内容新开 |
| `blank_new` | 空白新开 |

---

## 2.5 T6 Continuation Journal 已经存在

已有：

```text
operationId
external evidence
correlationId
revision
outcome_unknown
reconcile
cancel
allowedActions
```

以及：

```text
external_create
core_bind
attach
projection
```

这些继续作为 **correctness owner**。

不要把它删除，也不要在 GUI 层重新实现 recovery 判断。

---

## 2.6 Run / Waiting Input / Review / Artifact Return 已经存在

这些都是现成资产。

本轮不是给 Session 再复制：

```text
SessionTask
SessionWaitingInput
SessionReview
```

而是把已有 Run / attention 投影到 Session UX 中。

---

## 2.7 Conversation Work View 已经存在

源文件：

```text
huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx
```

当前还做对了一件很重要的事情：

> 未确认真实 `connectedConversationId` / receiver identity 时，不伪造可发送会话。

这条必须保留。

---

# 3. AgentGit 值得借什么，不借什么

AgentGit 的价值不是它用了 Git。

真正值得 LCOS 借的是：

## 借 1：Session 是一级产品对象

用户一眼理解：

```text
这是什么会话
现在能不能继续
它做到哪了
有没有在等我
我能不能从这里分叉
```

而不是理解 runtime internals。

---

## 借 2：Resume / Fork / New 心智非常清楚

LCOS 已经有更细的四种 canonical semantics。

因此本轮只需要把它们**产品化**。

---

## 借 3：完整历史与下一轮 Context View 分离

这是最值得借的一点。

定义：

### Session Evidence

所有可追溯的、可观察事实：

```text
Conversation
用户 Prompt
显式 Agent 输出
可观察 tool/action
Run
等待输入
复核
Artifact
显式决策 / 审批
状态转换
Continuation Journal
```

### Session Context View

**这一轮实际给 Agent 的有序上下文。**

可能来自：

```text
历史摘要
orderedReferences
ContextManifest
当前 Selection
当前 Project context
Artifact refs
当前 Workspace / target
```

两者绝对不能混为一谈：

```text
Evidence ≠ Context View
```

用户调整 Context View，不等于删除历史。

---

## 借 4：Handoff / Export

后续可以做：

```text
Native Handoff
Portable Handoff
```

但不需要复制 AgentGit 的 Git repo 存储。

---

## 借 5：Remote Follow / Approval

可以作为后续 Collaboration capability。

不要因此再做一个 `RemoteSessionRuntime`。

---

## 不借：Git Session Store

LCOS 已经有 Local Core Truth。

再做 Git Session Store 会造成：

```text
Core 说 A
Session Git 说 B
```

然后人类又发明第三个同步器来解决第二个同步器的问题。

禁止。

---

## 不借：公开 Session Hub 作为当前目标

LCOS 不是 Agent 社区产品。

这不是当前核心价值。

---

# 4. 产品对象重新定义

## 4.1 Glyth

Glyth 仍然是空间中的对象。

当 Glyth 绑定了 Conversation：

```text
Glyth
= 空间锚点
+ ConnectedConversation reference
+ Session read projection
+ 少量即时 affordance
```

它不是 Conversation 的 truth owner。

它不是 Runtime manager。

它不是一个缩小版 dashboard。

---

## 4.2 Conversation

`ConnectedConversationV1` 继续作为稳定本地身份。

它回答：

> “我们说的是哪一个承接关系 / 哪一个可重新打开的 Conversation？”

---

## 4.3 Session

**Session 是 UI / read projection 概念。**

它回答：

> “这个 Conversation 对用户来说现在处于什么状态，我可以做什么？”

建议新增派生类型：

```ts
interface ConversationSessionProjectionV1 {
  schemaVersion: 1
  projectId: string
  conversationId: string

  identity: {
    label: string
    conversationArtifactId?: string
    agentLabel?: string
    providerLabel?: string
  }

  state: SessionDisplayStateV1
  lastActivityAt?: string

  attention: SessionAttentionProjectionV1

  capabilities: SessionCapabilityProjectionV1

  runSummary: {
    activeCount: number
    waitingInputCount: number
    reviewCount: number
    latestRunId?: string
  }

  contextSummary?: {
    referenceCount: number
    hasSelectionContext: boolean
    updatedAt?: string
  }

  availability: {
    identityConfirmed: boolean
    receiverConfirmed: boolean
    externalSessionKnown: boolean
    reason?: string
  }
}
```

注意：

这个对象应该是 **derive/read projection**。

不要新增 `conversation_sessions` 表来双写状态。

---

# 5. 用户只能看到的人类状态

建议 UI 层只使用有限的 human display states：

```ts
type SessionDisplayStateV1 =
  | 'ready'
  | 'running'
  | 'waiting_for_user'
  | 'review_required'
  | 'recovering'
  | 'temporarily_unavailable'
```

对应文案：

| state | 文案 |
|---|---|
| `ready` | 可继续 |
| `running` | 正在执行 |
| `waiting_for_user` | 等你回答 |
| `review_required` | 需要复核 |
| `recovering` | 正在恢复 |
| `temporarily_unavailable` | 暂时不可用 |

必要时再扩展：

```text
未绑定
已暂停
```

但不要一上来造十五种状态。

---

## 5.1 Raw Core state 如何映射

例：

```text
waiting_input Run
→ 等你回答

review artifact pending
→ 需要复核

T6 recover/reconcile in progress
→ 正在恢复

T6 outcome_unknown 且用户当前无安全操作
→ 暂时不可用 / 正在核对状态

provider send capability false/unknown
→ 继续按钮不可用，并给人话原因
```

原始：

```text
external_creating
binding
attaching
projecting
outcome_unknown
revision conflict
```

不作为普通用户的主状态文案。

---

# 6. Glyth 在 Canvas 上应该长什么样

## 6.1 默认态

Conversation-bound Glyth 仍然保持当前 Glyth 的视觉语言。

它只需要增加少量真实状态：

```text
[Avatar / Glyph]
登录页施工
Codex · 可继续
```

或更轻：

```text
登录页施工
● 可继续
```

不要加：

```text
3 Runs
2 Reviews
rev 14
session abc123
provider huabu-agentlet
attach confirmed
```

Canvas 不是飞行驾驶舱。

---

## 6.2 Attention 状态

如果用户真的需要处理：

### Waiting Input

Glyth 可以出现：

```text
● 等你回答
```

并让 Action Arc 的最高优先动作变为：

```text
回答
```

### Review

出现：

```text
● 需要复核
```

最高优先动作：

```text
复核
```

### Recovering

出现：

```text
○ 正在恢复
```

但不弹工程错误。

### Unavailable

出现：

```text
暂时不可用
```

More → `连接诊断`

---

# 7. Action Arc 设计

继续遵循既有冻结：

> Action Arc 最多约 3 个高频动作 + More。

不能因为 Session 功能多，就围着 Glyth 长出一个旋转工具箱。

---

## 7.1 Ready 状态

建议：

```text
[继续] [打开] […]
```

`继续`：

- 打开当前 Glyth 锚定的 Compact Composer；
- target 为 canonical ConnectedConversation；
- 只有 capability 明确允许时才可发送。

`打开`：

- 打开 Conversation Work View。

`…`：

- 从这里分叉
- 用当前选中内容新开
- 空白新开
- 交接 / 导出（P1）
- 查看历史
- 连接诊断

---

## 7.2 Waiting Input

建议：

```text
[回答] [打开] […]
```

不要同时再塞“继续”。

用户当前最重要的是回答原 Run。

---

## 7.3 Review

建议：

```text
[复核] [打开] […]
```

---

## 7.4 Running

建议：

```text
[查看进度] [打开] […]
```

如果 provider 支持 steer，可后续 capability-gated 显示 `补充指令`。

当前没有真实能力前不要画。

---

# 8. Compact Composer 与 Session 的关系

Composer 继续遵循既有冻结：

- 以 Selection / Target 为锚；
- 小而轻；
- 2–4 行；
- 引用用 chip / thumbnail 内联；
- 不变成大侧栏；
- 不变成 Conversation Work View 的永久底栏。

---

## 8.1 从 Glyth 点“继续”

Composer target：

```text
receiverConversationId = canonical connectedConversationId
```

UI 只有在 Core identity / receiver / capability 都确认之后才允许发送。

---

## 8.2 Composer 里应该显示的轻量身份

例如：

```text
继续到：登录页施工 · Codex
```

而不是：

```text
provider=huabu-agentlet
externalSessionId=...
adapterId=...
```

---

## 8.3 Reference Strip

用户拖入 / 选择的引用显示在 Composer 内：

```text
[Brief.md] [登录页截图] [当前 Selection ×4]
```

这同时成为 Context View 的一部分。

---

# 9. Conversation Work View 重新设计

当前 Work View 不应继续保持：

```text
Identity
Run
Composer
Review
Recovery
```

五段常驻堆叠。

它应该变成：

```text
Session Header
↓
Timeline / Current Work
↓
Current Context View
↓
Composer（需要时）
↓
Attention / Result inline
↓
Diagnostics（折叠）
```

---

# 10. Work View 顶部

建议第一屏：

```text
Codex · 登录页施工
● 可继续

上次活动 12 分钟前
最近：完成登录页响应式修复

[继续] [从这里分叉] […]
```

如果是 waiting input：

```text
Codex · 登录页施工
● 等你回答

Codex 正在等你确认：
“要保留旧 Hero 动效吗？”

[回答] [查看上下文] […]
```

如果 recovering：

```text
Codex · 登录页施工
○ 正在恢复连接

你的会话记录没有丢失。
正在核对外部会话状态。

[查看诊断]
```

不要：

```text
operation 4c27ab
outcome_unknown
external_create confirmed
core_bind failed
revision 9
```

---

# 11. Timeline：把 Run/Conversation/Artifact 变回“工作过程”

用户不应该先看到独立的 Run 管理区。

应该看到：

```text
今天 14:32
你
调整登录页，让 Hero 与 Figma 一致。

14:33
Codex
开始处理 · 读取 8 个文件

14:38
修改完成
5 files changed
[查看改动]

14:39
需要复核
[复核结果]
```

数据仍然可以来自：

```text
Run
Artifact Return
Waiting Input
Conversation evidence
```

只是产品表现变成时间线。

---

## 11.1 Timeline 不应伪造 Agent chain-of-thought

允许展示：

- 用户显式 Prompt；
- Agent 显式输出；
- 可观察工具调用；
- 文件/Artifact；
- Run 状态；
- 明确审批/决策；
- 结构化摘要。

不要依赖、存储或展示不可见的模型私有推理链。

---

# 12. Context View：本轮最应该补的产品层

Work View 中增加一个轻量入口：

```text
这个 Agent 接下来会看到什么
```

展开后：

```text
当前会话摘要
当前 Project Context
当前 Selection 4 项
Brief.md
Figma 登录页参考
最近代码状态
```

---

## 12.1 Context View 的本质

```text
Session Evidence
≠
Session Context View
```

Evidence 永久保持真实历史。

Context View 是：

> 这一次 continuation / fork / selected-context new 实际送给 Agent 的上下文。

---

## 12.2 后端应尽可能复用现有能力

优先复用：

```text
orderedReferences
ContextManifest
Selection refs
Project context
```

不要新增第二套 Context Store。

---

## 12.3 Context View 必须可验证

用户在 UI 看到：

```text
Selection ×4
Brief.md
当前会话摘要
```

后端实际发给 Provider 的 context 必须是同一个 resolved view。

禁止：

```text
GUI 预览 A
Runtime 自己偷偷重算 B
```

---

# 13. 四种 Continuation 的产品流程

## 13.1 继续这个会话

用户：

```text
Glyth → 继续
```

体验：

1. 打开 Compact Composer；
2. 显示 canonical receiver；
3. 用户输入；
4. 发送到原 provider-native session；
5. Work View / Glyth 状态更新。

Canonical：

```text
continue_existing
```

### 硬约束

如果实际 provider/session 不能接收 prompt：

**不能**静默新建一个 Run，然后把 UI 仍然叫“继续原会话”。

---

# 14. 从这里分叉

用户：

```text
More → 从这里分叉
```

默认语义：

```text
native_full_fork
contextInheritance=inherit
```

用户第一感：

> 保留这段完整历史，从这里开一条新的路。

---

## 14.1 当前真实能力限制

当前 Huabu Agentlet adapter 的 native fork 明确 unsupported。

因此必须 capability-gated。

当 `canNativeFork=false`：

不要显示一个假的“分叉”成功。

可提供不同文案：

```text
用当前上下文新开
```

并明确这是：

```text
selected_context
```

或 portable context-based new session。

两者语义不能偷换。

---

# 15. 用当前选中内容新开

这是 LCOS 相比普通 Session 产品很有优势的一条。

用户已经在 Canvas / Context / Workflow 选中对象时：

```text
More → 用当前选中内容新开
```

随后显示极轻的 Reference Strip：

```text
将带入：
[节点 A] [Brief.md] [截图 ×2]

[开始]
```

Canonical：

```text
selected_context
```

不需要再弹一个“请选择目标位置 / 请选择上下文类型”的填表窗口。

Drop where = use there 的原则继续成立。

---

# 16. 空白新开

```text
More → 空白新开
```

Canonical：

```text
blank_new
contextInheritance=none
```

用户第一感：

> 同一个项目里，新叫一个 Agent / 新开一个 Conversation，但不继承旧会话内容。

仍可带最低必要 Project identity / workspace policy，但不能偷偷把旧 conversation history 全塞进去。

---

# 17. Waiting Input 与 Review 不再做永久栏目

当前 Work View 的 WaitingInput / ArtifactReturn 能力继续保留。

但表现改为：

> 谁需要用户注意，就谁上浮。

---

## 17.1 Waiting Input

Glyth：

```text
● 等你回答
```

Work View：

```text
Codex 正在等你回答

“是否保留旧版 Hero 动画？”

[保留] [移除] [补充说明]
```

不要要求用户先理解：

```text
Run #...
status=waiting_input
```

---

## 17.2 Review

Glyth：

```text
● 需要复核
```

Work View：

```text
这次修改已完成

5 files changed
Tests passed

[查看改动]
[采纳]
[退回]
```

`ArtifactReturnSection` 的底层能力可继续复用。

---

# 18. Recovery：正确性保留，产品层降级

T6 Recovery 不删。

但普通 Work View 只允许出现：

```text
正在恢复
正在核对会话状态
暂时不可用
```

必要的用户动作：

```text
重试连接
取消
```

只有真正需要开发/高级诊断时：

```text
More → 连接诊断
```

才展开：

```text
operationId
provider
external session evidence
external_create
core_bind
attach
projection
revision
allowedActions
errorEvidence
```

---

## 18.1 Diagnostics 可以直接复用当前 RecoverySection 的信息

当前 `RecoverySection.tsx` 不一定要全部丢弃。

更合理的迁移方式：

```text
RecoverySection
→ SessionDiagnosticsSection
```

或拆：

```text
SessionRecoverySummary
SessionRecoveryDiagnostics
```

其中：

### Summary 给用户

```text
正在恢复连接
你的会话记录仍然安全。
```

### Diagnostics 给开发 / 高级入口

保持原始 T6 信息。

---

# 19. 后端 / Core 到底要不要动

答案：

> **大部分不用重做，但确实有两类薄补，以及两个当前真实能力缺口。**

---

# 20. A 类：明确不重做

以下资产直接复用：

```text
ConnectedConversationV1
ProjectReceiverStateV1
Receiver binding / guard
ProjectHandoffPackV1
Continuation Journal
Continuation Operation correctness
Run / RuntimeDispatch
WaitingInput
Review
Artifact Return
ordered references
ContextManifest family
external session evidence
receiver identity / reach
ProfessionalWindowStage
```

不要新增平行版本。

---

# 21. B 类：建议做“薄投影”的 Core 补充

这些不是新 truth，而是帮助 GUI 不再自己拼世界观。

## 21.1 ConversationSessionProjectionV1

负责聚合：

```text
identity
human display state
last activity
attention
run summary
availability
capabilities
context summary
```

---

## 21.2 SessionCapabilityProjectionV1

建议：

```ts
interface SessionCapabilityProjectionV1 {
  canContinue: boolean
  canSend: boolean
  canNativeFork: boolean
  canStartFromSelection: boolean
  canStartBlank: boolean
  canCancel: boolean
  canRecover: boolean

  // P1+
  canExportHandoff?: boolean
  canRemoteFollow?: boolean
}
```

如果需要解释 unavailable：

```ts
interface CapabilityAvailabilityV1 {
  value: boolean
  reason?: string
}
```

### 关键规则

UI **绝不能**：

```ts
if (provider === 'codex') {
  showFork()
}
```

能力必须来自真实 probe / adapter / Core projection。

---

## 21.3 SessionContextViewProjectionV1

建议只读：

```ts
interface SessionContextViewProjectionV1 {
  conversationId: string
  mode: ContinuationModeV1

  items: readonly {
    id: string
    kind: string
    label: string
    sourceRef: string
  }[]

  summary?: string
  selectionEntityIds?: readonly string[]
  manifestRef?: string
  resolvedAt: string
}
```

重点不是字段一定长这样。

重点是：

**GUI preview 和真正 dispatch/send 必须消费同一个 resolved result。**

---

## 21.4 SessionTimelineProjectionV1

只有当现有 controller 无法稳定聚合时才增加。

它可以是 read model：

```text
prompt
message
run_started
tool_activity
waiting_input
artifact
review
decision
result
recovery_notice
```

但不要因此再建一张 canonical Timeline 表。

---

# 22. C 类：R5 当前必须补的真实后端能力

这是本轮最重要的工程事实。

---

## 22.1 真正的 live prompt send

当前：

```text
apps/local-core/src/huabu-agentlet-continuation-adapter.ts
```

`send()` 明确返回：

```text
unsupported
prompt_transport_not_wired
```

Host transport 也明确：

```text
sendResource != prompt transport
```

所以目前不能把：

```text
继续这个会话
```

做成看起来已经完全打通的 UI。

### R5 必须做到

Provider/session owner 有真实 send path：

```text
Local Core
→ continuation adapter
→ actual session owner
→ provider-native prompt turn
```

成功回执必须能与：

```text
conversationId
externalSessionId
operation/run correlation
```

对应。

---

## 22.2 Native full-history fork

当前 Huabu adapter：

```text
nativeFullHistoryFork
```

没有 authoritative probe，且当前 `nativeFork()` 明确 unsupported。

所以 R5 必须二选一：

### 方案 A：实现真实 native fork transport

Provider 真支持时：

```text
canNativeFork=true
```

### 方案 B：能力仍不支持

UI：

- 不显示 native fork；
- 或 disabled + 解释；
- 提供明确不同语义的：
  `用当前上下文新开`

绝对不能让 selected-context new 冒充 native full-history fork。

---

# 23. Continue 与 Run 必须区分语义

这是容易再次做歪的地方。

如果用户点：

```text
继续这个会话
```

用户心智是：

> “把这句话送回原来的那个 Conversation / native session。”

而：

```text
创建新的 LCOS Run
```

可能只是：

> “以这个 Conversation 作为项目关联，另外启动一次执行。”

这两个不是天然等价。

如果底层某 Provider 的实现确实通过新 Run 承载原 session continuation，也必须在 adapter/Core 层保证：

```text
原 externalSessionId
原 conversation identity
真实 continuation semantics
```

而不是 GUI 用“继续”包装一次 detached Run。

---

# 24. D 类：P1 可补的 Handoff / Export

AgentGit 这块值得学。

但不要滥用现有 `ProjectHandoffPackV1`。

建议另做一个 **派生/导出对象**：

```ts
interface SessionHandoffBundleV1 {
  sessionIdentity: ...
  providerIdentity?: ...
  contextView: ...
  observableHistorySummary: ...
  explicitDecisions: ...
  linkedRuns: ...
  artifacts: ...
  currentState: ...
  nextStep?: ...
  exportCapabilities: ...
}
```

---

## 24.1 Native Handoff

Provider / session identity 可恢复时：

```text
保留 provider-native session/thread identity
```

---

## 24.2 Portable Handoff

不支持 native resume：

```text
Context View
+ explicit summary
+ references
+ outputs
+ next step
```

交给另一个 Agent。

---

## 24.3 绝对不包含

不可见的模型私有 chain-of-thought。

产品只依赖：

```text
observable prompt
observable tool/action
explicit decision
approval
result
artifact
state transition
summary
```

---

# 25. E 类：P2 Remote Collaboration

未来可以借 AgentGit：

```text
Remote Follow
Remote Input
Approval
Presence
```

但落法应该是：

```text
Collaboration capability
```

继续复用：

```text
WaitingInput
Review
Run status
ConnectedConversation
```

不要新建：

```text
RemoteRuntimeTree
RemoteSessionDB
```

---

# 26. F 类：P3 Fork Lineage / Reconcile

AgentGit 的 conversation fork / merge 很适合未来 LCOS。

但 LCOS 不应该照做 Git merge。

建议：

```text
Conversation A
├─ Fork A1
└─ Fork A2

Reconcile Run
→ Decision Artifact
→ Context update
```

这样更符合 LCOS Context 演进语义。

---

# 27. Core / UI / Huabu 的 Owner 边界

| 层 | Owner |
|---|---|
| Conversation identity | Local Core |
| Receiver | Local Core |
| Continuation intent / journal | Local Core |
| Run truth | Local Core |
| Context View resolution | Local Core / existing context builder |
| Session read projection | Local Core |
| Provider capability | Adapter probe → Core projection |
| Provider native send/resume/fork | Provider / Collaboration Adapter |
| Glyth geometry | Huabu Canvas |
| Selection / Camera / history | Huabu Canvas |
| Work View window topology | ProfessionalWindowStage |
| `safeRect / occupiedRects` | ProfessionalWindowStage |
| Composer draft/reference UX | Composer |
| Action Arc | Presentation / shared command model |
| Recovery correctness | T6/T7 |
| Recovery human presentation | Gen2 UX |
| Figma | visual/state presentation only |

---

# 28. 不允许发生的 Owner 漂移

## 禁止 1

Huabu Glyth 自己持久化：

```text
sessionStatus
canFork
conversationHistory
```

这是 Core truth 泄漏。

---

## 禁止 2

GUI 根据按钮文案猜：

```text
operation succeeded
```

必须消费 Core projection。

---

## 禁止 3

Figma 图里画了一个 Fork 按钮，于是工程把它当成 capability=true。

Figma 决定：

```text
长什么样
哪里出现
如何动
```

不决定：

```text
Provider 真的支不支持 native fork
```

---

# 29. Professional Window 约束继续成立

Conversation Work View 仍属于 Professional Window。

因此：

- 打开 Work View 不移动 Camera；
- resize 不移动 Camera；
- dock 不移动 Camera；
- Stage 发布 `safeRect / occupiedRects`；
- Glyth / Action Arc / Composer / HUD 做避让；
- 只有用户显式 Focus / Locate / Fit 才允许依据 safeRect 改 Camera。

不要因为 Conversation Work View 重构又把 R2 破坏掉。

---

# 30. Work View 信息架构建议

推荐顺序：

```text
┌─────────────────────────────┐
│ Session Header              │
│ Codex · 登录页施工   ●可继续 │
│ [继续] [分叉] […]           │
├─────────────────────────────┤
│ Current / Timeline          │
│ 工作过程、结果、等待事项      │
├─────────────────────────────┤
│ Context View                │
│ Agent 接下来会看到什么       │
├─────────────────────────────┤
│ Inline Attention            │
│ 回答 / Review / Result      │
├─────────────────────────────┤
│ Diagnostics (collapsed)     │
└─────────────────────────────┘
```

---

# 31. 不应该再出现的默认布局

不要默认：

```text
Identity 卡片
Run 卡片
Composer 卡片
Review 卡片
Recovery 卡片
```

每一块都用边框框起来。

这会天然产生“运营后台 / DevTool / AI dashboard”的气质。

Work View 应该读起来像：

> 一个正在持续的工作会话。

不是：

> 五个数据库表的前端投影。

---

# 32. Figma / GUI 设计执行原则

设计实现方必须遵守：

## 32.1 复用现有 Glyth 视觉

不要重新设计一个“Agent 卡片物种”。

Conversation-bound Glyth 仍然是 Glyth。

只加：

- identity；
- state cue；
- attention；
- Action Arc 行为。

---

## 32.2 复用 Action Arc

不要新增永久 Session Toolbar。

---

## 32.3 复用 Compact Composer

不要在 Work View 底部再发明大号 ChatGPT 输入框。

---

## 32.4 复用 Professional Window

不要新增 Session Modal / Session Drawer 平行容器。

---

## 32.5 复用现有状态 token

但状态不能只靠颜色。

必须同时有：

```text
icon / text / semantic label
```

---

## 32.6 视觉参考 AgentGit，但不要复制其界面结构

AgentGit 是普通 Session Hub / Remote product。

LCOS 是 Spatial-first。

因此 donor 应该抽：

```text
Session identity clarity
Resume / Fork / New clarity
Timeline readability
Capability honesty
Handoff clarity
```

而不是把 LCOS 变成一个左边 Session List、右边 Chat Thread 的 IDE。

---

# 33. 详细用户流 1：打开绑定 Conversation 的 Glyth

### Given

- Glyth 已绑定 `ConnectedConversationV1`
- Core identity 已确认

### When

用户点 Glyth / 打开 Work View。

### Then

用户第一眼看到：

```text
会话名字
当前人类状态
最后活动
主操作
```

### And

不得第一眼看到：

```text
Run ID
Operation ID
Provider receipt
Journal revision
T6 step
```

---

# 34. 用户流 2：继续原会话

### Given

```text
canContinue=true
canSend=true
```

### When

用户 Action Arc → `继续`

### Then

- Compact Composer 锚定 Glyth；
- receiver 明确；
- context preview 与实际 send 一致；
- 真实 prompt 送到原 provider-native session。

### Failure

若 send capability 丢失：

```text
暂时无法继续这个会话
[查看诊断]
```

不能偷偷新开。

---

# 35. 用户流 3：从这里分叉

### Given

```text
canNativeFork=true
```

### When

用户 More → `从这里分叉`

### Then

- 基于原 full-history fork；
- 新 Conversation identity；
- 新 external session identity；
- lineage 可追踪；
- 原会话不被修改。

### If unsupported

不显示假的成功。

提供：

```text
用当前上下文新开
```

作为不同操作。

---

# 36. 用户流 4：Selection 新开

### Given

Canvas 当前 Selection 有 4 项。

### When

用户：

```text
Glyth → More → 用当前选中内容新开
```

### Then

显示：

```text
将带入 4 项
[对象A] [对象B] [图片] [Brief]
```

确认后走：

```text
selected_context
```

真正发送的 Context View 与预览一致。

---

# 37. 用户流 5：Waiting Input

### Given

关联 Run：

```text
status=waiting_input
```

### Then

Glyth：

```text
等你回答
```

Action Arc：

```text
回答
```

Work View：

直接将问题呈到用户眼前。

用户不需要先打开 Run 列表。

---

# 38. 用户流 6：Review

类似：

```text
需要复核
```

Action Arc：

```text
复核
```

进入真实 Artifact Return / Review 能力。

---

# 39. 用户流 7：Recovery

### Given

Continuation：

```text
outcome_unknown
```

### Then

普通 UI：

```text
正在核对会话状态
```

T6 根据 evidence / revision guard 收敛。

只有 Diagnostics 才显示 raw steps。

### Acceptance

刷新 / Core restart 后：

- 不重复 create 外部 session；
- 不丢失 evidence；
- UI 最终收敛回 ready / unavailable 等人类状态。

---

# 40. 用户流 8：切换 Active Receiver

继续使用：

```text
ProjectHandoffPackV1
```

保证：

```text
Selection
OpenTarget
DraftPrompt
```

合理带过去。

不要因为 Session 产品化重新复制一次 handoff scene。

---

# 41. 建议新增的前端结构

这是建议，不是要求强制使用文件名。

```text
huabu/apps/web/src/lcos/conversation/
  SessionHeader.tsx
  SessionAttention.tsx
  SessionTimeline.tsx
  SessionContextView.tsx
  SessionDiagnostics.tsx
  sessionCommandModel.ts
  sessionPresentation.ts
```

已有：

```text
professional/ConversationWorkViewBody.tsx
professional/RecoverySection.tsx
```

应逐步变薄。

---

## 41.1 ConversationWorkViewBody 的目标职责

以后只负责：

```text
read projection
layout
compose sections
bind commands
```

不应该自己推断几十种 raw 状态。

---

## 41.2 RecoverySection 的迁移

可变成：

```text
SessionDiagnostics
```

或拆出：

```text
RecoveryHumanSummary
RecoveryDiagnostics
```

不要直接删 correctness UI，方便调试和事故恢复。

---

# 42. 建议新增 Core 结构

建议优先沿现有 conversation/read/controller 体系扩展，不新起 Runtime。

可能的文件：

```text
packages/contracts/src/conversation-session.ts

apps/local-core/src/
  conversation-session-projection-service.ts

apps/web-gen2/src/
  conversation-session-client.ts
  conversation-session-controller.ts
```

具体命名以现仓结构为准。

核心约束：

> 这是 read projection 层，不是新 domain root。

---

# 43. API 建议

优先考虑一条聚合读：

```http
GET /projects/:projectId/conversations/:conversationId/session
```

返回：

```text
identity
state
attention
capabilities
run summary
context summary
last activity
availability
```

避免 Work View 一打开先瀑布式请求七个 endpoint 才拼出一句“可继续”。

---

## 43.1 Context View

可以是：

```http
GET /projects/:projectId/conversations/:conversationId/context-view
```

或作为 continuation prepare/read 的结果。

最关键不是 URL。

最关键是：

**同一份 resolved context 同时给 Preview 和 Execute 使用。**

---

# 44. Continuation command surface

前端不应分别调用五个底层 T6 step。

前端只表达用户意图：

```text
continue
fork
start_from_selection
start_blank
cancel
```

Core 再负责：

```text
journal
provider capability
create/bind/attach/send
reconcile
```

---

# 45. Capability Truth

建议所有操作先来自 Core capability projection。

例如：

```text
继续
```

只有：

```text
identityConfirmed
&& receiverConfirmed
&& canContinue
&& canSend
```

才是 active。

---

# 46. Unknown 不等于 False，也不等于 True

如果 probe：

```text
unknown
```

正常 UI 不应该乐观显示可执行。

表现：

```text
正在确认会话能力…
```

短暂 loading 后：

- true → 显示；
- false → 隐藏/disabled；
- 长时间 unknown → 暂时不可用。

不要猜。

---

# 47. R5 施工拆分

本轮继续沿现有 R1–R6 总路线。

**不新开 R7。**

---

## R5.0 — Current Source & Capability Freeze

目标：

- 重新做一次 Conversation 线 current source census；
- 列出 producer / owner / consumer / transport；
- 确认 Codex / WorkBuddy / Huabu Agentlet 每条 continuation capability；
- 不以旧文档替代 probe/source。

交付：

```text
R5 Source / Capability Matrix
```

---

## R5.1 — Session Read Projection

建议 commit：

```text
feat(core): project conversation session state and capabilities
```

内容：

- `ConversationSessionProjectionV1`
- human display state
- attention
- capability
- last activity
- run summary
- context summary

不得新建第二 truth。

---

## R5.2 — Honest Continuation Transport

建议 commit：

```text
fix(runtime): wire honest live continuation and capability-gated fork
```

内容：

- 真 send transport；
- capability probe；
- native fork 若真实支持则接；
- unsupported 时 fail closed；
- 禁止 fake success。

---

## R5.3 — Glyth Session Affordance

建议 commit：

```text
feat(gen2): bind Glyth conversation affordances to canonical session projection
```

内容：

- Glyth human state；
- attention；
- shared Action Arc command model；
- Compact Composer receiver guard。

---

## R5.4 — Work View Productization

建议 commit：

```text
feat(gen2): make conversation work view content-first
```

内容：

- Session Header；
- Timeline；
- Attention inline；
- 去掉默认 cockpit layout；
- Professional Window rules 保持。

---

## R5.5 — Continuation Commands

建议 commit：

```text
feat(gen2): expose canonical continuation modes through shared command model
```

内容：

- 继续；
- 分叉；
- Selection 新开；
- 空白新开；
- More/right-click 同 command source。

---

## R5.6 — Context View & Diagnostics

建议 commit：

```text
feat(gen2): preview continuation context and demote recovery internals
```

内容：

- Context View preview；
- Preview = Execute resolved context；
- Recovery raw states 移入 Diagnostics。

---

## R5.7 — Browser / E2E Closure

建议 commit：

```text
test(gen2): close conversation session product paths
```

不能只测 reducer/component。

必须真实浏览器走：

```text
Glyth
→ Action Arc
→ Composer
→ Work View
→ continuation
→ waiting input
→ review
→ recovery
```

---

# 48. R1–R6 依赖关系

保持：

```text
R1 Semantic Drop
→ R2 Professional Window
→ R3 Railway
→ R4 Reader / Assembly
→ R5 Glyth Conversation / Session Productization
→ R6 Navigation / ColorPin / Temporal / Focus / Motion / Figma polish
```

R5 会直接复用：

- R1 的 canonical target / selected-context；
- R2 的 Professional Window / safeRect；
- 既有 Action Arc；
- Compact Composer；
- Glyth presentation seam。

---

# 49. R5 Done 以后不要再突然长一层

R6 完成后仍按原路线：

```text
Automated Regression
→ 用户真实手测
→ Stabilization / Bugfix Only
→ RC
```

不要在手测前突然宣布：

> “我们发现 Session 还需要一个完整 Session Center 2.0，所以加 R7。”

除非真实手测证明冻结需求无法使用。

---

# 50. Definition of Done

以下全部满足，R5 才能称 Done。

### Product

- [ ] Conversation-bound Glyth 第一眼不是 dashboard。
- [ ] 用户一眼知道状态与主动作。
- [ ] 四种 canonical continuation 有准确的人类入口。
- [ ] Unsupported capability 不伪装支持。
- [ ] Work View 不再默认常驻 Run/Review/Recovery 控制面板。
- [ ] T6 raw state 只在 Diagnostics 出现。
- [ ] Context View 可预览。
- [ ] Preview 与 Execute context 一致。

### Core

- [ ] Session 只读投影没有制造第二 SoT。
- [ ] canContinue / canSend / canFork 来自真实 capability。
- [ ] live continuation prompt send 真实可达 session owner。
- [ ] unsupported native fork fail closed。
- [ ] continuation restart/retry 不重复外部 session。
- [ ] receiver mismatch 阻止 send。

### Spatial / UX

- [ ] Glyth 仍使用既有对象语言。
- [ ] Action Arc ≤ 高频 3 项 + More。
- [ ] Compact Composer 仍局部、轻量。
- [ ] Work View 打开/resize/dock 不移动 Camera。
- [ ] HUD/Arc/Composer 避让 `occupiedRects`。
- [ ] Selection 新开不变成填表流程。

### Accessibility

- [ ] 状态不只靠颜色。
- [ ] Action Arc / More / Work View 可键盘操作。
- [ ] attention 有可读 label。
- [ ] loading / unavailable 有明确语义。

---

# 51. E2E 验收矩阵

## A. Bound Glyth

**Given** Glyth 有真实 ConnectedConversation binding  
**When** 打开  
**Then** 显示 Session projection。

---

## B. Unbound Glyth

**Given** 无 binding  
**Then** 不伪造 Session / Receiver / Continue。

---

## C. Continue

**Given** `canSend=true`  
**When** `继续` → Composer → Send  
**Then** 到真实 canonical provider/session。

不得：

```text
detached new Run
```

伪装 continuation。

---

## D. Continue Unsupported

**Given** send unsupported  
**Then** 不 fake success。

---

## E. Native Fork

**Given** native fork capability true  
**Then** 产生新 external identity + 新 Conversation identity。

---

## F. Native Fork Unsupported

**Then** 不显示假 fork。

可显示：

```text
用当前上下文新开
```

但语义不同。

---

## G. Selected Context

UI preview 的 refs 与后台 resolved refs 完全一致。

---

## H. Blank New

旧 Conversation 历史不得隐式带入。

---

## I. Waiting Input

Glyth 主动作切换为：

```text
回答
```

---

## J. Review

主动作切换：

```text
复核
```

---

## K. Recovery

`outcome_unknown`：

- UI 人话；
- Core reconcile；
- 不重复 create。

---

## L. Restart

Local Core restart 后：

- journal 可恢复；
- external evidence 不丢；
- UI 最终收敛。

---

## M. Receiver mismatch

identity 未确认 / mismatch：

```text
Send disabled
```

---

## N. Camera

Work View open / resize / dock / close：

```text
camera before === camera after
```

除非用户显式 Focus/Fit。

---

## O. “Not Cockpit” Visual Regression

默认 Work View 截图中：

- 不应出现永久的四步 recovery chips；
- 不应出现 operation/revision；
- 不应默认同时出现 Run、Review、Recovery 三个管理模块；
- Header + Timeline + Context / Attention 应形成主要视觉层级。

---

# 52. Migration / Compatibility

不要大爆炸替换。

推荐顺序：

### Step 1

先加 Session projection，不删现有 Work View。

### Step 2

新 Header / presentation 消费 projection。

### Step 3

Action Arc 切到 capability command model。

### Step 4

重构 Work View 信息架构。

### Step 5

RecoverySection 下沉 Diagnostics。

### Step 6

删掉旧重复 presentation。

这样任何一步出问题，都能与 current source 对照。

---

# 53. Telemetry / Diagnostics

如果项目当前已有 telemetry seam，可以记录：

```text
session_view_opened
session_continue_requested
session_continue_blocked
session_fork_requested
session_context_view_opened
session_diagnostics_opened
session_waiting_input_answered
session_review_completed
```

但 analytics 不是 functional truth。

不能出现：

```text
因为 telemetry 说 send 成功
→ Core 就认为 session send 成功
```

这种人类文明倒退。

---

# 54. Source-Level 施工关注文件

当前至少需要精读：

```text
packages/contracts/src/receiver.ts
packages/contracts/src/conversation-continuation.ts

apps/local-core/src/huabu-agentlet-continuation-adapter.ts
apps/local-core/src/huabu-agentlet-host-transport.ts
apps/local-core/src/runtime-application-service.ts
apps/local-core/src/runtime-adapter.ts

huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx
huabu/apps/web/src/lcos/professional/RecoverySection.tsx

现有 Composer host/store
现有 Action Arc command model
现有 Glyth presentation/binding owner
ProfessionalWindowStage / professionalWindowLayout
Conversation Work View controller/client
Core conversation/continuation clients
```

施工前必须从 current branch exact source 再做一次 owner/producer/consumer census。

---

# 55. 对设计实现方最重要的一段话

不要把 AgentGit 当成要塞进 LCOS 的新产品。

它只是帮助我们看清：

> 我们已经写进 Gen2 的 Conversation / Continuation 能力，本来应该被呈现成一个自然的 Session UX，而不是工程操控台。

这次工作真正要做的是：

```text
T6/T7 correctness
继续保留

ConnectedConversation
继续保留

Run / WaitingInput / Review
继续保留

ProjectHandoffPack
继续保留

Glyth
继续保留

↓
重新组织产品呈现
↓
一个自然、能继续、能分叉、能接住上下文的 Conversation-bound Glyth
```

---

# 56. 最终产品第一感

用户看到一个 Glyth：

```text
登录页施工
● 等你回答
```

点击：

```text
[回答] [打开] […]
```

打开以后：

```text
Codex · 登录页施工
● 等你回答

Codex 正在等你确认：
“保留旧 Hero 动画吗？”

[保留] [移除] [补充说明]

────────────

最近工作
14:32 你提出修改登录页
14:38 Codex 完成 5 个文件修改
14:39 等待确认

────────────

这个 Agent 接下来会看到什么
Brief.md
登录页 Figma
当前 Selection ×4
```

只有用户真的需要排错时，才看到：

```text
连接诊断
external_create ...
core_bind ...
attach ...
projection ...
```

这才是本轮收口以后应该得到的产品。

---

# 57. 非目标

本轮明确不做：

- 公开 Session Hub；
- Agent 社区；
- 新 Session DB；
- Git-based Session truth；
- 所有 Provider 强制改走 Huabu；
- 新的 Generic Agent Platform；
- 大型 Session Manager 页面；
- 永久 Conversation 侧栏；
- 把所有 Run 都改成 Conversation；
- 模型隐藏 chain-of-thought 存储；
- 为了 Figma 漂亮而伪造未存在 capability。

---

# 58. 最终架构图

```text
                           LCOS UI
                              │
                   Conversation-bound Glyth
                              │
                ┌─────────────┴──────────────┐
                │                            │
          Action Arc / Composer      Conversation Work View
                │                            │
                └─────────────┬──────────────┘
                              │
                 Session Read Projection
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
ConnectedConversation     Run / Attention       Context View
Receiver / Binding       Review / Artifact     Ordered Refs
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                    Local Core Truth
                              │
                Continuation / Capability
                              │
          ┌───────────────────┴──────────────────┐
          │                                      │
   Provider / Huabu Session              Bridge / Runtime Run
   resume/send/fork/status               Codex / WorkBuddy
          │                                      │
          └───────────────────┬──────────────────┘
                              │
                     Observable Result
```

一句话：

> **Glyth 是入口，Conversation 是身份，Session 是产品投影，Core 是真相，Adapter 负责真的把话送到对应 Agent，T6/T7 负责出事故时别把世界弄乱。**

---

# 59. 给施工 Agent 的执行口径

开始施工前：

1. 读取本规范；
2. 回到 `frontend-reconstruction-v2` current source；
3. 对 Conversation / Receiver / Continuation / Run / Glyth / Composer / Professional Window 做完整 current-source census；
4. 不以本文建议文件名替代 current source；
5. 先完成 capability truth；
6. 再做 GUI；
7. 不得用 GUI fake 补 runtime 缺口；
8. 不得新增第二 Session SoT；
9. 每一子阶段必须 browser-path 验收；
10. 完成 R5 后继续原 R6，不新增旁支阶段。

如果发现本规范与 current canonical source 冲突：

```text
current canonical truth
>
本规范中的实现建议
```

但产品冻结：

```text
Glyth-first
human-first
not cockpit
honest capability
no second truth
```

不得反向修改。

---

## Appendix A — AgentGit donor 使用方式

如本地拉取 `Einsia/agent-git`，建议只做以下 donor census：

```text
session identity
resume/fork/new affordance
session history layout
context/view concepts
handoff/share/export
remote follow
approval
fork lineage
```

不要优先研究：

```text
如何把它的 Git storage 搬进 LCOS
```

目标是借成熟产品表达，不是引进第二套 persistence。

---

## Appendix B — 后端改动优先级最终表

| 能力 | 当前判断 | R5 |
|---|---|---|
| ConnectedConversation identity | 已有 | 复用 |
| Receiver | 已有 | 复用 |
| Scene Handoff Pack | 已有 | 复用 |
| Continuation modes | 已有 | 复用 |
| T6 Journal | 已有 | 复用 |
| Run / WaitingInput / Review | 已有 | 复用 |
| Session product projection | 缺统一 read model | **薄补** |
| Session capability projection | 能力散在 adapter/probe | **薄补** |
| Context View preview | 有底层材料，缺统一产品面 | **薄补** |
| Provider-native live send | Huabu 当前未接 | **必须补 / capability-gate** |
| Native full fork | Huabu 当前 unsupported | **实现或诚实 gate** |
| Diagnostics | 当前过度前置 | **下沉** |
| Handoff export | 未确认完整产品 | P1 |
| Remote follow | 未达 AgentGit 完整体验 | P2 |
| Fork merge/reconcile | 未见完整产品 | P3 |

---

## Appendix C — 最容易再次犯的错误

### 错误 1

“Session 很重要，所以建一个 SessionStore。”

**错。**  
已有 Truth 足够，先做 projection。

### 错误 2

“send 没通，但先把继续按钮画出来。”

**错。**  
这就是语义完成。

### 错误 3

“native fork 没有，selected-context new 差不多。”

**错。**  
用户语义不同。

### 错误 4

“Recovery 信息很重要，所以常驻。”

**错。**  
重要不等于应该在第一层。

### 错误 5

“AgentGit 是 Session Hub，所以 LCOS 也做 Session Hub。”

**错。**  
LCOS 是 Spatial-first，Session 要长在 Glyth 上。

### 错误 6

“为了统一架构，所有 Agent 都塞进 Huabu。”

**错。**  
前台统一，后台分流。

### 错误 7

“Work View 是工作台，所以什么都放进去。”

**错。**  
Work View 是某个对象的专业工作视图，不是系统总控台。

---

**END**
