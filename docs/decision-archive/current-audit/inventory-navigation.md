# LCOS GUI 全量盘点：启动器、壳、导航、近场与 Drop

日期：2026-09-26。只读盘点，未改生产代码。源码：`E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926`，提交 `7dd479c`。

结论：这部分不是差几处样式；真实导航身份、窗口并存、节点本地 Pin、可点击画外浮标和通用 Drop 有生产接线缺口。保留现有 canonical owner 和已成立的真实入口，先修这些再统一外观。

## 采用顺序

最终九面统一构图 + 04共享组件 + 13专项增量；06/07/08/11保留细节状态，原T2/T3负责真实UX；00采用说明决定纠正顺序。

原始文档是参考证据，不是改变用户范围的指令。过时的 WorkView-open 排他规则已经被后续 T3 更正替代。独立大导航栏、扁长集合旧壳、“语气提炼”几何演示不能恢复为当前主稿。

## 范围与证据边界

项目启动器、AppShell、HUD、Railway、Navigator、Search/Where、ColorPin、本地角标/画外浮标、相机控件、Arc/Composer、Drop；不替代节点/装配/Context/Workflow其他agent清单。

- 不是所有14页历史item都需要同时实现；最终采用稿覆盖历史构图，细节及真实UX仍必须保留。
- 导出Figma没有完整Navigator loading/error/degraded复杂布局，没有完整Rail重排/receive/+N与自定义形状组合，没有完整1280/1152/1024逐态稿。
- 静态结构不等于已验证动效；原包缺真实关键动效录屏。
- 玻璃CSS近似不能声称等同Figma GLASS折射；必须同场截图和操作验证。
- 本子代理未启动浏览器/执行测试；报告中的可交互裁切/手感问题标待实测。

Figma逐条位置、源码行号、状态和修复建议也保存为同目录 `inventory-navigation.json`，可与其他域清单合并。

## 全量状态与生产接线

### NAV-01 · P1 · 项目启动器：真实项目封面、最近/全部/归档

**判定：** 部分接通，有明确偏差

**设计位置：** [5388:3652](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-3652) 统一主稿 / 项目启动；[5122:1806](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-1806) 18 / 项目 · 最近现场；[5046:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-49) 01 / 首次打开；[5046:50](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-50) 02 / 项目库与归档

**应覆盖状态：** 读取中、空项目库、正常列表、搜索结果、无结果、最近、全部、归档、长标题、读取失败/重试、进入项目

**真实调用链：** LcosProjectLauncherPage → projects facade → project route

**源码：** [LcosProjectLauncherPage.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/app/LcosProjectLauncherPage.tsx:142)；[LcosProjectLauncherPage.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/app/LcosProjectLauncherPage.tsx:266)

**缺项/偏差：**

- 封面始终由 coverTone 生成渐变，没有接真实项目缩略图；这属于诚实占位但不是设计落地。
- 仅最近/全部，没有已设计的归档入口；后端归档能力必须核实，不能为补图伪造。
- 工程措辞、磁盘路径压过项目内容；信息密度和封面比例未统一到最终稿。

**保留：** 保留真实项目列表、创建/打开、出错保留输入和已有过滤。

**建议修改：** app/LcosProjectLauncherPage.tsx、项目已有封面读取适配处

**必要验证：** 真实3/20/100项目、长中文名与缺封面；失败重试及空结果；1440/1280/1152/1024双列/三列

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-02 · P1 · 项目创建/打开、键盘与焦点

**判定：** 部分接通，有明确偏差

**设计位置：** [5388:3652](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-3652) 统一主稿 / 项目启动；[5046:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-49) 01 / 首次打开；[5046:72](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-72) 24 / 空态与失败恢复

**应覆盖状态：** 创建弹窗、打开目录、提交中、路径/名称错误、取消、焦点、disabled、recovery

**真实调用链：** Launcher → manual role=dialog → create/open

**源码：** [LcosProjectLauncherPage.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/app/LcosProjectLauncherPage.tsx:248)；[LcosProjectLauncherPage.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/app/LcosProjectLauncherPage.tsx:273)；[LcosProjectLauncherPage.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/app/LcosProjectLauncherPage.tsx:316)

**缺项/偏差：**

- 搜索和项目按钮 outline-none 缺可见替代焦点。
- 手写模态只设置 aria-modal，未实现焦点锁定/返回、Esc、背景 inert；420px固定宽在小屏溢出。
- 输入并非提交表单，Enter 行为不完整。

**保留：** 保留提交失败草稿、pending 禁用和真实错误；复用已有成熟Dialog。

**建议修改：** app/LcosProjectLauncherPage.tsx

**必要验证：** Tab/ShiftTab/Esc/Enter完整一轮；关闭返回触发按钮；320/375宽及200%缩放；失败后字段不丢

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-03 · P1 · 主画布/上下文/工作流共享壳与材质

**判定：** 部分接通，有明确偏差

**设计位置：** [5388:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-96) 统一主稿 / 主画布；[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696) 统一主稿 / 全局导航与画外定位；[5386:211](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-211)；[5386:286](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-286)；[5386:361](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-361)；[5235:50](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5235-50) A · 通透液态玻璃

