# Glyth Drop、内容连续性与 Resize · GitHub Current Source 施工接线卡 v1

> 复核源：`DZWFLi/LCOS_Gen2` GitHub `main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a`（2026-09-07）。  
> 任务性质：只读源码审计与施工接线；未修改仓库。

## 0. 新事实与停止项

GitHub main 最新提交为：

```text
232b2ca merge: rebase LCOS seam onto Huabu upstream a3c411e (migration)
```

仓库已经包含 `huabu/`，所以“最新 Huabu 完全没有进入 Gen2”已不是 GitHub main 的当前事实。但 `HUABU_UPSTREAM.md` 仍声明 pin 为 `58339e2...`，与 merge message 的 `a3c411e` 不一致。

这是 source-truth metadata 冲突。按工程规则：**在实施前必须由同步执行者把 `HUABU_UPSTREAM.md`、实际 vendored tree 与 merge provenance 对齐。** 本卡仍可给出接线设计，但不允许据此开始改代码或宣布同步完成。

## 1. 当前 owner 实况

| 能力 | GitHub current source | 实况 |
|---|---|---|
| zoom takeover | `huabu/apps/web/src/components/Nodes/NodeTakeoverLayer.tsx` | 连续 screen-space overlay；mark 自绘，host 管位置、glide、card fade；不会重渲染 node body |
| Glyth host candidate | `huabu/apps/web/src/components/Nodes/question/QuestionNode.tsx` | 已接 `QuestionTakeoverMark`、`NodeWrapper.takeover`、同一 TextNodeBody/Preview Workspace 入口 |
| single resize | `huabu/apps/web/src/components/Nodes/NodeWrapper.tsx` | `NodeResizer`；snap session；live preview；end 时 canonical geometry commit |
| group resize | `huabu/apps/web/src/components/Panels/Canvas/MultiSelectResizer.tsx` | 多选独立 group resizer，避免每节点同时出 handle |
| structured drop visual host | `huabu/apps/web/src/components/Panels/Canvas/StructuredDropOverlay.tsx` | 可复用 host overlay；不能承载 LCOS canonical 语义 |
| Gen2 drop pure machine | `apps/web-gen2/src/interaction/semanticDropMachine.ts` | 当前只覆盖 left/bottom slot dwell/preview/commit/failed；不是 Glyth body target machine |
| identity seam | `apps/web-gen2/src/spatial/projectionBinding.ts` | Core EntityRef ↔ Huabu spatial id 的唯一映射；支持 `conversation` |
| host facade | `apps/web-gen2/src/host/projectionFacade.ts` | 可 reverse-resolve Huabu node 到 Core ref；当前暴露 connect/reconcile 等，不含 Assembly→Conversation context mutation |
| Preview shell | `huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspace.tsx` | tab、split、fullscreen、drop placement、split resize 已有 |
| Note deep edit | `huabu/apps/web/src/components/Nodes/note/NotePreview.tsx` | Milkdown WYSIWYG + raw Markdown；canonical content、scroll memory、block drop、provenance review 已有 |
| lightweight text edit | `huabu/apps/web/src/components/Nodes/shared/TextNodeBody.tsx` | canvas textarea、双击进入编辑、统一 autosize surface |

## 2. 最小实现链：Glyth zoom

```text
Core Conversation
→ ProjectionBinding(entityType='conversation')
→ Huabu question-compatible projection node
→ QuestionNode / NodeWrapper host mechanics
→ NodeTakeoverLayer
→ Glyth-owned renderMark(state)
```

### DIRECT_USE

- `NodeWrapper.takeover` contract；
- `NodeTakeoverLayer` portal、screen-space position、glide、card fade；
- `useNodeTakeover` 与现有 threshold/config；
- selected / locked / multi-select / collapsed mark 的 host interaction rules。

### LIFT / ADAPT

- 从 Grok replica / Gen1 Bloub 只提取 Glyth 的 SVG morphology、eyes、局部 pose；
- 将 LCOS Conversation / Run state 映射为 `renderMark(state)` 的局部 chrome；
- 保留一套 canonical conversation id，不复制 avatar state store。

### 禁止新增

- `GlythZoomEngine`；
- 第二套 viewport observer；
- 在 Glyth renderer 内保存 zoom stage；
- DOM card 与 takeover mark 两个可独立选中的实体。

## 3. 最小实现链：Assembly → Glyth durable context

当前 `semanticDropMachine.ts` 是 **surface-edge slot machine**，目标是 left/bottom dock，不应硬塞 Glyth body semantic target。也不能重写它。

应采用并行但共享 pointer host 的薄目标解析：

```text
Huabu pointer / native drag payload
→ current ProjectionBinding reverse lookup
→ resolve target Core ref
→ Glyth target eligibility pure resolver
→ presentation-only GlythDropVisualState
→ Local Core assembly apply: conversation_context
→ reconciliation / read-back
→ settle 或 failure rollback
```

### 建议新增的最小文件

名称可随现有目录习惯调整，但职责必须保持：

