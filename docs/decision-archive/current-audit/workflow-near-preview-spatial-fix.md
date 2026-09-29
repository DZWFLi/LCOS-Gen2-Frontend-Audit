# Workflow 空间层级与近卡预览修复

日期：2026-09-27。工作树：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926`。

结论：修掉了“轻预览操作盖住封面”这一处真实差距；Workflow 整体不能宣布完成。手牌里混入技能、材料、会话是另一项明确语义回退，已交根代理统筹恢复原入口职责，未擅自删功能。

## READ_SOURCE

- 最终语义：`_cabin/06_Figma/LCOS_GEN2_Figma设计合同轻包_仅MD_20260914__unzipped/03_ContextWorkflow产品语义裁决.md`、`04_ContextWorkflow已有成果纠正.md`。
- 后续纠偏：`_cabin/03_审计包与返工/LCOS_Gen2_UX施工卡与Figma审计包_20260915_ef4c214/03_HANDOFF/GEN2_ContextWorkflow_UX纠偏_20260914.md`、`GEN2_ContextWorkflow_子现场进入返回与保存队列收口_20260915.md`。
- 原路由：`_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T4/45_T4_to_T5_ProfessionalWindow_and_ProfessionalBodies_ExactBlueprint_v1.md` §6；同套 core_plans 的 V3、ThreeVideoIntegrated HTML 仅保留未被后续纠正的语义，不复制假数据/时间驱动状态。
- 生产：`huabu/apps/web/src/lcos/surfaces/workflow/WorkflowWorksite.tsx`、`WorkflowCardPool.tsx`；`ui/workflow/WorkflowHandView.tsx`、`WorkflowTaskCardView.tsx`、`WorkflowTaskCardFace.tsx`、`workflow-hand.css`。

## ADOPTED

空间层级：真实 Workflow Worksite 画布在下；手牌/卡池是临时呼出层；单击进入近卡轻预览；双击或 Enter 交给原导航 owner 进入真实现场。取用只加入草稿，打开现场走明确 workspace，续接依赖真实 origin；三者不合并。

本轮仅修改 `huabu/apps/web/src/lcos/ui/workflow/workflow-hand.css`：

1. 当前预览卡保留完整封面，操作组移至卡右侧。
2. 预览期间其他任务卡暂时隐藏，关闭预览后恢复同一批实体，未新建窗口/状态。
3. 600px 以下操作组排到卡下，沿既有手牌容器滚动。
4. 已确认公共族样式令 article 为 overflow:hidden，因此只对手牌中 data-preview=true 的卡解除裁切；媒体封面仍保留其内部裁切。
5. 原取用、多个现场选择、来源缺失禁用、Esc 与返回焦点都复用原回调。

## VISUAL_SOURCE

- 最终统一稿 `unification/workflow-final.png` / 5388:22998：真实画布，不能替换成手牌列表。
- 手牌 5140:3012、5140:4300：图像占大面积，光幕上托，封面身份清楚。
- Page 13 **B03 5344:752** 结构 JSON：卡片 x542/y388、230.72×333.72；三个动作 x820、216×44，y429/483/537；返回手牌独立在 y631。动作位于卡右侧，而非覆盖封面。
- 设计说明 5344:998 原文：“三动作区分引用、导航、会话续接。本样例无来源，续接不可用；Portal能力待盘点后复用，不缩成仅返回。”
- 窄屏采用同一层卡下布局，并未声称逐像素复刻所有原稿。

## RETIRED

- 退役：生产近预览 `inset:48px 12px auto` 将不透明操作组压在封面上的呈现。
- 未退役：真实 Worksite、真实数据取用、三动作职责、workspace 多候选选择、缺来源禁用。
- 没有改 Core、Shell 根、Stage、Context、Composer、WorkflowWorksite.tsx，也没有修改 Figma。

## VERIFIED

真实浏览器：`http://127.0.0.1:5286/projects/lcos-gen2-dev/main`，由正常呼出手牌入口进入，真实现有 Workflow 条目触发预览。

- 修前：`workflow-preview-before.png`。
- 修后：`workflow-preview-after.png`；按钮实际 elementFromPoint 命中为 true。
- 390×844：`workflow-preview-narrow.png`。操作组 x83→307，全部在视口内；封面 bottom305、操作 top403，无重叠；可滚动至底部。
- 返回手牌后原18张卡恢复，没有复制实体或遗失卡片。
- 原数据无 previewUrl，因此显示“暂无预览”；未拿无关宣传图片伪造真实封面。
- 3 个针对性测试文件全部通过：Stage6Presentation、useLayerReturnFocus、WorkflowCardPool.navigation，共19测试。
- `git -c core.safecrlf=false diff --check` 通过。CSS局部修复未扩大跑全仓测试。