**应覆盖状态：** 主画布、上下文、工作流、场景切换、空场景、加载/错误、悬浮窗并存、不同屏幕宽度

**真实调用链：** LcosProjectRoute → LcosProjectShell → LcosGlobalHud + SurfaceDock + canvas seam

**源码：** [LcosProjectRoute.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/app/LcosProjectRoute.tsx:69)；[LcosProjectShell.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosProjectShell.tsx:290)；[LcosGlobalHud.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosGlobalHud.tsx:33)

**缺项/偏差：**

- 最终稿玻璃层级已有部分token，但项目簇 top6/left6 与最终24外边距不统一。
- 项目名/子现场标题缺碰撞约束，顶部导航可能和长标题重叠。
- 不能以 data-figma 已出现认定全稿落地；应对照实际生产画面。

**保留：** 保留单ProjectShell、单ReactFlow相机、真实SurfaceDock三面切换与实体owner。

**建议修改：** shell/LcosProjectShell.tsx、shell/LcosGlobalHud.tsx、ui/lcos-tokens.css、ui/lcosTokens.ts

**必要验证：** 三面相同HUD对比图；长项目名+搜索展开+工作窗；玻璃层级在白画布/密集图像上均清楚

**补证：** 材质透光、阴影、尺寸必须1440生产截图与Figma同场对照。

### NAV-04 · P1 · HUD缩放、resize、窗口避让

**判定：** 部分接通，有明确偏差

**设计位置：** [5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696) 统一主稿 / 全局导航与画外定位；[5386:211](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-211)；[5051:3599](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5051-3599) 28 / 多窗口与画布拾取；[5051:3776](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5051-3776) 29 / 窗口停靠与恢复

**应覆盖状态：** resize、浏览器缩放、自由窗口、贴边窗口、左右停靠、底部操作区、窄屏

**真实调用链：** Hud consumers → lcosHudPlacement → current safeRect

**源码：** [LcosNavigatorIsland.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosNavigatorIsland.tsx:198)；[LcosRailway.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosRailway.tsx:688)；[LcosSurfaceDock.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosSurfaceDock.tsx:45)；[ColorPinHud.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/pin/ColorPinHud.tsx:190)；[LcosFocusWhere.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosFocusWhere.tsx:219)

**缺项/偏差：**

- 多个caller渲染时直接读window尺寸，无尺寸订阅；只resize不触发React更新时坐标陈旧。
- FocusWhere固定left50%，不沿相同safe center。
- safeRect只处理边缘占位，浮窗障碍与多个HUD的互让不足。

**保留：** 保留已有safeRect和窗口owner；仅统一响应式viewport投影，不建新相机或Window系统。

**建议修改：** shell/lcosHudPlacement.ts、shell/LcosSurfaceDock.tsx、shell/LcosRailway.tsx、navigation/LcosNavigatorIsland.tsx、navigation/LcosFocusWhere.tsx、pin/ColorPinHud.tsx

**必要验证：** 1440→1024→1440不刷新；顶部/左侧/底部停靠组合；打开/resize窗口不移动相机；按钮始终可见可点

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-05 · P2 · 底部常驻三视图 Dock

**判定：** 部分接通，有明确偏差

**设计位置：** [5386:211](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-211)；[5386:286](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-286)；[5386:361](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-361)；[5137:61](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5137-61) 图标控制 / 主画布；[5137:81](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5137-81) 图标控制 / 上下文；[5137:99](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5137-99) 图标控制 / 工作流

**应覆盖状态：** 主画布active、上下文active、工作流active、hover提示、keyboard focus、停靠避让

**真实调用链：** LcosProjectShell → LcosSurfaceDock → activeSurface

**源码：** [LcosSurfaceDock.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosSurfaceDock.tsx:45)

**缺项/偏差：**

- 真实三面按钮已挂载，应保留；与上方项目簇和左Rail视觉统一还需同场验收。
- 随viewport更新和避让与NAV-04共同修。

**保留：** 三面是常驻Dock，不能重新塞进Rail或做文字Tab。

**建议修改：** shell/LcosSurfaceDock.tsx、ui/families/LcosSurfaceDockView.tsx

**必要验证：** 切三面返回保持各自已有现场状态；hover/focus中文提示；窄屏不被窗/浏览器边缘遮挡

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-06 · P1 · 灵动岛：静息、按Pin增长、搜索展开

**判定：** 部分接通，有明确偏差

**设计位置：** [5384:247](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-247)；[5384:306](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-306)；[5384:366](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-366)；[5139:1571](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5139-1571) 02 · 同体导航 / 搜索与彩色标

**应覆盖状态：** 无Pin52×48、一个/多个Pin、搜索402×48、折叠、Pin溢出、hover、pressed、focus、disabled、loading、error、degraded、selected

**真实调用链：** ColorPinHud → LcosNavigatorIsland → LcosNavigatorIslandView

**源码：** [ColorPinHud.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/pin/ColorPinHud.tsx:207)；[LcosNavigatorIslandView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/LcosNavigatorIslandView.tsx:82)；[LcosNavigatorIslandView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/LcosNavigatorIslandView.tsx:93)

