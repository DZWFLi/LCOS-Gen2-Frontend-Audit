# Context / Workflow 原型与生产偏差核查（修订）

日期：2026-09-29。结论先说：两份 HTML 原型里的“Atlas组织→选中→进入→时间轨定位→返回”和“手牌预览→进入→返回”都能按原型交互；当前 5286 生产 fixture 能打开 Context Atlas 与 Workflow 手牌，但对应 child workspace 没有 `canvasId`，因此真实子现场进入、child TemporalRail 与来源返回这三段本轮**没有合法目标可验**。这不是 TemporalRail 不存在，也不把 Core 的缺 canvas 数据写成 UI 功能缺失。未改源码、未重启服务、未发送草稿。

## 本次页面与资料

- 生产页：`http://127.0.0.1:5286/projects/lcos-gen2-dev/{main,context,workflow}`；浏览器 `decision-excerpt`，确认实际载入 `LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src`（资源 URL 为 `/src/main.tsx`、`/src/App.tsx` 等）。
- 原型 A：[LCOS_ContextAtlas_WorkflowHand_IntegratedPrototype_20260910.html](C:/Users/1/Desktop/前端冲刺/LCOS_ContextAtlas_WorkflowHand_IntegratedPrototype_20260910.html)
- 原型 B：[LCOS_GlobalHUD_Navigator_ContextWorkflow_Prototype_V2_ThreeVideoIntegrated_20260910.html](C:/Users/1/Desktop/前端冲刺/LCOS_GlobalHUD_Navigator_ContextWorkflow_Prototype_V2_ThreeVideoIntegrated_20260910.html)
- 原始采用语义、T 裁决与 Figma 节点见本文件此前“采用顺序”资料索引：T5 V3 与作业说明、Figma `nFUdroLvI5qJZuYTW8h2rF`（Context `5139:2885`、子现场 `5144:675`、工作流手牌 `5140:3012`、时间轨 `5156:504` 等）。原型只作交互参照，演示数据不代表 Core 实体或能力。

## 逐项对照

|路径|原型实测|5286 生产实测 / 源码依据|状态、差异与原因|优先级|
|---|---|---|---|---|
|Context 呼出与组织|A：打开 Project Context Atlas；搜索、时间/性质切换；点选集合出现 pin/轻卡；双击或 Enter 进入。B：Context Worksite 本地灯进入 Atlas，Atlas 节点点击聚焦、双击切换到对应 Context worksite。截图：[A Atlas](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/demo1-context-atlas-open-20260929.png)、[B Atlas](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/demo2-context-atlas-20260929.png)|`/context` 的“集合总览”真实打开；6 个 collection 可见，实体卡片区分当前现场与“现场画布尚未就绪”。截图：[生产 Atlas](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/production-context-atlas-20260929.png)。源码 `ContextWorksite.tsx:56–97` 将 root-surface 切换与 child workspace 导航分开；`ContextAtlasStage.tsx:112` 走 workspace target。|**符合（入口存在）/仅缺实测（有效 child）**。生产数据没有可进入的 Context child canvas，不能拿根 `/context` 当 child。Atlas 组织维度和聚焦动效仍需与 T/Figma 语义逐项比对；本轮不把“实体更新时间”假作事情性质。|P1（数据就绪后）|
|Context 子现场与 TemporalRail|A：进入“Context 点线面”后有 9 个时间节点；点第 4 个“点线面裁决”后时间 tick 选中、相关内容节点亮起，其余退让；“返回”回到底层 Atlas。B：Context 工作区固定显示时间轨；滚轮移动时间窗、hover 预览“边界澄清”、click Focus。截图：[A 子现场与时间轨](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/demo1-context-child-temporal-20260929.png)、[B 时间轨](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/prototype-v2-context-temporal-focus-20260929.png)。|旧报告搜索错了 `apps/web-gen2/src`，故错写“生产未找到 TemporalRail”。正确 checkout 源码在 `E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/TemporalRail.tsx:28–150`；`ContextWorksite.tsx:125` 明确仅 `isChildWorksite` 时挂载，`TemporalRail.tsx:116,130` 分别接定位与预览。`ContextWorksite.tsx:65–80` 会对 child 调 `beginChildWorksiteNavigation`；入口要求目标 `canvasId`。本次生产 `/context` 是根 Context；Atlas 中点“打开现场 · Context · 理解现场”后仍停在 `/context`，Atlas 收起，没有出现带 `workspaceId` 的 child route。|**缺实测，不是实现偏差**。workspace API 的真实 fixture 里 `workspace-workflow-e38c0c595d4f`（Context · 理解现场）无 `canvasId`；所以这轮没法实测 child rail / rail定位 / 返回。当前不能说“时间轨不可达”或“child 已通过”。此前 `context-child-open-20260929.png` 是根 Context source fixture，不是独立 child 证明，撤回此前命名/结论。|P1（补齐真实 child canvas 后）|
|Workflow 手牌预览|A：卡片单击打开轻预览，双击/Enter 才进入 Workflow Worksite；可由手牌轮转、搜索或卡池选择。截图：[A 预览](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/demo1-workflow-preview-20260929.png)。B：全局切到 Workflow，手牌显示 T5 / Gen2 / Context 等工作流卡，单击选中、双击进入；“WORKFLOW CARDS · D”打开卡池。截图：[B 手牌](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/prototype-v2-workflow-hand-20260929.png)。|Main 可唤出真实 Workflow 手牌；本 fixture 唯一工作流“真实工作流导入验收”预览图 unavailable，卡片明确写“该 Workflow 现场尚未就绪”。截图：[生产手牌](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/production-workflow-hand-open-20260929.png)。`WorkflowCardPool.tsx:87–116` 将多目标、缺 target、缺 canvas 分成不同不可用原因；`211–219` 分开 preview 与 enter，缺 canvas 时不进入；`262–263` 禁用不可用目标。|**入口和保护符合；仅缺可用实体/实测**。API 的工作流目标 `workspace-workflow-8df4c3041532`（Workflow · 行动现场）无 `canvasId`；另外两个 child workspace 也无。UI 的门控是按真实能力拒绝，不作实现偏差。|P1（补齐 workspace↔canvas 映射后）|
|Workflow 进入与返回|A/B：双击/Enter 后标题切到选中 workflow；“返回”恢复来源 worksite。A 截图：[进入](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/demo1-workflow-open-20260929.png)。|生产卡没有合法目标 canvas，所以本轮不能通过 hand entry 完成 child enter/return。另有已保存的真实动作证据：此前“用于当前会话”只将卡片加入未发送草稿并显示单实例 Composer，截图：[取用草稿](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/workflow-take-draft-composer-20260929.png)；这不是进入 Workflow，也未发送。`WorkflowCardPool.tsx:216–226` 只有 resolution ready 才调用 child navigation；`beginChildWorksiteNavigation.ts:41–44` 再次拒绝无 `canvasId`。|**实测范围受数据阻塞**。草稿取用通过不等于现场进入；不可用入口不应被绕开或用手工 query 注入假 route。|P1（目标 canvas 就绪后）|
|返回来源现场|A 的 Context/Workflow 子页各有明确返回；B 通过全局 worksite 导航回 Main/Context。|源码 `navigation/returnToSourceWorksite.ts:10+` 实现来源恢复；但本次没有进入有效 child，因此**未实测 child 的返回来源动作**。根 Context 的 route 切换不代替该测试。|**仅缺实测**，不是已通过。|P2|

