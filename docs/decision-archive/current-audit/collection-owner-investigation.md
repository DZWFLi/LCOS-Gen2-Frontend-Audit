# 普通集合：producer、展开与Drop的源码追查

日期：2026-09-26；仅只读调查，没有修改Core、schema或canonical owner。

**结论：旧集合能力确实存在，不能笼统写成“没有集合后端”。** 当前缺口分三层：Gen2主画布没有消费普通集合；Huabu展开/折叠的薄接缝未落；Phase B规定的新Collection身份和成员事务仍未看到正式生产实现。旧Scope/Presentation兼容API不能被偷偷升格成新owner。

## 原稿依据

- T1《Exact Implementation Input》§18–20：membership归Core，geometry归Huabu；一canvas一authoritative projection；折叠只作semantic receiver；右拖source不动。
- T1《PhaseC1 Step2A Collection VisibleHost ExactSource Plan》§2.1（180–221行）明确旧Presentation/memberViewIds为LEGACY_COMPAT/MIGRATION；§7–8（632–821行）要求显示折叠与session fold偏好；§15.1（1197–1222行）要求T6提供正式collection ref/list/read/membership事务。
- T3《全范围Exact》§15、§17：target owner写membership/mapping，不能由视觉决定写入或移动。
- T4《C1-3 Assembly ExactSourcePlan》67、825–851、2852行：context/workflow/collection→scope只是兼容迁移；Assembly不拥有成员关系。Round6复核36行重复该结论。
- T5 B05《Collection源码视觉蓝图》§25–27：HTML中的本地Set/Map、固定绝对坐标、window pointer listener不能进入生产；display/host/proxy仍是planned薄接。旧NC09采用Gen1原地展开体验，但不作为恢复旧真值owner的授权。
- 用户后续已经允许自动排布，故保留整齐整理需求，不重新提出产品确认。自动排布仍与membership、右拖source preserve分开。

## C01 · 普通集合身份与创建

**分类：已有后端兼容能力未接Gen2主画布**

已存在：ScopeKind包含collection；ContextSnapshotService.branch真实upsert collection scope并创建同Artifact的新View；POST /projects/:id/graph支持upsert_scope/upsert_artifact_view，带graphVersion与事务/包含深度检查。

缺口/边界：Gen2 facade/reconciler只采纳workflow scope；CoreProjectClient尚无graph mutation/branch包装。这个层面不能说后端完全没有集合。

- [index.ts:57](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/domain/src/index.ts:57)
- [context-snapshot-service.ts:135](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/context-snapshot-service.ts:135)
- [projects.ts:307](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/routes/projects.ts:307)
- [metadata-repository.ts:2003](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/metadata-repository.ts:2003)
- [projects.ts:17](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/backend/projects.ts:17)

## C02 · 集合进入唯一projection

**分类：前端投影缺口；正式身份采用依赖上游**

已存在：既有ProjectionBinding支持same entity+canvas+kind唯一绑定，projectBatchWithReport可复用。

缺口/边界：reconciliationRunner:300只筛workflow；projectionFacade:322只描述workflow；普通collection即使已在Core graph也不会自动进入Main。不能只扩CSS。若接旧scope可做兼容读投影，但不能称正式Gen2 Collection identity已迁移完成。

- [reconciliationRunner.ts:299](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/spatial/reconciliationRunner.ts:299)
- [projectionFacade.ts:318](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/host/projectionFacade.ts:318)
- [projectionBinding.ts:14](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/spatial/projectionBinding.ts:14)
- [projectToSpaceProjection.ts:251](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/spatial/projectToSpaceProjection.ts:251)

## C03 · 真实展开host与排布

**分类：现有Huabu owner可做前端薄接**

已存在：Huabu Frame已有free/column/row/grid、parentId、fit/hug、structured relayout、拖动重归属；T1要求Collection host用该机械，不能再建geometry库。

缺口/边界：当前CollectionNodePresentation只是248x244显示轮廓，生产普通collection host未接Frame。缺host-managed身份与membership成功后SET_NODE_PARENT适配；不能让native auto-reparent先于semantic commit。

- [FrameNode.tsx:109](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/components/Nodes/frame/FrameNode.tsx:109)
- [projection.ts:22](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/packages/shared/src/canvas-engine/frame/projection.ts:22)
- [resolveNodeDragStop.ts:156](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/handler/canvasCommand/resolvers/resolveNodeDragStop.ts:156)
- [uiIntent.ts:116](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/handler/canvasCommand/uiIntent.ts:116)
- [CollectionNodePresentation.tsx:35](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/CollectionNodePresentation.tsx:35)

## C04 · 折叠与原地恢复

**分类：前端薄seam缺失，不是Core collapse字段缺失**

已存在：T1 Step2A §7–8规定expanded geometry始终由Huabu保存；fold是session-only display；不能改Core或另存一份展开坐标。