**缺项/偏差：**

- onCreatePin始终传入，静息也显示+，实际不是单52px搜索键。
- pins全量map且横向滚动藏滚动条，没有明确的溢出呈现。
- container只用搜索/彩色标/静息三态，loading/error/degraded族没接状态。
- 宽度随内容跳变，缺收拢/增长的连续运动。

**保留：** 保留已接真实Pin颜色/成员数；创建Pin仍由Arc/上下文菜单或显式管理入口，不永久扩大静息HUD。

**建议修改：** pin/ColorPinHud.tsx、navigation/LcosNavigatorIsland.tsx、ui/families/LcosNavigatorIslandView.tsx、ui/families/lcos-families.css

**必要验证：** 0/1/3/20 Pin宽度；搜索输入不被pin挤没；加载/失败真实状态；reduced-motion；Tab全操作

**补证：** Figma已有11variant但loading/error/degraded详细构图及大量Pin溢出精确形态未完整；不能编造为已冻结。

### NAV-07 · P1 · 搜索→位置解析→子现场/多投影

**判定：** 部分接通，有明确偏差

**设计位置：** [5046:57](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-57) 09 / 搜索与定位；[5101:590](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-590) 05 / 搜索 · 同体展开；[5139:1571](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5139-1571) 02 · 同体导航 / 搜索与彩色标

**应覆盖状态：** 空查询、加载、命中本地、命中远端、多个occurrence、子现场、无位置、不可访问、过期结果、失败重试

**真实调用链：** Navigator → project search → legacy locationRefs → switchWorksite → waitForProjectedEntity

**源码：** [LcosNavigatorIsland.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosNavigatorIsland.tsx:165)；[LcosNavigatorIsland.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosNavigatorIsland.tsx:286)

**缺项/偏差：**

- 使用locationRefs[0]而不是T2要求的完整occurrence resolver；旧摘要最多5处不是完整候选。
- 远端选择只保留surface，丢workspace/child identity；switchWorksite到根面，目标可能不在其内。
- 没有继续加载入口，limit12可能静默截断结果。

**保留：** 保留search facade和当前投影定位；完整occurrence应复用现有bindings/workspaces，不造另一索引owner。

**建议修改：** navigation/LcosNavigatorIsland.tsx、navigation/LcosFocusWhere.tsx、现有导航resolve helper

**必要验证：** 同实体在两个子现场；同surface不同workspace；>5位置；不存在/权限变更；旧查询响应晚于新查询

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-08 · P1 · 搜索键盘和局部查找归属

**判定：** 部分接通，有明确偏差

**设计位置：** [5384:366](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-366)；[5295:2982](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5295-2982) N01 / 窄屏 · Composer；[5304:3646](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5304-3646) N07 / 键盘焦点 · 发送

**应覆盖状态：** Ctrl/Cmd+F、输入中文、方向键候选、Enter、Esc、结果焦点、读源局部搜索

**真实调用链：** Navigator window keydown + result buttons

**源码：** [LcosNavigatorIsland.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosNavigatorIsland.tsx:64)；[LcosNavigatorIsland.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosNavigatorIsland.tsx:70)

**缺项/偏差：**

- 全局CtrlF直接preventDefault，会抢阅读器/编辑器本地查找。
- 结果无方向键active/Enter路径和combobox语义。
- Esc window handler独立关闭，缺统一顶层退出调度。

**保留：** 键盘映射只接已存在命令，保留IME组合输入与Tab。

**建议修改：** navigation/LcosNavigatorIsland.tsx、ui/families/LcosNavigatorIslandView.tsx、现有Escape/interaction调度点

**必要验证：** 阅读器CtrlF不触发全局；IME Enter不误选；ArrowDown/Up/Enter；Esc只退出当前层

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-09 · P1 · 已知对象的在哪里/聚焦

**判定：** 部分接通，有明确偏差

**设计位置：** [5101:724](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-724) 06 / 定位 · 屏边指路；[5153:774](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-774) 07 · 定位 / 屏边目标；[5164:831](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5164-831) 13 · 定位完成 / 同一候选对象

**应覆盖状态：** 当前投影、同场多个投影、其他根面、子现场、无空间位置、loading/error、返回发起处

**真实调用链：** LcosFocusWhere → bindings → goToOccurrence → requestLocate

**源码：** [LcosFocusWhere.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosFocusWhere.tsx:132)；[LcosFocusWhere.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosFocusWhere.tsx:219)

**缺项/偏差：**

- binding.canvasId只与三根canvas映射，子现场变unknown且disabled。
- 候选行缺exact spatialId/canvasId传递，定位可能选任意投影。
- 界面是独立大列表浮层，未与灵动岛单物理槽融合。

**保留：** 保留真实Core bindings与无法定位的诚实说明；Where不能猜一个坐标。

**建议修改：** navigation/LcosFocusWhere.tsx、navigation/LcosNavigatorIsland.tsx、shell/LcosGlobalHud.tsx

**必要验证：** 双投影明确选中一处；子现场进入后再相机定位；无投影不造节点；Focus不擅自改Selection

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-10 · P1 · Search/Where/Pin同槽和Esc栈

