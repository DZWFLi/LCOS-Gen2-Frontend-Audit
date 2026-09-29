# 装配与特殊视图全量盘点

32 项。源代码已核对，浏览器逐状态验证尚未完成。采用九面统一稿、13页增量及后续原话裁决；旧 V3 不得覆盖最新语义。

## S01 装配四来源、搜索与分页

- 状态：保留；严重度：无。
- Figma：5046:64、5102:1151、5346:1416。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/AssemblyBody.tsx`。
- 证据/行动：真实服务端搜索、cursor、取消过期请求已接通。

## S02 装配瀑布流与预览

- 状态：部分接通；严重度：P2。
- Figma：5346:1666、5346:1885、5202:369、5202:678。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/AssemblyBody.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/professional-assembly.css`。
- 证据/行动：真实媒体、CSS columns已有；失效封面、窄窗与大量素材待实测。

## S03 装配当前目标跟随

- 状态：待复现风险；严重度：P1。
- Figma：5289:1960、5289:2307。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/AssemblyBody.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosProjectShell.tsx`。
- 证据/行动：打开后切现场未查到目标同步；须区分显式锁定和当前现场跟随，防止投到旧现场。

## S04 装配Drop、批量取用和逐项回执

- 状态：保留；严重度：无。
- Figma：5289:2659、5346:1885。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/AssemblyBody.tsx`。
- 证据/行动：真实acquireDrop/applySources及部分成功回执已接通，不能删减反馈。

## S05 装配集合跨视图取用

- 状态：部分接通；严重度：P2。
- Figma：5333:96、5334:46、5346:1416、5346:1666、5346:1885。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/AssemblyBody.tsx`。
- 证据/行动：进入和Portal入口已接；与节点及当前会话语义并表。

## S06 专业窗口浮动、停靠和分组

- 状态：保留；严重度：无。
- Figma：5388:27165、5387:331、5103:1331。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.tsx`。
- 证据/行动：统一window/region机械已实现，禁止引入第二套。

## S07 拖窗期间实时避让

- 状态：需修复；严重度：P1。
- Figma：5388:27165。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.tsx`。
- 证据/行动：纯位移只改DOM，其他HUD占用矩形可能到pointerup才更新；在原发布器同步发布。

## S08 窄屏与多窗布局

- 状态：待复现风险；严重度：P1。
- Figma：5388:27165。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/professionalWindowStageLayout.ts`。
- 证据/行动：最小高度和窗口数量可能导致溢出，验证3至6窗口和小高度。

## S09 Reader身份、修订、只读与返回

- 状态：保留；严重度：无。
- Figma：5388:27411、5046:65、5046:66。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArtifactReaderBody.tsx`。
- 证据/行动：真实Artifact/revision/FileRecord与返回链保留。

## S10 Reader实际内容缩放

- 状态：需修复；严重度：P1。
- Figma：5388:27411。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArtifactReaderBody.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/ReaderContentView.tsx`。
- 证据/行动：按钮更改zoom，真实Markdown/image分支未消费；不得叠加两套缩放。

## S11 双Reader与内容页签

- 状态：缺生产调用；严重度：P1。
- Figma：5121:1522。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/ReaderGroupView.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/ReaderContentTabsView.tsx`。
- 证据/行动：组件存在不代表挂入生产；沿现有窗口分组接线。

## S12 阅读位置恢复跨度

- 状态：需补证；严重度：P2。
- Figma：5388:27411。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArtifactReaderBody.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/lcosShellStore.ts`。
- 证据/行动：当前仅内存，不把刷新后恢复冒充已实现。

## S13 Reader媒体种类覆盖

- 状态：缺少部分LCOS调用；严重度：P1。
- Figma：5051:4365、5051:4623、5051:4770、5122:3070、5122:3305、5122:3442、5122:3582。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArtifactReaderBody.tsx`。
- 证据/行动：PDF/音频/视频/网页/HTML需核对并复用Huabu已有renderer，不能声称底层不存在。

## S14 Reader选区引用归属

- 状态：待复现风险；严重度：P1。
- Figma：5388:27411。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArtifactReaderBody.tsx`。
- 证据/行动：window.getSelection未约束本Reader；跨窗口文字不能引用为当前材料。

## S15 Context真实现场、集合进入和返回

- 状态：保留；严重度：无。
- Figma：5388:21602、5139:2885、5144:675。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextWorksite.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/childWorksiteNavigation.ts`。
- 证据/行动：后续原话允许点击正文进入，不能按旧V3改成只准双击。

## S16 Context光幕开合与注意力

- 状态：部分接通；严重度：P1。
- Figma：5388:24294、5139:4194、5139:182、5140:376。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/ContextAtlasView.tsx`。
- 证据/行动：开合、Esc已接；旧工具条与HUD前后层缺协调。

