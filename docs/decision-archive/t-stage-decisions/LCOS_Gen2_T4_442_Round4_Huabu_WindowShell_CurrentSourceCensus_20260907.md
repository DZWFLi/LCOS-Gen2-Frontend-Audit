# LCOS Gen2 · T4「442」Round 4
# Huabu Window / Shell Current Source Census

> **基线更正（2026-09-07）**：当前基线为 `LCOS_Gen2/main@232b2ca5...` + vendored Huabu `a3c411e1...`。本报告最初在 parent `c2ff890a...` 上普查；经 diff 核对，本文涉及的 `WindowChrome`、`MainLayout`、`panelStore`、`previewWorkspace/*` 与 `PreviewWorkspace/*` 在两个版本间无内容差异，结论可继承。vendor 对齐以报告 39 为准。

> 日期：2026-09-07  
> 状态：`GITHUB_EXACT_SOURCE_CENSUS / NO PRODUCTION PATCH`  
> Repository：`DZWFLi/LCOS_Gen2`  
> Branch：`main`  
> Exact SHA：`c2ff890a867922a1256572199458438572eb0a8c`

## 0. 结论

Huabu current source 中没有现成的统一 Professional Window Manager。

已经找到三层容易被误认成 Window owner 的实现：

```text
Electron WindowChrome
→ 整个桌面应用的原生标题栏壳

MainLayout + panelStore
→ 固定 Left / Canvas / Right 三栏与 collapse / resize / fullscreen

PreviewWorkspace
→ 固定右栏内部的 tabbed + two-group horizontal split preview surface
```

其中 `PreviewWorkspace` 有真实可复用的窗口内部 mechanics，但三者都不拥有 V2 要求的完整 Professional Window 生命周期：

```text
Float
Dock
Undock
Move
arbitrary N professional regions
horizontal / vertical composition
independent close / restore
public occupiedRects / safeRect environment
```

因此：

```text
CANONICAL_PROFESSIONAL_WINDOW_OWNER = NOT_FOUND_IN_CURRENT_SOURCE

PreviewWorkspace = KEEP_AS_MECHANICS_DONOR
MainLayout       = LEGACY/FIXED_HOST_TO_ADAPT
panelStore       = LEGACY_PRESENTATION_STATE_TO_MIGRATE_OR_WRAP
WindowChrome     = NOT_RELEVANT_TO_PROFESSIONAL_WINDOW_LIFECYCLE
ExpandedNodePanel= PREVIEW_BODY / CONSUMER, NOT WINDOW OWNER
```

这不等于立即批准引入 Dockview 或重写 App Shell。按照当前项目规则，统一 Professional Window 属重大用户流程与布局架构变更，进入实现前仍需先提交影响说明、前后流程图、数据流、成本、风险、验收与回滚方案。

---

## 1. Source baseline

GitHub API 实际核验：

```text
repo    DZWFLi/LCOS_Gen2
branch  main
SHA     c2ff890a867922a1256572199458438572eb0a8c
date    2026-09-03T04:02:41Z
```

该 SHA 与「442」前序记录一致。

`huabu/apps/web/package.json` 当前依赖包含：

- React 19；
- React Router；
- Zustand；
- dnd-kit；
- Floating UI；
- XYFlow；
- motion。

没有 Dockview 依赖，也没有其它显式通用 dock/window topology library。

证据状态：`GITHUB_VERIFIED`。

---

## 2. `App.tsx`：App route shell，不是 Professional Window owner

Exact file：

```text
huabu/apps/web/src/App.tsx
```

核心职责：

- `RootLayout` 常驻于 router root；
- 承载 Electron `WindowChrome`；
- 承载 `NativeMenuBridge` 与 `GlobalModals`；
- 通过 `<Outlet />` 承载 route；
- canvas route 离开前等待 pending saves drain；
- `/canvas/:canvasId` lazy-load `CanvasPage`。

它的生命周期是：

```text
desktop/browser application
→ workspace guard
→ route
→ CanvasPage
```

它没有：

