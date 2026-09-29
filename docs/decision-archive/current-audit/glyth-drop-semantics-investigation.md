> 已被 2026-09-27 用户明确裁定纠正：Glyth 本体 Drop 是持久会话上下文；仅 Composer Drop 是本次引用。本文保留历史排查过程，不再以其中单次引用的建议指导施工。

# Glyth 投送语义与会话材料链路核对

日期：2026-09-26。范围：只读追查原稿、9/17收敛与当前生产源码；不改 Core、canonical owner 或产品语义。

## 结论

**当前 Glyth 投送确实只加入待发送草稿，但这有 9/17 实施交接依据，不能仅凭更早的 T3 稿直接判成错误。** 旧 T3/T5 明确的长期会话材料映射，与新稿的“交给 Conversation”没有写清合并关系。该项应标为“草稿链已接、长期语义待对齐”，不宣称全部完成。

独立确认的源码缺口是：旧长期映射可以通过 Assembly 真写入；Reach 读取却没有按同一实体身份解析，续工 bundle 也没有自动读取该关系。仅补一个写入调用会制造新的“看似成功”。

## 文档采用顺序

1. 2026-09-07 T3 §17与T5 B03/R1：身体投送=durable Conversation Context Mapping；Composer strip=本次Reference，二者分离。
2. 2026-09-17收敛V1 §15：身体=把对象作为Reference交给Conversation；Composer=加入当前draft；WorkView=当前context/composer reference。未明确长期关系的退场或替代。
   依据：[LCOS_Gen2_CollaborationRuntime_GlythUX_收敛总施工方案_V1_20260917.md](<E:\TRAE项目\LCOS0.1收口\_cabin\04_R系列与T5规划\前端冲刺\LCOS_Gen2_CollaborationRuntime_GlythUX_收敛总施工方案_V1_20260917.md:825>)。
3. 同日实施交接明确写“owner = composer target + draft references”，随后 BatchB 要求保留当前 CollaborationTarget 方向。这是较新实现的明确依据；它没有完整解释旧长期映射如何迁移。
   依据：[GEN2_Gate2-5_CollaborationMigration_20260917.md](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\docs\handoffs\GEN2_Gate2-5_CollaborationMigration_20260917.md:35>)；[LCOS_Gen2_BatchB_接口统一封口与下一轮总施工规划_20260917.md](<E:\TRAE项目\LCOS0.1收口\_cabin\04_R系列与T5规划\前端冲刺\LCOS_Gen2_BatchB_接口统一封口与下一轮总施工规划_20260917.md:247>)。

本调查把历史计划当设计证据，而不是越权修改Core的授权。当前最新已接功能保留；需要总审计确认上述差异，不能由一次UI修复悄悄做产品裁决。

## 逐项证据与下一步

### GD01 · Glyth 身体投送：旧长期映射与新草稿接法未明确合并（P1）

分类：产品语义版本差异；当前 draft 实现保留，不擅自改变。

- [LCOS_Gen2_CollaborationRuntime_GlythUX_收敛总施工方案_V1_20260917.md](<E:\TRAE项目\LCOS0.1收口\_cabin\04_R系列与T5规划\前端冲刺\LCOS_Gen2_CollaborationRuntime_GlythUX_收敛总施工方案_V1_20260917.md:825>)：§15 Glyth为交给Conversation；Composer明确为current draft；未说明durable弃用。
- [GEN2_Gate2-5_CollaborationMigration_20260917.md](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\docs\handoffs\GEN2_Gate2-5_CollaborationMigration_20260917.md:35>)：9/17交接明确owner=composer target+draft references。
- [LCOS_Gen2_BatchB_接口统一封口与下一轮总施工规划_20260917.md](<E:\TRAE项目\LCOS0.1收口\_cabin\04_R系列与T5规划\前端冲刺\LCOS_Gen2_BatchB_接口统一封口与下一轮总施工规划_20260917.md:247>)：后续BatchB确认该CollaborationTarget方向保留。

建议：采用9/17真实已接draft行为，不宣称长期保存；总审计明确旧durable入口是被替代、保留独立入口，还是同动作双层职责。不得先写relation倒逼产品决定。

验证：区分投送后未发送、发送成功、重载、切换会话、再次续工五个状态；证明每步真正保存与发送了什么。

