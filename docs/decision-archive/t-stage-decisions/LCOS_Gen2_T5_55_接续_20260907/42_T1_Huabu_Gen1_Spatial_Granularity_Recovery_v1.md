# T1 × Huabu × Gen1 × Spatial 颗粒度恢复 v1

日期：2026-09-07  
基线：LCOS Gen2 `232b2ca5` + Huabu `a3c411e1f655191344285141f08c4738fa6015f7`

## 0. 结论

上一版 `content-object-continuity.html` 不合格，已撤销为有效设计输入。它把内容对象做成了通用编辑器卡片，既没有使用 Huabu 的真实节点/Preview 身体，也没有复刻 Gen1 的同对象状态连续性，更没有落实 Spatial 的内容本体形态和 promotion choreography；同时遗漏了 T1 已冻结的 Focus、Work View、LOD、占位与相机边界。

正确目标不是“一个卡片切三种模式”，而是：

```text
同一 canonical entity
  → 同一 canvas projection
  → species-specific body
  → selection / resize / drop / focus 等微状态
  → Preview / Work View 的同对象晋升
  → close / restore 回到原 projection 与原上下文
```

不得用 generic card shell、第二份实体或第二套 zoom/camera store补空白。

## 1. 四套来源各自负责什么

| 来源 | 必须继承 | 禁止误用 |
|---|---|---|
| Huabu current | `NodeWrapper` 的选择/resize/toolbar/geometry commit；`NoteNode` 的 Canvas 只读 Milkdown body、LOD 与 auto/fixed height；`NotePreview` 的 WYSIWYG/raw、局部工具、滚动记忆、block drop；`PreviewWorkspace` 的 tab/split/resize | 不复制一套假的卡片、假的编辑器、假的 resize；不把 Gen2 placeholder 当成已完成产品形态 |
| Gen1 | species/state/interaction 覆盖下限；同对象 multi-face；Document full/outline/title；selected/expanded 强制 full；Preview/Work View float/dock/split/close/restore | 不迁移 `SpatialCanvas`、旧 camera/pointer owner、generic `SurfaceObject`、旧 overlay stack |
| Spatial | 内容即节点身体；异构比例；轻量 screen-space selection；同内容原位晋升；邻域退让/降权；局部格式菜单；Collection member stack；drag settle | 不照抄窗口 chrome；不把 Folder/Stack 直接等同 LCOS Collection；不把反推 spring 当源码常量 |
| T1 | projection identity、LOD 同实体、explicit Focus、Work View camera freeze、occupied safeRect、Core-first drop、local settle、Focus/Archive/Colony gap 的诚实状态 | 不用视觉改写语义；不让被动窗口变化移动 camera；不假装 Focus consumer 已闭环 |

## 2. 上一版具体错在哪里

1. **错身体**：统一白卡、统一 header、统一工具区覆盖了 Image/Note/Document/Webíon 等物种形态。Spatial 明确是内容主体占绝对主导；Huabu Note Canvas 也已是 Milkdown 内容体，不是产品仪表盘卡。
2. **错晋升**：把查看、编辑、放大理解为三个独立页面/模式。正确是同一个对象从 Canvas presentation 晋升到 Preview/Work View，关闭后回到原 projection；身份、内容、滚动和编辑焦点要连续。
3. **错选择框**：selection chrome 侵占了卡片布局。Spatial 证据是细边缘/角提示，NodeWrapper 也把 resizer 作为外层机械；chrome 必须 screen-space，不能推挤正文。
4. **错 Focus**：把 Focus 混成 select/open。T1 冻结为显式 camera request，可改变 camera，但不得顺带改变 selection 或 membership；在 Professional Window 存在时必须 frame 到 safeRect。
5. **错 Work View**：打开/关闭/resize Work View 不得主动改变 camera transform。窗口占用只改变 HUD、Locator、Minimap、Action Arc 等的安全布局。
6. **错 LOD**：把缩放做成换卡片/换实体。LOD 是同一 projection 的 presentation state；selected、focused 或 active 对象不得在极远距丢失关键身份。
7. **错 drop**：只有 hover 高亮，没有 T1 的 before/receptive/pending/commit/settle/failure 阶段，也没有 Core-first 与 spatial manifestation 的先后关系。
8. **错颗粒度**：没有逐 species 区分 Image、lightweight Text、Markdown Document/Note、PDF、Office、Web、Collection；尤其把 lightweight Text 与 Markdown document 混成一类。

## 3. 内容对象的正确层级

### 3.1 Canvas body（Huabu 身体 + Spatial 形态）