- professional region registry；
- float/dock topology；
- split tree；
- region position/size；
- region restore contract；
- occupied rect aggregation。

结论：

```text
App.RootLayout = APPLICATION_SHELL
≠ Professional Window Manager
```

---

## 3. `WindowChrome.tsx`：Electron 标题栏，不是 LCOS Work View chrome

Exact file：

```text
huabu/apps/web/src/components/Shell/WindowChrome.tsx
```

实际职责：

- Electron custom title bar；
- Windows caption controls 避让；
- macOS traffic-light gutter；
- application home / title / settings；
- OS fullscreen 状态；
- `-webkit-app-region: drag`。

这里的 Window 指整个 Electron native window，不是 V2 中可组合的 Professional Window。

结论：

```text
WindowChrome = DESKTOP_APP_CHROME
≠ Professional Window chrome
≠ Professional Window lifecycle owner
```

命名相似不能形成 owner 继承关系。

---

## 4. `CanvasPage.tsx`：当前组合入口

Exact file：

```text
huabu/apps/web/src/pages/CanvasPage/CanvasPage.tsx
```

当前组合：

```tsx
<MainLayout
  header={<CanvasHeader />}
  leftPanel={<CanvasLayerPanel />}
  rightPanel={<PreviewWorkspacePanel />}
>
  <CenterArea />
</MainLayout>
```

说明当前 canvas page 的 topology 在 `MainLayout` 中硬接为：

```text
Left Panel | Canvas Center | Right Preview Panel
```

`CanvasPage` 自己不保存可组合 professional region topology。

结论：

```text
CanvasPage = COMPOSITION CALLSITE
≠ canonical window owner
```

---

## 5. `MainLayout.tsx`：真实 fixed three-column mechanics

Exact file：

```text
huabu/apps/web/src/pages/CanvasPage/MainLayout.tsx
```

Exact symbol：

```text
MainLayout
resolveRightPanelVisible
```

### 5.1 已存在能力

```text
Left column collapse
Right column collapse
Left/right pointer resize
center minimum width constraint
right panel slide animation
preview fullscreen
canvas subtree unmount/rebuild during preview fullscreen
```

宽度和限制在组件内硬编码：

```text
LEFT_MIN_WIDTH_PX    = 200
RIGHT_MIN_WIDTH_PX   = 264
CENTER_MIN_WIDTH_PX  = 100
LEFT_DEFAULT_WIDTH   = 260
RIGHT_DEFAULT_WIDTH  = 420
LEFT_MAX_RATIO       = 0.3
```

当前 `leftWidthPx` / `rightWidthPx` 是 `MainLayout` local React state。

### 5.2 当前 topology

```text
fixed left slot
→ left resize handle
→ center Canvas
→ right resize handle
→ fixed right slot
```

这不是可扩展 split tree，也不是可浮动 region graph。

### 5.3 当前 fullscreen 行为

Preview fullscreen 时，`MainLayout` 会卸载 Canvas subtree；恢复时依赖 Canvas 自身 viewport persistence 恢复。

这证明 Huabu 已经认真处理 Canvas 生命周期和 viewport 连续性，但该 fullscreen 是固定 Preview/Canvas 二态，不等于 Professional Window 的 float/dock/immersive topology。

### 5.4 缺失能力

- 不支持任意 ProfessionalRegion；
- 不支持 float；
- 不支持 dock/undock；
- 不支持 move；
- 不支持 vertical split；
- 不支持 N 区域；
- 不输出 occupiedRects/safeRect；
- 不区分 Professional Window identity 与 body identity；
- 没有 project-scoped restore topology。

结论：

```text
MainLayout = VERIFIED_FIXED_HOST
KEEP selected resize/collapse motion mechanics
ADAPT/REPLACE fixed topology
DO NOT promote to canonical Professional Window owner as-is
```

---

## 6. `panelStore.ts`：固定栏 presentation preference

Exact file：

```text
huabu/apps/web/src/store/panelStore.ts
```

Exact symbol：

```text
usePanelStore
```

当前状态：

```text
isLeftCollapsed
isSearchOpen
isRightCollapsed
isPreviewFullscreen
rightPanelAnchorNodeId
```

