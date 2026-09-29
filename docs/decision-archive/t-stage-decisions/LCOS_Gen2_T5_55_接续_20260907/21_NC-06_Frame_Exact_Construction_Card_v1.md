# NC-06 Frame — Exact Construction Card v1

## 0. 卡片状态

```text
Species: Spatial Frame / expanded grouping host
Card status: DESIGN READY / IMPLEMENTATION NOT STARTED
Canonical truth: child membership + layout/sizing policy
Mechanical host: Huabu FrameNode + shared frame engine
Reuse posture: DIRECT USE
Important boundary: Frame is not collapsed Collection's final body
```

## 1. Current-source truth

| 项 | 真值 |
|---|---|
| Body | transparent/empty FrameNode body；成员是视觉主体 |
| Default geometry | `400 × 300` |
| Group creation minimum | `240 × 160` |
| Membership capture | overlap threshold default `0.5` |
| Layout modes | `free / column / row / grid` |
| Track count | `1..12`；不超过 child count（empty frame 允许1） |
| Sizing | `hug` default / `manual` |
| Resize | every mode enabled；direct children proportional scale |
| Resize batching | per-tick rAF coalesced；end 时 flush trailing tick |
| Undo | resize gesture 复用单一 snapshot |
| Projection | affected frames + ancestors deepest-first fit/relayout |
| Label | zoom-invariant overlay；offset `-24px` |
| Label visibility | width floor `48px`；nested vertical gap `22px ±4px` hysteresis |
| Instruction label | minimum `112px` |
| Overflow | allowed |

不重写 frame fit、grid solver、membership、resize cascade、undo 或 projection。LCOS 只映射 canonical membership/projection semantics。

## 2. 产品边界

```text
Frame = expanded spatial grouping mechanics
Collection expanded face = may use Frame
Collection collapsed face = Spatial member-stack, separate card
Colony = derived grouping field, not Frame persistence alias
```

因此本卡放行 Frame mechanics，不等于放行 Collection collapsed、Colony 或 Workspace nesting。

## 3. 形态合同

- Frame 自身后退，成员物种保持第一视觉层；
- 不使用厚重 dashboard panel、统一 card header 或大面积 glass；
- label 是 screen-space overlay，不占 layout；
- selected 时显示边界与 handles，rest 时只保留最低限度分组边界；
- nested label 碰撞遵循 current visibility/hysteresis，不新增第二套避让；
- layout mode/status 只在选中 toolbar 渐进披露。

## 4. 状态合同

| 状态 | Frame | members | 约束 |
|---|---|---|---|
| rest | 低对比分组边界 + label | 完整 species body | Frame 不抢视觉 |
| hover | 边界轻提升 | 不变 | 不自动显示布局配置 |
| selected | screen-space outline/handles + toolbar | 不变 | label edit 与 selection 分离 |
| label-editing | label input active | 不变 | Frame selection 暂停；Enter commit/Esc revert |
| receptive | `PROPOSED` frame boundary + target interior cue | dragged member 保持身份 | 与普通 selected 区分 |
| reject | 原边界 | member 回原位 | 明确 locked/cycle/nesting 原因 |
| resizing | frame 连续变化 | direct children proportional preview | rAF coalesced、同一 undo |
| layout-changing | toolbar mode/count | solver 预览/提交 | 不复用旧轴 count 强制重排 |
| missing | MissingFileBanner | 不允许写入 | 仅适用于 sidecar/content contract |
| locked | 清晰锁定边界 | 不能接收成员/resize | 不靠颜色 alone |

## 5. Resize / layout contract

```text
resize start
→ capture direct-child geometry snapshot
→ each paint: reuse Huabu applyFrameResizeScale
→ free keeps scaled positions
→ column/row/grid reuse existing solver repack
→ resize end flush trailing rAF tick
→ one geometry commit / one undo snapshot
```

- 不新建 LCOS auto-layout engine；
- structured layout mode 切换不携带旧 `gridCount/gridRowCount`，由当前成员位置重新推导；
- grid row count 是 floor，实际行数可更高；
- hug frame deepest-first fit，祖先随后 relayout；
- manual frame 不被 end-of-batch fit 静默改尺寸；
- 自动排布仍必须遵守“先预览后确认”，不得覆盖用户稳定锚点。

## 6. Membership / unframe contract

- frameNodes 保持成员绝对视觉位置，仅转换成 parent-local position；
- unframe 后成员回到上级或 root，视觉位置保持；
- 与 Frame 相连的 edges 在 current unframe 中会被移除；LCOS 迁移前必须确认关系边是否属于 canonical Relation，不能照搬删除语义；
- overlap 自动吸收默认以候选节点面积 `≥50%` 为门槛；pointer-owned target 优先；
- locked、cycle、非法 nesting 复用现有 validation；
- Node/Artifact membership 与 derived visual grouping 不得混淆。

## 7. LOD 与 label

Frame 不需要 generic minimal body。沿用 current label overlay：

```text
frame body → members remain species-aware
label width <48 screen px → may hide
instruction label floor =112 screen px
nested vertical collision boundary =22px with ±4px hysteresis
```

远距离性能按全局节点密度策略简化成员/聚合；不能把 Frame 自己替换成 folder glyph。collapsed Collection 另行使用 member-stack donor。

## 8. Persistence / owner

| 数据 | Owner | 规则 |
|---|---|---|
| parentId/membership | canonical projection adapter | transactionally update |
| layoutMode/gridCount/gridRowCount/sizing | frame data | current engine validation |
| geometry | projection | resize/drag preview 后 batch persist |
| label | Frame view metadata | rename 走既有 intent |
| child content | each child Artifact | Frame 不拥有/复制正文 |
| undo | existing command history | one gesture one snapshot |

`.creative-os` 仍只由 Local Core 写入。T5 不直接持久化 Frame truth。

## 9. Browser acceptance

1. 多物种成员 Frame 中，成员比 Frame chrome 更醒目；
2. create frame 保持成员绝对位置，minimum `240×160`；
3. overlap `<50%/≥50%` 边界行为正确，locked/cycle 被拒；
4. free/column/row/grid 均复用 current solver；
5. resize 连续、成员比例正确、trailing tick 不跳、一次 undo 完整恢复；
6. hug/manual owner 不互相偷写；
7. layout mode 切换不错误复用上一轴 track count；
8. unframe 后成员位置保持；canonical Relation 不得未经 adapter 决策被删除；
9. label edit Enter/Esc 正确，overlay 不进入布局；
10. nested labels 在 `22±4px` 处无闪烁；
11. zoom out 不变成 generic folder；
12. viewport/resize 不触发无关全图业务重渲染。

## 10. Card verdict

```text
DESIGN READY
DIRECT USE HUABU FRAME ENGINE
OPEN: LCOS canonical Relation behavior on unframe
NOT COVERED: collapsed Collection / Colony / Workspace nesting
```

