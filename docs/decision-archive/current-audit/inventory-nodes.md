# LCOS GUI全量对齐 · 节点与GLYTH盘点

日期：2026-09-26。范围：主画布所有节点物种、集合/Portal、GLYTH续工与分支、LOD、引用与节点状态。

**结论：当前不是单纯视觉细调。主画布集合未采用13页文件夹，视频/网页/Skill还走通用卡，真实引用标识缺consumer，GLYTH原位续工被大窗口入口阻挡，sourceRunId在seam遗漏。先把这些接到真实caller，再按设计完成状态和密度。**

仓库：`E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926`。本子任务只读，没有修改源码。机器表：[inventory-nodes.json](inventory-nodes.json)。

## 采用次序与边界

- 20260913九面主稿负责整机组合；04页负责统一组件；13页负责集合/任务牌/Portal。
- 06/07/08/11只补未被后续纠正的细节/状态。旧长扁集合与“语气提炼”菱形已明确退役，不可回灌。
- Core投影默认只读是后续用户裁决；自由文本仍原位编辑。不得借旧原卡回退到另一套内容owner。
- 所有条目是源码证据，不等于浏览器验收。运行测试/data-figma/registry存在不抵真实caller。
- GLYTH/Arc/Composer/Drop系统接缝归主代理；本子域后续可修source物种、集合body、marker、LOD及媒体。

## 原始证据入口

- 宪法：[LCOS_Gen2_节点呈现宪法_完整版_20260902.md](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/core_plans/LCOS_Gen2_节点呈现宪法_完整版_20260902.md)
- T1：[LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T1/LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md)
- T3：[LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T3/LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md)
- T5：[GEN2_T5_完整源码施工正本_V4_六路合并_20260911.md](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T5/GEN2_T5_完整源码施工正本_V4_六路合并_20260911.md)
- 统一采用：[LCOS_Figma_九面视觉统一收口交付_20260913.md](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/LCOS_Figma_九面视觉统一收口交付_20260913.md)
- 节点索引：[index-nodes.json](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/index-nodes.json)
- 页面索引：[index-pages.json](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/index-pages.json)

## 严重级别与施工先后

本次未证实 P0（不可恢复数据损失或全面不可用）。N01 属于应保留实现，不列为缺陷。P1 是真实入口、语义或主要呈现缺口；P2 是局部反馈及需补证的体验问题。施工顺序与严重度分开，JSON 的 implementationOrder 保留依赖先后。

## 一览

|编号|功能|级别|当前判定|修复归属|
|---|---|---|---|---|
|N01|物种唯一生产接缝与原生机械保留|无缺陷/保留|已接入，需全物种回归|总装/T1|
|N02|大字文本 / 近场阅读表面|P1|已接，但内容颗粒度和字号自适应偏差|节点/T1|
|N03|原生自由文本原位编辑 / 托管材料只读差异|P1|入口机制已区分，需完整交互补证|节点/T3/Reader|
|N04|同对象文本 / 大纲 / 导图三读法|P1|未找到LCOS生产body分派；不能算已落地|节点/T1/T3|
|N05|文档 / PDF / 演示封面物种|P1|纸感已接，媒体页预览信息不足|节点/Reader|
|N06|图像主图 / 缩略图与真实比例|P1|已接，固定cover裁剪与错误处理需修|节点/媒体|
|N07|音频波形、时长、播放与scrub|P1|装饰波形已接，真实媒体操作未接|节点/媒体|
|N08|视频节点与帧/片段识别|P1|缺专用画布物种，仍通用卡|节点/媒体|
|N09|网页 / 链接物种与站点身份|P1|缺专用画布物种，仍通用卡|节点/媒体|
|N10|未知文件与源缺失反馈|P1|降级存在，错误态body没有接状态槽|节点/总装|
|N11|生成中对象与运行状态机|P1|注册形态存在，运行事实未充分进入body|节点/Run/T6只读适配|
|N12|生成结果Draft、Current与来源|P1|真实来源字段在seam丢失|节点/Run|
|N13|技能、决策、提示对象的独立形态|P1|若干物种退为通用卡|节点/工作流|
|N14|节点角标与ColorPin真实颜色成员|P1|假常驻角标；未绑定真实ColorPin|节点/T2 Pin|
|N15|引用独立于选中，节点静默标识|P1|引用真值与手势已接，节点反馈未接|节点/T3|
|N16|关系活边、目标容差与远近权重|P2|机械保留，视觉与当前关系producer需补证|T3关系/节点|
|N17|集合主画布压缩文件夹|P1|主画布没有采用正确文件夹|节点/T1集合|
|N18|集合展开、收起与自动排布|P1|未找到当前节点展开生产操作|节点/T1集合|
|N19|集合收纳drop与多集合共享成员|P1|通用Assembly投放存在；集合本体目标/状态未证明|节点/T1集合/T3 Drop|
|N20|集合图标、颜色、外形身份|P2|设计有要求，节点身份配置与显示未接|节点/T2/T6读适配|
|N21|工作流集合书册在Main的形态|P1|专用face已接，但外层仍套卡且没有封面数据|节点/工作流|
|N22|子现场入口及来源返回|P1|真实导航已接，节点外形仍泛化|节点/Portal/T2|
|N23|门户只读预览、局部缩放和打开|P2|真实scene预览已接，需保留|Portal/窗口|
|N24|门户提升/投递生命周期|P1|未在当前Portal body找到完整组合能力|Portal/窗口/T3 Drop|
|N25|Colony轮廓、剥离与取消|P1|原T1有细规格，精确当前Figma专帧未查到；代码未见生产呈现|节点/T1/总审计|
|N26|远/中/近四档节点信息层级|P1|唯一density已接，表现层只部分消费|节点/T1|
|N27|节点11态与原位轻反馈|P1|选择机械保留，其余状态呈现有漏接|节点/T3|
|N28|拖动、resize、中断及内容尺寸|P1|Huabu机械保留，LCOSbody固定像素布局有风险|节点/T1|
|N29|GLYTH本体与真实基本状态|P2|已采用donor，六用户态基本接通|GLYTH主代理|
|N30|GLYTH缩放接管与身体命中|P1|二段硬切替代连续takeover|GLYTH/T1|
|N31|投送材料给GLYTH的命中与就近草稿|P1|语义接口已接，空间命中有过期风险|GLYTH/T3 Drop|
|N32|GLYTH原位续工入口与Composer内展开|P1|生产路径逼用户先开大工作窗|GLYTH/Arc/Composer主代理|
|N33|续工四种模式及不支持时显式改选|P1|真实四action与capabilities已接，形态和比较层次偏差|GLYTH/Composer|
|N34|续工确认来源、提交快照与草稿分离|P1|意图ID保留存在，近场确认UI未对稿|GLYTH/Composer|
|N35|创建伴身种子与四阶段可见回执|P1|缺GLYTH伴身呈现|GLYTH主代理|
|N36|分支创建完成、来源尾迹与精选继承完成|P1|有限reaction接口有，真实调用未接|GLYTH主代理|
|N37|续工失败、未知与取消恢复|P1|真实恢复section存在，未落回近场状态|GLYTH主代理|
|N38|焦点薄光边、处理边缘色散和减少动态|P2|有选中/注意光边，无处理种子色散caller|GLYTH/动效|
|N39|节点原位空白、重命名、删除/撤销与多选|P2|原生机械和Arc存在，需逐项真实验证|T3/总装|
|N40|源到Reader/WorkView提升与恢复连续性|P1|真实双击入口已接，source-revision选择有待核验|节点/Reader主代理|
|N41|素材装配到画布后的内容真实性|P2|部分真实staging已接；不能只看Figma布景完成|节点/总装|

## 逐项证据、修复和验收

### N01 · 物种唯一生产接缝与原生机械保留