**判定：** 部分接通，有明确偏差

**设计位置：** [5384:367](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-367) 统一 / NavigatorIsland；[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696) 统一主稿 / 全局导航与画外定位；[5139:1571](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5139-1571) 02 · 同体导航 / 搜索与彩色标；[5187:683](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-683) 05 · 对象菜单与键盘退出

**应覆盖状态：** none、search、focus/where、pin、嵌套more、返回上一层

**真实调用链：** GlobalHud simultaneously mounts separate Navigator,Where,Pin local state

**源码：** [LcosGlobalHud.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosGlobalHud.tsx:71)；[LcosNavigatorIsland.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosNavigatorIsland.tsx:70)；[LcosFocusWhere.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosFocusWhere.tsx:214)

**缺项/偏差：**

- 三套独立open和window keydown可能同时出现并同一次Esc全部关闭。
- T2允许none/search/focus/pin纯呈现仲裁，当前未体现；不需要第二套业务状态。
- Composer的document stopPropagation能阻断部分window handler，但不等于全局顶层栈已成立。

**保留：** 语义数据各留原provider，只增加单槽呈现互斥/退出路由。

**建议修改：** shell/LcosGlobalHud.tsx、navigation/LcosNavigatorIsland.tsx、navigation/LcosFocusWhere.tsx、pin/ColorPinHud.tsx

**必要验证：** 先搜索再Pin再Where只有一槽；逐层Esc；关搜索保留selection/窗口；焦点返回发起按钮

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-11 · P1 · ColorPin分组、节点本地角标、身份连续

**判定：** 部分接通，有明确偏差

**设计位置：** [5101:456](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-456) 04 / 颜色组 · 同体导航；[5153:540](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-540) 06 · 彩色标 / 对象对应；[5204:13457](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-13457) 07 · 集合身份 · 图标颜色与外形；[5384:306](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-306)

**应覆盖状态：** 创建/命名、选择颜色、加入/移出、多Pin对象、无成员、成员失效、本地角标、远端定位

**真实调用链：** ColorPinProvider canonical memberships → ColorPinHud；node mark消费链缺失

**源码：** [LcosColorPinProvider.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/pin/LcosColorPinProvider.tsx:294)；[ColorPinHud.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/pin/ColorPinHud.tsx:120)；[LcosNavigatorIslandView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/LcosNavigatorIslandView.tsx:89)

**缺项/偏差：**

- membershipsByTargetKey仅用于Pin弹层；FigmaPinMark只用于顶栏，画布节点没有消费membership的本地角标。
- 成员列表主要是文字前往/移除，没有内容预览和跨对象身份连续。
- Pin≠节点类型图标≠浮标；当前三者没有形成对应关系。

**保留：** 保留Core颜色组/成员关系；节点角标为binding+membership派生，不能把pinColors存进node.data。

**建议修改：** pin/ColorPinHud.tsx、pin/LcosColorPinProvider.tsx、现有节点overlay/seam、ui/FigmaShellGlyph.tsx

**必要验证：** 一个节点多Pin；同实体多投影都一致；取消Pin不删实体；缩放LOD与角标可读；无权限成员显示真实状态

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-12 · P1 · 画外动态浮标：出现、变形、点击直达、到达

**判定：** 部分接通，有明确偏差

**设计位置：** [5101:724](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-724) 06 / 定位 · 屏边指路；[5153:774](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-774) 07 · 定位 / 屏边目标；[5164:831](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5164-831) 13 · 定位完成 / 同一候选对象；[5204:14182](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-14182) 10 · 导航岛 · 搜索与定位连续态

**应覆盖状态：** LOCAL、NEAR_EDGE、EDGE、TRAVELLING、ARRIVING、HIDDEN、UNAVAILABLE、reduced-motion

**真实调用链：** LcosCanvasCommands → LcosLocatorCue → computeLocatorGeometry

**源码：** [LcosCanvasCommands.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosCanvasCommands.tsx:455)；[LcosCanvasCommands.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosCanvasCommands.tsx:578)

**缺项/偏差：**

- 只有已有locate request/arrivalTarget才有target，缺用户可主动点击的持续目标浮标。
- pointer-events-none，用户不能点击浮标直达。
- 黑色文字胶囊+CSS三角，缺本地角标到边缘的同身份变形；local分支直接隐藏。
- 到达用统一圆角矩形，未贴目标轮廓/场域。

**保留：** 保留computeLocatorGeometry、safeRect、相机promise完成才arrival、用户手势取消；不新增相机owner。

**建议修改：** navigation/LcosCanvasCommands.tsx、navigation/locatorGeometry.ts、pin本地角标投影、ui/FigmaShellGlyph.tsx

**必要验证：** 本地→近边→画外连续拖相机；四边/四角/超大目标；点击仅一次飞行；中途手势取消；窗口resize只重算浮标；到达不改对象语义

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-13 · P1 · 相机胶囊、适配视野、100%与减弱运动

**判定：** 部分接通，有明确偏差

