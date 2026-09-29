# LCOS Gen2 · T5 Text Node Visual Direction Blueprint v1

> 日期：2026-09-07  
> 阶段：`VISUAL DIRECTION FROZEN / SOURCE-INDEXED / READY FOR BLUEPRINT MERGE`  
> 角色边界：T5 只冻结最终形态、材质、LOD、状态差异、动效与 donor 采用；不新增 canonical truth，不修改 Assembly target taxonomy。  
> 基线：Gen2 `232b2ca5`；Huabu upstream `a3c411e1f655191344285141f08c4738fa6015f7`。

## 0. 一句话裁决

Text Node 不是“大白卡里的小字”，而是一个由正文自己撑起的平面内容对象：默认透明，内容优先；用户赋色后才长出 macOS 式轻材质；缩放时节点与字体保持同一空间比例，信息通过 LOD 有序减少，剩余信息反过来占满可用面积。

## 1. 对象范围

本蓝图只处理 LCOS 原生 Text Node。其 canonical draft 可使用 Markdown 结构，但它不等于用户导入的 `.md` 文件 Artifact，也不把所有可显示文字的对象混成一种便签。

| 对象 | 本轮处理 | 说明 |
|---|---|---|
| Native Text Node | 是 | LCOS managed canonical text；正文 / 大纲 / 导图三种 face |
| Anchored Note | 只定家族差异 | 保留 anchor 与 note anatomy，后续单独校准 |
| Imported `.md` file Artifact | 否 | 属于有自身文件格式的 Document/File Artifact；走 Spatial 式查看与专业视图，不套 Text Node 三态编辑器 |
| DOCX / PDF / PPTX / HTML 等格式对象 | 否 | 保持各自 renderer、preview 与专业工具；不得因“内容含文字”降格成 Text Node |
| Assembly professional body | 否 | 本轮只定文本节点的入口与反馈，不设计完整装配台 |

## 2. 最终形态方向

### 2.1 Rest

- 默认背景 `transparent`，无白卡、无常驻边框、无常驻阴影。
- 可见身体只有：真实排版内容、极轻的文本方向/层级引导、必要的截断提示。
- 画布点阵可从正文留白中透过，但正文行区要维持足够对比度。
- 不常驻标题栏、类型栏、footer、状态 chip、操作按钮排。

### 2.2 Selected

- 不显示常驻 selection border、方框或 resize handle。
- 可见内容、材质底、阴影与隐形 resize 热区共用同一 Adaptive Body bounds；文字少时贴住标题，内容展开时随真实排版范围增大。
- 指针进入内容外缘的窄命中带后直接出现 resize cursor；四边与四角均可缩放，但不绘制专门按钮。
- 正文不换皮、不重排。
- 高频动作以 trigger-grown object-local satellite 出现；仅在指针靠近 Adaptive Body 或进入编辑时显现，离开后退场。
- 正文 / 大纲 / 导图切换属于 presentation face selector；应贴近对象但不压正文。

### 2.3 Editing

- 编辑层覆盖同一 projection 的真实 screen rect，不生成另一张 editor card。
- 直接块级富文本编辑，保留 caret、selection、scroll 与 draft。
- 块 handle 只在当前块或 gutter 邻近时显现。
- 选中文字后，局部格式条从 selection rect 附近长出；必须 clamp 到 viewport / safeRect。
- 编辑状态最低保持 `working` LOD；zoom out 不得丢 caret 或退成 title-only。

### 2.4 Outline

- 不是列表卡片；正文层级直接变成带细引导线的可折叠排版树。
- heading 是主干，段落/列表是枝叶；折叠控制贴节点，不额外占一列 UI。
- 分支展开、收起和改层级沿用 Gen1 行为；视觉重做。
- Outline edit 产生 structured patch，最终回写同一 canonical Markdown。

### 2.5 Mindmap

