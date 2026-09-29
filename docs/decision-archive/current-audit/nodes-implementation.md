# 节点实施记录：首批与真实媒体补齐

日期：2026-09-26。施工树：`E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926`。

结论：本批解决了“生成来源吞掉材料本体、集合外套白卡、假固定 Pin、四档内容层级不足、图像裁剪和失败无恢复、音频不能播、网页视频无专用 caller、PDF无真实首页、引用已加入却看不见”的消费端问题。**41项盘点没有全部完成；普通集合 producer/展开 owner、生成审核真状态、完整Glyth续工仍单列。**

## 采用来源与边界

- READ_SOURCE：原T1 `LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md`、节点呈现宪法、T3原稿、20260914只读投影裁决、实际 `createLcosNodePresentationSeam` / native Node caller / Reference 与 Pin provider。
- VISUAL_SOURCE：20260913九面统一 `5388:96`；文字`5388:102`、文档`5388:106`、主图`5388:98`、缩图`5388:111`、音频`5388:121`；集合专项`5333:96`六态、工作流书册`5334:46`。页04共享与13纠正优先，旧稿未覆盖态才补充。
- ADOPTED：继续使用唯一 node body junction、既有 density resolver、原生 NodeWrapper/几何/选择/拖动/resize，既有 Reader/child navigation，canonical Pin/Reference。CollectionView、WorkflowCollectionView、PreviewMedia、原生 media 与 PDF.js 均复用或薄适配。
- RETIRED：文字/图像固定假色标、固定装饰声波、generated draft纯文字卡与假“待Review”、集合嵌白卡、只按第一个Workspace静默跳转、图像cover强裁。
- 本批不修改 Core/backend/schema、canonical store owner、NodeWrapper、共享tokens、Context/Workflow view文件、Glyth body或Composer owner。经主代理额外授权，仅给原生VideoNode/WebNode薄接同一body seam。

## 已落 production caller

| 对照 | 实际修改 | 状态与验证 |
|---|---|---|
| N12 生成材料 | seam透传真实sourceRunId；source/draft仍以真实kind/MIME呈现材料；只附“生成结果”来源 | 真生成图src与Reader目标回归通过。不把sourceRunId当审核状态 |
| N17/N21 集合 | `CollectionNodePresentation`复用两种独立轮廓；248×244同比例适配现有几何；外层透明；无真实cover则空态 | workflow在实际Main截图可见；普通collection消费端通过单测，但真实producer仍缺 |
| N14 彩色标 | `NodeColorPinMarkers`用provider membership+definitions+exact target；11px色标、24px点击区、screen-size固定；点击原authoring | 无membership无角标；entity/view分开；真橙色标在Main可见。Glyth由主代理补挂 |
| N15 引用 | `NodeReferenceMarker`读取 `isNodeReferenced`；左下轻标；点击已有removeEntityFromDraft，仅撤引用不删节点 | 添加/撤引用与节点身份保留回归通过。Glyth由主代理补挂 |
| N02/N26/N28 LOD | 保留唯一密度resolver；mark身份、summary摘要、working内容、reading来源；真实几何内字号/行数适配 | 原385×142文字维持37/58；小框不再固定116px裁剪；四档回归通过 |
| N06 图像 | 使用既有PreviewMedia真实加载/失败/重试；fit contain；新src清旧错误 | DOM error→retry→load通过；真实Main图像可见。更多横竖/透明图全浏览器组合仍待补证 |
| N07 音频 | 原生audio play/pause/timeupdate/seek；真实metadata时长；仅成功解码真实bytes才画波形 | 原伪波形删除；无字节不画。真实fixture38秒音频浏览器点击变“暂停”；进度/重试DOM回归通过 |
| N08 视频 | 原生VideoNode接唯一seam；新VideoSourceMorphology薄复用原生video控件、实际src、失败重试；mark不解码 | 控件手势不会误开Reader；真实URL与失败恢复回归通过。现有fixture无视频，未做真实视频E2E |
| N09 网页 | 原生WebNode接唯一seam；既有getWebPreview+延迟hydration；真站点标题/摘要/图片/原文链接 | 无live iframe；无源诚实空态；实际接口参数、失败重试、mark不请求回归通过。现fixture无网页，未做E2E |
| N05 PDF | 真实mime识别；lazy既有PDF.js Document/Page+同worker；第一页、真实页数、失败重试 | full Reader由surfaces组负责；此处不新建Reader。渲染输入/页数/重试回归通过；现fixture无PDF，未做真实PDF E2E |
| N41 真实内容落成 | stageProjectedSources扩video/pdf，复用uploadVideo/uploadPdf；允许真实生成媒体的neutral note host；保留source非空不覆盖、项目ownership与content CAS | 真实文件MIME/扩展名、准确uploader、CAS、项目切换与已有源保护测试通过 |
| N22/N40 操作职责 | 单击仍原生选择，材料双击原Reader；Reader接精确artifact/revision；多个workflow现场显式选，单个沿用原child navigation | 实际seam+body调用测试通过。图片重试button双击不得误开Reader，专门回归通过 |

