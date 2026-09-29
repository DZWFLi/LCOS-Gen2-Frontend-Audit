# LCOS Gen2｜Collaboration Facade V0 实验计划与讨论归档

日期：2026-09-15  
基线分支：`frontend-reconstruction-v2`  
核对 HEAD：`97841d6fb199a29d4780420cc80ffddb0d29b9fc`  
性质：**可回滚架构实验，不是正式产品语义迁移，不宣称已经编译/实机通过。**

---

# 0. 这份档案为什么存在

这一轮不是为了立刻重构 LCOS 后端，而是因为当前 Agent / Conversation / Run / Continuation / Huabu / Bridge 的职责经过多轮施工后已经比较安全，但**上层 caller 开始感受到“后端分得太细”**。

用户的核心判断是：

> “现在就是我感觉 gen2 的后端分的太细了，很多东西我觉得不应该这么复杂，所以我想要看 GPT 的 app adapter 来借鉴一下。”

进一步讨论后形成了几个关键判断：

> “说白了就是 Huabu 其实也算外部，不过它是和 LCOS 深度绑定的。”

> “固定对话，选常驻对话框的驻场本地 agent / llm api，对 LCOS 的画布操作归纳，同时支持外部任务对话接管和常驻的接管。”

> “及时协作，靠提示词输入框下面的绑定对话 / 驻场对话，模型 API，分别对应外部和深度内嵌的 Huabu 两类。”

> “直接派给外部不在 LCOS 内编辑，直接等执行完后经过用户在外部的沟通之后调整返回。”

随后形成的 UX 主干是：

```text
1. 驻场协作
   “陪我一起干”
   主要由 Huabu / 当前 Conversation / 本地 Agent 承担

2. 即时协作
   “现在帮一下”
   由 Composer 发起，绑定当前 Conversation / 驻场 Agent / 模型 API

3. 外部委托
   “出去帮我干”
   由 Run / Bridge → Codex / WorkBuddy 等外部执行

4. 环境智能
   Search / Context / Suggestion / Summary 等，不需要让用户感知成 Agent 任务
```

重要结论：

- Huabu 本身属于外部 runtime，只是和 LCOS 深度绑定。
- LCOS 不应该复制一套 Huabu Agent workspace。
- Huabu 更适合负责“当前 Agent 和当前工作现场怎么一起工作”。
- LCOS 负责长期 Project / Context / Conversation / Run / Return truth。
- Bridge 继续负责真正的外部委托执行。
- Composer 应成为“这一刻把输入交给谁”的统一入口，而不应该天然等于 `createRun()`。
- T6 的 journal / stale guard / idempotency / external evidence 很有价值，但它们应该**退到幕后**，不应该直接成为前端协作心智。
- 借鉴 Codex App Server 的重点不是照搬 JSON-RPC，而是借它的 **Message Processor / stable client-facing surface** 思路。

---

# 1. 为什么先做 V0 Facade，而不是直接重构 T6

当前源码事实：

## Composer

`huabu/apps/web/src/lcos/composer/LcosComposerHost.tsx`

目前提交逻辑非常直接：

```text
Composer
→ CoreRunClient.createRun()
```

所以当前工程实际上把：

```text
“输入一句话”
```

约等于：

```text
“创建一个 Run”
```

未来产品语义明显不会一直成立。

## Conversation Work View

`ConversationWorkViewBody.tsx`

现在同时实例化：

```text
CoreConversationClient
CoreRunClient
CoreContinuationClient
```

然后分别承担：

- Conversation identity / reach / aggregate
- Run / Waiting Input / Artifact Return
- Continuation / Recovery

视觉层已经接近正确产品面，但 caller 仍然直接知道三套 backend facade。

## T6

T6 内部有：

```text
external_create
core_bind
attach
projection
reconcile
cancel
external evidence
revision guard
```

这些对“外部副作用的正确性”仍然重要。

因此当前不能直接做：

```text
删 T6
把所有东西改成 Agent.send()
```

这会丢掉已经建立好的安全能力。

正确顺序应是：