- 背景仍默认透明，不套白色 mind-map widget。
- root 居中；一级分支左右均衡；subtree 垂直堆叠；parent 对齐子跨度中心。
- topic 以文字和极轻承托面为主，不做一屏胶囊盒子。
- collapse 保留当前 topic，剪去子孙；折叠状态是 presentation/session state。
- Canvas face 是可选择、可折叠、可预览的结构投影，不在小节点里塞一排常驻编辑按钮。
- 进入沉浸查看／编辑时，使用 LCOS 已有 Preview 作为承载层：同一对象从 Canvas mindmap face 晋升为 Preview 内的宽阔 mind-map instrument，沿用 Gen1 的沉浸状态编辑感觉；退出 Preview 后回到原画布位置与同一 canonical identity。
- Preview 只拥有承载、晋升、退出与 screen-space 可读空间；内部 mind-map renderer 才拥有导图的布局与编辑呈现。不得另造 Mindmap Window，也不得把 Spatial 当成新的 viewer。
- 沉浸编辑必须具备 Gen1 已证明的 `updateText / addChild / addSibling / liftNode / removeNode` 与键盘路径：`Tab` 子级、`Enter` 同级、`Shift+Tab` 提升、`Delete/Backspace` 删除非 root。
- 正式实现采用 `mind-elixir-core` 的成熟编辑 primitive，外包极薄 LCOS adapter；Gen1 `MindMapNoteVisual` 只迁布局、natural bounds、左右平衡与 `pruneCollapsed` 纯逻辑。
- 任意 drag reparent 仅在 `mind-elixir-core` 能力与 canonical structured patch seam 验证后启用；当前蓝图不得用 HTML 样片假称生产链已接通。

### 2.6 Text Node 与格式文件的硬边界

```text
Native Text Node
→ LCOS managed text draft
→ Canvas: Text / Outline / Mindmap 三种同源 face
→ Mindmap immersive view/edit: 晋升到 LCOS Preview，由 mind-map renderer 承载

Imported .md / DOCX / PDF / PPTX / HTML / other formatted Artifact
→ 保留原文件 identity 与格式能力
→ Canvas 上只呈现 truthful preview / LOD
→ Spatial 式查看或对应 Professional Window
→ 不进入 Text Node 的正文/大纲/导图编辑器
```

- `.md` 文件使用 LCOS 自有 Preview 提供源码/渲染视图，但不是 Text Node。
- Native Text Node 的 Mindmap 也可以使用同一个 LCOS Preview host；二者共享的是 Preview 容器，不是 renderer、编辑能力或 canonical owner。
- Spatial 只作为 Preview 晋升、环境退让与连续转场的视觉/动效 donor，不提供另一套 viewer。
- 文件对象若未来支持修改，必须由对应格式 editor 与 revision/overwrite contract 承接，不能借 Text Node editor 静默覆盖原文件。
- Reference、Selection、Focus 可以跨两类对象共享视觉语法；编辑 renderer、保存路径与 canonical owner 不共享。

## 3. LOD：按 Huabu 逻辑修正

### 3.1 单一判断依据

```text
screenWidth = nodeCanvasWidth × viewportZoom
```

- LOD 由节点屏幕宽度判断，不直接拿全局 zoom 百分比硬切。
- 使用 hysteresis，避免临界点来回闪烁。
- resize 后同一 zoom 下可能进入不同 LOD；大节点比小节点更晚退化。
- 不建立第二套 zoom owner；最终接入 `apps/web-gen2/src/presentation/nodePresentation.ts`。

### 3.2 信息与字号必须反向补偿

当前样机错误：信息减少得比节点缩小快，剩余文字仍继续变小，导致大量空白。

最终规则：

```text
内容减少一层
→ 剩余内容字号 / 行距 / 占位比例提高一层
→ 继续使用节点可用面积
→ 节点整体仍按 viewportZoom 正常缩放
```

字体等级只依赖节点 canvas 尺寸，不依赖标题长度。采用 Huabu `SemanticPlaceholder` 的原则：

