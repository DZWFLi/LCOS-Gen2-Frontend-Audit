# Glyth近场与续工：只读复核短清单（附订阅修复）

日期：2026-09-26。主代理正在修G01；本子代理未修改GlythNodeBody、ComposerHost、WorkView。G08按主代理授权在既有store修复。

结论：现有前端足以先补“原位继续、状态主动作、紧凑模式确认、真实错误恢复”。不需要另造会话系统，也不需要把Figma全部153种状态都做成独立卡片。

## 权威与采用顺序

- T3原卡 §20：2–4行compact、内部滚动、同草稿跨local/work-view/suppressed；不得大sidebar、多选自动呼出、常驻Provider selector。
- T7 V2 §9、§10、§12：继续/原生完整fork/精选新建/空白新建四语义不同；history/context/checkout分开；unknown不可重发create；设计variant不等于业务状态。
- 后续R5产品化裁决（20260917）§7–8、§13–18：Glyth是空间锚点；ready继续，待回答回答，待复核复核，执行中看进度；工程明细留Diagnostics。它对页11/12的细状态进行产品层收敛，不是删掉底层保护。
- Figma九面5388:96为主壳；页11续工与页12组件状态补齐，不能用旧页背景覆盖主稿。

## G01 · 原位继续无需先打开大工作窗（P1）

- Figma：5243:50、5246:59、5249:104、5280:669。
- 真实 caller：`navigation/LcosActionArc.tsx:267`；`composer/LcosComposerHost.tsx:97`；`professional/ConversationWorkViewBody.tsx:188`。
- 可复用能力：CoreCollaborationClient.readSession/readDiagnostics/send；shell.openComposer；既有messageId/continuationOperationId。
- 修改：复用WorkView的canSend+已确认operation准备同一近场Composer。operation读取失败呈现重读，不提示用户必须绕到工作窗。继续当前会话不创建新Run/新Glyth。
- 验证：从真实Glyth Arc继续→读取→输入→send；不同会话/切项目期间异步结果不串目标；无operation或canSend=false诚实阻断。

## G02 · Arc主动作跟随真实用户态（P1）

- Figma：5243:50、5249:104、5279:147。
- 真实 caller：`nodes/GlythNodeBody.tsx:48`；`navigation/LcosActionArc.tsx:140`；`apps/web-gen2/src/interaction/nodeCommandModel.ts:160`。
- 可复用能力：projection.userState/activity.pendingInputId/recentReturns/capabilities；readPendingInput+answerInput；readReviews+approve/retry；shell.openWindow。
- 修改：ready继续/打开；needs_user有pendingInput主动作回答，有pending_review主动作复核；working看进度/打开。More仍保留低频功能。扩既有shared command model，Arc与右键共用，禁止第二命令表。
- 验证：相同Glyth状态切换时主动作正确；回答复用原Run，复核保留expectedBaseRevisionId；未知能力禁用并说明。

## G03 · 四种续工模式回到Composer渐进展开（P1）

- Figma：5246:59、5249:415、5249:726、5249:1044、5249:1355。
- 真实 caller：`professional/ConversationWorkViewBody.tsx:209`；`professional/ConversationWorkViewBody.tsx:300`；`professional/conversationContinuationActions.ts`；`composer/LcosComposerHost.tsx`。
- 可复用能力：resume/newSession(selected_context|blank_new)/fork；retainContinuationIntent；capabilities.canResume/canSelectedContext/canBlankNew/canFork；newSession input.checkout=shared|isolated。
- 修改：不要四个常驻黑pill占据工作窗；从More显式选模式，在现有Composer内显示继承范围与确认。不支持原生fork不能自动退精选新建。history/context/checkout三轴分开；目录能力没真实证据时不装作可选。
- 验证：空白不带草稿refs；精选仅明确ordered refs；失败重试同operationId；只有确认后调用真实命令。

## G04 · 来源确认、提交快照与当前草稿分离（P1）

- Figma：5249:1665、5249:1975、5280:239、5280:282、5280:325、5280:368。
- 真实 caller：`composer/LcosComposerHost.tsx:159`；`professional/conversationContinuationActions.ts:16`；`professional/ConversationWorkViewBody.tsx:214`。
- 可复用能力：ReferenceStore ordered draft；retainContinuationIntent.orderedReferences；readDiagnostics.promptReceipts[messageId].orderedReferences/contextResolution；shell草稿key。
- 修改：在当前Composer增加可折叠真实引用确认，发送时保留本次snapshot；继续输入是另一个草稿。发送回执可从promptReceipts回显。新建session的RecoveryProjection未暴露operation-level orderedReferences，跨重启不能伪造完整提交清单。
- 验证：发送过程中改草稿不改变已提交payload；失败重试稳定messageId；两个目标之间不会串草稿或把历史receipt当当前输入。

