# LCOS GEN2 · 全量激进 Donor 更新总纲与 SOP · V2

日期：2026-09-20  
角色：Figma / Frozen UX → Production Presentation Implementation Owner  
范围：整条 GUI 施工线，包括已交付界面的返工，以及 Context / Workflow 等尚未收口部分。

> **默认接入成熟 donor 的完整组件与实现机制，再用 LCOS 的真实 props、Figma 的视觉规范做薄适配。不是读完 donor 后重新写一套，也不是换几个按钮就宣布整面采用。**

本文整合上一版进度与 SOP、REWORK01/02 交接，以及用户最新“非常激进采用”的要求。用于替代上一版作为简明阅读入口，不删除原交接、来源说明或安全措施。本次是文档更新，没有新增 patch、重新运行测试或确认远端代码已前进。

## 一、当前到底做到哪里

**已有代码候选和 donor 收编，不等于整套 Figma 已还原。** 下表依据现有交付记录，不把旧汇报升级为本轮重新验证的事实。

| 交付层 | 已有内容 | 仍不能宣布完成的部分 |
|---|---|---|
| Stage 1 | Shell、窗口顶栏、HUD、Navigator、Railway、SurfaceDock、Camera、SurfaceFeedback 的展示组件与资产 | 完整组合的 Figma 对照；Camera 折叠状态；窄窗口操作溢出接线 |
| Stage 2 | Action Arc、Composer、Text / Document / Image / Audio 展示层 | 全节点宿主外观、交互态映射、真实数据下的整页构图与响应式 |
| Stage 3 | Reader、Assembly、Conversation Work View 的呈现接入 | 不代表 Reader 双组、Assembly 完整内容仓库、会话完整工作流程均已还原 |
| REWORK01 | 交接记录包含 Grok renderer、共享调度与生命周期适配、Glyth 选择外观和会话去卡片化 | Glyth 远景 takeover、真实回执动作、相机运动提示、真实 ReactFlow 宿主验证 |
| REWORK02 | 交接记录包含 ObjectOrbit 动效、Composer 自动高度、ScaleIn、按钮原语、Reader 文本与图片交互的源码复用 | 完整 React19 / Core / ReactFlow 集成；Lovart / TapNow / Spatial 的整体深度采用尚不能据此宣布完成 |

REWORK02 交接记录的纯测试与隔离浏览器检查，不替代完整仓库 typecheck、lint、build、生产 E2E 与 Figma 像素对照。现有材料没有全九面、全状态的差异总账，因此目前不能诚实给出“还差百分之几”或“自造已经清零”。

来源：`LCOS_GEN2_GUI_REWORK01_返工交接_20260920.md`、`LCOS_GEN2_GUI_REWORK02_交接_20260920.md`、`LCOS_GEN2_GUI_REWORK02_自造清零审计_20260920.md`。

## 二、激进采用的统一执行方式

### 1. 按完整组件族替换，不按几个细节修补

一次采用要尽量覆盖同一组件的渲染、状态呈现、动效、局部交互、清理和降级路径。Glyth 不能只取几何；Reader 不能只取文字样式；Assembly 不能只换来源按钮；窗口不能只对齐顶栏高度。

已经符合 Figma、且实际复用了成熟机制的代码保留。要替换的是有成熟来源可用、却仍然自行近似实现的部分，不是为了改动量把正确代码全部重写。

### 2. 机制优先复用，视觉始终服从 Figma

```text
现有项目里已经接好的成熟 donor，直接复用
    ↓ 尚缺实现时
DIRECT_LIFT：接入完整组件 / 模块 / 核心函数
    ↓ 宿主接口不同
THIN_ADAPT：主要代码保留，只适配 props / imports / tokens / 生命周期
    ↓ 原实现为 native 等不同技术
ALGORITHM_PORT：按可读原码迁移算法、参数与状态过渡
    ↓ 确认没有可用实现
只补 LCOS 必需的最小代码，并说明具体缺口
```

**Figma exact 不是最后才考虑的选项。** 几何、字体、资产、材质、组件变体和组合层级始终由当前 Figma 决定；上面的顺序只决定采用什么实现机制。

```text
现有 container：真实状态、身份、能力、回调
                     ↓ typed props
成熟 donor 组件 / 算法 / 动效
                     ↓ 薄适配
Figma exact 外观与状态呈现
                     ↓
真实 production caller
```

