# Context 第9批：真实现场、光幕与集合状态

日期：2026-09-27。范围仅 Context 前端；无 Core/backend、第二画布或导航状态；未创建业务数据。结论：补好四处真实差距，不能因此声称 Context 全稿已实现。

## READ_SOURCE

- `_cabin/06_Figma/LCOS_GEN2_Figma设计合同轻包_仅MD_20260914__unzipped/03_ContextWorkflow产品语义裁决.md` 与 `04_ContextWorkflow已有成果纠正.md`：9月11日最终语义优先于9月10日 V3；旧 HTML 为交互原型，不是可直接照搬的生产规则。
- `_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T5/LCOS_三视图交互合同_RhineDonor统一裁决_20260910.md` §5–6；T5 ContextWorkflow V3 §6–7 仅取仍成立关系。
- 同目录 T3 `LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md` §15、`LCOS_Gen2_T3_C1-S2_Source_Engineering_Seam_Skeleton_20260906.md` §13；T4 `45_T4_to_T5_ProfessionalWindow_and_ProfessionalBodies_ExactBlueprint_v1.md` §5–6：集合成员事实、目标解析、窗口与现场各有原 owner。
- 旧 HTML：`_cabin/04_R系列与T5规划/前端冲刺/LCOS_GlobalHUD_Navigator_ContextWorkflow_Prototype_V2_ThreeVideoIntegrated_20260910.html`；`LCOS_ContextAtlas_WorkflowHand_IntegratedPrototype_20260910.html`。读真实 DOM/动效关系，不采用其样例数据、评分分层或计时器作真值。

## ADOPTED

空间关系是：同一项目真值 → Main / Context / Workflow 三个独立现场 → 当前现场上方的临时光幕 → 有真实 Workspace 的集合/子现场 → 仅 Context 子现场内的右侧时间轨。光幕是选择层，不是 Context 现场本体；关闭回到原现场与原焦点。根现场不得伪造子现场返回链或时间轨。

| 真实缺口 | 修改与生产 caller | 为什么这样改 |
|---|---|---|
| 根目标切换尚未成功就回报成功 | ContextWorksite.enterItem 等待原 nav.switchWorksite 的 boolean；只有 true 收光幕 | 保持原导航 owner；false/进行中不可冒充进入成功 |
| 下一页加载或错误把整片集合推下约166–172px | ContextAtlasStage 把分页反馈置于保留集合之后，加载按钮原位变状态；重试原 cursor | 最终 Atlas 要求加载保留表征位置、错误保留可读缓存；不是换成普通列表页 |
| 无 canvas / 未知目标类型仍像可进入文件夹 | ContextAtlasStage 按真实 Workspace 校验；ContextCollectionView 现有 disabledReason 承接；只减弱材质，不淡化身份和原因 | 不用演示目标补洞；真实 props 恢复后立即恢复原入口 |
| 390px Atlas 搜索被顶部搜索岛遮挡 | ContextAtlasView 只读已有 useHudObstacleRects，局部 safeTop=max(HUD底边+12)；padding=max(原稿顶部位置,safeTop)，窄屏头部在安全上缘 sticky | 不移动 Shell、不创建第二几何 owner；保留列表滚动和关闭按钮；桌面原位置不变 |

修改文件：

- `surfaces/context/ContextWorksite.tsx`：本域只改根目标 await；trigger 避让是根任务独立修改。
- `surfaces/context/ContextWorksite.navigation.test.tsx`
- `surfaces/context/ContextAtlasStage.tsx`
- `surfaces/context/ContextAtlasStage.request.test.tsx`
- `ui/context/ContextAtlasView.tsx`
- `ui/context/context-spatial.css`

