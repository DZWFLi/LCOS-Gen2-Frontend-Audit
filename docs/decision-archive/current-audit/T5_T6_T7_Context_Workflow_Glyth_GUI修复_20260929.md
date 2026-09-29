# T5 / T6 / T7：Context、Workflow、Glyth GUI 修复

日期：2026-09-29  
代码：`E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src`  
范围：只改 Context / Workflow 视图与 UI；未操作浏览器、Core、Collection 主节点或 Shell owner；未提交。

## 对照依据

- T5 正本：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T5\LCOS_Gen2_T5_ContextWorkflow交互专项_前端施工正本_V3_20260910.md`。§6 要求 Context 用时间/性质组织投影、body 显示少量状态和内容；§6.5 将 focus 和 open 分开；§9.3 要求 Workflow 单击轻预览、双击/Enter 按实际 topology 解析进入；§10 要求卡池搜索、filter、recent，pinned/frequent 标为 future。
- T7 正本：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T7\GEN2_T7_Glyth续工_AgentAdapter源码蓝图施工正本_V2_20260911.md`。§12.2 说明 Figma Page 11–12 是续工与运行状态视觉表达，不能从示例背景推断新 UI owner 或真实能力；typed read model、真实 capability/receipt 决定行为。
- Figma 采用清单 `E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\Figma全量逐项目录.md`：Context 特殊视图取 Page 06/07（含 `5388:21602`、`5388:24294`）；Workflow 手牌轻预览取 `5140:3012/4300` 与 B03 `5344:752`；Glyth 延续 Page 06/07 的实体与真实画布语义，不以 Page 11–12 背景覆盖。
- 复核 `E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\Context_Workflow_原型与生产偏差核查_20260929.md` 及 `Gen1_T5-T7_交叉对账_20260929.md` 中先前标记的真实差异。

## 本次改动