不要再增加通用 Provider 平台、第二注册表或“万能 donor 框架”。现有组件和接缝够用就直接用。

### 3. Lovart / TapNow / Spatial 不再按旧标签整项排除

用户要求已从保守参考改为激进采用。接下来必须下钻到具体文件：有可复用源码就收编；同类开源上游已经识别就直接采用；native 的纯逻辑有原码就迁移。不能继续用一句 `REFERENCE_ONLY` 代替取源与适配工作。

但材料只有截图、符号索引或行为记录时，应明确“尚未取得该实现原码”，不能把自行重建写成 `DIRECT_LIFT`。采用策略的更新也不改写第三方原始许可、署名和明确限制；来源记录必须原样保留，未核实的权限不写成已获授权。

### 4. 薄适配不能把最有价值的部分删掉

可以改 imports、类型、受控 props、token、宿主事件接口，以及接入现有共享调度。不能把 donor 的插值、眼睛队列、缩放算法、显隐生命周期全部删掉，再用几段自写 CSS 代替。

遇到不合 LCOS 的整屏结构，只拆出适配的原语。拒绝 GEN1 cockpit 壳，不代表放弃里面可用的 Viewer、输入器或窗口机制。

## 三、全 GUI 采用地图：整个项目一起覆盖

下表是接下来的整体替换目标，不是已完成证明。各行同时适用 Figma exact、真实 caller 和现有 owner 约束。

| 工作面 / 组件族 | 优先直接采用的来源 | 要完整吃到的部分 | 不搬走的现有职责 |
|---|---|---|---|
| **Glyth 全链** | Grok / Bloub + GEN1 presence；现有 NodeTakeoverLayer | 身体、眼型、gaze、blink、spring、有限 reaction、清理、离屏暂停、减少动态效果、远中近连续呈现 | Conversation / Run 状态、Selection、LOD、drop 与回执真值 |
| **Action Arc / 节点近场操作** | GEN1 `ObjectOrbit` / `ProjectObjectOrbit` + Huabu FloatingPopover / Tooltip | 弧形动作组合、热区、标签、入退场、spring / stagger、贴近节点与边界处理 | 命令模型、allowed actions、选择与 mutation |
| **Composer / Reference Strip** | GEN1 `UnifiedExecutionComposer` / `commandDraft`；现有 Oreo、Amicro、Motion、Glyth renderer | 自动高度、引用顺序呈现、身份区、工具、焦点、进退场、近场与 inline 共用一套 body | draft / receiver / submit / receipt / continuation；不建第二输入器 |
| **Conversation Work View** | 当前 R5 会话读面 + GEN1 可用的阅读 / 会话原语 + 共用 Composer | 身份、完整消息、轻量进展、当前上下文、就近 attention / result、按需诊断 | send 与 delegate 的区别、会话绑定、Waiting / Review / Recovery |
| **Reader 全媒体阅读** | GEN1 `artifactViewerRegistry`、`TextReaderLine`、`ImageZoomStage`、适用的 Viewer / Workbench 原语 | 内容分流、文本层级、图像锚点缩放与拖动、复位、滚动、双组 / 窄宽呈现、降级 | Artifact / Revision、来源引用、版本切换、阅读位置与窗口拓扑 |
| **Assembly 整体内容仓库** | Lovart 可复用 presentation / 其已识别成熟上游 + GEN1 Warehouse / Capture + 当前 Source Bay | 异高内容排布、真实预览、内容物种差异、hover / focus 显动作、局部工具、预览占位、取用反馈 | 四路来源、canonical search / 分页、物化、apply、Semantic Drop 与逐项回执 |
| **Shell / Global HUD / 项目入口** | 当前 LCOS Shell + TapNow 可复用 compact HUD / micro-interaction 模块 | 全局密度、轻材质、显隐、局部反馈、入口组合、响应式 | 路由级组合、Project / Worksite 身份；不恢复传统常驻后台侧栏 |
| **Navigator / Focus / Locator** | GEN1 Search / Focus / marker helpers + 当前 owner + TapNow 合适的局部控件 | 搜索岛、Pin 形态、搜索展开、焦点、错误 / 降级、画外定位的视觉反馈 | Search ≠ Focus；ColorPin 关系；位置与 camera 请求 |
| **Railway / SurfaceDock / Camera** | 当前 Huabu / LCOS + GEN1 navigation / focus；适用的 TapNow 控件 | 目的地数量驱动布局、hover 预览外观、选中、Receive / reorder 区分、溢出、折叠呈现 | Railway mutation、进入现场、手势、safeRect、camera truth |
| **Professional Window 全形态** | 当前 Stage + GEN1 `overlayStack` / `dismissibleLayer` / `spatialOverlayPlacement` + Huabu Common | 浮动 / 停靠 / 分组、标题 / tabs / More、聚焦与关闭、窄宽、进退场 | 唯一窗口管理、几何、停靠状态、safeRect；不另建 Window 系统 |
| **Main 节点物种** | GEN1 `CanvasNodeVisual` / `nodeCardRegistry` + 当前呈现接缝 + Figma 原始资产 | text / document / image / audio / Glyth 的不同身体；角标、caption、宿主 chrome、不同密度 | Core facts、ProjectionBinding、初始 / 已保存几何、唯一 registry / LOD |
| **Context / Atlas** | GEN1 `ContextSpaceSurface` / 组件层 + Spatial 可取得的布局、stack、presented-state 原码 | 集合立体层次、2.5D、轻量空间组织、展开收回、局部反馈 | Context 身份、成员关系、独立 Worksite；Atlas 不成为新业务 Canvas |
| **Temporal Rail** | GEN1 `ContextFlowSurface` / `trackSegments` + 当前 TemporalRail；Spatial 适用算法 | 片段呈现、滚动、聚焦、鱼眼与过渡、减少动态效果 | Episode / entity 真值、成员和导航 owner |
| **Workflow / Hand / Card Pool** | GEN1 `WorkflowSurface` / `WorkflowComponentRenderers` + Figma 卡族 + Spatial 合适的空间逻辑 | 手牌取用、拿起 / 对焦 / 收回、卡池密度、集合 presentation、局部状态 | Workflow / Run / Skill 语义；取用卡不是新增画布节点或第二 DAG |
| **Collection / Portal 跨视图** | GEN1 Portal / collection 原语 + 当前窗口 / preview seam + Figma families | 同一身份在 Main / Atlas / Assembly / Workflow 的不同身体、目标预览与状态 | 不复制实体，不内嵌第二 Canvas，不把预览当进入或 mutation |
| **共享反馈与小型动效** | 现有 `motion/react`、GEN1 控件；原包 Amicro / Morphicons 等适用模块 | hover / pressed / focus、loading / empty / disabled / error / recovery、有限局部动效 | 不用 loader 冒充进度，不用定时器判断成功，不改变业务终态 |

