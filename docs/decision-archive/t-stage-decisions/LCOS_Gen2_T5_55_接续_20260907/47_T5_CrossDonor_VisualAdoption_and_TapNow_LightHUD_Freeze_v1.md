# 47 · T5 Cross-Donor Visual Adoption & TapNow Light HUD Freeze v1

> 日期：2026-09-07  
> Owner：T5 · Final Morphology / Visual Adoption  
> 状态：`SUPERSEDED / DO NOT MERGE`  
> 基线：`LCOS_Gen2/main@232b2ca5` + `Huabu@a3c411e1f655191344285141f08c4738fa6015f7`

> **2026-09-07 纠正**：本稿错误地把用户已冻结的“直接采用 donor UX”降级成了“抽象 token 后由 T5 再设计”，并误把 Lovart 首页的多来源素材选择器替换成普通 Preview Gallery。不得作为施工输入。修订稿必须直接采用 TapNow 的真实 `title → upper toolbar → body → lower GenerationInputBar` 组合，以及 Lovart 首页的 `left chat → right multi-source selectable masonry` 组合。

## 0. 本轮冻结结论

LCOS Gen2 不再自研一套孤立 HUD 材质，也不让某一个 donor 覆盖整机。最终采用以下职责分工：

| 视觉职责 | 主 donor | LCOS 采用方式 | 不得越界 |
|---|---|---|---|
| Canvas geometry、viewport、selection owner、resize/hit zone | Huabu | 当前源码直接复用或薄接线 | 不让第三方再建一套 canvas/selection runtime |
| Focus、对象原位晋升、LOD gate、Preview 返回连续性 | Spatial | 复刻已验证机制，接入 LCOS canonical projection | 不把 Spatial 私有 AppKit 实现冒充可复制源码 |
| Assembly / Preview 内容排布 | Lovart | shortest-column / virtual masonry + fixed skeleton slot | 不采用 Lovart 的产品语义、身份或返回链 |
| Menu、Popover、Tooltip、Dialog、Tabs、Select、Slider、Switch、ColorPicker 等组件器官 | LibTV 暴露的成熟开源上游 | 从 Ant Design / Headless UI / Floating UI 官方包采用，外包 LCOS thin wrapper | 不复制 LibTV 商业 bundle，不引入第二套 React Flow |
| 全局 screen-space HUD 材质、控件密度、局部反馈 | TapNow | 提炼 token、比例与状态关系，转译为浅色 LCOS skin | 不把 TapNow 暗色值机械反相；不套到 world-space node body |
| 物种自身 motion | TapNow + Spatial，按状态分工 | TapNow 给局部 HUD 微反馈；Spatial 给空间连续运动 | 不堆叠两套持续动画，不让 idle canvas 变吵 |

一句话：

> Huabu 管机械，Spatial 管空间连续性，Lovart 管内容排布，LibTV 的开源上游管组件器官，TapNow 管 HUD 材质与局部触感；T5 只做统一视觉转译，不改 canonical object 语义。

## 1. TapNow → LCOS Light HUD

### 1.1 应用范围

TapNow 浅色材质只应用于 **screen-space HUD family**：

- object-local toolbar；
- contextual menu / popover / tooltip；
- Compact Composer；
- Action Arc；
- Railway / SurfaceDock；
- navigation HUD / pager / zoom controls；
- Preview header controls / bottom action strip；
- transient search / filter / mode controls。

明确不应用于：

- Image、PDF、PPTX、DOCX、MD、Text、Audio 等 world-space body；
- Collection / Colony / Scope 的 intrinsic morphology；
- Run / Result 的 canonical body；
- selection geometry 与 resize mechanics；
- Professional Window 的内容区。

### 1.2 材质转译原则

TapNow 的价值不是 `#292929` 或 `#2F2F2F`，而是层级关系：低不透明表面、细边界、内侧高光、克制外阴影、局部 blur、紧凑圆角与小幅状态变化。

LCOS Light HUD 使用语义 token，不直接反相暗色：

