# Context / Workflow / Glyth 实页链路复核（更正，2026-09-29）

复用 `decision-excerpt` 浏览器和现有 `http://127.0.0.1:5286`，未重启服务、注入 fixture 状态或发送草稿。此前 Context 判断搜索错 checkout、把根 `/context` 当成 child；已撤回对应结论。完整原型/生产截图与对照见[《Context / Workflow 原型与生产偏差核查》](./Context_Workflow_原型与生产偏差核查_20260929.md)。

| 链路 | 实页行为与证据 | 状态 |
|---|---|---|
| Context → Atlas → child | 正确生产页 `/projects/lcos-gen2-dev/context` 可打开集合总览，显示 6 collections。候选“Context · 理解现场”显示“现场画布尚未就绪”；点击该项后页面仍是根 `/context`，没有形成 child `?workspaceId=` route。截图：[生产 Atlas](./production-context-atlas-20260929.png)、[返回根 Context](./production-context-child-unavailable-20260929.png)。Core workspace 响应中的 `workspace-workflow-e38c0c595d4f` 没有 `canvasId`。此前 `context-child-open-20260929.png` 是根 Context source fixture，不能证明进入 child，撤回旧描述。 | Atlas 入口实测通过；child 导航因合法目标无 canvas 而未能实测，不判成 UI 实现偏差。 |
| Context child → TemporalRail → 定位 → 返回 | 生产源码在 `E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/TemporalRail.tsx`。`ContextWorksite.tsx:125` 仅在 `isChildWorksite` 下挂载；激活/预览分别接定位与预览回调。此前对 `apps/web-gen2/src` 的搜索路径错误，导致误报“没找到 TemporalRail”；更正为 TemporalRail 确实存在。当前 Core fixture 没有可进入 child canvas，所以实际 rail、定位与返回来源尚未形成可验证路径。 | 仅缺真实数据与实测；不属于已通过，也不是组件不存在。 |
| Workflow → 手牌 → 预览/取用 | Main 上可唤出 Workflow 手牌，真实验收卡“真实工作流导入验收”当前显示“该 Workflow 现场尚未就绪”；截图：[生产手牌](./production-workflow-hand-open-20260929.png)。已有取用证据：[草稿 Composer](./workflow-take-draft-composer-20260929.png)：卡片加入未发送草稿，Composer 单实例显示；未发送。Workflow 目标 `workspace-workflow-8df4c3041532` 缺 `canvasId`。`WorkflowCardPool.tsx:211–219,262–263` 将 preview 与 enter 分开，且不可用目标禁用。 | 手牌入口与草稿取用有实页证据；真实 workflow 进入因目标 canvas 缺失未能实测。取用不等于进入。 |
| Workflow → child → 返回 | 当前目标不可进入，因此这轮不能证明 child route 和来源返回。Root Workflow surface 是独立根现场，不是该工作流 child。 | 未实测，待真实目标映射。 |
| Glyth 状态 → 会话入口 | Context 画布中 Glyth 可访问名称显示“正在思考”；双击打开唯一会话窗口，标题“承接会话（e2e fixture）”，状态“正在理解”。窗口列出两条 `Wave7 real Run receipt probe` 记录，但提示“当前会话没有已绑定且可发送的续工 owner”，“继续当前会话”禁用。该证据仍是 e2e fixture，不是 live provider 反馈。 | 状态与唯一会话窗口可进入；续工发送不可用；真实 provider 行为未验证。 |

**边界**：UI 对不可进入目标的门控符合实际数据，不将其推为功能偏差；TemporalRail/API/单测不能代替真正 child→rail→return 的浏览器链路。Core workspace 响应显示三个根 workspace 有 canvas，三个 child workspace 均无 canvasId。缺少映射时不手工注入 query 或新建假状态。详情及原型 A/B 交互截图参见上面的全量对照报告。
