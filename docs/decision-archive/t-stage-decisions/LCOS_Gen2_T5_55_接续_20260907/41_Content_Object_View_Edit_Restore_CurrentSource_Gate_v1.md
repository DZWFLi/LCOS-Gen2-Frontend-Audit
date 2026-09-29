# 已废止 / SUPERSEDED（2026-09-07）

本稿及其对应的 `content-object-continuity.html` 已被用户否决，不得继续作为视觉、交互或施工输入。原因：颗粒度不足，未忠实合并 T1 精确契约、Huabu 当前真实节点身体、Gen1 同对象体验下限与 Spatial 原始形态/动效证据。

后续唯一纠偏入口见 `42_T1_Huabu_Gen1_Spatial_Granularity_Recovery_v1.md`。原文件仅保留用于审计“哪里做错了”，不得继续润色或据此施工。

# 内容对象 View / Edit / Restore · Current Source Gate v1

> 基线：`LCOS_Gen2/main@232b2ca5` + `Huabu@a3c411e1`。  
> 范围：继续核验 Canvas 内容对象是否已达到“几种查看和编辑原生直觉无缝化”。  
> 结论：Note donor 很成熟，但 Gen2 当前仍缺同身份 promotion/restore 的产品级闭环。

## 0. 真实状态

```text
Huabu Note canvas face: READY
Huabu Note deep editor: READY
Huabu Preview Workspace: READY
Gen2 renderer family mapping: PARTIAL / PLACEHOLDER ERA
same-object promotion + restore: NOT PROVEN
Core-confirmed edit + conflict path: NOT PROVEN END TO END
```

不能因为 `NotePreview` 很完整，就宣称 Gen2 的内容对象无缝编辑已经完成。现状是 donor 器官齐，Gen2 身份与跨 Surface 接线还没有浏览器证据。

## 1. 已有成熟能力

### Canvas Note face

`huabu/apps/web/src/components/Nodes/note/NoteNode.tsx` 已提供：

- canvas 上只读 `MilkdownPreview`；
- minimal LOD 时不 mount editor；
- deferred hydration，避免全画布同时构建 ProseMirror；
- content-owned auto height；
- fixed-height memory；
- truncation fade；
- missing-content write barrier；
- expand action 直接调用 `openPreviewNode(id)`；
- 跨对象 Drop 转 Markdown；
- note-to-note move 使用单次原子 mutation；
- copy modifier 区分；
- self-drop、locked、invalid payload 的防护。

这些应 DIRECT USE，不重写 Canvas Markdown renderer、高度测量或 Drop 编辑器。

### Deep editor

`NotePreview.tsx` 已提供：

- Milkdown WYSIWYG；
- raw Markdown face；
- 同一 canonical content；
- scroll memory；
- formatting toolbar；
- block drag/drop 与 precise insertion indicator；
- AI provenance accept/reject；
- external payload insertion；
- readOnly barrier。

### Preview shell

`PreviewWorkspace.tsx` 已提供 tabs、split、fullscreen、tab drop 与 split resize。`previews.ts` 已注册 Note、Web、PDF、Office、Image、Video、Sketch；Audio 仍缺。

## 2. Gen2 当前缺口

### 2.1 Presentation registry 仍是早期抽象

`apps/web-gen2/src/presentation/rendererRegistry.ts` 明写：

```text
Phase A placeholder
real morphology in Phase B/C
```

并且当前 `PresentationSpecies` 不完整：没有独立 `note/document/web/office/output` 精确闭环，conversation 仍可能映射为 `species: text`。不能把这个 registry 当成已经完成的产品 renderer adoption。

### 2.2 visualFamily 映射过粗

`visualFamily.ts` 当前把以下全部映射为 Huabu `note`：

- `pdf`；
- `presentation`；
- `markdown`；
- text file；
- conversation / skill / run / output / unknown fallback。

这与 Huabu 已经存在的 `PDFPreview`、Office renderer、Glyth、Run/Result 物种合同不一致。它可以是早期 fail-close fallback，不能成为 Phase B 最终映射。

### 2.3 缺少同身份 promotion transaction

需要明确唯一的 presentation transition：

```text
ArtifactView(canvas spatial id)
→ capture source rect + camera + selection
→ open Preview target using same node/artifact identity
→ edit canonical content
→ Core ack / conflict
→ close
→ restore camera + anchor + selection + local scroll/caret rule
```

当前源码证明 Huabu 可以打开 Preview，但没有证明 LCOS Core Artifact、ProjectionBinding、Huabu node id 与 Preview tab target 在整条链上始终是同一个身份。

## 3. Note 第一条施工链

### DIRECT USE

- `NoteNode`；
- `NotePreview`；
- `PreviewWorkspace`；
- `openPreviewNode`；
- `usePreviewScrollMemory`；
- existing height ownership；
- Milkdown Drop / provenance machinery。

### 只新增薄接线

| 责任 | 输入 | 输出 |
|---|---|---|
| identity resolver | ProjectionBinding + ArtifactView | Huabu node id / Preview target |
| promotion snapshot | source rect、camera、selection | 可丢失 presentation snapshot |
| edit adapter | NotePreview patch | Core Artifact revision mutation |
| conflict adapter | stale/hash/version conflict | waiting_input，不静默覆盖 |
| restore coordinator | close result + snapshot | camera、selection、anchor restore |

不新增第二个 Markdown store，不复制 Note content，不把 Preview tab 变成第二个 Artifact。

## 4. 原生直觉标准

### 查看

- 双击或 Expand 后，内容从原卡位置连续展开；
- canvas source 不突然消失再出现无关面板；
- Preview 首帧与 Canvas 正文/页码/媒体位置一致；
- 关闭回到原节点，不丢 camera/selection；
- split view 是同一对象的另一个 presentation，不创建新 Artifact。

### 编辑

- Note Canvas face 只读，深编辑进入 Preview；
- Text 才允许 canvas inline textarea；
- 编辑期间 density 固定为 working，zoom 不把正在编辑的对象折成 mark；
- 保存由真实 Core ack 决定；
- 外部修改必须 stale/waiting_input；
- AI pending blocks 与人工 Current 不混写。

### Resize

- Note auto-height：宽度由用户，height 由内容；
- Note fixed-height：宽高由用户，截断显示 fade；
- resize 中暂停 height commits，结束后一次批量 geometry commit；
- Preview split resize 与 Canvas node resize 是不同 geometry owner，不能互相污染。

## 5. 下一浏览器原型范围

下一 HTML 不再泛做所有媒体，先做一条最能暴露问题的 Note 路径：

```text
Canvas Note
→ resize width / auto-height reflow
→ Focus
→ expand into Preview
→ WYSIWYG / raw switch
→ edit
→ close and restore exact node/camera
```

同时放一个 Text node 对照，证明 Text 可原地 inline edit，而 Note 应进入深编辑。这样可以直接判断“原生无缝”是否成立，而不是做一组静态卡片。

## 6. Gate

```text
NOTE DONOR QUALITY: PASS
VIEW/EDIT PRODUCT CONTRACT: READY
GEN2 EXACT IDENTITY SEAM: NEEDS IMPLEMENTATION
BROWSER CONTINUITY: NEEDS PROTOTYPE + E2E
AUDIO PREVIEW: MISSING
OFFICE/PPT NATIVE FIDELITY: MISSING
```
