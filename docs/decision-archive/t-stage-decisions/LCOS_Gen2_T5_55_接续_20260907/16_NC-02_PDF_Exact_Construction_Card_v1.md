# NC-02 PDF — Exact Construction Card v1

## 0. 卡片状态

```text
Species: PDF Artifact View
Card status: DESIGN READY / IMPLEMENTATION NOT STARTED
Canonical truth: LCOS Artifact + Revision + page-level locator
Mechanical host: Huabu PDFNode + PDFPreview + PDFPageWithOverlay
Morphology authority: paper/page preview
Primary visual donor: Spatial document/deep-reading frames
```

## 1. Authority 与 current-source truth

| 项 | 真值 |
|---|---|
| Canvas body | `apps/web/src/components/Nodes/pdf/PDFNode.tsx` |
| Preview body | `apps/web/src/components/Nodes/pdf/PDFPreview.tsx` |
| Page overlay | `apps/web/src/components/Nodes/pdf/PDFPageWithOverlay.tsx` |
| First-page thumbnail | lazy `PDFFirstPageThumbnail`；无 cover 且 full LOD 时才请求 |
| Default geometry | `400 × 400` |
| Height policy | manual；reference width `400`；minimum content scale `0.5` |
| Resize | enabled；`keepAspectRatio=false` |
| LOD | PDF 已 opt-in `full → minimal` |
| Boundary | full→minimal `<140 screen px`；minimal→full `≥160 screen px` |
| Minimal typography | representative canvas size `<300 →32px`；`<600 →52px`；否则 `76px` |
| Preview memory | `usePreviewScrollMemory(scrollContainerRef, scrollViewKey)` |
| PDF state | persistent `highlights[]`；capture/highlight modes；cover update |
| Actions | Preview / download / delete manual cover |

### LCOS owner

- PDF file/hash/missing/stale、Artifact、Revision：Local Core；
- page number、normalized rect、source locator：LCOS fragment contract；
- PDF rendering、text index、page virtualization、highlight overlay：Huabu renderer；
- geometry/selection/resize：Huabu mechanics + LCOS projection persistence；
- T5 定义 paper morphology、状态层级、promotion 与 review visual。

## 2. 形态合同

### Full face

```text
body hierarchy:
1. page/cover preview
2. title
3. optional summary
4. interaction/status chrome
```

- PDF 应读成“纸页/文档”，不能只靠 PDF 图标；
- manual cover 优先于 first-page capture，但必须标记来源；
- 无 manual cover 时首屏 capture 是 cache，不是新 Revision；
- summary 是辅助层，不能压过文档首屏；
- resize 可改变 card 比例，但 page preview 使用稳定的 page aspect，不能拉伸文字。

### Minimal face（current mechanics + Gen2 refinement）

Current Huabu 在 `<140px` 进入 generic label placeholder，`≥160px` 回 full。Gen2 第一阶段保留该机械边界，建议只替换 body：

```text
minimal body = paper silhouette + title
page content may be omitted
type identity = page edge/fold/stack cue, not PDF icon alone
critical state = selected/focused/pending-review 时允许强制 full 或 enhanced-minimal
```

不把 `32/52/76px` 误写成三档 LOD；它们只是 minimal placeholder 的 canvas-space 字号层级。

## 3. 状态视觉合同

| 状态 | 页面内容 | chrome / overlay | 行为 |
|---|---|---|---|
| rest | cover/first page + title/summary | 无强警示 | 保持 paper identity |
| hover | 内容不变 | host hover outline/轻阴影 | 不预加载全部页 |
| selected | 内容不变 | screen-space selection + handles | toolbar 出现 |
| resizing | page preview 保持比例 | handles 跟手 | card 可自由比例；内容不拉伸 |
| thumbnail-loading | title/summary 可见 | page area loading skeleton | hydration scheduler 限流 |
| missing | 无假页面 | MissingFileBanner | 禁用 Preview/download；提供 LCOS relink |
| stale | 最后可信 cover/thumbnail 可见 | `PROPOSED` stale notch + source-changed 文案 | 阻止静默写回 |
| capture-mode | Preview 当前页 | Scan 工具 active | 生成 pageIndex + normalized rect locator |
| highlight-mode | Preview 当前页 | Highlighter active | `highlights[]` 持久化；与 capture 互斥 |
| pending-review | 原 PDF 不被覆盖 | Return Zone / page locator 提示 | 接受后才创建/切换 Current Revision |
| error | 已缓存页可保留 | 明确 render/text-index/permission error | 可 retry，不吞错 |

## 4. Fragment / note contract

Alpha 的 PDF 备注是当前页级；Huabu 已能输出更细的页内 normalized rect。兼容策略：

```text
minimum canonical locator:
artifactId + revisionId + pageIndex

optional precise locator:
normalizedRect[x,y,width,height] + extractedTextHash?
```