**接线不足时做受控 View，不做假业务。** fixture / story-like 展示可以完整演示变体，但必须与 production 分开，不能用假预览、假成功或样例照片冒充真实内容。

## 四、后续施工：内部小提交，对外交完整阶段包

整体顺序承接已有安排，不再一边欠 Glyth 的核心效果，一边不停扩新面。

**第一段：已交付部分整体返工与 Glyth 收口。** 连着检查 Glyth → Action Arc → Composer → Conversation。重点是身体动效、宿主选择反馈、远中近连续性、真实回执动作，以及工作会话不再呈现成后台卡片堆。Stage1–3 中仍有成熟 donor 可替代的近似机制同时登记并替换。

**第二段：Reader + Lovart Assembly。** 以完整阅读、浏览、预览、取用体验为一段交付。不要拆成“先改标签，瀑布流以后再说”；保留真实来源、错误与回执路径。

**第三段：Spatial + GEN1 的 Context / Atlas / Temporal Rail / Workflow / Hand。** 从可取得的真实算法和组件出发，按 Figma 现有空间与卡面说明实现。不自行发明第四张业务画布、额外工作流状态或装备属性。

**第四段：TapNow 全局呈现与整机统一。** 回查 Shell / Navigator / Railway / Dock / Camera / Window / Feedback，统一显隐、密度、材质、状态和响应式；同时做九面整体对照，不停在单组件截图。

每段内部可以按组件族分小 commit；交给用户时提供该段增量 patch、截至该段的一次性累计 patch、完整变更文件、采用账本与运行证据。累计 patch 必须由真实应用后的工作树生成并在另一棵干净工作树应用检查，不能直接拼文本就称为已验证。

## 五、每段只执行这一套 SOP