持久化：

```text
zustand persist
storage key = huabu-panel
partialize = isRightCollapsed only
```

`isPreviewFullscreen` 明确是 transient presentation mode，不跨 reload；左栏 collapse 与 search 同样不持久化。

结论：

```text
panelStore
= fixed shell presentation preference
≠ region topology store
≠ project durable truth
```

Professional Window 后续不能直接把所有 topology 塞进此 store，更不能用 localStorage 保存 Project Graph、Run 或 canonical Worksite truth。

---

## 7. `PreviewWorkspace`：最值得复用，但仍不是统一 Window owner

Exact files：

```text
huabu/apps/web/src/store/previewWorkspace/model.ts
huabu/apps/web/src/store/previewWorkspace/store.ts
huabu/apps/web/src/store/previewWorkspace/persistence.ts
huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspace.tsx
huabu/apps/web/src/components/Panels/PreviewWorkspace/PreviewWorkspacePanel.tsx
huabu/apps/web/src/components/Panels/PreviewWorkspace/tabDnd.ts
```

### 7.1 真实 owner 切分

```text
model.ts
→ pure topology/reducer owner

store.ts
→ Zustand runtime wrapper + action surface

persistence.ts
→ per-Canvas localStorage layout persistence/migration

PreviewWorkspace.tsx
→ tabs/groups/splitter/DnD rendering

PreviewWorkspacePanel.tsx
→ fixed MainLayout right-panel adapter

tabDnd.ts
→ tab reorder/cross-group drop resolution
```

### 7.2 已存在 mechanics

`CanvasPreviewWorkspace` 已有：

```text
tabs: Record<tabId, PreviewTab>
groups: PreviewGroup[]
activeGroupId
splitRatio
activationSeq
```

关键规则：

- 同一 target 不重复开 tab；
- transient tab 是 group 内复用 inspection slot；
- Pin/Promote 后变成 permanent tab；
- `Open to Side` 把同一 tab 移到另一 group，而不是复制；
- 关闭一组最后一个 tab 后移除空 group；
- tab 可在组内排序或跨组移动；
- split ratio clamp 在 0.2～0.8；
- UI separator 支持 pointer 与 keyboard resize。

### 7.3 topology 上限

```text
MAX_PREVIEW_GROUPS = 2
groups laid out left-to-right
```

这是固定右栏内部最多两组的横向 split，不是任意多 Professional Window 的二维组合。

### 7.4 persistence

```text
key = huabu.previewWorkspace.<canvasId>
version = 1
MAX_PERSISTED_CANVASES = 50
```

源码明确：这里保存的是 local UI layout；内容不在这里。记录被淘汰只会丢 tab arrangement，不会丢业务内容。

这个边界符合“localStorage 只保存可丢失 UI 偏好”，但当前作用域是 per-Canvas preview layout，不是 Project-scoped multi-surface professional session。

### 7.5 可复用项

```text
KEEP / EXTRACT CANDIDATE
- one-target-one-tab identity rule
- transient inspection slot
- promote/pin semantics
- active group logic
- tab reorder
- cross-group move without duplication
- reducer purity
- topology validation/repair
- versioned disposable UI persistence
- scroll memory / settle hooks
```

### 7.6 不可直接冒充的能力

```text
MISSING
- Float
- Dock / Undock
- free Move
- vertical split
- N-region composition
- ProfessionalRegion type registry
- region body lifecycle contract
- occupiedRects aggregation
- ProjectSession scope
- cross-Surface continuity
```

结论：

```text
PreviewWorkspace
= VERIFIED_MECHANICS_DONOR
= LEGACY_CURRENT_PREVIEW_HOST
≠ Unified Professional Window Manager
```

---

## 8. `ExpandedNodePanel`：专业内容 body 的当前实例

Exact file：

```text
huabu/apps/web/src/components/Panels/ExpandedNodePanel/ExpandedNodePanel.tsx
```

它负责：

