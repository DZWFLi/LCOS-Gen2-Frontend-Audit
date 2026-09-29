# 节点第一批：最小修改方案

日期：2026-09-26。状态：仅方案，尚未修改代码。施工范围等待主代理确认。

结论：先修生产 caller 的真实材料、集合轮廓、角标、LOD 与失败反馈。共享状态、画布几何、Core truth 和原有操作机械层保持各自 owner。没有证据支持的待审核、成员封面、事情/时间类型不画成既成事实。

## 修改顺序与范围

| 顺序 | 对照项 | 最小修改 | 主要文件 | 本批完成条件 |
|---|---|---|---|---|
| 1 | N12 生成结果 | seam 透传 sourceRunId；draft 复用实际 SourceMorphology，以真实生成来源做轻反馈，保留图像/文本/音频内容和 Reader 入口 | nodes/createLcosNodePresentationSeam.ts、nodes/LcosSpeciesBodies.tsx | sourceRunId 不丢；生成图片仍有原图；不得把所有历史 Run 产物写成“待 Review” |
| 2 | N17/N21 集合 | collection 改复用 ContextCollectionView；workflow-collection 保留 WorkflowCollectionView；外层透明、无卡框；新增 nodes 内适配容器 | nodes/LcosSpeciesBodies.tsx、新 nodes/collection 呈现适配器及局部 CSS | 248×244 原比例轮廓不被白卡和 overflow:hidden 裁掉；用户已有 node geometry 不重置 |
| 3 | N14 真角标 | 删除 Text/Image 固定绿/琥珀色假 Pin；使用 canonical snapshot + membership 匹配真实目标 | nodes/source/SourceMarker.tsx、ui/source/TextSourceView.tsx、ImageSourceView.tsx、nodes 层统一角标 | 无成员不画标；新增/删除真实 Pin 即更新；改变图宽不能改变 Pin 颜色；必须与导航组接线完成 |
| 4 | N26 LOD | 不动唯一 density resolver；source 4档只改变内容密度与细节；文字字号随当前内容框适配，不再一律37px；文档逐级呈现身份/短摘/正文/来源 | ui/source/source-presentation.css、TextSourceView.tsx、DocumentSourceView.tsx、nodes/source/sourceTypes.ts | 四档实际信息有差异，几何不跳；文字 resize 不被固定116px内容行裁；reduced motion 保持静态可读 |
| 5 | N06 图像 | 节点内 contain 保留全图比例；图片与现有投影框分开；真实 load/error 状态及重试，src 改变重置旧错误 | ui/source/ImageSourceView.tsx、source-presentation.css、SourceFeedbackSlot.tsx（如需扩展动作） | 横图/竖图/透明图不被裁，404有可辨原因和恢复入口，不让旧请求错误覆盖新图片 |

## 不能只改一行的地方

### N12：来源不是审核状态

`apps/web-gen2/src/presentation/nodeSpecies.ts:74` 将 `sourceRunId + managed` 解析成内部 `draft`。目前 `LcosSpeciesBodies` 的 draft 画的是纯文字卡，写死“待 Review，尚未成为 Current”。只透传字段会把真实图片吞掉，也会把已经采用的历史结果重新画成待审。

最小修复是在 body 中把 source/draft 都当材料呈现：内容形态仍由 kind/mime/sourceKind 决定，生成来源做附加事实。保留内部 species 兼容原 owner，不增加新的审核状态；不写死 Draft/Current，待真正的 revision/promotion 状态由已有 producer 提供。

### N17：组件可用不等于 production 已可达

已核对在线 `figma-online/design-5333-96.txt`：事情/时间 × 总览/主画布/装配共6款，同源尺寸248×244。复用已有 ContextCollectionView 的主画布款，并用真实信息；没有 organization 就保留“未指定”，没有成员图就不得用 Figma 山野样图假扮。

但 `projectionFacade.ts:317–330` 只为 workflow scope 提供描述；`reconciliationRunner.ts:293–319` 也只投影 workflow scopes。普通 context/collection scope 当前未由同一生产投影路径生效。**本组 nodes 修复只能完成消费端，主代理要协调原 projection owner 确认合法集合 producer；未接 producer 时不能宣称 N17 全完成。**不能自行生成第二套集合真值或自动把所有 context 根现场等同集合。

### N21：集合图形适配

两个 CollectionView 当前 CSS 固定248×244。nodes 适配器可以使用现有 `worldWidth/worldHeight` 计算均匀适配比例，放在已有节点几何中，不写节点尺寸、不创建 ResizeObserver/Camera owner。先保留当下工作流入口、缺目标禁用原因、真实 child navigation。成员封面必须来自现有真实媒体字段；没有就诚实空态。

### N14：采用当前 Pin owner

可直接消费 `useOptionalLcosColorPins()`：

- 目标：`colorPinTargetFromEntityRef(projectId, ref)`，与 Arc 当前 authoring 一致。
- key：`colorPinTargetKey(targetRef)`。
- 成员：`membershipsByTargetKey.get(key)`。
- 颜色/标签：根据成员 colorPinId 查询 canonical `snapshot.definitions`。
- 点击：在当前节点目标上调用现有 `openAuthoring()`，不写新成员 store。

接线前请导航组确认 target 语义，尤其 entity / artifactView / surface 的边界。统一节点角标必须放到 species 共用节点层，不能只让文字/图片拥有真实 Pin。GLYTH 有独立 body，由主代理补接；本组不改 GlythNodeBody。选择轮廓和引用标识不得被 Pin 替代。

## 文件独占边界

- 可改：`huabu/apps/web/src/lcos/nodes/*`，但不改 `GlythNodeBody.tsx`；`ui/source/*`；source 相关 `ui/families/*`。
- 不改：`ui/context/ContextCollectionView.tsx`、`ui/workflow/WorkflowCollectionView.tsx` 及其 shared CSS；shared tokens；composition root；NodeWrapper；Core/store/canonical navigation owner。
- 若以上外部文件必须变更，由主代理协调相应 owner，不用静默绕路。

## 验证安排

1. 复用现有 seam / density / species 测试，补有价值的回归：真生成图片仍含真实 mediaSrc、未绑定 native 节点继续走 native、无 Pin 不出现标记、两种真实颜色不会随图尺寸变化。
2. 图像 DOM 测试：404 -> 失败反馈 -> 重试；URL 更新消除旧错误；loading 与成功不并存。仅 CSS contain 字符串不算完成，浏览器用横/竖/透明图片截图核对。
3. LOD 以真实 NodePresentation 输入检查 mark/summary/working/reading 与节点数量封顶；同一个节点在缩放过程中不改 geometry/selection。使用长中文、长英文、空正文。
4. collection 使用248×244及用户既有小/大尺寸，在真实画布核对外轮廓、hover边界、可点击入口与 Arc 避让。普通集合若没有生产数据只能明确标未验证，不能种假的数据冒充。
5. 浏览器再核对右键、双击Reader、拖动、resize、选择、撤销/重做仍走现有 caller。类型检查和单测通过仅代表代码层，不替代截图和真实交互验收。

## 本批明确未解决

GLYTH行为/nearfield/drop、完整集合成员展开及多成员归属、Colony、视频/网页专用形态、完整审核状态、音频真实波形、源版本历史Reader对齐仍在全量盘点中保留。本批不会用已接CSS或data-figma把这些事项标成完成。
