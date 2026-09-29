# Spatial Keyframe Event Ledger v1

## 核验方式

本轮已解压并确认 80 张帧图，实际查看以下抽样帧：

```text
v1-01, v1-08
v2-01, v2-10, v2-19
v3-10, v3-20, v3-30
v4-01, v4-05
v5-01, v5-06
v6-01, v6-05
```

以下结论以帧图本身为准；没有把旧报告中的视频编号解释直接照搬。

## 1. 分组纠正

| 帧组 | 直接观察到的内容 | 当前定性 |
|---|---|---|
| v1 | 设计资产 2×2 异构排布；同一图片内容发生色彩/呈现变化；四角/边缘选择指示出现 | Asset canvas / selection-presented state |
| v2 | 从 X/Bookmarks 导入；左侧 Spatial canvas、右侧 source browser；最后回到画布并出现多对象与底部工具条 | Capture/import → canvas placement |
| v3 | Digital shoebox；图片、便签、待办、文档、Folder/Stack 异构共存；中段出现大字号输入/标题过程 | Multi-species canvas + creation/onboarding sequence |
| v4 | 多个 Stack/Folder/文档/图像混排，末帧为长文 presented/deep reading | Collection + document deep view |
| v5 | 五对象画布；末帧图像出现四边 selection handles | Selection/resize affordance |
| v6 | 长文 deep editing；浮动层级菜单；菜单退出后光标保留在正文 | Text editing + local formatting overlay |

这比旧摘要里简单写成“v1 空白、v2 browsing、v3 focus”的颗粒度可靠。旧摘要可能对应原视频序号，而本包的 `v1–v6` 帧组显然是另一套重新编组；后续引用必须同时写 frame group 与原视频文件，避免错号。

## 2. 形态证据

### Image / visual asset

- 图片主体就是节点本体，不包统一标题栏；
- 不同宽高比直接保留；
- 选中时以细边缘/四角线性 affordance 表达，不用厚重卡片边框；
- 节点间留白远大于 chrome 占用。

LCOS 含义：Image full body 应以实际内容为主，selection chrome 必须 screen-space、轻量、不可改变内容布局。

### Text / document

- 画布态可表现为短便签、任务清单、长纸页等不同 body；
- deep reading 是同一内容放大为完整排版面，而不是统一 preview modal；
- deep edit 中浮动格式菜单靠近操作点，关闭后编辑焦点仍留在正文；
- 格式菜单是局部 overlay，不占画布布局。

LCOS 含义：Text / Note / PDF 不应共享 generic shell；Overlay 必须 Portal，退出不破坏 edit continuity。

### Folder / Stack / Collection

- v3/v4 可直接看到由真实成员 preview 构成的叠层；
- collapsed body 仍透露成员种类与数量；
- Folder/Stack 不是一个抽象文件夹 glyph；
- expanded canvas 中成员才是视觉主体。

LCOS 含义：Collapsed Collection 应优先 member-stack，而非通用 folder icon；expanded host 应退后。

### Heterogeneous field

- 同屏混合图片、文档、任务、便签、网页/剪报、集合；
- 对象尺寸差异承担信息层级；
- 空白不是浪费，而是保证对象边界、关系和拖拽空间。

LCOS 含义：默认 5–8 个主节点的密度规则与 Spatial 视觉证据一致，不能为了“丰富”塞成 dashboard。

## 3. 交互事件账本

| 事件 | Before | During | After | LCOS host seam | 证据等级 |
|---|---|---|---|---|---|
| selection | 内容无 chrome | 四边/角出现轻 affordance | 内容 geometry 不变 | NodeWrapper overlay | `VISUALLY_CONFIRMED` |
| resize affordance | 图像静息 | 边缘线/角提示出现 | 待结合完整视频核 resize motion | NodeWrapper resizer | `VISUALLY_CONFIRMED_PARTIAL` |
| import/capture | source app/browser | split source + target canvas | 素材落回 spatial field | Capture adapter + placement | `VISUALLY_CONFIRMED` |
| deep reading | 文档存在于 field | 目标进入大幅阅读 | 保留同一内容身份 | Work View / presented morph | `VISUALLY_CONFIRMED` |
| text format | 正文编辑 | local formatting overlay | 光标继续留在正文 | Portal overlay | `VISUALLY_CONFIRMED` |
| collection preview | 多成员散布/集合存在 | member stack 暴露层级 | collapsed body 保留成员线索 | Frame/Collection renderer | `VISUALLY_CONFIRMED` |

## 4. 不能从静帧单独证明的项目

以下仍需结合六段视频时间轴，不能只凭本轮静帧断言：

- ≈250ms 打开放大；
- ≈550ms 多对象入场；
- drag reflow 的具体路径与 settle 顺序；
- background `.96 / .4 / 8–16px`；
- open/close 是否使用某组确定 spring；
- pinch-to-close 的阻尼曲线。

这些继续保持 `REPORT_MEASURED` 或 `INFERRED_RECIPE`，不能升级为 `VISUALLY_CONFIRMED_EXACT_VALUE`。

## 5. Phase 1 施工约束

```text
内容先于 chrome
species 先于统一 skin
selection 不改变内容布局
deep view 维持同一对象身份
local overlay 不进入 canvas layout
Collection collapsed 仍暴露成员形态
空白承担空间操作与视觉层级
```

## 6. 下一步

v1–v6 仍需逐帧压缩成每组 3–8 个关键事件点，并与原视频文件名重新绑定。当前 v1 已足以做 morphology evidence；motion exactness 仍需视频时间轴二次核验。

