# Node Species × State × Donor × Host Seam Matrix v1

## 状态标记

- `GO`：authority、host seam 与验收方向足够，可进入 exact construction card。
- `PARTIAL`：body/mechanics 已有，仍缺 LCOS adapter 或状态补齐。
- `HOLD`：关键 owner/语义未闭合，不能施工该状态。
- `N/A`：该 species 不应拥有该状态。

## 1. Species 总矩阵

| Species | Huabu current body | LCOS/Gen1 semantic source | Visual donor | full | compact/minimal | identity/far | Preview/Deep | 当前裁决 |
|---|---|---|---|---|---|---|---|---|
| Image | `image/ImageNode.tsx` | Artifact/Revision/View | Spatial image | `GO` | `PARTIAL` | `PARTIAL` | `image/ImagePreview.tsx` | `GO → card` |
| PDF | `pdf/PDFNode.tsx` | Artifact + page note/fragment | Spatial paper/document | `GO` | `GO`（Huabu minimal） | `PARTIAL` | `PDFPreview.tsx` + page overlay | `GO → card` |
| PPT/Office | `office/OfficeNode.tsx` | Artifact；current slide 需 adapter | Gen1 completeness + Huabu | generic Office `GO` | identity `PARTIAL` | `PARTIAL` | extracted Markdown `OfficePreview.tsx`；无 native slide render | `PARTIAL` |
| Web | `web/WebNode.tsx` | URL Artifact | Spatial webclip | `GO` | `GO`（Huabu minimal） | `PARTIAL` | `WebPreview.tsx` live/reader | `GO → card` |
| Video | `video/VideoNode.tsx` | Artifact | Spatial media | `GO` | `PARTIAL` | `PARTIAL` | `VideoPreview.tsx` | `GO → card` |
| Audio | `audio/AudioNode.tsx` | Artifact | Huabu native | `GO` | `PARTIAL` | `PARTIAL` | native audio body | `PARTIAL` |
| Text | `text/TextNode.tsx` + shared `TextNodeBody.tsx` | lightweight canvas text | Spatial text labels | `GO` | 本体缩放优先 | identity 待证据 | 无独立 Preview | `GO → card` |
| Note | `note/NoteNode.tsx` | canonical Markdown | Spatial paper/sticky | `GO` | `GO`（Huabu minimal） | `PARTIAL` | `NotePreview.tsx` | `GO → card` |
| Collection | `frame/FrameNode.tsx` 作为 expanded host | LCOS membership | Spatial Stack/Folder | expanded `GO` | collapsed `PARTIAL` | stack identity `PARTIAL` | member browsing | `PARTIAL` |
| Colony | 无直接 species | LCOS derived grouping | Spatial organic field + LCOS primitives | `PARTIAL` | `PARTIAL` | aggregate `PARTIAL` | N/A | `PARTIAL` |
| Glyth | `question/QuestionNode.tsx` host 可借 | Conversation canonical truth | Grok + Gen1 Bloub | `PARTIAL` | `PARTIAL` | Huabu takeover + Gen1 LOD | Conversation scene | `PARTIAL` |
| Skill | 无直接 native body | Skill canonical entity | LibTV + LCOS | `PARTIAL` | `PARTIAL` | `PARTIAL` | Skill Builder | `HOLD body` |
| Run/Result | Question/status primitives可借 | Run canonical lifecycle | T4/T6 + Grok overlay subset | `PARTIAL` | `PARTIAL` | state glyph | Run Review | `PARTIAL` |
| Frame | `frame/FrameNode.tsx` | spatial grouping only | Huabu | `GO` | label overlay | frame ref | N/A | `GO` |
| Canvas/Space Ref | `canvasRef`, `spacePreview` | Workspace/semantic viewport 边界 | Huabu | `PARTIAL` | `PARTIAL` | portal identity | nested preview | `HOLD mapping` |
| Node/Frame Ref | `nodeRef`, `frameRef` | explicit extra reference | Huabu | `GO mechanics` | `PARTIAL` | reference identity | source navigation | `PARTIAL` |

## 2. Cross-species state matrix