- 级别 / 状态：**P0 / 已接入，需全物种回归**。
- Figma：10 / Gen2 · 通透玻璃与铝材对照 / [5388:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-96)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [useLcosCanvasProps.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/useLcosCanvasProps.tsx)
  - [createLcosNodePresentationSeam.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/createLcosNodePresentationSeam.ts)
  - [lcosNodeCardRegistry.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/lcosNodeCardRegistry.ts)
- 为什么成立：useLcosCanvasProps:112 把唯一 seam 注册给 host；registry 仅 Glyth/Portal 专用，其余 speciesBodyFor。不得用 registry项数量冒充真实各物种可达。
- 保留/修改：保留单Huabu机械和唯一junction；所有修复接此处并检查真实descriptor生产，不增第二canvas。
- 修复归属：总装/T1
- 验证要求：在真实项目为各类绑定节点验证对应body；未绑定自由节点仍保留编辑、拖放、resize。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N02 · 大字文本 / 近场阅读表面

- 级别 / 状态：**P1 / 已接，但内容颗粒度和字号自适应偏差**。
- Figma：5235:49 / [5388:102](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-102)；07 / Gen2 · 信息层级与细节 / [5152:503](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-503)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [TextSourceView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/TextSourceView.tsx)
  - [source-presentation.css](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/source-presentation.css)
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
- 为什么成立：TextSourceView:11 使用preview/title；CSS固定37px、58px行高、两行116px槽，只mark分支不同。世界尺寸变化不控制字级；summary/working/reading长文仍同形。
- 保留/修改：保留统一主稿字体气质，按节点实际尺寸与唯一density产出分层词表；小文本/标题/多段不能全变37px海报字。
- 修复归属：节点/T1
- 验证要求：同尺寸短文/长文同字号；resize后内容不溢出；四档截图；中文换行与长英文；不改用户已存位置。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N03 · 原生自由文本原位编辑 / 托管材料只读差异

- 级别 / 状态：**P1 / 入口机制已区分，需完整交互补证**。
- Figma：03 / Gen2 · 第一稿全稿 / [5046:52](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-52)；08 / Gen2 · 第二轮基础操作 / [5188:635](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-635)；08 / Gen2 · 第二轮基础操作 / [5191:789](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5191-789)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [visualFamily.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/visualFamily.ts)
- 为什么成立：visualFamily 明确20260914用户裁决：Core投影默认只读，文本投影走note/junction，双击Reader；无绑定Huabu text保留编辑。不能拿旧T1原位编辑要求直接把Core只读重新改掉。
- 保留/修改：对齐同面编辑外观、caret和格式层；保留新版readonly边界。导入/新建/已有托管材料分别验收。
- 修复归属：节点/T3/Reader
- 验证要求：自由文本中文IME、回车退格、Bold/标题/列表、resize/camera移动焦点不丢；托管材料双击到同revision Reader。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N04 · 同对象文本 / 大纲 / 导图三读法

- 级别 / 状态：**P1 / 未找到LCOS生产body分派；不能算已落地**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5101:853](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-853)；05 / Gen2 · 第二轮空间与角色 / [5101:1048](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-1048)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [nodePresentation.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/nodePresentation.ts)
- 为什么成立：presentation/nodePresentation.ts仅有ExplicitPresentationMode类型；lcos节点body没有viewMode/outline/mindmap consumer。native Huabu能力不能替代同Core投影三读法的证明。
- 保留/修改：接原有派生/折叠/编辑机械，不建第二Markdown真值；旧Figma形态只按现行壳转译，补same target模式。
- 修复归属：节点/T1/T3
- 验证要求：text→outline→mindmap→text的entityId/nodeId/binding不变；折叠、改名、子/同级、lift、drag-out及reload逐项验证。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N05 · 文档 / PDF / 演示封面物种

- 级别 / 状态：**P1 / 纸感已接，媒体页预览信息不足**。
- Figma：5235:49 / [5388:106](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-106)；05 / Gen2 · 第二轮空间与角色 / [5103:1526](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5103-1526)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [DocumentSourceView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/DocumentSourceView.tsx)
  - [visualFamily.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/visualFamily.ts)
- 为什么成立：文档族包括PDF、presentation、markdown；DocumentSourceView只有标题、文本excerpt、次级行，没有PDF页/Office封面slot。用同纸卡替代了若干原本媒体封面种类。
- 保留/修改：保留纸表面，按真实内容采用已有Huabu预览缩略图；不能给无预览的文件填演示图片。
- 修复归属：节点/Reader
- 验证要求：同项目PDF/PPT/Markdown/普通文件真实内容区分；missing/unsupported可见且仍可打开/恢复。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N06 · 图像主图 / 缩略图与真实比例

- 级别 / 状态：**P1 / 已接，固定cover裁剪与错误处理需修**。
- Figma：5235:49 / [5388:98](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-98)；5235:49 / [5388:111](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-111)；07 / Gen2 · 信息层级与细节 / [5152:753](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-753)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [ImageSourceView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/ImageSourceView.tsx)
  - [source-presentation.css](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/source-presentation.css)
  - [stageProjectedSources.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/stageProjectedSources.ts)
- 为什么成立：真实src经staging注入；img始终object-fit:cover；没有onError，地址存在但读取失败仍渲染坏图；缩略图分支按worldWidth<=240。
- 保留/修改：按真实媒体比例和明确裁切操作呈现；复用现有PreviewMedia失败/重试机制；保留相同实体与用户geometry。
- 修复归属：节点/媒体
- 验证要求：横竖/透明图、损坏URL、慢加载；近景操作与Reader返回；远景保剪影，caption不重叠。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N07 · 音频波形、时长、播放与scrub

- 级别 / 状态：**P1 / 装饰波形已接，真实媒体操作未接**。
- Figma：5235:49 / [5388:121](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-121)；05 / Gen2 · 第二轮空间与角色 / [5122:3070](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-3070)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [AudioSourceView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/AudioSourceView.tsx)
  - [AudioSourceMorphology.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/source/AudioSourceMorphology.tsx)
  - [sourceFigmaGeometry.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/source/sourceFigmaGeometry.ts)
- 为什么成立：AudioSourceView:25明确figma-decorative：固定64根、45根前色；audio元素hidden只读metadata，无播放/seek handler。非真实进度。
- 保留/修改：Figma规定材质和轮廓，实际波形与进度由媒体数据驱动；采用现有媒体控制机械；无波形数据时用诚实静息轮廓。
- 修复归属：节点/媒体
- 验证要求：两段不同音频波形/时长可区分；播放暂停seek、错误和reduced-motion；缩放不重置播放。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N08 · 视频节点与帧/片段识别

- 级别 / 状态：**P1 / 缺专用画布物种，仍通用卡**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5122:3305](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-3305)；03 / Gen2 · 第一稿全稿 / [5046:71](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-71)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [SourceMorphology.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/source/SourceMorphology.tsx)
- 为什么成立：video进入default GenericSourceMorphology；没有海报帧/时间/播放，只有Film图标、英文family和标题preview。
- 保留/修改：复用Huabu视频host/media能力，换成内容优先视频面；Reader细节交对应owner。
- 修复归属：节点/媒体
- 验证要求：真实视频缩略帧与时长、键盘打开、错误/权限、远中近。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N09 · 网页 / 链接物种与站点身份

- 级别 / 状态：**P1 / 缺专用画布物种，仍通用卡**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5122:3442](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-3442)；03 / Gen2 · 第一稿全稿 / [5051:4623](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5051-4623)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [SourceMorphology.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/source/SourceMorphology.tsx)
  - [visualFamily.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/visualFamily.ts)
- 为什么成立：web走GenericSourceMorphology：Link2+web+标题；favicon/站点/URL线索和真实预览未接。
- 保留/修改：复用现有web preview/metadata，不重新创建网页对象；可读站点与紧凑预览避免假空卡。
- 修复归属：节点/媒体
- 验证要求：有/无截图、有/无favicon、长URL、离线缓存/失败、Reader与摘录回到同对象。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N10 · 未知文件与源缺失反馈