| TapNow 暗色语义 | LCOS 浅色语义 | 冻结要求 |
|---|---|---|
| `bg-popover/80` / `#292929` / `#2F2F2F` | `--hud-surface`：暖白半透明表面 | 与浅色 Canvas 分层，但不成为实心白塑料块 |
| `border white/10` | `--hud-border`：深色低 alpha hairline | 只提供边缘定义，不形成粗灰框 |
| inset white highlight | `--hud-inner-highlight`：顶部/内侧白色高光 | 0.5–1px，避免整圈发亮 |
| `0 4px 16px rgba(0,0,0,.16)` | `--hud-shadow`：中性、软、短程阴影 | Focus/悬浮时存在，Rest 不做厚投影 |
| `backdrop-blur-lg` / 28px | `--hud-blur`：按背景复杂度分级 | 只在浮层下方确有内容时启用；性能降级时先减 blur/shadow |
| `white/5` hover | `--hud-hover-fill`：黑色低 alpha 或浅中性色叠层 | 不改变 layout，不产生大色块 |
| `white/10` active | `--hud-active-fill`：比 hover 高一级 | pressed 应短促、可逆、无弹跳位移 |
| `#90C4E5` accent | `--hud-accent`：LCOS 系统 accent | 仅用于 active/attention，不铺满整条 HUD |

最终颜色数值允许在 HTML 校准时微调；上表的语义层级与适用边界已冻结。

### 1.3 四个 LCOS HUD primitives

#### A. `HudPill`

- 外高 `48px`；
- 内 padding `4px`；
- action cell 高 `40px`；
- action gap `4px`；
- group 内 gap `2px`；
- divider `1×18px`；
- target offset `12px`；
- 胶囊圆角；
- 只存在于 screen-space，不参与 node bounds、自动布局或持久化 geometry。

#### B. `HudMenu`

- 主圆角 `16px`；
- 容器 padding `4px`；
- item gap `10px`；
- item 圆角 `6px`；
- item padding `6px 8px 6px 12px`；
- 默认 `min-width: 220px`；
- trigger side offset `8px`；
- hover/keyboard-highlight 共用同一弱填充；
- 保留 Headless UI / Floating UI 的 focus、collision、flip、dismiss 机制。

#### C. `HudPager`

- 贴近内容底部，默认离底 `16px`；
- padding `8px`、gap `12px`；
- button `24×24px`，icon `14px`；
- divider `1×16px`；
- Rest 隐藏，hover/focus/keyboard interaction 时显现；
- `opacity` 过渡约 `200ms`，不做位移型炫技。

#### D. `HudActionStrip`

- `padding: 10px 12px`；
- action gap `8px`；
- 顶部只保留极弱 hairline；
- 普通 action 圆角 `6px`；
- more trigger `32×32px`，icon `16px / 1.5 stroke`；
- 是 Preview / Assembly 的局部动作层，不常驻 Canvas。

### 1.4 屏幕空间与世界空间边界

```text
canonical node geometry
  └─ world-space body / title rail
       └─ visual bounds
            └─ screen-space selection / HUD anchor
                 ├─ HudPill
                 ├─ HudMenu
                 ├─ HudPager
                 └─ HudActionStrip
```

- HUD 使用 inverse-scale 或 viewport projection 保持可点击尺寸；
- TapNow 已验证的 toolbar offset 模型为 `min(48 × 1/zoom, 60)`，LCOS 可复写该算法思想；
- HUD 随 drag 暂隐，避免漂浮控件与节点本体不同步；
- node title、filename identity 可以有 screen-space readable projection，但它不等同于全局 HUD；
- selection 仍由 Huabu owner 派生真实 visual bounds。

## 2. Lovart → Assembly / Preview Masonry

### 2.1 冻结的排布模型

Assembly 与多对象 Preview 采用：

```text
resolve stable item keys
→ reserve fixed skeleton footprints
→ ResizeObserver measures content ratio
→ shortest-column placement
→ same-slot content crossfade/materialize
→ local selection/actions
```

关键规则：

- 默认列间距、行间距均从 `12px` 开始校准；
- 小型 Assembly / Preview 使用轻量 shortest-column；
- 大型 Preview / history 使用虚拟化 masonry，`overscanBy` 从 `2–3` 起；
- 测量变化小于约 `2%` 不触发重排，减少瀑布流抖动；
- skeleton 先占最终 footprint，结果出现时同槽填充；
- 多选只改变内容局部选择态与动作条，不出现整格浅蓝背景；
- 关闭 Preview 的 canonical return 继续由 Spatial / LCOS 投影链负责。

### 2.2 不能照搬的部分

- Lovart 的业务动作文案、生成状态和 selection owner；
- 商业 bundle 中的 minified 实现；
- Lovart 未被证实的返回画布机制；
- 任何改变 LCOS Assembly Source Bay / Target routing 语义的布局推断。

