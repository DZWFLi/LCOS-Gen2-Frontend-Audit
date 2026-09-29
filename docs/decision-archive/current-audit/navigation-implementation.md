# 导航、HUD 两批实施与验收记录

**阅读顺序：第二批记录覆盖首批末尾的相机/Peek/键盘重排待办；仍未完成项以本文最后一节为准。**

更新：2026-09-26 14:22。范围：隔离树 `LCOS_GEN2_GUI_RECOVERY_20260926`，基于主仓 `7dd479c`。没有改主仓、后端或 canonical owner，没有提交或推送。

## 结论

导航第一批已接到生产 caller，并完成真实浏览器链路验证。32 项专项测试及当前前端 TypeScript 检查通过。**这只是首批修复，不代表导航域或整套 GUI 已全部完成。**

采用依据：T2 原卡、后续裁决、最终 Figma 九面及 04 共享/13 增量。具体盘点见 [完整导航清单](inventory-navigation.md) 与 [结构清单](inventory-navigation.json)。历史稿采用关系见 [补充覆盖](navigation-additional-coverage.json)。

## 本批采用及实现

| 项目 | 设计及原卡依据 | 已落地的行为 |
|---|---|---|
| 响应式 HUD | Figma 5386:211/286/361；边距与既有 safeRect | 新增纯呈现 viewport hook；Navigator、Where、Pin、Railway、Surface Dock 随窗口/visualViewport resize 更新位置。没有第二相机或状态 owner。 |
| Navigator 岛体 | 5384:247（52×48）、5384:306（184×48）、5384:366（402×48） | 无 Pin 只留搜索按钮；Pin 随数量增长；超过容量显示真实 +N 和真实隐藏成员；不再常驻一个加号。搜索展开后保持岛体居中。 |
| 同体与 Esc | T2：Search/Where/Pin 为同一物理槽位，语义 owner 不合并 | 增加仅控制可见层的共享 slot；三者互斥。Esc 先关闭 Pin 溢出层，再关闭当前导航层；输入法 Enter 不误提交。 |
| Search → Where | T2 C2-2A/2B：搜索找身份、Where 列完整落点 | 搜索结果不再直接跳第一个 locationRef。点击/键盘确认后先调用真实 Where；读取完整 binding，保留 canvasId、workspaceId、spatialId。输入保留、错误/重试保留。 |
| 子现场定位 | T2：相同实体多个 projection 不得串落点 | 复用原 useLcosWorksiteNav，支持精确已有子 canvas/workspace；等待指定 nodeId materialize，不能用同实体另一 projection 顶替。目标不在时呈现不可用。 |
| 画外浮标 | T2 C2-3A：LOCAL→NEAR_EDGE→EDGE→TRAVELLING→ARRIVING | 从真实 Pin membership + referenceStore 派生目标；局部节点角标由节点组负责；边缘浮标实际可点，调用原定位请求与相机；不改变 selection。显式选中但未 Pin 的对象用不同的定位符号。 |
| Railway | 5385:255（1 项 52×52）、5385:282（4 项 52×178） | 保留真实显式目的地及按数量 hug；场景使用图标而非节点快照；保持与底部三常驻入口独立；调整 overflow 与 hover bridge，避免小预览被窄轨裁掉/跨间隙闪退。 |

颜色、Pin 分组和局部角标沿用同一真实接口：`colorPinTargetFromEntityRef` → `colorPinTargetKey` → `membershipsByTargetKey` → `snapshot.definitions`。新 helper 只做派生，不创建第二存储。

## 修改文件

以下均相对 `huabu/apps/web/src/lcos/`。只列本代理改动，未把其他代理改动认领进来。

- `app/useLcosWorksiteNav.ts`：既有 owner 的精确目的地能力。
- `navigation/LcosNavigatorIsland.tsx`、`LcosFocusWhere.tsx`：搜索、完整落点、键盘/异步生命周期。
- `navigation/NavigationHudSlot.tsx`、`useHudViewport.ts`：可见槽位与响应式呈现。
- `navigation/resolveOccurrenceDestination.ts`、`waitForProjectedEntity.ts`：精确目的地及 projection 等待。
- `navigation/LcosPersistentLocatorOverlay.tsx`、`LcosCanvasCommands.tsx`：真实画外浮标、到达反馈、不改选择。
- `pin/ColorPinHud.tsx`、`projectedPinTargets.ts`：Pin 同体与真实目标派生。
- `shell/LcosGlobalHud.tsx`、`LcosSurfaceDock.tsx`、`LcosRailway.tsx`：接线、响应式、Railway 目的地沿用既有导航。
- `ui/families/LcosNavigatorIslandView.tsx`、`LcosRailwayView.tsx`、`lcos-hud-presentation.css`：仅 Navigator/Railway 相关结构与规则。
- 9 份导航专项测试（见下）。