**Context**：[`ContextAtlasStage.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx:53) 将卡片激活改为仅选中/聚焦；聚焦态单独可见，提示用户再用卡片动作“定位”或“进入”子现场。没有 canvas 时仅禁用“进入”动作并保留具体原因，卡片仍能聚焦。Main 的集合总览仍有新建集合；Context 明确称“项目总览”，不混成集合管理器。卡片证据行只使用 Warehouse 已有的 relationHint、provenance 和 updatedAt；没有字段时不补造。

[`ContextCollectionView.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/ContextCollectionView.tsx:51) 将 Atlas 的选中态与当前现场身份分开表达；[`ContextAtlasView.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/ContextAtlasView.tsx:20) 接受对应视图的可访问名称。现有 `TemporalRail` 仍只由 child worksite 挂载；本次不改变它和 route owner。

**Workflow**：[`WorkflowCardPool.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/workflow/WorkflowCardPool.tsx:41) 只把真实 Warehouse 的来源、使用次数、更新时间、关系数送入预览。搜索仍走现有本地搜索与卡池，不创建第二份实体或排序 owner。[`WorkflowTaskCardView.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/workflow/WorkflowTaskCardView.tsx:115) 的轻预览现在先给身份与真实摘要，再给两个清晰动作：加入当前草稿、打开工作流现场；取用不会发送或伪装成进入。移除不可用的“续接原会话”假按钮。手牌搜索布局把卡片区向上收紧，减少搜索框与手牌之间的空档，见 [`workflow-hand.css`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/workflow/workflow-hand.css:105)。

**Glyth**：源码核对后未新增窗口或卡片。[`GlythNodeBody.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx:61) 继续从 Collaboration read projection 映射状态机和状态标签；双击/Enter 打开既有 conversation Professional window；该 window 通过 [`ConversationWorkViewBody.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx:293) 复用 Assembly action。Glyth Assembly 投放与 Composer 引用也仍复用现有 drop/Composer owner。T7 §12.2 明确禁止从 Figma 背景再推一个并行 owner，因此本次保留现状；provider、多模态与外部续工闭环仍按原审计记录，不扩大成“全完成”。

## 还没闭环的点

- 当前 `WarehouseItemV1` 没有 T5 §6 所需的 Context 性质组织字段或稳定时间分组投影，`buildAtlasGroups` 因而仍是单一未分类列表。本次不把 kind 或 updatedAt 冒充事情/性质分组，也不在产品界面放“待数据支持”提示。真正的组织轴要等真实 read model / producer 字段。
- Workflow 卡池已有搜索，但 filter、recent 入口尚未接入；T5 的 pinned/frequent 本来就是 future。目标 child workspace 缺 canvas 时，进入/返回链仍被真实能力门控；本次没有注入 fixture，也没有浏览器验收。
- Context 的 child 时间轨/定位/返回与 Glyth 多 provider、多模态状态没有在本次无浏览器批次中复测。Core 或 caller 存在不计作 GUI 实测。

## 验证

- `vitest` 定向 4 个文件：18/18 通过（Context Atlas semantics/request、Workflow CardPool、Workflow collection wiring）。
- `tsc --noEmit`：通过。
- 未跑浏览器和全量测试；本次任务明确要求不操作浏览器。

## 实页审计追修：Atlas 形态与 Huabu 命令栏

收到审计指出“Context 的 scene/context/collection 被套成同一文件夹脸”及“Context 仍出现 Huabu W/Font 条”。已沿生产入口核过调用，而不是从画面猜 `chromeMode`：`LcosWorksiteStage.tsx:186` 明确给 `CanvasHostBoundary` 传 `chromeMode="lcos"`；Boundary 默认也为 `lcos`。`Canvas.tsx:1816-1850` 在该模式下不挂 Huabu 全局 NodeToolbar、EdgeStyleToolbar、Controls/MiniMap，并改挂 host spatial navigator。`NodeWrapper.tsx:665` 按 `chromeMode + node type + 实际 host presentation` 决定是否停挂单节点原生工具条。

W/Font 残留有一个真实例外：Core-bound、已有 LCOS 物种呈现的对象已走 [`shouldStandDownLegacyNodeToolbar`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos-seam/chromeModeSlot.tsx:52) 和既有 Action Arc；未绑定自由文本没有 canonical ref，当前 Arc 不接管，Font 也没有现存替代命令。为消掉其 Huabu 实色卡片感而不误删 W/Font 能力，这些未覆盖命令继续沿原 command caller，只给其 `CanvasFloatingPopover` 套 LCOS 玻璃近场外观；多选同样由既有 `LcosMultiSelectToolbar` 传入 LCOS presentation，底层几何、格式、删除、移动 owner 不换。单节点路径见 [`NodeWrapper.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/components/Nodes/NodeWrapper.tsx:708)、[`NodeFloatingToolbar.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/components/Panels/Canvas/FloatingToolbars/NodeFloatingToolbar.tsx:242)；多选路径见 [`LcosMultiSelectToolbar.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosMultiSelectToolbar.tsx:122)。本次没有碰 `LcosActionArc`，也没有把无身份节点冒充成受管节点。若真实 DOM 上仍看到旧实色条，需要优先确认选中项确为 unbound/free text；这条命令目前没有可安全隐藏的 LCOS owner。

Atlas 卡面现在读取 canonical `item.kind` 选择现有面组件的 `atlasVisualKind`：collection 保留叠片文件夹；scene/workspace 改为单面现场窗格；context 改为上下文证据轮廓/类别 glyph，并继续显示只有 read model 实际提供的关系数、来源和更新时间。没有 `previewRef` 时不挂 `PreviewMedia`，也不画两个白色“暂无预览”纸片。轻量 glyph 表示类别，不声称存在具体关系边、成员或时间事件。实现入口见 [`ContextAtlasStage.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx:143)、[`ContextCollectionFace.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/ContextCollectionFace.tsx:45)、[`context-spatial.css`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/context-spatial.css:32)。

本次增量验证：Context kind/空预览和 chromeMode/多选命令相关定向 Vitest 4 文件、19/19 通过；`tsc --noEmit` exit 0。无浏览器复验，故报告源码 caller 与窄测试证据，不声称实页截图验收。
