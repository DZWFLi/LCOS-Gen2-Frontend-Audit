# Phase 1 Exact Construction Card Index v1

## 用途

把已经完成的 donor / host / semantic census 转成 T1 可以逐张施工、逐张验收的卡片队列。本文件只决定施工顺序和卡片边界，不擅自修改冻结交互或对象模型。

## Card 模板（每个物种必须填写）

```text
Species / canonical entity
Huabu host component
Content body owner
Visual donor + evidence locator
States: rest / hover / selected / receptive / working / review / error
LOD: full / compact|minimal / identity|far
Preview or Work View promotion seam
Persistence owner
Reduced-motion behavior
Browser acceptance cases
Explicit non-goals
```

## 第一批：可立即制作 exact card

| Card | Host | 主要 donor | 必做状态 | 主要验收 | 状态 |
|---|---|---|---|---|---|
| `NC-01 Image` | `image/ImageNode.tsx` | Spatial image + Huabu | rest/hover/selected/stale/missing | 内容比例、连续 resize、Preview 往返、identity LOD | READY |
| `NC-02 PDF` | `pdf/PDFNode.tsx` | Spatial paper + Huabu | rest/selected/page-context/stale | 首屏缩略图、页级 locator、Preview scroll restore | READY |
| `NC-03 Web` | `web/WebNode.tsx` | Spatial webclip + Huabu | rest/selected/loading/error/stale | live/reader 切换、来源身份、断链退化 | READY |
| `NC-04 Note` | `note/NoteNode.tsx` | Spatial note + Huabu | rest/editing/selected/minimal | canonical Markdown、编辑不中断、Preview 同一实体 | READY |
| `NC-05 Video` | `video/VideoNode.tsx` | Spatial media + Huabu | rest/selected/loading/error | poster/比例、Preview、播放状态不污染 Core | READY |
| `NC-06 Frame` | `frame/FrameNode.tsx` | Huabu mechanics | rest/selected/resizing/label | 不变成 generic content card、稳定锚点、成员关系不丢 | READY |

第一批共同约束：

- `NodeWrapper` 保持 selection / resize / actions / overlay owner；
- 不复制 viewport、selection 或 drag store；
- LCOS provenance、lifecycle、revision 以 Local Core 为真；
- T5 只补视觉合同与 token，不私自创建第二套 runtime；
- LOD 继续由 Huabu 现有 `useNodeLOD / useNodeTakeover` 单一 owner 驱动；只允许扩展输入与 species policy，Gen1 zoom 阈值只作测试向量。

## 第二批：补一处映射后制作

| Card | 已有基础 | 放行前只差什么 | 状态 |
|---|---|---|---|
| `NC-07 Office/PPT` | Huabu Office + Preview | current slide/page locator 与 LCOS fragment 对齐 | PARTIAL |
| `NC-08 Text` | TextNode + TextNodeBody + Gen1 document LOD | full/outline/title 三 face 的单一 resolver；确认 Milkdown 实际 call path | PARTIAL |
| `NC-09 Collection` | Huabu Frame + Spatial stack | collapsed body、member preview proxy、左拖 source outcome | PARTIAL |
| `NC-10 Glyth` | Question takeover + Grok/Gen1 Bloub | takeover screen-width 与 Gen1 camera zoom 合并为单 owner | PARTIAL |
| `NC-11 Run/Result` | Huabu mechanics + Gen1 ResultSlot + TapNow materialization + Amicro/Morphicons | create→claim、review→markReview 接线与 browser proof | DESIGN READY / WIRING HOLD |
| `NC-12 Audio` | Huabu AudioNode + Spatial media morphology + Amicro/Morphicons | AudioPreview 策略与 browser proof | DESIGN READY |

## 第三批：保持 HOLD

| Card | 阻塞点 | 解锁条件 |
|---|---|---|
| `NC-13 Skill` | 没有获批的 final body / Skill Builder contract | Skill canonical fields 与 Work View freeze |
| `NC-14 Colony` | persistence/body owner 未闭合 | 明确 derived projection 与 ephemeral recalc 边界 |
| `NC-15 Canvas/Space Ref` | Workspace 是 Semantic Viewport，不能照搬 nested canvas 语义 | 产品映射与导航返回合同获批 |

## 施工顺序

```text
NC-01 Image
→ NC-02 PDF
→ NC-04 Note
→ NC-03 Web
→ NC-05 Video
→ NC-06 Frame
→ 统一 wrapper/LOD 回归
→ 再解锁第二批
```

先 Image/PDF 是为了尽早验证 content-first morphology、连续 resize、Preview promotion 和 stale/missing；Note/Web 补同源编辑与外部来源；Video 验证异步媒体；Frame 最后验证容器不吞掉成员物种。

## 每张卡的完成定义

一张卡只有同时具备以下证据才算 `CARD PASS`：

1. 精确源码 host 与 owner；
2. donor 的文件/帧/符号定位；
3. 状态和 LOD 图；
4. normal 与 reduced-motion 行为；
5. 浏览器录屏或连续截图；
6. interaction、persistence、render-count 验收；
7. 未接通项明确标成 Mock / Placeholder / HOLD。