配合主代理的唯一数据形状增量：既有 `LcosLocateRequest` 新增可选 `preserveSelection`，仍走原 shell request；Temporal 等旧调用不传时继续原行为。字段由主代理在 `shell/lcosShellStore.ts` 添加。

## 验证证据

### 代码验证

- `pnpm exec tsc --noEmit --pretty false`：退出码 0。
- 以下 9 个测试文件共 **32 项全部通过**：
  - `navigation/LcosNavigatorIsland.test.tsx`
  - `navigation/LcosFocusWhere.test.tsx`
  - `navigation/resolveOccurrenceDestination.test.ts`
  - `navigation/NavigatorGeometry.test.tsx`
  - `navigation/waitForProjectedEntity.test.ts`
  - `navigation/LcosPersistentLocatorOverlay.test.tsx`
  - `app/useLcosWorksiteNav.test.tsx`
  - `pin/ColorPinHud.test.tsx`
  - `pin/projectedPinTargets.test.ts`
- 覆盖真实身份 handoff、错误保留/重试、键盘与 IME、resize、异步取消、同实体多 projection、精确子现场路由、0/1/3/20 Pin 几何、共享 slot、真实 membership 派生、浮标点击和局部不重绘。

### 浏览器实测

独立 Playwright session：`lcos-nav-recovery`。地址：`http://127.0.0.1:5286/projects/lcos-gen2-dev/main`。只操作呈现状态（选择、搜索、视角），没有创建/修改 canonical fixture。

1. 搜索“参考图”真实返回 200；点击“参考图 B”打开 Where，读取完整 bindings。
2. 点击 Where 的真实位置后定位成功；前后 selected node 相同，确认不篡改选择。
3. Space 平移使真实 Pin 目标离屏；出现“前往真实工作流导入验收”的按钮。点击后原相机带目标进入视野，观察到 arrival cue，常驻离屏浮标消失。
4. 1440×900 → 1024×768 → 1440×900，Navigator 与底部 Dock 均即时重排；一枚 Pin 的岛体始终 96×48，恢复尺寸后坐标恢复。
5. 最终控制台：0 errors、0 warnings。协作中曾遇到主代理改动的临时 HMR 导出缺失，修复后重新验证，未计为最终通过证据。

| 视口 | Navigator（x,y,w,h） | 底部 Dock（x,y,w,h） |
|---|---|---|
| 1440×900 | 672,24,96,48 | 631,818,178,58 |
| 1024×768 | 464,24,96,48 | 423,686,178,58 |

实测截图：

- [1440 桌面](navigation-1440.png)
- [1024 小屏](navigation-1024.png)
- [真实画外浮标](navigation-locator-offscreen.png)
- [点击到达后](navigation-locator-arrived.png)

## 尚未完成，不能写成“全部对齐”

| 盘点 ID | 仍需继续的内容 |
|---|---|
| NAV-01/02 | Launcher、创建/导入、启动首屏仍未在本批修改。 |
| NAV-04 | 本批解决 viewport resize；多浮窗占用、各种缩放和 HUD 碰撞组合仍须整体验收。 |
| NAV-06 | +N 已真实接通；Pin 编辑/成员列表的信息密度与媒体化呈现仍需后续。大量组合和极窄可用宽度没有全部浏览器测量。 |
| NAV-07/09 | 精确子 workspace 路由和多 projection 已有测试；本次浏览器只验证已有 fixture 的当前画布落点，没有造一组子现场假数据来冒充实测。搜索当前最多 50 条，有真实限量提示，完整分页尚未实现。 |
| NAV-10 | 导航槽内 Esc 已完成；Arc/Composer/专业窗口的全局层级栈由主代理继续整合。 |
| NAV-12 | 单个真实 Pin 的离屏、直达、到达已实测；多目标拥挤、超大对象、全部禁用/不可达形态、自定义形状没有全覆盖。当前左侧浮标可贴近屏边，边缘余量仍可小幅优化。 |
| NAV-13 | Camera 100%/fit 行为、紧凑展开等尚未在本批处理。 |
| NAV-14 | 数量 hug、图标、预览裁切已处理；真正 mini-scene Peek、键盘重排、目的地变更的完整实时刷新仍未完成。当前 fixture Rail 无显式成员，因此不声称完成真实多项 Rail 浏览器验收。 |
| 其他域 | Arc/Composer/Drop、节点、Context/Workflow、Reader/Assembly 由对应代理处理；此文不代表这些域已完成。 |