**设计位置：** [5386:274](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-274)；[5191:1292](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5191-1292) 14 · 地图与视口定位；[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696) 统一主稿 / 全局导航与画外定位

**应覆盖状态：** 折叠、展开、放大、缩小、100%、适配内容、网格、锁定、小地图开关

**真实调用链：** LcosSpatialNavigator → requestCamera → LcosCanvasCommands → existingReactFlow

**源码：** [LcosSpatialNavigator.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosSpatialNavigator.tsx:24)；[LcosCanvasCommands.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosCanvasCommands.tsx:223)；[LcosCanvasCommands.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosCanvasCommands.tsx:236)

**缺项/偏差：**

- 100%直接setViewport(0,0,1)跳回世界原点，远处工作失去当前中心。
- fit使用固定HUD_INSETS而非当前工作窗安全区。
- 普通zoom/reset/fit时长未服从reduced-motion，独立locate路径已有处理。

**保留：** 保留统一ReactFlow相机与真实grid/lock/minimap开关；本项不扩展审Pass4 MiniMap内部。

**建议修改：** navigation/LcosCanvasCommands.tsx、navigation/LcosSpatialNavigator.tsx、ui/families/LcosSpatialNavigatorView.tsx

**必要验证：** 在x10000处100%仍保留视觉中心；停靠窗口后fit不遮节点；reduced-motion无飞行；按钮连续点击与边界zoom

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-14 · P1 · Railway长度、图标底座、溢出、身份

**判定：** 部分接通，有明确偏差

**设计位置：** [5385:255](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5385-255)；[5385:282](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5385-282)；[5101:189](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-189) 02 / 现场轨道 · 悬停窥视；[5106:1715](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5106-1715) Gen2 第二轮 / 现场轨道；[5163:843](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-843) Railway / 右侧提示 / RootGlyph；[5163:863](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-863) Railway / 右侧提示 / ContextGlyph；[5163:881](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-881) Railway / 右侧提示 / WorkflowGlyph；[5163:895](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-895) Railway / 右侧提示 / CollectionGlyph；[5163:909](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-909) Railway / 右侧提示 / ArchiveGlyph

**应覆盖状态：** 0/1/4/20成员、active、hover、+N、管理、接收者、glyph/颜色身份

**真实调用链：** GlobalHud → LcosRailway → canonical ordered refs → LcosRailwayView

**源码：** [LcosRailway.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosRailway.tsx:438)；[LcosRailwayView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/LcosRailwayView.tsx:124)

**缺项/偏差：**

- view支持glyph但container只传lucide icon；精致底座/设计身份没有真正进caller。
- 接收者使用MessageCircle和英文status，未体现真实Glyth身份。
- 非所有集合都应自动进Rail，必须按显式canonical orderedRefs。

**保留：** 保留4项+N、真实orderedRefs、CAS重排与冲突重读、接收注册。

**建议修改：** shell/LcosRailway.tsx、ui/families/LcosRailwayView.tsx、ui/FigmaShellGlyph.tsx

**必要验证：** 0/1/4/20长度；只显式加入才出现；+N可键盘到达；真实名称长短；自定义形状无canonical字段时不伪造持久化

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-15 · P1 · Railway悬停真预览、可进入操作区

**判定：** 部分接通，有明确偏差

**设计位置：** [5101:189](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-189) 02 / 现场轨道 · 悬停窥视；[5153:309](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-309) 05 · 图标轨道 / 悬停辨认；[5163:843](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-843) Railway / 右侧提示 / RootGlyph

**应覆盖状态：** rest、peek loading、真空间预览、stale、partial、unavailable、指针跨入peek、keyboard focus

**真实调用链：** LcosRailway item.peek → LcosRailwayView absolute aside

**源码：** [LcosRailway.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosRailway.tsx:469)；[LcosRailwayView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/LcosRailwayView.tsx:85)；[LcosRailwayView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/LcosRailwayView.tsx:97)

**缺项/偏差：**

- Peek内容为kind:id、Core顺序、Receive状态，无原T2指定的Huabu真mini scene。
- 52px父层overflowY:auto，absolute右侧peek有被裁切风险。
- mouseleave即关，图标与面板间缝隙可能使按钮不可进入。

**保留：** 预览仅hover/focus才加载；复用useSpacePreviewScene与bounds，不常驻轮询20个现场、不造第二几何owner。

**建议修改：** shell/LcosRailway.tsx、ui/families/LcosRailwayView.tsx、现有Huabu空间预览hook

**必要验证：** 8/20项rest不加载全部预览；鼠标跨过间隙可进入；滚动Rail不裁peek；loading/stale/unavailable真实；Tab进Peek并返回

**补证：** 裁切/间隙影响由DOM/CSS推断，需浏览器复现再定最终修复；真预览缺失已由caller确认。

### NAV-16 · P1 · Railway接收、排序、管理的可操作性

**判定：** 部分接通，有明确偏差

**设计位置：** [5101:322](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-322) 03 / 现场轨道 · 拖拽接收；[5106:1715](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5106-1715) Gen2 第二轮 / 现场轨道；[5187:179](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-179) 03 · 拖动、对齐与取消；[5347:1089](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5347-1089) K01 / 菜单替代拖放