- node preview；
- header action slot；
- connected-node navigation；
- title editing；
- in-preview search；
- editable content body；
- embedded/non-embedded chrome 差异；
- close action。

它可以作为未来 ProfessionalRegion body integration 的重要 consumer，但它没有 window placement、float/dock topology 或 project session ownership。

结论：

```text
ExpandedNodePanel = CURRENT_PREVIEW_BODY
≠ Professional Window owner
```

---

## 9. Current data flow

```text
CanvasPage
→ MainLayout fixed rightPanel slot
→ PreviewWorkspacePanel
→ PreviewWorkspace
→ PreviewWorkspace Zustand store
→ pure CanvasPreviewWorkspace reducers
→ localStorage per-canvas layout
```

内容链与布局链保持分离：

```text
canonical Canvas/Node/Chat content
≠ PreviewWorkspace local UI layout
```

这是应保留的正确边界。

---

## 10. 对旧 C1-2 的重新评级输入

旧 C1-2 关于 Dockview / Protected Canvas 的方向不能直接判 `DONE`。

本轮支持：

```text
SUPPORTED_AS_DIRECTION
- 需要统一 Professional Window topology
- Canvas 必须是 protected stable body
- body 不应因 placement 无意义重建
- occupied rect 应成为公共 seam
- PreviewWorkspace 有可迁移的 tab/split mechanics
```

本轮不支持：

```text
NOT_YET_VERIFIED
- Dockview 已存在或已经接线
- current source 已有 ProfessionalWindow owner
- existing MainLayout 可原样扩成完整 manager
- exact dependency / adapter / persistence 已确定
- C1-2 已达到施工卡完成状态
```

建议 revalidation：

```text
C1-2 = SUPPORTED_WITH_CORRECTION / NEEDS_EXACT_DESIGN
```

最终评级仍需结合旧 C1-2 正文、T5 最终视觉输入、T1/T2 occupied rect consumer 和完整 realtime/session census 后确认。

---

## 11. 后续必须补的 exact-source 问题

### Professional Window

- project-scoped ProfessionalRegion identity 放在哪一层；
- body registry 是否复用 PreviewTarget/PreviewRenderer；
- PreviewWorkspace reducer 是抽取复用还是兼容包裹；
- Dockview 是否仍是最佳 donor，还是现有 reducer + thin topology 足够；
- topology persistence 是否只属可丢 UI state；
-跨 Surface 时哪些 region 保持、哪些关闭；
- occupiedRects/safeRect 如何供 T1/T2 消费；
- resize 如何显式阻断 Huabu camera compensation；
- fullscreen 与 immersive 是否统一或保持兼容。

### Acceptance baseline

```text
open / float / dock / resize / move / split / close / restore
→ Canvas camera transform unchanged
→ Canvas node positions unchanged
→ region body state retained
→ no duplicate canonical target
→ Surface switch policy deterministic
→ reload only restores approved disposable UI layout
→ reduced-motion path deterministic
```

---

## 12. Round 4 状态快照

```text
HUABU_WINDOW_SHELL_CENSUS
  App RootLayout              VERIFIED_APPLICATION_SHELL
  Electron WindowChrome       VERIFIED_NOT_PRO_WINDOW
  CanvasPage composition      VERIFIED
  MainLayout topology         VERIFIED_FIXED_THREE_COLUMN
  panelStore                  VERIFIED_FIXED_PANEL_STATE
  PreviewWorkspace model      VERIFIED_TWO_GROUP_SPLIT
  PreviewWorkspace persistence VERIFIED_LOCAL_UI_ONLY
  PreviewWorkspace DnD        VERIFIED
  ExpandedNodePanel           VERIFIED_PREVIEW_BODY
  Dockview dependency         ABSENT_AT_EXACT_SHA
  canonical Pro Window owner  NOT_FOUND

M1_PROFESSIONAL_WINDOW
  product semantics           CLOSED_BY_V2_PHASE_B
  existing complete owner     GAP
  reusable mechanics          FOUND
  final source plan           NOT_READY
  production patch            NOT_AUTHORIZED

NEXT
  M8 Archive repo-wide owner census
```