## Core / 数据事实与边界

- `GET /lcos-core/projects/lcos-gen2-dev/workspaces` 返回 200。三个根 workspace（Main、Context、Workflow）各有 canvas；三个 child workspace 均没有 `canvasId`。Context 候选 `workspace-workflow-e38c0c595d4f` 与 Workflow 候选 `workspace-workflow-8df4c3041532` 因此无法进入。`GET /graph` 显示该项目是 e2e fixture，root scope 下含名为“真实工作流导入验收”的 child scope。截图与界面数据均是隔离验收 fixture，不是生产项目或 live provider 结果。
- `TemporalRail` UI、TemporalIndex API 和 rail 的 `onActivate/onPreviewChange` 不等价于完整用户链路。只有合法 child workspace + canvas、真实事件、实页定位与返回，才能记为端到端完成。
- 原型 B 实际 `<video>` 元素数为 0；文件名含 ThreeVideo 不代表本页有可播放视频。A/B 的渐变卡片、九条示例时间事件、假 collection/workflow 均只验证交互结构。
- 本轮只做浏览器观察和源码只读核对；未修改任何源码、Core、fixture，也未发送任何草稿。没有运行测试；Core 单测不构成上述实页链路证明。

## 更正记录

此前《Context / Workflow / Glyth 实页链路复核》把根 `/context` source fixture 误记成独立 child，把搜索错误 checkout `apps/web-gen2/src` 后的“找不到 TemporalRail”误记成 UI 不可达。现在更正：真实生产源码路径是本表给出的 `huabu/apps/web/src`；TemporalRail 存在且只在 child route 挂载。本次真正阻塞是 fixture child workspace 缺 `canvasId`。旧截图 `context-child-open-20260929.png` 不再作为 child/rail 证据。

## 收尾顺序

1. 先由 Core/fixture owner 为需要验证的 Context 与 Workflow child workspace 提供合法 canvas 映射及至少一条真实 temporal event；保持入口的身份校验。
2. 再在 5286 实测 Context Atlas 聚焦→进入→TemporalRail hover/定位→返回来源，以及 Workflow 手牌 preview→进入→返回；对缺映射仍验证清晰反馈，但不要假造可进入状态。
3. 另行评审原型组织与聚焦语义、Workflow 卡池与预览深度差异；该工作不由这份实测报告宣称已修。