## G05 · 错误、离线、未知结果、恢复不拍成同一个error（P1）

- Figma：5251:407、5251:674、5251:941、5253:509、5253:776、5252:453、5280:468、5280:618、5280:668。
- 真实 caller：`composer/LcosComposerHost.tsx:72`；`ui/nearfield/composerViewTypes.ts`；`ui/nearfield/LcosComposerView.tsx`；`professional/RecoverySection.tsx:14`。
- 可复用能力：CollaborationProductErrorV1.code/retryable；readDiagnostics operations.status/steps/cancel/allowedActions/revision；recover(expectedRevision)；既有feedbackAction槽。
- 修改：把已提供的unknown/offline/reconciling/blocked视觉状态真正接入。unknown给核对原操作，不给直接新建；创建失败但外部已存在仅恢复绑定；取消需等确认。RecoverySection字典漏了现合约recover_external（仍写retry_external_create），产品按钮要用中文真实动作。
- 验证：断网/timeout不会显示已失败或成功；重试不新operation；requiresFreshRead实际读取后使用最新revision；cancel未知不会提前移除。

## G06 · 伴身种子和创建阶段取代工程卡（P2）

- Figma：5250:319、5250:593、5250:860、5250:1130。
- 真实 caller：`nodes/GlythNodeBody.tsx:48`；`professional/ConversationWorkViewBody.tsx:240`；`professional/RecoverySection.tsx`。
- 可复用能力：readDiagnostics operation.status+steps+cancel；已有GlythBodyView；现有shell/presentation局部状态。
- 修改：现newSession只提交journal intent，不能把accepted receipt画成外部已创建。阶段可在原Glyth旁用非持久seed/轻提示表现，成功提交不要强制打开Diagnostics。无需新增Entity/Session/数据库；节点定位需等待真实投影。
- 验证：正在创建不出现第二canonical会话；external已创建但bind失败不再create；projection未ready不声称能定位。

## G07 · 完成动效与轻来源尾迹接真实确认（P2）

- Figma：5250:1397、5250:1670、5262:1078。
- 真实 caller：`nodes/GlythNodeBody.tsx:153`；`ui/glyth/GlythBodyView.tsx`；`ui/glyth/glythPresence.ts:90`。
- 可复用能力：GlythBodyView.reaction {id,kind}；现presence已防remount重播；readDiagnostics确认stage或projection/recentReturns真实新id。
- 修改：生产body当前不传reaction。只对新确认的真实完成事件触发一次burst/bounce，之后收成来源轻标；不得按钮点击/drop release就庆祝。主稿没有真实source lineage字段时只显示能证实的mode/operation来源，不画编造关系。
- 验证：一次完成一次动效；reload不重播；unknown/失败不成功动效；reduced-motion尊重现owner。

## G08 · 同会话多消费者共享订阅生命周期（P1）

- Figma：5243:50、5280:669、5388:118。
- 真实 caller：`collaboration/collaborationSessionStore.ts:113`；`collaboration/useCollaborationSession.ts`；`composer/LcosReceiverIdentity.tsx:12`。
- 可复用能力：现有project级SSE与CollaborationSessionStore。
- 修改：已修：Set改为同项目同会话消费者计数；每事件每会话只刷新一次；最后会话及Artifact订阅都退出才关SSE。保持同一个store和SSE owner。
- 验证：已过12项回归（含8项facade约束）：3消费者逐个退出、同项目两会话、Artifact监听共用、重挂及跨项目同ID。

## 不要越界补假的部分

1. Native full-history fork、handoff当前facade仍可能fail-closed；以真实能力为准，不为了页11/12视觉把不可用按钮写成成功。
2. `readDiagnostics`当前catch返回undefined。UI不能把网络失败当作“读取成功但没有operation”；应显示无法读取和重读入口。
3. 创建session的operation级orderedReferences虽在journal中有，但RecoveryProjection未对外提供。当前前端可保留本次提交snapshot，不能声称跨重启已还原完整历史清单。
4. GLYTH仍有34/92两段硬切（N30），连续形体与Arc锚点接管另留节点表现批次，不混进本次续工语义改造。
5. Glyph/read receipt 等工程ID只供内部定位和Diagnostics；前台按钮必须用用户可理解中文。

## 原始资料位置

- `E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T3\LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md`
- `E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T7\GEN2_T7_Glyth续工_AgentAdapter源码蓝图施工正本_V2_20260911.md`
- `E:\TRAE项目\LCOS0.1收口\_cabin\04_R系列与T5规划\前端冲刺\LCOS_Gen2_R5_Glyth_ConversationSession_UX产品化设计施工规范_20260917.md`
- `E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\design_assets\T7_Figma_20260911\组件状态与完整文案.md`
- 当前源码相对路径以 `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos` 为根；列明apps/web-gen2的条目以仓库根为准。