## 关键代码位置

所有路径相对施工树：

- `huabu/apps/web/src/lcos/nodes/createLcosNodePresentationSeam.ts`
- `huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx`
- `huabu/apps/web/src/lcos/nodes/CollectionNodePresentation.tsx`、`collection-node.css`
- `huabu/apps/web/src/lcos/nodes/NodeColorPinMarkers.tsx`、`NodeReferenceMarker.tsx`、`node-color-pin.css`
- `huabu/apps/web/src/lcos/nodes/PortalNodeBody.tsx`
- `huabu/apps/web/src/lcos/nodes/source/AudioSourceMorphology.tsx`、`VideoSourceMorphology.tsx`、`WebSourceMorphology.tsx`、`PdfSourcePreview.tsx`、`DocumentSourceMorphology.tsx`、`SourceMorphology.tsx`、`sourceTypes.ts`、`SourceMarker.tsx`
- `huabu/apps/web/src/lcos/nodes/stageProjectedSources.ts`
- `huabu/apps/web/src/lcos/ui/source/{Text,Document,Image,Audio}SourceView.tsx`、`sourceTextLayout.ts`、`source-presentation.css`
- 原生薄接缝：`huabu/apps/web/src/components/Nodes/{video/VideoNode,web/WebNode}.tsx`

## VERIFIED

- 首批8文件36行为测试通过。
- 第二批整个 `nodes` + `ui/source`：15文件58测试通过；完整 `npm run typecheck` 通过。
- 随后针对图片重试双击增加1项：`NodeMaterialCaller.test.tsx --maxWorkers=1` 4项通过（总行为项59）；没有因报告方便而重跑不相关测试。
- 隔离浏览器：`http://127.0.0.1:5286/projects/lcos-gen2-dev/main`，独立session `lcos-node-review`。真实首屏中图像、文字、文档、工作流书册、实际Pin与原生音频入口可达。
- 音频点击后快照显示“暂停 山野环境声”、38秒metadata。截图：`nodes-media-main.png`。对应快照：`.playwright-cli/page-2026-09-26T06-35-52-036Z.yml`。
- 未伪称视频/PDF/网页端到端完成；其验证目前是API/DOM/owner回归。没有拿data-figma或测试字符串证明视觉一致。

## UNRESOLVED / 必须保留的缺口

1. **普通集合**：`projectionFacade.ts`/`reconciliationRunner.ts`当前只投影workflow scope；普通集合真实producer与展开几何owner不存在，消费端变漂亮不代表已可用。不创建第二套成员/画布/集合状态。
2. **普通集合不能成为现有Assembly target**：`packages/contracts/src/assembly.ts` 的AssemblyTargetRefV1没有collection；Core仅接受collection作source scope。不能假注册接收区并发送不存在的target。
3. **Assembly的artifact与artifactView身份混用**：原 `dropIntentResolver.ts` 把artifact.entityId当artifactView.id；Core assembly-apply-service精确getArtifactView，必需真实viewId。已告主代理在Drop owner修。Glyth/Composer引用仍应保留artifact ID。
4. 生成来源不等于Draft/Current审核状态；未用假状态补视觉。需要既有producer供应真实接受/修订事实。
5. 节点11态、连续GLYTH缩放接管、近场续工四模式/伴身种子/来源尾迹、Colony、多集合展开共享仍未全完成；不能用本批覆盖这些N项。
6. Office/PPT真页预览尚无当前renderer；普通文档诚实用已有真实excerpt。Web缺URL或pdf/video缺真实file bytes时不编造内容。
7. 动效与所有LOD/大量节点/窗口碰撞的端到端矩阵仍由主代理合并验证；目前只是节点域首批可运行结果。

## 后续授权增量：共享会话订阅

主代理授权修 `collaboration/collaborationSessionStore.ts` 及hook注释。同一会话的Glyth、WorkView、Composer身份同时订阅时，原Set会被第一个卸载者删除；现改为同owner内消费者计数。最后会话与Artifact消费者退出才关闭该项目SSE。新增4项行为回归+8项既有facade约束全部通过。详细续工缺项另见 `glyth-continuation-shortlist.md`。
