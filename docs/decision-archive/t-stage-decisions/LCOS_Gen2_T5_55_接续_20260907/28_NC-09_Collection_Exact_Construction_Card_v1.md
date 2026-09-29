# NC-09 Collection — Exact Construction Card v1

## 0. 卡片状态

```text
Huabu baseline: a3c411e1f655191344285141f08c4738fa6015f7
Species: Collection / Scope container
Card status: PARTIAL READY
Expanded mechanics: DIRECT USE Huabu Frame
Collapsed morphology: LIFT Gen1 CollectionStackSheet behavior + latest Huabu member identities
Rewrite posture: NO new layout engine / no generic folder card
```

## 1. Authority split

```text
LCOS Scope + membership = canonical truth
Huabu Frame = expanded spatial mechanics
LCOS Gen1 a24 = primary interaction/experience authority
Spatial v3/v4 = morphology corroboration
existing Huabu species previews = stack layers
```

Collection不是Frame的别名。Frame负责expanded mechanics；Gen1后期Collection负责“当前画布原地展开/收起、避障扇出、稳定reopen”的体验下限；collapsed face是同一Scope的压缩投影。

## 2. 可直接复用

- Huabu Frame 的 free/column/row/grid；
- hug/manual sizing；
- fit、nested ancestors relayout、overlap membership；
- proportional resize、rAF batching、single undo snapshot；
- zoom-invariant label；
- Image/PDF/Web/Note/Video 等现有 species bodies/previews；
- LCOS Scope/containerViewId 作为 canonical container identity。

不新增 Collection layout store、membership engine、thumbnail generator 或 selection owner。

## 3. Expanded face

沿用 `NC-06 Frame`：成员本体是视觉主体，容器后退。Collection label/count 只在必要时以 overlay 呈现。

```text
expanded Collection
→ Huabu Frame host
→ children retain species renderer
→ LCOS Scope adapter supplies canonical membership
```

## 4. Collapsed face

Spatial v3/v4与Gen1 `CollectionObject/CollectionStackSheet`共同确认collapsed Collection由真实成员preview形成叠层。Gen1已有最多3层、图片thumbnail与file identity回退，应LIFT该行为而不是重做。

### 组成方式

```text
back layers: 1–2 existing member thumbnail projections
front layer: membership stable order中的第一代表成员
count: compact screen-space label
species cue: preserved from member bodies
```

这不是新渲染引擎。实现应调用或抽取 Huabu 已有 lightweight preview/identity renderer，并由一个薄 Collection projection 组合；不复制 Image/PDF/Web 等 renderer。

### Representative selection

第一版严格复刻Gen1：按既有membership稳定顺序取前3个普通成员；scope/workspace entity refs不进入视觉stack。pin/recent优先级属于未来产品增强，不在复刻阶段自行加入。

## 5. 状态合同

| 状态 | collapsed | expanded | 规则 |
|---|---|---|---|
| rest | member stack + count | Frame + members | 同一 Scope id |
| hover | 层间距轻展开（可选） | Frame hover | 不触发完整 layout |
| selected | stack outline | Frame selection | screen-space chrome |
| receptive | target boundary + insertion cue | Frame drop target | membership 尚未提交 |
| reject | stack/Frame 不变 + 原因 | 同左 | locked/cycle/scope conflict |
| opening | stack layers 对齐成员位置 | Frame 展开 | 同一 Scope，不复制成员 |
| closing | members 汇入代表层 | stack | 不改变 membership |
| stale/missing member | 对应 layer 显示状态 | member 自己显示 | Collection 只聚合计数，不吞掉成员错误 |
| pending-review | 受影响成员/Scope cue | members/Return Zone | 不把 Collection 变成 Run owner |

## 6. Gen1 open/close choreography（必须复刻）

```text
collapsed stack
→ obstacle-aware layout计算并提交真实expanded positions
→ transient fold transform从container内展开
→ 两个rAF后清除opening phase

close
→ members保持mounted并折回container的.56/.52目标点
→ 240ms后隐藏expanded projection
→ committed expanded positions与membership保留
→ reopen稳定回到原展开位置
```

优先复用Huabu Frame/viewport primitives；LIFT Gen1 pure `collectionExpandLayout`与transient choreography，不迁移Gen1 Canvas runtime。Collection默认在当前画布原地展开，不进入第二Canvas。

Gen1布局下限：2–9成员右侧多列扇出（42/24/30px gaps）；10+ balanced grid；16+最多5列；整个block避开无关障碍。Huabu solver已覆盖的部分采用上游，不保留重复算法。

精确 duration/easing 仍待视频时间轴测量；未经验证不冻结 `250/550ms`。Reduced motion 使用短 crossfade + instant camera settle。

## 7. LOD 与性能

- expanded 状态沿用全局 Huabu node density/LOD；
- collapsed face 最多渲染 3 个轻量 member layers；
- 不挂 member Milkdown、PDF.js、iframe 或 video；
- 其余成员只计数，不逐项 mount；
- representative list memoized by membership/version；
- 300+ 总览时可只保留 stack silhouette/count，但仍不是 generic folder icon。

## 8. 未闭合语义

1. collapsed Collection 左拖一个成员后，source stack 是移除、保留 proxy 还是 explicit additional reference；
2. Gen1已确定默认open/close不改变Workspace/Scope navigation；Gen2只需确认是否保留额外“打开Scope”入口；
3. Gen1已确定collapsed时保留committed expanded geometry；Gen2需确定正式持久化字段；
4. relation 展示连接 Scope 还是成员；
5. Collection delete/archive 对 membership 的影响。

这些必须由 LCOS product/domain 决定，不能由视觉实现猜测。

## 9. Browser acceptance

1. expanded复用Frame mechanics与Gen1 pure fan-out policy，无第二Canvas/layout owner；
2. collapsed 显示1–3个真实成员 identity，不是 folder glyph；
3. 100成员 Collection collapsed 不挂100个重 renderer；
4. 按membership稳定顺序取前3个，rerender不变化；
5. 当前画布原地open/close，保持Scope id、membership、member identity；
6. selection/receptive/reject 不只靠颜色；
7. missing/stale member 不被 Collection 聚合吞掉；
8. reduced motion 与 camera settle 可用；
9. 2–9扇出与10+balanced grid不重叠并避障；
10. close 240ms内成员保持mounted，reopen位置稳定；
11. 未冻结的左拖source outcome不得施工；
12. delete ArtifactView不删除Artifact/Relation。

## 10. Card verdict

```text
EXPANDED = DESIGN READY / DIRECT USE HUABU FRAME
COLLAPSED BODY = GEN1/SPATIAL EXPERIENCE RECOVERED
OPEN/CLOSE/FAN-OUT = GEN1 EXPERIENCE REQUIRED
INTERACTION SEMANTICS = HOLD ON REMAINING PRODUCT DECISIONS
NEW COLLECTION ENGINE = REJECTED
```