- 级别 / 状态：**P1 / 降级存在，错误态body没有接状态槽**。
- Figma：08 / Gen2 · 第二轮基础操作 / [5191:789](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5191-789)；08 / Gen2 · 第二轮基础操作 / [5188:1395](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-1395)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [SourceFeedbackSlot.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/SourceFeedbackSlot.tsx)
  - [sourceViewTypes.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/sourceViewTypes.ts)
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
- 为什么成立：SourceFeedbackSlot受控feedback可显示，但LcosSpeciesBody只传title/secondary/preview/media，不传feedback/interaction；availability只混入文字次级行。
- 保留/修改：让真实availability/loading/error注入共享反馈，位置局部且保留身份；不以unknown=红色失败。
- 修复归属：节点/总装
- 验证要求：missing/stale/loading/error各看得到原因和真实可用动作；失败不变成另一物种、不吞原内容。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N11 · 生成中对象与运行状态机

- 级别 / 状态：**P1 / 注册形态存在，运行事实未充分进入body**。
- Figma：09 / Gen2 · 色彩层级与近场交互 / [5204:13842](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-13842)；08 / Gen2 · 第二轮基础操作 / [5191:1036](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5191-1036)；06 / Gen2 · 图标与光幕空间 / [5388:22998](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-22998)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [nodeSpecies.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/nodeSpecies.ts)
- 为什么成立：working未从resolveNodeSpecies任何分支返回；run分支只有静态pulse与“运行”chip/占位语义，未读queued/running/waiting/review/failed事实。
- 保留/修改：真实Run投影驱动物种内解剖与活动路径；不要每种状态再做一张同形白卡。
- 修复归属：节点/Run/T6只读适配
- 验证要求：排队、运行、等用户、复核、完成、失败逐一真实切换；无活动Run不呼吸；失败重试不重复执行。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N12 · 生成结果Draft、Current与来源

- 级别 / 状态：**P0 / 真实来源字段在seam丢失**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5122:2949](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-2949)；09 / Gen2 · 色彩层级与近场交互 / [5204:13842](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-13842)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [createLcosNodePresentationSeam.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/createLcosNodePresentationSeam.ts)
  - [projectionFacade.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/host/projectionFacade.ts)
  - [nodeSpecies.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/nodeSpecies.ts)
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
- 为什么成立：projectionFacade:300生成sourceRunId；nodeSpecies:74依sourceRunId+managed返回draft；createLcosNodePresentationSeam:30-36不传sourceRunId，正常生成结果被解析为source。且仅补字段会进入generic Draft卡，图片预览又丢。
- 保留/修改：同时修事实透传与结果body：结果保原媒体物种，加真实草稿/采用状态与来源；不能把所有Run产出永远判待审，Current须读真实review事实。
- 修复归属：节点/Run
- 验证要求：同张生成图在待审/采用/拒绝后都保内容；sourceRunId/revision不丢；真正状态决定徽记。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N13 · 技能、决策、提示对象的独立形态

- 级别 / 状态：**P1 / 若干物种退为通用卡**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5122:2365](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-2365)；05 / Gen2 · 第二轮空间与角色 / [5103:1798](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5103-1798)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [nodeSpecies.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/nodeSpecies.ts)
  - [SourceMorphology.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/source/SourceMorphology.tsx)
- 为什么成立：skill entity→source family skill→GenericSourceMorphology；decision/prompt-frame通用外壳+chip。统一稿已删除“语气提炼”菱形占位，不能照抄旧几何表示功能已实现。
- 保留/修改：真实Skill采用能力包身份与内容入口；decision/prompt按真实facts设计轻形态，复用现有WorkView；未有准确现行Figma时标待补证。
- 修复归属：节点/工作流
- 验证要求：Skill原位身份、打开同目标、resource modules；decision状态/来源可辨；无纯装饰冒充功能。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N14 · 节点角标与ColorPin真实颜色成员

- 级别 / 状态：**P0 / 假常驻角标；未绑定真实ColorPin**。
- Figma：07 / Gen2 · 信息层级与细节 / [5153:540](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-540)；5235:49 / [5388:102](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-102)；5235:49 / [5388:98](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-98)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [TextSourceView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/TextSourceView.tsx)
  - [ImageSourceView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/ImageSourceView.tsx)
  - [SourceMarker.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/source/SourceMarker.tsx)
  - [LcosColorPinProvider.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/pin/LcosColorPinProvider.tsx)
- 为什么成立：Text:21永远green；Image:27按compact永远green/amber；SourceMarker只有size/tone，不能表达真实成员，且无点击/tooltip身份。
- 保留/修改：移除硬编码业务含义；真Pin成员驱动角标，和物种图标/导航游标分离；视觉尺寸借Figma，不借示例颜色当真值。
- 修复归属：节点/T2 Pin
- 验证要求：无Pin不出现假彩标；设置/移除/多色后同节点与岛对应；resize不改变颜色；selection不影响Pin。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N15 · 引用独立于选中，节点静默标识

- 级别 / 状态：**P0 / 引用真值与手势已接，节点反馈未接**。
- Figma：08 / Gen2 · 第二轮基础操作 / [5187:431](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-431)；09 / Gen2 · 色彩层级与近场交互 / [5229:1489](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5229-1489)；09 / Gen2 · 色彩层级与近场交互 / [5229:1753](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5229-1753)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [lcosReferenceState.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/lcosReferenceState.ts)
  - [LcosHostOverlay.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.tsx)
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx)
- 为什么成立：isNodeReferenced只定义未消费；LcosHostOverlay:301注释称NodeWrapper有reference-badge，实际只把referenceBadge=false；节点body不读draft refs。Arc有已引用动作状态但未选中时缺节点可见标识。
- 保留/修改：保留ordered draft ref和Ctrl手势，给节点单独安静引用标记；与Pin/rim不混。
- 修复归属：节点/T3
- 验证要求：Ctrl点A不改selection；A同时selected+referenced可辨；移除引用不改正文；多refs序号与Composer一致。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N16 · 关系活边、目标容差与远近权重

- 级别 / 状态：**P2 / 机械保留，视觉与当前关系producer需补证**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5122:2664](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-2664)；07 / Gen2 · 信息层级与细节 / [5152:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-49)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [useLcosCanvasProps.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/useLcosCanvasProps.tsx)
  - [LcosEdgeArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosEdgeArc.tsx)
- 为什么成立：EdgeArc真实挂载；本轮未逐边追Main空间边/Context语义关系/Workflow输入边的视觉consumer，不将edge存在视为四语义完整。
- 保留/修改：继续复用Huabuconnect；补屏幕容差、选中关系主次/flow/quiet词表；canonical端点不可解析不得造关系。
- 修复归属：T3关系/节点
- 验证要求：拖关系预览/非法目标/取消/提交；缩放容差16屏幕px；关系类型差异、键盘操作、reload。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N17 · 集合主画布压缩文件夹

- 级别 / 状态：**P0 / 主画布没有采用正确文件夹**。
- Figma：13 / Gen2 · 集合跨视图与工作流取用 / [5333:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5333-96)；13 / Gen2 · 集合跨视图与工作流取用 / [5338:24](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5338-24)；13 / Gen2 · 集合跨视图与工作流取用 / [5341:496](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5341-496)；10 / Gen2 · 通透玻璃与铝材对照 / [5388:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-96)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [lcosNodeCardRegistry.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/lcosNodeCardRegistry.ts)
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [ContextCollectionView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/ContextCollectionView.tsx)
- 为什么成立：collection→speciesBodyFor→Folder+chip+白卡；ContextCollectionView只有Atlas当前caller。projectionFacade仅给workflow scope descriptor，context集合进入同junction的事实链还需补全。
- 保留/修改：复用13页ContextCollectionFace/主画布rendition并接真实集合；去通用外框。严禁照回5203的旧扁长卡。
- 修复归属：节点/T1集合
- 验证要求：同集合Atlas→Main→Assembly外观同族、同ID；多种尺寸不压扁；真实成员计数/封面；无重复projection。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N18 · 集合展开、收起与自动排布

