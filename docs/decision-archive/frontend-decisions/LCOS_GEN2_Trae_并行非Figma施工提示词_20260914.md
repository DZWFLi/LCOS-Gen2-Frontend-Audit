# LCOS GEN2 · Trae 并行非 Figma 施工提示词

## 结论

你不需要连接 Figma，也不要尝试自行补视觉。当前与 `codex/figma-code-web` 并行时，你负责 **真实运行底盘、T6/T7 接线、恢复语义、构建质量与未来合并准备**。

Figma 网页会话负责：

- exact UI；
- 节点形态；
- Action Arc；
- Glyth；
- Source morphology；
- 外壳、尺寸、颜色、排版与视觉状态。

你负责让这些视觉组件未来接入时有真实数据、真实动作和稳定宿主，不再靠 mock 或文案冒充。

---

## 给 Trae 的完整提示词

你正在 `E:\OS开发\LCOS_Gen2` 的既有施工分支上继续 LCOS GEN2。另一路 `codex/figma-code-web` 正在单独实现 Figma exact visual；两路之后由 Codex 审计合并。

### 一、开工边界

1. 先读仓库当前 `README.md`、`AGENTS.md`、当前 Sprint/Handoff、最新审计账和当前代码。
2. 读取以下新增审计，但只用于理解接口缺口，不要根据截图自行设计 UI：

   - `C:\Users\1\Desktop\前端冲刺\LCOS_GEN2_FigmaCode_S2_Audit_Evidence_20260914\LCOS_GEN2_FigmaCode_S2-S2c1_代码与Figma复刻审计_20260914.md`
   - `C:\Users\1\Desktop\前端冲刺\LCOS_GEN2_FigmaCode_S2_through_S2c1_CumulativePack_20260914.zip`

3. 不切换、不改写、不合并 `codex/figma-code-web`。
4. 不修改用户未提交内容，不 reset，不 push。
5. 开工前执行：

   ```text
   git status
   git branch --show-current
   git log --oneline -10
   git diff --check
   ```

6. 若工作树不干净，先区分既有变更与本任务，不覆盖；只因真实冲突停止相关文件，其余独立工作继续。
7. 不新增泛化平台、第二 Store、第二 Canvas、第二 Conversation/Run truth。
8. 不新增防御性 gate。只有发现一个普通类型、单测、Git 或数据库约束无法捕获的具体失败时，才增加针对该失败的检查。

### 二、视觉文件禁改区

这轮不要修改以下视觉 owner；它们由 Figma Code 会话负责：

```text
huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx
huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx
huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx
huabu/apps/web/src/lcos/nodes/glythGeometry.ts
huabu/apps/web/src/components/Nodes/image/ImageNode.tsx
huabu/apps/web/src/components/Nodes/audio/AudioNode.tsx
huabu/apps/web/src/components/Nodes/NodeWrapper.tsx
scripts/e2e/r2-main-vertical-slice.mjs
apps/web-gen2/src/presentation/glythPresentation.ts
```

也不要自行选择：

- 颜色；
- 字号；
- 间距；
- 阴影；
- 圆角；
- 图标；
- 节点默认视觉尺寸；
- Glyth shape/tone；
- Main 构图；
- Motion 手感。

遇到这些需求，登记成 `FIGMA_OWNER`，继续其它工作，不要猜。

### 三、当前最值得并行施工的主线

#### P1：T7 真实 transport 与 continuation 接线

先核当前 exact file / symbol / caller，区分 `CURRENT / PARTIAL / FAKE / GAP`。沿用已有 T7、T6、Core、Huabu ACP 合同，完成当前批准范围内的真实调用链：

```text
continue existing
native full-history fork
selected-context new session
blank new session

create
fork
attach
send
status
cancel
recover
```

硬边界：

- Core 是 Conversation / Receiver / Run / Relation truth；
- Huabu 是唯一 spatial/runtime 宿主；
- T7 只做 capability resolution、binding、adapter composition、external ingress；
- T7 不创建 LCOS Conversation truth；
- context inheritance 与 shared checkout / isolated worktree 分开表达；
- provider 不支持 native fork 时，只能 create + ContinuityAttachBundle，并诚实返回 degradation receipt；
- 不把当前 Codex App 可调用工具当成仓库源码 CURRENT；
- 不用 fake provider 冒充 transport 已接通。

至少覆盖以下恢复场景：

```text
provider 创建成功 / Core receipt 失败
Core operation 成功 / attach 失败
timeout outcome unknown
duplicate retry
cancel
restart reconciliation
externalSessionId 恢复
```