### 读清目标与宿主

先读相关 Figma 的全部注释、采用说明、组件描述和当前设计审计，再核 T5 与相关 T1–T7 卡、current production caller 和 donor map。需要的正文没读到就标缺口；不能用“以前读过”“文件存在”“搜索没找到”代替事实。Figma 缺失的动效或响应式整页稿不能宣称 exact；有详细注释的部分不能忽略。

### 确定完整替换单元，立即施工

列清 donor 原文件 / symbol、现有 target、真实 caller、保留 owner、薄适配差异。优先直接导入现有成熟组件，其次收编原码。适配只改必要接口与皮肤，不建立新的通用平台。

改动优先落在 `huabu/apps/web/src/lcos/ui/**`、`ui/families/**`、展示组件、CSS、资产和动效原语。共享 container 只改 JSX composition、样式与展示 props 映射。需要宿主支持时先用已有中性接缝，不越权改 canonical contracts、runtime、store 或 mutation。

### 同时核 View 和外层宿主

每个组件都要看 body、wrapper、overlay、selection chrome、caption / marker 的裁切、窗口容器与真实 caller。只换里面的 SVG、外面仍是旧卡片，不算完成。

### 用真实运行验收，不用来源标签代替结果

执行现有项目的 typecheck、lint、unit / integration、build、smoke / E2E；报告实际命令、环境和退出码。依赖版本以目标仓库为准，隔离 React 版本不同必须明示。

五档视口固定为 `1440×900 / 1280×800 / 1152×768 / 1024×768 / 390×844`。测试正文、图像、长标题、空内容、错误与窄容器，不整体缩字体。对设计中适用的 rest / hover / pressed / selected / focus / active / disabled / loading / empty / error / recovery / degraded 分别对照；selected 与 focus 不合并。

视觉看 Figma target、实现截图、并排 / overlay / diff、DOM 几何与 computed style；动效看原速录屏、进入退出、中断恢复与 reduced-motion。Glyth 继续测 `1 / 5 / 80 / 150 / 300` 实例、共享调度、离屏与清理。真实路径继续测 drag / zoom / reload / callback / receipt，不因为 donor 自己能动就宣布 LCOS 已闭环。

缺 selector、页面或 console 错误、失败请求、断言失败、未到达路径必须产生失败结果。不得以“截图看起来像”掩盖假 caller，也不得以“测试绿”掩盖画面错误。

### 更新一个账本，交付一个阶段结果

沿用现有 Adoption Ledger，不新增另一套冻结合同、hash 系统、baseline 系统或泛化 gate。每行保留：

```text
Figma ID / 具体状态
→ donor 文件与 symbol / version / 原始来源说明
→ 采用方式：DIRECT_LIFT / THIN_ADAPT / ALGORITHM_PORT / CURRENT_DONOR_REUSED / FIGMA_EXACT
→ target / production caller / 保留 owner
→ 当前替换进度 / 接线缺口
→ 测试与浏览器证据
```

**采用方式和完成状态分开。** `DIRECT_LIFT` 可以仍未接线或未验收；`INFRA_WIRING_REQUIRED` 是缺口，不是完成标记。没有原码、尚未对齐或未测试的项必须留在表里，不能为了“清零”换一个好听的状态词。

## 六、并行边界、补丁关系与已知缺口

### 补丁关系

现有交付的出生点是：

```text
frontend-reconstruction-v2@802b7a537ffe81a6e09c522cd45539a22a8a42da
    → LCOS_GEN2_GUI_STAGE1-3_CUMULATIVE_802b7a5_20260919.patch
    → LCOS_GEN2_GUI_REWORK01_on_STAGE1-3_20260920.patch
    → LCOS_GEN2_GUI_REWORK02_DonorClearout_on_REWORK01_20260920.patch
```

本次未重查远端 HEAD。开工时由执行环境读取最新 Infra 分支，使用独立 GUI branch / worktree。已有 GUI 提交就保留并 rebase；只有 patch 就先在其真实父状态应用、提交，再处理与最新 Infra 的差异。不对用户工作树执行破坏性重置，不改 `main` 或 `frontend-reconstruction-v2`，不把补丁重复应用。

2026-09-14 的旧 `S2a / S2b1 / S2b2 / S2c1 / S2_REBASED` 仍为历史参照，不恢复为当前施工输入。新策略不能倒推旧包已经完成了新增采用目标。

