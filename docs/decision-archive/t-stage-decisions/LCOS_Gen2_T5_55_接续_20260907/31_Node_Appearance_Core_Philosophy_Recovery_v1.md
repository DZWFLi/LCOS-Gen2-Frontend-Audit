# LCOS Gen2 节点外观核心思想恢复 v1

## 总裁决

节点不是一批换图标、换颜色的卡片。空间宿主只提供锚点、选择、拖动、缩放、命中测试；**视觉物种自己拥有身体**。

```text
Objects, Not Generic Nodes
Content is the body
Controls are satellites
State changes the body before it adds a badge
LOD is a reading decision, not simple scaling
Canonical identity survives every surface
```

本裁决来自 `LCOS_Gen2_节点呈现宪法_完整版_20260902.md`、Spatial 原帧/MD6、Gen1 reading policies 与最新 Huabu 源码交叉核对。

## 1. 框必须退到隐形机械层

`NodeWrapper` 的职责是选择、resize、连接、toolbar、overlay 与 geometry。它不是所有物种共同的可见白卡。

- Image 的身体是真实图像与剪影；
- PDF/Office 的身体是纸页、页叠与封面；
- Web 的身体是站点身份与剪报；
- Audio/Video 的身体是媒体时间；
- Collection 的身体是成员聚簇；
- Glyth 的身体是活体 presence；
- Run 的身体是过程机器；
- Result 的身体是正在物化或已经成为真实内容的产物。

Text 是少数可以合法呈现为安静纸块的物种。其余物种不得因为接入 Huabu 就重新套成统一卡片。

## 2. 内容即控件

能由内容本身表达的动作，不增加常驻按钮排：

- 媒体就在时间身体上播放与 scrub；
- Run 就在 active path 与步骤解剖上显示进度；
- Collection 直接展开成员；
- Outline 直接折叠、拖动真实分支；
- Result 直接在 slot 中显形与接受审阅。

对象是中心，controls 是卫星。Action Arc 只在选中后承载 3–4 个高频能力；管理动作留给右键或深层工作面。

## 3. 状态必须有身体语义

状态不应只靠右上角小圆点：

| 状态 | 身体变化原则 |
|---|---|
| hover | 局部 affordance 苏醒，整物体不发光 |
| selected | 精确 rim/handle 出现，内容几何不跳 |
| referenced | 独立安静信号，可与 selected 并存 |
| running | 只让 active path / 时间流动，不让整卡呼吸 |
| waiting_input | 流动在断点处停住，形成明确暂停结构 |
| review | 内容已成形但边界仍是 Draft/Pending |
| current | 安静稳定，不持续庆祝 |
| stale/conflict | 在受影响部位显露裂缝/警告，不泛红全场 |
| failed | 红色只服务真实失败或破坏性状态 |

## 4. 三层 LOD 是三种读法

- `full`：能操作该物种的 Functional Face；
- `compact/minimal`：保留物种的关键解剖与当前状态；
- `glyph/identity`：保留轮廓、主色、身份与异常信号。

LOD 不把完整 UI 均匀缩小。细节被有序拿走后，远处仍要一眼分辨 Image、Audio、Run、Result、Glyth 和 Collection。

实现必须收敛进最新 Huabu 单一 LOD owner；Gen1 只提供语义词表和测试向量，不恢复第二套 zoom runtime。

## 5. 同一身份跨 Surface 变形

```text
Spatial → Focus → Docked → Immersive → Restore
```

变化的是身体展开程度，不是 canonical identity：

- Canvas 强调内容形态与空间关系；
- Focus 在 world-space 放大同一对象；
- Work View 展开持续工作的专业器官；
- Restore 回原位置、原选择与有意义的内部状态。

禁止把对象进入 Work View 后重建成无关 list item，也禁止用另一个数据副本维持“看起来一样”。

## 6. Spatial 提供的审美纪律

Spatial 原帧验证了四点：

1. 同屏对象不是统一卡型，而是图片、纸、便签、任务、媒体、集合各有轮廓；
2. 选择 chrome 极轻，内容不因选中改变布局；
3. 打开是从对象原位 morph 到阅读/工作身体，约 220–260ms 的 snappy 窗口可作 proof 起点；
4. 邻居、连线、留白共同解释空间，控件不盖过内容。

Spatial 的白卡材质、AppKit 手势和窗口壳不照抄；只复刻物种分化、内容优先、原位连续性与空间呼吸。

## 7. 反造轮子落地式

```text
LCOS Instrument
= latest Huabu spatial host/mechanics
+ mature donor functional organ
+ thin LCOS semantic adapter
+ LCOS species morphology
```

采用顺序：`DIRECT USE > LIFT > WRAP/ADAPT > EXTEND > REWRITE`。任何“为了统一好看”而新增 GenericCard、第二套 selection、第二套 zoom、第二套播放器、第二套 Run engine，均直接判退。

## 8. 对后续施工卡的硬验收

每张卡必须回答：

1. 去掉标题和 icon 后，轮廓是否仍能认出物种？
2. 内容是否真的成为身体，而非塞进通用容器？
3. 状态是否改变了正确的局部结构，而不只是换色？
4. compact/glyph 是否仍保留身份？
5. 控件是否只在需要时出现？
6. Work View 是否展开同一对象而非创建副本？
7. 是否沿用了最新 Huabu 的 host mechanics？
8. 是否能明确说出没有重造的轮子？

任意一项答不上来，卡片只能是 `PARTIAL`。