- 级别 / 状态：**P1 / 未找到当前节点展开生产操作**。
- Figma：09 / Gen2 · 色彩层级与近场交互 / [5203:13424](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5203-13424)；09 / Gen2 · 色彩层级与近场交互 / [5204:107](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-107)；13 / Gen2 · 集合跨视图与工作流取用 / [5333:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5333-96)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [reconciliationRunner.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/spatial/reconciliationRunner.ts)
- 为什么成立：普通collection body无onActivate/expand/collapse；旧Figma09只有交互语义保留、外形已由13覆盖。原卡要求collapsed/expanded free/member stack，用户接受自动排布。
- 保留/修改：现有Huabu容器机械薄适配，保持主稿文件夹材质；展开成员真实节点，收起存表现状态；自动排布留着。
- 修复归属：节点/T1集合
- 验证要求：展开6/12/50混合成员、重排、收起、取消、undo/reload；原位置与member事实分离，不多复制实体。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N19 · 集合收纳drop与多集合共享成员

- 级别 / 状态：**P0 / 通用Assembly投放存在；集合本体目标/状态未证明**。
- Figma：13 / Gen2 · 集合跨视图与工作流取用 / [5340:398](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5340-398)；13 / Gen2 · 集合跨视图与工作流取用 / [5341:279](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5341-279)；13 / Gen2 · 集合跨视图与工作流取用 / [5341:1033](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5341-1033)；13 / Gen2 · 集合跨视图与工作流取用 / [5341:1212](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5341-1212)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [dropIntentResolver.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropIntentResolver.ts)
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [LcosHostOverlay.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.tsx)
- 为什么成立：dropIntentResolver识别collection作为source；当前collection node没有registerTarget。不能把画布投放代表drop进集合。
- 保留/修改：保留canonical apply owner；补收起/展开集合的真实target、落点和回执；同实体跨集合用成员/投影语义，禁复制本体。
- 修复归属：节点/T1集合/T3 Drop
- 验证要求：左drop收纳不自动展开；右拖语义与物理移动分开；同实体两集合；失败/未知/位置待恢复分开。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N20 · 集合图标、颜色、外形身份

- 级别 / 状态：**P2 / 设计有要求，节点身份配置与显示未接**。
- Figma：09 / Gen2 · 色彩层级与近场交互 / [5204:13457](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-13457)；13 / Gen2 · 集合跨视图与工作流取用 / [5333:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5333-96)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [ContextCollectionFace.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/context/ContextCollectionFace.tsx)
- 为什么成立：当前collection固定Folder和色；ContextCollectionFace organization支持事情/时间/未指定，但Main未用。自定义持久身份producer尚需查证。
- 保留/修改：先接已存真实身份和13页事件/时间材质；不能随机给图标；自定义能力没有owner则记录明确待绑定，不新造配置真值。
- 修复归属：节点/T2/T6读适配
- 验证要求：身份在Main/Atlas/Railway/Pin定位一致；改名/颜色/形状不改成员与导航目标。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N21 · 工作流集合书册在Main的形态

- 级别 / 状态：**P1 / 专用face已接，但外层仍套卡且没有封面数据**。
- Figma：13 / Gen2 · 集合跨视图与工作流取用 / [5334:46](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5334-46)；13 / Gen2 · 集合跨视图与工作流取用 / [5338:24](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5338-24)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [WorkflowCollectionView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/workflow/WorkflowCollectionView.tsx)
  - [WorkflowCollectionFace.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/workflow/WorkflowCollectionFace.tsx)
- 为什么成立：LcosSpeciesBodyContent:255用WorkflowCollectionView；外层isFreeformSource仅source为true，workflow-collection仍白底border/shadow/padding；未传previewUrl，封面始终无图。
- 保留/修改：沿用书册face，去通用节点卡；传真实预览、保持真实Workflow scope和enter callback。
- 修复归属：节点/工作流
- 验证要求：真实导入Workflow在Main与Assembly同身份封面，双击/进入、禁用原因、已有目标定位。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N22 · 子现场入口及来源返回

- 级别 / 状态：**P1 / 真实导航已接，节点外形仍泛化**。
- Figma：06 / Gen2 · 图标与光幕空间 / [5144:675](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5144-675)；13 / Gen2 · 集合跨视图与工作流取用 / [5350:20987](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5350-20987)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [PortalNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/PortalNodeBody.tsx)
  - [childWorksiteNavigation.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/childWorksiteNavigation.ts)
  - [ProfessionalWindowStage.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.tsx)
- 为什么成立：Portal双击/Enter经真实targetCanvasId打开window；工作流调用beginChildWorksiteNavigation。但Portal本体仍Router+入口chip+通用卡，近景直接显示目标ID。
- 保留/修改：保留真实导航/恢复链，替换物种外形和用户文案；按13页目标预览与统一window，不展示内部ID当正文。
- 修复归属：节点/Portal/T2
- 验证要求：进入Context child再返回：原surface/camera/selection/source locator保留；目标缺失可解释。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N23 · 门户只读预览、局部缩放和打开

- 级别 / 状态：**P2 / 真实scene预览已接，需保留**。
- Figma：13 / Gen2 · 集合跨视图与工作流取用 / [5348:1151](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5348-1151)；13 / Gen2 · 集合跨视图与工作流取用 / [5350:1332](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5350-1332)；13 / Gen2 · 集合跨视图与工作流取用 / [5350:1490](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5350-1490)；13 / Gen2 · 集合跨视图与工作流取用 / [5350:1672](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5350-1672)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [PortalPreviewBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/PortalPreviewBody.tsx)
  - [PortalPreviewView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/PortalPreviewView.tsx)
- 为什么成立：CanvasTargetPreview使用useSpacePreviewScene+SpacePreviewViewport，zoomRequest只局部；六态来自scene/stale/error/truncated而非假数据；打开需真实workspace解析。
- 保留/修改：保留该owner和真实预览机制；统一外壳和错误文案，不退回静态缩略图。
- 修复归属：Portal/窗口
- 验证要求：预览缩放Main camera不变；打开正确surface；缓存/部分/加载/失败/缺失分别真实复现。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N24 · 门户提升/投递生命周期

- 级别 / 状态：**P1 / 未在当前Portal body找到完整组合能力**。
- Figma：13 / Gen2 · 集合跨视图与工作流取用 / [5350:20679](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5350-20679)；13 / Gen2 · 集合跨视图与工作流取用 / [5350:20877](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5350-20877)；13 / Gen2 · 集合跨视图与工作流取用 / [5351:1219](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5351-1219)；13 / Gen2 · 集合跨视图与工作流取用 / [5351:1358](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5351-1358)；13 / Gen2 · 集合跨视图与工作流取用 / [5351:1491](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5351-1491)；13 / Gen2 · 集合跨视图与工作流取用 / [5351:1624](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5351-1624)；13 / Gen2 · 集合跨视图与工作流取用 / [5351:1757](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5351-1757)；13 / Gen2 · 集合跨视图与工作流取用 / [5351:1890](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5351-1890)；13 / Gen2 · 集合跨视图与工作流取用 / [5352:2038](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5352-2038)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [PortalPreviewBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/PortalPreviewBody.tsx)
  - [PortalPreviewView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/PortalPreviewView.tsx)
  - [dropTargetRegistry.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropTargetRegistry.ts)
