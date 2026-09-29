# iOS 26 Donor Classification v1

## 原件

`C:\Users\1\Desktop\Gen2开发\思路参考_施工规划_仅供借鉴_20260903\参考源合并\苹果mac设计套件_ios26-design-system_源码合并版.md`

合并稿声明包含 141 个文件：token、36 个组件规格、48 个页面模板及多平台实现。

## 分类结论

```text
iOS 26 donor
= MICROINTERACTION_DONOR
+ CONTROL_MATERIAL_DONOR
+ ACCESSIBILITY / REDUCED_MOTION_REFERENCE

≠ NODE_MORPHOLOGY_AUTHORITY
≠ CANVAS_LAYOUT_AUTHORITY
≠ LCOS DOMAIN AUTHORITY
```

它适合回答浮动控制、Popover、菜单、按钮、工具条如何有成熟质感；不适合决定 Image/PDF/Text/Collection/Glyth 节点本体长什么样。

## Phase 1 可消费范围

### Selection / local control chrome

- small floating controls；
- contextual menu / popover；
- toolbar grouping；
- pressed / hover / dismiss motion；
- light/dark parity；
- focus 与 accessibility。

### Material

原件明确规定 Liquid Glass 只用于内容上方的 floating navigation/control layer：toolbar、tab bar、floating control、sheet chrome。

禁止：

- 内容节点大面积玻璃化；
- 把玻璃当 Canvas 背景；
- glass-on-glass；
- 让材质优先级超过真实文件内容。

这与 LCOS 的视觉优先级一致：文件内容优先，材质只服务控制层。

## 可用 token 入口

### Motion

`packages/tokens/src/animations.json`：

- micro 100ms；
- fast 200ms；
- normal 300ms；
- context menu open/close 250/150ms；
- liquid glass morph 350ms；
- reduced motion crossfade 200ms。

这些是 donor 的通用校准值，不自动覆盖 Spatial 逐帧得到的 object choreography。

### Spring presets

```text
snappy  response .3 / damping .8 / bounce .15
bouncy  response .5 / damping .65 / bounce .3
gentle  response .55 / damping .825 / bounce 0
stiff   response .25 / damping 1 / bounce 0
```

Phase 1 默认偏 `gentle/stiff`；Spatial 原视频未显示明显 overshoot，不能因为 iOS 有 snappy/bouncy 就给节点本体加弹跳。

### Materials

`packages/tokens/src/materials.json` 明确声明 web 数值是近似值，Apple 没有发布 Liquid Glass 的精确数值。

可作为浏览器初始校准：

```text
small frost   7px
medium frost 12px
large frost  14px
```

但这不是 Apple 原生精确实现，证据等级必须写 `DONOR_APPROXIMATION`。

### Spacing

`packages/tokens/src/spacing.json` 使用 8pt 基线，包含 4/8/12/16/20/24/32/40/48/64 等尺度，可供 control chrome 对齐；不得强行覆盖 Spatial 内容节点的 intrinsic proportions。

## 与 Spatial 的分工

| 问题 | Authority |
|---|---|
| 内容节点长什么样 | Spatial + Huabu native renderer |
| 节点怎么打开、邻居怎么让位 | Spatial |
| local toolbar / menu / popover 材质 | iOS 26 + Huabu primitives |
| LCOS 状态语义 | T1/T3/T6 frozen truth |
| 节点 mechanics | Huabu |
| Glyth presence | Grok / Bloub |

## Reduced motion

iOS donor 建议：关闭 push/pop/scale/parallax 与 backdrop-filter 动画，保留 opacity crossfade。LCOS 接入时应进一步：

- Spatial focus/reflow 改为短 crossfade + immediate layout；
- Glyth 停止 trick、particle、spin，保留静态 state face；
- local overlay 以 150–200ms opacity 出入；
- 不让 reduced-motion 改变状态含义或可操作性。

## 当前裁决

```text
Phase 1 control chrome calibration = GO
Node body authority              = REJECT
Large-area glass                 = REJECT
Exact Apple material claim       = REJECT
Reduced-motion reference         = GO
```

这包值得用，但位置要摆正。把它拿来磨控制层会很省力；拿它决定节点 morphology，只会把 LCOS 做成一块到处冒玻璃的 iPad 设置页。