缺口/边界：CanvasHostExtension现有body/host chrome seam不能隐藏真实host children和替换render-only bounds；需要同Canvas的中性display projection和唯一session fold偏好。ArtifactView.collapsed虽存在，是旧view字段，不能拿来当新Collection truth。

- [types.ts:133](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos-seam/types.ts:133)
- [index.ts:235](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/domain/src/index.ts:235)
- [index.ts:649](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/contracts/src/index.ts:649)

## C05 · many-to-many持久成员

**分类：旧能力真实存在，但原稿明确仅兼容/迁移，不能冒用**

已存在：旧模型通过ArtifactView.scopeId让一个Artifact有多个View；Presentation可跨scope持有memberViewIds/memberEntityRefs，CAS保存并支持membership ChangeSet。

缺口/边界：T1 Step2A §2.1明确禁止把Gen2 Collection membership写Presentation.memberViewIds；T4 C1-3也将context/workflow/collection→scope限为迁移。正式Collection ref/list/read/add-remove membership事务未在当前domain/contracts/routes/client查到。缺的是新语义owner落地，不是SQL不能存数组。

- [index.ts:228](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/domain/src/index.ts:228)
- [presentations.ts:6](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/contracts/src/presentations.ts:6)
- [presentation-application-service.ts:65](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/presentation-application-service.ts:65)
- [presentations.ts:122](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/routes/presentations.ts:122)

## C06 · Drop到普通Collection

**分类：真实后端目标通道缺失**

已存在：AssemblySourceRef允许collection作为来源；AssemblyTargetRef仅project/main/workspace/conversation/context/workflow/scene。

缺口/边界：AssemblyApplyService没有collection目标分支；伪装context会因scope.kind校验被拒绝。正式membership命令需T6沿既有canonical owner补；前端不能用source支持反推target已支持。

- [assembly.ts:18](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/contracts/src/assembly.ts:18)
- [assembly.ts:35](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/contracts/src/assembly.ts:35)
- [assembly-apply-service.ts:153](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/assembly-apply-service.ts:153)
- [assembly-apply-service.ts:280](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/assembly-apply-service.ts:280)

## C07 · 成员代理与代表层

**分类：前端表现可做；依赖真实成员读模型**

已存在：T1规定同一canvas只一个authoritative projection；其他集合显示非编辑proxy/引用preview。T5 B05已有原型和CollectionHostView/collectionVisualModel可借鉴视觉。

缺口/边界：production缺canonical membership→当前binding/parent→hosted或proxy的派生resolver；禁止搬demo local Set/Map做durable truth。复用现有媒体轻预览，只取真实代表成员，不挂一百个重renderer。

- [projectionBinding.ts:117](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/spatial/projectionBinding.ts:117)
- [CollectionNodePresentation.tsx:35](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/CollectionNodePresentation.tsx:35)

## C08 · 排布与左右拖差异

**分类：原卡优先级需明确采用；非新增产品问题**

已存在：T1/T3统一：右携带只加关系不移动source；collapsed不autoexpand；expanded左drop成功后才托管；普通collapse/reopen恢复原几何。

缺口/边界：用户后续已允许加入后自动排布，因此不用再询问要不要整齐排布；仍不可覆盖用户已存的重新展开布局，或把right carry偷偷物理移动。T5较早NC09保留旧Scope口径，只能当体验参考，不能压过T1/T4正式owner裁决。


## 可以继续做、需要上游补什么

1. 前端可直接继续：共享轻预览、文件夹/书册形态、hosted/proxy视觉、同一Canvas的中性display-only seam、唯一session fold状态、复用Huabu Frame排布/SET_NODE_PARENT后的恢复检查。这些不需要新建geometry或membership owner。
2. 后端已有但尚未接：旧collection scope读/创建、快照branch、通用graph mutation和Presentation CAS。可以作为历史资料迁移与只读兼容输入；不能用它们直接替代Phase B正式Collection membership。准确通用mutation路由是 **POST /projects/:id/graph**，不是 `/mutations`。
3. 真实上游缺口：正式Collection ref/list/read/member add-remove事务和Collection target适配。需要T6在当前owner上明确兼容映射/补接口；然后前端才能安全注册真实drop目标、展示计数、处理成员代理。
4. 顺序：先给正式read/identity与membership receipt接缝→唯一projector进入Frame→显示折叠/还原与proxy→semantic commit后空间托管→左右拖/恢复/多集合验收。不能先用Frame overlap假装durable入会。

## 校正前面盘点的用词

- “普通集合producer缺”应精确为“Gen2当前主画布投影producer缺；旧Core Scope集合与snapshot branch存在”。
- “展开geometry owner缺”应改为“Huabu owner和机械存在，Collection薄manifestation/display seam未接”，不需要新geometry库。
- “Collection target缺”仍成立，已通过类型、路由分流和scope.kind拒绝路径交叉证实。
- 不运行生产写入试验，也没有假造collection数据用于截图；本报告为源码+原稿证据。