- 为什么成立：PortalPreviewView只onOpen/onRetry/onZoom；body未提供Portal delivery target、逐项投递结果或同target提升到Assembly/WorkView的入口。
- 保留/修改：拆为真实target升格与投递回执两组，复用同window、同drop机制；未确认receipt不播完成。
- 修复归属：Portal/窗口/T3 Drop
- 验证要求：P04/P05提升target不变；P07-P13落点/等待/部分/成功/未知/失败每项实测，不因重试复制对象。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N25 · Colony轮廓、剥离与取消

- 级别 / 状态：**P1 / 原T1有细规格，精确当前Figma专帧未查到；代码未见生产呈现**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5100:85](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5100-85)
- 正确采用稿：T1原卡语义；Main只作空间关系参照，不能宣称5100:85提供全部Colony当前定稿。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [reconciliationRunner.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/spatial/reconciliationRunner.ts)
- 为什么成立：T1原卡§34/40定义rest contour→peel→tether→pending→commit/cancel；当前lcos/spatial检索未找到colony呈现链。不能把Collection文件夹当Colony完成。
- 保留/修改：列为明确不漏项与设计/事实补证；找到最新同功能HTML与Figma实际形态后再接既有membership/derived contour。
- 修复归属：节点/T1/总审计
- 验证要求：真实成员推导轮廓，无编辑控制点；peel取消无canonical变化；跨scope rescope先预览后真回执。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N26 · 远/中/近四档节点信息层级

- 级别 / 状态：**P0 / 唯一density已接，表现层只部分消费**。
- Figma：07 / Gen2 · 信息层级与细节 / [5152:272](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-272)；07 / Gen2 · 信息层级与细节 / [5152:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-49)；07 / Gen2 · 信息层级与细节 / [5152:503](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-503)；07 / Gen2 · 信息层级与细节 / [5152:753](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-753)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [useLcosDensity.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/useLcosDensity.ts)
  - [source-presentation.css](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/source-presentation.css)
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
- 为什么成立：useLcosDensity正确读world尺寸×screen px×phase并密度封顶；正文仅mark/非mark，Glyth34/92二段，非source多数标题chip仅删meta。
- 保留/修改：保留唯一density算法；为每个物种四档配置真实信息，不用重复resolver、不靠整体scale藏小字。
- 修复归属：节点/T1
- 验证要求：同画布大小节点不同screen预算可区别；远景方向/轮廓、中景身份内容、近景操作；80/150/300节点实机性能与可读性。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N27 · 节点11态与原位轻反馈

- 级别 / 状态：**P1 / 选择机械保留，其余状态呈现有漏接**。
- Figma：08 / Gen2 · 第二轮基础操作 / [5186:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5186-49)；08 / Gen2 · 第二轮基础操作 / [5186:312](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5186-312)；08 / Gen2 · 第二轮基础操作 / [5187:179](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-179)；09 / Gen2 · 色彩层级与近场交互 / [5204:13842](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-13842)；11 / Gen2 · Glyth 续工与分支对话 / [5262:551](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-551)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [SourceFeedbackSlot.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/SourceFeedbackSlot.tsx)
  - [sourceViewTypes.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/sourceViewTypes.ts)
- 为什么成立：SourceVisualProps虽有interaction/feedback但生产不传；draft/current/conflict/waiting没有共享真实映射；不能把统一outline视作11态。
- 保留/修改：逐状态接真实owner，Referenced与Selected可并存；运行只动画活动对象；red只失败；不添加多余常驻能力图标。
- 修复归属：节点/T3
- 验证要求：idle/hover/selected/referenced/dragging/running/waiting/draft/current/conflict/failed逐项真实触发；reduced-motion仍可辨。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N28 · 拖动、resize、中断及内容尺寸

- 级别 / 状态：**P1 / Huabu机械保留，LCOSbody固定像素布局有风险**。
- Figma：08 / Gen2 · 第二轮基础操作 / [5187:179](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-179)；08 / Gen2 · 第二轮基础操作 / [5188:635](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-635)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [source-presentation.css](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/source/source-presentation.css)
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
- 为什么成立：body内容固定text槽、audio caption top79、Glyth121x142子定位，与任意已存geometry不总一致。不能重写全部历史尺寸来贴Figma。
- 保留/修改：修body基于自身容器适配，保留Huabu几何；resize/drag中的阴影与文字应稳定。
- 修复归属：节点/T1
- 验证要求：最小/最大/窄高节点resize、Escape/pointercancel、重做撤销；camera变换后Arc/body同目标不漂。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N29 · GLYTH本体与真实基本状态

- 级别 / 状态：**P2 / 已采用donor，六用户态基本接通**。
- Figma：5235:49 / [5388:118](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-118)；5235:49 / [5388:119](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-119)；05 / Gen2 · 第二轮空间与角色 / [5103:1932](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5103-1932)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
  - [GlythBodyView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/glyth/GlythBodyView.tsx)
  - [glythPresence.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/glyth/glythPresence.ts)
- 为什么成立：useCollaborationSession→glythInputFromCollaborationState→pose；thinking特殊、unavailable confused，needs_user amber注意；actual donor renderer、共享clock/visibility/reduced-motion均存在。
- 保留/修改：保留本体与life-cycle；核对ready/thinking/working/needs_user/done/unavailable视觉差别；done与ready当前都idle，是否需有限完成反应由真实receipt触发。
- 修复归属：GLYTH主代理
- 验证要求：六态逐一真实投影；hover gaze；offscreen不循环；reduced-motion静态但有注意力；不随机生成第二只角色。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N30 · GLYTH缩放接管与身体命中

- 级别 / 状态：**P1 / 二段硬切替代连续takeover**。
- Figma：07 / Gen2 · 信息层级与细节 / [5152:272](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-272)；07 / Gen2 · 信息层级与细节 / [5152:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5152-49)；05 / Gen2 · 第二轮空间与角色 / [5101:1371](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-1371)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
  - [GlythBodyView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/glyth/GlythBodyView.tsx)
- 为什么成立：GlythNodeBody:58-61按mark立即34px/92px并改left/top，没有读Huabu takeover blend；label同一跳点消失。
- 保留/修改：接已有连续接管值为presentation，不建第二LOD；保持真实身体与anchor连续。
- 修复归属：GLYTH/T1
- 验证要求：连续缩放录屏，身体重心/Arc锚点不跳、可选中区域一致、低动态平滑/直接终态。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N31 · 投送材料给GLYTH的命中与就近草稿

- 级别 / 状态：**P0 / 语义接口已接，空间命中有过期风险**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5101:1243](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-1243)；13 / Gen2 · 集合跨视图与工作流取用 / [5344:999](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5344-999)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
  - [dropTargetRegistry.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropTargetRegistry.ts)
  - [LcosHostOverlay.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.tsx)
- 为什么成立：GLYTH注册collaboration-reference；rect仅mount/ResizeObserver/window resize/scroll更新，不订阅node position/camera transform；registry按缓存rect命中。投送后openComposer anchor={0,0,0,0}，需验证是否会偏离角色。
- 保留/修改：主代理统一Drop实测并修源于真实geometry更新的target rect；Composer以该Glyth真实anchor定位。保留现行facade语义。
- 修复归属：GLYTH/T3 Drop
- 验证要求：先平移/缩放/拖走Glyth，再投到新位置；原位置不命中；草稿就近且不被窗口遮住；源对象不消失。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N32 · GLYTH原位续工入口与Composer内展开

- 级别 / 状态：**P0 / 生产路径逼用户先开大工作窗**。
- Figma：11 / Gen2 · Glyth 续工与分支对话 / [5243:50](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5243-50)；11 / Gen2 · Glyth 续工与分支对话 / [5246:59](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5246-59)；11 / Gen2 · Glyth 续工与分支对话 / [5249:104](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5249-104)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx)
  - [ConversationWorkViewBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx)
  - [LcosComposerHost.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/composer/LcosComposerHost.tsx)
