# NC-04 Note — Exact Construction Card v1

## 0. 卡片状态

```text
Species: Markdown Note Artifact View
Card status: DESIGN READY / IMPLEMENTATION NOT STARTED
Canonical truth: one Markdown content body
Mechanical host: Huabu NoteNode + NotePreview + NodeWrapper
Morphology authority: readable paper/note body
Primary visual donor: Spatial v3/v6 note and deep-edit states
```

## 1. Current-source truth

| 项 | 真值 |
|---|---|
| Canvas body | `apps/web/src/components/Nodes/note/NoteNode.tsx` |
| Preview/editor | `apps/web/src/components/Nodes/note/NotePreview.tsx` |
| Canvas rendering | `MilkdownPreview`，render-only、pointer disabled |
| Deep editing | expanded NotePreview；不是 canvas 内第二份正文 |
| Default geometry | nominal `400 × 56`；创建时默认不固定 height |
| Height owner | `toggleable`；默认 auto，可切 fixed |
| Reference width | `400px` |
| Minimum intrinsic height | `50px` + `6px` shell inset |
| Resize ratio | unlocked |
| LOD | current `full → minimal`；进入 `<140px`，退出 `≥160px` |
| Hydration | minimal 不挂 Milkdown；full 后由 shared scheduler 分帧挂载 |
| Truncation | bottom fade + `ChevronsDown`；内容比 host 高超过 1px 时出现 |
| Missing | `contentMissing` 为写屏障，禁用编辑、drop target 与 Preview action |
| Drop | 支持 note block/chat/image/web payload；move/copy 语义分离 |
| Cross-note move | source/target 原子更新，共享一个 undo entry |

## 2. Authority 与数据流

```text
Markdown canonical content
→ canvas read face: MilkdownPreview
→ deep edit face: NotePreview editor
→ one content patch path
→ Local Core content/Revision persistence
```

- Canvas 与 Preview 必须读取同一个 content；不能生成 outline 副本或第二 Markdown truth；
- height measurement 只提出 proposal，engine 决定并写 geometry；
- auto/fixed owner 由 `data.heightMode` 明确记录，不能通过 height 数字反推；
- LCOS Artifact/Revision/Note/Fragment owner 位于 domain/local-core adapter，不归 T5；
- T5 定义 note morphology、state、LOD 与 promotion continuity。

## 3. 形态合同

### Full face

```text
body = Markdown 排版本身
default surface = paper-like surface
header = none
type badge = none
content padding = 由 Milkdown/note content host 统一拥有
height = auto by default; user may pin fixed height
```

Note 不能被画成“白卡 + 标题栏 + 正文摘要”。它的纸面、段落、清单和图片就是身份。accent 只影响纸面/边界关系，不覆盖正文层级。

### Minimal face

第一阶段沿用 Huabu `150±10px` 边界，但 minimal body 必须保持 Note 身份：

```text
short note: title/first meaningful line
checklist note: checklist cue + title
mixed note: first heading + content-kind cue
generic Note icon: only fallback, not primary morphology
```

`32/52/76px` 是 canvas-space typography tiers，不是三档 LOD。

## 4. 状态视觉合同

| 状态 | body | chrome/feedback | 约束 |
|---|---|---|---|
| rest | readable Markdown | 无常驻 header | 内容优先 |
| hover | 内容不变 | host 轻 outline | 不进入编辑 |
| selected | 内容不变 | screen-space selection + resize affordance | 不改变内容宽高 |
| deep-editing | NotePreview editor | 本地 formatting/drop overlay | 同一 content/entity |
| auto-height | 内容全部展开 | 无 mode 噪声 | measurement proposal 经 engine commit |
| fixed-height | 内容可截断 | bottom fade + chevrons | 不偷偷切回 auto |
| receptive | 内容不变 | current `ring-4 + info wash` 可作为机械基线；Gen2 应减弱为边界 + 精确落点两层 | 与 selected 区分 |
| reject | 内容不变 | `PROPOSED` 中性回弹 + 原因 tooltip | 不用红色大闪烁 |
| loading/hydrating | geometry 保持 | full 时轻 skeleton；minimal 无动画 | 禁止 footprint 跳变 |
| missing | 不显示可编辑旧正文 | MissingFileBanner | 完整写屏障 |
| stale | 最后可信正文只读 | `PROPOSED` stale edge/notch | 进入 waiting_input，不静默覆盖 |
| pending-review | 当前正文保持 Current | Preview 内 block provenance/review summary | AI Draft 不直接覆盖 Current |

