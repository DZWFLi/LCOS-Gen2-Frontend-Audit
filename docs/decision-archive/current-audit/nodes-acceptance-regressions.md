# 节点域合并验收关键回归文件

日期：2026-09-26。最新只读收尾未再改产品代码；下列是实际行为测试路径，供主代理一次合并验收。历史各批已通过，存在重叠，不把不同批计数简单相加。

## 首屏身份、项目隔离和实际caller

早读canonical身份/空绑定放行/失败重试/项目切换/已绑定不回原生白卡；Reader精确目标；Workflow exact scope+sourceNode，缺canvas与错scope不进入。

- [src/lcos/useLcosCanvasProps.project.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\useLcosCanvasProps.project.test.tsx>)
- [src/lcos/lcosReferenceState.project.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\lcosReferenceState.project.test.ts>)
- [src/lcos/host/CanvasHostBoundary.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\host\CanvasHostBoundary.test.tsx>)
- [src/lcos/nodes/BoundNodeLoadingBody.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\BoundNodeLoadingBody.test.tsx>)
- [src/lcos/nodes/createLcosNodePresentationSeam.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\createLcosNodePresentationSeam.test.tsx>)
- [src/lcos/nodes/NodeMaterialCaller.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\NodeMaterialCaller.test.tsx>)
## 真实材料、媒体和引用角标

真实sourceRunId与MIME，不覆盖已编辑源；图片错误重试；audio/video机械与事件隔离；PDF真实src；Pin来自membership；取消引用不删节点。集合测试只证明已存在descriptor的消费端，不能证明普通集合生产。

- [src/lcos/nodes/stageProjectedSources.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\stageProjectedSources.test.ts>)
- [src/lcos/nodes/LcosSpeciesBodies.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.test.tsx>)
- [src/lcos/nodes/NodeColorPinMarkers.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\NodeColorPinMarkers.test.tsx>)
- [src/lcos/nodes/NodeReferenceMarker.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\NodeReferenceMarker.test.tsx>)
- [src/lcos/nodes/source/SourceMediaBehavior.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\SourceMediaBehavior.test.tsx>)
- [src/lcos/nodes/source/PdfSourcePreview.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\PdfSourcePreview.test.tsx>)
- [src/lcos/ui/source/ImageSourceView.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\ImageSourceView.test.tsx>)
- [src/lcos/ui/source/SourceViews.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\SourceViews.test.tsx>)
## 远中近密度连续性

单一density下真实句子/不伪摘要/屏幕字号边界；Glyth连续尺寸、不改变世界几何；真实状态外观仍保留。

- [src/lcos/ui/source/materialReadability.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\materialReadability.test.tsx>)
- [src/lcos/ui/source/sourceTextLayout.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\sourceTextLayout.test.tsx>)
- [src/lcos/ui/glyth/GlythBodyView.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\GlythBodyView.test.tsx>)
- [src/lcos/ui/glyth/glythPresence.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\glythPresence.test.ts>)
- [src/lcos/nodes/glythGeometry.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\glythGeometry.test.ts>)
## Glyth状态动作与单一工作窗

ready继续/打开；运行查看进度；真pending回答与复核；同一WorkView，不新建窗口系统。

- [src/lcos/navigation/GlythStateActions.test.tsx](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\GlythStateActions.test.tsx>)
- [src/lcos/navigation/focusConversationSection.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\focusConversationSection.test.ts>)
## 多人消费同一会话SSE

watch/unwatch引用计数；同项目多会话；最后消费者才关SSE；保留导航agent后加的project监听生命周期。

- [src/lcos/collaboration/collaborationSessionStore.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\collaboration\collaborationSessionStore.test.ts>)

## 另一个package的共享命令模型

以下在 `apps/web-gen2` 运行，而不是Huabu测试配置：

- [test/node-command-model.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\test\node-command-model.test.ts>)
- [test/glyth-presentation.test.ts](<E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\test\glyth-presentation.test.ts>)

## 推荐合并命令

在Huabu web工作目录：

```powershell
npm run test -- src/lcos/useLcosCanvasProps.project.test.tsx src/lcos/lcosReferenceState.project.test.ts src/lcos/host/CanvasHostBoundary.test.tsx src/lcos/nodes/BoundNodeLoadingBody.test.tsx src/lcos/nodes/createLcosNodePresentationSeam.test.tsx src/lcos/nodes/NodeMaterialCaller.test.tsx src/lcos/nodes/stageProjectedSources.test.ts src/lcos/nodes/LcosSpeciesBodies.test.tsx src/lcos/nodes/NodeColorPinMarkers.test.tsx src/lcos/nodes/NodeReferenceMarker.test.tsx src/lcos/nodes/source/SourceMediaBehavior.test.tsx src/lcos/nodes/source/PdfSourcePreview.test.tsx src/lcos/ui/source/ImageSourceView.test.tsx src/lcos/ui/source/SourceViews.test.tsx src/lcos/ui/source/materialReadability.test.tsx src/lcos/ui/source/sourceTextLayout.test.tsx src/lcos/ui/glyth/GlythBodyView.test.tsx src/lcos/ui/glyth/glythPresence.test.ts src/lcos/nodes/glythGeometry.test.ts src/lcos/navigation/GlythStateActions.test.tsx src/lcos/navigation/focusConversationSection.test.ts src/lcos/collaboration/collaborationSessionStore.test.ts --maxWorkers=1
npm run typecheck
```

在apps/web-gen2工作目录按既有脚本跑 `test/node-command-model.test.ts` 与 `test/glyth-presentation.test.ts`，并typecheck。

## 已有实浏览器证据与不能冒认的范围

- main真实图片、文档、工作流、38秒音频播放与Glyth运行工作窗已验证；远37%、中53%、近100%的截图见nodes-lod-implementation.md。
- 首屏自然逐帧原样白卡可见158ms的单次复现已解决；修后节点出现时身份cover仍在，之后真实身份骨架再到内容，全程nativeVisible=0。失败→点击重新读取已恢复；见nodes-first-load-frame-proof.json/报告。
- 现fixture没有真实视频/PDF/网页，相关API/DOM测试不能当端到端录屏。
- 普通集合可画文件夹轮廓，但普通集合producer、正式member target、展开托管/代理不是已完成。现有workflow集合可进入真实工作现场不等于普通集合已可创建。
- Glyth body Drop当前已接draft，不证明长期映射持久化；三段链路见专项报告。

## 本轮只读复核归档

- [普通集合owner追查](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\collection-owner-investigation.md>)
- [Glyth投送语义与写读bundle](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\glyth-drop-semantics-investigation.md>)
- [N01–N41当前状态](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\nodes-current-status.md>)

N17/N18/N19/N31已同步校正到inventory-nodes.json、nodes-current-status.json及完整中文报告；初始审计历史仍保留。