- 代表尺寸：`sqrt(width × height)`；
- 小 / 中 / 大节点使用离散 typography tier；
- 标题优先换行和 line-clamp，不连续缩小字体求“全部塞下”；
- 同尺寸节点在同一 zoom 下保持相同字号节奏。

### 3.3 四级 display mapping

| density | 保留内容 | 面积利用 |
|---|---|---|
| `reading` | 完整正文 | 正常文档字号与段落节奏 |
| `working` | 标题、lead、关键 heading / block | 标题和关键块放大，减少列宽空耗 |
| `summary` | 标题、一句摘要、2–4 个真实层级提示 | 主标题占据约 35–45% 可用高度，摘要与层级提示填满剩余区域 |
| `mark` | 物种标识 + 标题/identity | 采用大号 tier typography，允许 1–3 行；Adaptive Body 与标题包围盒同步收紧，不留下大空卡 |

具体 threshold 数值由 T1 单一 resolver 施工时标定；T5 不新增阈值 owner。

## 4. 材质：macOS-like，但不是玻璃卡片墙

### 4.1 默认透明

- `fill = transparent`；
- `shadow = none`；
- 最多允许近乎不可见的内容保护 scrim，不形成卡片轮廓；
- Text 属于 Huabu 明确的 flat visual language，与 image/PDF 等 card-like content node 区分。

### 4.2 用户赋色后

用户设置背景色时，才启用轻量桌面材质：

- tint color 与环境底色混合，不使用纯不透明色块；
- 中等 blur + 轻微 saturation，禁止厚玻璃和高亮彩虹边；
- 顶边半像素高光；
- 外缘半像素中性暗线；
- 低位、宽而淡的环境阴影；
- 内底边允许一条极淡环境遮蔽；
- 颜色只改变材质，不改变 selection、identity、LOD 或 canonical state。

### 4.3 层级预算

```text
正文对比
> selection / caret / insertion point
> 用户 tint
> shadow / blur
> 装饰性高光
```

禁止：厚白卡、双边框、强玻璃高光、常驻彩色 glow、AI SaaS gradient card。

## 5. Focus：采用 Spatial choreography

Focus 采用上一版已通过方向：

```text
explicit Focus request
→ T2 resolves target
→ Huabu/T1 executes camera travel
→ target 在 safeRect 中放大到可读尺度
→ 非目标对象与关系短暂 yield
→ target 本体出现极轻环境光，不新增 focus frame
```

- Focus 与 Selected 分离；Focus 不默认显示 resize handles。
- Focus 不是额外套框或弹窗；Text Node 的 Adaptive Body 在 Focus 时长出 Spatial 式白色半透明承托面、轻磨砂与中性投影，承托面严格贴合当前可见内容范围。
- Focus 只移动 Camera，不写 selection、reference、membership、Assembly target。
- Professional Window 已打开时，按 T4 safeRect 对齐，不把 target 放到右侧窗口下面。
- Reduced motion：即时重定位 + opacity yield；保留最终空间真相。

## 6. donor 采用裁决