- 为什么成立：Arc compose:271永远给conversation receiverBlockedReason“请先在会话窗口确认…”且无operationId；WorkView里常驻续工卡+四按钮，未用11页在既有Composer内展开。
- 保留/修改：在同目标读取已有operation/capabilities，让Arc可直接原位续工；继承确认进现有Composer折叠层，不增新的大弹窗；保留facade重试ID。
- 修复归属：GLYTH/Arc/Composer主代理
- 验证要求：从画布选Glyth→续工→输入→发送无需先开WorkView；同会话不新生Glyth；已有草稿不丢。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N33 · 续工四种模式及不支持时显式改选

- 级别 / 状态：**P1 / 真实四action与capabilities已接，形态和比较层次偏差**。
- Figma：11 / Gen2 · Glyth 续工与分支对话 / [5249:415](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5249-415)；11 / Gen2 · Glyth 续工与分支对话 / [5249:726](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5249-726)；11 / Gen2 · Glyth 续工与分支对话 / [5249:1044](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5249-1044)；11 / Gen2 · Glyth 续工与分支对话 / [5249:1355](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5249-1355)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [ConversationWorkViewBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx)
  - [conversationContinuationActions.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/conversationContinuationActions.ts)
- 为什么成立：continue_existing/selected_context/blank_new/native_full_fork经capability禁用并保留原因，真实collaboration.recover/send等需保留；页面是四个常驻pill而非compact progressive reveal。
- 保留/修改：改入口布局，保留四种真义：继续/完整分支/空白/精选继承；隔离目录不与继承方式混同。
- 修复归属：GLYTH/Composer
- 验证要求：每模式真实可用/不可用；不支持分支不可自动降级；空白不隐含引用；选中上下文只带明确refs。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N34 · 续工确认来源、提交快照与草稿分离

- 级别 / 状态：**P1 / 意图ID保留存在，近场确认UI未对稿**。
- Figma：11 / Gen2 · Glyth 续工与分支对话 / [5249:1665](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5249-1665)；11 / Gen2 · Glyth 续工与分支对话 / [5249:1975](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5249-1975)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [ConversationWorkViewBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx)
  - [conversationContinuationActions.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/conversationContinuationActions.ts)
  - [composerSubmission.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/composer/composerSubmission.ts)
- 为什么成立：retainContinuationIntent维护operation/message身份；对应Figma确认来源/提交快照未在node或Composer观察到完整呈现；不能删该幂等逻辑换好看的假表单。
- 保留/修改：在既有Composer按能力增加compact source review；只显示真实来源与已提交snapshot，输入草稿单独留存。
- 修复归属：GLYTH/Composer
- 验证要求：提交后继续编辑不改已发内容；未知结果重试复用原operation；关开/切会话草稿不串。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N35 · 创建伴身种子与四阶段可见回执

- 级别 / 状态：**P1 / 缺GLYTH伴身呈现**。
- Figma：11 / Gen2 · Glyth 续工与分支对话 / [5250:319](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5250-319)；11 / Gen2 · Glyth 续工与分支对话 / [5250:593](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5250-593)；11 / Gen2 · Glyth 续工与分支对话 / [5250:860](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5250-860)；11 / Gen2 · Glyth 续工与分支对话 / [5250:1130](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5250-1130)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
  - [ConversationWorkViewBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx)
  - [RecoverySection.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/RecoverySection.tsx)
- 为什么成立：GLYTH body仅基本userState，未读creation/continuation operation阶段；没有伴身seed。WorkView把operation结果写文字回执。
- 保留/修改：伴身种子是presentation transient，不是新Entity；external created/associated/history pending/projection pending按真实阶段变化。
- 修复归属：GLYTH主代理
- 验证要求：创建中不产生第二canonical会话；外部已创建但关联失败不重发创建；定位只在projection ready可用。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N36 · 分支创建完成、来源尾迹与精选继承完成

- 级别 / 状态：**P1 / 有限reaction接口有，真实调用未接**。
- Figma：11 / Gen2 · Glyth 续工与分支对话 / [5250:1397](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5250-1397)；11 / Gen2 · Glyth 续工与分支对话 / [5250:1670](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5250-1670)；11 / Gen2 · Glyth 续工与分支对话 / [5262:1078](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-1078)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [glythPresence.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/glyth/glythPresence.ts)
  - [GlythBodyView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/glyth/GlythBodyView.tsx)
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
- 为什么成立：reaction{ id,kind }支持spin/bounce/burst并防remount重播；GlythNodeBody不传reaction，全生产rg无reaction=consumer。
- 保留/修改：以真实确认receipt触发一次完成扩散，再收敛为轻来源标记；不按drop release或按钮点击播成功。
- 修复归属：GLYTH主代理
- 验证要求：完成一次动画；reload不重播；原生分支/精选继承保不同来源事实；未完成不庆祝。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N37 · 续工失败、未知与取消恢复

- 级别 / 状态：**P0 / 真实恢复section存在，未落回近场状态**。
- Figma：11 / Gen2 · Glyth 续工与分支对话 / [5251:407](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5251-407)；11 / Gen2 · Glyth 续工与分支对话 / [5251:674](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5251-674)；11 / Gen2 · Glyth 续工与分支对话 / [5251:941](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5251-941)；11 / Gen2 · Glyth 续工与分支对话 / [5253:509](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5253-509)；11 / Gen2 · Glyth 续工与分支对话 / [5253:776](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5253-776)；11 / Gen2 · Glyth 续工与分支对话 / [5253:1043](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5253-1043)；11 / Gen2 · Glyth 续工与分支对话 / [5252:453](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5252-453)；11 / Gen2 · Glyth 续工与分支对话 / [5252:720](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5252-720)；11 / Gen2 · Glyth 续工与分支对话 / [5252:993](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5252-993)；11 / Gen2 · Glyth 续工与分支对话 / [5252:1260](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5252-1260)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [RecoverySection.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/RecoverySection.tsx)
  - [ConversationWorkViewBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx)
  - [GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)
- 为什么成立：RecoverySection按operations.allowedActions接facade真实恢复；节点仍只六用户态，未表达已创建仅关联失败/位置失败、取消未知等细节。
- 保留/修改：保留恢复动作owner，近场Composer和种子用清晰可视状态链接同section；禁止把结果未知自动画成失败并提供新建。
- 修复归属：GLYTH主代理
- 验证要求：10个Figma状态逐项fixture+真实receipt，核对原操作/取消确认/重启恢复；误重复创建为失败。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N38 · 焦点薄光边、处理边缘色散和减少动态

- 级别 / 状态：**P2 / 有选中/注意光边，无处理种子色散caller**。
- Figma：11 / Gen2 · Glyth 续工与分支对话 / [5262:551](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-551)；11 / Gen2 · Glyth 续工与分支对话 / [5262:807](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-807)；11 / Gen2 · Glyth 续工与分支对话 / [5262:1078](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-1078)；13 / Gen2 · 集合跨视图与工作流取用 / [5353:1476](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5353-1476)；13 / Gen2 · 集合跨视图与工作流取用 / [5353:1949](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5353-1949)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [glyth-presence.css](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/glyth/glyth-presence.css)
  - [glythPresence.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/glyth/glythPresence.ts)
  - [glythMotion.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/motion/glythMotion.ts)
- 为什么成立：CSS选中薄光边、needs_user amber已接；处理种子不存在；有限reaction可降低动态。Figma只约束光效，不能全对象全时霓虹。
- 保留/修改：局部光边强弱由真实phase；处理动效仅active对象；完成短暂扩散收回；全局停止动态不删状态信息。
- 修复归属：GLYTH/动效
- 验证要求：静息零持续光圈；hover局部；task不同状态；系统reduced-motion与失焦/offscreen暂停。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N39 · 节点原位空白、重命名、删除/撤销与多选