## 3. LibTV → 成熟组件器官

LibTV 用作“哪些成熟组件组合经过产品验证”的证据，不作为源码供应商。代码从对应官方开源上游获取：

| LCOS 组件 | 成熟上游 | 接入方式 |
|---|---|---|
| Menu / Dropdown / Tooltip / ColorPicker / Select / Slider / Switch / Checkbox / Input | Ant Design primitives | 复用行为与 accessibility，使用 LCOS token/theme，外包薄 facade |
| focus-visible、menu state、Dialog/Popover state | Headless UI | 直接采用状态与 keyboard primitive，视觉全部交给 T5 token |
| anchor、collision、flip、shift、dismiss | Floating UI | 直接采用定位 primitive，消费 T1/T4 safeRect 与 occupiedRects |
| Canvas node/edge/port | Huabu current | 不采用 LibTV 的 React Flow runtime |

LCOS thin wrapper 只负责：

- 统一 token 与密度；
- LCOS icon family；
- shortcut / Esc hierarchy；
- canonical owner adapter；
- safeRect / occupiedRects；
- reduced-motion 与 accessibility；
- telemetry-free 本地行为。

## 4. Motion 分工

### TapNow：局部反馈

- toolbar/menu hover 与 pressed；
- popover 从 trigger 处出现；
- action strip / pager 的显隐；
- ResultSlot 的局部 materialization；
- 建议基线：hover `120–150ms`，popover/pager `180–200ms`。

### Spatial：空间连续性

- Focus 目标与背景层级变化；
- canvas object → Preview / immersive projection；
- close / Esc 返回原画布位置；
- zoom raster gate、LOD hysteresis；
- canonical / visual / presented 三矩形模型；
- resize snap 状态迟滞。

### Lovart：排布稳定性

- fixed footprint skeleton；
- same-slot crossfade；
- masonry 局部重排；
- sheet/dialog 局部进入，不接管 canonical return。

不得同时在一次状态变化中叠加大位移、scale、blur 与 glow。持续动效只留给 Active Run 或当前明确目标；idle canvas 保持安静。

## 5. 源码与证据索引

### 5.1 TapNow

商业 bundle，只作结构、参数与行为证据；不得直接复制：

- `C:\Users\1\Desktop\施工前最后一轮校准\tapnow_拆包_20260904.zip::tapnow_raw/assets/vendor-pkg-canvas-CI-o9b4X.js`
  - `CAe / Wq`：node toolbar，约 byte `894903 / 896652`；
  - `NAe`：more popover，约 byte `896652` 后；
  - `HAe`：toolbar zoom compensation，约 byte `917738`；
  - `K0e`：image pager，约 byte `536751`；
  - `y8e` 与 composer constants，约 byte `1534227`；
  - `n6e / N6e`：Artifact/Preview HUD，约 byte `1914413 / 1925027`；
  - `Gq / gAe / xAe / Hq`：world-space title rail，约 byte `890283`。
- `C:\Users\1\Desktop\施工前最后一轮校准\tapnow_拆包_20260904.zip::tapnow_raw/assets/vendor-pkg-canvas-CHU-0IGm.css`
  - React Flow selected outline，约 byte `19872`；
  - selected resize hit target `24×24`，约 byte `20644`。
- `C:\Users\1\Desktop\施工前最后一轮校准\tapnow_拆包_20260904.zip::tapnow_raw/assets/index-Be46UKZu.css`
  - `:root` semantic token set，约 byte `628069`；
  - 存在少量浅色品牌 token，但没有可确认的完整浅色 Canvas/HUD skin。

### 5.2 Lovart

- `C:\Users\1\Desktop\施工前最后一轮校准\lovart_拆包_20260904.zip::lovart_canvas_20260904/js/common-5.1af173f5.js`
  - `t6`：Masonry；
  - `t4`：ResizeObserver measure；
  - props：`items / columnCount / columnGap / rowGap / renderItem / keyExtractor / aspectRatio / leadingSlot / cacheNamespace`。
- 同 zip：`lovart_raw/chunks/2tb62f92k3bwo.js`
  - Preview portal + ScrollArea + Masonry；
  - `columnGap:12 / rowGap:12`；
  - local selection 与 bottom action bar。