| 来源 | 采用对象 | 级别 | 裁决 |
|---|---|---|---|
| Huabu `NodeWrapper` | selection / resize / drag / geometry commit / accent plumbing | `DIRECT USE` | 不复制第二套 host |
| Huabu `useNodeLOD` | screen-width threshold + hysteresis | `DIRECT USE / EXTEND` | Gen2 四级 density 映射接回单一 resolver |
| Huabu `SemanticPlaceholder` | geometric-mean typography tier、wrap/clamp | `LIFT` | 修复远距小字与面积浪费 |
| Huabu `NoteNode` / `MilkdownPreview` | Canvas 可读 Markdown body、auto/fixed height | `DIRECT USE` | 不造假 textarea/card |
| Huabu `NotePreview` | WYSIWYG/raw、block drop、scroll/edit continuity | `DIRECT USE` | 属于 Preview/Work View 展开身体 |
| Huabu `focusNodesOnCanvas` | 可靠 bounds → camera center | `DIRECT USE` | 外加 T2/T4 safeRect seam |
| Gen1 `InlineNoteEditor` | block model、键盘、直接编辑心智 | `LIFT BEHAVIOR` | 机制迁到 Huabu anchor，不迁 RAF DOM polling |
| Gen1 `outlineTree` | parse/serialize/branch extract | `LIFT PURE` | 前面加 Markdown AST/heading adapter |
| Gen1 `MindMapNoteVisual` | layout、natural size、pruneCollapsed | `LIFT PURE ALGORITHM` | 视觉重做，不迁旧 camera/card CSS |
| Gen1 `MindMapEditor` | 沉浸编辑感觉、add child/sibling、lift、delete、topic edit与键盘路径 | `LIFT BEHAVIOR` | 正式 editor 由 mind-elixir-core 承接；drag reparent需验证 |
| `mind-elixir-core` | 可编辑导图 instrument | `DIRECT USE + THIN LCOS ADAPTER` | 接 structured patch，不接管 canonical Markdown/Core revision |
| TapNow `CanvasTransition / ZoomDuration` | LOD / camera transition timing证据 | `REFERENCE / ADAPT` | 不引入 TapNow canvas engine |
| TapNow `NodeFromSegmentAtPoint` | 从真实段落生成 material/reference 的交互证据 | `REFERENCE / THIN ADAPTER` | 走 LCOS canonical ref，不复制私有源码 |
| TapNow `NodeReferenceChip / MentionPill / ReferenceText` | 文内显式引用的紧凑形态 | `REFERENCE / VISUAL ADOPT` | 只在真实 Reference 存在时出现 |
| Lovart / Trae | object-local controls、trigger-grown popover、quiet rest | `REFERENCE` | 不搬 Ant/tldraw shell |
| `motion/react` | layout morph、presence、reduced motion | `DIRECT USE` | 统一执行层，不拥有业务状态 |
| Spatial | same-object focus、neighbor yield、promotion choreography | `REFERENCE / HIGH-FIDELITY ADOPT` | 不复制其产品模型 |
| macOS/AppKit | material、focus、keyboard/accessibility quality bar | `VISUAL STANDARD` | 不做拟物窗口皮肤 |

## 7. TapNow 在 Text Node 上“直接有用”的部分

本轮明确采用三个点：

1. `NodeFromSegmentAtPoint` 的“在段落操作点直接抽出对象”心智，用于后续 Reference / Give，不先开属性表。
2. `NodeReferenceChip / NodeMentionPill` 的紧凑文内引用形态，但底层必须是 LCOS canonical Reference。
3. `CanvasTransition / ZoomDuration` 的连续过渡证据，用于 LOD 切换和 Focus，不使用离散跳变。

明确不采用：TapNow `NodeCard` 作为 Text Node 外壳；其自研 canvas/three/fabric 不能覆盖 Huabu host。

## 8. Text Node × Assembly 边界核对

### 8.1 已写清：Text 可以作为 Assembly source

当前 `packages/contracts/src/assembly.ts` 已包含：

```text
AssemblySourceRefV1
→ artifactView
→ note
```

Warehouse 也有：

```text
visualFamily = markdown
```

这只能证明当前 contract 能表达 Text/Note source reference，不能推出画布上需要“送入装配台”按钮。

最终视觉裁决：

- Text Node 若被上游 Assembly 规则认定为 eligible source，应由 Assembly 的自然 discovery/query 发现；
- Text Node 本体不显示“送入装配台”、source acknowledgement 或专属 Assembly chrome；
- 用户在 Assembly 中选用它时，仍保留 canonical identity，不复制正文；
- 若上游决定不让 Text Node 参与 Assembly，T5 无需任何降级视觉，因为本体从未依赖这项入口。

### 8.2 已有另一条能力：直接 drop 到 Note/Text body

Huabu `NoteNode` / `NotePreview` 已有 block/payload drop：