- 级别 / 状态：**P2 / 原生机械和Arc存在，需逐项真实验证**。
- Figma：08 / Gen2 · 第二轮基础操作 / [5186:312](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5186-312)；08 / Gen2 · 第二轮基础操作 / [5188:374](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-374)；08 / Gen2 · 第二轮基础操作 / [5188:889](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-889)；08 / Gen2 · 第二轮基础操作 / [5188:1658](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-1658)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx)
  - [useLcosCanvasProps.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/useLcosCanvasProps.tsx)
- 为什么成立：节点命令在LCOS Arc；范围型多选/重命名验证/删除undo不能仅依据按钮。此子任务未运行浏览器，不填已完成。
- 保留/修改：保留成熟机械并逐项修阻塞；先保证多选/范围与键盘语义不被新body吃掉。
- 修复归属：T3/总装
- 验证要求：多选删除恢复顺序与布局；重命名空串/长文本；Esc只退顶层；空画布可继续；原生自由节点入口不失。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N40 · 源到Reader/WorkView提升与恢复连续性

- 级别 / 状态：**P1 / 真实双击入口已接，source-revision选择有待核验**。
- Figma：05 / Gen2 · 第二轮空间与角色 / [5103:1526](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5103-1526)；05 / Gen2 · 第二轮空间与角色 / [5388:27411](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27411)；13 / Gen2 · 集合跨视图与工作流取用 / [5350:20877](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5350-20877)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [LcosSpeciesBodies.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx)
  - [LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx)
  - [projectionFacade.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/host/projectionFacade.ts)
- 为什么成立：展示preview按selectedViews选revision读取，但descriptor.currentRevisionId仍artifact.currentRevisionId；openReader以该currentRevisionId，可能从历史投影打开最新版。需构建artifactView固定旧revision复现。
- 保留/修改：source target必须带当前实际呈现revision；不得将“当前对象”误等同“最新版本”。窗口关闭返源保持相机。
- 修复归属：节点/Reader主代理
- 验证要求：历史revision投影→双击Reader仍同revision；最新版节点正常；窗resize不动camera、关闭返源定位正确。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

### N41 · 素材装配到画布后的内容真实性

- 级别 / 状态：**P2 / 部分真实staging已接；不能只看Figma布景完成**。
- Figma：10 / Gen2 · 通透玻璃与铝材对照 / [5388:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-96)；13 / Gen2 · 集合跨视图与工作流取用 / [5346:1416](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5346-1416)
- 正确采用稿：20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态。
- Production 文件：
  - [stageProjectedSources.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/stageProjectedSources.ts)
  - [useLcosCanvasProps.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/useLcosCanvasProps.tsx)
- 为什么成立：stageProjectedSources实际搬Core字节、seed revisions；Main固定几何是new projection初值而非真实项目排版，必须保留现有content/geometry owner。
- 保留/修改：本轮视觉对照使用真实材料组成覆盖场景；不能塞山图/假波形假流程图冒充实现。
- 修复归属：节点/总装
- 验证要求：真实混合材料导入→refresh→Reader→生成结果→再次open保内容；同一entity不重复。
- 是否需截图/录屏补证：是，本轮没有以实机视觉验收替代源码盘点。

## GLYTH及相关设计帧逐项覆盖

