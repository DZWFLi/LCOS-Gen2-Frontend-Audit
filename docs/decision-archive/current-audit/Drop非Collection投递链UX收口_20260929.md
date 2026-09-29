# 非 Collection Drop 目标链 UX 收口（2026-09-29）

## 做完了什么
把拖拽预览改成按真实接收目标说人话，并接入原卡允许的 Portal 投递。Glyth 本体仍调用现有 Assembly apply 持久加入会话上下文；Composer 槽仍只改本次草稿引用。Railway 报出目的地名。Composer 预览明确“仅加入本次草稿引用”，不与持久会话上下文混淆。

Portal body 现在只有在 `data.targetCanvasId` 能唯一匹配当前 Core workspace 时才注册接收目标；目标用现有 Assembly 的 workspace/main target identity，沿 `LcosHostOverlay → CoreAssemblyClient.apply` 提交并复用 canonical receipt。缺目标、映射歧义或不支持的来源会在预览阶段拒绝；不猜 workspace、不新建 Core owner。Portal 的导航预览/打开动作仍保留。

承接 Receiver 只用于显式打开会话，不是投放/改 Receiver 的目标（原 T3 §17 未定义该动作）。现在用既有 DropTargetRegistry 的高优先级 exclusion 占住 chip 近场，拖入时说明“承接会话用于打开会话”，避免误投到背后的整张 Canvas。

## 原件依据
- `E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T3\LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md` §17：Glyth body=durable Conversation Context；Composer reference=this-run；Receiver chip drop 未定义，不先做 drop target。§6.6：closed/unopened Worksite Portal 可作为 preserve-source remote target。§18：Railway destination 提交后展示 receipt。
- 当前落点仍由现有 `DropCommitRouter`、`LcosHostOverlay`、`CoreAssemblyClient` 负责；不写第二套状态或 membership owner。`LcosDropReceipt` 保留逐项结果和“只重试失败项”；缺项结果提示先查看目标，未知项不自动重放。

## 改动文件
- `huabu/apps/web/src/lcos/drop/dropTypes.ts`：增加 Portal receive 与非接收区域语义。
- `huabu/apps/web/src/lcos/drop/PortalDropWorkspaceContext.tsx`：从 Shell 已加载的 Core workspaces 建立精确 canvas→workspace 映射，重复/缺失时 fail-closed。
- `huabu/apps/web/src/lcos/shell/LcosProjectShell.tsx`：把只读 workspace 映射提供给画布节点。
- `huabu/apps/web/src/lcos/nodes/PortalNodeBody.tsx`：基于实际 body rect 注册 Portal 接收区，并在卸载/目标变化时注销。
- `huabu/apps/web/src/lcos/shell/LcosRailway.tsx`：Receiver chip 改为 open-only drop exclusion；目的地接收区仍保留原 Railway Assembly 路径。
- `huabu/apps/web/src/lcos/drop/dropIntentResolver.ts`、`LcosDropPreview.tsx`：拒绝 exclusion；预览按目标类型和真实目标名称呈现。
- 定向测试：`PortalNodeBody.test.tsx`、`LcosDropPreview.test.tsx`、`LcosRailway.keyboard.test.tsx`、`LcosHostOverlay.receipt.test.tsx`。

## 验证与边界
定向 Vitest：5 个文件、35 项通过，覆盖 Portal 唯一/歧义 workspace、实际 Assembly workspace 请求与 receipt、预览语义区分、Receiver exclusion、Glyth 持久上下文及现有 partial retry。

`npx tsc --noEmit -p tsconfig.json` 仍被两处仓内 `apps/web-gen2` 类型错误挡住：`backend/collections.ts:40`（`changeSetId` 类型）和 `host/projectionFacade.ts:341`（`Note.title` 类型）；本批源码没有额外 TypeScript 错误（该结果来自先前检查，本轮没有因浏览器验证重跑全量 TSC）。

## 同一真实浏览器会话实测（2026-09-29）
- 页面：`http://127.0.0.1:5286/projects/lcos-gen2-dev/main`，隔离 e2e fixture，不触发外部 provider。
- **Glyth 持久上下文：**以真实右键拖拽把“项目定位”拖到“承接会话（e2e fixture）”。悬停预览显示“持久加入会话上下文”；松手后真实请求 `POST /lcos-core/projects/lcos-gen2-dev/assembly/apply` 返回 HTTP 200。原始 request body 指向 `{kind:"conversation", id:"conversation-e2e-fixture"}` 与 `{kind:"artifactView", id:"view-positioning"}`；canonical response 的该项是 `failed/error`，消息为 `Conversation has no linked session (fail-close).` 页面逐项回执显示“投放未完成 · 1 项失败”，不伪报持久化成功，并出现“只重试失败项（1）”。这次结果说明 UX 和 Core 请求链已接通；fixture 缺链接 session，故无法实测成功后的 Glyth 刷新呈现。
- **Composer 本次引用：**同一材料拖入已打开的 Composer。悬停预览是“仅加入本次草稿引用”；松手后 Composer“本次显式引用”列表出现“项目定位”，回执为“已加入引用”。此路径没有出现 Assembly/Core 写请求；未点击提交，因此未调用 provider，也验证了本体 Glyth 的持久语义与 Composer 一次性草稿的区分。
- 截图：Glyth 预览 [11-11-43-955Z](../LCOS_GEN2_GUI_RECOVERY_20260926/huabu/.playwright-cli/page-2026-09-29T11-11-43-955Z.png)、Glyth 失败回执 [11-12-18-228Z](../LCOS_GEN2_GUI_RECOVERY_20260926/huabu/.playwright-cli/page-2026-09-29T11-12-18-228Z.png)、Composer 草稿引用 [11-24-57-980Z](../LCOS_GEN2_GUI_RECOVERY_20260926/huabu/.playwright-cli/page-2026-09-29T11-24-57-980Z.png)。实际 assembly 请求与响应已逐条读取 Playwright network entries 986 的 request/response body。
- **Railway / Portal：**本轮浏览 Main 与 Context 现场，DOM 没有 Railway 组件或 Portal body，因此不造目标、不合成成功。Core workspace 响应可见 Main/Context/Workflow 的 canvasId，另有三条旧 workflow 子现场记录缺少 canvasId；但当前画布没有对应 Portal 节点，不能把 workspace 的存在冒充 Portal UI 可投放。Railway 目标与外部目标投递留待存在真实可见目标的现场继续验证；缺目标/歧义时仍依据当前 resolver fail-close，未以浏览器虚构验证。
- 本轮没有改代码；浏览器 console 汇总页上已有 3 errors/3 warnings，切入 Context 后汇总为 6/6，本轮没有证明这些条目由 Drop 操作引起，也未借它们推断 drop 失败。未执行外部 provider，不 commit/push。