- drop 到 node body 可 append Markdown block；
- drop 到展开 editor 可按 insertion indicator 插入；
- 这是内容编辑路径，不等于 Assembly canonical apply。

两条视觉必须区分：

```text
drop into text body = 插入正文
Assembly discovery/use = Assembly 自己发现并引用 eligible source；Text Node 不主动“发送”
```

### 8.3 当前没有写清：Text 作为 Assembly target

`AssemblyTargetRefV1` 当前只有：

```text
project / main / workspace / conversation / context / workflow / scene
```

没有 `artifactView` 或 `note`。

所以如果产品意图是“打开装配台，把一组材料装进这篇文本”，当前 canonical contract 不支持，属于上游语义缺口；需要 T4 提供 target presentation delta，T6/Core owner 决定是否扩展 target contract。T5 不在视觉蓝图里自行假定已经支持。

### 8.4 Assembly + Focus

当前 T3 明确：Assembly target 与 Camera Focus 是两个 owner。若产品动作要求“打开装配台同时聚焦节点”，必须串联两个显式意图：

```text
open/set Assembly context
+ explicit Focus request
```

视觉可以同步发生，但不能用动画把两种 truth 偷偷合并。

## 9. 状态隔离矩阵

| 状态 | node body | mechanical chrome | camera | material |
|---|---|---|---|---|
| rest | 内容本体 | 无 | 不动 | 透明或用户 tint |
| hover | 当前局部轻反馈 | 无 authoritative outline | 不动 | 不抬整卡 |
| selected | 内容不重排 | 无可见框/柄；Adaptive Body 边缘提供隐形 resize hit-zone；局部动作按 proximity 短暂出现 | 不动 | 不因选中换材质 |
| editing | 同 rect 直接编辑 | caret / block handle / selection toolbar | 不动 | 允许极轻可读性 scrim |
| drop-receptive | insertion point 或 semantic receptor | 不叠加无关 resize chrome | 不动 | 只染当前接收局部 |
| focused | 同对象提高视觉权重 | 不显示 selection/resize chrome | explicit travel | 贴合内容的白色轻磨砂承托面 + 中性投影 |
| assembly-eligible | 本体不变 | 无“送入”按钮、无 source acknowledgement | 不动 | eligibility 不可视化；由 Assembly surface 发现 |
| mindmap-preview | Canvas mindmap face 晋升到 LCOS Preview 内的全深度 instrument | view 时安静；edit 时 topic edit / add / lift / remove 就地显现 | Preview promotion + 环境 yield，不改对象原位置真相 | Preview host + mind-map renderer；退出后恢复 Canvas face |

## 10. 已完成校准裁决

1. `reading → working → summary → mark` 使用 screen-space LOD 与面积反向补偿。
2. Rest 默认透明；用户 tint 后使用 macOS-like 轻材质。
3. Focus 与 Selected 分态；Focus 使用 Spatial 式白色承托面与阴影，不画 focus frame。
4. selection/resize 命中范围与可见内容 Adaptive Body 强绑定，不显示边框和缩放按钮。
5. Text / Outline / Mindmap 是 Native Text Node 的同源 face；Mindmap 通过 LCOS Preview 进入 Gen1 感觉的沉浸查看／编辑状态。
6. 格式文件 Artifact 同样走 LCOS Preview / Professional Window，但使用各自 renderer，不借用 Text Node editor；Spatial 只供晋升动效参考。

## 11. 当前 OPEN

1. Text 是否为 Assembly eligible source、是否也能成为 target，仍由 T4/T6/Core 语义 owner 决定；T5 已冻结为“本体无送入入口、由 Assembly 自然发现”。
2. Gen2 四级 LOD 的准确 screen-width thresholds；由 T1 单一 resolver 施工标定。
3. `mind-elixir-core` drag reparent 如何映射 structured patch 与 revision mutation；在 owner 验证前只冻结 Gen1 已证明的 edit/add/lift/remove。
4. 用户 tint 的 palette token 集与自由取色是否都保留；Huabu 已有 accent plumbing，T5 建议 token palette 为默认，自由取色渐进披露。