**应覆盖状态：** 拖动接收、允许/拒绝、提交中、失败、排序、冲突重读、移除、键盘上移下移

**真实调用链：** LcosRailway → live target registry + canonical destination/reorder

**源码：** [LcosRailway.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosRailway.tsx:320)；[LcosRailway.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosRailway.tsx:469)

**缺项/偏差：**

- 已接真实接收和重排，不能为视觉移除。
- 原T2指定More里MoveUp/Down等键盘路径，当前主要pointer drag，需补键盘等价。
- More/Peek离开即消失影响操作，和NAV-15同修。

**保留：** 保留CAS、冲突重读、Drop registry观察滚动resize、拒绝原因。

**建议修改：** shell/LcosRailway.tsx、ui/families/LcosRailwayView.tsx

**必要验证：** 鼠标与键盘同一reorder intent；并发重排冲突；接收失败不假成功；冻结目标在手势中被删

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-17 · P1 · Arc角包、更多菜单与多窗口共存

**判定：** 部分接通，有明确偏差

**设计位置：** [5202:58](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5202-58) 02 · 节点动作与紧凑输入；[5226:1128](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5226-1128) 11 · 贴角动作弧 / 更多操作；[5186:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5186-49) 01 · 单选与对象工具；[5186:312](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5186-312) 02 · 框选与多选作用范围；[5187:683](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-683) 05 · 对象菜单与键盘退出

**应覆盖状态：** 单选、多选、hover、3个主操作/最多4、more、上下文菜单、对象锁定、窗口并存、安全区翻转

**真实调用链：** LcosHostOverlay/Canvas seam → LcosActionArc → command model/orbit geometry

**源码：** [LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx:119)；[LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx:182)；[LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx:233)

**缺项/偏差：**

- 任何专业窗口打开就整体return null，沿用了已被取代的exclusive overlay规则；不能在窗口旁对画布对象使用Arc。
- 旧节点工具栏还有pdf/office/web/sketch/question/frame/unbound-text保留路径，需补命令后再统一，不能直接隐藏。
- 嵌套节点局部position用于Arc定位是否正确待实测。

**保留：** 保留真实command model、更多分组、对象右上角轨道geometry和Motion组件。

**建议修改：** navigation/LcosActionArc.tsx、LcosHostOverlay.tsx、../lcos-seam/chromeModeSlot.tsx

**必要验证：** 窗口打开仍可选画布对象；主操作3-4上限；More逐层Esc；嵌套节点+缩放+边缘；旧类型重要操作不消失

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-18 · P1 · Composer引用条和工具按钮生产接线

**判定：** 部分接通，有明确偏差

**设计位置：** [5043:102](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5043-102) 输入 / Oreo 就地生成；[5229:1489](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5229-1489) 13 · 引用选择 / 缩略预览与就近操作；[5229:1753](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5229-1753) 14 · 移除一份引用 / 保留输入；[5283:890](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5283-890) A01 / 主画布 · 当前接收与输入；[5289:6378](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5289-6378) A10 / 对话工作视图 · 同一 Composer；[5295:2982](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5295-2982) N01 / 窄屏 · Composer；[5304:3646](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5304-3646) N07 / 键盘焦点 · 发送

**应覆盖状态：** 空草稿、2-4行增长、长文滚动、引用缩略图、预览、移除单引用、不可用引用、附件、receiver、提交中、失败恢复、窄屏、键盘

**真实调用链：** LcosComposerHost → LcosComposerView → ComposerReferenceStrip

**源码：** [LcosComposerHost.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/composer/LcosComposerHost.tsx:224)；[ComposerReferenceStrip.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/nearfield/ComposerReferenceStrip.tsx:1)

**缺项/偏差：**

- 生产references只传key/label；view支持thumbnail/onRemove/icon却未传，设计的单引用移除和图片引用没有接通。
- attachAction/referencePickAction/receiverAction接口存在但host不传。
- Composer Drop只注册textarea范围，引用条和其他表面不接收。

**保留：** 保留单draft owner、真实submit、失败保留草稿、已有textarea高度计算；引用预览复用来源预览。

**建议修改：** composer/LcosComposerHost.tsx、ui/nearfield/LcosComposerView.tsx、ui/nearfield/ComposerReferenceStrip.tsx

**必要验证：** 添加3引用→删第2保留正文；失效引用不伪造成附件；IME/Enter/ShiftEnter；窄屏和读源窗并存；Drop落引用条/空白槽都一致

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-19 · P1 · 近场输入定位、多窗口、语音状态

**判定：** 部分接通，有明确偏差

**设计位置：** [5246:59](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5246-59) 02 · 续工在 Composer 内展开；[5280:669](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5280-669) P0-03 / ReceiverComposerBody；[5295:2982](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5295-2982) N01 / 窄屏 · Composer；[5300:3632](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5300-3632) R01 / 减少动态效果 · 输入

**应覆盖状态：** 被动草稿、活跃输入、提升工作窗、返回近场、点击外部、Esc、录音/转写/错误

**真实调用链：** LcosHostOverlay → shell draft → LcosComposerHost；voice helper未接生产入口