```text
先给前端一个更薄的协作入口
↓
内部仍复用现有安全 service
↓
证明 caller 可以简化
↓
再审计哪些旧 service 只是 glue
↓
最后才物理合并 / 删除
```

---

# 2. 借鉴 GPT / Codex 的东西到底是什么

我们不照搬 OpenAI 的所有内部实现。

真正值得借的是：

```text
Provider 内部可以很复杂
↓
但对上层暴露稳定的 client-facing surface
↓
把内部低级事件翻译成 UI-ready 状态
```

对 LCOS 的对应应该是：

```text
Huabu / Codex / WorkBuddy / Model API
            ↓
      Collaboration Adapter
            ↓
     Collaboration Facade
            ↓
Composer / Conversation Work View / Workflow
```

V0 暂时不实现真正 Adapter。

V0 只做第一件最便宜的事：

> **让前端 caller 先只拿一个 Collaboration facade，而不是自己认识 Run / Conversation / Continuation 三套 client。**

---

# 3. V0 PATCH 的边界

本 PATCH **只做 behavior-preserving seam experiment**。

## ADD

新增：

```text
apps/web-gen2/src/backend/collaboration.ts
```

提供：

```ts
CoreCollaborationClient
```

它内部组合：

```text
CoreConversationClient
CoreRunClient
CoreContinuationClient
```

并提供：

```text
delegate()
```

作为现阶段“外部委托 = canonical Run”的稳定语义入口。

## CHANGE

### Composer

从：

```text
new CoreRunClient(http)
runs.createRun(...)
```

改为：

```text
new CoreCollaborationClient(http)
collaboration.delegate(...)
```

底层仍然是完全相同的 `/projects/:pid/runs` route。

**行为不变。**

### Conversation Work View

从 caller 直接创建：

```text
ConversationClient
RunClient
ContinuationClient
```

变为只创建：

```text
CoreCollaborationClient
```

然后旧组件暂时消费它内部暴露的：

```text
collaboration.conversations
collaboration.runs
collaboration.continuations
```

所以这是过渡 seam，不是最终形态。

## TEST

新增一个 web-gen2 client test，证明：

```text
CoreCollaborationClient.delegate()
```

仍然路由到：

```text
POST /projects/:pid/runs
```

不改变 canonical Run 行为。

---

# 4. V0 PATCH 明确不做什么

以下全部禁止在这次实验顺手做掉：

```text
× 不删 T6
× 不改 Continuation journal schema
× 不改 Run schema
× 不改 Conversation identity
× 不新增新的 Project truth
× 不改变 Core routes
× 不把 Huabu prompt send 假装成已支持
× 不把 collaborate() 映射成 createRun()
× 不接 Codex App Server
× 不改 Bridge
× 不改 Figma / UX 视觉
× 不改变 Artifact Return / Waiting Input 行为
```

尤其：

**V0 不实现 `collaborate()`。**

原因很简单：

当前真正的 Huabu prompt transport 仍未接通。

如果现在写：

```ts
collaboration.collaborate(...)
```

然后内部偷偷 fallback 到：

```text
createRun()
```

那只是把旧错误藏进新接口。

所以 V0 只允许拥有已经真实成立的：

```text
delegate()
```

而即时/驻场协作先留为下一阶段能力。

---

# 5. 这次实验真正想验证什么

不是“代码能不能编译”这么简单。

要验证四件事。

## A. 前端 caller 是否明显变简单

Composer 和 Conversation Work View 是否可以开始只依赖：

```text
CoreCollaborationClient
```

而不是知道越来越多 service。

## B. 现有 T6 安全能力是否可以完全留在 facade 后面

如果可以：

说明“退居幕后”路线成立。

## C. 是否不需要重写现有 UX

如果 Composer / Work View 的视觉和交互基本不用改：

说明未来可以通过替换 facade / adapter 做后端收敛，而不是重做 T3/T4/T6 前端。

## D. 是否为未来两种动作留下空间

最终希望是：

```text
collaborate()
delegate()
```

但 V0 只实现：

```text
delegate()
```

等 Huabu send 真正成立之后再加 `collaborate()`。

---

# 6. 给 Codex 的试跑 SOP

## Step 0

必须确认：

```bash
git rev-parse HEAD
```