重试必须基于 correlation/idempotency，不得重复创建外部 session。

若真实 provider、凭证或 API 当前不可用：

- 完成可完成的 adapter、持久化、恢复和契约测试；
- 将端到端状态标为 `BLOCKED_BY_PROVIDER`；
- 不写“成功”占位；
- 不为了让测试绿而造第二个 fake transport。

#### P2：T6 receipt / recovery 的生产链核验

核对并补齐：

- `externalSessionId`；
- provider；
- capability snapshot；
- correlation；
- retry receipt；
- cancel receipt；
- timeout outcome；
- restart reconciliation；
- duplicate submit 读取同一 operation。

确认已有 WaitingInput / Recovery / Work View 使用同一 Core projection，不在 UI 再造状态。

#### P3：非视觉回归与可重复 fixture

不要修改 Figma 视觉脚本 `r2-main-vertical-slice.mjs`。可以新增独立的非视觉测试文件，覆盖：

- fresh DB 可重复 seed；
- Canvas stale → recreate → persist → reload；
- provider/Core partial success recovery；
- duplicate retry；
- restart 后 journal reconciliation；
- waiting_input 回答不新建 Run；
- Reader/Work View 双击目标仍指向同一 Core identity；
- Bridge/Core/Huabu 任一断开时诚实降级。

测试必须失败时非零退出，不能只打印日志。

#### P4：合并准备

输出一份精确的共享接口账，不应用 Figma patch：

```text
当前 visual branch 将来需要消费的真实字段
这些字段的 producer
当前 exact API / file / symbol
已接通 / 未接通
失败语义
取消语义
重启恢复语义
```

特别核：

- Conversation descriptor 的 `active / waiting` 是否真有 producer；
- Source descriptor 的 `artifactKind / mimeType / sourceKind / managed / preview / secondaryLine` 是否都来自真实 Core；
- media URL 是 presentation-only URL，不写回 canonical artifact key；
- AI provenance badge 的真实语义来源是什么，只记录，不做视觉裁决；
- 新节点 initial geometry 与已持久化用户 geometry 的边界，只记录当前 owner，不制定 Figma 数值。

### 四、避免冲突的文件范围

优先在这些非视觉区域工作：

```text
packages/contracts/**
apps/local-core/**
apps/web-gen2/src/backend/**
apps/web-gen2/src/runtime/**
apps/web-gen2/src/continuation/**
huabu/apps/server/**
Huabu ACP / adapter 对应既有目录
新增的独立非视觉 test / script
docs/handoffs/**
docs/audit/**
```

以下共享出口文件只有确实需要时才改，并在 handoff 单列，方便后续合并：

```text
apps/web-gen2/src/index.ts
server compose/root wiring
package scripts
```

不要顺手格式化全仓。

### 五、施工纪律

1. 先做 exact source census，再改代码。
2. 每个结论必须带 repo/file/symbol/caller。
3. 优先复用现有接口；发现近似接口先合并 owner，不复制。
4. 每次只做一个小而可审查的 commit。
5. 不 push。
6. 严格区分：

   ```text
   CURRENT
   IMPLEMENTED
   PARTIAL
   FAKE
   GAP
   UNVERIFIED
   BLOCKED_BY_PROVIDER
   ```

7. 基础验证：

   ```text
   lint
   typecheck
   targeted tests
   build
   runtime smoke
   recovery smoke
   git diff --check
   ```

8. 测试基线若既有失败，先以开工前证据归因；只修本任务引入的回归。
9. 不用 DOM 文案或 `data-*` marker 冒充真实后端能力。
10. 完成后输出 Markdown handoff，包含实际修改、真实测试结果、未完成、回滚点、下一步以及与 Figma 分支可能冲突的文件。

### 六、停止条件

仅在以下情况停止对应子任务并报告：

- 需要改变冻结对象模型；
- 需要新增数据库/Bridge/运行时；
- 需要猜 Figma 视觉；
- 需要真实 provider 凭证；
- 当前文件和 Figma owner 发生不可避免的并发冲突；
- 无法保留用户未提交内容。

其它独立任务继续，不要因为一个 GAP 整轮停住。

### 七、本轮交付目标

优先交付：

1. T7 CURRENT/FAKE/GAP exact census；
2. 已批准范围内的真实 transport 最小闭环；
3. T6 receipt/recovery 对接；
4. 非视觉恢复测试；
5. Figma 分支未来可消费的字段/producer/caller 账；
6. 一份诚实 handoff。

不要输出新的 UI，不要说“看起来差不多”，也不要等 Figma 才开始上述工作。