## 12. 源码级索引

### 12.1 当前 Gen2 / Huabu 可直接施工源码

| 能力 | 本地源码 | symbol / anchor | current truth | T5 seam |
|---|---|---|---|---|
| Gen2 四级 density | `E:\OS开发\LCOS_Gen2\apps\web-gen2\src\presentation\nodePresentation.ts` | `PresentationDensity` L14；`SCREEN_DENSITY_THRESHOLDS` L51；`resolvePresentationDensity` L69；`projectScreenSize` L92 | `CURRENT` | Text renderer只消费结果，不再计算第二套 threshold |
| Gen2 species registry | `E:\OS开发\LCOS_Gen2\apps\web-gen2\src\presentation\rendererRegistry.ts` | `PresentationSpecies`；`PresentationDescriptor`；`descriptorFor` | `CURRENT / INCOMPLETE MORPHOLOGY` | 注册 Text/Markdown family 的最终 renderer，不改 canonical entity |
| Gen2 visual family | `E:\OS开发\LCOS_Gen2\apps\web-gen2\src\presentation\visualFamily.ts` | `LcosVisualFamily`；`resolveVisualFamily`；`huabuNodeTypeForFamily` | `CURRENT` | 保持 note / markdown / other dispatch边界 |
| Huabu node host | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Nodes\NodeWrapper.tsx` | `NodeWrapper` L260；`hasCardSurface` L603；transparent branch L691 | `CURRENT / DIRECT USE` | Text 保持 flat；selection/resize/accent不复制 |
| resize content scale | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\hooks\useNodeScale.ts` | `useNodeScale` L22 | `CURRENT / DIRECT USE` | Text body width resize继续沿用同一 scale |
| content scale formula | `E:\OS开发\LCOS_Gen2\huabu\packages\shared\src\canvas-engine\height\compute.ts` | `contentScaleFor` L75；公式 L83 | `CURRENT / DIRECT USE` | 禁止另写 width→font scale公式 |
| note height policy | `E:\OS开发\LCOS_Gen2\huabu\packages\shared\src\canvas-engine\height\policy.ts` | `NODE_SHELL_INSET` L105；`note` policy L119；`getHeightPolicy` L135 | `CURRENT / DIRECT USE` | 继续由 Huabu决定 refWidth、auto/fixed height |
| Huabu binary LOD host | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\hooks\useNodeLOD.ts` | `useNodeLOD` L21 | `CURRENT / EXTEND THROUGH SEAM` | screenWidth+hysteresis机械保留；LCOS四级由 Gen2 resolver统一输出 |
| Huabu LOD config | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\config\semanticZoom.ts` | `SEMANTIC_ZOOM_CONFIG` L48；`nodeRepresentativeSize` L115；`selectTypographyTier` L120 | `CURRENT / LIFT` | 复用面积分级与不按标题长度缩字原则 |
| minimal renderer | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Nodes\SemanticPlaceholder.tsx` | `SemanticPlaceholder` L46 | `CURRENT / LIFT` | mark/summary使用真实标题、wrap、line-clamp与tier字号 |
| Canvas markdown body | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Nodes\note\NoteNode.tsx` | `appendMarkdownBlock` L57；`NoteNode` L68；`useNodeScale` call L80；LOD gate L86；content transform L430；`MilkdownPreview` L461 | `CURRENT / DIRECT USE` | 替换最终 morphology时保留 hydration/drop/height ownership |
| Preview editor | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Nodes\note\NotePreview.tsx` | `PreviewComponentProps` L80；`NotePreview` L100 | `CURRENT / DIRECT USE` | Canvas inline与Preview editable authority不得同时写 |
| Milkdown typography/material | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Milkdown\milkdown-overrides.css` | token mapping L28–85；paragraph L159；heading L173；block handle L343；editor gutter L585；AI provenance L856 | `CURRENT / RESTYLE THINLY` | 保留Crepe/Milkdown结构，只校准T5 typography/material token |
| explicit camera focus | `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Panels\CanvasLayerPanel\focusNodesOnCanvas.ts` | `anchorViewportCentre` L16；`revealBoundsInViewport` L30；`getReliableNodeBounds` L68；`fitNodesOnCanvas` L111；`focusNodesOnCanvas` L140 | `CURRENT / DIRECT USE` | T2 intent + T4 safeRect，T5只给yield/aura/motion |
| Assembly source/target | `E:\OS开发\LCOS_Gen2\packages\contracts\src\assembly.ts` | `AssemblySourceRefV1` L17；`AssemblyTargetRefV1` L35；`AssemblyApplyRequestV1` L95 | `CURRENT` | Text source已支持；Text target未支持 |
| Assembly route | `E:\OS开发\LCOS_Gen2\apps\local-core\src\routes\f6-assembly.ts` | `POST /projects/:projectId/assembly/apply`；request validation L67；`assemblyApply.apply` L72 | `CURRENT BACKEND` | T5不写mutation truth |

