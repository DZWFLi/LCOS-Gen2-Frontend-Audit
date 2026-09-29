# 节点域 N01–N41 施工后逐项状态

日期：2026-09-26。仅隔离施工树，未提交主仓或发布。

**结论：41项已全部回填，不能理解为41项全部完成。** 初始盘点的状态和证据留在 inventory-nodes.json；其中 current/currentStatus 是本次施工后的事实。

已完成的主要消费端修复包括材料不丢本体、真实媒体、Pin/引用标、集合轮廓、四档LOD、Glyth真实状态主动作与首屏身份加载。真正没做完的仍列在每项“仍缺”里。

## 全项索引

|项|功能|当前状态|
|---|---|---|
|N01|物种唯一生产接缝与原生机械保留|已修主要回归；保留唯一接缝|
|N02|大字文本 / 近场阅读表面|已修层级；长文数据仍有缺口|
|N03|原生自由文本原位编辑 / 托管材料只读差异|已保留职责；完整编辑回合待补证|
|N04|同对象文本 / 大纲 / 导图三读法|未实现|
|N05|文档 / PDF / 演示封面物种|PDF已接；Office/PPT待实现和补证|
|N06|图像主图 / 缩略图与真实比例|本轮修复；边界组合待补证|
|N07|音频波形、时长、播放与scrub|真实播放已接|
|N08|视频节点与帧/片段识别|生产接缝已接；实媒体端到端待补|
|N09|网页 / 链接物种与站点身份|生产接缝已接；端到端待补|
|N10|未知文件与源缺失反馈|部分完成|
|N11|生成中对象与运行状态机|部分完成|
|N12|生成结果Draft、Current与来源|来源/本体修复；审核语义待补|
|N13|技能、决策、提示对象的独立形态|未完成独立形态|
|N14|节点角标与ColorPin真实颜色成员|真实membership已接|
|N15|引用独立于选中，节点静默标识|静默引用标已接|
|N16|关系活边、目标容差与远近权重|部分保留；关系视觉仍缺|
|N17|集合主画布压缩文件夹|轮廓已修；Gen2普通集合producer未接|
|N18|集合展开、收起与自动排布|现有几何可复用；折叠显示接缝未接|
|N19|集合收纳drop与多集合共享成员|普通集合target与正式成员接收未接|
|N20|集合图标、颜色、外形身份|未完成集合身份自定义|
|N21|工作流集合书册在Main的形态|工作流书册已接|
|N22|子现场入口及来源返回|职责保留；真实子现场待补证|
|N23|门户只读预览、局部缩放和打开|部分接入|
|N24|门户提升/投递生命周期|生命周期尚未全完成|
|N25|Colony轮廓、剥离与取消|未实现|
|N26|远/中/近四档节点信息层级|四档消费与连续可读性已修|
|N27|节点11态与原位轻反馈|状态反馈部分完成|
|N28|拖动、resize、中断及内容尺寸|尺寸与LOD修复；机械保留|
|N29|GLYTH本体与真实基本状态|真实Glyth状态已修|
|N30|GLYTH缩放接管与身体命中|本体连续缩放已修；接管变形未完|
|N31|投送材料给GLYTH的命中与就近草稿|草稿投送已接；长期语义与链路未闭环|
|N32|GLYTH原位续工入口与Composer内展开|近场续工已接|
|N33|续工四种模式及不支持时显式改选|四模式渐进控制已接|
|N34|续工确认来源、提交快照与草稿分离|当前挂载期快照已修|
|N35|创建伴身种子与四阶段可见回执|未完成伴身创建四阶段|
|N36|分支创建完成、来源尾迹与精选继承完成|未完成来源尾迹|
|N37|续工失败、未知与取消恢复|错误恢复部分完成|
|N38|焦点薄光边、处理边缘色散和减少动态|轻反馈部分完成|
|N39|节点原位空白、重命名、删除/撤销与多选|基本机械保留；全操作清单未验完|
|N40|源到Reader/WorkView提升与恢复连续性|真实窗口目标已接；提升连续动效未完|
|N41|素材装配到画布后的内容真实性|真实内容落成已修；更多媒体E2E待补|