| State | Native Artifact | Text/Note | Collection | Colony | Glyth | Skill | Run |
|---|---|---|---|---|---|---|---|
| rest | GO | GO | GO expanded | PARTIAL | GO donor | HOLD body | PARTIAL |
| hover | GO via wrapper | GO | PARTIAL | PARTIAL | GO donor/host | HOLD | PARTIAL |
| selected | GO via wrapper | GO | GO | PARTIAL | GO host | PARTIAL | PARTIAL |
| multi-selected | GO via canvas | GO | GO | N/A group-derived | GO | PARTIAL | PARTIAL |
| resize | GO | GO/autosize | GO frame | N/A contour | host-dependent | likely N/A | likely N/A |
| drag | GO | GO | GO | members only | GO | PARTIAL | PARTIAL |
| receptive | LCOS overlay needed | LCOS overlay needed | PARTIAL | HOLD | Glyth mapping Phase 2 | HOLD | HOLD |
| reject | LCOS overlay needed | same | PARTIAL | HOLD | Phase 2 | HOLD | HOLD |
| focused | Spatial choreography missing | same | same | derived | Conversation focus | Work View | Run Review |
| presented | Preview Workspace exists | Note/Milkdown | member browse | N/A | Conversation scene | Skill Builder | Run Review |
| working | status decoration | status decoration | member/local | ambient only | Grok working | tool state | canonical lifecycle |
| waiting_input | status decoration | status decoration | N/A | N/A | Grok listening/alert mapping | N/A | required |
| pending_review | DotGlyph/light state | same | affected members | derived | possible | proposal | required |
| error/stale/missing | native missing-file paths partly exist | same | aggregate warning | derived | alert mapping | required | required |
| archived | LCOS lifecycle | LCOS lifecycle | membership rules | derived | conversation lifecycle | lifecycle | lifecycle |
| restored | fresh placement + settle | same | HOLD collapsed outcome | recalc | same identity | same identity | same identity |

## 3. Exact host seam inventory

### Shared mechanics

```text
NodeWrapper.tsx
→ selection / resize / actions / overlay / LOD / interaction phase

NodeTakeoverLayer.tsx + useNodeTakeover.ts
→ screen-space mark / body fade / portal / collapsed drag

SemanticPlaceholder.tsx + semanticZoom.ts + useNodeLOD.ts
→ note/pdf/web minimal body

Preview registry: previews.ts
→ note/web/pdf/office/image/video

Preview Workspace store
→ deep-view layout / persistence / scroll memory
```

### Species bodies

```text
image/ImageNode.tsx
pdf/PDFNode.tsx
office/OfficeNode.tsx
web/WebNode.tsx
video/VideoNode.tsx
audio/AudioNode.tsx
text/TextNode.tsx
note/NoteNode.tsx
frame/FrameNode.tsx
question/QuestionNode.tsx
canvasRef/CanvasRefNode.tsx
spacePreview/SpacePreviewNode.tsx
nodeRef/NodeRefNode.tsx
frameRef/FrameRefNode.tsx
sketch/SketchNode.tsx
```

## 4. T5 必须补的视觉合同

### Native Artifact family

不重画 body。补：

- LCOS Source / Working / Generated / Context / Process / Decision 的非颜色差异；
- selected/focus/pending/stale 层级；
- Spatial-style presented choreography；
- species-preserving identity LOD；
- fragment/source-return affordance。

### Collection

```text
expanded = Huabu Frame mechanics + content-first visual
collapsed = Spatial member-stack body
proxy = source species 28–36px compressed preview + linked cue
identity = member-stack/species cue，不用 generic folder glyph
```

HOLD 只限 collapsed Collection 左拖后的 source outcome，不阻塞 body、preview、count、LOD。

### Glyth

```text
host mechanics = Huabu Question takeover / NodeWrapper
face/presence = Grok replica / Gen1 Bloub
canonical truth = LCOS Conversation
normal/mid/far/extreme = Gen1 glythSemanticLod policy 作为测试输入
```

需要额外验证 Huabu screen-width takeover 与 Gen1 camera zoom bands 是否合并为单 owner，禁止两套 LOD 同时驱动。

## 5. 最小验收

每个 `GO → card` species 必须在浏览器证明：

1. rest → hover → selected 不改变内容尺寸；
2. resize 连续且内容不溢出；
3. full → minimal/identity 无闪跳；
4. open Preview/Work View 保持同一 entity；
5. close/restore 回到正确 spatial anchor；
6. reduced motion 可用；
7. stale/missing/error 不被吞掉；
8. 视口移动不会触发全图重渲染。

## 6. 当前放行判断

可以立即进入 exact construction card：Image、PDF、Web、Note、Video、Frame。

需要先补映射再放行：PPT/Office、Text 三 face、Collection collapsed、Glyth LOD、Run lifecycle。

继续 HOLD：Skill final body、Colony persistence/body owner、Workspace/Space Ref 最终产品映射。