|页|Frame|名称|清单项|
|---|---|---|---|
|05 / Gen2 · 第二轮空间与角色|5100:85|01 / 主画布 · 对象各有形体|N25|
|05 / Gen2 · 第二轮空间与角色|5101:853|07 / 文本 · 大纲读法|N04|
|05 / Gen2 · 第二轮空间与角色|5101:1048|08 / 文本 · 导图读法|N04|
|05 / Gen2 · 第二轮空间与角色|5101:1243|09 / Glyth · 接收材料|N31|
|05 / Gen2 · 第二轮空间与角色|5101:1371|10 / Glyth · 持续工作|N30|
|05 / Gen2 · 第二轮空间与角色|5103:1526|13 / 文件 · 阅读展开|N05, N40|
|05 / Gen2 · 第二轮空间与角色|5103:1798|15 / 工作流 · 行动路径|N13|
|05 / Gen2 · 第二轮空间与角色|5103:1932|16 / Glyth · 状态与空间表达|N29|
|05 / Gen2 · 第二轮空间与角色|5122:2365|23 / 能力 · 编辑与装备|N13|
|05 / Gen2 · 第二轮空间与角色|5122:2664|26 / 上下文 · 关系与来源|N16|
|05 / Gen2 · 第二轮空间与角色|5122:2949|28 / 结果 · 对照与采用|N12|
|05 / Gen2 · 第二轮空间与角色|5122:3070|29 / 音频 · 阅读与摘取|N07|
|05 / Gen2 · 第二轮空间与角色|5122:3305|30 / 视频 · 帧与片段|N08|
|05 / Gen2 · 第二轮空间与角色|5122:3442|31 / 网页 · 阅读与引用|N09|
|05 / Gen2 · 第二轮空间与角色|5388:27411|统一主稿 / 阅读器|N40|
|07 / Gen2 · 信息层级与细节|5152:49|02 · 中距离 / 内容与关系|N16, N26, N30|
|07 / Gen2 · 信息层级与细节|5152:272|01 · 远距离 / 形体与方向|N26, N30|
|07 / Gen2 · 信息层级与细节|5152:503|03 · 近距离 / 文字原位阅读|N02, N26|
|07 / Gen2 · 信息层级与细节|5152:753|04 · 近距离 / 图像原位操作|N06, N26|
|07 / Gen2 · 信息层级与细节|5153:540|06 · 彩色标 / 对象对应|N14|
|08 / Gen2 · 第二轮基础操作|5186:49|01 · 单选与对象工具|N27|
|08 / Gen2 · 第二轮基础操作|5186:312|02 · 框选与多选作用范围|N27, N39|
|08 / Gen2 · 第二轮基础操作|5187:179|03 · 拖动、对齐与取消|N27, N28|
|08 / Gen2 · 第二轮基础操作|5187:431|04 · 引用落点与原位保留|N15|
|08 / Gen2 · 第二轮基础操作|5188:374|06 · 重命名与输入校验|N39|
|08 / Gen2 · 第二轮基础操作|5188:635|07 · 原位编辑与焦点|N03, N28|
|08 / Gen2 · 第二轮基础操作|5188:889|08 · 移除与撤销恢复|N39|
|08 / Gen2 · 第二轮基础操作|5188:1395|10 · 部分导入失败|N10|
|08 / Gen2 · 第二轮基础操作|5188:1658|11 · 空画布与继续工作|N39|
|08 / Gen2 · 第二轮基础操作|5191:789|12 · 只读与可用范围|N03, N10|
|08 / Gen2 · 第二轮基础操作|5191:1036|13 · 任务失败与重试|N11|
|09 / Gen2 · 色彩层级与近场交互|5203:13424|06 · 集合展开 · 六份混合材料|N18|
|09 / Gen2 · 色彩层级与近场交互|5204:107|08 · 集合展开 · 十二份材料自动排布|N18|
|09 / Gen2 · 色彩层级与近场交互|5204:13457|07 · 集合身份 · 图标颜色与外形|N20|
|09 / Gen2 · 色彩层级与近场交互|5204:13842|09 · 节点执行 · 局部反馈|N11, N12, N27|
|09 / Gen2 · 色彩层级与近场交互|5229:1489|13 · 引用选择 / 缩略预览与就近操作|N15|
|09 / Gen2 · 色彩层级与近场交互|5229:1753|14 · 移除一份引用 / 保留输入|N15|
|11 / Gen2 · Glyth 续工与分支对话|5243:50|01 · Glyth 原位续工|N32|
|11 / Gen2 · Glyth 续工与分支对话|5246:59|02 · 续工在 Composer 内展开|N32|
|11 / Gen2 · Glyth 续工与分支对话|5249:104|03 · 继续当前，不生出第二只|N32|
|11 / Gen2 · Glyth 续工与分支对话|5249:415|04 · 完整历史分支，可用能力样本|N33|
|11 / Gen2 · Glyth 续工与分支对话|5249:726|05 · 不支持原生分支，显式改选|N33|
|11 / Gen2 · Glyth 续工与分支对话|5249:1044|06 · 空白新建，没有隐含继承|N33|
|11 / Gen2 · Glyth 续工与分支对话|5249:1355|07 · 精选继承与隔离目录分开|N33|
|11 / Gen2 · Glyth 续工与分支对话|5249:1665|08 · 检查来源与确认内容|N34|
|11 / Gen2 · Glyth 续工与分支对话|5249:1975|09 · 已提交快照，草稿另存|N34|
|11 / Gen2 · Glyth 续工与分支对话|5250:319|10 · 正在创建，只有伴身种子|N35|
|11 / Gen2 · Glyth 续工与分支对话|5250:593|11 · 外部已创建，正在关联项目|N35|
|11 / Gen2 · Glyth 续工与分支对话|5250:860|12 · 投影已存在，历史仍待同步|N35|
|11 / Gen2 · Glyth 续工与分支对话|5250:1130|13 · 正在放入现场，暂不可定位|N35|
|11 / Gen2 · Glyth 续工与分支对话|5250:1397|14 · 原生分支完成，轻量来源|N36|
|11 / Gen2 · Glyth 续工与分支对话|5250:1670|15 · 精选上下文完成，独立来源|N36|
|11 / Gen2 · Glyth 续工与分支对话|5251:407|16 · 确认未创建，保留草稿|N37|
|11 / Gen2 · Glyth 续工与分支对话|5251:674|17 · 外部已创建，项目关联失败|N37|
|11 / Gen2 · Glyth 续工与分支对话|5251:941|18 · 已有对话，仅画布位置失败|N37|
|11 / Gen2 · Glyth 续工与分支对话|5252:453|22 · 取消结果未知|N37|
|11 / Gen2 · Glyth 续工与分支对话|5252:720|23 · 重启恢复，不重播出生|N37|
|11 / Gen2 · Glyth 续工与分支对话|5252:993|24 · 能力变化，重新检查|N37|
|11 / Gen2 · Glyth 续工与分支对话|5252:1260|25 · 原对话不可继续|N37|
|11 / Gen2 · Glyth 续工与分支对话|5253:509|19 · 结果未知，查验原操作|N37|
|11 / Gen2 · Glyth 续工与分支对话|5253:776|20 · 请求取消，不提前收回|N37|
|11 / Gen2 · Glyth 续工与分支对话|5253:1043|21 · 取消已确认|N37|
|11 / Gen2 · Glyth 续工与分支对话|5262:551|26 · 焦点 · 薄光边，不常驻发光|N27, N38|
|11 / Gen2 · Glyth 续工与分支对话|5262:807|27 · 处理中 · 色散沿种子边缘流动|N38|
|11 / Gen2 · Glyth 续工与分支对话|5262:1078|28 · 创建完成 · 辉光扩散后收回|N36, N38|
|11 / Gen2 · Glyth 续工与分支对话|5321:13084|阅读说明 / 11 · Glyth 续工与分支对话|阅读说明/历史纠偏；见全局采用规则|
|13 / Gen2 · 集合跨视图与工作流取用|5333:96|集合 / 上下文跨视图|N17, N18, N20|
|13 / Gen2 · 集合跨视图与工作流取用|5334:46|集合 / 工作流跨视图|N21|
|13 / Gen2 · 集合跨视图与工作流取用|5338:24|00 / 同对象跨视图 · 形态对照|N17, N21|
|13 / Gen2 · 集合跨视图与工作流取用|5340:398|A02 / 拿起与建议落点|N19|
|13 / Gen2 · 集合跨视图与工作流取用|5341:279|A03 / 等待放入回执|N19|
|13 / Gen2 · 集合跨视图与工作流取用|5341:496|A04 / 已有集合投影|N17|
|13 / Gen2 · 集合跨视图与工作流取用|5341:1033|A07 / 已加入 · 位置待恢复|N19|
|13 / Gen2 · 集合跨视图与工作流取用|5341:1212|A08 / 放入已确认|N19|
|13 / Gen2 · 集合跨视图与工作流取用|5344:999|B04 / 交给目标 Glyth|N31|
|13 / Gen2 · 集合跨视图与工作流取用|5346:1416|C01 / 装配 · 瀑布流|N41|
|13 / Gen2 · 集合跨视图与工作流取用|5348:1151|产品 Portal / 目标预览状态|N23|
|13 / Gen2 · 集合跨视图与工作流取用|5350:1332|P01 / Context 门户 · 只读预览|N23|
|13 / Gen2 · 集合跨视图与工作流取用|5350:1490|P02 / 门户局部放大 · Main 不动|N23|
|13 / Gen2 · 集合跨视图与工作流取用|5350:1672|P03 / 打开工作流现场 · 独立状态|N23|
|13 / Gen2 · 集合跨视图与工作流取用|5350:20679|P04 / 门户提升为装配 · 同目标|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5350:20877|P05 / 门户提升为工作台 · 同目标|N24, N40|
|13 / Gen2 · 集合跨视图与工作流取用|5350:20987|P06 / 进入Context子画布 · 返回Portal来源|N22|
|13 / Gen2 · 集合跨视图与工作流取用|5351:1219|P07 / 门户投递 · 落点预览|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5351:1358|P08 / 门户投递 · 等待回执|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5351:1491|P09 / 门户投递 · 部分完成|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5351:1624|P10 / 门户投递 · 已确认放入|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5351:1757|P11 / 门户投递 · 结果未知|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5351:1890|P12 / 门户投递 · 投递失败|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5352:2038|P13 / 投递部分完成 · 逐项结果|N24|
|13 / Gen2 · 集合跨视图与工作流取用|5353:1476|R01 / 减少动态效果 · Main|N38|
|13 / Gen2 · 集合跨视图与工作流取用|5353:1949|R04 / 减少动态效果 · 目标|N38|

## 推荐施工顺序

1. N01、N12、N14、N15：修真实事实到呈现的断线；保留单owner，不先调圆角。
2. N17–N21：集合正确形态、主画布/装配/总览同身份，展开/收纳/drop联动。
3. N02、N05–N10、N13：文字、文档、图像、音频、视频、网页、Skill各自形态和真实内容。
4. N26–N28：四档信息层级与11态、resize/drag/cancel；统一body消费density。
5. N31–N38：GLYTH原位续工和创建/分支/恢复闭环；有限动效要连接真实receipt。
6. N22–N24、N40：门户与Reader提升/返回，同target/revision/camera连续。
7. N04、N16、N25、N39：三读法/关系/Colony和全基础操作，对缺原件或owner的部分精确补证，不能静默排除。

## 必须保留的现有实现

- 唯一NodePresentation junction、绑定身份、原生Huabu选择/拖拽/resize、未绑定节点原生编辑。
- stageProjectedSources真实文件字节与revision staging。
- useLcosDensity唯一解析；只补body消费，不复制LOD计算。
- GLYTH已有donor渲染/统一clock/visibility/reduced-motion，facade和operation身份恢复机制。
- Portal真实scene cache和局部zoom，合法workspace解析后进入现场。

## 未证实 / 不得冒充完成

- 未逐帧播放Figma原型；离线包明确缺关键连续动效录屏。
- 未对本子域运行生产浏览器，所有browserVerified=false。
- Colony精确当前Figma专项、部分节点基础态没有逐状态当前整页图，已记录设计证据缺口，不能编造nodeId。
- 旧T1 Core文本原位编辑要求与20260914只读投影裁决有更替，实际以新裁决+Reader同目标为准。
- 部分细功能只有原卡语义/HTML，需要全局清单归并，不能因为Figma未画成独立页面就删除。

该清单覆盖41个功能/状态组；细帧保留可合并JSON。它是节点子域清单，不能代替14页整套GUI主清单。