### 12.2 Gen1 可定位源码

权威可检索快照：

```text
repo   = https://github.com/DZWFLi/LCOS-local-creativeOS
branch = a24-to-phasea-20260901
commit = 3e99769bf106d68cecc54094662352bfaecf2bdd
```

施工时必须 pin 上述 commit，不引用浮动 branch HEAD。

| 能力 | commit-pinned path | exact symbols | 采用 |
|---|---|---|---|
| species/anatomy | `apps/web/src/features/canvas/CanvasNodeVisual.tsx` | `NodeVisualFamily` L62；`DocumentObject` L190；`DocumentSemanticBody` L300；`TextPreview` L337；`NoteObject` L566 | `LIFT ANATOMY / RESTYLE` |
| inline rich edit | `apps/web/src/features/ui/InlineNoteEditor.tsx` | `measureNodeRect` L18；`LineType` L24；`markdownToHtml` L62；`readMarkdown` L71；`normalizeBlocks` L97；`InlineNoteEditor` L136 | `LIFT BEHAVIOR`；retire RAF DOM polling |
| outline tree | `apps/web/src/features/canvas/outlineTree.ts` | `OutlineNode` L13；`parseOutline` L55；`serializeOutline` L94；`outlineRows` L114；`extractOutlineBranchText` L153；`parseOutlineLoose` L169 | `LIFT PURE`；前置 Markdown AST adapter |
| mindmap layout | `apps/web/src/features/canvas/MindMapNoteVisual.tsx` | `textDisplayWidth` L37；`ellipsizeByWidth` L44；`MindMapPlacement` L53；`MindMapMetrics` L66；`mindmapLayout` L84；`mindmapContentSize` L185；`mindmapNodeSize` L194；`pruneCollapsed` L203 | `LIFT PURE ALGORITHM / VISUAL REMAKE` |
| mindmap edit | `apps/web/src/features/ui/MindMapEditor.tsx` | `updateText` L15；`addChild` L21；`addSibling` L27；`removeNode` L33；`liftNode` L40；`MindMapEditor` L96；save/serialize L209 | `LIFT BEHAVIOR`；drag reparent仍GAP |
| historical semantic zoom | `apps/web/src/features/spatial/documentSemanticZoom.ts` | `DocumentSemanticLevel` L3；`documentSemanticLevel` L20；`extractDocumentHeadings` L36；`documentOutlinePreview` L46 | `REUSE TEST VECTORS ONLY`；不得恢复第二 owner |
| face memory | `apps/web/src/state/notePresentationMemory.ts` | `NotePresentation` L12；`rememberNotePresentation` L27；`recallNotePresentation` L32；`forgetNotePresentation` L36 | `MIGRATION EVIDENCE`；不得成为 content truth |

GitHub blob URL 模板：