下一批先做 Camera 紧凑入口与 Railway 真正 Peek/键盘顺序；继续复用当前 owner，不另起画布/导航/窗口体系。


## 第二批收口（2026-09-26 18:53）

### 实际采用与生产接线

- **真实相机 caller 是 `useLcosCanvasProps → LcosSpatialNavigator → shell cameraRequest → LcosCanvasCommands`**。旧 `LcosCameraControls` 没有挂载；核实后已撤掉对旧组件和测试的无效修改。本批没有声称“加了一个 compact prop 就完成接线”。
- `LcosSpatialNavigator` 原有 52×48 静息形态保留，展开由原本组件管理；增加实测尺寸避让和局部 Esc 收起。MiniMap 本体、数据和状态 owner 没有修改，也没有审查 Pass4 MiniMap。
- `LcosCanvasCommands` 的 100% 从 `setViewport({x:0,y:0,zoom:1})` 改为原 RF `zoomTo(1)`，保持当前视觉中心；fit 使用 Huabu 已有绝对节点几何，不再用节点相对坐标加猜测尺寸。fit 只在原来的主动命令/初始取景路径执行，读取 Stage 的 `safeRect/occupiedRects` 寻找无遮挡区域；没有可用区域时不把内容塞到浮窗背后。
- Navigator、Where、Pin、Railway、Surface Dock、空间导航用 `useAvoidingHudPosition` 测自身真实尺寸，复用现有 `placeLocatorAnchorOutsideObstacles` 计算呈现位置。新增纯函数只消费 Stage environment，不拥有窗口、相机或 canonical 状态。
- **Railway Peek 已按 T2 C2-1C §30–37 接真实场景**：`Core graph workspace.canvasId → 原 useSpacePreviewScene 缓存 → RailwayPeek 只读 SVG`。只在 Peek 挂载期间读取；保留真实坐标、连线、图片 URL、文字、空场景、loading/stale/partial/unavailable 与原缓存 retry。没有随机图片，没有新的预览缓存，没有第二 ReactFlow。
- Railway More 里新增“上移/下移”，遵循 T2 §52 的局部键盘路径，调用原 `reorderRailwayRefV1 → railway.write(expectedVersion)`。409 仍等待 fresh order + fresh graph 再解锁。
- 搜索 Esc 在真实浏览器中发现会连关底层装配窗。改为导航活动层在 capture 消费，保留 Pin 溢出层优先；单次 Esc 不再关闭底层窗。主代理同步修复公共窗口/Arc 对已消费事件的尊重。
- Where 再补一个漏项：同画布中有真实 binding、但 exact projection 尚未落到 live nodes 时，仍列出“当前现场 · 投影待就绪”，等待准确 nodeId；失败给反馈，不冒充定位成功。

### 第二批增加/修改文件

- 新增 `navigation/hudWindowGeometry.ts`、`useAvoidingHudPosition.ts`、`RailwayPeek.tsx`。
- 修改 `navigation/LcosSpatialNavigator.tsx`、`LcosCanvasCommands.tsx`、`railwayProjection.ts`。
- 修改已在首批清单中的 Search/Where/Pin/Railway/Dock 接线。
- 修改 `ui/families/LcosSpatialNavigatorView.tsx` 的可注入呈现位置，不改 MiniMap 部分。
- 新增 `navigation/hudWindowGeometry.test.ts`、`RailwayPeek.test.tsx`、`shell/LcosRailway.keyboard.test.tsx`，补原 `LcosSpatialNavigator`、Search、Where 回归。

### 浏览器测量与截图

全部在独立 `lcos-nav-recovery` 会话操作，未写项目材料。环境中途重启前的截图与测量已落盘，不拿它冒充环境恢复后的新录屏。

1. **100% 中心保持**：缩放从 0.633663 到 0.99999。变换前中心 `(446.281383,77.312388)`，变换后 `(446.281463,77.312773)`，漂移约 **0.00039** 个画布单位。
2. **搜索结果避让**：装配浮窗 `x344..984/y88..736` 时，搜索结果浮层（402×346）移到 `x992/y24`，与浮窗水平相隔 **8px**。
3. **拖窗不动相机**：实际拖窗前后矩阵均为 `matrix(0.633663,0,0,0.633663,437.208,401.01)`。
4. **Esc 只关搜索**：同一脚本确认 `windowRemainedAfterSearchEscape = 1`。
5. **有浮窗的 fit**：10 个真实节点整体落在左侧 `x166..618`；装配窗从 `x704` 开始，节点未藏到浮窗下面。