## UNRESOLVED

1. **高优先级：手牌数据来源违背最新裁决。** 9/14纠偏第8/39/52行明确 `kind === workflow`，搜索只搜工作流，artifact/conversation归Assembly/会话入口。当前 toWorkflowHandCards 将 skill 映射task lane，同时附material/receiver lane。真实手牌18张任务卡中只有1个workflow、17个skill，导致小集合也一直进入大卡池模式。Page13 B03是单工作流卡取用/导航/续接，未发现其要求上述通用库混排。建议由根代理将这些现有能力保留至Assembly/WorkView，再恢复Workflow池只含工作流。
2. 真实 Workflow 区域/子现场映射仍取决既有 owner。多候选提示和选择存在；缺 region/origin producer 不应从图片推导。
3. 手面的真实封面数据缺失，不应把暂无预览误报为Figma图像密度已达标；应补真实资源生产/映射。
4. 真实 Workflow 画布的步骤、关系、Run反馈取决生产数据；本轮没有把 Figma 静态示例硬编码进去。
5. 光幕对底层画布的视觉降噪仍可深化，当前背景连接线会穿过近预览操作附近。保留真实底层是正确层级，但视觉对比尚未达到原稿。

推荐顺序：先恢复工作流池的语义范围并保留其他入口 → 验证真实workflow封面/现场映射 → 深化光幕与底层注意力衰减 → 验证多任务/窄屏与近卡进入返回。

## 同批追加：Workflow 专属数据范围已修复

根代理确认9/14裁决后，原 UNRESOLVED 第1项已经修复，不再是待办：

- `WorkflowCardPool.tsx` 仅保留真实 workflow；删除这个临时手牌里的 skills 请求与材料/receiver混排，不删除任何 Assembly、Glyth、WorkView 的底层能力/入口。
- 既有 `professional/useWarehouseBrowse.ts` 增加可选第四参数 kind，复用 Core 已有 `kinds` 过滤；默认调用不变。kind 纳入回调/effect依赖，切换会取消旧请求、清空items/cursor，序列号继续拦截忽略abort的旧响应。分页与搜索继续透传真实cursor/search。
- 已缓存卡片时，分页 loading 使用 sr-only 状态反馈，不再通过 py-8 插入块把卡片推下去；读取按钮保留禁用状态。
- 空态保留真实“还没有工作流卡片”；不额外编造创建入口。
- 引用 identity 来自 `item.entityRef.type/id`，视觉 kind 单独保留。实际 fixture 回包 type=workflow、id=scope-workflow-…；当前合同不接受裸 scope 类型，没有绕过类型伪造支持。回归用合同允许的 artifact 引用 + workflow 呈现组合验证不改写原身份。
- 接收者缺失指引改为既有 Glyth/会话入口，不再错误指向已经移出的卡池接收者。

新增/更新测试：`WorkflowCardPool.test.ts`、`WorkflowCardPool.navigation.test.tsx`、`useWarehouseBrowse.test.tsx`。最终三文件14测试通过；合法引用测试修改后单文件4测试再次通过。近预览此前另外两文件15测试通过。末次整仓tsc因机器 Node Zone OOM中断，不能算通过；此前type=scope测试类型错误已改成合法合同值。最终类型检查交根代理整合时串行执行。

新增真实浏览器证据：

- Main只有1张工作流时为 hand，原17个skill不再撑成pool：`workflow-only-hand.png`。
- 搜索技能名 `lcos-active-path` 返回空；搜索“真实”命中真实workflow。实际请求分别带 `kinds=workflow&limit=50`，不是前端假过滤。
- Workflow路由正常呼出同一张真实卡：`workflow-only-worksite.png`。
- 20张压力只读模拟：`workflow-only-highcount-simulated.png`，浏览器临时响应模拟20个workflow，进入pool；未写存储，已unroute并reload恢复真数据。这是明确标注的呈现压力模拟，不能算已有20条真实业务数据。
- **旧37张/18张混skill证据已被专属workflow验收替代，不能沿用为真实workflow高数量验收。**

本批总文件：WorkflowCardPool.tsx、workflow-hand.css、useWarehouseBrowse.ts、WorkflowCardPool.test.ts、WorkflowCardPool.navigation.test.tsx、useWarehouseBrowse.test.tsx。其余文件为共享树其他代理改动。

最终真实Workflow取用验证：点击用于当前会话后，卡片 state=草稿中，状态文案为‘真实工作流导入验收：已加入草稿，尚未发送’；续接原会话按钮 disabled=true。未发送外部消息。