- Image：图片本身就是节点；保持真实宽高比；不加统一标题栏。
- lightweight Text：轻文本本体，适合短句/标签/便签；不能冒充 Markdown 文档。
- Note / Markdown Document：Canvas 中直接可读的 Milkdown preview；minimal LOD 不挂载重编辑器；缺 sidecar 时进入写屏障。
- PDF / Office：当前页/当前 slide 是身体，页级信息属于内容层，不套 Note shell。
- Web：页面 snapshot/reader body 与 provenance 是其物种特征。
- Collection collapsed：真实成员 preview 叠层，仍暴露成员种类与数量；不是文件夹 glyph。
- Collection expanded：成员是主体，host boundary 后退。

### 3.2 Select / hover / resize

```text
idle
  → hover：只提升可操作性线索，不改变内容 geometry
  → selected：轻边缘/角 affordance；内容不重排
  → resize-active：NodeWrapper 接管；正文/图片连续响应
  → resize-end：snap + geometry commit；必要时恢复 auto/fixed height ownership
```

- 单选才显示本节点 resize；多选使用共同 bounding resizer。
- Image 保留宽高比选项由物种策略决定；Glyth 已冻结为隐形正方形壳 + 等比缩放。
- 文档拖边框改变阅读宽度/高度，不应出现“容器先走、正文后一拍”的视觉脱节。

### 3.3 Focus

```text
explicit Focus command
  → resolve same canonical projection
  → calculate safeRect (subtract Professional Window occupiedRect)
  → camera framing request
  → target gains focus emphasis
  → neighbors yield / de-emphasize
```

约束：

- Focus 可移动 camera；
- Focus 不自动 select、不改 membership；
- Assembly 操作可触发目标 focus，但仍走同一个 explicit focus contract；
- 当前 Huabu/Gen2 的 Focus HUD consumer 是 GAP/PARTIAL，HTML 不得伪装成已经接通。

### 3.4 Preview / Work View promotion

```text
Canvas body
  → user opens same object
  → source body supplies visual continuity anchor
  → Preview (tab/split) 或 Work View (float/dock；默认右侧但可移动)
  → 内容保持同一 canonical source
  → close/restore returns to source projection + prior contextual state
```

- `PreviewWorkspace` 的 tab、split、tab drag、split resize 是直接复用机械，不另造。
- Note Preview 直接复用 Milkdown WYSIWYG/raw、scroll memory、floating toolbar 与 block drop。
- Spatial choreography：目标内容成为主视觉；邻居退让、降权但不被替换成空白 dashboard；本体比例与版式连续放大。
- Work View open/close/resize 的 camera transform 必须完全不变。
- Work View 默认在右侧打开，但不是固定右栏；可 float/dock/move/resize。

### 3.5 编辑连续性

- 进入编辑时保留同一正文，不重新生成一张 editor card。
- 局部格式菜单 Portal 到操作点附近，不进入 canvas/layout flow。
- 关闭格式菜单后 caret 仍在正文。
- WYSIWYG/raw 是同一 canonical Markdown 的两种编辑表面。
- AI pending review 以轻量 block/provenance marker 表达，不污染内容主体，不自动覆盖人工 Current。

## 4. T1 必须补齐的事件级状态

### 4.1 Content focus/promotion

| Phase | Target | Neighbors | Camera | Window/HUD |
|---|---|---|---|---|
| idle | species body | normal | unchanged | normal |
| focus-request | identity retained | begin yield | explicit framing starts | calculate safeRect |
| focus-settle | emphasized body | reduced contrast/priority | target framed in safeRect | HUD avoids occupiedRect |
| preview-open | same content promotes | remain contextual | unchanged unless user separately Focuses | Preview tab/split appears |
| workview-open | same content promotes | remain on canvas | **unchanged** | default right, movable/dockable |
| close/restore | source projection reasserts | recover | no forced camera jump | restore prior workspace state |

### 4.2 Semantic drop

| Phase | Canonical | Spatial presentation |
|---|---|---|
| approach | unchanged | target becomes receptive；其他 chrome 退让 |
| hover-valid | unchanged | 明确目标身体/容纳位置，不弹 chooser |
| release | pending | source 保持释放完成状态，不提前伪造 membership |
| Core success | committed | 执行 host/relation manifestation |
| local settle | committed | 仅明显重叠近邻 bounded settle；用户稳定锚点不动 |
| Core failure | unchanged | receptive 撤销，source 回到可信位置并给局部失败反馈 |
| spatial failure after Core success | committed | 重新 query/reconcile；不能视觉回滚语义真相 |

Collection 特例：expanded left-drop 可 native reparent 并保持 absolute release position；collapsed left-drop 不自动展开；right-drag 只改 membership，节点不飞过去。

