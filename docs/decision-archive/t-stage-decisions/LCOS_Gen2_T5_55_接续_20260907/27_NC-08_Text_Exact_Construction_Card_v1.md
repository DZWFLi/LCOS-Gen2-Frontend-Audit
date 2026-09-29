# NC-08 Text — Exact Construction Card v1

## 0. 卡片状态

```text
Huabu baseline: a3c411e1f655191344285141f08c4738fa6015f7
Species: lightweight spatial Text
Card status: DESIGN READY
Mechanical host: Huabu TextNode + TextNodeBody + useTextNodeSurface
Reuse posture: DIRECT USE
Critical correction: Text is not the Markdown document/Outline/Mind Map owner
```

## 1. Latest Huabu truth

| 项 | 当前实现 |
|---|---|
| Canvas body | `text/TextNode.tsx` |
| Shared surface | `shared/TextNodeBody.tsx` |
| Sizing | `useTextNodeSurface` + `useTextAutoSize` |
| Default width | `200px` |
| Height owner | content；永远 auto |
| Base font | `16px` |
| Editing | double-click/post-create → deterministic textarea focus |
| Commit | blur 后 content patch；随后 `settleNodePreprocess` |
| Formatting | bold / italic / underline / strikethrough / font family |
| Font family | default / serif / mono / hand |
| Missing | contentMissing 写屏障 |
| Resize | unlocked；字体/width/auto-height 由现有 surface 处理 |
| Preview registry | Text 未注册独立 Preview |
| Binary minimal LOD | current 未 opt-in |

## 2. 物种边界纠正

此前把 Text 与“Markdown full/outline/title 三 face”放在同一条里，颗粒度不准确。

```text
Huabu Text = canvas 上的轻量文字、标题、标注
Huabu Note = Markdown 内容与 Milkdown deep edit
LCOS document projections = canonical Markdown/Artifact 的专业 Work Views
```

因此不应给 TextNode 塞入 Milkdown、Outline 或 Mind Map，也不应为它新建 Preview。长文、结构化 Markdown 与多 projection 应落在 Note/Document family 上。

## 3. 形态合同

- 文字本身是节点，不加 card、header 或类型 badge；
- 透明背景为默认，accent 只提供可读的前景/轻背景关系；
- read face 与 textarea edit face 尺寸一致；
- selection/toolbar 是 screen-space chrome，不推动文字换行；
- post-create 直接编辑，避免先选中再双击；
- 样式能力严格沿用现有 toolbar，不扩成富文本编辑器。

## 4. 状态合同

| 状态 | body | 规则 |
|---|---|---|
| rest | styled text | 无永久 shell |
| hover | text 不变 | 轻 outline |
| selected | text 不变 | selection + toolbar |
| editing | textarea 同尺寸 | focus 稳定；pointer owner 转交 editor |
| committing | 保持 draft | blur 后一次 content patch |
| missing/duplicate | Missing/duplicate barrier | 不可编辑 |
| stale | 最后可信 text 只读 + cue | 等待冲突处理 |
| locked | read-only | toolbar/resize/drop 受限 |

## 5. Resize / height

Text height 始终由内容拥有，top-level `style.height` 不能成为 pinned geometry。Resize 通过现有 surface 调整 width/font scale，随后 auto height 跟随内容。

验收不变量：

```text
read body box == edit textarea box
selection does not change wrap
resize does not create fixed height
blur commit does not visibly jump
```

## 6. LOD

Text current 不使用 binary minimal。优先沿用本体缩放；只有性能或可读性证据证明必要时，才在 Huabu 现有 LOD owner 上加 title/identity policy。

不直接搬 Gen1 document `.72/.36` 阈值到 Text。那些是 document projection 的测试输入，不属于轻量 TextNode。

## 7. Persistence

| 数据 | Owner | 规则 |
|---|---|---|
| content/style | canonical text artifact/view adapter | blur 一次提交 |
| draft/caret/focus | ephemeral UI | 不写 canonical truth |
| width/font scale | projection/view state | 使用现有 resize intent |
| height | content-derived | 不持久化用户 pin |
| label preprocessing | Huabu existing pipeline | edit settle 时触发 |

LCOS adapter 只需映射轻量文本实体；若 LCOS 没有独立 Text ArtifactKind，可明确投影为 Note/other 的 lightweight view，不能暗造新 canonical species。

## 8. Browser acceptance

1. post-create 直接进入 textarea，focus 无 timeout race；
2. double-click edit，blur 一次提交；
3. rest/edit body box 一致，换行不跳；
4. resize 后仍为 auto height，无固定 height 残留；
5. bold/italic/underline/strike/font family 沿用现有 toolbar；
6. missing/duplicate/stale 不可写；
7. selection/toolbar 不改变文字 geometry；
8. 不加载 Milkdown，不创建 Text Preview/Outline/Mind Map；
9. viewport pan/zoom 无全图业务重渲染；
10. reduced motion 保持 focus 与 commit 可用。

## 9. Card verdict

```text
DESIGN READY
DIRECT USE LATEST HUABU TEXT STACK
DOCUMENT THREE-FACE REQUIREMENT MOVED OUT OF TEXT SPECIES
```