- 同 zip：`lovart_raw/chunks/19v2fcfmi6sy6.js`
  - virtual masonry；
  - `itemHeightEstimate=300`；
  - `overscanBy=2`，Lovart wrapper 使用 `3`；
  - stable MasonryLoading skeleton。
- `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\lovart_布局与动效规范_20260904.md`
- `C:\Users\1\Desktop\Gen2开发\Library补充\LCOS_v015_Lovart_Trae_TapNow_交互与动效拆解_20260830.md`

### 5.3 LibTV

- `C:\Users\1\Desktop\施工前最后一轮校准\libtv_拆包_20260904.zip::inflated/0j4789ye3y9ym.js`
  - Ant Design Menu / Dropdown / Tooltip / ColorPicker 与 token/motion 证据。
- 同 zip：`inflated/1ejf8x857fig6.js`
  - Headless UI focus/menu state；
  - Floating UI positioning/focus 证据。
- 同 zip：`inflated/0x2hz57n8pxm6.js`
  - SkillPanel、双入口、StoryboardGroup 等产品组合证据。
- 同 zip：`inflated/3pi7g2wjxur9o.js`
  - React Flow edge/reconnect 证据；LCOS 不采用该 runtime。
- `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\libtv_画布与双入口逆向拆解_20260904.md`

### 5.4 Spatial / Huabu

- `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\spatial-macos\README_Spatial拆解_20260903.md`
- `C:\Users\1\Desktop\Gen2开发\源码参考_20260903\spatial-macos\README_Spatial_交互拆解_20260903.md`
- `C:\Users\1\Desktop\接续包\LCOS_Gen2_T5_55_接续_20260907\42_T1_Huabu_Gen1_Spatial_Granularity_Recovery_v1.md`
- `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Nodes\NodeWrapper.tsx`
- `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Panels\Canvas\SelectionOutlines.tsx`
- `E:\OS开发\LCOS_Gen2\huabu\apps\web\src\components\Panels\PreviewWorkspace`

## 6. 许可与 provenance

- TapNow、Lovart、LibTV Web 拆包均为商业 bundle，且未发现可授予直接复制权的对应 LICENSE；只作行为、结构、比例和手感证据。
- LibTV 暴露的 Ant Design / Headless UI / Floating UI 应从官方开源包按锁定版本引入并登记各自许可证。
- 本地 `libtv-skills` 的 MIT 许可只覆盖 skills，不覆盖 LibTV Web 视觉组件。
- Spatial 证据主要来自二进制符号、数据模型、字符串与录屏；不得把推断写成 Swift 源码事实。

## 7. HTML 校准顺序

后续独立 HTML 不一次造完整产品，只校准以下五个可见断面：

1. light `HudPill`：Rest / hover / pressed；
2. light `HudMenu`：trigger-grown / keyboard focus / nested popover；
3. Lovart masonry：skeleton → same-slot materialize → local selection；
4. Preview：masonry body + `HudActionStrip` + Spatial-style close return；
5. safeRect collision：HUD 在 Work View / Inspector 占位后重新定位。

用户确认一次后，数值回填本文件并提升为 `VISUAL FROZEN / CONSTRUCTION READY`。

## 8. 验收条件

- 浅色 HUD 第一眼仍能看出 TapNow 的层级、密度和克制触感，但不是黑色材质反相；
- HUD 与 world-space node body 明确属于两层；
- Assembly / Preview 在异尺寸内容下不跳列、不漂移、不先出现错误高度；
- 选中不产生整格浅蓝 wash；
- Popover、toolbar、pager 在 zoom 后保持屏幕可点击尺寸；
- Work View / Inspector 打开时 HUD 消费 shared safeRect，不遮挡内容；
- 关闭 Preview 返回原对象，identity 与阅读位置连续；
- 代码层没有复制 TapNow/Lovart/LibTV 商业 bundle；
- 不引入第二 Canvas/React Flow runtime；
- reduced-motion 与性能降级路径成立。

## 9. 当前 OPEN

- `--hud-surface / border / shadow / blur / accent` 的最终浅色数值需经下一轮 HTML 快速校准；
- Assembly 每种宽度对应的 columnCount 由 T1 geometry/safeRect 输入后落定；
- 大列表虚拟化库最终选型需在施工时基于当前依赖树确认，优先复用已有依赖，不为此新造轮子；
- Lovart masonry 只决定内容排布，不决定 Assembly 业务路由；如上游语义冲突，回报 T3/T4，不由 T5 裁决。
