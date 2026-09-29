# LCOS Gen2 云端编码接手入口

日期：2026-09-30

## 结论

这个仓库同时包含：可运行的 Gen2 前端源码、为 Collection/Glyth 闭环补充的最小 Core 接口、T1–T7 原始裁决、Figma/HTML/Donor 设计输入、以及 9 月 26–30 日的源码交叉审查。

不要从“某个组件看起来存在”推断功能已经完成。每项工作必须打通：

`producer → canonical identity → projection/binding → visible renderer → user action → authoritative receipt → reload/return`

## 代码基线

- 本仓库 `main` 的代码起点：LCOS Gen2 `a9f51a3`。
- 对外公开仓库中的临时开发分支不作为后续协作入口。
- 当前代码已通过：
  - `huabu/apps/web` TypeScript。
  - `apps/web-gen2` TypeScript。
  - `apps/web-gen2` 351 项测试，0 失败。
- Huabu 的单独 Professional Window Vitest 调用曾被 monorepo alias 解析挡住；需要使用正式 workspace 入口复跑，不能冒充通过。

## Figma

- 文件：<https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF/>
- Context 总体：`5139:2885`
- 光幕：`5139:4194`
- Collection：`5139:182`、`5140:376`
- Context 子现场：`5144:675`
- Workflow 画布：`5140:1765`
- Workflow 手牌：`5140:3012`
- Workflow 卡：`5140:4300`
- 时间轨：`5156:504`、`5156:1871`、`5156:3249`
- Context 细节：`5161:687`、`5161:2133`
- Workflow 接续：`5170:896`、`5170:2235`
- T7 入口：`5300:3344`

Figma 负责视觉、形态、密度和状态呈现；产品 identity、owner、receipt、回程和失败语义以 T 裁决与真实代码为准。

## 第一阅读顺序

1. `docs/decision-archive/current-audit/Gen1_T规划覆盖_第二轮全量复核_20260930.md`
2. `docs/decision-archive/current-audit/T1-T7_原审计逐项施工总账_20260929.md`
3. `docs/decision-archive/frontend-decisions/LCOS_三视图交互合同_RhineDonor统一裁决_20260910.md`
4. `docs/decision-archive/frontend-decisions/LCOS_Gen2_T5_ContextWorkflow交互专项_前端施工正本_V3_20260910.md`
5. `docs/decision-archive/t-stage-decisions/LCOS_Gen2_T5_55_接续_20260907/00_README_先看这里.md`
6. 针对具体模块再读 `current-audit/inventory-*.md` 与对应 T1–T7 exact blueprint。

历史文档中可能有已被后续纠正的判断。出现冲突时，以第 1 项和用户最新明确纠正为准；不要把较早截图当最终设计。

## 已实锤并已修

1. Context Atlas 曾把 Scene、普通 Collection、Context 混为同一种集合主体；现在 Context Atlas 只收 Context collection，Main Atlas 只收 canonical Collection。
2. Collection Drop 的负回执曾可能显示成功；现在只接受身份匹配且状态为 `applied` / `already-member` 的回执。
3. 历史 ArtifactView 曾打开最新 revision；现在 Reader 优先使用 `presentedRevisionId`。
4. 节点右键曾打开第二套通用菜单；现在复用选中态的 Action Arc。
5. Main Collection 总览曾混入 Context / Workflow 现场；当前已拆开身份与入口。

## 仍与设计稿或 T 裁决不一致的 P0

### 1. Run / Result 与死 renderer

Registry 中存在 `run`、`working`、`decision`、`context-reference`、`prompt-frame` 等 renderer，但当前 ReconciliationRunner 主要生产 Artifact、Workflow Scope、Collection、Conversation。逐项检查 production producer；没有 producer 的不得计为完成，也不得靠 mock 节点补图。

Run 应是过程机器，ResultSlot 是方案幽灵；结果确认后物化成真实目标 Artifact 物种。不得把 Run Review 做成第二套 store。

### 2. Railway 完整用户链

Railway 应随用户加入目的地动态生长，底部常驻按钮与动态目的地分层。需要验证加入、Peek、Receive、排序、移除、跨现场、reload 和 stale destination。当前有 ordered refs / CAS / caller，不等于真实用户链已经闭环。