基线最好仍为：

```text
97841d6fb199a29d4780420cc80ffddb0d29b9fc
```

如果 HEAD 已经变化：

不要强行套 PATCH。

先：

```bash
git apply --check <PATCH>
```

## Step 1

只做：

```bash
git apply --check LCOS_Gen2_CollaborationFacade_V0_97841d6.patch
```

如果失败：

- 不要手工“差不多套上去”
- 读取本 MD
- 对最新 HEAD 重新定位四个目标文件
- 等价重写 patch

## Step 2

如果 check 通过：

```bash
git apply LCOS_Gen2_CollaborationFacade_V0_97841d6.patch
```

## Step 3

至少执行：

```bash
npm run typecheck:web-gen2
npm run test:web-gen2
```

然后：

```bash
npm run --workspace @huabu/web typecheck
```

条件允许再：

```bash
npm run --workspace @huabu/web test
npm run --workspace @huabu/web build
```

## Step 4

源码检查：

```bash
git diff --check
git diff --stat
git diff
```

## Step 5

真实验证：

### Composer

确认：

```text
输入 → submit
```

仍然创建真实 Run。

失败时：

```text
草稿仍保留
```

### Conversation Work View

确认：

- identity 仍能读
- runs 仍能显示
- Waiting Input 仍工作
- Artifact Return 仍工作
- RecoverySection 仍工作
- 切换 conversation 不产生 stale 回包污染

---

# 7. PASS / FAIL 判定

## PASS

满足：

```text
1. 编译、测试通过
2. 行为完全不变
3. Composer / WorkView caller 更集中
4. 没有第二 truth
5. T6 没有被破坏
6. facade 没有开始偷偷实现 provider-specific 逻辑
```

则证明：

> “前端先切统一协作入口、底层慢慢收敛”路线可行。

## FAIL

出现：

```text
为了 facade 被迫复制状态
为了 facade 重写 T6
为了 facade 新增另一套 session truth
必须大量修改 Work View body
现有 typed client 反而被 wrapper 搞得更难理解
```

则不要继续堆 facade。

保留本 MD 作为决策档案，等大主线完成后再做完整 consolidation audit。

---

# 8. V0 之后才考虑的 Phase A–E

如果 V0 PASS：

## Phase A

让更多前端 consumer 只依赖 Collaboration facade。

## Phase B

真正打通：

```text
LCOS
→ Huabu Host
→ active Agent Session
→ prompt send
```

然后新增真正的：

```ts
collaborate()
```

## Phase C

将 T6 的细粒度：

```text
external_create
core_bind
attach
projection
reconcile
```

继续保留在内部，但对上层只投影：

```text
connecting
ready
waiting
recovering
unavailable
failed
```

## Phase D

Bridge 的 Codex provider transport 从 CLI/session-era 迁到 Codex App Server。

Core Run contract 不动。

## Phase E

做一次物理删除审计：

```text
哪些 Service 仍有独立 Domain Truth？
哪些只剩 glue？
哪些只是 Projection？
哪些可以合并？
哪些可以删？
```

只有 caller 全迁完后才删。

---

# 9. 当前最终架构假设

```text
                         LCOS UI
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
    Composer        Conversation Work View    Workflow
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                  Collaboration Facade
                       │          │
                       │          │
                 collaborate   delegate
                  （未来）      （现有）
                       │          │
                       ▼          ▼
                    Huabu       Run/Core
                 / Model API      │
                                  ▼
                               Bridge
                                  │
                           Codex / WorkBuddy
```

T6：

```text
不消失
不做前端产品心智
继续作为 external side-effect correctness / recovery 内部机制
```

---

# 10. 最重要的施工纪律

这次实验的目的不是：

> “给复杂系统再套一层统一接口。”

而是验证：

> “前端是否可以稳定只依赖一个产品语义入口，同时底层安全机制保持原样。”

如果只是多了一层 forwarding class，caller 数量没减少，依赖没收敛：

**立即停止。**

如果能够让 Composer / Work View / 后续 Workflow 逐渐只面向 Collaboration：

则继续。

这是本次 PATCH 唯一值得成立的理由。