| 文件职责 | 建议位置 | 允许内容 |
|---|---|---|
| 纯资格判定 | `apps/web-gen2/src/interaction/glythDropTarget.ts` | payload + resolved Core ref → accept/reject/reason；无 DOM、无 fetch |
| presentation state | `apps/web-gen2/src/interaction/glythDropVisualState.ts` | idle/approach/receptive/committing/settle/reject；只做短命 UI state |
| host orchestration | 接入现有 Huabu pointer/drop seam | 调 resolver、调用 Core mutation、触发 reconcile；不保存领域真值 |
| Conversation context mutation | 现有 Local Core Assembly apply service | 原子写 durable `conversation_context`，返回真实 change/result |

如果同步后的 main 已有同责文件，必须扩展现有 owner，不按上述建议再新建。

### 状态映射

```text
pointer enters screen-space hit field
→ approach

eligible + stable hover
→ receptive

pointer release
→ committing

Core success + read-back mapping exists
→ settle
→ idle

ineligible / cancel / target vanished / Core failure
→ reject(reason) 或 idle(cancel)
→ restore exact prior visual state
```

`StructuredDropOverlay` 只能贡献 placement/feedback host；Glyth 身体状态必须由 Glyth renderer 消费短命 visual state。`ProjectionBinding` 是 target identity 的唯一入口，不允许从标题、DOM 顺序或空间邻近猜 conversation。

## 4. 最小实现链：内容 view/edit/restore

### Note 第一优先

最新 Huabu 的 `NotePreview` 已经不是占位：它有 WYSIWYG/raw 双 face、canonical Markdown、scroll memory、block-level drop 与 provenance review。Gen2 不应另造编辑器。

施工只补 adapter：

```text
ArtifactView projection node selected
→ store presentation source rect + camera + selection
→ PreviewWorkspace open existing NotePreview
→ onDataChange / onContentChange 走 canonical mutation seam
→ Core confirmation / conflict handling
→ close preview
→ restore source rect owner, camera, selection, scroll/caret rule
```

需要新增的是同身份 promotion/restore glue，不是新的 Markdown editor。

### Text 边界

`TextNodeBody` 已是 canvas-native textarea 与 autosize 触感基线。它只服务轻量文本/标题式对象；不能用它冒充 Note 文档编辑，也不能把 Note 降级成 textarea。

### 其他媒体

Image/PDF/Web/Video/Office 首先完成 view promotion 和 restore；没有成熟 editor 时明确为 view-only。不得为了表格对称添加假编辑按钮。

## 5. 最小实现链：自由 resize

`NodeWrapper` 已完整处理：

- 单选才 mount `NodeResizer`；
- collapsed takeover mark 不显示 resize handle；
- Ctrl/Cmd 多选意图期间 handle 让位；
- start 时建立 snap session；
- live tick 走 snapped proposal 与 resize preview；
- end 时一次 canonical geometry commit；
- auto-height 节点可在结束后清 height owner；
- frame 允许在同一批次处理 children cascade。

因此 Gen2 只需要 species policy，不需要新 resize engine：

| policy | species |
|---|---|
| aspect-locked | Image、Video |
| manual width/height | PDF、Web、Office、fixed-height Note |
| width-manual + height-content-owned | auto-height Note、Text |
| morphology-constrained | Glyth（用户可调空间 footprint，但不能拉伸 SVG 身体） |

Glyth 若允许 resize，正确做法是调 conversation footprint / readable width，再由 renderer 在内部按比例排布；不能把眼睛和身体做非等比 CSS 拉伸。

## 6. 测试最小集

### Unit

- `glythDropTarget`: valid, invalid type, self-target, duplicate mapping, missing binding；
- `glythDropVisualState`: cancel、target disappear、commit failure、success settle；
- species resize policy: aspect、min size、auto-height clear；
- promotion restore reducer: source rect/camera/selection 不丢。

### Integration

- Assembly item → reverse binding → Core `conversation_context` → reconcile；
- duplicate durable mapping idempotent；
- mutation 成功但 reconcile 失败时可重试且不重复写；
- stale/hash conflict 进入 waiting_input，不播放成功 settle。

### Browser

- zoom 穿越 takeover band 的连续录屏；
- Source Bay → Glyth 五阶段录屏；
- Note canvas → edit → restore；
- 各 species 8 个方向 resize、snap、undo/reload；
- reduced-motion；
- 100/150/300 节点性能降级下 active Glyth 不丢身份。

## 7. 当前 Gate

```text
SOURCE MECHANICS: READY
GLYTH VISUAL CONTRACT: READY FOR IMPLEMENTATION
GLYTH BODY DROP ADAPTER: MISSING
NOTE EDITOR DONOR: READY
PROMOTION / RESTORE E2E: UNPROVEN
RESIZE HOST: READY
BASELINE PROVENANCE METADATA: CONFLICT — MUST FIX BEFORE CONSTRUCTION
```

本卡不授权修改。同步执行者先修复 `HUABU_UPSTREAM.md` 与真实 vendored baseline 的一致性，再由获批 Sprint Scope 接入。