**源码：** [LcosHostOverlay.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.tsx:309)；[LcosHostOverlay.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.tsx:317)；[LcosComposerHost.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/composer/LcosComposerHost.tsx:72)

**缺项/偏差：**

- 任意windows.length>0使近场composer消失，违背T3同草稿host promotion与占位优先级。
- 语音createVoiceInput只有helper/测试，未见生产控件；不能将浏览器speech helper视为T3 Core转写通路。

**保留：** 保持草稿与运行状态现owner；语音需验证既有Core能力后接，绝不自动发送或画假状态。

**建议修改：** LcosHostOverlay.tsx、composer/LcosComposerHost.tsx、现有语音owner适配

**必要验证：** 输入→开窗→继续/返回草稿不丢；Esc只关最高层；录音中取消；转写失败保留文字

**补证：** 语音在T3原卡明确，Figma完整voice构图未证明；若backend未就绪需明确缺能力，不能假按钮。

### NAV-20 · P1 · 通用Drop来源：画布节点、右拖携带、装配

**判定：** 部分接通，有明确偏差

**设计位置：** [5187:179](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-179) 03 · 拖动、对齐与取消；[5187:431](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-431) 04 · 引用落点与原位保留；[5188:1132](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-1132) 09 · 装配窗口与引用；[5347:1089](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5347-1089) K01 / 菜单替代拖放

**应覆盖状态：** 原生移动、左拖给予、右拖携带、远端给予、物理跨空间、取消、无效目标、跨窗口

**真实调用链：** AssemblyBody.acquireDrop → lcosRecognizers → target registry → dropCommitRouter

**源码：** [AssemblyBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/AssemblyBody.tsx:520)；[lcosRecognizers.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/lcosRecognizers.ts:1)；[dropCommitRouter.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropCommitRouter.ts:1)

**缺项/偏差：**

- 生产acquireDrop调用仅AssemblyBody；recognizer只观察已开始payload，没有画布对象原生提取入口。
- 未找到right-carry/landing proxy/nodeDropIntent接到通用链；不能把装配拖拽等同全产品Drop。
- Collections/Portal/skills接收在通用target union之外，需与13页专项agent合并逐类查。

**保留：** 保留Huabu原生移动、Core装配事务、外部文件导入独立真实链；不能把原生移动强行变成给予。