截图：

- [拖窗后相机不变](navigation-window-avoidance.png)
- [搜索结果绕开装配](navigation-search-window-avoidance.png)
- [fit 使用真实无遮挡区域](navigation-fit-window-safe.png)

### 当前测试状态

- 两批联合：**15 文件 53 项通过**，命令带 `--maxWorkers=2`。
- 最后新增同画布待投影 binding 回归后，相关 4 文件 **17 项通过**；合并去重计 **54 项**已通过。
- 最新前端 `tsc --noEmit --pretty false` 通过。
- `git diff --check` 导航范围通过，只有仓库既有 CRLF→LF 提示。
- 曾以默认并发跑联合测试遇到 5 个 worker OOM；已结束失败进程，限两 worker 重跑后全部通过。没有把 OOM 部分结果当作通过。

## 当前尚未收口的导航入口（替代首批待办）

| 项目 | 真实差距/限制 | 推荐下一步 |
|---|---|---|
| NAV-01/02 | Launcher、项目创建/导入不在导航两批修改中。 | 由 App/Launcher owner 结合总表处理。 |
| NAV-03 | 顶部项目名称/子现场标题可能与搜索相撞；该区域不在本代理独占文件内。 | 主代理在 ProjectShell 确认长名称、窄屏及导航展开组合。 |
| NAV-06/11 | Pin 成员弹层还是文本列表；没有全面采用已有媒体引用预览。 | 复用真实 reference preview 与原 Pin membership，不把分组改成节点类型。 |
| NAV-07/09 | 精确子现场/多投影有自动测试；本次浏览器只用已有当前画布 fixture。 | 后续用独立真实子现场 fixture 补跨现场端到端证据；当前同画布待投影漏列已修。 |
| NAV-08 | 现有输入/编辑器/Reader 不再被全局 CtrlF 抢占，但所有可编辑宿主需逐页确认其标记。 | 全局验收中检查各 Reader/Composer 的真实本地 Find。 |
| NAV-12 | 真实单 Pin 离屏→点击→到达已测；多目标拥挤、超大对象、视口边缘余量、自定义形状未穷举。 | 共用原locator与truthful membership继续测；不伪造自定义形状持久化。 |
| NAV-13 | 真实100%/fit和相机控件避让已修；全部窗口盖满可用区时fit保持不动，尚无专门“先收起窗口”提示。 | 可复用现有轻提示补无可用区域反馈。MiniMap依旧排除。 |
| NAV-14 | Rail 主体按数量 hug、真实glyph已接。接收者仍用 MessageCircle/英文状态；外部写入后的刷新覆盖不足。 | 接收者复用Glyth现成形态；确认现有事件订阅后补refresh，不新增domain store。 |
| NAV-15 | 真实Peek实现与素材/失败态测试已接；当前浏览器fixture没有显式Rail成员，不能声称远端场景预览已做浏览器端到端验收。 | 用专用Rail fixture验证8/20项只预取打开项、Tab路径、真实资产。 |
| NAV-16 | 主Rail More上/下移已接版本化保存；+N溢出列表仍只有打开/移除，未补同等管理重排入口。 | 为溢出目的地补同一管理入口，复用同reorder intent；不造新全局快捷键。 |
| NAV-22 | 导航错误/重试/键盘层级有进展；高对比、200%缩放、多个浮窗完全挤占视口仍需同场验收。 | 用真实可用区记录不可避免碰撞，按已有轻反馈呈现。 |

仍不能把以上两批称作“96 项全部完成”。本代理未创建第二 Canvas/Window/Camera/Navigation owner，未改主仓，未推送。


### 服务恢复后补验（2026-09-26 18:55）

重新建立独立 `lcos-nav-recovery` 浏览器，在根代理恢复的同一 5286 服务验收：搜索“参考图”返回 6 个真实结果；Esc 后装配窗仍为 1 个；实际 100% 从 0.535912 恢复到 1；页面标题为“LCOS Gen2 开发工作台（e2e fixture） · LCOS”；控制台 0 error / 0 warning。

[恢复服务后的相机与窗口实测截图](navigation-restarted-service-qa.png)。未启动第二套服务，未创建测试业务数据。


## 第三批收口（2026-09-26 19:24）

这批补的是已经有真接口、但用户实际用不到的入口。主仓、后端、canonical store 数据未改；没有创建测试业务数据，没有 push。

