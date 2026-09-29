# Gen1 Collection Experience Recovery v1

## 来源与结论

```text
Repository: DZWFLi/LCOS-local-creativeOS
Branch: a24-to-phasea-20260901
Evidence: source + tests
```

Gen1 后期 Collection 的体验已经收敛为：durable aggregate identity在当前画布原地展开，真实成员投影避障扇出，再原地折回 member stack。它不克隆成员 View、不进入第二 Canvas，也不改 canonical membership。

## 已确认源码

- `features/canvas/collectionExpandLayout.ts`
- `features/canvas/CanvasNodeVisual.tsx`
- `features/canvas/ProjectCanvas.tsx`
- `state/canvasScopes.ts`
- `tests/collectionExpandLayout.test.ts`
- `tests/canvasScopes.test.ts`

## Collapsed body

Gen1 `CollectionObject` 已实现：

- 按既有 membership 顺序取前3个普通成员生成 stack sheets；
- sheet 保留成员 file identity；有图片 preview 时显示真实 thumbnail；
- 无成员时保留两层空 stack silhouette；
- 显示 Collection、item count、title、glyph 与展开/收起状态；
- revision count >1时显示最多3个 version beads；
- scope/workspace entity members在expanded时可作为inline入口。

因此Gen2应LIFT `CollectionStackSheet` 行为，再把sheet body接到最新Huabu species identity seam，而不是重新设计collapsed renderer。

## Expand layout

### 2–9 members

```text
gapX = 42
gapY = 24
columnGap = 30
maxColumns = 4
maxColumnHeight = max(560, container.height × 3.2)
initial origin = collection right side
```

成员按与container Y距离、Y、X稳定排序；遇成员或外部障碍时向下避让，必要时换列。

### 10+ members

```text
columns = clamp(ceil(sqrt(count)), 3, maxColumns)
maxColumns = count >16 ? 5 : 4
gapX = max(26, columnGap)
gapY = 24
```

使用balanced grid，先算每列最大宽、每行最大高，再为整个block选择避开外部障碍的候选origin：右侧、右侧上移、右下、下方、左侧。它专门避免10+成员退化成一列长蛇。

## Motion truth

### Open

1. 计算并提交expanded member positions；
2. Collection进入expanded/opening；
3. 成员用transient fold transform从container内展开；
4. 两个`requestAnimationFrame`后移除opening phase；
5. 假launch coordinates不写Presentation state。

### Close

1. 成员继续mounted；
2. 视觉折回container内：`x + width×.56`、`y + height×.52`；
3. `240ms`后隐藏expanded projection；
4. committed expanded coordinates保留，reopen稳定；
5. membership与Project Truth不变。

## Aggregate identity

Gen1后期`createAggregateScopeEntity`只创建durable aggregate identity与canvas proxy：

- 不把member Views clone进Scope；
- membership由Presentation保存，可引用不同物理Scope中的Project Entity；
- 默认proxy为`250×146`；
- 默认语义是“原地展开/收起”。

早期`createChildScopeFromSelection`的“复制Views进入子画布”属于旧路径，不作为Gen2 Collection默认体验迁移。

## 与最新Huabu合并

| Gen1体验 | 最新Huabu能力 | 裁决 |
|---|---|---|
| member stack | species bodies/previews | LIFT stack policy，复用lightweight identity |
| 原地开合 | Frame/NodeWrapper/viewport | 复用mechanics，接transient choreography |
| obstacle-aware fan-out | Frame/layout primitives | 能覆盖则DIRECT USE；独特pure policy才LIFT |
| 稳定expanded positions | geometry persistence | 只写ArtifactView projection |
| aggregate identity | LCOS Scope | 不造Artifact/成员副本 |

## 必须复刻的体验验收

1. 当前画布原地展开/收起，不导航到第二Canvas；
2. collapsed最多3个真实member sheets；
3. 2–9成员可读扇出，不重叠；
4. 10+成员balanced grid，不成长蛇；
5. 整个expanded block避开无关障碍；
6. opening launch transform不写canonical坐标；
7. close保持成员mounted至240ms结束；
8. reopen回到稳定expanded positions；
9. membership不变、member View不clone、Relation不改写；
10. reduced motion跳过fold，仅crossfade/instant settle；
11. 大Collection collapsed不挂全部heavy renderers。

## 不复刻

- 旧generic folder skin；
- Gen1 Canvas/pointer/selection owner；
- 早期复制Views进入子画布；
- local component state作为durable membership；
- 删除/复制Artifact模拟收纳。