### 4.3 LOD

| State | Document | Image | Collection | Glyth |
|---|---|---|---|---|
| full | 完整正文/当前内容 | 内容主体 | host + members | living full identity |
| compact | heading/结构摘要 | mini preview | member stack | simplified body |
| identity | title/species identity | recognizable thumbnail/mark | stack/count identity | critical identity mark |
| takeover/extreme | fixed-screen identity where allowed | lightweight mark | compact aggregate | non-critical ephemeral cluster；critical 不丢 |

最终阈值只能由统一 resolver 决定。Gen1 `.72/.36` 和 Glyth `.9/.6/.35` 仅作回归向量；Huabu 150px screen-width + 10px hysteresis 是当前机械事实，二者不能并存为两套 owner。

## 5. Spatial 原始帧恢复出的视觉要求

已直接复核收敛包帧图，而非仅引用旧摘要：

- `v1-01 → v1-08`：异构图像对象保持各自比例；selection 是细四边/角线，不是统一卡片边框；内容在状态变化中仍是主体。
- `v5-06`：图片、长文、便签/任务在同一 field 中保持不同尺寸和形态；空白承担拖拽与层级，不应被 UI chrome 填满。
- `v3/v4`：Collection/Stack 应由成员 preview 构成；长文 presented/deep reading 是同内容晋升。
- `v6`：长文编辑的层级菜单浮在操作点附近；菜单退出不丢 caret。

动效数值仍分级：打开约 250ms、多对象入场约 550ms、菜单约 200ms 属逐帧报告值；`.96/.4/8–16px` 与 spring 参数只是校准建议，不得写成 Spatial 源码真值。

## 6. 下一版原型的最低验收板

下一版不能再做一张“大而全通用卡”。至少分成以下可独立验收的板：

1. **Image 板**：idle → selected → continuous resize → focus → Work View → restore。
2. **Markdown Document 板**：Canvas Milkdown preview → full/outline/title LOD → Preview WYSIWYG/raw → local format overlay → restore caret/scroll。
3. **Collection 板**：expanded/collapsed/member stack → left-drop/right-drag → commit/failure/local settle。
4. **Professional Window 板**：默认右侧打开 → drag to float/other dock → continuous resize；全过程 camera transform readout 不变。
5. **Focus 板**：无 PW / 30% dock / 45–50% dock / target behind occupiedRect；明确显示 safeRect framing 与邻域降权。
6. **LOD 板**：同一 entityId、projectionId 在 full/compact/identity/takeover 间连续，禁止复制实体。

每块必须显示：真实 donor、当前 host seam、canonical invariant、before/during/after、reduced-motion、失败态、验收读数。未接通能力必须标 `GAP/PARTIAL`，不能用漂亮动画冒充。

## 7. 施工前后的流程变化

### 错误流程（已废止）

```text
功能清单 → 通用卡片 → 三种模式按钮 → 用动画补连续性
```

### 正确流程

```text
T1 canonical invariant
  → Huabu current component/mechanics
  → Gen1 capability/state floor
  → Spatial morphology/keyframe event
  → species construction card
  → state board
  → interactive prototype
  → browser acceptance
```

## 8. 修改与影响范围

本轮只修改桌面接续包文档：

- `41_Content_Object_View_Edit_Restore_CurrentSource_Gate_v1.md`：加废止声明；
- `42_T1_Huabu_Gen1_Spatial_Granularity_Recovery_v1.md`：新增纠偏正本。

未修改：

- `E:\OS开发\LCOS_Gen2` 任何源码；
- vendored `huabu/`；
- Git 历史、分支、提交；
- 被否决 HTML 的实现（保留作负面审计，不再作为入口）。

## 9. 风险、回滚与未完成

- 风险：T1 Focus consumer 当前未闭环；原型只能验证 contract 和视觉，不能宣称 production 已接通。
- 风险：Spatial 精确 motion 曲线仍需逐视频时间轴，不可只凭静帧定常量。
- 未完成：新版 species-specific HTML 尚未重做；必须先按第 6 节拆板，避免再次用一张通用壳混过去。
- 回滚：本轮仅桌面 Markdown；删除 42 并移除 41 顶部废止声明即可恢复，但不建议，因为原版已被明确否决。

## 10. 当前裁决

现在的颗粒度已经恢复到“可以重新出原型”的门槛，但**上一版原型本身仍不合格**。下一步应先做 Image + Markdown Document 两块真实 donor-backed board，验证 Huabu 身体、Gen1 连续性、Spatial choreography 与 T1 camera/identity 约束同时成立，再扩到 Collection、Focus 与 Professional Window。