**建议修改：** lcosRecognizers.ts、drop/*、LcosHostOverlay.tsx、../lcos-seam现有pointer入口

**必要验证：** 节点→节点/Composer/Glyth/集合/Rail/画布；右拖源不动；左give本地place-at-target proxy；远端源保留；Esc/权限/切现场/目标消失

**补证：** 各类Drop完整视觉须浏览器实操录屏；这里只确认来源接线缺口，未断言Huabu原生拖动坏。

### NAV-21 · P1 · Drop接收反馈、真实回执、Glyth输入锚点

**判定：** 部分接通，有明确偏差

**设计位置：** [5187:431](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-431) 04 · 引用落点与原位保留；[5188:1132](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-1132) 09 · 装配窗口与引用；[5262:551](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-551) 26 · 焦点 · 薄光边，不常驻发光；[5262:807](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-807) 27 · 处理中 · 色散沿种子边缘流动；[5262:1078](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-1078) 28 · 创建完成 · 辉光扩散后收回；[5353:2263](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5353-2263) R06 / 减少动态效果 · 等待回执

**应覆盖状态：** 候选目标、允许/拒绝、commit中、accepted、partial、failed、取消、到达回弹、减弱运动

**真实调用链：** Drop state → LcosDropPreview；commit owners → shell composer

**源码：** [LcosDropPreview.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/LcosDropPreview.tsx:1)；[LcosHostOverlay.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.tsx:258)；[dropCommitRouter.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropCommitRouter.ts:96)

**缺项/偏差：**

- 当前preview主要固定蓝色文字pill：原始type/id→target，缺目标材质接收、commit/accepted/failed序列。
- addConversationReference打开composer锚点硬编码0,0,0,0，Glyth处Drop可能把输入落到错误位置。
- partial回执是否被当success尚需核对owner返回类型，不提前定罪。

**保留：** Core返回才成功；保留取消和失败，不用光效代替错误文案或真实状态。

**建议修改：** drop/LcosDropPreview.tsx、drop/dropCommitRouter.ts、LcosHostOverlay.tsx、shell既有composer调用

**必要验证：** 异步慢/拒绝/部分成功/异常；掉到Glyth锚点正确；同一次commit不重复；reduced-motion仍可知成功；不吞错误

**补证：** 生产浏览器截图/操作待主代理补证；代码事实已核对。

### NAV-22 · P2 · 共享反馈、disabled、长文与运动族

**判定：** 部分接通，有明确偏差

**设计位置：** [5391:322](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-322)；[5391:327](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-327)；[5391:332](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-332)；[5391:337](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-337)；[5391:342](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-342)；[5391:347](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-347)；[5391:352](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-352)；[5262:551](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-551) 26 · 焦点 · 薄光边，不常驻发光；[5262:807](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-807) 27 · 处理中 · 色散沿种子边缘流动；[5262:1078](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-1078) 28 · 创建完成 · 辉光扩散后收回

**应覆盖状态：** loading、empty、normal、focus、disabled、error、recovery、motion-reduced

**真实调用链：** LcosSurfaceFeedbackView等已存在 → 各真实caller状态映射不齐

**源码：** [LcosSurfaceFeedbackView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/LcosSurfaceFeedbackView.tsx:1)；[LcosNavigatorIslandView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/LcosNavigatorIslandView.tsx:67)

**缺项/偏差：**

- 共享族已写不等于各页异常态已挂；导航族仅三态caller是明确例子。
- 画外定位黑胶囊、Drop蓝胶囊、Rail工程文字与统一玻璃/图像反馈仍分裂。
- 焦点/成功/运行应分强度，不能全屏彩光常驻。

**保留：** 保留文字及aria-live等可读回执；视觉动效只增强现有语义。

**建议修改：** ui/LcosSurfaceFeedbackView.tsx、各域container状态映射、ui/lcos-tokens.css

**必要验证：** 真实失败/恢复而非测试字符串；200%缩放长中文；高对比/键盘focus；prefers-reduced-motion

**补证：** 导出声明详细运动录屏缺失；静态参数不能冒充已确认的真实运动手感。

### NAV-23 · P1 · 项目级系统入口与能力不被视觉隐藏

**判定：** 待跨域补证

**设计位置：** [5306:4074](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5306-4074) A12 / 项目菜单 · 系统入口；[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696) 统一主稿 / 全局导航与画外定位

**应覆盖状态：** 项目菜单、设置/运行诊断入口、当前接收者、退出到项目库、工作现场返回

**真实调用链：** LcosProjectShell project cluster → /projects link；其他菜单caller待跨域汇总

**源码：** [LcosProjectShell.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosProjectShell.tsx:305)

**缺项/偏差：**

- 本域没有找到5306系统菜单、CurrentReceiverBody/RuntimeDoctorBody生产caller；需父代理跨域确认，不直接认定全部缺失。
- 不能只留下返回项目库而丢诊断/设置真实入口；也不能虚构不存在能力。

**保留：** 保留真实路由、返回栈、project identity和已有系统页面。

**建议修改：** shell/LcosProjectShell.tsx、既有菜单/诊断入口组件

**必要验证：** 所有菜单项能到真实页面；返回项目不丢用户现场；无能力项说明原因

**补证：** 跨域核对菜单/系统设置owner后再决定缺项。

## 推荐施工顺序

1. 先统一viewport/safeRect响应及顶层退出，让入口不消失、浮层不打架。
2. 修Search/Where完整occurrence及子现场导航，保留实体/空间身份。
3. 补ColorPin本地角标与可点击Locator连续形态。
4. 修Rail真Peek、hover通道、键盘排序，保留Core重排。
5. 解除Arc/Composer对所有窗口的笼统抑制，补引用caller接线。
6. 补Drop画布/右携带来源和真实目标/回执反馈，与13页集合专项合并。
7. 补Launcher真实封面、表单焦点和菜单入口。
8. 最后统一材质/字号/半径/运动，对关键宽度和长内容逐态实测。

## 已读原始证据

- 仓库AGENTS.md
- _cabin/00_INDEX.md
- 01_正本/GEN2_新前端重新总装正本_20260913/10_T1-T7原始施工卡阅读入口.md
- T2_Patched_Navigation_Cards_20260905.md（全）
- T2 C2-2A Search章节27–29、38–42
- T2 C2-1C Railway真Peek和键盘重排章节34–37、52
- T2 C2-2C ColorPin章节52–56
- T2 C2-3A Locator状态、相机不变量、local/near-edge/edge章节
- T3 Exact Interaction Blueprint章节：overview、drop、overlay、Arc/Composer/voice、Esc/settle
- Figma adoption-00、九面交付、结构索引和navigator/railway/shell/feedback结构JSON

## 可直接保留/吸收

- 保留单ProjectShell、单ReactFlow相机、canonical orderedRefs/CAS重排、Core Pin颜色成员、真实search/bindings、Composer草稿与提交、已有Arc command model和目标几何。
- 直接采用最终共享族的52×48导航静息、按成员增长的Rail、图标底座、三面常驻Dock、统一反馈和精确SVG资产，但必须接入真实container。

## 适配后吸收

- Huabu真空间预览只在Peek打开时读取；完整Where发生位置定位；GLASS材质在实际白画布上的CSS近似；T3原Drop的本地给予/右携带/远端给予接入既有owner。
- Figma引用缩略图/单项移除/输入工具接口，补生产caller而不是重复创建卡片。

## 必须拒绝的倒退

- 用locationRefs第一项猜位置；把子现场拍平为main/context/workflow根面。
- 任何窗口打开就隐藏全部Arc/Composer；一次Esc关闭多层；为贴图删旧类型仍需的真实命令。
- Pin当节点类型图标；不可点击的定位状态标签冒充画外浮标；Assembly有Drop就宣称通用Drop完整。
- 只有data-figma、组件接口或字符串测试就标完成；伪造归档、缩略图、语音或提交成功。