### 已完成

- **Railway +N 与主轨采用同一管理动作**：溢出目的地现在有进入、上移、下移、移出导航。上/下移仍调用原 `reorderRailwayRefV1 → railway.write(expectedVersion)`，没有第二套排序。溢出项上移进入主轨后，键盘焦点跟随该项；409 等待回读后解锁仍保留。
- **承接会话复用真实 Glyth 形象**：`LcosReceiverIdentity → useCollaborationSession → GlythBodyView`；状态来自真实 collaboration projection，中文显示“可以继续 / 正在理解 / 正在做事 / 等你回应 / 本轮完成 / 暂时无法连接”。未知时明确读取中，未伪造 ready。
- **现有共享 SSE 增加只读项目监听**：`collaborationSessionStore.watchProjectChanges` 和 Glyth/Composer/Reader 共用一条项目订阅，保留会话引用计数与 Reader 生命周期。Railway 收到 invalidation 后重读真实 order、graph、receiver binding；回到窗口/标签页也刷新。读取失败保留上次目的地并给重试，不把上次快照说成最新数据。
- **Pin 成员真实预览**：新增 `ColorPinMemberPreview`，只匹配当前已加载图像节点与精确 entity/view reference；明确 View 不借用底层 Artifact 图片。有真实 src 才显示图，无图片或加载失败显示类型图标。沿原成员入口跳转，不改变 Pin membership/Where owner。
- **搜索截断如实反馈**：实际 `CoreSearchParams/SearchResult` 没有 cursor、offset、nextCursor；因此没有制作假分页。只消费服务返回的 `truncated`，提示“还有匹配结果；补充关键词可缩小范围”，不凭返回数量猜测还有结果。
- **Main 集合总览根/子分流**：只读 fixture 元数据证实 `workspace-real-main/context/workflow` 均属于 root scope。`MainCollectionAtlas` 现在对根 canvas 走既有 `switchWorksite`，成功后才收光幕；非根仍走 `beginChildWorksiteNavigation`，保留精确 workspace 与来源是否子现场。ProjectShell 仅增加该 caller 的 props。Context caller 与卡片文案由专业窗口组同步处理。

### 文件

本批主要改动：

- `shell/LcosRailway.tsx`、`ui/families/LcosRailwayView.tsx`、Railway CSS 规则。
- `collaboration/collaborationSessionStore.ts` 只读项目监听扩展。
- `pin/ColorPinHud.tsx`、新增 `pin/ColorPinMemberPreview.tsx`。
- `navigation/LcosNavigatorIsland.tsx` 真实 truncated 提示。
- `surfaces/main/MainCollectionAtlas.tsx`、`shell/LcosProjectShell.tsx` 中仅 MainCollectionAtlas props。
- 对应行为测试；没有删除原有冲突测试。

### 验证

- 三批联合 **18 个文件、70 项测试通过**，`--maxWorkers=2`；前端 **tsc --noEmit 通过**。
- 最新导航范围 `git diff --check` 无格式错误（仓库有换行转换提示）。
- 独立浏览器 `lcos-nav-recovery`，真实 Main 总览点击 Context 根现场：URL `/projects/lcos-gen2-dev/context`，无 workspaceId，返回按钮数 0、Atlas 数 0。
- Pin 真实已有成员“真实工作流导入验收”能看到前往/移除入口、正确 scope 类型图标，没有虚构缩略图。
- 本会话控制台没有 error/warning。截图：[根现场切换](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-main-atlas-root.png)、[Pin 真实成员](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-pin-real-preview.png)。

### 仍未完成或不能宣称已验收

1. 当前 fixture 没有显式 Rail 成员或 activeReceiver binding；+N CAS 管理、Glyth 状态、SSE 生命周期有行为测试，**没有对应真实浏览器端到端证据**。没有为凑截图往项目塞假对象。
2. Pin 预览本批覆盖真实已加载 image projection；跨工作区未加载素材没有被下载补齐，非图像也未冒充图像。精确 entity/view、隐藏节点和图片失败已有测试。
3. 搜索全量分页需要真实服务支持，当前只提供 truthful truncated，不能宣称分页完成。
4. 拥挤多浮标、自定义形状的持久化、高对比/200%缩放、全部窗口挡满时 fit 的专门提示仍在导航待办中。MiniMap 仍按任务边界排除。
5. Launcher/长标题由主代理处理；Context 根/子入口由专业窗口组处理。这些不计为本代理已完成。

此文档记录分批实际落地与证据，不表示 96 项全部完工。
