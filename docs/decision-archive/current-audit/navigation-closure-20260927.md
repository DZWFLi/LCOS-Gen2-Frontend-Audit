# 导航续验与子现场进入修复 · 2026-09-27

## 结论

24 个浮游标的桌面/窄屏命中已实测。另修复“目标加载失败却跳转并收掉光幕/手牌”，以及真实成功加载中 arrival 提前消费导致误报失败的时序。未宣称导航整体完工。

## 浮游标证据

使用 DEV 专用 nav12-fixture.html：合成24个空间投影、生产 LcosCanvasCommands/PersistentLocator 与真实 ReactFlow。不是完整产品或真实 Pin 持久验收。

- 1440/390/320 × 900：均24浮标，命中矩形互相重叠0、屏外0、中心被遮挡0。
- 实际点击目标1/16/23，分别准确到达，24个选择保持；另点击目标24已准确到达。
- [测量数据](nav12-closure-measurements.json)、[原始执行日志](nav12-closure-measurements.log)。
- [桌面截图](nav12-closure-reset-1440.png)、[390截图](nav12-closure-reset-390.png)、[320截图](nav12-closure-reset-320.png)、[第24目标到达](nav12-closure-arrival24.png)。
- 已查看桌面及320截图：浮标沿真实边缘向内第二列避让；高密场景仍占画面，不能凭无重叠就宣称美学最终版。当前fixture仅选中浮标，未验证Color Pin各染色/自定义形状。
- 初次桌面计数0由自动fit将目标全部带入视口导致；用现有“重置测试镜头”恢复约定相机后重新测量，未当产品缺陷。

## 子现场进入修复

1. beginChildWorksiteNavigation 改 Promise<boolean>；只在真实 switchCanvas 成功后提交 childReturn 并返回true。
2. false/throw不跳转、不写返回链；清自己的临时过渡，源画布仍在时恢复原镜头；过期请求不消费较新的意图。
3. Main/Context Atlas、Workflow手牌等到完成后才关闭；失败留原入口供重试。
4. 根现场 switchWorksite 在接受请求时消费此前的child意图，防approach结束后的迟到加载抢回路由。未建状态系统。
5. 浏览器又发现 loadCanvas先公布canvasId，Commands把尚未填targetViewport的进入意图消费。现 enter-settle 等原helper补镜头，缺省取已有RF的镜头；return-restore无捕获镜头仍保持原行为，采用加载owner镜头并结束。

## 实测与边界

- 缺失目标真实 GET /api/canvas/nav12-missing-read-only 返回404；source仍nav12-test-only、24节点仍在、history=none，未执行navigate。本次监听只有GET，无项目写入。
- 成功目标是已有空测试画布 canvas-6ada44d1-675b-4b44-9a37-f0865bfb328b；真实loader完成后回执entered，返回源nav12-test-only。正常运动（首帧稳定700ms后）、减弱运动均通过。
- [失败截图](child-entry-missing-real-loader.png)、[失败日志](child-entry-missing-real-loader.log)、[成功截图](child-entry-success-real-loader.png)、[成功日志](child-entry-success-real-loader.log)。这证明生产helper+真实loader，不等于完整项目canonical工作现场/返回到源的端到端验收。
- 测试fixture自动取景与立刻approach竞争可使RF动画Promise等待；稳定首帧后正常通过，此初始竞争尚未解决。
- API列表发现历史已有nav12-test-only（createdAt=1790426330428）；不是本轮创建，不删除，不能宣称fixture历史从未落盘。
- 回程returnToSource跨switchCanvas/实体重建等待的取消仍需单独收口：不能简单拿可能已由settle动画消费的token判取消，否则误杀正常返回。

## 回传六字段

READ_SOURCE: E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T2/LCOS_Gen2_T2_C2-1D_Worksite_Enter_Active_Back_ExactSourceBlueprint_20260907.md §§34–44（两阶段、失败不污染历史、latest wins）；同目录C2-3A Locator原卡§0/§1；仓内childWorksiteNavigation、worksiteCameraTransition、useLcosWorksiteNav、canvasStore switchCanvas/loadCanvas、LcosCanvasCommands。

ADOPTED: 现有Huabu canvasStore.switchCanvas（失败保留源，已有请求generation）→ 子现场helper await；原shell childReturn/相机意图→ Atlas/Workflow caller。无新donor代码复制。

VISUAL_SOURCE: 本项不新绘视觉；沿用NAV12来源5153:774/5164:831及Context/Workflow现有Figma壳。验证的是既有浮标与视图进入连续性，不用标签冒充视觉完成。

RETIRED: beginChildWorksiteNavigation立即返回true、加载失败照样navigate、caller立即关闭、未填目标镜头即消费enter-settle的旧行为。

VERIFIED: child-entry-closure-tests.json（最终针对测试）；真实浏览器上述GET失败/成功与浮标截图。无Core/backend更改，无push。

UNRESOLVED: 真实全项目Pin/Rail持久矩阵、回程取消、首帧相机竞争、极端更高密度审美与完整跨视图归属仍未验收。

最终验证：6 个测试文件、26 项通过，0 失败；Web tsc --noEmit 通过；git diff --check 通过。回程缺省 targetViewport 的分支仍 consume 原意图，不等待缺失镜头，保持原来加载后的 owner 视角；真实完整回程仍未宣称通过。