### 3. Drop 六类 Receiver

必须覆盖 Collection、Railway、Portal、Glyth、Composer、空白画布。每类都要有：拖起、目标显形、吸附、高亮、拒绝、取消、提交、失败、成功、回滚或回程。Drop 是 Gen2 底层交互，不是 Collection 的局部能力。

### 4. Context / Workflow 根现场

Context Atlas 和 Workflow 手牌的局部身份已纠偏，但根页不能只是 Main 画布换激活色。Context 要围绕关系、证据、性质与时间；Workflow 要围绕阶段、执行、等待、结果与取用。严格对照上述专项 MD、两份 HTML 原型和 Figma node-id。

### 5. Glyth 本体状态机

Glyth 不是一个深窗口入口按钮。画布本体要先表达 idle、thinking、running、waiting-input、success、failure、recovery；材料 Drop 到 Glyth 是持久会话上下文，Composer 引用是单轮草稿，两者不能合并。

### 6. Portal 生命周期

已有目标预览和打开不等于投递完成。需要同一 owner 处理创建、取消、目标丢失、unknown/failure、权威 receipt 与返回来源。

## P1 视觉与手感

- Color Pin 顶部胶囊随 pin 数量增长；成员需物种缩略、高饱和轮廓和节点角标。
- 浮游标不是 Color Pin；需要画外方向、travel、arrival、物种身份与边缘色彩弥散。
- 连线默认隐藏；只在选中/关系模式使用 TapNow 式近场线、端点与标签。
- Collection 保留 Gen1 的归属和 fanout，但外观采用 Gen2 磨砂文件袋、LOD 和材质规范。
- Assembly 参考 Lovart：大面积瀑布流、媒体优先、自由缩放、动态避让；不要退化成后台卡片列表。
- HUD 使用轻液态玻璃，可染色；Railway 图标有克制的小矩形底座，保持可读性。
- 界面优先图标和直接操作；悬停再显示文字提示，避免 SaaS 表格和 AI 选项墙。

## Donor 使用边界

- Oreo：HUD 外壳、弹层、引用、进度和基础组件。
- TapNow：节点 AIGC 画布、Color Pin、近场关系线与轻 HUD。
- Lovart：Assembly 信息流与媒体空间。
- Spatial/动效库：空间连续性、光幕、Drop、生成和 arrival。
- Gen1：LCOS 产品身份、Collection、Railway、Drop 范围和画外导航。

Donor 不得改写 canonical owner、identity、状态机、receipt 或产品信息架构。

## 施工纪律

- 不创建第二套 Canvas、Window、Camera、Navigation 或状态系统。
- 不把不存在的快捷键、状态或数据画进 UI。
- 不以 CSS、`data-figma`、测试字符串或孤立组件冒充 production caller。
- 不牺牲现有真实交互、响应式和可访问性换截图贴图。
- 修改一项时同时记录：依据、生产入口、owner、失败态、验证方式和剩余缺口。
- 优先修 GUI/UX 的真实入口和画面身份；底层功能若尚无权威接口，应 fail closed 并明确缺口。

## 归档地图

- `docs/decision-archive/t-stage-decisions/`：T1–T7 原件。
- `docs/decision-archive/frontend-decisions/`：后续专项裁决与源码审计。
- `docs/decision-archive/prototypes-and-patches/`：自有 HTML 原型和历史 patch。
- `docs/decision-archive/current-audit/`：交叉检查、源码 inventory、修复记录与实页证据。
- `docs/decision-archive/ASSET-MANIFEST.csv`：外部 donor 与本地素材指纹/来源。

## 推荐第一批编码

1. 先输出 node species 的 `producer→binding→renderer→action` 矩阵，并修正 Run / Result 的真实缺口。
2. 完成 Railway 加入/排序/移除/reload 的生产链。
3. 用真实鼠标路径验证六类 Drop Receiver，并统一反馈。
4. 按专项裁决重核 Context / Workflow 根现场，避免重做 Canvas owner。
5. 收 Glyth 本体状态机，再统一 Color Pin、浮游标、关系线与 Assembly。