Infra 继续拥有状态、effect、callback、canonical mutation 与生命周期；GUI 拥有呈现组件、视觉层级、动效与 props 映射。冲突逐 hunk 处理，不用整文件覆盖抹掉对方的逻辑。已有取消、迟到响应保护、权限、错误恢复与安全措施全部保留。

### 已知待接线项

| 项目 | 现有缺口 |
|---|---|
| Camera | `CAMERA_COMPACT_PRESENTATION_STATE`：折叠 / 展开的真实输入 |
| Window Chrome | `WINDOW_CHROME_OVERFLOW_ACTION_MODEL`：Close / 当前 tab / 更多动作的明确描述 |
| Composer | `COMPOSER_REFERENCE_REMOVE_ACTION`、`COMPOSER_ATTACH_REFERENCE_PICK_ACTIONS` |
| Source Views | `SOURCE_INTERACTION_PRESENTATION_MAPPING`：真实交互态与反馈映射 |
| Glyth 远景 | `GLYTH_TAKEOVER_FACE`：接现有 takeover face，维持身份与连续性 |
| Glyth 相机预算 | `GLYTH_CAMERA_MOVING_HINT`：读取既有相机运动提示，不另造 camera owner |
| Glyth 回执 / Drop | `GLYTH_RECEIPT_REACTION`、`GLYTH_DROP_VISUAL_INPUT`：真实回执、接近 / 可接收提示 |
| 整机组合 | `NATIVE_HOST_INTEGRATION`、`CONVERSATION_CONTENT`：宿主与真实内容验证 |

这些是已有交接里记录的缺口，不是本轮发现或新增的系统。能通过现有接口映射的直接映射；确实缺 producer 的交给 Infra，同时继续不依赖该缺口的 GUI。

## 七、接续入口与最短执行指引

继续阅读的材料：

- `LCOS_GEN2_GUI_当前进度与激进Donor施工SOP_20260920.md`：本总纲的完整历史展开版。
- `LCOS_GEN2_GUI_REWORK01_返工交接_20260920.md` 与 `LCOS_GEN2_GUI_REWORK02_交接_20260920.md`：代码、运行环境及未闭环范围。
- `LCOS_GEN2_GUI_REWORK02_自造清零审计_20260920.md`：旧采用判断与实际 symbol；旧 REFERENCE_ONLY 的整项排除方式按本轮用户要求重新逐文件处理，不篡改源文件说明。
- `LCOS_GEN2_前端源码Donor精选包_20260914.zip` 中的 `01_SOURCE_ADOPTION_MAP.md` 与原始实现；`LCOS_GEN2_Figma设计合同轻包_仅MD_20260914.zip` 中的详细采用说明。

当前记录的 Figma 文件 key：`nFUdroLvI5qJZuYTW8h2rF`。采用说明 `5409:2`；九面入口为项目启动 `5388:3652`、Main `5388:96`、Context `5388:21602`、Workflow `5388:22998`、Atlas `5388:24294`、Temporal Rail `5388:25701`、Professional Window `5388:27165`、Reader `5388:27411`、Global HUD `5388:27696`。共享族仍沿 Navigator `5384:367`、Railway `5385:283`、Shell `5386:436`、Window Chrome `5387:331`、Feedback `5391:357`、Context Collection `5333:96`、Workflow Collection `5334:46`、Task Card `5335:110`、Portal `5348:1151`。这些是已记录入口，开工须重新读当前内容，不能当成本次在线复核。

给接续施工对话：

> 先读本总纲、已有 patch / handoff、Figma 全部相关注释与 donor 原码。按“完整组件族”激进收编成熟实现，默认直接复用或极薄适配，不读完后自行重写。先回查 Stage1–3 与 REWORK01/02 的真实应用状态，接续 Glyth / 近场 / 会话返工，再做 Reader / Lovart Assembly、Spatial / GEN1 Context / Workflow，最后统一 TapNow HUD 与九面呈现。Figma 决定外观，Core / Infra 决定语义，Huabu 保留空间机械。不要重开已有产品讨论；不要 fake state / backend / success；不要以 donor 引入第二 owner。内部小步运行与提交，对外交可应用的大阶段 patch 和真实视觉 / 动效证据。只在当前 Figma 或最新产品要求实质冲突且无法从原文判断时请求裁决。
