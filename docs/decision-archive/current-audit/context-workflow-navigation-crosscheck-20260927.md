# Context / Workflow 导航整机交叉验证

结论：桌面根切换、光幕/手牌退出焦点成立；窄屏 HUD 存在明确遮挡，不能判整机验收完成。本批只做验证，没有修改生产文件。

## READ_SOURCE
- 原 T2 C2-1D Worksite Enter Active Back：Dock 始终返回根现场，共用已有导航控制器与历史。
- 原 T4 Scope WorkView Archaeology：Scope 不等于子画布；三根 Surface 独立。
- 原 T3 C1-S3D LocalOverlay WorkView：焦点 Composer 优先于 Arc；操作焦点不能被无关动作抹掉。
- 当前 ContextWorksite、WorkflowWorksite、ContextAtlasStage、WorkflowHandOverlay 和对应 CSS；导航 helper 与上一轮 navigation-return-cancellation-20260927.md。

## ADOPTED
本批保留现有根切换及焦点恢复机制；没有制造子现场数据，没有修改 Context/Workflow 专用文件、Shell 根、Stage、Core 或窗口拓扑。

## VISUAL_SOURCE
真实浏览器端口 5286，项目 lcos-gen2-dev。项目本身名称含 e2e fixture，但本批读取真实后端，未用合成 Graph 替换它。

- [Context 桌面光幕](cross-nav-context-open.png)
- [Workflow 桌面手牌](cross-nav-workflow-open.png)
- [根加载失败](cross-nav-failed-root.png)
- [Workflow 窄屏碰撞](cross-nav-workflow-narrow-camera.png)
- [Context 窄屏碰撞](cross-nav-context-narrow-camera.png)
- [Context 装配展开后碰撞](cross-nav-context-narrow-assembly.png)

## RETIRED
不能继续把“主画布已经接避让”解释成全部 Surface 已避让。不能把 Scope 没有 canvasId 的数据当作子现场成功往返案例。

## VERIFIED
1. 1440×900，Dock 完成 Main→Context→Workflow。光幕/手牌打开时，搜索导航、Surface Dock、项目身份中心均可命中。Esc 收起后焦点回原入口。证据 cross-nav-root-layers.log。
2. 从 Workflow 切 Context，对真实目标 Canvas GET 临时模拟503。路由保留 /workflow、active=workflow，Workflow 仍在，Context 不出现，展示 Failed to get Space。仅模拟传输失败，结束已取消拦截。证据 cross-nav-failed-root.log。
3. 后端 Graph 只有三个根 workspace 带 canvasId。额外三个 Workflow workspace 均无 canvasId；不能覆盖真实子现场进入/返回。
4. 390×844，Workflow 手牌入口 (24,704,44,44)，空间导航展开的锁定按钮 (32,702,44,44)。锁定按钮中心命中 false；Context 集合入口同样坐标、同样失败。
5. 同屏打开 Assembly 后，空间导航被下移66px。底排 y768，与常驻 Dock y768.5 重叠；网格、小地图、收起按钮中心均无法命中。上排 y720 的放大/适合画面被搜索岛 y738 遮挡。地图区域被 Assembly 挡住。空间导航展开总高大于窄屏装配后剩余空间，单纯平移不能解决。

## UNRESOLVED
- P1：Context/Workflow 固定入口遮住空间导航锁定按钮。需对应负责 agent 使用已有 HUD 避让机制，保持入口与空间导航分离；已通知总负责人。
- P1：窄屏 Assembly + 展开空间导航 + 搜索岛 + Dock 无可容纳空位，当前避让造成互盖。应通过现有展开/收起 owner 做紧凑呈现或互斥展开，不另建窗口状态系统；本批不越界修改。
- 真实子现场成功/失败/返回焦点：当前 Graph 缺可加载子现场，尚未整机覆盖。上一轮 helper 合成身份 + 真实 loader 的成功/取消测试仍只证明链路，不等于本轮真实产品数据全通过。
- 503验证不覆盖服务端返回成功但目标损坏、跨项目切换等全部矩阵。

推荐顺序：先修两个固定入口碰撞，再处理窄屏多 HUD 容量，最后用真实子现场数据复核进入/返回与焦点。不要为填验收表伪造产品内容。

## 追加：空间导航避让算法输入复核

已读取 hudWindowGeometry.ts、useAvoidingHudPosition.ts、LcosSpatialNavigator.tsx、locatorGeometry.ts，以及 ProfessionalWindowStage 发布环境和 deriveProfessionalWindowEnvironmentV1。未修改这些文件。

实测输入：viewport/safeRect=(0,0,390,844)，默认 inset 全为0，Assembly 为 floating，所以没有缩小 safeRect。occupiedRects=[(12,76,366,648)]；空间导航 additionalObstacles=[SurfaceDock(106,762,178,58)]。展开 HUD 实际尺寸232×248，preferred=(24,572)。Stage 通过真实 DOM getBoundingClientRect 发布该窗口尺寸，未读取或注入私有状态。

HUD半宽116、半高124，允许中心区域含8px间隙是 x∈[124,266]、y∈[132,712]。Assembly 膨胀后的中心禁区为 left=-104、right=494、top=-48、bottom=848，再加8px clearance；整个允许中心区域都处于禁区之内。仅这一扇窗口就已经无解，不必加入搜索岛或 Dock 才无解。

底层算法枚举障碍四边平移候选，clamp 后全部仍落入窗口禁区，遂返回原 anchor，渲染位置回(24,572)。这符合当前无解 fallback，不能称为错误选择了某个本可放下的候选。再换一种证明：窗口左右留白各12px，上方76px，下方120px，任一区域均不足以容纳232×248矩形；即便去掉全部clearance仍然不足。

结论：本场景不是算法修一下即可获得无碰撞位置。保留功能与既有窗口owner，暂不自行关闭窗口、隐藏功能或另造状态；将空间不足的展示选择交总负责人结合原T约束处理。此前两个固定44px触发器的避让修复与此问题独立。