### GD02 · 成功反馈只证明加入草稿（P2）

分类：可沿现有前端owner薄改。

- [LcosHostOverlay.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\LcosHostOverlay.tsx:272>)：addEntityToDraft+openComposer，无持久化或发送请求。
- [dropCommitRouter.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\drop\dropCommitRouter.ts:92>)：成功文案“引用已交给会话”易被理解为已发送/长期记住。

建议：保留preview=execute与无二次选择；成功反馈准确写“已加入该会话的待发送引用”，不要假装已传给Agent或已持久化。根代理拥有该文件，本调查不改。

验证：drop一次只加一次引用、不自动send；Composer能看到真实引用；失败与位置失效不显示success。

### GD03 · 旧长期绑定已有真实写入能力（P1）

分类：已有Core能力，不等于已闭环。

- [assembly.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\backend\assembly.ts:49>)：CoreAssemblyClient.apply可调用真实assembly/apply。
- [assembly-apply-service.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\local-core\src\assembly-apply-service.ts:398>)：linked session artifact为source，view/note/scope/workspace为target；MutationSafety upsertRelation并返回ChangeSet。

建议：不要造Glyth数组。是否启用由GD01裁定；就算启用也必须与GD04/GD05一起完成。artifact来源必须是真实artifactViewId，不能把artifactId当viewId。

验证：真实链接会话；正确项目；重复绑定幂等；未linked或无artifact endpoint诚实失败；源对象不移动。

### GD04 · 长期映射写入身份与Reach读取身份不一致（P1）

分类：现有后端owner缺口；本轮不改Core。

- [assembly-apply-service.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\local-core\src\assembly-apply-service.ts:465>)：source=conversationArtifactId；target type=view/note/scope/workspace。
- [conversation-identity-service.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\local-core\src\conversation-identity-service.ts:141>)：conversationKeys仅connectedId/conversationRef/sessionId，未添加artifactId；target仅getArtifact，无view/note/scope/workspace解析。

建议：由原Core owner统一规范化真实端点；不能在前端补一个假bound列表掩盖。这个不一致不取决于Glyth投送最终采用临时还是长期。

验证：实际Assembly绑定后的Reach立即和重载后均含同一实体；分别覆盖view/note/scope/workspace且项目不串。

### GD05 · 长期映射未证明进入续工Context bundle（P1）

分类：现有后端owner缺口/待产品语义确认。

- [conversation-continuation-service.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\local-core\src\conversation-continuation-service.ts:362>)：send只取options.orderedReferences；随后经provider resolver与attach receipts。
- [conversation-continuation-service.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\local-core\src\conversation-continuation-service.ts:982>)：continuationBundleForRowV1仅按显式orderedReferences或journal row refs组装，没有读conversation_context relation。

建议：不要把“relation写成功”当“下一次Agent拿到了”。若长期映射必须进入后续协作，应由现有Core context resolver定义与显式refs合并、顺序、去重和移除行为，不建前端第二上下文真值。

验证：绑定→关闭Composer→重新续工；检查真实provider attach/send receipt是否包含材料，以及取消绑定后不再携带。

### GD06 · 设计证明与浏览器动作证明分开归档（P2）

分类：验证缺项。

- [inventory-nodes.json](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\inventory-nodes.json>)：N31 对应Figma5101:1243与5344:999；外观接收动画不证明durable mapping。

建议：目前标“draft链已接，长期语义与链路未闭环”，不标全完成。保留当前真实轻反馈、空间命中与来源不移动。

验证：当前已跑的指针投送证明交互；未来长期链路需独立真实API/重载/send回执证据。

## 施工边界与顺序

1. 前端可立即纠正“已交给会话”的反馈，使其与真正发生的待发送引用一致；保留无二次选择、同一Composer owner。
2. 总审计合并旧durable与新draft的产品语义，不新增独立UI系统。
3. 原Core owner核对映射写读实体规范化；有真实能力就接原能力，不伪造前端绑定状态。
4. 仅在长期语义仍需携带时，把真实mapping接入已有context resolver，并验证provider真实receipt；不以“行已写库”代替上下文送达。
5. 最后才补Figma对应durable轨道/卫星与临时Reference消散的状态区分。

本次未执行任何 Core 写入，没有新增会话、关系、集合或材料。当前生产 draft 链与未来长期映射链分开记账。