## S17 Atlas分页与真实搜索

- 状态：需修复；严重度：P1。
- Figma：5388:24294。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx`。
- 证据/行动：单次getWarehouse忽略nextCursor，第51项之后的集合可能消失。

## S18 Atlas时间/性质组织和邻域焦点

- 状态：部分缺失；严重度：P1。
- Figma：5161:687、5161:2133、5333:96。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/contextAtlasSemantics.ts`。
- 证据/行动：目前unclassified且组织恒未指定；只能消费真实时间/性质事实。

## S19 集合文件夹旧白卡污染

- 状态：需修复；严重度：P2。
- Figma：5333:96、5388:24294。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/ContextCollectionView.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/families/lcos-families.css`。
- 证据/行动：同family命中旧白背景/边框/内边距/阴影，形成多一层卡。

## S20 集合合并、拆分、删除壳和拖用

- 状态：缺少部分入口；严重度：P1。
- Figma：5341:675、5341:854、5341:1391。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx`。
- 证据/行动：需复用真实集合命令；删壳与删成员分开，不照抄旧V3层级模型。

## S21 时间轨真实数据与定位

- 状态：保留；严重度：无。
- Figma：5388:25701、5156:504、5156:1871、5156:3249。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/TemporalRail.tsx`。
- 证据/行动：索引、定位预览、滚轮、键盘和多目标已有。

## S22 时间轨范围与失败重试

- 状态：需修复；严重度：P1。
- Figma：5388:25701。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/TemporalRail.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextWorksite.tsx`。
- 证据/行动：最终裁决为child内；现在无child限制，retry也未从caller接入。

## S23 Workflow真实现场与跨视图入口

- 状态：部分接通；严重度：P2。
- Figma：5388:22998、5140:1765、5140:3012、5140:4300、5340:146。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/workflow/WorkflowWorksite.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/shell/LcosProjectShell.tsx`。
- 证据/行动：Main与Workflow有手牌；Main的Context Atlas对等入口待补。

## S24 手牌空白关闭

- 状态：需修复；严重度：P1。
- Figma：5140:3012、5343:831。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/workflow/WorkflowHandView.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/workflow/workflow-hand.css`。
- 证据/行动：缺DismissPlane，空白可能穿到画布；保留Esc并测试Drop不受损。

## S25 Workflow卡池分页与搜索

- 状态：需修复；严重度：P1。
- Figma：5335:110、5140:3012。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/workflow/WorkflowCardPool.tsx`。
- 证据/行动：一次getWarehouse和本地title筛选，无法搜页外对象。

## S26 手牌轻预览与区域/现场进入

- 状态：部分缺失；严重度：P1。
- Figma：5344:752、5344:999、5335:110。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/workflow/WorkflowCardPool.tsx`。
- 证据/行动：双击进入已接；单击只有摘要，区域定位分支缺失。

## S27 取用到当前会话与续工

- 状态：需修复；严重度：P1。
- Figma：5170:896、5170:2235、5352:1377、5352:1502、5352:1707。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/workflow/WorkflowCardPool.tsx`。
- 证据/行动：有当前receiver仍要求重新选择；复用既有会话owner。

## S28 手牌扇形/网格和高数量密度

- 状态：需修复；严重度：P2。
- Figma：5140:3012、5343:630。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/workflow/workflow-hand.css`。
- 证据/行动：旧选择器被lane包装绕过，多量仍旋转横向滚动。

## S29 真实会话、继续/委派/分支和等待输入

- 状态：保留机制，需改呈现；严重度：P2。
- Figma：5289:6378、5278:229、5279:281、5280:669、5286:1259。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/WaitingInputSection.tsx`。
- 证据/行动：真实projection、timeline、SSE、四续工和capability已接；不能为变简洁删除语义。

## S30 会话切换隔离与恢复入口

- 状态：需修复；严重度：P1。
- Figma：5287:1539、5289:6378。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx`。
- 证据/行动：body无target key且diagnostics无请求隔离，迟到结果可能串会话；恢复动作藏在Diagnostics。

## S31 结果回流、归档和恢复

- 状态：保留机制，需补视觉；严重度：P2。
- Figma：5122:2949、5122:3718、5122:3876、5287:1539。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArtifactReturnSection.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArchiveBody.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/RecoverySection.tsx`。
- 证据/行动：真实review/accept/reject/retry/restore存在，媒体比较和用户文案不足。

## S32 Portal、T7工具与历史专业页

- 状态：部分接通/部分预留；严重度：P1。
- Figma：5348:1151、5281:1172、5282:1079、5287:1838、5300:3344。
- 源码：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/PortalPreviewBody.tsx`；`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.tsx`。
- 证据/行动：Portal真实六态和局部缩放已有；三个工具返回不可用；桌面P1预留不能当Web现有故障。
