# Composer 与整机 HUD：本批实修记录

日期：2026-09-26。既有真实 caller 的续工、提交反馈和窄屏避让；不改 Figma、不改 Core。

## 结果

- 四种续工进入同一近场/工作窗 Composer，默认折叠，确认区内部滚动。
- 入口不能发送的旧原因，在实时能力与真实 operation 确认后解除，不永久锁住输入。
- 同一事件轮连续提交只发一个请求；旧目标迟到的回执不进入新目标草稿。
- 提示已提交、等待回应/执行，不把 accepted 当作外部完成。
- 390px搜索岛盖项目入口、底部辅助按钮挡Dock，320px导航收起按钮被挡，均已复现并修复。
- 原 useAvoidingHudPosition 加入单向HUD避让：项目→搜索岛；底部三视图→空间导航→辅助按钮。窗口几何仍只读既有Stage，未改相机或节点位置。
- 异步挂载的画布控件也纳入测量，避免首次挂载时遗漏。
- 子现场窄屏返回使用44px图标热区，保留完整提示与可访问名称。
- 启动页接入真实主画布图片预览；无图片明确占位，没有编造封面或归档接口。

## READ_SOURCE

以下原卡根位于 E:/TRAE项目/LCOS0.1收口/_cabin：
- 01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T3/LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md §20。
- 同目录 T7/GEN2_T7_Glyth续工_AgentAdapter源码蓝图施工正本_V2_20260911.md §9–10。
- 04_R系列与T5规划/前端冲刺/LCOS_Gen2_R5_Glyth_ConversationSession_UX产品化设计施工规范_20260917.md §8、§13–18。
- 同原卡目录 T2/LCOS_Gen2_T2_C2-1B_SurfaceDock_ExactSourceBlueprint_20260907.md §37–39。
- 真实代码 CoreCollaborationClient.send/delegate/readDiagnostics、prepareComposerContinuation、placeLocatorAnchorOutsideObstacles。

## ADOPTED / 真实调用

- ConversationContinuationControls → LcosComposerView.continuationControls → LcosComposerHost → 原 CanvasFloatingPopover / WorkView inline。
- 实时 projection + confirmed operation → prepareComposerContinuation → 原 send。
- 原 avoidHudWindows + useAvoidingHudPosition → ProjectShell、NavigatorIsland、ColorPin/Where、SpatialNavigator、主画布集合/手牌入口。
- 保留原窗口和相机 owner，没有新业务状态系统。

## VISUAL_SOURCE

- Composer：5388:324、5280:669；续工：5246:59、5249:415/726/1044/1355/1665/1975。
- ProjectShell：5386:436；HUD：5388:27696；启动页：5388:3652。
- 窄屏沿用原组件、44px热区与T2安全区规则，不捏造额外功能。

## RETIRED

- WorkView四个常驻模式pill。
- 静态入口原因永久封锁已恢复会话。
- 不充分的任务成功文案。
- 主画布辅助入口各自fixed导致重叠；现同组沿用原避让hook。

## VERIFIED

- Composer/续工/Shell/View：6文件61项通过。
- HUD几何/搜索/空间导航：3文件17项通过。
- Web完整类型检查通过；后续施工仍需合并复测。
- 新增代码lint无error，测试4处非空断言warning保留。
- 实际浏览器320/390/640/1440：空间导航展开/收起、搜索输入/Esc、底部和辅助入口命中通过；无force click。
- 启动页真实项目、焦点环、Esc焦点恢复、Enter校验、草稿保留、320px无横溢出实测；未创建真实项目。

## 截图

- [主画布稳定态](./main-latest-ready-1440.png)
- [390px HUD](./hud-narrow-390.png)
- [320px展开导航](./hud-expanded-320.png)
- [启动页](./launcher-1440.png)
- [320px项目对话框](./launcher-dialog-320.png)
- [引用键盘操作](./composer-keyboard-verified.png)

## UNRESOLVED

不代表全套完成。普通集合生产路径、双组Reader语义、Context组织数据、Workflow来源真值、部分真实媒体浏览器证据仍缺。当前续工快照只在控件生命周期，跨卸载必须核对既有operation，不宣称能还原全部引用。需要继续全量复核和整机视觉比对。