以上相对路径均基于：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos`。

## VISUAL_SOURCE

- 最终统一稿 Context `5388:21602`、Atlas `5388:24294`、时间轨 `5388:25701`；Figma 文件 `nFUdroLvI5qJZuYTW8h2rF`。
- 本地结构：`E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/unification/specs/context.json` 的 `5392:4843/4845–4848`；`atlas.json` 的 `5392:4929–4933`；`temporal.json` 的 `5392:6048–6051`。
- 依据包括：真实现场独立、加载身份不消失、不可用原因、临时层先关闭、进入失败不丢当前层、Atlas 加载位置保留、子现场才有局部时间轨。早期具体形态：`5139:2885/4194/182`、`5140:376`、`5144:675`；时间轨 `5156:504/1871/3249`；Context 细节 `5161:687/2133`。
- 本轮直接目视实际生产截图，未用 `data-figma` 标签充当实现证据。

## RETIRED

- 删除“根目标 Promise 未完成先 return true”的提前成功呈现。
- 停用分页状态在集合上方插入大反馈块造成的空间跳动；首屏无数据加载/错误仍保留原反馈。
- 不再让无真实目标的文件夹呈现可激活入口；保留真实名称、来源与不可用原因。
- 旧 V3/HTML 中 Episode、固定三层/五档、score/bucket、演示计时和样例组织轴没有升级为生产合同。未改成 SaaS 页面，也没把 kind/updatedAt 猜成事情/时间轴。

## VERIFIED

- `pnpm exec vitest run --maxWorkers=1 src/lcos/surfaces/context src/lcos/ui/context src/lcos/ui/spatial/useLayerReturnFocus.test.tsx`：14文件51项通过。覆盖根进入 pending/false/true、真实 target、请求过期/重试、时间轨既有行为、关闭还焦。
- 本批4个 TSX/测试文件 ESLint：0错误0警告。全 Web tsc 根任务合并串行检查通过。一次默认多 worker 检查因 Node Zone Allocation 内存不足终止，未记通过；随后上面串行51项全过。
- 真实 fixture（不拦截响应）320/390/1024/1440：6个实际 scene，其中3个缺 canvas；这3个身份/原因可读、无伪进入按钮。始终1个底层 Canvas，根 Context 无时间轨，0 pageerror，无横向溢出。
- 6个命中量测状态（4宽度初始＋320/390滚动）：搜索与关闭 `elementFromPoint` 命中均 true，和 HUD 的 overlap 均 false。1440/1024 搜索 Y=162.5 / 关闭 Y=159 保持原位；320/390 搜索 Y=139.5 / 关闭 Y=136，滚动450后不变。关闭后焦点回原集合入口。
- 分页故障注入是隔离浏览器层响应：真实首屏6项不改，只附测试 cursor，下一页503，重试成功。修前首项 Y=218→384（加载）/390（失败）；修后加载/失败/恢复均218，6项 DOM保留，0 pageerror。此证据不能代替真实50+集合的服务端分页验证。

证据脚本与结果：

- [分页脚本](surfaces-context-pagination-qa.cjs)、[修前量测](surfaces-context-before-states.json)、[修后量测](surfaces-context-after-states.json)
- [四宽度脚本](surfaces-context-availability-qa.cjs)、[量测](surfaces-context-availability-states.json)
- [1440实际光幕](surfaces-context-1440-availability.png)、[390滚动与安全头部](surfaces-context-390-safe-header-scrolled.png)、[320滚动](surfaces-context-320-safe-header-scrolled.png)

## UNRESOLVED

- S18：事情/时间组织还缺真实 producer；当前明确“组织未标注”。不能把实体kind或更新时间猜成组织轴。邻域焦点完整语义仍待该真值。
- S20：合并/拆分/删除集合壳但保留成员缺实际 command / allowedActions / proposal owner，详见 [真实缺口报告](surfaces-S20-collection-command-gap.md)，未加假按钮。
- S21/S22：现有时间轨真实 API、轮滚、局部定位、多目标和失败重试保持并通过测试；本 fixture 全为 root scope，真 child 的时间索引回合尚无浏览器实证。没有为了演示创建数据或画假时间轨。
- 50+真实集合分页、完整 child往返、集合成员预览封面，以及极端专业窗口占满时跨HUD避让，不在本轮证据范围。S11双Reader和其它域保持各自记录，不因本批通过抹平。