## 5. Height contract

### Auto

```text
intrinsic Markdown measurement at refWidth=400
→ proposal queue
→ engine converts to layout height
→ style.height materialized
```

最小空 Note 布局基线约为 `56px`。Resize/measurement 期间不能由组件和 engine 双写 height。

### Fixed

- 用户显式 pin 后 box height 归用户；
- fixed → auto → fixed 应恢复 session 记录的上一固定高度；
- fixed 内容溢出显示 truncation，不裁掉而不提示；
- 切 auto 时应使用可信离屏 measurement，不能拿已截断 box 反推正文高度。

### Browser invariant

auto note 稳定后 `intrinsicHeight - hostHeight ≤ 1px`；拖动/resize 结束后一次批量持久化，不产生可见双跳。

## 6. Drop / semantic give contract

```text
drag enters note
→ receptive zone
→ derive Markdown snippet
→ show insertion semantics
→ move or copy
→ one atomic content transaction
```

- 同一 Note 的 block 拖回自身不执行整卡 drop；
- macOS Option、Windows/Linux Ctrl 表示 copy；无修饰符且 payload 可移动时为 move；
- cross-note move 必须 source/target 原子提交并共享 undo；
- drop 到 Preview 使用精确 insertion indicator；canvas face 只表达接受区域；
- locked/missing/stale conflict 状态不得接受写入。

## 7. LOD 与 promotion

### Phase 1：沿用 Huabu current LOD owner

```text
full → minimal: screenWidth < 140px
minimal → full: screenWidth >= 160px
critical = selected || focused || receptive || pendingReview
```

`critical` override 的最终阈值仍为 `PROPOSED`；不得另建 camera-zoom store。

### Canvas → Preview

```text
Note ArtifactView
→ openPreviewNode(id)
→ NotePreview mounts same Markdown
→ edit / block move / pending review
→ commit one content patch path
→ close
→ restore anchor, selection, focus context
```

Spatial v6 的关键要求是：局部格式 overlay 关闭后编辑焦点仍在正文；overlay 使用 Portal/局部浮层，不进入 canvas 或 editor layout。

### Motion（PROPOSED）

- open/close：paper rect continuity，建议 `180–260ms`；
- editor hydration 不改变目标外框；
- formatting overlay：短 opacity/scale，focus 不跳；
- reduced motion：`120ms` crossfade，直接交接 caret/focus；
- 精确 easing 等原视频时间轴测量后冻结。

## 8. Persistence / conflict

| 数据 | Owner | 规则 |
|---|---|---|
| Markdown | Local Core / canonical Artifact | 单一正文 |
| Revision | Local Core | AI 修改默认新版本 |
| heightMode + geometry | projection persistence | owner 显式；停止交互后 batch |
| editor caret/selection | ephemeral UI | 不写入 canonical content |
| Preview scroll | Preview Workspace | 由 scrollViewKey 隔离 |
| provenance | Run/Revision adapter | block-level 可读，未确认仍 Draft |

失败路径：sidecar missing、duplicate sidecar、外部修改、写权限失败、Markdown parse/render 失败、atomic move 半失败。任何写失败必须保留原 source 与 target。

## 9. Browser acceptance

1. 空 Note 创建后宽 `400px`、高度不低于约 `56px`，且没有固定高度误写；
2. 多段 Markdown 在 auto mode 稳定后不截断，误差 ≤1px；
3. fixed height 截断时出现 fade/chevrons，切换往返恢复固定高度；
4. full/minimal 在 `140/160px` 边界无抖动，minimal 不挂 Milkdown；
5. 50 个 Note 由 scheduler 分帧 hydration，geometry 不跳；
6. Canvas 只读，Preview 编辑同一 content，关闭后 canvas 更新；
7. formatting overlay 关闭后 caret/focus 留在正文；
8. drag image/web/chat payload 插入正确 Markdown；
9. cross-note move 原子且一次 undo 完整恢复双方；copy 只改 target；
10. locked/missing/stale 不接受 drop 或写入；
11. selected、receptive、pending-review 三种状态不只靠颜色且互不混淆；
12. reduced motion、Preview scroll restore、viewport render-count 合格。

## 10. Card verdict

```text
DESIGN READY
MECHANICAL BASELINE VERIFIED
OPEN: critical LOD override token + LCOS content/revision adapter
```