## N01 · 物种唯一生产接缝与原生机械保留

- **状态**：已修主要回归；保留唯一接缝
- **采用Figma**：5388:96。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：真实 node seam 未另建 Canvas；新增先读 canonical 绑定身份、随后原 reconcile 描述、原 store 原子替换。首次身份未就绪使用原 skeleton；原生自由节点在成功空列表后立即开放。
- **仍缺**：新投影在 reconcile 中才产生的所有时序仍需更大项目覆盖；不把十节点 fixture 当任意规模证明。
- **验证边界**：27 项身份/接缝/caller 行为测试；实际主画布初载逐帧 nativeVisible=0，GET失败后重试恢复。
- **详情**：[nodes-first-load-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-first-load-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\useLcosCanvasProps.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\createLcosNodePresentationSeam.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\lcosNodeCardRegistry.ts`

## N02 · 大字文本 / 近场阅读表面

- **状态**：已修层级；长文数据仍有缺口
- **采用Figma**：5388:102, 5152:503。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：文本按现有几何和 zoom 调整字号；文档四档使用真实首句/片段，摘要不再挤满小字，最小屏幕字级与正文槽裁剪生效。
- **仍缺**：上游 buildContentPreview 仍压缩空白且截取160字；reading不能冒充全文，正文继续用真实Reader。
- **验证边界**：LOD/材料31项；37%/53%/100%真实截图；长文整段待补真实内容供给。
- **详情**：[nodes-lod-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-lod-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\TextSourceView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\source-presentation.css`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`

## N03 · 原生自由文本原位编辑 / 托管材料只读差异

- **状态**：已保留职责；完整编辑回合待补证
- **采用Figma**：5046:52, 5188:635, 5191:789。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：未绑定自由节点仍回原生编辑；受管材料保持只读投影，双击精确 Reader；重试/媒体控件的双击不会误开窗口。
- **仍缺**：未新增 canonical 原位编辑能力；自由文本IME/撤销/多选全回合未逐项浏览器验证。
- **验证边界**：真实 seam/caller 回归；单击不打开，双击Reader目标准确。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\presentation\visualFamily.ts`

## N04 · 同对象文本 / 大纲 / 导图三读法

- **状态**：未实现
- **采用Figma**：5101:853, 5101:1048。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：保留真实文本/材料，不伪造大纲或导图状态。
- **仍缺**：同一对象在正文、大纲、导图间切换的实际 producer/命令/视图未完成。
- **验证边界**：仅源码盘点；无运行验收。
- **详情**：[inventory-nodes.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/inventory-nodes.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\presentation\nodePresentation.ts`

## N05 · 文档 / PDF / 演示封面物种

- **状态**：PDF已接；Office/PPT待实现和补证
- **采用Figma**：5388:106, 5103:1526。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：PDF使用真实字节、同PDF.js worker、真实第一页/页数/失败恢复；专业Reader按精确revision取fileRecordId。
- **仍缺**：当前fixture无PDF，真实PDF浏览器未验；Office/PPT真页面缺当前renderer，不能用假封面代替。
- **验证边界**：PDF组件/字节落成/Reader精确revision单测；尚无真实PDF E2E。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\DocumentSourceView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\presentation\visualFamily.ts`

## N06 · 图像主图 / 缩略图与真实比例

- **状态**：本轮修复；边界组合待补证
- **采用Figma**：5388:98, 5388:111, 5152:753。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：图片走已有PreviewMedia，contain保留实际比例；失败有重试，新src清理旧错误；重试双击不误开Reader。
- **仍缺**：横竖超长/透明图与全部窄屏组合未穷尽。
- **验证边界**：真实图主画布可见；error→retry→load与Reader入口回归。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\ImageSourceView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\source-presentation.css`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\stageProjectedSources.ts`

## N07 · 音频波形、时长、播放与scrub

- **状态**：真实播放已接
- **采用Figma**：5388:121, 5122:3070。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：audio原生播放/暂停/metadata/seek；只对真正可解码字节生成声波，无源不画装饰波形。
- **仍缺**：跨源拒绝/损坏文件及长音频浏览器全回合待补；不声称全媒体格式支持。
- **验证边界**：fixture38秒实际音频点击变暂停；进度/seek/error组件回归。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\AudioSourceView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\AudioSourceMorphology.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\sourceFigmaGeometry.ts`

## N08 · 视频节点与帧/片段识别

- **状态**：生产接缝已接；实媒体端到端待补
- **采用Figma**：5122:3305, 5046:71。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：原生VideoNode薄接同一seam，视频使用真实src和原生controls；mark不解码；失败可重试。
- **仍缺**：fixture无真实视频；帧片段、区间引用的完整数据/交互未完成。
- **验证边界**：真实URL/失败恢复/控件手势回归；无真实视频E2E。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\SourceMorphology.tsx`

## N09 · 网页 / 链接物种与站点身份

- **状态**：生产接缝已接；端到端待补
- **采用Figma**：5122:3442, 5051:4623。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：原生WebNode薄接同一seam，复用getWebPreview与hydration调度；真实标题/摘要/图/原文URL；无URL诚实空态。
- **仍缺**：fixture无网页，真实远端网页与鉴权/慢响应浏览器回合未验。
- **验证边界**：接口参数/失败重试/mark不请求回归；无真实网页E2E。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\SourceMorphology.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\presentation\visualFamily.ts`

## N10 · 未知文件与源缺失反馈

- **状态**：部分完成
- **采用Figma**：5191:789, 5188:1395。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：真实已绑定但无描述展示对象内容不可用与读取重试；图片/音频/视频/PDF/Web均不伪造成功内容。
- **仍缺**：未知二进制、缺源与权限不足的全部文件族形态仍是通用fallback，未完成专门呈现。
- **验证边界**：bound loading和媒体失败回归；未知族只读盘点。
- **详情**：[nodes-first-load-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-first-load-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\SourceFeedbackSlot.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\sourceViewTypes.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`

## N11 · 生成中对象与运行状态机

- **状态**：部分完成
- **采用Figma**：5204:13842, 5191:1036, 5388:22998。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：Glyth运行态由真实会话projection驱动，running提供进度；材料sourceRunId不再被解释为假待审核。
- **仍缺**：材料生成中的运行事实及结果审核状态并未全部进入每种body；不能由sourceRunId推断Draft/Current。
- **验证边界**：G02状态命令矩阵与实际thinking会话；生成审核未E2E。
- **详情**：[glyth-g02-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/glyth-g02-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\presentation\nodeSpecies.ts`

## N12 · 生成结果Draft、Current与来源

- **状态**：来源/本体修复；审核语义待补
- **采用Figma**：5122:2949, 5204:13842。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：真实sourceRunId透传；生成图片/音视频等保留材料本体和Reader，不被纯文字生成卡替换。
- **仍缺**：Draft/Current接受/修订/失败事实仍需现有producer提供，未画假审核控件。
- **验证边界**：生成图片真实seam/Reader目标回归。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\createLcosNodePresentationSeam.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\host\projectionFacade.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\presentation\nodeSpecies.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`

## N13 · 技能、决策、提示对象的独立形态

- **状态**：未完成独立形态
- **采用Figma**：5122:2365, 5103:1798。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：保留真实技能/决策/提示实体与既有入口。
- **仍缺**：仍有generic卡形；技能/判断/执行步骤的独立轮廓、密度和细节尚未完整对稿。
- **验证边界**：源码盘点；不可用既有组件注册数充当完成。
- **详情**：[inventory-nodes.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/inventory-nodes.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\presentation\nodeSpecies.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\SourceMorphology.tsx`

## N14 · 节点角标与ColorPin真实颜色成员

- **状态**：真实membership已接
- **采用Figma**：5153:540, 5388:102, 5388:98。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：删除固定装饰Pin；NodeColorPinMarkers读canonical membership/definition/exact target；11px可见角标、24px热区、屏幕尺寸固定；Glyth也挂同组件。
- **仍缺**：集合自定义形状与图标身份不是本次Pin角标接线的替代；完整配置跨视图一致性由导航域继续核验。
- **验证边界**：无membership无角标、entity/view区分、点击authoring回归；真实橙Pin可见。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\TextSourceView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\ImageSourceView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\source\SourceMarker.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\pin\LcosColorPinProvider.tsx`

## N15 · 引用独立于选中，节点静默标识

- **状态**：静默引用标已接
- **采用Figma**：5187:431, 5229:1489, 5229:1753。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：NodeReferenceMarker只读显式草稿；撤销只移除引用不删节点、不改选中；Glyth与Portal共用。
- **仍缺**：引用来源与复杂集合内成员跨视图完整回合仍需合并验证。
- **验证边界**：添加/撤引用保留实体回归；根域Composer键盘与引用条验证另见其记录。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\lcosReferenceState.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\LcosHostOverlay.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\LcosActionArc.tsx`

## N16 · 关系活边、目标容差与远近权重

- **状态**：部分保留；关系视觉仍缺
- **采用Figma**：5122:2664, 5152:49。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：唯一关系/边owner保留，Arc与近场命中由根域修；本次未引第二关系系统。
- **仍缺**：现有Main边标签仍出现references/governs；关系方向/权重/各LOD的完整语义视觉未完成。
- **验证边界**：真实Main截图确认遗留；不宣称关系全对齐。
- **详情**：[nodes-lod-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-lod-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\useLcosCanvasProps.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\LcosEdgeArc.tsx`

## N17 · 集合主画布压缩文件夹

- **状态**：轮廓已修；Gen2普通集合producer未接
- **采用Figma**：5333:96, 5338:24, 5341:496, 5388:96。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：普通集合消费端复用CollectionNodePresentation文件夹轮廓、无外层白卡。旧Core确有collection Scope、snapshot branch建scope/views和通用POST /graph；不是完全没有集合能力。
- **仍缺**：Gen2 reconciliation目前仅main/workflow，缺普通集合producer；T1/T4要求的正式Collection identity/membership未落当前contract，旧Presentation.memberViewIds明确仅迁移兼容，不能冒充正式成员真值。
- **验证边界**：六态采用5333:96；消费端单测；本次逐层核对domain/routes/repository/projection与原T1/T4；普通集合真实E2E仍缺。
- **详情**：[collection-owner-investigation.md](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\collection-owner-investigation.md>)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\lcosNodeCardRegistry.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\context\ContextCollectionView.tsx`

## N18 · 集合展开、收起与自动排布

- **状态**：现有几何可复用；折叠显示接缝未接
- **采用Figma**：5203:13424, 5204:107, 5333:96。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：Huabu已有Frame及free/row/column/grid、fit/hug和reflow；用户已允许进入集合后自动排齐。保留唯一几何owner，不再笼统记为几何owner不存在。
- **仍缺**：缺沿现有host seam实现的会话期显示折叠、隐藏托管子节点、恢复展开与成员manifestation resolver；T1明确不得把折叠写进Core或复制展开坐标。正式membership仍依赖N17。
- **验证边界**：查实FrameNode、shared frame/projection、原T1 Step2A §7–8；未改canonical，未伪造已可展开。
- **详情**：[collection-owner-investigation.md](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\collection-owner-investigation.md>)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\spatial\reconciliationRunner.ts`

## N19 · 集合收纳drop与多集合共享成员

- **状态**：普通集合target与正式成员接收未接
- **采用Figma**：5340:398, 5341:279, 5341:1033, 5341:1212。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：真实携带payload与合法target已接；collection可作Assembly source；节点侧未注册虚假接收区。
- **仍缺**：AssemblyTargetRef无collection target且service校验拒绝把collection scope冒作context/workflow；正式集合member add/remove/list与多集合proxy/hosted规则缺。现有scope/view和Presentation存储能力不等于该contract已完成。
- **验证边界**：已核对contract、service、通用mutation、T1/T4旧Presentation禁作正式membership的原文；没有尝试写入假target。
- **详情**：[collection-owner-investigation.md](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\collection-owner-investigation.md>)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\drop\dropIntentResolver.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\LcosHostOverlay.tsx`

## N20 · 集合图标、颜色、外形身份

- **状态**：未完成集合身份自定义
- **采用Figma**：5204:13457, 5333:96。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：Pin真实颜色已区分，集合/工作流独立轮廓消费端保留。
- **仍缺**：集合自定义图标/形状/颜色的canonical生产与跨Rail/导航映射尚缺，不能拿Pin颜色充当集合身份设计。
- **验证边界**：源码盘点。
- **详情**：[inventory-nodes.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/inventory-nodes.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\context\ContextCollectionFace.tsx`

## N21 · 工作流集合书册在Main的形态

- **状态**：工作流书册已接
- **采用Figma**：5334:46, 5338:24。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：复用WorkflowCollectionView经CollectionNodePresentation接真实主画布scope；透明host，独立书册。多个workspace显式选择，精确scope，缺canvas不跳转。
- **仍缺**：fixture目标workspace缺可进入canvas；完整Main→真实workflow子现场回合仍待真实数据。
- **验证边界**：Main真书册可见；成功/多目标/错scope与无canvascaller回归。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\workflow\WorkflowCollectionView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\workflow\WorkflowCollectionFace.tsx`

## N22 · 子现场入口及来源返回

- **状态**：职责保留；真实子现场待补证
- **采用Figma**：5144:675, 5350:20987。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：材料双击Reader、工作流单目标原beginChildWorksiteNavigation；多目标显式选择；来源node/targetSurface传入原导航owner。
- **仍缺**：root workspace不能误称子现场；当前fixture无完整真实子现场往返素材。
- **验证边界**：主节点行为测试与surfaces根/子分流4项；实际子现场未E2E。
- **详情**：[surfaces-batch4-continuation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/surfaces-batch4-continuation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\PortalNodeBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\childWorksiteNavigation.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\ProfessionalWindowStage.tsx`

## N23 · 门户只读预览、局部缩放和打开

- **状态**：部分接入
- **采用Figma**：5348:1151, 5350:1332, 5350:1490, 5350:1672。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：Portal继续走原只读预览与既有工作窗，原preview窗口缩放/打开入口未另建owner；共享引用/Pin已补。
- **仍缺**：Portal视觉与只读/可交互/目标缺失全态未完成完整对稿；不能把preview组件存在视为五态齐全。
- **验证边界**：现有源码与跨域报告；Portal全态浏览器待补。
- **详情**：[inventory-nodes.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/inventory-nodes.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\PortalPreviewBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\professional\PortalPreviewView.tsx`

## N24 · 门户提升/投递生命周期

- **状态**：生命周期尚未全完成
- **采用Figma**：5350:20679, 5350:20877, 5351:1219, 5351:1358, 5351:1491, 5351:1624, 5351:1757, 5351:1890, 5352:2038。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：保留原提升/打开和投递owner，不以新浮窗模拟真实Portal状态。
- **仍缺**：创建请求/取消/结果未知/目标缺失/返回来源的完整Portal回合未逐项修完。
- **验证边界**：原始目录覆盖已关联，运行态补证仍缺。
- **详情**：[inventory-nodes.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/inventory-nodes.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\PortalPreviewBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\professional\PortalPreviewView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\drop\dropTargetRegistry.ts`

## N25 · Colony轮廓、剥离与取消

- **状态**：未实现
- **采用Figma**：5100:85。T1原卡语义；Main只作空间关系参照，不能宣称5100:85提供全部Colony当前定稿
- **现在实现**：未新造假的Colony形态或剥离按钮。
- **仍缺**：Colony语义轮廓、剥离与取消回退尚无完整真实实现。
- **验证边界**：源码盘点。
- **详情**：[inventory-nodes.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/inventory-nodes.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\spatial\reconciliationRunner.ts`

## N26 · 远/中/近四档节点信息层级

- **状态**：四档消费与连续可读性已修
- **采用Figma**：5152:272, 5152:49, 5152:503, 5152:753。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：继续唯一density resolver；mark身份、summary真实首句、working关键片段、reading来源；字号/内距随屏幕尺度连续适配。
- **仍缺**：reading全文受上游160字preview限制；全部族群的远中近形态与全量节点拥挤度仍待扩验。
- **验证边界**：31项回归；37%/53%/100%浏览器截图；未改用户camera保存值。
- **详情**：[nodes-lod-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-lod-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\useLcosDensity.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\source-presentation.css`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`

## N27 · 节点11态与原位轻反馈

- **状态**：状态反馈部分完成
- **采用Figma**：5186:49, 5186:312, 5187:179, 5204:13842, 5262:551。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：媒体错误/重试、真实Glyth状态主动作、Drop轻反馈、身份初载/错误恢复已接入真实caller。
- **仍缺**：节点11态没有在所有species逐一完成；成功/待判/缺权限/中断等不能仅靠标签算齐。
- **验证边界**：各专项行为测试；完整11态×物种矩阵仍缺。
- **详情**：[nodes-first-load-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-first-load-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\SourceFeedbackSlot.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\sourceViewTypes.ts`

## N28 · 拖动、resize、中断及内容尺寸

- **状态**：尺寸与LOD修复；机械保留
- **采用Figma**：5187:179, 5188:635。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：不改NodeWrapper和世界几何；文本/纸张在真实宽高内排版，保留拖动/resize原owner。
- **仍缺**：拖动中断/编辑焦点与长内容所有边界未全E2E，不能以静态截图覆盖。
- **验证边界**：尺寸/行数/四档测试及真实缩放截图。
- **详情**：[nodes-lod-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-lod-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\source\source-presentation.css`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`

## N29 · GLYTH本体与真实基本状态

- **状态**：真实Glyth状态已修
- **采用Figma**：5388:118, 5388:119, 5103:1932。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：本体仅由真实projection驱动，删除旧descriptor active/waiting兜底；ready/needs_user/running主动作区分，真实pendingInput/Review才出现回答/复核；receiving curious保留。
- **仍缺**：六态外全部异常组合及真实review/pending-input fixture仍待运行补证。
- **验证边界**：G02命令/动作20新增+10既有测试；actual thinking进度打开真实WorkView。
- **详情**：[glyth-g02-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/glyth-g02-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\GlythBodyView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\glythPresence.ts`

## N30 · GLYTH缩放接管与身体命中

- **状态**：本体连续缩放已修；接管变形未完
- **采用Figma**：5152:272, 5152:49, 5101:1371。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：删除34/92硬切；用现有geometry/zoom连续计算本体，低倍率屏幕最小可识别约36px并受节点边界约束，不改世界尺寸。
- **仍缺**：从节点完整接管为工作现场的连续morph尚未实现，不以本体缩放冒充完整接管。
- **验证边界**：远37/中53/近100截图；layout与状态动作回归。
- **详情**：[nodes-lod-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-lod-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\GlythBodyView.tsx`

## N31 · 投送材料给GLYTH的命中与就近草稿

- **状态**：草稿投送已接；长期语义与链路未闭环
- **采用Figma**：5101:1243, 5344:999。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：真实携带/命中/近场Composer和Reference标已接，source不移动。9/17收敛实施交接明确采用composer target+draft references，当前行为有较新依据。
- **仍缺**：旧T3/T5 durable身体映射与9/17 draft接法未明确合并；不能仅按旧稿回滚，也不能宣称长期绑定完成。已有Core relation写入与Reach读取身份不一致，continuation bundle未读取关系，详见专项；前端反馈应准确说待发送引用。
- **验证边界**：已验证当前指针/草稿链；本次只读追到收敛V1§15、Gate2–5交接、BatchB及Core三段源码；未执行durable写入，无长期重载/send回执证明。
- **详情**：[glyth-drop-semantics-investigation.md](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\glyth-drop-semantics-investigation.md>)；[root-composer-hud-batch.md](<E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\root-composer-hud-batch.md>)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\drop\dropTargetRegistry.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\LcosHostOverlay.tsx`

## N32 · GLYTH原位续工入口与Composer内展开

- **状态**：近场续工已接
- **采用Figma**：5243:50, 5246:59, 5249:104。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：ready Arc继续进入同一Composer；真实readDiagnostics operation确认后才解锁send；WorkView共用草稿/现有窗口，running进入真实进度段。
- **仍缺**：当前fixture canSend=false/能力未探测，不能宣称真实外部发送成功；完整伴身转换另项。
- **验证边界**：根域Composer/续工61项；G02真实进度WorkView；窄屏/键盘回合。
- **详情**：[root-composer-hud-batch.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/root-composer-hud-batch.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\LcosActionArc.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\ConversationWorkViewBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\composer\LcosComposerHost.tsx`

## N33 · 续工四种模式及不支持时显式改选

- **状态**：四模式渐进控制已接
- **采用Figma**：5249:415, 5249:726, 5249:1044, 5249:1355。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：原继续/精选新建/空白新建/完整分支收进Composer会话选项；选择仅预览，显式确认才调用；不支持分支不降级。
- **仍缺**：真实provider能力未探测，UI诚实禁用；无真实外部新建/完整分支成功录像。
- **验证边界**：surfaces四模式/拒绝/unknown/双击19项，1440与390实测。
- **详情**：[surfaces-batch4-continuation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/surfaces-batch4-continuation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\ConversationWorkViewBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\conversationContinuationActions.ts`

## N34 · 续工确认来源、提交快照与草稿分离

- **状态**：当前挂载期快照已修
- **采用Figma**：5249:1665, 5249:1975。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：沿原operationId保留请求；嵌套引用复制，失败重试仍用原快照；blank不带旧引用，草稿与提交确认分开。
- **仍缺**：跨卸载快照未持久化；历史完整引用未由RecoveryProjection提供，不能保证刷新后重绘全快照。
- **验证边界**：surfaces快照/重试/跨目标迟到隔离测试；真实续工控件布局验证。
- **详情**：[surfaces-batch4-continuation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/surfaces-batch4-continuation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\ConversationWorkViewBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\conversationContinuationActions.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\composer\composerSubmission.ts`

## N35 · 创建伴身种子与四阶段可见回执

- **状态**：未完成伴身创建四阶段
- **采用Figma**：5250:319, 5250:593, 5250:860, 5250:1130。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：accepted明确显示等待外部确认，不声称新会话已完成；原operation恢复机制保留。
- **仍缺**：伴身种子请求/准备/确认/生成的完整形态与动作串联尚未实现。
- **验证边界**：没有以accepted代成功；动效无运行验收。
- **详情**：[surfaces-batch4-continuation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/surfaces-batch4-continuation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\ConversationWorkViewBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\RecoverySection.tsx`

## N36 · 分支创建完成、来源尾迹与精选继承完成

- **状态**：未完成来源尾迹
- **采用Figma**：5250:1397, 5250:1670, 5262:1078。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：生成材料保留真实sourceRunId；精选引用确认有真实标签。
- **仍缺**：新Glyth完成来源尾迹、精选继承可视形态与过渡尚未完成。
- **验证边界**：来源数据单测；伴身尾迹无运行验收。
- **详情**：[glyth-continuation-shortlist.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/glyth-continuation-shortlist.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\glythPresence.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\GlythBodyView.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`

## N37 · 续工失败、未知与取消恢复

- **状态**：错误恢复部分完成
- **采用Figma**：5251:407, 5251:674, 5251:941, 5253:509, 5253:776, 5253:1043, 5252:453, 5252:720, 5252:993, 5252:1260。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：现有WorkView恢复入口修正retry_external_create；未知结果不重发、可核对原操作，重试保留intent；身份读取/媒体错误可恢复。
- **仍缺**：创建伴身全态、取消与晚成功完整动效/语义未全部完成，不能用通用报错替代。
- **验证边界**：surfaces恢复与unknown测试，根域提交重复/旧目标回执隔离回归；身份失败实测。
- **详情**：[surfaces-batch4-continuation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/surfaces-batch4-continuation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\RecoverySection.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\professional\ConversationWorkViewBody.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\GlythNodeBody.tsx`

## N38 · 焦点薄光边、处理边缘色散和减少动态

- **状态**：轻反馈部分完成
- **采用Figma**：5262:551, 5262:807, 5262:1078, 5353:1476, 5353:1949。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：现有Glyth attention/receiving及reduced-motion消费保留；Drop轻反馈由根域接入，不铺满大弹窗。
- **仍缺**：创建/上传/任务/焦点全流程统一边缘弥散未完成；不把静态阴影当动效验收。
- **验证边界**：相关节点布局/状态与root反馈测试；全动效录像仍缺。
- **详情**：[nodes-lod-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-lod-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\glyth-presence.css`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\glyth\glythPresence.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\motion\glythMotion.ts`

## N39 · 节点原位空白、重命名、删除/撤销与多选

- **状态**：基本机械保留；全操作清单未验完
- **采用Figma**：5186:312, 5188:374, 5188:889, 5188:1658。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：单击选择、双击材料Reader、原生自由节点编辑、节点控件stopPropagation职责已保留；Arc透明热区及菜单键盘由根域修。
- **仍缺**：空白创建/重命名/删除撤销/多选复制/IME完整组合需整机实际回归，当前不能标全完成。
- **验证边界**：caller行为和Arc26项，实际邻近Glyth可非force打开；完整基础操作E2E未齐。
- **详情**：[arc-hit-avoidance-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-hit-avoidance-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\LcosActionArc.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\useLcosCanvasProps.tsx`

## N40 · 源到Reader/WorkView提升与恢复连续性

- **状态**：真实窗口目标已接；提升连续动效未完
- **采用Figma**：5103:1526, 5388:27411, 5350:20877。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：材料Reader读取精确artifact/revision；Glyth同一个WorkView；单目标/多目标导航保留原来源node与既有owner。
- **仍缺**：从节点到窗口的完整视觉接管/回落连续morph未做全；portal多态回合仍缺。
- **验证边界**：节点Reader入口/controls回归、surfaces真实revision读链、实际Glyth工作窗。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\LcosSpeciesBodies.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\navigation\LcosActionArc.tsx`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\apps\web-gen2\src\host\projectionFacade.ts`

## N41 · 素材装配到画布后的内容真实性

- **状态**：真实内容落成已修；更多媒体E2E待补
- **采用Figma**：5388:96, 5346:1416。20260913 九面主稿优先；04共用；13集合/Portal；06/07/08/11补未被纠正的状态
- **现在实现**：staging沿现有client和upload写真实image/audio/video/PDF；已有源保护、项目检查、content CAS与真实mime不变，不灌假波形或封面。
- **仍缺**：大文件/权限/切项目与真实视频PDF网页浏览器组合仍需素材；普通集合producer缺口另计。
- **验证边界**：staging真实接口/uploader/CAS测试，Main真图/38秒音频实测；video/PDF/Web暂为组件和接口验证。
- **详情**：[nodes-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/nodes-implementation.md)
- **原真实caller路径**：
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\nodes\stageProjectedSources.ts`
  - `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\useLcosCanvasProps.tsx`

## 后续优先级

1. 先解决能沿既有owner完成的行为与真实数据消费；不为视觉去伪造可发送、审核状态或集合接收target。
2. 补真实PDF、视频、网页与子现场素材的浏览器证据，关闭组件通过与整机可用之间的空档。
3. 普通集合producer/成员几何、全文/大纲/导图、Colony、伴身种子/来源尾迹、完整节点接管属于仍待设计数据或既有owner能力对接的完整缺口，不能画个壳宣称完成。

## 原稿与真实owner复核补记

本轮只读追查后已修正N17/N18的过宽缺口描述：旧Core集合和Huabu几何确实存在，缺的是Gen2正式生产/成员与显示接缝；没有因UI字段缺失就判定整个底层不存在。N31补记9/17较新draft实施依据与旧durable语义的未合并状态，避免以旧稿覆盖新稿，也避免把临时引用当持久绑定。