- page index 统一存 0-based 还是 1-based 必须在 contracts 层冻结；UI 可显示 1-based；
- rect 始终相对于单页 `0..1`，不能存屏幕坐标；
- fragment 指向 source Revision；Revision 改变后先标 stale，不静默漂移；
- capture image 是派生 Artifact/缓存必须明确区分，不能混进 highlight truth。

## 5. LOD 与性能合同

### Phase 1：沿用 Huabu current LOD owner

```text
full → minimal: screenWidth < 140px
minimal → full: screenWidth >= 160px
```

该值来自 current Huabu 的 `150px threshold ±10px hysteresis`，可以直接作为第一版机械基线。

### Critical override（PROPOSED）

```text
critical = selected || focused || captureTarget || pendingReview
critical + screenWidth >= 96px → enhanced-minimal or full
screenWidth < 96px → minimal, but retain status/identity overlay
```

`96px` 仍需浏览器校准。目标是让关键 PDF 在操作中不突然只剩标题，同时避免远距离强制挂载 pdf.js。

### 性能约束

- minimal 不挂载 pdf.js；
- 有 cached/manual cover 时 canvas 首屏不下载 `react-pdf` chunk；
- 无 cover 的 thumbnail capture 经过 shared hydration scheduler；
- Preview 只保留 visible/retained pages；
- CSS upscale 超过 `1.15` 后，以 `400ms` debounce 重新高分辨率渲染；
- pan/zoom 不触发所有 PDF body 重渲染。

## 6. Preview / deep reading choreography

### 当前流程

```text
PDF node
→ openPreviewNode(id)
→ PDFPreview
→ scroll memory / search / capture / highlight / set cover
```

### Gen2 目标流程

```text
PDF ArtifactView
→ presented/deep reading
→ 恢复 scrollViewKey、page、search/capture context
→ 创建 page/rect fragment 或 note
→ fragment 返回 Canvas / Context / Run
→ close
→ 回到原 anchor 与选中关系
```

Preview 是同一 PDF 的工作 face，不是新 Artifact。只有明确 capture/export 才能创建派生 Artifact，且必须带 provenance。

### Motion（PROPOSED）

- 打开：page/cover rect 到阅读面连续放大，建议 `200–280ms`；
- 页面内容延迟加载不能导致外框跳变；先锁定目标比例，再补清晰度；
- 关闭：返回原 spatial anchor；
- reduced motion：`120ms` crossfade + 即时 focus handoff；
- 精确 easing 等 Spatial 视频逐帧测量后再冻结。

## 7. Persistence 与冲突

| 数据 | Owner | 规则 |
|---|---|---|
| PDF bytes/path/hash | Local Core | 原文件默认链接；写前 hash 校验 |
| coverUrl | node view data / cache contract 待 LCOS adapter 明确 | manual cover 与 generated thumbnail 必须区分 |
| highlights | canonical annotation owner 待 adapter | pageIndex + normalized rect；不能存 viewport pixels |
| Preview scroll | Preview Workspace memory | 以 view key 隔离，关闭/切 tab 后恢复 |
| geometry | projection | drag/resize 结束后 debounce/batch |
| page bitmap/text index | cache | hash + page key；可删可重建 |

外部 PDF 变化：旧 fragment/highlight 标 stale → `waiting_input` 或显式 re-anchor；不得自动把 rect 套到新 Revision。

## 8. Browser acceptance

1. 创建 `400×400` PDF node，首屏/page identity 清晰；
2. full→minimal 在 `<140px`，反向在 `≥160px`，边界来回 zoom 不抖动；
3. minimal 时不加载 pdf.js；cached cover 路径不下载重包；
4. 自由 resize 不拉伸 page 内容，handle 不尾随；
5. 100 个 PDF 中未覆盖 thumbnail 不在同一帧集中 hydration；
6. Preview 重开恢复正确 scroll position；用户滚轮/键盘输入可接管恢复；
7. search 导航到正确页并保留 page index；
8. capture 产出 `pageIndex + normalizedRect`，缩放后仍指向同一区域；
9. highlight add/remove 可逆，刷新后仍存在；
10. capture 与 highlight mode 互斥，不同时抢 pointer；
11. missing/stale/permission/render error 均有不同状态与恢复入口；
12. source Revision 改变后旧 fragment 不静默漂移；
13. presented 打开/关闭保持同一 node/entity、anchor 与 camera context；
14. reduced motion 可用；viewport pan/zoom 无全图业务重渲染。

## 9. 需要单独批准的 adapter 决策

以下不是视觉细节，不能由 T5 自行决定：

1. `coverUrl` 是持久 View 偏好还是纯 cache；
2. Huabu `highlights[]` 迁入 LCOS Note/Fragment/Annotation 的 owner；
3. page index canonical base；
4. source Revision 变化后的 re-anchor 策略；
5. PDF capture 是缓存、Context fragment 还是新 Artifact。

## 10. Card verdict

```text
DESIGN READY
MECHANICAL BASELINE VERIFIED
SEMANTIC ADAPTER DECISIONS: 5 OPEN
Next proof required: browser LOD/load/scroll/capture prototype
Implementation requires separate approved Sprint scope
```