```text
https://github.com/DZWFLi/LCOS-local-creativeOS/blob/3e99769bf106d68cecc54094662352bfaecf2bdd/<path>
```

### 12.3 TapNow 本地源码证据索引

TapNow 为商业 bundle，以下只能作为行为/结构证据，不能直接复制私有源码：

```text
raw root:
E:\素材_raw_不入GPT\web_逆向_tapnow_lovart_20260904\tapnow_raw

primary bundle:
E:\素材_raw_不入GPT\web_逆向_tapnow_lovart_20260904\tapnow_raw\assets\vendor-pkg-canvas-CI-o9b4X.js
```

| token | bundle line | T5用途 |
|---|---:|---|
| `NodeMentionPill` | 2 | compact mention anatomy |
| `NodeReferenceChip` | 4 | explicit Reference capsule anatomy |
| `CanvasTransition` | 72 / 112 | continuous camera/LOD transition evidence |
| `NodeFromSegmentAtPoint` | 699 | paragraph-point extraction interaction evidence |
| `ZoomDuration` | 699 / 723 | transition timing evidence，数值需施工时复核调用点 |
| `NodeReferenceText` | 821 | inline reference text anatomy |

辅助审计：

- `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\tapnow_web_逆向拆解_20260904.md`
- `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\tapnow_落画布机制_20260904.md`
- `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\tapnow_对话协议拆解_20260904.md`

### 12.4 视觉与 motion donor 索引

| 来源 | 本地位置 | 施工用途 |
|---|---|---|
| Spatial | `C:\Users\1\Desktop\施工前最后一轮校准\Spatial_画布形态与动效收敛包_含帧图_20260905.zip` | Focus、neighbor yield、same-object promotion逐帧证据 |
| Spatial v4 | `C:\Users\1\Desktop\施工前最后一轮校准\Spatial_独立情报包_v4_20260904.zip` | 原始行为证据与边界纠正 |
| Lovart/tldraw | `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\lovart_canvas_逆向拆解_20260904.md` | object-local controls与tldraw primitive来源说明；不替换Huabu |
| Lovart motion | `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\lovart_布局与动效规范_20260904.md` | 150ms局部反馈、200ms popover、panel motion证据 |
| Morphicons | `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\morphicons` | face/action图标的短形变；逐件选择，不整库搬入 |
| Amicro | `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\amicro` | 本 Text Node 不作为主 donor |
| React Bits | `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\react-bits` | 只允许局部一次性 reveal；禁止SpotlightCard/Aurora等营销组件 |
| donor总裁决 | `C:\Users\1\Desktop\接续包\LCOS_Gen2_T5_55_接续_20260907\34_Motion_Component_Libraries_and_Product_Donors_Detailed_Map_v1.md` | DIRECT USE / LIFT / ADAPT边界 |

### 12.5 上游蓝图定位

| owner | 文件 | Text Node / Assembly 关键区 |
|---|---|---|
| T1 | `LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md` | §6 Note；§8 InlineNoteEditor；§9–13 Mindmap同源；§14 LOD；§28 state board schema |
| T3 | `LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md` | §3 edit；§4 rich overlay；§5 resize；§6 drop；§7 Assembly/Focus owner split；§8 overlay arbitration |
| T4 | `45_T4_to_T5_ProfessionalWindow_and_ProfessionalBodies_ExactBlueprint_v1.md` | §4 Preview continuity；§5 Assembly professional body |

以上三份均位于：

```text
C:\Users\1\Desktop\接续包\LCOS_Gen2_T5_55_接续_20260907
```

---

本稿已完成用户校准并升级为 `VISUAL DIRECTION FROZEN`。HTML 仅是方向样片，不是生产实现或交互验收依据；施工必须按本文源码索引采用 Huabu、Gen1 纯逻辑与成熟 donor，并由对应 T1/T2/T3/T4/T6 owner 接回 canonical state、gesture、camera、professional body 与 persistence。本文不授权修改 Gen2/Huabu 生产源码。
